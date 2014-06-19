package rdf;

import java.net.URLEncoder;

import authentication.web.HttpRequestManager;

public class RdfStoreManagerImpl implements RdfStoreManager {
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
    // TODO: replace with logging tool
    // System.out.println("[DEBUG] Rdf store manager for " + endpoint +
    // ": execute query " + sparqlQuery);
    String format = responseFormat == null ? URLEncoder.encode("application/sparql-results+json",
        encoding) : URLEncoder.encode(responseFormat, encoding);
    String urlParameters = "format=" + format + "&query="
        + URLEncoder.encode(sparqlQuery, encoding);
    return executePost(endpoint, urlParameters);
  }

  protected String executePost(String endpoint, String urlParameters) throws Exception {
    return HttpRequestManager.executePost(endpoint, urlParameters);
  }
}
