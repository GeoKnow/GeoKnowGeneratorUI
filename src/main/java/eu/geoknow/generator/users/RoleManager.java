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

import eu.geoknow.generator.common.MediaType;
import eu.geoknow.generator.common.Queries;
import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.ResourceExistsException;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.exceptions.SPARQLEndpointException;
import eu.geoknow.generator.rdf.RdfStoreManager;

/**
 * A role manager to select/add/update/delete roles and define system required types of roles like
 * NotLoggedIn or Default role
 * 
 * @author alejandragarciarojas
 *
 */
public class RoleManager {

  private static final Logger log = Logger.getLogger(RoleManager.class);

  private static FrameworkConfiguration config;
  private static RdfStoreManager storeManager;


  public RoleManager(RdfStoreManager storeManager) throws IOException, InformationMissingException {
    config = FrameworkConfiguration.getInstance();
    RoleManager.storeManager = storeManager;
  }

  /**
   * Get All roles
   * 
   * @return Collection<UserRole>
   * @throws SPARQLEndpointException
   */
  public Collection<UserRole> getRoles() throws SPARQLEndpointException {

    Map<String, UserRole> roles = new HashMap<String, UserRole>();

    String query =
        "SELECT ?s ?p ?o FROM <" + config.getRolesGraph() + "> " + "WHERE {?s a <"
            + LDIWO.Role.getURI() + "> . ?s ?p ?o }";
    log.debug(query);

    try {

      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);
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
    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
    return roles.values();
  }

  /**
   * Get a role by its URI
   * 
   * @param uri
   * @return UserRole
   * @throws SPARQLEndpointException
   * @throws ResourceNotFoundException
   */
  public UserRole getRole(String uri) throws SPARQLEndpointException, ResourceNotFoundException {

    String query =
        " SELECT ?p ?o FROM  <" + config.getRolesGraph() + ">  WHERE {  <" + uri + ">  ?p ?o . }";

    UserRole role = new UserRole();
    role.setUri(uri);
    log.debug(query);
    try {
      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);
      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(result);
      Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
      if (!bindingsIter.hasNext())
        throw new ResourceNotFoundException("Role not found " + uri);
      while (bindingsIter.hasNext()) {
        JsonNode bindingNode = bindingsIter.next();
        String predicate = bindingNode.path("p").path("value").textValue();
        JsonNode object = bindingNode.path("o").path("value");
        setProperties(role, predicate, object);
      }
      return role;
    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
  }

  /**
   * Add a new Role
   * 
   * @param UserRole
   * @return UserRole
   * @throws ResourceNotFoundException
   * @throws SPARQLEndpointException
   */
  public UserRole create(UserRole role) throws ResourceExistsException, SPARQLEndpointException {

    if (Queries.resourceExists(role.getUri(), storeManager))
      throw new ResourceExistsException(role.getUri() + " aleready exists");

    String query =
        "INSERT DATA { GRAPH <" + config.getRolesGraph() + "> { " + insertRoleStatements(role)
            + "} }";
    log.debug(query);
    try {
      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(result);
      // TODO: validate the result and return the component object if successful

    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
    return role;
  }

  /**
   * Update data of a role
   * 
   * @param UserRole
   * @return UserRole
   * @throws SPARQLEndpointException
   * @throws ResourceNotFoundException
   */
  public UserRole updateRole(UserRole role) throws SPARQLEndpointException,
      ResourceNotFoundException {

    if (!Queries.resourceExists(role.getUri(), storeManager))
      throw new ResourceNotFoundException(role.getUri() + " not found");

    String query =
        "WITH <" + config.getRolesGraph() + ">  DELETE { <" + role.getUri() + "> ?p ?o .} "
            + " INSERT { " + insertRoleStatements(role) + "}  " + " WHERE {  <" + role.getUri()
            + "> ?p ?o }";
    log.debug(query);
    try {
      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(result);
      // TODO: validate the result and return the component object if successful

    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
    return role;
  }

  /**
   * Delete a role with the give URI
   * 
   * @param uri
   * @throws SPARQLEndpointException
   */
  public void deleteRole(String uri) throws SPARQLEndpointException {

    String query =
        "DELETE FROM <" + config.getRolesGraph() + ">  { <" + uri + "> ?p ?o .} " + " WHERE {  <"
            + uri + "> ?p ?o }";
    log.debug(query);
    try {
      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(result);
      // TODO: validate the result and return the component object if successful

    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }

  }

  /**
   * Get Default Role
   * 
   * @return UserRole
   * @throws SPARQLEndpointException
   * @throws ResourceNotFoundException
   */
  public UserRole getDefaultRole() throws SPARQLEndpointException, ResourceNotFoundException {
    return getRoleType(LDIWO.isDefault.getURI());
  }

  /**
   * Get NotLoggedInRole
   * 
   * @return UserRole
   * @throws SPARQLEndpointException
   * @throws ResourceNotFoundException
   */
  public UserRole getNotLoggedInRole() throws SPARQLEndpointException, ResourceNotFoundException {
    return getRoleType(LDIWO.isNotLoggedIn.getURI());
  }

  /**
   * Set Default role, which is used for newly registered users
   * 
   * @param uri
   * @throws SPARQLEndpointException
   * @throws ResourceNotFoundException
   */
  public void setDefaultRole(String uri) throws SPARQLEndpointException, ResourceNotFoundException {
    setRoleType(uri, LDIWO.isDefault.getURI());
  }

  /**
   * Set Not Logged In role, which is used in the application when no user is registered
   * 
   * @param uri
   * @throws SPARQLEndpointException
   * @throws ResourceNotFoundException
   */
  public void setNotLoggedInRole(String uri) throws SPARQLEndpointException,
      ResourceNotFoundException {
    setRoleType(uri, LDIWO.isNotLoggedIn.getURI());
  }

  private UserRole getRoleType(String type) throws SPARQLEndpointException,
      ResourceNotFoundException {

    String query =
        " SELECT ?s ?p ?o FROM  <" + config.getRolesGraph() + ">  WHERE { ?s a <"
            + LDIWO.Role.getURI() + "> . ?s ?p ?o .  ?s <" + type + "> true. }";

    UserRole role = new UserRole();
    log.debug(query);
    try {
      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);
      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(result);
      Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
      if (!bindingsIter.hasNext())
        throw new ResourceNotFoundException("No role defined as " + type);
      while (bindingsIter.hasNext()) {
        JsonNode bindingNode = bindingsIter.next();
        String subject = bindingNode.path("s").path("value").textValue();
        String predicate = bindingNode.path("p").path("value").textValue();
        JsonNode object = bindingNode.path("o").path("value");
        role.setUri(subject);
        setProperties(role, predicate, object);
      }
      return role;
    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
  }

  private void setRoleType(String uri, String type) throws SPARQLEndpointException,
      ResourceNotFoundException {

    if (!Queries.resourceExists(uri, storeManager))
      throw new ResourceNotFoundException(uri + " not found");

    resetRoles(type);

    String query =
        " WITH <" + config.getRolesGraph() + "> " + " DELETE { <" + uri + "> <" + type + "> ?o .} "
            + " INSERT { <" + uri + ">  <" + type + "> \"true\"^^xsd:boolean  .} " + " WHERE {  <"
            + uri + "> <" + type + "> ?o . } ";
    log.debug(query);
    try {
      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(result);
      // TODO: validate the result and return the component object if successful

    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }

  }

  private void resetRoles(String type) throws SPARQLEndpointException {
    String query =
        " WITH <" + config.getRolesGraph() + "> " + " DELETE { ?role <" + type + "> ?o .} "
            + " INSERT {  ?role  <" + type + "> \"false\"^^xsd:boolean .} " + " WHERE {?role ?a <"
            + LDIWO.Role.getURI() + "> .  OPTIONAL{ ?role <" + type + "> ?o }. } ";
    log.debug(query);
    try {
      String result = storeManager.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(result);
      // TODO: validate the result and return the component object if successful

    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }
  }

  private String insertRoleStatements(UserRole role) {
    // get all components and the services list§
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
    else if (property.equals(LDIWO.isDefault.getURI()))
      role.setIsDefault(value.textValue().equals("1"));
    else if (property.equals(LDIWO.isNotLoggedIn.getURI()))
      role.setIsNotLoggedIn(value.textValue().equals("1"));
    else if (property.equals(LDIWO.isAllowedToUseService.getURI()))
      role.getServices().add(value.asText());
  }


}
