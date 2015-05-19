package eu.geoknow.generator.datasources;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hp.hpl.jena.sparql.vocabulary.FOAF;
import com.hp.hpl.jena.vocabulary.RDFS;
import com.ontos.ldiw.vocabulary.LDIWO;
import com.ontos.ldiw.vocabulary.VOID;

import eu.geoknow.generator.common.APP_CONSTANT;
import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.datasources.beans.Endpoint;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.rdf.RdfStoreManager;

public class DatasoucesManager {

  private static final Logger log = Logger.getLogger(DatasoucesManager.class);
  private static FrameworkConfiguration config;
  private static RdfStoreManager storeManager;

  /**
   * Initialize the manager providing the corresponding manager of the user that will execute the
   * actions
   * 
   * @param storeManager
   * @throws IOException
   * @throws InformationMissingException
   */
  public DatasoucesManager(RdfStoreManager storeManager) throws IOException,
      InformationMissingException {
    config = FrameworkConfiguration.getInstance();
    DatasoucesManager.storeManager = storeManager;
  }

  public Collection<Endpoint> getAllEndpoints() throws IOException, Exception {

    Map<String, Endpoint> endpoints = new HashMap<String, Endpoint>();

    String query =
        "SELECT ?s ?p ?o FROM <" + config.getSettingsGraph() + "> WHERE { ?s a <"
            + LDIWO.SPARQLEndpoint.getURI() + "> ; ?p ?o } ";
    log.debug(query);

    String result = storeManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);

    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    while (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();

      String subject = bindingNode.get("s").path("value").textValue();
      String property = bindingNode.get("p").path("value").textValue();
      JsonNode object = bindingNode.get("o");

      if (!endpoints.containsKey(subject)) {
        Endpoint e = new Endpoint();
        e.setUri(subject);
        setEndpointProperty(e, property, object);
      } else
        setEndpointProperty(endpoints.get(subject), property, object);
    }

    return endpoints.values();

  }

  private void setEndpointProperty(Endpoint endpoint, String property, JsonNode object) {
    if (RDFS.label.getURI().equals(property))
      endpoint.setLabel(object.textValue());
    else if (FOAF.homepage.getURI().equals(property))
      endpoint.setHomepage(object.textValue());
    else if (VOID.sparqlEndpoint.getURI().equals(property))
      endpoint.setEndpoint(object.textValue());

  }

}
