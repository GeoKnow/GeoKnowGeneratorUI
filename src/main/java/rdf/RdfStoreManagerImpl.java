package rdf;

import java.net.URLEncoder;

import org.apache.log4j.Logger;

import authentication.web.HttpRequestManager;

public class RdfStoreManagerImpl implements RdfStoreManager {

    private static final Logger log = Logger.getLogger(RdfStoreManagerImpl.class);

    protected static String encoding = "UTF-8";

    protected String endpoint;

    public RdfStoreManagerImpl(String endpoint) {
        this.endpoint = endpoint;
    }

    @Override
    public void createGraph(String graph) throws Exception {
        execute("CREATE SILENT GRAPH <" + graph + ">", null);
    }

    @Override
    public void dropGraph(String graph) throws Exception {
        execute("DROP SILENT GRAPH <" + graph + ">", null);
    }

    @Override
    public String execute(String sparqlQuery, String responseFormat) throws Exception {
        log.debug("Rdf store manager for " + endpoint + ": execute query " + sparqlQuery);

        String format = responseFormat == null ? URLEncoder.encode(
                "application/sparql-results+json", encoding) : URLEncoder.encode(responseFormat,
                encoding);
        String urlParameters = "format=" + format + "&query="
                + URLEncoder.encode(sparqlQuery, encoding);
        String response = executePost(endpoint, urlParameters);

        log.debug(response);
        return response;
    }

    protected String executePost(String endpoint, String urlParameters) throws Exception {
        return HttpRequestManager.executePost(endpoint, urlParameters);
    }
}
