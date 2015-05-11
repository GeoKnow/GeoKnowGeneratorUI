package eu.geoknow.generator.common;

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
  public static boolean resourceExists(String uri, String graph, RdfStoreManager storeManager)
      throws SPARQLEndpointException {

    String query = "WITH <" + graph + "> ASK { <" + uri + "> ?s ?p}";
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
}
