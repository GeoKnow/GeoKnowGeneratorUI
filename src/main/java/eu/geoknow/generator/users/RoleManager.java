package eu.geoknow.generator.users;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hp.hpl.jena.vocabulary.RDFS;
import com.ontos.ldiw.vocabulary.LDIWO;

import eu.geoknow.generator.common.APP_CONSTANT;
import eu.geoknow.generator.common.Queries;
import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.exceptions.SPARQLEndpointException;
import eu.geoknow.generator.rdf.RdfStoreManager;

public class RoleManager {

  private static final Logger log = Logger.getLogger(RoleManager.class);

  private static FrameworkConfiguration config;
  private static RdfStoreManager storeManager;


  public RoleManager(RdfStoreManager storeManager) throws IOException, InformationMissingException {
    config = FrameworkConfiguration.getInstance();
    RoleManager.storeManager = storeManager;
  }

  public Collection<UserRole> getRoles() throws Exception {

    Map<String, UserRole> roles = new HashMap<String, UserRole>();

    String query =
        "SELECT ?s ?p ?o FROM <" + config.getAccountsGraph() + "> " + "WHERE {?s a <"
            + LDIWO.Role.getURI() + "> . ?s ?p ?o }";
    log.debug(query);
    String result = storeManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);

    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    while (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();
      String subject = bindingNode.path("s").path("value").textValue();
      String predicate = bindingNode.path("p").path("value").textValue();
      JsonNode object = bindingNode.path("o").path("value");

      if (roles.containsKey(subject)) {
        setProperties(roles.get(subject), predicate, object);
      } else {
        UserRole role = new UserRole();
        role.setUri(subject);
        setProperties(role, predicate, object);
        roles.put(subject, role);
      }
    }
    return roles.values();
  }

  public void setDefaultRole(String uri) throws SPARQLEndpointException, ResourceNotFoundException {
    setRoleType(uri, LDIWO.isDefault.getURI());
  }

  public void setNotLoggedInRole(String uri) throws SPARQLEndpointException,
      ResourceNotFoundException {
    setRoleType(uri, LDIWO.isNotLoggedIn.getURI());
  }

  private void setRoleType(String uri, String type) throws SPARQLEndpointException,
      ResourceNotFoundException {

    if (!Queries.resourceExists(uri, config.getAccountsGraph(), storeManager))
      throw new ResourceNotFoundException(uri + " not found");

    resetRoles(type);

    String query =
        " WITH <" + config.getAccountsGraph() + "> " + " DELETE { <" + uri + "> <" + type
            + "> ?o .} " + " INSERT { <" + uri + ">  <" + type + "> \"true\"^^xsd:boolean  .} "
            + " WHERE {  <" + uri + "> <" + type + "> ?o . } ";
    log.debug(query);
    try {
      String result = storeManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(result);
      // TODO: validate the result and return the component object if successful

    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }

  }

  private void resetRoles(String type) throws SPARQLEndpointException {
    String query =
        " WITH <" + config.getAccountsGraph() + "> " + " DELETE { ?role <" + type + "> ?o .} "
            + " INSERT {  ?role  <" + type + "> \"false\"^^xsd:boolean .} " + " WHERE {?role ?a <"
            + LDIWO.Role.getURI() + "> .  OPTIONAL{ ?role <" + type + "> ?o }. } ";
    log.debug(query);
    try {
      String result = storeManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(result);
      // TODO: validate the result and return the component object if successful

    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
  }

  public UserRole create(UserRole role) throws ResourceNotFoundException, SPARQLEndpointException {
    if (Queries.resourceExists(role.getUri(), config.getAccountsGraph(), storeManager))
      throw new ResourceNotFoundException(role.getUri() + " not found");

    String query =
        "INSERT DATA { GRAPH <" + config.getAccountsGraph() + "> { " + insertRoleStatements(role)
            + "} }";
    log.debug(query);
    try {
      String result = storeManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(result);
      // TODO: validate the result and return the component object if successful

    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
    return role;
  }

  public UserRole updateRole(UserRole role) throws SPARQLEndpointException,
      ResourceNotFoundException {

    if (!Queries.resourceExists(role.getUri(), config.getAccountsGraph(), storeManager))
      throw new ResourceNotFoundException(role.getUri() + " not found");

    String query =
        "WITH <" + config.getAccountsGraph() + ">  DELETE { <" + role.getUri() + "> ?p ?o .} "
            + " INSERT { " + insertRoleStatements(role) + "}  " + " WHERE {  <" + role.getUri()
            + "> ?p ?o }";
    log.debug(query);
    try {
      String result = storeManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(result);
      // TODO: validate the result and return the component object if successful

    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
    return role;
  }

  private String insertRoleStatements(UserRole role) {
    // get all components and the services list
    String servicesStatements = "";

    for (String r : role.getServices())
      servicesStatements +=
          "<" + role.getUri() + "> <" + LDIWO.isAllowedToUseService + ">  <" + r + "> .";

    // get all components and the services list
    String statemets =
        " <" + role.getUri() + "> a <" + LDIWO.Role.getURI() + "> ;   <" + RDFS.label.getURI()
            + "> \"" + role.getName() + "\" ^^ xsd:string ; <" + LDIWO.isDefault + "> \""
            + (role.isDefault() ? "true" : "false") + "\"^^xsd:boolean ; <" + LDIWO.isNotLoggedIn
            + "> \"" + (role.isNotLoggedIn() ? "true" : "false") + "\"^^xsd:boolean . "
            + servicesStatements + " ";

    return statemets;
  }

  private static void setProperties(UserRole role, String property, JsonNode value) {

    // TODO: I have a problem with boolean values, the result is giving me integer value
    if (property.equals(RDFS.label.getURI()))
      role.setName(value.asText());
    else if (property.equals(LDIWO.isDefault.getURI())) {
      role.setIsDefault(value.textValue().equals("1"));
      log.debug(property + " t:" + value.textValue() + " v:" + role.isDefault());
    } else if (property.equals(LDIWO.isNotLoggedIn.getURI())) {
      role.setIsNotLoggedIn(value.textValue().equals("1"));
      log.debug(property + " t:" + value.textValue() + " v:" + role.isNotLoggedIn());
    }

    else if (property.equals(LDIWO.isAllowedToUseService.getURI()))
      role.getServices().add(value.asText());
  }


}
