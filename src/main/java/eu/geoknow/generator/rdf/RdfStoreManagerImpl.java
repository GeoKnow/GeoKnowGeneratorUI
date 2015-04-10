package eu.geoknow.generator.rdf;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

import eu.geoknow.generator.servlets.HttpRequestManager;


/**
 * Basic implementation of RdfStoreManager. Uses public HTTP SPARQL endpoint to execute queries.
 */
public class RdfStoreManagerImpl implements RdfStoreManager {
  protected static String encoding = "UTF-8";

  protected String endpoint;

  public RdfStoreManagerImpl(String endpoint) {
    this.endpoint = endpoint;
  }

  @Override
  public String createGraph(String graph) throws Exception {
    return execute("CREATE SILENT GRAPH <" + graph + ">", null);
  }

  @Override
  public String dropGraph(String graph) throws Exception {
    return execute("DROP SILENT GRAPH <" + graph + ">", null);
  }

  @Override
  public String execute(String sparqlQuery, String responseFormat) throws Exception {

    String urlParameters = buildUrlParameters(sparqlQuery, responseFormat);
    return executePost(endpoint, urlParameters);
  }

  protected String executePost(String endpoint, String urlParameters) throws Exception {
    String result = HttpRequestManager.executePost(endpoint, urlParameters);
    return result;
  }

  protected String buildUrlParameters(String sparqlQuery, String responseFormat)
      throws UnsupportedEncodingException {
    String format =
        responseFormat == null ? URLEncoder.encode("application/sparql-results+json", encoding)
            : URLEncoder.encode(responseFormat, encoding);
    String urlParameters =
        "format=" + format + "&query=" + URLEncoder.encode(sparqlQuery, encoding);
    return urlParameters;
  }
}
