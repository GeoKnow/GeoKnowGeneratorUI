package eu.geoknow.generator.configuration;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Calendar;
import java.util.Collection;
import java.util.GregorianCalendar;
import java.util.Iterator;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.sparql.vocabulary.FOAF;
import com.hp.hpl.jena.vocabulary.DCTerms;
import com.hp.hpl.jena.vocabulary.RDF;
import com.ontos.ldiw.vocabulary.LDIS;
import com.ontos.ldiw.vocabulary.LDIWO;

import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.SPARQLEndpointException;
import eu.geoknow.generator.rdf.RdfStoreManager;
import eu.geoknow.generator.rdf.SecureRdfStoreManagerImpl;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserManager;
import eu.geoknow.generator.users.VirtuosoUserManager;

/**
 * Class to store the configuration in the triple store
 * 
 * @author taleksaschina on 30.06.2014.
 * @author mvoigt
 * @author alejandragarciarojas added componentsGraph, and re-stuctured the setup
 * 
 *         TODO: roles have to be defined also in he framework-user.ttl instead of the ontology
 * 
 */
public class FrameworkSetup {

  private static final Logger log = Logger.getLogger(FrameworkSetup.class);

  private FrameworkConfiguration config;
  private UserManager rdfStoreUserManager;
  private SecureRdfStoreManagerImpl frameworkRdfStoreManager;

  public FrameworkSetup() throws IOException, InformationMissingException {
    // init
    this.config = FrameworkConfiguration.getInstance();
    this.frameworkRdfStoreManager = config.getSystemRdfStoreManager();
    this.rdfStoreUserManager = config.getRdfStoreUserManager();
    this.rdfStoreUserManager.setup();
  }

  /**
   * Method to setup, thus, to store the configuration of the workbench in the triple store.
   * 
   * @param config the framework configuration to store
   * @param reset if true, the system config already stored will be overwritten in the triple store
   * @throws Exception
   */
  public void setUp(boolean reset) throws Exception {

    // if setup is already done but not reset is wanted, exit here
    if (config.isSetUp() && !reset) {
      log.debug("System is already initialized, and reset is " + reset
          + ". Will update components data... ");
      frameworkRdfStoreManager.dropGraph(config.getComponentsGraph());
      setupComponentsGraph();
      return;
    }
    // if setup already done and reset is want, delete flag and delete
    // config
    else if (reset) {
      clear();
      if (config.isSetUp()) {
        if (!config.removeInitFile()) {
          throw new Exception("Failed to delete init flag file");
        } else {
          log.info("Old config removed, flag cleaned");
        }
      } else {
        log.info("Old config removed, but no flage cleaned since it wasn't there. You maybe changed the framework data drectory.");
      }

    }

    // check if auth user doesn't exists
    boolean authSparqlUserExist =
        rdfStoreUserManager.checkUserExists(config.getWorkbenchSystemAdmin(), null);
    if (authSparqlUserExist)
      throw new Exception("Auth SPARQL user " + config.getWorkbenchSystemAdmin()
          + " already exists");

    // at this point workbench admin user is not created,
    // but in Virtuoso we can query graphs via public sparql endpoint
    checkGraphs();

    log.info("System Initialization ");

    // create user
    rdfStoreUserManager.createUser(config.getWorkbenchSystemAdmin(),
        config.getWorkbenchSystemAdminPassword());
    rdfStoreUserManager.setDefaultRdfPermissions(config.getWorkbenchSystemAdmin(),
        UserManager.GraphPermissions.WRITE);
    // Virtuoso fix
    if (rdfStoreUserManager instanceof VirtuosoUserManager) {
      ((VirtuosoUserManager) rdfStoreUserManager).grantLOLook(config.getWorkbenchSystemAdmin());
    }

    log.info("System Graphs creation and configuration ");

    // create required named graphs and load the configuration files
    // using framework default user
    frameworkRdfStoreManager.createGraph(config.getSettingsGraph());
    frameworkRdfStoreManager.createGraph(config.getAccountsGraph());
    frameworkRdfStoreManager.createGraph(config.getGroupsGraph());
    frameworkRdfStoreManager.createGraph(config.getJobsGraph());
    frameworkRdfStoreManager.createGraph(config.getAuthSessionsGraph());

    // Make graphs no accessible by default
    rdfStoreUserManager.setPublicRdfPermissions(UserManager.GraphPermissions.NO);

    // add creation dates of the graphs to the SystemGraphsModel, this metadata is going
    // to be added to the settingsGraph
    addDates(config.getSettingsGraph(), FrameworkConfiguration.getSystemGraphsModel());
    addDates(config.getAccountsGraph(), FrameworkConfiguration.getSystemGraphsModel());
    addDates(config.getComponentsGraph(), FrameworkConfiguration.getSystemGraphsModel());
    addDates(config.getGroupsGraph(), FrameworkConfiguration.getSystemGraphsModel());
    addDates(config.getAuthSessionsGraph(), FrameworkConfiguration.getSystemGraphsModel());
    addDates(config.getJobsGraph(), FrameworkConfiguration.getSystemGraphsModel());

    // sets the graph permissions to accountsGraph, groupsGraph, jobsGraph and authSessionsGrapg.
    // all are writable by the System user
    rdfStoreUserManager.setRdfGraphPermissions(config.getWorkbenchSystemAdmin(),
        config.getGroupsGraph(), UserManager.GraphPermissions.WRITE);
    rdfStoreUserManager.setRdfGraphPermissions(config.getWorkbenchSystemAdmin(),
        config.getJobsGraph(), UserManager.GraphPermissions.WRITE);
    rdfStoreUserManager.setRdfGraphPermissions(config.getWorkbenchSystemAdmin(),
        config.getAuthSessionsGraph(), UserManager.GraphPermissions.WRITE);
    rdfStoreUserManager.setRdfGraphPermissions(config.getWorkbenchSystemAdmin(),
        config.getAccountsGraph(), UserManager.GraphPermissions.WRITE);

    // setup the settingsGraph with corresponding metadata
    setupSettingsGraph();
    // setup the componentsGraph with corresponding metadata
    setupComponentsGraph();
    // add the roles to the accounts graph
    setupRolesGraph();

    // get accounts to be created form the configuration file
    log.info("create users from framework configuration");
    FrameworkUserManager frameworkUserManager = config.getFrameworkUserManager();
    String query =
        "PREFIX gkg: <http://ldiw.ontos.com/ontology/> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
            + " PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX lds: <http://stack.linkeddata.org/ldis-schema/> "
            + " SELECT ?accountName ?password ?mailto ?role WHERE { "
            + " ?account <"
            + RDF.type.getURI()
            + "> gkg:Account . ?account <"
            + FOAF.accountName.getURI()
            + "> ?accountName . "
            + " ?account <"
            + LDIS.password
            + "> ?password . ?account <"
            + FOAF.mbox + "> ?mailto . ?account <" + LDIWO.role + "> ?role . } ";
    QueryExecution qexec =
        QueryExecutionFactory.create(query, FrameworkConfiguration.getUsersModel());
    ResultSet results = qexec.execSelect();
    while (results.hasNext()) {
      QuerySolution soln = results.next();
      String accountName = soln.getLiteral("accountName").getString();
      String password = soln.getLiteral("password").getString();
      String email = soln.get("mailto").toString().substring("mailto:".length());
      String role = soln.getResource("role").getURI();
      if (frameworkUserManager.checkUserExists(accountName, email)) {
        if (reset) {
          frameworkUserManager.dropUser(accountName);
          frameworkUserManager.createUser(accountName, password, email);
        } else
          log.warn("User " + accountName + " already exists, and is going to be kept");
      } else
        frameworkUserManager.createUser(accountName, password, email);

      frameworkUserManager.setRole(accountName, role);
    }
    qexec.close();
    // init is done, that the flag finally
    boolean created = config.createInitFile();
    if (!created) {
      log.error("Failed to create init flag file");
    } else {
      log.info("System was initialized successfully.");
    }
  }

  private void addDates(String ngraph, Model m) {
    Calendar cal = GregorianCalendar.getInstance();
    Resource namedGraph = m.getResource(ngraph);
    m.add(namedGraph, DCTerms.modified, m.createTypedLiteral(cal));
    m.add(namedGraph, DCTerms.created, m.createTypedLiteral(cal));
  }

  /**
   * clear rdf store using configuration: drop system graphs, sparql auth user, all registered users
   * (if exists)
   * 
   * @throws Exception
   */
  public void clear() throws Exception {

    log.info("Checking if system SPARQL user exists");
    if (!rdfStoreUserManager.checkUserExists(config.getWorkbenchSystemAdmin(), null)) {
      // if user doesn't exists than we cannot drop registered users and
      // system graphs
      // if system graphs exists than it may be used by another
      // installation, so drop it manually if you need
      return;
    }

    FrameworkUserManager frameworkUserManager = config.getFrameworkUserManager();
    // drop registered users
    log.debug("Drop registered users");
    Collection<String> users = frameworkUserManager.getAllUsernames();
    for (String user : users) {
      frameworkUserManager.dropUser(user);
    }

    // drop system graphs
    log.debug("Drop system graphs");
    for (String graph : config.getSystemGraphs().values())
      frameworkRdfStoreManager.dropGraph(graph);

    // drop sparql user
    log.debug("Drop system SPARQL user");
    rdfStoreUserManager.dropUser(config.getWorkbenchSystemAdmin());
  }

  /**
   * Check if system graphs already exists. Throws exception if one of system graphs exists.
   * 
   * @param rdfStoreManager - RDF store manager used to check graphs
   * @param config - framework configuration (to get system graphs URIs)
   * @throws Exception if one of system graphs exists
   */
  private void checkGraphs() throws Exception {

    RdfStoreManager rdfStoreManager = config.getPublicRdfStoreManager();
    log.info("Check if system graphs already exists");
    String queryString = "SELECT DISTINCT ?g WHERE {GRAPH ?g {?s ?p ?o}}";
    String response = rdfStoreManager.execute(queryString, "json");
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(response);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    while (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();
      String graph = bindingNode.path("g").path("value").textValue();
      if (config.getSystemGraphs().containsKey(graph))
        throw new Exception("Graph " + graph + " already exists");
    }
  }



  private void setupSettingsGraph() throws Exception {
    log.debug("setting up " + config.getSettingsGraph());
    frameworkRdfStoreManager.createGraph(config.getSettingsGraph());

    // only admin user can read/write the graph
    rdfStoreUserManager.setRdfGraphPermissions(config.getWorkbenchSystemAdmin(),
        config.getSettingsGraph(), UserManager.GraphPermissions.WRITE);
    // write the system settings model (include system graphs data)
    // insert configuration data, system graphs and datasources to the settings model
    Model settingsModel = ModelFactory.createDefaultModel();
    settingsModel.add(FrameworkConfiguration.getConfigurationModel());
    settingsModel.add(FrameworkConfiguration.getDatasourceModel());

    ByteArrayOutputStream os = new ByteArrayOutputStream();
    os = new ByteArrayOutputStream();
    settingsModel.write(os, "N-TRIPLES");
    String queryString =
        "INSERT DATA { GRAPH <" + config.getSettingsGraph() + "> { " + os.toString() + " } }";
    os.close();
    frameworkRdfStoreManager.execute(queryString, null);
  }

  /**
   * Creates the components graph and provides corresponding privileges. Then, loads the file in the
   * graph.
   * 
   * @throws Exception
   */
  private void setupComponentsGraph() throws Exception {
    // components graph are writable by admin and readable by framework
    // users
    log.debug("setting up " + config.getComponentsGraph());
    frameworkRdfStoreManager.createGraph(config.getComponentsGraph());
    // only admin user can read/write the graph
    rdfStoreUserManager.setRdfGraphPermissions(config.getWorkbenchSystemAdmin(),
        config.getComponentsGraph(), UserManager.GraphPermissions.WRITE);

    ByteArrayOutputStream os = new ByteArrayOutputStream();
    FrameworkConfiguration.getComponentsModel().write(os, "N-TRIPLES");
    String queryString =
        "INSERT DATA { GRAPH <" + config.getComponentsGraph() + "> { " + os.toString() + " } }";
    os.close();
    try {
      frameworkRdfStoreManager.execute(queryString, null);
    } catch (Exception e) {
      log.error(e);
      throw new SPARQLEndpointException(e.getMessage());
    }
  }

  /**
   * Set up Accounts Graph
   * 
   * @throws Exception
   */
  private void setupRolesGraph() throws Exception {
    // components graph are writable by admin and readable by framework
    // users
    log.debug("setting up " + config.getRolesGraph());
    frameworkRdfStoreManager.createGraph(config.getRolesGraph());
    // only admin user can read/write the graph
    rdfStoreUserManager.setRdfGraphPermissions(config.getWorkbenchSystemAdmin(),
        config.getRolesGraph(), UserManager.GraphPermissions.WRITE);

    ByteArrayOutputStream os = new ByteArrayOutputStream();
    FrameworkConfiguration.getRolesModel().write(os, "N-TRIPLES");
    String queryString =
        "INSERT DATA { GRAPH <" + config.getRolesGraph() + "> { " + os.toString() + " } }";
    os.close();
    try {
      frameworkRdfStoreManager.execute(queryString, null);
    } catch (Exception e) {
      log.error(e);
      throw new SPARQLEndpointException(e.getMessage());
    }
  }
}
