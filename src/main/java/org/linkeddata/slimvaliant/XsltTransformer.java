package org.linkeddata.slimvaliant;

import org.apache.xerces.util.XMLCatalogResolver;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.XMLReaderFactory;
import org.apache.xml.resolver.tools.CatalogResolver;
import org.apache.xml.resolver.CatalogManager;

import javax.xml.transform.Transformer;
import javax.xml.transform.URIResolver;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.sax.SAXSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;

import org.linkeddata.slimvaliant.SlimValiantException;

public class XsltTransformer {

    private TransformerFactory transformerFactory = null;
    private Transformer transformer = null;
    private XMLReader xmlReader = null;

/*
    public XsltTransformer(StreamSource xslt) throws Exception {
        if (this.transformerFactory == null)
            this.transformerFactory = TransformerFactory.newInstance();
        try {
            this.transformer = this.transformerFactory.newTransformer(xslt);
        } catch (Exception e) {
            e.printStackTrace();
            throw new SlimValiantException("Failed to compile the stylesheet");
        }
        // this.catalogUrl;
        this.resolver = new XMLCatalogResolver(catalogUrl);
        try {
            this.xmlReader = XMLReaderFactory.createXMLReader();
            this.xmlReader.setEntityResolver(this.resolver);
        }
        catch (org.xml.sax.SAXException e) {
            e.printStackTrace();
            throw new SlimValiantException("Failed to create the XmlReader");
        }
    }
*/

    // The catalog file is handled via the CatalogManager 
    // it is assumed that the file is on a fixed location 
    // and called catalog.xml
    public XsltTransformer(StreamSource xslt) throws SlimValiantException {
        if (this.transformerFactory == null) {
            this.transformerFactory = TransformerFactory.newInstance();
        };
        CatalogManager manager = new CatalogManager("CatalogManager.properties");
        CatalogResolver uriResolver1  = new CatalogResolver(manager);
        transformerFactory.setURIResolver(uriResolver1);

        try {
            this.transformer = this.transformerFactory.newTransformer(xslt);

        } catch (Exception e) {
            e.printStackTrace();
            throw new SlimValiantException("Failed to compile the stylesheet:", e);
        }
        try {
            this.xmlReader = XMLReaderFactory.createXMLReader();
            this.xmlReader.setEntityResolver(uriResolver1);
        }
        catch (org.xml.sax.SAXException e) {
            e.printStackTrace();
            throw new SlimValiantException("Failed to create the XmlReader: ", e);
        }

    }

    public void close() {
        transformer = null;
        xmlReader = null;
    }

    public void transform(InputStream input, StreamResult output) throws SlimValiantException {
        if (this.transformer == null) throw new SlimValiantException("Xslt transformer is not initialized.");

        SAXSource inputSource = null;
        inputSource = new SAXSource(this.xmlReader, new InputSource(input));
        try {
            this.transformer.transform(inputSource, output);
        } catch (Exception e) {
            e.printStackTrace();
            throw new SlimValiantException("Transform Failed:", e);
        } finally {
            try {
            input.close();
            } catch (IOException e) {
                e.printStackTrace();
                throw new SlimValiantException("Closing Input Stream error: ", e);
            };
        }
    }
}
