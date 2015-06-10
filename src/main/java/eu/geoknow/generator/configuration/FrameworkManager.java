package eu.geoknow.generator.configuration;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ontos.ldiw.vocabulary.LDIS;

import eu.geoknow.generator.common.MediaType;
import eu.geoknow.generator.component.ComponentManager;
import eu.geoknow.generator.component.beans.Service;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.rdf.SecureRdfStoreManagerImpl;

/**
 * A manager class for the Framework
 * 
 * @author alejandragarciarojas
 *
 */
public class FrameworkManager {

  private static final Logger log = Logger.getLogger(FrameworkManager.class);

  private static FrameworkConfiguration config;
  private static SecureRdfStoreManagerImpl storeManager;

  public FrameworkManager() throws IOException, InformationMissingException {
    config = FrameworkConfiguration.getInstance();
    storeManager = config.getSystemRdfStoreManager();
  }

  /**
   * Get all services offered by the Workbench
   * 
   * @return Collection<Service>
   * @throws Exception
   */
  public Collection<Service> getFrameworkServices() throws Exception {

    Map<String, Service> services = new HashMap<String, Service>();
    String query =
        "SELECT ?service ?property ?object WHERE { <" + config.getFrameworkUri() + "> <"
            + LDIS.providesService + ">  ?service . ?service ?property ?object . }";
    String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);

    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    while (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();

      String service = bindingNode.get("service").path("value").textValue();
      String property = bindingNode.get("property").path("value").textValue();
      String object = bindingNode.get("object").path("value").textValue();

      if (!services.containsKey(service)) {
        Service s = new Service();
        s.setUri(service);
        ComponentManager.setServiceProperty(s, property, object);
        services.put(service, s);
      } else {
        ComponentManager.setServiceProperty(services.get(service), property, object);
      }
    }
    return services.values();
  }

  public Service getFrameworkService(String uri) throws Exception {

    Service service = new Service();
    service.setUri(uri);

    String query = "SELECT ?property ?object WHERE { <" + uri + "> ?property ?object . }";
    String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);

    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();

    if (!bindingsIter.hasNext())
      throw new ResourceNotFoundException("The service is not configured");

    while (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();
      String property = bindingNode.get("property").path("value").textValue();
      String object = bindingNode.get("object").path("value").textValue();
      ComponentManager.setServiceProperty(service, property, object);
    }
    return service;
  }

  /**
   * Get the list of integrated components
   * 
   * @return List<String> compoments uris
   * @throws Exception
   */
  public List<String> getIntegratedComponents() throws Exception {

    String query =
        "SELECT ?component FROM <" + config.getSettingsGraph() + "> WHERE { ?workbench <"
            + LDIS.integrates.getURI() + "> ?component }";

    String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);

    List<String> components = new ArrayList<String>();
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    while (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();

      components.add(bindingNode.get("component").path("value").textValue());
    }
    return components;
  }

  /**
   * Add a component to the workbench
   * 
   * @param uri
   * @throws Exception
   */
  public void setComponentsIntegration(String uri) throws Exception {
    String query =
        "INSERT DATA INTO <" + config.getSettingsGraph() + ">  { ?workbench <"
            + LDIS.integrates.getURI() + "> <" + uri + "> }";

    log.debug(query);
    String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);
    log.debug(result);

  }

  /**
   * remove a component from the workbench
   * 
   * @param uri
   * @throws Exception
   */
  public void removeComponentsIntegration(String uri) throws Exception {
    String query =
        "DELETE FROM <" + config.getSettingsGraph() + "> { ?workbench <" + LDIS.integrates.getURI()
            + "> ?component } WHERE { ?workbench <" + LDIS.integrates.getURI() + "> <" + uri
            + "> }";
    log.debug(query);
    String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);
    log.debug(result);

  }
}
