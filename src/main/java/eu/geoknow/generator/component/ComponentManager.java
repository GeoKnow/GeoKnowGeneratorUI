package eu.geoknow.generator.component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.validation.Valid;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Literal;
import com.hp.hpl.jena.sparql.vocabulary.FOAF;
import com.hp.hpl.jena.vocabulary.DC;
import com.hp.hpl.jena.vocabulary.DCTerms;
import com.hp.hpl.jena.vocabulary.RDF;
import com.hp.hpl.jena.vocabulary.RDFS;
import com.ontos.ldiw.vocabulary.LDIS;

import eu.geoknow.generator.common.MediaType;
import eu.geoknow.generator.common.Queries;
import eu.geoknow.generator.component.beans.Component;
import eu.geoknow.generator.component.beans.Service;
import eu.geoknow.generator.component.beans.ServiceType;
import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.ResourceExistsException;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.exceptions.SPARQLEndpointException;
import eu.geoknow.generator.rdf.RdfStoreManager;



public class ComponentManager {

  private static final Logger log = Logger.getLogger(ComponentManager.class);

  private static Collection<ServiceType> serviceTypes;

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
  public ComponentManager(RdfStoreManager storeManager) throws IOException,
      InformationMissingException {
    config = FrameworkConfiguration.getInstance();
    ComponentManager.storeManager = storeManager;
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

      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);

      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(result);
      Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
      while (bindingsIter.hasNext()) {
        JsonNode bindingNode = bindingsIter.next();

        String curi = bindingNode.get("component").path("value").textValue();
        String suri = bindingNode.get("service").path("value").textValue();

        String property = bindingNode.get("sproperty").path("value").textValue();
        String object = bindingNode.get("sobject").path("value").textValue();

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
   * @param id
   * @return Component or null if not found
   * @throws SPARQLEndpointException
   * @throws IOException
   * @throws ResourceNotFoundException
   */
  public Component getComponent(String id) throws SPARQLEndpointException, IOException,
      ResourceNotFoundException {
    Component component = null;
    String uri = config.getResourceNamespace() + id;
    log.debug(config.getResourceNamespace());
    try {

      // get all components and the services list
      String query =
          "SELECT ?label ?version ?homepage ?service ?sproperty ?sobject FROM <"
              + config.getComponentsGraph() + "> WHERE { <" + uri + "> a <"
              + LDIS.StackComponent.getURI() + "> ;   <" + RDFS.label.getURI() + "> ?label ; <"
              + DCTerms.hasVersion + "> ?version ; <" + FOAF.homepage.getURI() + "> ?homepage ; <"
              + LDIS.providesService + "> ?service . ?service ?sproperty ?sobject " + " }";

      log.debug(query);

      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);

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

    if (Queries.resourceExists(component.getUri(), storeManager))
      throw new ResourceExistsException(component.getLabel() + " already exists as "
          + component.getUri());

    String query =
        "INSERT DATA { GRAPH <" + config.getComponentsGraph() + "> { "
            + insertComponentStatements(component) + " }}";

    log.debug(query);

    String result;
    try {
      result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);
    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
    log.debug(result);
    return component;
  }

  /**
   * Inserts a service
   * 
   * @param component a valid instance of Component
   * @throws IOException
   * @throws SPARQLEndpointException
   * @throws ResourceExistsException
   * @throws ResourceNotFoundException
   */
  public Service addService(String uri, @Valid Service service) throws IOException,
      SPARQLEndpointException, ResourceExistsException, ResourceNotFoundException {

    // check that the component metadata exists
    if (!Queries.resourceExists(uri, storeManager))
      throw new ResourceNotFoundException(uri + " doesnt exist ");

    // check that the service doesn't exists
    if (Queries.resourceExists(service.getUri(), storeManager))
      throw new ResourceExistsException("Service " + service.getUri() + " already exist  as "
          + service.getLabel());

    String query =
        "INSERT DATA { GRAPH <" + config.getComponentsGraph() + "> { <" + uri + ">  <"
            + LDIS.providesService.getURI() + "> <" + service.getUri() + ">. "
            + insertServiceStatements(service) + " }}";

    log.debug(query);

    String result;
    try {
      result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);
    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
    log.debug(result);
    return service;
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

    // check that the component exists
    if (!Queries.resourceExists(component.getUri(), storeManager))
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

      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);

      log.debug(result);
      // TODO: validate the result and return the component object if successful

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

      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);

      log.debug(result);
    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
  }

  /**
   * Delete a service with the given uri
   * 
   * @param uri
   * @throws IOException
   * @throws SPARQLEndpointException
   */
  public void deleteService(String uri) throws IOException, SPARQLEndpointException {

    try {

      String query =
          "WITH <" + config.getComponentsGraph() + "> DELETE  { ?component  <"
              + LDIS.providesService + "> <" + uri + "> . <" + uri
              + "> ?sproperty ?sobject  } WHERE { < ?component  <" + LDIS.providesService + "> <"
              + uri + "> . <" + uri + "> ?sproperty ?sobject  }";

      log.debug(query);

      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);

      log.debug(result);
    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
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



  /**
   * Get all services from all components
   * 
   * @return Collection<Service> object
   * @throws SPARQLEndpointException
   * @throws IOException
   */
  public Collection<Service> getAllServices() throws SPARQLEndpointException, IOException {

    Map<String, Service> services = new HashMap<String, Service>();

    try {

      // get all components and the services list
      String query =
          "SELECT ?service ?sproperty ?sobject FROM <" + config.getComponentsGraph()
              + "> WHERE { ?component <" + LDIS.providesService
              + "> ?service.  ?service ?sproperty ?sobject " + "} ";
      log.debug(query);

      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);

      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(result);
      Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
      while (bindingsIter.hasNext()) {
        JsonNode bindingNode = bindingsIter.next();

        String subject = bindingNode.get("service").path("value").textValue();
        String property = bindingNode.get("sproperty").path("value").textValue();
        String object = bindingNode.get("sobject").path("value").textValue();

        if (!services.containsKey(subject)) {
          Service s = new Service();
          s.setUri(subject);
          setServiceProperty(s, property, object);
          services.put(subject, s);
        } else {
          Service s = services.get(subject);
          setServiceProperty(s, property, object);
        }
      }

    } catch (Exception e) {

      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }

    return services.values();
  }

  /**
   * Get the information of a service
   * 
   * @param uri
   * @return Service object
   * @throws SPARQLEndpointException
   * @throws IOException
   */
  public Service getService(String id) throws SPARQLEndpointException, IOException {
    String uri = config.getResourceNamespace() + id;
    Service service = new Service();
    service.setUri(uri);
    try {

      // get all components and the services list
      String query =
          "SELECT ?sproperty ?sobject FROM <" + config.getComponentsGraph() + "> WHERE { <" + uri
              + "> ?sproperty ?sobject " + "} ";
      log.debug(query);

      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);

      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(result);
      Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
      if (!bindingsIter.hasNext())
        throw new ResourceNotFoundException(uri + " not found in the store");
      while (bindingsIter.hasNext()) {
        JsonNode bindingNode = bindingsIter.next();
        String property = bindingNode.get("sproperty").path("value").textValue();
        String object = bindingNode.get("sobject").path("value").textValue();
        setServiceProperty(service, property, object);
      }
    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }

    return service;
  }

  /**
   * Update the data of a service
   * 
   * @param pservice
   * @return Service object
   * @throws SPARQLEndpointException
   * @throws IOException
   * @throws ResourceNotFoundException
   */
  public Service updateService(Service pservice) throws SPARQLEndpointException, IOException,
      ResourceNotFoundException {

    if (!Queries.resourceExists(pservice.getUri(), storeManager))
      throw new ResourceNotFoundException(pservice.getUri() + " not found");

    try {

      String query =
          "WITH <" + config.getComponentsGraph() + "> DELETE  { <" + pservice.getUri()
              + "> ?sproperty ?sobject  }  INSERT {" + insertServiceStatements(pservice)
              + "} WHERE { <" + pservice.getUri() + ">  ?sproperty ?sobject  }";
      log.debug(query);

      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(result);
      // TODO: validate the result and return the component object if successful

    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }

    return pservice;
  }

  /**
   * Assigns literal properties to the Service object
   * 
   * @param service
   * @param property as the URI of the porperty to set
   * @param value the value
   */
  public static void setServiceProperty(Service s, String property, String value) {
    if (RDF.type.getURI().equals(property))
      s.setType(value);
    else if (RDFS.label.getURI().equals(property))
      s.setLabel(value);
    else if (LDIS.serviceUrl.getURI().equals(property))
      s.setServiceUrl(value);
    else if (DC.description.getURI().equals(property))
      s.setDescription(value);
    else {
      s.getProperties().put(property, value);
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

    for (Service s : component.getServices()) {
      servicesStatements +=
          "<" + component.getUri() + "> <" + LDIS.providesService + ">  <" + s.getUri() + "> .";
      servicesStatements += insertServiceStatements(s);
    }

    // get all components and the services list
    String statemets =
        " <" + component.getUri() + "> a <" + LDIS.StackComponent.getURI() + "> ;   <"
            + RDFS.label.getURI() + "> \"" + component.getLabel() + "\" ^^ xsd:string ; <"
            + DCTerms.hasVersion + "> \"" + component.getVersion() + "\" ^^ xsd:string ; <"
            + FOAF.homepage.getURI() + "> <" + component.getHomepage() + "> . "
            + servicesStatements + " ";

    return statemets;
  }

  /**
   * Given the service instance, this function will generate all triples for an insert query
   * 
   * @param service
   * @return String containing the triples that can be used in a insert statement
   */
  private String insertServiceStatements(Service service) {

    List<String> properties = new ArrayList<String>();
    properties.add("<" + service.getUri() + "> a  <" + service.getType() + "> ; <"
        + RDFS.label.getURI() + "> \"" + service.getLabel() + "\" ^^ xsd:string ; <"
        + DCTerms.description + "> \"" + service.getDescription() + "\" ; <"
        + LDIS.serviceUrl.getURI() + "> <" + service.getServiceUrl() + "> ");

    for (String p : service.getProperties().keySet())
      properties.add("<" + p + "> \"" + service.getProperties().get(p) + "\" ^^ xsd:string ");

    String servicesStatements = StringUtils.join(properties, ";") + ".";

    log.debug(servicesStatements);

    return servicesStatements;
  }
}
