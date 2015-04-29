package eu.geoknow.generator.component;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.validation.Valid;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Literal;
import com.hp.hpl.jena.sparql.vocabulary.FOAF;
import com.hp.hpl.jena.vocabulary.DCTerms;
import com.hp.hpl.jena.vocabulary.RDF;
import com.hp.hpl.jena.vocabulary.RDFS;
import com.ontos.ldiw.vocabulary.LDIS;

import eu.geoknow.generator.component.beans.Component;
import eu.geoknow.generator.component.beans.Service;
import eu.geoknow.generator.component.beans.ServiceType;
import eu.geoknow.generator.configuration.APP_CONSTANTS;
import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.ResourceExistsException;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.exceptions.SPARQLEndpointException;
import eu.geoknow.generator.rdf.SecureRdfStoreManagerImpl;


public class ComponentManager {

  private static final Logger log = Logger.getLogger(ComponentManager.class);

  private static Collection<ServiceType> serviceTypes;

  private static FrameworkConfiguration config;
  private static SecureRdfStoreManagerImpl storeManager;

  public ComponentManager() throws IOException, InformationMissingException {
    config = FrameworkConfiguration.getInstance();
    storeManager = config.getAdminRdfStoreManager();
  }

  /**
   * Return a list of components and its services. For the moment this will provide all components
   * defined in the framework-components, but there is no distinguish between components that are
   * integrated in the workbench.
   * 
   * @return List<Component>
   * @throws SPARQLEndpointException
   * @throws IOException
   */
  public Collection<Component> getAllComponents() throws SPARQLEndpointException, IOException {

    SecureRdfStoreManagerImpl storeManager = config.getAdminRdfStoreManager();

    Map<String, Component> components = new HashMap<String, Component>();

    try {

      // get all components and the services list
      String query =
          "SELECT ?component ?label ?version ?homepage ?service ?sproperty ?sobject FROM <"
              + config.getComponentsGraph() + "> WHERE { ?component a <"
              + LDIS.StackComponent.getURI() + "> ; <" + RDFS.label.getURI() + "> ?label ; <"
              + DCTerms.hasVersion + "> ?version ; <" + FOAF.homepage.getURI() + "> ?homepage ; <"
              + LDIS.providesService + "> ?service . ?service ?sproperty ?sobject "
              + "} ORDER BY ?component";
      log.debug(query);

      String result = storeManager.execute(query, APP_CONSTANTS.SPARQL_JSON_RESPONSE_FORMAT);

      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(result);
      Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
      while (bindingsIter.hasNext()) {
        JsonNode bindingNode = bindingsIter.next();

        String curi = bindingNode.get("component").path("value").textValue();
        String suri = bindingNode.get("service").path("value").textValue();

        String property = bindingNode.get("sproperty").path("value").textValue();
        String object = bindingNode.get("sobject").path("value").textValue();

        log.debug(curi);
        log.debug(suri);
        if (!components.containsKey(curi)) {
          Component c = new Component();
          c.setUri(curi);
          c.setLabel(bindingNode.get("label").path("value").textValue());
          c.setVersion(bindingNode.get("version").path("value").textValue());
          c.setHomepage(bindingNode.get("homepage").path("value").textValue());
          Service s = new Service();
          s.setUri(suri);
          setServiceProperty(s, property, object);
          c.getServices().add(s);
          components.put(c.getUri(), c);
        } else {
          boolean found = false;
          for (Service si : components.get(curi).getServices()) {
            if (si.getUri().equals(suri)) {
              setServiceProperty(si, property, object);
              found = true;
              break;
            }
          }
          if (!found) {
            Service s = new Service();
            s.setUri(suri);
            setServiceProperty(s, property, object);
            components.get(curi).getServices().add(s);
          }
        }

      }

    } catch (Exception e) {

      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }

    return components.values();
  }

  /**
   * Get the component data
   * 
   * @param uri
   * @return Component or null if not found
   * @throws SPARQLEndpointException
   * @throws IOException
   * @throws ResourceNotFoundException
   */
  public Component getComponent(String uri) throws SPARQLEndpointException, IOException,
      ResourceNotFoundException {
    Component component = null;


    SecureRdfStoreManagerImpl storeManager = config.getAdminRdfStoreManager();

    try {

      // get all components and the services list
      String query =
          "SELECT ?label ?version ?homepage ?service ?sproperty ?sobject FROM <"
              + config.getComponentsGraph() + "> WHERE { <" + uri + "> a <"
              + LDIS.StackComponent.getURI() + "> ;   <" + RDFS.label.getURI() + "> ?label ; <"
              + DCTerms.hasVersion + "> ?version ; <" + FOAF.homepage.getURI() + "> ?homepage ; <"
              + LDIS.providesService + "> ?service . ?service ?sproperty ?sobject " + " }";

      log.debug(query);

      String result = storeManager.execute(query, APP_CONSTANTS.SPARQL_JSON_RESPONSE_FORMAT);

      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(result);
      Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
      while (bindingsIter.hasNext()) {
        JsonNode bindingNode = bindingsIter.next();

        String suri = bindingNode.get("service").path("value").textValue();

        String property = bindingNode.get("sproperty").path("value").textValue();
        String object = bindingNode.get("sobject").path("value").textValue();

        if (component == null) {
          component = new Component();
          component.setUri(uri);
          component.setLabel(bindingNode.get("label").path("value").textValue());
          component.setVersion(bindingNode.get("version").path("value").textValue());
          component.setHomepage(bindingNode.get("homepage").path("value").textValue());
          Service s = new Service();
          s.setUri(suri);
          setServiceProperty(s, property, object);
          component.getServices().add(s);

        } else {
          boolean found = false;
          for (Service si : component.getServices()) {
            if (si.getUri().equals(suri)) {
              setServiceProperty(si, property, object);
              found = true;
              break;
            }
          }
          if (!found) {
            Service s = new Service();
            s.setUri(suri);
            setServiceProperty(s, property, object);
            component.getServices().add(s);
          }
        }

      }

    } catch (Exception e) {

      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }

    if (component == null)
      throw new ResourceNotFoundException(uri + " not found");

    return component;
  }

  /**
   * Inserts a component with its services
   * 
   * @param component a valid instance of Component
   * @throws IOException
   * @throws SPARQLEndpointException
   * @throws ResourceExistsException
   */
  public Component addComponent(@Valid Component component) throws IOException,
      SPARQLEndpointException, ResourceExistsException {



    if (resourceExists(component.getUri(), config.getComponentsGraph(), storeManager))
      throw new ResourceExistsException(component.getLabel() + " already exists as "
          + component.getUri());

    String query =
        "INSERT DATA { GRAPH <" + config.getComponentsGraph() + "> { "
            + insertComponentStatements(component) + " }}";

    log.debug(query);

    String result;
    try {
      result = storeManager.execute(query, APP_CONSTANTS.SPARQL_JSON_RESPONSE_FORMAT);
    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }

    log.debug(result);

    return component;

  }

  /**
   * Update a component
   * 
   * @param component
   * @throws IOException
   * @throws SPARQLEndpointException
   * @throws ResourceNotFoundException
   */
  public Component updateComponent(Component component) throws IOException,
      SPARQLEndpointException, ResourceNotFoundException {

    if (!resourceExists(component.getUri(), config.getComponentsGraph(), storeManager))
      throw new ResourceNotFoundException(component.getUri() + " not found");

    try {
      String query =
          "WITH <" + config.getComponentsGraph() + "> DELETE  { <" + component.getUri()
              + "> ?s ?p ; <" + LDIS.providesService
              + "> ?service . ?service ?sproperty ?sobject  }  INSERT {"
              + insertComponentStatements(component) + "} WHERE { <" + component.getUri()
              + "> ?s ?p ; <" + LDIS.providesService
              + "> ?service . ?service ?sproperty ?sobject  }";

      log.debug(query);

      String result = storeManager.execute(query, APP_CONSTANTS.SPARQL_JSON_RESPONSE_FORMAT);

      log.debug(result);
      // TODO: validate the result and return the component object if successfull

      return component;
    } catch (Exception e) {

      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }

  }

  /**
   * Delete a component with the given uri
   * 
   * @param uri
   * @throws IOException
   * @throws SPARQLEndpointException
   */
  public void deleteComponent(String uri) throws IOException, SPARQLEndpointException {

    try {

      String query =
          "WITH <" + config.getComponentsGraph() + "> DELETE  { <" + uri + "> ?s ?p ; <"
              + LDIS.providesService + "> ?service . ?service ?sproperty ?sobject  } WHERE { <"
              + uri + "> ?s ?p ; <" + LDIS.providesService
              + "> ?service . ?service ?sproperty ?sobject  }";

      log.debug(query);

      String result = storeManager.execute(query, APP_CONSTANTS.SPARQL_JSON_RESPONSE_FORMAT);

      log.debug(result);
    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
  }

  /**
   * Checks if a uri exists in a given graph
   * 
   * @param uri
   * @param graph
   * @param storeManager
   * @return
   * @throws SPARQLEndpointException
   * 
   *         TODO: this may be moved to a RDF helpers Class
   */
  private boolean resourceExists(String uri, String graph, SecureRdfStoreManagerImpl storeManager)
      throws SPARQLEndpointException {

    String query = "WITH <" + graph + "> ASK { <" + uri + "> ?s ?p}";
    log.debug(query);
    try {
      String result = storeManager.execute(query, APP_CONSTANTS.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(result);
      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(result);
      return rootNode.path("boolean").booleanValue();

    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }

  }

  /**
   * Given the component instance, this function will generate all triples for an insert query
   * 
   * @param component
   * @return String containing the triples that can be used in a insert statement
   */
  private String insertComponentStatements(Component component) {
    // get all components and the services list
    String servicesStatements = "";
    log.debug(component.getServices().size());
    for (Service s : component.getServices()) {
      servicesStatements +=
          "<" + component.getUri() + "> <" + LDIS.providesService + ">  <" + s.getUri() + "> . <"
              + s.getUri() + "> a  <" + s.getType() + "> ; <" + DCTerms.description + "> \""
              + s.getDescription() + "\" ; <" + LDIS.serviceUrl.getURI() + "> <"
              + s.getServiceUrl() + "> .";
    }
    log.debug(servicesStatements);
    // get all components and the services list
    String statemets =
        " <" + component.getUri() + "> a <" + LDIS.StackComponent.getURI() + "> ;   <"
            + RDFS.label.getURI() + "> \"" + component.getLabel() + "\" ; <" + DCTerms.hasVersion
            + "> \"" + component.getVersion() + "\" ; <" + FOAF.homepage.getURI() + "> <"
            + component.getHomepage() + "> . " + servicesStatements + " ";

    return statemets;
  }

  /**
   * Retreives existing types of services in the ldi-schema ontology
   * 
   * @return Collection<ServiceType> collection with the existing services uris and labels
   * @throws IOException
   */

  public Collection<ServiceType> getServiceTypes() throws IOException {

    if (serviceTypes == null) {

      Map<String, ServiceType> services = new HashMap<String, ServiceType>();

      // read the ontology file and get the list
      String query =
          "SELECT ?uri ?label {?uri <" + RDFS.subClassOf.getURI() + "> <"
              + LDIS.ComponentService.getURI() + "> ; <" + RDFS.label.getURI() + "> ?label}";
      log.debug(query);

      QueryExecution qexec = QueryExecutionFactory.create(query, LDIS.getModel());
      ResultSet results = qexec.execSelect();
      while (results.hasNext()) {
        QuerySolution soln = results.next();
        String uri = soln.get("uri").asResource().getURI();

        Literal literal = soln.get("label").asLiteral();
        String language = literal.getLanguage();

        if (literal.getLanguage().equals(""))
          language = "default";

        ServiceType st = null;
        if (services.containsKey(uri))
          st = services.get(uri);
        else {
          st = new ServiceType();
          st.setUri(uri);
          services.put(uri, st);
        }
        st.getLabels().put(language, literal.getString());
      }
      serviceTypes = services.values();
    }
    return serviceTypes;
  }

  public static void setServiceProperty(Service s, String property, String object) {
    if (RDF.type.getURI().equals(property))
      s.setType(object);
    else if (LDIS.serviceUrl.getURI().equals(property))
      s.setServiceUrl(object);
  }

}
