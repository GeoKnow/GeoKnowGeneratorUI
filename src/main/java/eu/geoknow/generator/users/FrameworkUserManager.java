package eu.geoknow.generator.users;

import java.io.IOException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.Iterator;

import javax.ws.rs.core.Cookie;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.util.ISO8601Utils;
import com.google.gson.Gson;
import com.ontos.ldiw.vocabulary.LDIWO;

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.rdf.RdfStoreManager;


/**
 * This class implements UserManager for Workbench. Users' accounts are stored in special Workbench
 * accounts graph specified in configuration. This class uses underlying RDF store UserManager to
 * manage RDF graph access and RDF users creation.
 */
public class FrameworkUserManager implements UserManager {
  private static final Logger log = Logger.getLogger(FrameworkUserManager.class);

  private static final String jsonResponseFormat = "application/sparql-results+json";

  private String prefixes = null;

  // underlying RDF store UserManager
  private UserManager rdfStoreUserManager;

  // RDF store manager executes SPARQL requests (save account info, create
  // settings graph, etc.)
  private RdfStoreManager rdfStoreManager;

  private FrameworkConfiguration frameworkConfig;

  public FrameworkUserManager(UserManager rdfStoreUserManager, RdfStoreManager rdfStoreManager,
      FrameworkConfiguration frameworkConfig) {
    this.rdfStoreUserManager = rdfStoreUserManager;
    this.rdfStoreManager = rdfStoreManager;
    this.frameworkConfig = frameworkConfig;
  }

  /**
   * Creates new user account. This method creates new user account in Workbench and also creates
   * RDF store user with the same name and password. It throws Exception if Workbench or RDF store
   * user with specified name already exists. This method also creates settings graph for newly
   * created user. Only this user and Workbench system admin has permissions for this graph.
   * Workbench user profile is stored in special Workbench accounts graph in RDF store.
   *
   * @param name User name
   * @param password User password
   * @param email User e-mail
   * @throws Exception
   */
  public void createUser(String name, String password, String email) throws Exception {
    if (name == null || name.isEmpty())
      throw new IllegalArgumentException("name cannon be null or empty");
    if (password == null || password.isEmpty())
      throw new IllegalArgumentException("password  cannon be null or empty");
    if (email == null || email.isEmpty())
      throw new IllegalArgumentException("email cannon be null or empty");

    if (checkUserExists(name, email))
      throw new Exception("User already exists");

    // create RDF store user with the same name and password
    rdfStoreUserManager.createUser(name, password);
    // create setting graph for user
    String userSettingsGraphURI =
        frameworkConfig.getResourceNamespace() + URLEncoder.encode(name, "UTF-8")
            + "/settingsGraph";
    // grant write permissions to framework - otherwise framework fails to
    // create graph
    rdfStoreUserManager.setRdfGraphPermissions(frameworkConfig.getWorkbenchSystemAdmin(),
        userSettingsGraphURI, GraphPermissions.WRITE);
    rdfStoreManager.createGraph(userSettingsGraphURI);
    // grant write permissions to user
    rdfStoreUserManager.setRdfGraphPermissions(name, userSettingsGraphURI, GraphPermissions.WRITE);

    // copy data from initial settings graph
    /*
     * String query = "INSERT { GRAPH <" + userSettingsGraphURI + "> {?s ?p ?o} } " +
     * "WHERE {GRAPH <" + frameworkConfig.getInitialSettingsGraph() + "> {?s ?p ?o} }"; try {
     * rdfStoreManager.execute(query, jsonResponseFormat); } catch (IOException e) { // failed to
     * write user graph // rollback actions: rdfStoreUserManager.dropUser(name); throw e; }
     */
    // get default role uri
    RoleManager roles = new RoleManager(rdfStoreManager);
    // String role = getDefaultRoleURI();
    String role = roles.getDefaultRole().getUri();

    // write user account to accounts graph
    String query =
        getPrefixes() + "\n" + "INSERT DATA { GRAPH <" + frameworkConfig.getAccountsGraph()
            + "> {\n" + " :" + name + " rdf:type gkg:Account .\n" + " :" + name
            + " foaf:accountName \"" + name + "\" .\n" + " :" + name + " gkg:passwordSha1Hash \""
            + DigestUtils.sha1Hex(password) + "\" .\n" + " :" + name + " gkg:settingsGraph \""
            + userSettingsGraphURI + "\"^^xsd:anyURI .\n" + " :" + name + " foaf:mbox <mailto:"
            + email + "> .\n" + " :" + name + " dcterms:created \""
            + ISO8601Utils.format(new Date()) + "\"^^xsd:dateTime .\n" + " :" + name
            + " gkg:role <" + role + "> .\n" + "} }";

    try {
      rdfStoreManager.execute(query, jsonResponseFormat);
    } catch (IOException e) { // failed to register user in to the accounts
                              // graph
                              // rollback actions:
      rdfStoreUserManager.dropUser(name);
      rdfStoreManager.dropGraph(userSettingsGraphURI);
      throw e;
    }
  }

  @Override
  public void createUser(String name, String password) throws Exception {
    throw new UnsupportedOperationException(
        "Unsupported operation createUser(name, password). Use createUser(name, password, email");
  }

  @Override
  public void dropUser(String name) throws Exception {
    if (name == null || name.isEmpty())
      throw new IllegalArgumentException("name cannot be null or empty");

    // drop rdf store user
    rdfStoreUserManager.dropUser(name);

    String userSettingsGraph = getSettingsGraph(name);

    // remove account triples
    String query =
        getPrefixes() + "\n" + "DELETE WHERE { GRAPH <" + frameworkConfig.getAccountsGraph()
            + "> { ?s ?p ?o . ?s foaf:accountName \"" + name + "\" . } }";
    rdfStoreManager.execute(query, jsonResponseFormat);

    // delete user settings graph
    rdfStoreManager.dropGraph(userSettingsGraph);
  }

  @Override
  public void setDefaultRdfPermissions(String user, GraphPermissions permissions) throws Exception {
    rdfStoreUserManager.setDefaultRdfPermissions(user, permissions);
  }

  @Override
  public void setPublicRdfPermissions(GraphPermissions permissions) throws Exception {
    rdfStoreUserManager.setPublicRdfPermissions(permissions);
  }

  @Override
  public void setRdfGraphPermissions(String user, String graph, GraphPermissions permissions)
      throws Exception {
    String settingsGraph = getDescribedIn(graph);
    if (settingsGraph == null)
      throw new Exception("Graph " + graph + " description was not found");

    UserProfile userProfile = getUserProfile(user);
    if (userProfile == null)
      throw new Exception("User " + user + " was not found");

    // remove old access triples
    String query =
        getPrefixes() + "\n" + " DELETE {GRAPH <" + settingsGraph + "> {?s ?p ?o}} " + " WHERE { "
            + " {GRAPH <" + settingsGraph + "> {<" + graph + "> gkg:access ?s . ?s acl:agent <"
            + userProfile.getAccountURI() + "> . ?s ?p ?o . } } " + " UNION " + " {GRAPH <"
            + settingsGraph + "> {?s gkg:access ?ao . ?ao acl:agent <"
            + userProfile.getAccountURI() + "> . ?s ?p ?o . FILTER (?s = <" + graph
            + "> && ?p = gkg:access) } } " + "}";
    rdfStoreManager.execute(query, jsonResponseFormat);

    // add new public access triples
    switch (permissions) {
      case NO: // no access
        break;
      case READ:
        query =
            getPrefixes() + "\n" + "INSERT DATA {GRAPH <" + settingsGraph + "> { " + " <" + graph
                + "> gkg:access _:b1. " + " _:b1 acl:agent <" + userProfile.getAccountURI()
                + "> . " + " _:b1 acl:mode acl:Read . " + "}}";
        rdfStoreManager.execute(query, jsonResponseFormat);
        break;
      case WRITE:
        query =
            getPrefixes() + "\n" + "INSERT DATA {GRAPH <" + settingsGraph + "> { " + " <" + graph
                + "> gkg:access _:b1. " + " _:b1 acl:agent <" + userProfile.getAccountURI()
                + "> . " + " _:b1 acl:mode acl:Write . " + "} }";
        rdfStoreManager.execute(query, jsonResponseFormat);
        break;
    }

    // set rdf store permissions
    log.info("Set graph permissions " + permissions + " for graph " + graph + ", user " + user);
    rdfStoreUserManager.setRdfGraphPermissions(user, graph, permissions);
  }

  @Override
  public void deleteRdfGraphPermissions(String user, String graph) throws Exception {
    String settingsGraph = getDescribedIn(graph);
    if (settingsGraph == null)
      throw new Exception("Graph " + graph + " description was not found");

    UserProfile userProfile = getUserProfile(user);
    if (userProfile == null)
      throw new Exception("User " + user + " was not found");

    // remove old access triples
    String query =
        getPrefixes() + "\n" + " DELETE {GRAPH <" + settingsGraph + "> {?s ?p ?o} } " + " WHERE { "
            + " {GRAPH <" + settingsGraph + "> {<" + graph + "> gkg:access ?s . ?s acl:agent <"
            + userProfile.getAccountURI() + "> . ?s ?p ?o . } } " + " UNION " + " {GRAPH <"
            + settingsGraph + "> {?s gkg:access ?ao . ?ao acl:agent <"
            + userProfile.getAccountURI() + "> . ?s ?p ?o . FILTER (?s = <" + graph
            + "> && ?p = gkg:access) } } " + "}";
    rdfStoreManager.execute(query, jsonResponseFormat);

    // remove rdf store permissions
    log.info("Remove graph permissions for graph " + graph + ", user " + user);
    rdfStoreUserManager.deleteRdfGraphPermissions(user, graph);
  }

  @Override
  public void setDefaultGraphPermissions(String graph, GraphPermissions permissions)
      throws Exception {
    String settingsGraph = getDescribedIn(graph);
    if (settingsGraph == null)
      throw new Exception("Graph " + graph + " description was not found");

    // remove old public access triples
    String query =
        getPrefixes() + "\n" + " DELETE {GRAPH <" + settingsGraph + "> {?s ?p ?o} } " + " WHERE { "
            + " {GRAPH <" + settingsGraph + "> {<" + graph
            + "> gkg:access ?s . ?s acl:agentClass foaf:Agent . ?s ?p ?o . } } " + " UNION "
            + " {GRAPH <" + settingsGraph
            + "> {?s gkg:access ?ao . ?ao acl:agentClass foaf:Agent . ?s ?p ?o . FILTER (?s = <"
            + graph + "> && ?p = gkg:access) } } " + "}";
    rdfStoreManager.execute(query, jsonResponseFormat);

    // add new public access triples
    switch (permissions) {
      case NO: // no public access
        break;
      case READ: // public read
        query =
            getPrefixes() + "\n" + "INSERT DATA {GRAPH <" + settingsGraph + "> { " + " <" + graph
                + "> gkg:access _:b1. " + " _:b1 acl:agentClass foaf:Agent . "
                + " _:b1 acl:mode acl:Read . " + "}}";
        rdfStoreManager.execute(query, jsonResponseFormat);
        break;
      case WRITE: // public write
        query =
            getPrefixes() + "\n" + "INSERT DATA {GRAPH <" + settingsGraph + "> { " + " <" + graph
                + "> gkg:access _:b1. " + " _:b1 acl:agentClass foaf:Agent . "
                + " _:b1 acl:mode acl:Write . " + "}}";
        rdfStoreManager.execute(query, jsonResponseFormat);
        break;
    }

    // set permissions in rdf store
    rdfStoreUserManager.setDefaultGraphPermissions(graph, permissions);
  }

  @Override
  public void changePassword(String username, String oldPassword, String newPassword)
      throws Exception {
    if (username == null || username.isEmpty())
      throw new IllegalArgumentException("username cannot be null or empty");
    if (oldPassword == null || oldPassword.isEmpty())
      throw new IllegalArgumentException("oldPassword cannot be null or empty");
    if (newPassword == null || newPassword.isEmpty())
      throw new IllegalArgumentException("newPassword cannon be null or empty");

    if (!checkPassword(username, oldPassword))
      throw new Exception("Invalid old password");

    // OntoQuad doesn't support DELETE {...} INSERT {...} WHERE {...}, so
    // use 2 queries
    String deleteQuery =
        getPrefixes() + "\n" + " DELETE {GRAPH <" + frameworkConfig.getAccountsGraph()
            + "> {?account gkg:passwordSha1Hash ?o} } " + " WHERE {GRAPH <"
            + frameworkConfig.getAccountsGraph() + "> {?account foaf:accountName \"" + username
            + "\" . ?account gkg:passwordSha1Hash ?o . } }";
    String insertQuery =
        getPrefixes() + "\n" + " INSERT {GRAPH <" + frameworkConfig.getAccountsGraph()
            + "> {?account gkg:passwordSha1Hash \"" + DigestUtils.sha1Hex(newPassword) + "\"} } "
            + " WHERE {GRAPH <" + frameworkConfig.getAccountsGraph()
            + "> {?account foaf:accountName \"" + username + "\" .  } }";
    // TODO: replace 2 queries with this query when OntoQuad will support
    // DELETE {...} INSERT {...} WHERE {...} queries
    // String query = getPrefixes() + "\n" + "WITH <" +
    // frameworkConfig.getAccountsGraph() + "> "
    // + " DELETE {?account gkg:passwordSha1Hash ?o} "
    // + " INSERT {?account gkg:passwordSha1Hash \"" +
    // DigestUtils.sha1Hex(newPassword) + "\"} "
    // + " WHERE {?account foaf:accountName \"" + username
    // + "\" . ?account gkg:passwordSha1Hash ?o . }";
    rdfStoreManager.execute(deleteQuery, jsonResponseFormat);
    rdfStoreManager.execute(insertQuery, jsonResponseFormat);

    // change underlying RDF store user password
    rdfStoreUserManager.changePassword(username, oldPassword, newPassword);

    // save new password in password store
    PasswordStore.put(username, newPassword);
  }

  @Override
  public void setPassword(String usernameOrEmail, String password) throws Exception {
    if (usernameOrEmail == null || usernameOrEmail.isEmpty())
      throw new IllegalArgumentException("username cannot be null or empty");
    if (password == null || password.isEmpty())
      throw new IllegalArgumentException("password cannot be null or empty");

    // OntoQuad doesn't support DELETE {...} INSERT {...} WHERE {...}, so
    // use 2 queries
    String deleteQuery =
        getPrefixes() + "\n" + " DELETE {GRAPH <" + frameworkConfig.getAccountsGraph()
            + "> {?account gkg:passwordSha1Hash ?o} } " + " WHERE { " + " {GRAPH <"
            + frameworkConfig.getAccountsGraph() + "> {?account foaf:accountName \""
            + usernameOrEmail + "\" . OPTIONAL { ?account gkg:passwordSha1Hash ?o . } } } "
            + " UNION " + " {GRAPH <" + frameworkConfig.getAccountsGraph()
            + "> { ?account foaf:mbox <mailto:" + usernameOrEmail
            + "> . OPTIONAL { ?account gkg:passwordSha1Hash ?o . } } } " + " }";
    String insertQuery =
        getPrefixes() + "\n" + " INSERT {GRAPH <" + frameworkConfig.getAccountsGraph()
            + "> {?account gkg:passwordSha1Hash \"" + DigestUtils.sha1Hex(password) + "\"} } "
            + " WHERE { " + " {GRAPH <" + frameworkConfig.getAccountsGraph()
            + "> {?account foaf:accountName \"" + usernameOrEmail
            + "\" . OPTIONAL { ?account gkg:passwordSha1Hash ?o . } } } " + " UNION { "
            + " GRAPH <" + frameworkConfig.getAccountsGraph() + "> { ?account foaf:mbox <mailto:"
            + usernameOrEmail + "> . OPTIONAL { ?account gkg:passwordSha1Hash ?o . } } } " + " }";
    // TODO: replace 2 queries with this query when OntoQuad will support
    // DELETE {...} INSERT {...} WHERE {...} queries
    // String query = getPrefixes() + "\n" + "WITH <" +
    // frameworkConfig.getAccountsGraph() + "> "
    // + " DELETE {?account gkg:passwordSha1Hash ?o} "
    // + " INSERT {?account gkg:passwordSha1Hash \"" +
    // DigestUtils.sha1Hex(password) + "\"} "
    // + " WHERE { " + " {?account foaf:accountName \"" + usernameOrEmail
    // + "\" . OPTIONAL { ?account gkg:passwordSha1Hash ?o . } } " +
    // " UNION "
    // + " { ?account foaf:mbox <mailto:" + usernameOrEmail
    // + "> . OPTIONAL { ?account gkg:passwordSha1Hash ?o . } } " + " }";
    log.debug(deleteQuery);
    log.debug(insertQuery);
    rdfStoreManager.execute(deleteQuery, jsonResponseFormat);
    rdfStoreManager.execute(insertQuery, jsonResponseFormat);

    // set password for underlying RDF store user
    rdfStoreUserManager.setPassword(getUsername(usernameOrEmail), password);
  }

  /**
   * Checks password for given user.
   * 
   * @param usernameOrEmail Workbench user name or e-mail
   * @param password Password to check
   * @return true, if given credentials are correct, false, otherwise
   * @throws Exception
   */
  public boolean checkPassword(String usernameOrEmail, String password) throws Exception {
    String query =
        getPrefixes() + "\n" + "SELECT DISTINCT ?passwordHash FROM <"
            + frameworkConfig.getAccountsGraph() + "> " + "WHERE {"
            + " {?account foaf:accountName \"" + usernameOrEmail
            + "\" . ?account gkg:passwordSha1Hash ?passwordHash . } " + " UNION "
            + " {?account foaf:mbox <mailto:" + usernameOrEmail
            + "> . ?account gkg:passwordSha1Hash ?passwordHash . } " + "}";
    log.debug(query);
    String result = rdfStoreManager.execute(query, jsonResponseFormat);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    if (!bindingsIter.hasNext())
      return false;
    JsonNode bindingNode = bindingsIter.next();
    String correctPasswordHash = bindingNode.path("passwordHash").path("value").textValue();
    log.debug(DigestUtils.sha1Hex(password) + " vs " + correctPasswordHash);
    return DigestUtils.sha1Hex(password).equals(correctPasswordHash);
  }

  /**
   * Checks session token for given user.
   * 
   * @param username Target user name
   * @param token Session token
   * @return true, if token exists for given user, false, otherwise
   * @throws Exception
   */
  public boolean checkToken(String username, String token) throws Exception {
    String query =
        getPrefixes() + "\n" + "ASK {GRAPH <" + frameworkConfig.getAccountsGraph() + "> "
            + " {?account foaf:accountName \"" + username + "\" . ?account gkg:sessionToken \""
            + token + "\" . } " + "}";
    String result = rdfStoreManager.execute(query, jsonResponseFormat);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    return rootNode.path("boolean").booleanValue();
  }

  /**
   * Saves session token for given user.
   * 
   * @param usernameOrEmail Target Workbench user name or e-mail
   * @param token Session token
   * @throws Exception
   */
  public void saveSessionToken(String usernameOrEmail, String token) throws Exception {
    if (usernameOrEmail == null || usernameOrEmail.isEmpty())
      throw new IllegalArgumentException("username cannot be null or empty");
    if (token == null || token.isEmpty())
      throw new IllegalArgumentException("token cannot be null or empty");

    // TODO: replace old token if exists? or add new if user may have more
    // than
    // one token?
    String query =
        getPrefixes() + "\n" + " INSERT {GRAPH <" + frameworkConfig.getAccountsGraph()
            + "> { ?account gkg:sessionToken \"" + token + "\" } } " + " WHERE {" + " {GRAPH <"
            + frameworkConfig.getAccountsGraph() + "> { ?account foaf:accountName \""
            + usernameOrEmail + "\" } } " + " UNION " + " {GRAPH <"
            + frameworkConfig.getAccountsGraph() + "> { ?account foaf:mbox <mailto:"
            + usernameOrEmail + "> } } " + "}";
    rdfStoreManager.execute(query, jsonResponseFormat);
  }

  /**
   * Clear all session tokens for given user.
   * 
   * @param username Target user name
   * @throws Exception
   */
  public void removeAllSessionTokens(String username) throws Exception {
    if (username == null || username.isEmpty())
      throw new IllegalArgumentException("username cannot be null or empty");

    String query =
        getPrefixes() + "\n" + "DELETE { GRAPH <" + frameworkConfig.getAccountsGraph()
            + "> {?account gkg:sessionToken ?o} } " + "WHERE {GRAPH <"
            + frameworkConfig.getAccountsGraph() + "> {?account foaf:accountName \"" + username
            + "\" . ?account gkg:sessionToken ?o . } }";
    rdfStoreManager.execute(query, jsonResponseFormat);
  }

  /**
   * Retrieves user account information.
   * 
   * @param userId Target user name, e-mail or account URI
   * @return User account information
   * @throws Exception
   */
  public UserProfile getUserProfile(String userId) throws Exception {
    String query =
        getPrefixes() + "\n" + "SELECT DISTINCT * WHERE {GRAPH <"
            + frameworkConfig.getAccountsGraph() + ">  {" + " {?account foaf:accountName \""
            + userId + "\" . ?account ?p ?o . } " + " UNION " + " {?account foaf:mbox <mailto:"
            + userId + "> . ?account ?p ?o . } " + " UNION "
            + " {?account ?p ?o . FILTER (?account = <" + userId + ">)} " + "}}";
    log.debug(query);

    String result = rdfStoreManager.execute(query, jsonResponseFormat);

    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    if (!bindingsIter.hasNext())
      return null;

    RoleManager roles = new RoleManager(rdfStoreManager);

    UserProfile userProfile = new UserProfile();
    userProfile.setAccountURI(bindingsIter.next().path("account").path("value").textValue());
    bindingsIter = rootNode.path("results").path("bindings").elements();
    while (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();
      String predicate = bindingNode.path("p").path("value").textValue();
      if (predicate.equals("http://xmlns.com/foaf/0.1/accountName"))
        userProfile.setUsername(bindingNode.path("o").path("value").textValue());
      else if (predicate.endsWith("/settingsGraph"))
        userProfile.setSettingsGraph(bindingNode.path("o").path("value").textValue());
      else if (predicate.equals("http://xmlns.com/foaf/0.1/mbox")) {
        String mbox = bindingNode.path("o").path("value").textValue();
        userProfile.setEmail(mbox.substring("mailto:".length()));
      } else if (predicate.equals(LDIWO.role.getURI())) {
        String roleURI = bindingNode.path("o").path("value").textValue();
        log.debug(roleURI);
        UserRole role = roles.getRole(roleURI);
        userProfile.setRole(role);
      }
    }
    return userProfile;
  }

  /**
   * Retrieves extended user's account information.
   * 
   * @param username Target user name
   * @return Extended user's account information
   * @throws Exception
   */
  public UserProfileExtended getUserProfileExtended(String username) throws Exception {
    UserProfile userProfile = getUserProfile(username);
    UserProfileExtended userProfileExtended = new UserProfileExtended();
    userProfileExtended.setProfile(userProfile);
    userProfileExtended.setOwnGraphs(getOwnGraphs(username));
    userProfileExtended.setReadableGraphs(getReadableGraphs(username));
    userProfileExtended.setWritableGraphs(getWritableGraphs(username));
    return userProfileExtended;
  }

  // TODO: move to another class?
  public RdfStoreManager getRdfStoreManager(String username) throws Exception {
    if (username == null || username.isEmpty())
      throw new IllegalArgumentException("username cannot be null");

    return frameworkConfig.getUserRdfStoreManager(frameworkConfig.getWorkbenchSystemAdmin(),
        frameworkConfig.getWorkbenchSystemAdminPassword());

    // password store is a nice idea, but useless, since every user needs to login again after
    // server restart.
    // there are tasks or jobs, that need user credentials and run out of the box after restart, so
    // waiting for a login is
    // not appropiate. better: have encryption
    /**
     * String password = PasswordStore.getPassword(username); if (password==null) throw new
     * Exception("No password found for user " + username +
     * " in local store. Authentication required."); return
     * frameworkConfig.getUserRdfStoreManager(username, password);
     **/
  }

  /*
   * // TODO: username must be not null (may be null now - for VirtuosoProxy) public
   * ObjectPair<String, String> getRdfStoreUser(String frameworkUsername, String token) throws
   * Exception { String query = getPrefixes() + "\n" +
   * "SELECT ?rdfStoreUsername, ?rdfStorePassword FROM <" + frameworkConfig.getAccountsGraph() +
   * "> " + "WHERE { " + (frameworkUsername == null || frameworkUsername.isEmpty() ? "" :
   * "?account foaf:accountName \"" + frameworkUsername + "\" . ") + "?account gkg:sessionToken \""
   * + token + "\" . " + "?account gkg:rdfStoreUsername ?rdfStoreUsername . " +
   * "?account gkg:rdfStorePassword ?rdfStorePassword . " + "}"; String result =
   * rdfStoreManager.execute(query, jsonResponseFormat); ObjectMapper mapper = new ObjectMapper();
   * JsonNode rootNode = mapper.readTree(result); Iterator<JsonNode> bindingsIter =
   * rootNode.path("results").path("bindings").elements(); if (!bindingsIter.hasNext()) throw new
   * Exception("Invalid user credentials."); JsonNode bindingNode = bindingsIter.next(); String
   * rdfStoreUsername = bindingNode.path("rdfStoreUsername").path("value").textValue(); String
   * rdfStorePassword = bindingNode.path("rdfStorePassword").path("value").textValue(); return new
   * ObjectPair<String, String>(rdfStoreUsername, rdfStorePassword); }
   */

  /**
   * Returns list of readable graphs URIs for given user.
   * 
   * @param username Target user name
   * @return List of URIs
   * @throws Exception
   */
  public Collection<String> getReadableGraphs(String username) throws Exception {
    String settingsGraph = getSettingsGraph(username);
    Collection<String> settingsGraphList = getSettingsGraphs();
    String fromGraphsStr = "";
    for (String graph : settingsGraphList) {

      if (!graph.equals(settingsGraph)) {
        fromGraphsStr += " FROM";
        fromGraphsStr += " <" + graph + "> \n";
      }

    }

    String query = getPrefixes() + "\n" + "SELECT DISTINCT ?ng " + " FROM ";
    query +=
        "<"
            + frameworkConfig.getAccountsGraph()
            + ">\n"
            + fromGraphsStr
            + " WHERE { ?ng rdf:type sd:NamedGraph . ?ng gkg:access ?ao . ?ao acl:mode acl:Read . ?ao acl:agent ?account . ?account foaf:accountName \""
            + username + "\" . }";
    String result = rdfStoreManager.execute(query, jsonResponseFormat);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    Collection<String> readableGraphs = new ArrayList<String>();
    while (bindingsIter.hasNext()) {
      readableGraphs.add(bindingsIter.next().path("ng").path("value").textValue());
    }
    return readableGraphs;
  }

  /**
   * Returns list of writable graphs URIs for given user.
   * 
   * @param username Target user name
   * @return List of URIs
   * @throws Exception
   */
  public Collection<String> getWritableGraphs(String username) throws Exception {
    String settingsGraph = getSettingsGraph(username);
    Collection<String> settingsGraphList = getSettingsGraphs();
    String fromGraphsStr = "";
    for (String graph : settingsGraphList) {
      if (!graph.equals(settingsGraph)) {
        fromGraphsStr += " FROM";
        fromGraphsStr += " <" + graph + "> \n";
      }
    }

    String query = getPrefixes() + "\n" + "SELECT DISTINCT ?ng " + " FROM ";
    query +=
        "<"
            + frameworkConfig.getAccountsGraph()
            + ">\n"
            + fromGraphsStr
            + " WHERE { ?ng rdf:type sd:NamedGraph . ?ng gkg:access ?ao . ?ao acl:mode acl:Write . ?ao acl:agent ?account . ?account foaf:accountName \""
            + username + "\" . }";
    String result = rdfStoreManager.execute(query, jsonResponseFormat);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    Collection<String> writableGraphs = new ArrayList<String>();
    while (bindingsIter.hasNext()) {
      writableGraphs.add(bindingsIter.next().path("ng").path("value").textValue());
    }
    return writableGraphs;
  }

  /**
   * Returns list of all users' named graphs URIs.
   * 
   * @return List of URIs
   * @throws Exception
   */
  public Collection<String> getAllGraphs() throws Exception {
    Collection<String> settingsGraphs = getSettingsGraphs();
    StringBuilder queryBuilder = new StringBuilder();
    queryBuilder.append(getPrefixes()).append("\n").append("SELECT DISTINCT ?ng \n");
    for (String sg : settingsGraphs) {
      queryBuilder.append("FROM <").append(sg).append(">\n");

    }
    queryBuilder.append("WHERE { ?ng rdf:type sd:NamedGraph }");
    String result = rdfStoreManager.execute(queryBuilder.toString(), jsonResponseFormat);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    Collection<String> graphs = new ArrayList<String>();
    while (bindingsIter.hasNext()) {
      graphs.add(bindingsIter.next().path("ng").path("value").textValue());
    }
    return graphs;
  }

  /**
   * Gets the named graphs described inside the settingsGraph and the Graph description of each. And
   * gkg:access??
   * 
   * @return SPARQL response
   * @throws Exception
   */
  public String getAllGraphsSparql() throws Exception {
    Collection<String> settingsGraphs = getSettingsGraphs();
    String fromStr = "";
    for (String sg : settingsGraphs) {
      fromStr += "FROM";
      fromStr += " <" + sg + ">\n";
    }
    String query =
        getPrefixes() + "\n" + "SELECT ?s ?p ?o " + fromStr + " WHERE {"
            + " { ?s rdf:type sd:NamedGraph . ?s ?p ?o . } " + " UNION "
            + " { ?ng rdf:type sd:NamedGraph . ?ng sd:graph ?s . ?s ?p ?o . } " + " UNION "
            + " { ?ng rdf:type sd:NamedGraph . ?ng gkg:access ?s . ?s ?p ?o . } " + "}";
    log.debug(query);
    return rdfStoreManager.execute(query, jsonResponseFormat);
  }

  public Collection<UserProfile> getAllUsersProfiles() throws Exception {
    Collection<String> usernames = getAllUsernames();
    Collection<UserProfile> profiles = new ArrayList<UserProfile>();
    for (String name : usernames)
      profiles.add(getUserProfile(name));
    return profiles;
  }

  public Collection<UserProfileExtended> getAllUsersProfilesExtended() throws Exception {
    Collection<String> usernames = getAllUsernames();
    Collection<UserProfileExtended> profiles = new ArrayList<UserProfileExtended>();
    for (String name : usernames)
      profiles.add(getUserProfileExtended(name));
    return profiles;
  }

  public Collection<String> getUsers(String graph) throws Exception {
    String settingsGraph = getDescribedIn(graph);
    if (settingsGraph == null)
      throw new Exception("Graph " + graph + " description was not found");
    String query =
        getPrefixes()
            + "\n"
            + "SELECT ?account FROM <"
            + settingsGraph
            + "> WHERE {?ng rdf:type sd:NamedGraph . ?ng gkg:access ?ao . ?ao acl:agent ?account . } ";
    String result = rdfStoreManager.execute(query, jsonResponseFormat);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    Collection<String> users = new ArrayList<String>();
    while (bindingsIter.hasNext()) {
      users.add(bindingsIter.next().path("account").path("value").textValue());
    }
    return users;
  }

  public String getDescribedIn(String graph) throws Exception {
    Collection<String> settingsGraphs = getSettingsGraphs();
    StringBuilder queryBuilder = new StringBuilder();
    queryBuilder.append(getPrefixes()).append("\n").append("SELECT DISTINCT ?sg \n");

    queryBuilder.append("FROM <").append(frameworkConfig.getAccountsGraph()).append(">\n");

    for (String sg : settingsGraphs) {
      queryBuilder.append("FROM <").append(sg).append(">\n");

    }
    queryBuilder.append("WHERE { <").append(graph).append("> rdf:type sd:NamedGraph . <")
        .append(graph).append("> acl:owner ?account . ?account gkg:settingsGraph ?sg }");
    String result = rdfStoreManager.execute(queryBuilder.toString(), jsonResponseFormat);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    if (bindingsIter.hasNext()) {
      return bindingsIter.next().path("sg").path("value").textValue();
    }
    return null;
  }

  private String getPrefixes() {
    if (prefixes == null) {
      prefixes =
          "PREFIX : <" + frameworkConfig.getResourceNamespace() + ">\n" + "PREFIX gkg: <"
              + LDIWO.NS + ">\n" + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"
              + "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>\n"
              + "PREFIX acl: <http://www.w3.org/ns/auth/acl#>\n"
              + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"
              + "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
              + "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>";
    }
    return prefixes;
  }

  private String getSettingsGraph(String username) throws Exception {
    String query =
        getPrefixes() + "\n" + "SELECT ?settingsGraph FROM <" + frameworkConfig.getAccountsGraph()
            + "> " + "WHERE {?account foaf:accountName \"" + username
            + "\" . ?account gkg:settingsGraph ?settingsGraph .}";
    String result = rdfStoreManager.execute(query, jsonResponseFormat);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    return bindingsIter.hasNext() ? bindingsIter.next().path("settingsGraph").path("value")
        .textValue() : null;
  }

  public boolean checkUserExists(String username, String email) throws Exception {
    String query =
        getPrefixes() + "\n" + "ASK {" + " { GRAPH <" + frameworkConfig.getAccountsGraph()
            + "> {?account foaf:accountName \"" + username + "\"} } " + " UNION " + " { GRAPH <"
            + frameworkConfig.getAccountsGraph() + "> {?account foaf:mbox <mailto:" + email
            + ">} }" + "}";
    String result = rdfStoreManager.execute(query, jsonResponseFormat);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    boolean frameworkUserExists = rootNode.path("boolean").booleanValue();
    // check also rdf store user with the same name
    boolean rdfStoreUserExists = rdfStoreUserManager.checkUserExists(username, email);
    return frameworkUserExists || rdfStoreUserExists;
  }

  @Override
  public void setup() {
    rdfStoreUserManager.setup();
  }

  /**
   * Validates that the user has a session using the token and returns the UserProfile object
   * 
   * @param userc json object passed in the request cookies
   * @param token
   * @return user profile object if token valid and null if the opposite
   * @throws Exception
   */

  public UserProfile validate(Cookie userc, String token) throws Exception {
    if (userc == null || token == null)
      return null;
    String userstr = URLDecoder.decode(userc.getValue(), "utf-8");
    return validate(userstr, token);
  }

  public UserProfile validate(String userc, String token) throws Exception {

    String userstr = URLDecoder.decode(userc, "utf-8");
    log.debug(" userstr: " + userstr + " token:" + token);

    if (userc == null || token == null)
      return null;

    Gson gson = new Gson();
    UserProfile user = gson.fromJson(userstr, UserProfile.class);

    boolean checkToken = checkToken(user.getUsername(), token);

    if (!checkToken)
      return null;

    return user;
  }

  private Collection<String> getSettingsGraphs() throws Exception {
    Collection<String> settingsGraphList = new ArrayList<String>();
    settingsGraphList.add(frameworkConfig.getSettingsGraph());
    String query =
        getPrefixes() + "\n" + " SELECT DISTINCT ?sg FROM <" + frameworkConfig.getAccountsGraph()
            + "> " + " WHERE { ?account gkg:settingsGraph ?sg }";
    String result = rdfStoreManager.execute(query, jsonResponseFormat);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    while (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();
      settingsGraphList.add(bindingNode.path("sg").path("value").textValue());
    }
    return settingsGraphList;
  }

  public Collection<String> getAllUsernames() throws Exception {
    String query =
        getPrefixes() + "\n" + "SELECT DISTINCT ?username FROM <"
            + frameworkConfig.getAccountsGraph() + "> "
            + " WHERE {?account rdf:type gkg:Account . ?account foaf:accountName ?username}";
    String result = rdfStoreManager.execute(query, jsonResponseFormat);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    Collection<String> usernames = new ArrayList<String>();
    while (bindingsIter.hasNext()) {
      usernames.add(bindingsIter.next().path("username").path("value").textValue());
    }
    return usernames;
  }

  private Collection<String> getOwnGraphs(String username) throws Exception {
    String settingsGraph = getSettingsGraph(username);
    String query = getPrefixes() + "\n" + "SELECT DISTINCT ?ng " + " FROM ";
    query += "<" + settingsGraph + "> " + " FROM ";
    query +=
        "<"
            + frameworkConfig.getAccountsGraph()
            + "> "
            + " WHERE { ?ng rdf:type sd:NamedGraph . ?ng acl:owner ?account . ?account foaf:accountName \""
            + username + "\" . }";
    String result = rdfStoreManager.execute(query, jsonResponseFormat);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    Collection<String> ownGraphs = new ArrayList<String>();
    while (bindingsIter.hasNext()) {
      ownGraphs.add(bindingsIter.next().path("ng").path("value").textValue());
    }
    return ownGraphs;
  }

  /**
   * Checks if given Workbench user has role Administrator.
   * 
   * @param userId User name, e-mail or account URI
   * @return true, if given user has role Administrator, false, otherwise
   * @throws Exception
   */
  public boolean isAdmin(String userId) throws Exception {
    String query =
        getPrefixes() + "\n" + "SELECT DISTINCT ?role FROM <" + frameworkConfig.getAccountsGraph()
            + "> " + "WHERE {" + " {?account foaf:accountName \"" + userId
            + "\" . ?account gkg:role ?role . } " + " UNION " + " {?account foaf:mbox <mailto:"
            + userId + "> . ?account gkg:role ?role . } " + " UNION "
            + " {?account gkg:role ?role . FILTER (?account = <" + userId + ">)} " + "}";
    String result = rdfStoreManager.execute(query, jsonResponseFormat);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    if (!bindingsIter.hasNext())
      return false;
    JsonNode binding = bindingsIter.next();
    String role = binding.path("role").path("value").textValue();
    return role.equals(frameworkConfig.getResourceNamespace() + RoleType.ADMINISTRATOR);
  }

  /**
   * Sets Workbench role for given user.
   * 
   * @param userId Target user name
   * @param role Workbench role
   * @throws Exception
   */
  public void setRole(String userId, String role) throws Exception {
    // OntoQuad doesn't support DELETE {...} INSERT {...} WHERE {...}, so
    // use 2 queries
    String deleteQuery =
        getPrefixes() + "\n" + " DELETE { GRAPH <" + frameworkConfig.getAccountsGraph()
            + "> {?account gkg:role ?o} } " + " WHERE { GRAPH <"
            + frameworkConfig.getAccountsGraph() + "> {?account foaf:accountName \"" + userId
            + "\" . optional {?account gkg:role ?o .} } }";
    String insertQuery =
        getPrefixes() + "\n" + " INSERT { GRAPH <" + frameworkConfig.getAccountsGraph()
            + "> {?account gkg:role <" + role + ">} } " + " WHERE { GRAPH <"
            + frameworkConfig.getAccountsGraph() + "> {?account foaf:accountName \"" + userId
            + "\" . optional {?account gkg:role ?o .} } }";
    log.debug(deleteQuery);
    log.debug(insertQuery);
    rdfStoreManager.execute(deleteQuery, jsonResponseFormat);
    rdfStoreManager.execute(insertQuery, jsonResponseFormat);

    // TODO: replace 2 queries with this query when OntoQuad will support
    // DELETE {...} INSERT {...} WHERE {...} queries
    // String query = getPrefixes() + "\n"
    // + " WITH <" + frameworkConfig.getAccountsGraph() + "> "
    // + " DELETE {?account gkg:role ?o} "
    // + " INSERT {?account gkg:role <" + role + ">} "
    // + " WHERE {?account foaf:accountName \"" + userId +
    // "\" . optional {?account gkg:role ?o .} }";
  }

  /*
   * REPLACED FUNCTIONS WITHIN RoleManager
   * 
   * private UserRole getRole(String roleURI) throws Exception { UserRole role = new UserRole();
   * role.setUri(roleURI); Collection<String> roleServices = new ArrayList<>(); String query =
   * getPrefixes() + "\n" + "SELECT ?s ?p ?o FROM <" + frameworkConfig.getAccountsGraph() + "> " +
   * "WHERE {?s ?p ?o . filter(?s=<" + roleURI + ">)}"; log.debug(query); String result =
   * rdfStoreManager.execute(query, jsonResponseFormat);
   * 
   * ObjectMapper mapper = new ObjectMapper(); JsonNode rootNode = mapper.readTree(result);
   * Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements(); while
   * (bindingsIter.hasNext()) { JsonNode bindingNode = bindingsIter.next(); String predicate =
   * bindingNode.path("p").path("value").textValue();
   * 
   * log.debug(predicate);
   * 
   * if (predicate.equals(RDFS.label.getURI()))
   * role.setName(bindingNode.path("o").path("value").textValue()); else if
   * (predicate.equals(LDIWO.isAllowedToUseService.getURI()))
   * roleServices.add(bindingNode.path("o").path("value").textValue()); }
   * role.setServices(roleServices); return role; }
   * 
   * private String getDefaultRoleURI() throws Exception { String query = getPrefixes() + "\n" +
   * "SELECT DISTINCT ?role FROM <" + frameworkConfig.getAccountsGraph() + "> " +
   * "WHERE { ?role gkg:isDefault true . }"; String result = rdfStoreManager.execute(query,
   * jsonResponseFormat); ObjectMapper mapper = new ObjectMapper(); JsonNode rootNode =
   * mapper.readTree(result); Iterator<JsonNode> bindingsIter =
   * rootNode.path("results").path("bindings").elements(); String role; if (!bindingsIter.hasNext())
   * { role = frameworkConfig.getResourceNamespace() + RoleType.DEFAULT; } else { JsonNode binding =
   * bindingsIter.next(); role = binding.path("role").path("value").textValue(); } return role; }
   */

  /**
   * This method returns Workbench user name.
   * 
   * @param usernameOrEmail Workbench user name or e-mail
   * @return Corresponding Workbench user name
   * @throws Exception
   */
  private String getUsername(String usernameOrEmail) throws Exception {
    if (!usernameOrEmail.contains("@"))
      return usernameOrEmail;

    String query =
        getPrefixes() + "\n" + "SELECT DISTINCT ?name FROM <" + frameworkConfig.getAccountsGraph()
            + "> " + "WHERE {?account foaf:accountName ?name . ?account foaf:mbox <mailto:"
            + usernameOrEmail + "> . } ";
    String result = rdfStoreManager.execute(query, jsonResponseFormat);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    if (!bindingsIter.hasNext())
      return null;
    return bindingsIter.next().path("name").path("value").textValue();
  }


}
