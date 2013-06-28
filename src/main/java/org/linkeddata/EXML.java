package org.linkeddata;

import java.io.*;
import java.io.File;
import java.io.InputStream;
import java.io.FileOutputStream;

import com.vaadin.ui.*;
import com.vaadin.ui.Label;
import com.vaadin.ui.Button.ClickEvent;

import org.openrdf.repository.RepositoryConnection;
import org.openrdf.rio.RDFFormat;
import org.openrdf.model.*;

import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.linkeddata.slimvaliant.*;

/**
 * extract RDF data from an XML file using an XSLT transformation
 */
public class EXML extends CustomComponent
implements 	Button.ClickListener
{
	// reference to the global internal state
    private GeoKnowDemoState state;

    private VerticalLayout panel;
    private ByteArrayOutputStream oStream;

    //
    //private Button annotateButton; 
    private Button transformButton;
    private Button uploadButton;
    private Label annotatedTextField;
    private Label errorMsg;

    private String textToAnnotate;
    private String annotatedText;

    private TextArea xmlText;
    private TextArea xsltText;
    private TextArea rdfResultField;

    private ExportSelector exportGraph;

    private Form t2f;

    public EXML(GeoKnowDemoState st) {
        this();
        state = st;

        // The internal state and

        panel = new VerticalLayout();

        Label desc = new Label(
                "This page aids the extraction of RDF out of an XML document.<br/>" + 
                "This is done by defining an XSLT transformation which transforms the XML document into a set of RDF triples.<br/>" +
                "The resulting triples are uploaded in the share RDF store.<br/>" +
                "This pages is the simplified flow where you paste your document and XSLT transformation and see the result immediately."
                , Label.CONTENT_XHTML);

        xmlText = new TextArea("Enter your xml code:");
        xmlText.setDebugId(this.getClass().getSimpleName()+"_xmlText");
        xmlText.setImmediate(false);
        xmlText.setColumns(100);
        xmlText.setRows(25);
        xmlText.setRequired(true);
        xsltText = new TextArea("Enter your xslt code:");
        xsltText.setDebugId(this.getClass().getSimpleName()+"_xsltText");
        xsltText.setImmediate(false);
        xsltText.setColumns(100);
        xsltText.setRows(25);
        xsltText.setRequired(true);
        exportGraph = new ExportSelector(st);
        exportGraph.setDebugId(this.getClass().getSimpleName()+"_exportGraph");

        uploadButton = new Button("Upload result to RDF Store", (Button.ClickListener) this);
        uploadButton.setDebugId(this.getClass().getSimpleName()+"_uploadButton");
        
        transformButton = new Button("transform XML to RDF", (Button.ClickListener) this);
        transformButton.setDebugId(this.getClass().getSimpleName()+"_transformButton");
        errorMsg = new Label("");

        panel.addComponent(desc);
        panel.addComponent(xmlText);
        panel.addComponent(xsltText);
        panel.addComponent(transformButton);
        panel.addComponent(exportGraph);
        panel.addComponent(uploadButton);
        panel.addComponent(errorMsg);

        errorMsg.setVisible(false);

        t2f = new Form();
        t2f.setDebugId(this.getClass().getSimpleName()+"_t2f");
        t2f.setCaption("");

        annotatedTextField = new Label("Extracted RDF", Label.CONTENT_XHTML);
        t2f.getLayout().addComponent(annotatedTextField);

        rdfResultField = new TextArea();
        rdfResultField.setDebugId(this.getClass().getSimpleName()+"_rdfResultField");
        rdfResultField.setImmediate(false);
        rdfResultField.setColumns(100);
        rdfResultField.setRows(25);
        t2f.getLayout().addComponent(rdfResultField);

        panel.addComponent(t2f);
        t2f.setVisible(false);


        // The composition root MUST be set
        setCompositionRoot(panel);

    }

    public EXML() {
		// TODO Auto-generated constructor stub
	}

	public void buttonClick(ClickEvent event) {
        try{
        if(event.getComponent()==transformButton){
            transform();
        }
        else if(event.getComponent()==uploadButton){
            uploadToVirtuoso();
        }
        } catch (GeoKnowException e) {
          showExceptionMessage(e);
        };
    }

    // propagate the information of one tab to another.
    public void setDefaults() {
    };

    private void transform() throws GeoKnowException {
        errorMsg.setVisible(false);
        InputStream xmlStream, xsltStream;
        oStream = new ByteArrayOutputStream();
        StreamResult sResult = new StreamResult(oStream);

        System.setProperty("javax.xml.transform.TransformerFactory", "org.apache.xalan.processor.TransformerFactoryImpl");
        System.setProperty("javax.xml.parsers.DocumentBuilderFactory" , "org.apache.xerces.jaxp.DocumentBuilderFactoryImpl");
        System.setProperty("javax.xml.parsers.SAXParserFactory","org.apache.xerces.jaxp.SAXParserFactoryImpl");

        if(xmlText.getValue().toString().isEmpty()){
            errorMsg.setVisible(true);
            errorMsg.setValue("Enter a xml text first.");
            return;
        }
        else if(xsltText.getValue().toString().isEmpty()){
            errorMsg.setVisible(true);
            errorMsg.setValue("Enter a xslt code.");
            return;
        }
        try{
            xmlStream = new ByteArrayInputStream(xmlText.getValue().toString().getBytes("UTF-8"));
            xsltStream = new ByteArrayInputStream(xsltText.getValue().toString().getBytes("UTF-8"));	

            XsltTransformer xsltTransformer = new XsltTransformer(new StreamSource(xsltStream));
            xsltTransformer.transform(xmlStream, sResult);
        } catch (Exception e){
            e.printStackTrace();
            throw new GeoKnowException("Transformation failed", e);
        }
        if(oStream.toString().isEmpty()){
            rdfResultField.setValue("Transformation results in no triples; please check if you entered a valid xml and xslt code.");
        } else {
            rdfResultField.setValue(oStream.toString());
            t2f.setVisible(true);
        };
    }

    private void uploadToVirtuoso() throws GeoKnowException {
        if(exportGraph.getExportGraph() == null){
            panel.addComponent(new Label("No graph selected"));
            return;
        }
        else if(oStream == null || oStream.toString().isEmpty()){
            transform();
            if(oStream.toString().isEmpty()){return;}
        }
        try{
            File rdfFile = new File ("/tmp/uploads/file.rdf");
            FileOutputStream fos = new FileOutputStream(rdfFile);
            oStream.writeTo(fos);
            String baseURI = state.getCurrentGraph() + "#";

            RepositoryConnection con = state.getRdfStore().getConnection();
            Resource contextURI = con.getValueFactory().createURI(exportGraph.getExportGraph());
            Resource[] contexts = new Resource[] {contextURI};
            con.add(rdfFile, baseURI, RDFFormat.RDFXML, contexts);
        } catch (Exception e){
            e.printStackTrace();
            throw new GeoKnowException("Upload Failed: ", e);
        }
        panel.addComponent(new Label("Upload succeeded!"));
    }

    private void showExceptionMessage(Exception e) {
    	
    			Notification.show(
                    "The operation failed due some errors. See for detailed information to the catalina log. ",
                    e.getMessage(),
                    Notification.TYPE_ERROR_MESSAGE);
    };
};

