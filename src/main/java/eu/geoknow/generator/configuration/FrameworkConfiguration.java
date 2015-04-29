package eu.geoknow.generator.configuration;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.locks.ReentrantLock;

import org.apache.jena.riot.RiotException;
import org.apache.log4j.Logger;

import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.sparql.vocabulary.FOAF;
import com.hp.hpl.jena.vocabulary.RDFS;
import com.ontos.ldiw.vocabulary.LDIS;
import com.ontos.ldiw.vocabulary.LDIWO;
import com.ontos.ldiw.vocabulary.SD;

import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.rdf.GraphGroupManager;
import eu.geoknow.generator.rdf.RdfStoreManager;
import eu.geoknow.generator.rdf.RdfStoreManagerImpl;
import eu.geoknow.generator.rdf.SecureRdfStoreManagerImpl;
import eu.geoknow.generator.rdf.VirtuosoGraphGroupManager;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserManager;
import eu.geoknow.generator.users.VirtuosoUserManager;
import eu.geoknow.generator.utils.EmailSender;
import eu.geoknow.generator.utils.SSLEmailSender;
import eu.geoknow.generator.utils.TLSEmailSender;
import eu.geoknow.generator.utils.Utils;

/**
 * This class will read the framework configuration file and make content available in its
 * properties.
 * 
 * @author alejandragarciarojas
 *
 */
public class FrameworkConfiguration {

  private static final Logger log = Logger.getLogger(FrameworkConfiguration.class);

  // email registration notifications
  private String smtpHost = "";
  private String smtpTLSPort = "587";
  private String smtpSSLPort = "465";
  private String emailAddress = "";
  private String emailUsername = "";
  private String emailPassword = "";

  private String resourceNS = "";

  // in this file all main configs are stored
  private final static String configurationFile = "framework-configuration.ttl";
  private final static String datasourcesFile = "framework-datasources.ttl";
  private final static String componentsFile = "framework-components.ttl";
  private final static String usersFile = "framework-users.ttl";
  private final static String sysgraphsFile = "framework-system-graphs.ttl";

  private static Model configurationModel = null;
  private static Model datasourceModel = null;
  private static Model componentsModel = null;
  private static Model usersModel = null;
  private static Model sysgraphsModel = null;

  // RDF store admin, who has rights to manage RDF store users (create,
  // delete, grant permissions, etc.).
  // This special user is not created or configured on Workbench setup, it
  // should be configured previously in RDF store.
  // Configuration details depends on concrete RDF store.
  private String rdfStoreAdmin = "";
  private String rdfStoreAdminPassword = "";
  private String virtuosoJdbcConnString = "";

  // admin service for user management (is used for OntoQuad only)
  private String adminServiceUrl;

  private String publicSparqlEndpoint = "";
  private String authSparqlEndpoint = "";

  // RDF store user, who manages all Workbench system graphs.
  // This user will be created on Workbench setup, just specify user name and
  // password in config file.
  private String workbenchSystemAdmin = "";
  private String workbenchSystemAdminPassword = "";

  // system graphs
  private String componentsGraph = "";
  private String accountsGraph = "";
  private String settingsGraph = "";
  private String jobsGraph = "";
  private String authSessionsGraph = "";
  private String groupsGraph = "";
  private String frameworkUri;
  private String homepage;

  private String springBatchUri = "";
  private String springBatchJobsDir = "";
  private String frameworkDataDir = "";
  private File initFile;


  private static FrameworkConfiguration instance;

  private final ReentrantLock dataMappingLock = new ReentrantLock();

  /**
   * This class provides access to properties form the framework configuration file. And also it
   * loads to Jena Models the other configuration files, so they can be reused in the application.
   * 
   * @param context
   * @return
   * @throws IOException
   * @throws InformationMissingException
   * @throws Exception
   */
  public static synchronized FrameworkConfiguration getInstance() throws IOException,
      InformationMissingException {

    if (instance == null) {

      instance = new FrameworkConfiguration();

      // get uri endpoint and dir framework
      // the dir to store workbench specific data that should not
      // be deleted and where the init.txt will be created
      // join the configuration and components models to get the endpoing information
      Model allModels = ModelFactory.createDefaultModel();
      allModels.add(getConfigurationModel());
      allModels.add(getComponentsModel());
      allModels.add(getSystemGraphsModel());

      String query =
          "SELECT ?uri ?endpoint ?dir ?homepage WHERE { ?uri <" + RDFS.label.getURI()
              + "> ?label . " + " ?uri <" + LDIS.integrates.getURI() + ">  ?component ."
              + " ?component <" + LDIS.providesService.getURI() + "> ?service ." + " ?uri <"
              + LDIWO.frameworkDataDir.getURI() + "> ?dir . ?uri <" + FOAF.homepage.getURI()
              + "> ?homepage . optional { ?service a <" + LDIS.SPARQLEndPointService.getURI()
              + "> ." + " ?service <" + LDIS.serviceUrl.getURI() + ">?endpoint . }"
              + " FILTER regex(?label, \"LDWorkbench\", \"i\" )}";
      log.debug("get uri endpoint and dir framework");
      log.debug(query);
      QueryExecution qexec = QueryExecutionFactory.create(query, allModels);
      ResultSet results = qexec.execSelect();
      if (!results.hasNext()) {
        instance = null;
        throw new InformationMissingException(
            "Invalid initialization parameter in the framework-configratio file");
      }
      for (; results.hasNext();) {
        QuerySolution soln = results.next();
        instance.setFrameworkUri(soln.get("uri").toString());
        if (soln.get("endpoint") != null)
          instance.setPublicSparqlEndpoint(soln.get("endpoint").toString()); // ontoquad
                                                                             // does
                                                                             // not
                                                                             // support
                                                                             // public
                                                                             // endpoints
        instance.setResourceNamespace(instance.getFrameworkUri().substring(0,
            instance.getFrameworkUri().lastIndexOf("/") + 1));
        instance.setFrameworkDataDir(soln.getLiteral("dir").getString());
        instance.setHomepage(soln.getResource("homepage").getURI());
      }
      qexec.close();

      log.info("Framework URI: " + instance.getFrameworkUri());
      log.info("Framework endpoint: " + instance.getPublicSparqlEndpoint());
      log.info("Framework ResourceNamespace: " + instance.getResourceNamespace());
      log.info("Framework Data Directory: " + instance.getFrameworkDataDir());
      log.info("Framework Homepage: " + instance.getHomepage());

      // get the email specific information
      query =
          " SELECT ?user ?pass ?mail ?host ?tls ?ssl WHERE {  <" + instance.getFrameworkUri()
              + "> <" + LDIS.providesService.getURI() + "> ?service ." + " ?service a <"
              + LDIS.EmailService.getURI() + "> ;" + " <" + LDIS.password.getURI() + "> ?pass ;"
              + " <" + LDIS.user.getURI() + "> ?user ;" + " <" + FOAF.mbox.getURI() + "> ?mail ;"
              + " <" + LDIWO.smtpHost.getURI() + "> ?host ;" + " <" + LDIWO.smtpTlsPort.getURI()
              + "> ?tls ;" + " <" + LDIWO.smtpSslPort.getURI() + "> ?ssl }";
      log.debug("get system registration email");
      log.debug(query);
      qexec = QueryExecutionFactory.create(query, allModels);
      results = qexec.execSelect();
      if (!results.hasNext()) {
        instance = null;
        throw new InformationMissingException(
            "Invalid initialization of the email registration service configuration");
      }
      for (; results.hasNext();) {
        QuerySolution soln = results.next();
        instance.setSmtpHost(soln.getLiteral("host").getString());
        instance.setSmtpTLSPort(soln.getLiteral("tls").getString());
        instance.setSmtpSSLPort(soln.getLiteral("ssl").getString());
        instance.setEmailAddress(soln.getResource("mail").getURI().replace("mailto:", ""));
        instance.setEmailUsername(soln.getLiteral("user").getString());
        instance.setEmailPassword(soln.getLiteral("pass").getString());
      }
      qexec.close();
      log.info("Read email config for host:" + instance.getSmtpHost() + " and account:"
          + instance.getEmailUsername());

      // get the endpoint for authenticated users, and user and password
      // of the system framework
      query =
          " SELECT ?endpoint ?user ?password WHERE { <" + instance.getFrameworkUri() + "> <"
              + LDIS.integrates.getURI() + ">  ?component ." + " ?component <"
              + LDIS.providesService.getURI() + "> ?service ." + " ?service a <"
              + LDIS.SecuredSPARQLEndPointService.getURI() + "> ." + " ?service <"
              + LDIS.serviceUrl.getURI() + "> ?endpoint ." + " ?service <" + LDIS.user.getURI()
              + "> ?user ." + " ?service <" + LDIS.password.getURI() + "> ?password }";
      log.debug("RDFStore user");
      log.debug(query);
      qexec = QueryExecutionFactory.create(query, allModels);
      results = qexec.execSelect();
      if (!results.hasNext()) {
        instance = null;
        throw new InformationMissingException(
            "Invalid initialization of RDFStore user configuration ");
      }
      for (; results.hasNext();) {
        QuerySolution soln = results.next();
        instance.setAuthSparqlEndpoint(soln.get("endpoint").toString());
        instance.setWorkbenchSystemAdmin(soln.get("user").asLiteral().getString());
        instance.setWorkbenchSystemAdminPassword(soln.get("password").asLiteral().getString());
      }
      qexec.close();

      // get and set the database configuration (Virtuoso)
      query =
          " SELECT ?connectionString ?serviceUrl ?user ?password ?endpoint ?graph WHERE {<"
              + instance.getFrameworkUri() + "> <" + LDIS.integrates.getURI() + ">  ?component ."
              + " ?component <" + LDIS.providesService.getURI() + "> ?service ." + " ?service a <"
              + LDIS.StorageService.getURI() + "> ." + " optional {?service <"
              + LDIS.connectionString.getURI() + ">  ?connectionString} ."
              + " optional {?service <" + LDIS.serviceUrl.getURI() + "> ?serviceUrl .} "
              + " ?service <" + LDIS.user.getURI() + "> ?user ." + " ?service <"
              + LDIS.password.getURI() + "> ?password }";
      log.debug("RDFStore DB connection");
      log.debug(query);

      qexec = QueryExecutionFactory.create(query, allModels);
      results = qexec.execSelect();
      if (!results.hasNext()) {
        instance = null;
        throw new InformationMissingException("Invalid initialization of RDF Store service ");
      }
      for (; results.hasNext();) {
        QuerySolution soln = results.next();
        if (soln.contains("connectionString")) {
          instance.setVirtuosoJdbcConnString(soln.get("connectionString").asLiteral().getString());
        }
        if (soln.contains("serviceUrl")) {
          instance.setAdminServiceUrl(soln.get("serviceUrl").asResource().getURI());
        }
        instance.setRdfStoreAdmin(soln.get("user").asLiteral().getString());
        instance.setRdfStoreAdminPassword(soln.get("password").asLiteral().getString());
      }
      qexec.close();

      // get and set the system named graphs
      query =
          "SELECT ?name ?label  " + "WHERE { ?s <" + SD.namedGraph.getURI() + "> ?o .  ?o  <"
              + SD.name.getURI() + "> ?name . ?o <" + SD.graph.getURI() + "> ?g . ?g <"
              + RDFS.label.getURI() + "> ?label } ";
      qexec = QueryExecutionFactory.create(query, allModels);
      results = qexec.execSelect();
      if (!results.hasNext()) {
        instance = null;
        throw new NullPointerException("Invalid initial parameter required");
      }
      for (; results.hasNext();) {
        QuerySolution soln = results.next();

        if ("settings".equals(soln.get("label").asLiteral().getString()))
          instance.setSettingsGraph(soln.get("name").toString());
        else if ("accounts".equals(soln.get("label").asLiteral().getString()))
          instance.setAccountsGraph(soln.get("name").toString());
        else if ("groups".equals(soln.get("label").asLiteral().getString()))
          instance.setGroupsGraph(soln.get("name").toString());
        else if ("jobs".equals(soln.get("label").asLiteral().getString()))
          instance.setJobsGraph(soln.get("name").toString());
        else if ("sessions".equals(soln.get("label").asLiteral().getString()))
          instance.setAuthSessionsGraph(soln.get("name").toString());
      }
      qexec.close();

      instance.setComponentsGraph(instance.getResourceNamespace() + "components");

      // get the path to the workflow engine
      query =
          " SELECT ?endpoint ?dir WHERE {<" + instance.getFrameworkUri() + "> <"
              + LDIS.integrates.getURI() + ">  ?component . ?component <"
              + LDIS.providesService.getURI() + "> ?service . ?service a <"
              + LDIS.WorkflowService.getURI() + "> ; <" + LDIWO.springBatchAdminJobsDir.getURI()
              + ">  ?dir ;  <" + LDIS.serviceUrl.getURI() + "> ?endpoint .}";
      log.debug("Workflow service");
      log.debug(query);
      qexec = QueryExecutionFactory.create(query, allModels);
      results = qexec.execSelect();
      if (!results.hasNext()) {
        instance = null;
        throw new NullPointerException("Invalid initialization parameter for the Workflow Service");
      }
      for (; results.hasNext();) {
        QuerySolution soln = results.next();
        instance.setSpringBatchUri(soln.get("endpoint").toString());
        instance.setSpringBatchJobsDir(soln.get("dir").asLiteral().getString());
      }
      qexec.close();
      log.info("Spring Batch URI:" + instance.getSpringBatchUri());

      // create the file path for the flag
      instance.initFile = new File(instance.frameworkDataDir, "init.txt");
    }

    return instance;
  }

  /**
   * Method to check if the framework is already initialized. It is checked via a flag in the file
   * system.
   * 
   * @return true is already initialized, false otherwise
   */
  public boolean isSetUp() {
    log.info("Checking if " + initFile.getPath() + " exists");
    return initFile.exists();
  }

  /**
   * Method to create the init.txt file in the framwork data dir. If it already exists, the file
   * isn't touched.
   * 
   * @return true is created, false if not or the flag already exists
   */
  public boolean createInitFile() {
    if (!isSetUp()) {
      try {
        return this.initFile.createNewFile();
      } catch (IOException e) {
        log.error(e);
        return false;
      }
    } else {
      log.error("You need to delete the inti flag before creating it again.");
      return false;
    }
  }

  /**
   * Method to delete the init.txt file.
   * 
   * @return true if successful, false if not or the file is not existing.
   */
  public boolean removeInitFile() {
    if (isSetUp())
      return this.initFile.delete();
    return false;
  }

  /**
   * Method to get the lock of adding new data mappings
   * 
   * @return
   */
  public ReentrantLock getDataMappingLock() {
    return dataMappingLock;
  }

  public FrameworkUserManager getFrameworkUserManager() {
    return new FrameworkUserManager(getRdfStoreUserManager(), getAdminRdfStoreManager(), instance);
  }

  public SecureRdfStoreManagerImpl getAdminRdfStoreManager() {
    return getUserRdfStoreManager(workbenchSystemAdmin, workbenchSystemAdminPassword);
  }

  public SecureRdfStoreManagerImpl getUserRdfStoreManager(String user, String password) {
    return new SecureRdfStoreManagerImpl(authSparqlEndpoint, user, password);
  }

  public RdfStoreManager getPublicRdfStoreManager() { // todo OntoQuad doesn't
                                                      // support public
                                                      // endpoint, so need
                                                      // some work around
    return new RdfStoreManagerImpl(getPublicSparqlEndpoint());
  }

  public UserManager getRdfStoreUserManager() {
    return new VirtuosoUserManager(this.virtuosoJdbcConnString, this.rdfStoreAdmin,
        this.rdfStoreAdminPassword);

  }

  public EmailSender getDefaultEmailSender() {
    return getTLSEmailSender();
  }

  public EmailSender getTLSEmailSender() {
    return new TLSEmailSender(this.smtpHost, this.smtpTLSPort, this.emailAddress,
        this.emailUsername, this.emailPassword);
  }

  public EmailSender getSSLEmailSender() {
    return new SSLEmailSender(this.smtpHost, this.smtpSSLPort, this.emailAddress,
        this.emailUsername, this.emailPassword);
  }

  public String getSmtpHost() {
    return smtpHost;
  }

  public void setSmtpHost(String smtpHost) {
    this.smtpHost = smtpHost;
  }

  public String getSmtpTLSPort() {
    return smtpTLSPort;
  }

  public void setSmtpTLSPort(String smtpTLSPort) {
    this.smtpTLSPort = smtpTLSPort;
  }

  public String getSmtpSSLPort() {
    return smtpSSLPort;
  }

  public void setSmtpSSLPort(String smtpSSLPort) {
    this.smtpSSLPort = smtpSSLPort;
  }

  public String getEmailAddress() {
    return emailAddress;
  }

  public void setEmailAddress(String emailAddress) {
    this.emailAddress = emailAddress;
  }

  public String getEmailUsername() {
    return emailUsername;
  }

  public void setEmailUsername(String emailUsername) {
    this.emailUsername = emailUsername;
  }

  public String getEmailPassword() {
    return emailPassword;
  }

  public void setEmailPassword(String emailPassword) {
    this.emailPassword = emailPassword;
  }

  public void setRdfStoreAdmin(String rdfStoreAdmin) {
    this.rdfStoreAdmin = rdfStoreAdmin;
  }

  public String getRdfStoreAdmin() {
    return rdfStoreAdmin;
  }

  public void setRdfStoreAdminPassword(String rdfStoreAdminPassword) {
    this.rdfStoreAdminPassword = rdfStoreAdminPassword;
  }

  public String getRdfStoreAdminPassword() {
    return rdfStoreAdminPassword;
  }

  public String getAuthSparqlEndpoint() {
    return authSparqlEndpoint;
  }

  public void setAuthSparqlEndpoint(String authSparqlEndpoint) {
    this.authSparqlEndpoint = authSparqlEndpoint;
  }

  public String getWorkbenchSystemAdmin() {
    return workbenchSystemAdmin;
  }

  public void setWorkbenchSystemAdmin(String workbenchSystemAdmin) {
    this.workbenchSystemAdmin = workbenchSystemAdmin;
  }

  public String getWorkbenchSystemAdminPassword() {
    return workbenchSystemAdminPassword;
  }

  public void setWorkbenchSystemAdminPassword(String workbenchSystemAdminPassword) {
    this.workbenchSystemAdminPassword = workbenchSystemAdminPassword;
  }

  public String getAccountsGraph() {
    return accountsGraph;
  }

  public void setAccountsGraph(String accountsGraph) {
    this.accountsGraph = accountsGraph;
  }

  public String getSettingsGraph() {
    return settingsGraph;
  }

  public void setSettingsGraph(String settingsGraph) {
    this.settingsGraph = settingsGraph;
  }

  public String getResourceNamespace() {
    return resourceNS;
  }

  public void setResourceNamespace(String resourceNamespace) {
    this.resourceNS = resourceNamespace;
  }

  public String getPublicSparqlEndpoint() {
    return publicSparqlEndpoint;
  }

  public void setPublicSparqlEndpoint(String publicSparqlEndpoint) {
    this.publicSparqlEndpoint = publicSparqlEndpoint;
  }

  public String getGroupsGraph() {
    return groupsGraph;
  }

  public void setGroupsGraph(String groupsGraph) {
    this.groupsGraph = groupsGraph;
  }

  public String getVirtuosoJdbcConnString() {
    return virtuosoJdbcConnString;
  }

  public void setVirtuosoJdbcConnString(String virtuosoJdbcConnString) {
    this.virtuosoJdbcConnString = virtuosoJdbcConnString;
  }

  public String getAdminServiceUrl() {
    return this.adminServiceUrl;
  }

  public void setAdminServiceUrl(String adminServiceUrl) {
    this.adminServiceUrl = adminServiceUrl;
  }

  public String getFrameworkUri() {
    return frameworkUri;
  }

  public void setFrameworkUri(String frameworkUri) {
    this.frameworkUri = frameworkUri;
  }

  public String getHomepage() {
    return homepage;
  }

  public void setHomepage(String homepage) {
    this.homepage = homepage;
  }

  public GraphGroupManager getGraphGroupManager() {
    return new VirtuosoGraphGroupManager(virtuosoJdbcConnString, rdfStoreAdmin,
        rdfStoreAdminPassword);
  }

  public String getJobsGraph() {
    return jobsGraph;
  }

  public void setJobsGraph(String jobsGraph) {
    this.jobsGraph = jobsGraph;
  }

  public String getAuthSessionsGraph() {
    return authSessionsGraph;
  }

  public void setAuthSessionsGraph(String authSessionsGraph) {
    this.authSessionsGraph = authSessionsGraph;
  }

  public String getSpringBatchUri() {
    return springBatchUri;
  }

  public void setSpringBatchUri(String springBatchUri) {
    this.springBatchUri = springBatchUri;
  }


  /**
   * Get the directory where to store framework-specific data that is outside the webapps folder,
   * thus, not delete on re-install
   * 
   * @return folder as String
   */
  public String getFrameworkDataDir() {
    return frameworkDataDir;
  }

  /**
   * Set the directory where to store framework-specific data that is outside the webapps folder,
   * thus, not delete on re-install.
   * 
   * @param frameworkDataDir folder string
   * @throws IOException
   */
  public void setFrameworkDataDir(String frameworkDataDir) throws IOException {
    this.frameworkDataDir = Utils.createDir(frameworkDataDir);
  }

  public String getSpringBatchJobsDir() {
    return springBatchJobsDir;
  }

  public void setSpringBatchJobsDir(String springBatchJobsDir) {
    this.springBatchJobsDir = springBatchJobsDir;
  }

  public String getComponentsGraph() {
    return componentsGraph;
  }

  public void setComponentsGraph(String componentsGraph) {
    this.componentsGraph = componentsGraph;
  }

  /**
   * Returns a Jena Model with the framework configuration file loaded
   * 
   * @return Model
   * @throws IOException in case the file cannot be loaded or a parsing error is presented
   */
  public static Model getConfigurationModel() throws IOException {
    // Read configuration
    try {
      if (configurationModel == null) {
        configurationModel = ModelFactory.createDefaultModel();
        configurationModel.read(configurationFile);
      }
    } catch (RiotException e) {
      e.printStackTrace();
      throw new IOException("Couldn't read " + configurationFile + " file: " + e.getMessage());
    }
    return configurationModel;
  }

  /**
   * Returns a Jena Model with the dataset file loaded
   * 
   * @return Model
   * @throws IOException in case the file cannot be loaded or a parsing error is presented
   */
  public static Model getDatasourceModel() throws IOException {
    try {
      if (datasourceModel == null) {
        datasourceModel = ModelFactory.createDefaultModel();
        datasourceModel.read(datasourcesFile);
      }
    } catch (RiotException e) {
      e.printStackTrace();
      throw new IOException("Couldn't read " + datasourcesFile + " file: " + e.getMessage());
    }
    return datasourceModel;
  }

  /**
   * Returns a Jena Model with the components configuration file loaded
   * 
   * @return Model
   * @throws IOException in case the file cannot be loaded or a parsing error is presented
   */
  public static Model getComponentsModel() throws IOException {

    try {
      if (componentsModel == null) {
        componentsModel = ModelFactory.createDefaultModel();
        componentsModel.read(componentsFile);
      }
    } catch (RiotException e) {
      e.printStackTrace();
      throw new IOException("Couldn't read " + componentsFile + " file: " + e.getMessage());
    }

    return componentsModel;
  }

  /**
   * Returns a Jena Model with the users configuration file loaded
   * 
   * @return Model
   * @throws IOException in case the file cannot be loaded or a parsing error is presented
   */
  public static Model getUsersModel() throws IOException {
    try {
      if (usersModel == null) {
        usersModel = ModelFactory.createDefaultModel();
        usersModel.read(usersFile);
      }
    } catch (RiotException e) {
      e.printStackTrace();
      throw new IOException("Couldn't read " + usersFile + " file: " + e.getMessage());
    }
    return usersModel;
  }

  /**
   * Returns a Jena Model with the system graphs configuration file loaded
   * 
   * @return Model
   * @throws IOException in case the file cannot be loaded or a parsing error is presented
   */
  public static Model getSystemGraphsModel() throws IOException {
    try {
      if (sysgraphsModel == null) {
        sysgraphsModel = ModelFactory.createDefaultModel();
        sysgraphsModel.read(sysgraphsFile);
      }
    } catch (RiotException e) {
      e.printStackTrace();
      throw new IOException("Couldn't read " + sysgraphsFile + " file: " + e.getMessage());
    }
    return sysgraphsModel;
  }

}
