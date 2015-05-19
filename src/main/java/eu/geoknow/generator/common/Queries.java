package eu.geoknow.generator.common;

import java.io.IOException;

import org.apache.http.client.ClientProtocolException;
import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import eu.geoknow.generator.exceptions.SPARQLEndpointException;
import eu.geoknow.generator.rdf.RdfStoreManager;

public class Queries {

  private static final Logger log = Logger.getLogger(Queries.class);

  /**
   * Checks if a uri exists in a given graph
   * 
   * @param uri
   * @param graph
   * @param storeManager
   * @return
   * @throws SPARQLEndpointException
   * 
   */
  public static boolean resourceExists(String uri, RdfStoreManager storeManager)
      throws SPARQLEndpointException {

    String query = "ASK { <" + uri + "> ?s ?p}";

    log.debug(query);
    try {
      String result = storeManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(result);
      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(result);
      boolean res = rootNode.path("boolean").booleanValue();
      log.debug(res);
      return res;

    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
  }

  public static int countGraphTriples(String graph, RdfStoreManager storeManager)
      throws SPARQLEndpointException {

    String query = "SELECT (COUNT(*) AS ?triples) FROM <" + graph + "> {?s ?p ?o}";
    try {
      String result = storeManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(result);
      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(result);
      return rootNode.path("results").path("bindings").elements().next().get("triples")
          .path("value").asInt();

    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
  }

  /**
   * Checks in the triple store if a graph exists. ATTENTION: If the graph exists but not triples
   * are in, the query returns false!
   * 
   * @param graphUri graph URI to check
   * @return true if it exists, false otherwise
   * @throws ClientProtocolException
   * @throws IOException
   */
  public static boolean graphExists(String graphUri, RdfStoreManager storeManager)
      throws ClientProtocolException, IOException {
    // ASK doesnt really work
    // ASK { GRAPH <http://test.de/graph3> { $s $p $o . } }
    String query = "ASK { GRAPH <" + graphUri + "> { ?s ?p ?o . } }";
    String response = "false";
    try {
      response = storeManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(response);
    // if exists, delete
    return rootNode.path("boolean").booleanValue();
  }

}
