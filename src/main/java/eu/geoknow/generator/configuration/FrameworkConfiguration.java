package eu.geoknow.generator.configuration;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Locale;
import java.util.concurrent.locks.ReentrantLock;

import org.apache.jena.riot.RiotException;
import org.apache.log4j.Logger;
import org.glassfish.jersey.internal.l10n.Localizer;

import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.vocabulary.RDFS;
import com.ontos.ldiw.vocabulary.LDIWO;

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
  private String frameworkOntologyNS = "";

  // in this file all main configs are stored
  final static String configurationFile = "framework-configuration.ttl";
  final static String datasetsFile = "framework-datasets.ttl";
  final static String componentsFile = "framework-components.ttl";
  final static String ontologyFile = "framework-ontology.ttl";
  final static String ldisSchemaFile = "ldsi-schema.ttl";
  final static String accountsOntologyFile = "framework-ontology.ttl";

  private static Model configurationModel = null;
  private static Model datasetModel = null;
  private static Model componentsModel = null;
  private static Model ontologyModel = null;
  private static Model ontologyAccountsModel = null;
  private static Model ldisModel = null;

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

  private String componentsGraph = "";
  private String accountsGraph = "";
  private String settingsGraph = "";
  private String jobsGraph = "";
  private String authSessionsGraph = "";
  private String initialSettingsGraph = "";
  private String groupsGraph = "";
  private String frameworkUri;

  private String springBatchUri = "";
  private String springBatchJobsDir = "";
  private String frameworkDataDir = "";
  private File initFile;


  private static FrameworkConfiguration instance;

  private final ReentrantLock dataMappingLock = new ReentrantLock();

  private HashMap<Locale, Localizer> localizers = new HashMap<Locale, Localizer>();

  /**
   * This class provides access to properties form the framework configuration file. And also it
   * loads to Jena Models the other configuration files, so they can be reused in the application.
   * 
   * @param context
   * @return
   * @throws IOException
   * @throws Exception
   */
  public static synchronized FrameworkConfiguration getInstance() throws IOException {

    if (instance == null) {

      instance = new FrameworkConfiguration();

      instance.setFrameworkOntologyNS(LDIWO.NS);

      // get the endpoint URI and endpoint to use for the framework
      // get also the dir to store workbench specific data that should not
      // be delete
      String query =
          "PREFIX lds: <http://stack.linkeddata.org/ldis-schema/> "
              + "PREFIX ontos: <http://ldiw.ontos.com/ontology/> " + "PREFIX rdfs: <"
              + RDFS.getURI() + ">" + " SELECT ?uri ?endpoint ?dir WHERE {"
              + " ?uri rdfs:label ?label . " + " ?uri lds:integrates ?component ."
              + " ?component lds:providesService ?service ."
              + " ?uri ontos:frameworkDataDir ?dir ."
              + " optional { ?service a lds:SPARQLEndPointService ."
              + " ?service lds:serviceUrl ?endpoint . }"
              + " FILTER regex(?label, \"LDWorkbench\", \"i\" )}";

      QueryExecution qexec = QueryExecutionFactory.create(query, getConfigurationModel());
      ResultSet results = qexec.execSelect();
      if (!results.hasNext()) {
        instance = null;
        throw new NullPointerException("Invalid initial parameter required at:\n" + query);
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
      }
      qexec.close();

      log.info("Framework URI: " + instance.getFrameworkUri());
      log.info("Framework endpoint: " + instance.getPublicSparqlEndpoint());
      log.info("Framework ResourceNamespace: " + instance.getResourceNamespace());
      log.info("Framework Ontology: " + instance.getFrameworkOntologyNS());
      log.info("Framework Data Directory: " + instance.getFrameworkDataDir());

      // get the email specific information
      query =
          "PREFIX lds: <http://stack.linkeddata.org/ldis-schema/> "
              + "PREFIX ontos: <http://ldiw.ontos.com/ontology/> "
              + "PREFIX schema: <http://schema.org/> " + "PREFIX rdfs: <" + RDFS.getURI() + ">  "
              + " SELECT ?user ?pass ?mail ?host ?tls ?ssl WHERE {" + " ?uri rdfs:label ?label . "
              + " ?uri lds:integrates ?component ." + " ?component lds:providesService ?service ."
              + " ?service a lds:EmailService ;" + "   lds:password ?pass ;"
              + "   lds:user ?user ;" + "   schema:email ?mail ;" + "   ontos:smtpHost ?host ;"
              + "   ontos:smtpTlsPort ?tls ;" + "   ontos:smtpSslPort ?ssl ."
              + " FILTER regex(?label, \"LDWorkbench\", \"i\" )}";

      qexec = QueryExecutionFactory.create(query, getConfigurationModel());
      results = qexec.execSelect();
      if (!results.hasNext()) {
        instance = null;
        throw new NullPointerException("Invalid initial parameter required at:\n" + query);
      }
      for (; results.hasNext();) {
        QuerySolution soln = results.next();
        instance.setSmtpHost(soln.getLiteral("host").getString());
        instance.setSmtpTLSPort(soln.getLiteral("tls").getString());
        instance.setSmtpSSLPort(soln.getLiteral("ssl").getString());
        instance.setEmailAddress(soln.getLiteral("mail").getString());
        instance.setEmailUsername(soln.getLiteral("user").getString());
        instance.setEmailPassword(soln.getLiteral("pass").getString());
      }
      qexec.close();
      log.info("Read email config for host " + instance.getSmtpHost() + " and account "
          + instance.getEmailUsername());

      // get the endpoint for authenticated users, and user and password
      // of the system framework
      query =
          "PREFIX lds: <http://stack.linkeddata.org/ldis-schema/>"
              + " SELECT ?endpoint ?user ?password WHERE {" + " <" + instance.getFrameworkUri()
              + ">  lds:integrates ?component ." + " ?component lds:providesService ?service ."
              + " ?service a lds:SecuredSPARQLEndPointService ."
              + " ?service lds:serviceUrl ?endpoint ." + " ?service lds:user ?user ."
              + " ?service lds:password ?password }";

      qexec = QueryExecutionFactory.create(query, getConfigurationModel());
      results = qexec.execSelect();
      if (!results.hasNext()) {
        instance = null;
        throw new NullPointerException("Invalid initial parameter required");
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
          "PREFIX lds: <http://stack.linkeddata.org/ldis-schema/> "
              + " PREFIX void: <http://rdfs.org/ns/void#> "
              + " SELECT ?connectionString ?serviceUrl ?user ?password ?endpoint ?graph WHERE {"
              + " <" + instance.getFrameworkUri() + ">  lds:integrates ?component ."
              + " ?component lds:providesService ?service ." + " ?service a lds:StorageService ."
              + " optional {?service lds:connectionString ?connectionString} ."
              + " optional {?service lds:serviceUrl ?serviceUrl .} " + " ?service lds:user ?user ."
              + " ?service lds:password ?password }";
      qexec = QueryExecutionFactory.create(query, getConfigurationModel());
      results = qexec.execSelect();
      if (!results.hasNext()) {
        instance = null;
        throw new NullPointerException("Invalid initial parameter required");
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
          "PREFIX  sd:    <http://www.w3.org/ns/sparql-service-description#> "
              + "PREFIX  rdfs:  <http://www.w3.org/2000/01/rdf-schema#> "
              + "SELECT ?name ?label  "
              + "WHERE "
              + "{ ?s sd:namedGraph  ?o .  ?o sd:name ?name . ?o sd:graph ?g . ?g rdfs:label ?label } ";
      qexec = QueryExecutionFactory.create(query, getConfigurationModel());
      results = qexec.execSelect();
      if (!results.hasNext()) {
        instance = null;
        throw new NullPointerException("Invalid initial parameter required");
      }
      for (; results.hasNext();) {
        QuerySolution soln = results.next();

        if ("settings".equals(soln.get("label").asLiteral().getString()))
          instance.setSettingsGraph(soln.get("name").toString());
        else if ("initialSettings".equals(soln.get("label").asLiteral().getString()))
          instance.setInitialSettingsGraph(soln.get("name").toString());
        else if ("accounts".equals(soln.get("label").asLiteral().getString()))
          instance.setAccountsGraph(soln.get("name").toString());
        else if ("groups".equals(soln.get("label").asLiteral().getString()))
          instance.setGroupsGraph(soln.get("name").toString());
        else if ("jobs".equals(soln.get("label").asLiteral().getString()))
          instance.setJobsGraph(soln.get("name").toString());
        else if ("sessions".equals(soln.get("label").asLiteral().getString()))
          instance.setAuthSessionsGraph(soln.get("name").toString());
      }

      instance.setComponentsGraph(instance.getResourceNamespace() + "system/components");

      qexec.close();

      // get the path to the workflow engine
      query =
          "PREFIX lds: <http://stack.linkeddata.org/ldis-schema/> "
              + "PREFIX ontos:   <http://ldiw.ontos.com/ontology/> " + "PREFIX rdfs: <"
              + RDFS.getURI() + ">" + " SELECT ?endpoint ?dir WHERE {"
              + " ?uri rdfs:label ?label . " + " ?uri lds:integrates ?component ."
              + " ?component lds:providesService ?service ." + " ?service a lds:WorkflowService ; "
              + " ontos:springBatchAdminJobsDir  ?dir ; " + " lds:serviceUrl ?endpoint . "
              + " FILTER regex(?label, \"LDWorkbench\", \"i\" )}";

      qexec = QueryExecutionFactory.create(query, getConfigurationModel());
      results = qexec.execSelect();
      if (!results.hasNext()) {
        instance = null;
        throw new NullPointerException("Invalid initial parameter required at:\n" + query);
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

  public String getInitialSettingsGraph() {
    return initialSettingsGraph;
  }

  public void setInitialSettingsGraph(String initialSettingsGraph) {
    this.initialSettingsGraph = initialSettingsGraph;
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

  public String getFrameworkOntologyNS() {
    return frameworkOntologyNS;
  }

  public void setFrameworkOntologyNS(String frameworkOntologyNS) {
    this.frameworkOntologyNS = frameworkOntologyNS;
  }

  public String getFrameworkUri() {
    return frameworkUri;
  }

  public void setFrameworkUri(String frameworkUri) {
    this.frameworkUri = frameworkUri;
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
  public static Model getDatasetModel() throws IOException {
    try {
      if (datasetModel == null) {
        datasetModel = ModelFactory.createDefaultModel();
        datasetModel.read(datasetsFile);
      }
    } catch (RiotException e) {
      e.printStackTrace();
      throw new IOException("Couldn't read " + datasetsFile + " file: " + e.getMessage());
    }
    return datasetModel;
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
   * Returns a Jena Model with the framework ontology file loaded
   * 
   * @return Model
   * @throws IOException in case the file cannot be loaded or a parsing error is presented
   */
  public static Model getOntologyModel() throws IOException {

    try {
      if (ontologyModel == null) {
        ontologyModel = ModelFactory.createDefaultModel();
        ontologyModel.read(ontologyFile);
      }
    } catch (RiotException e) {
      e.printStackTrace();
      throw new IOException("Couldn't read " + ontologyFile + " file: " + e.getMessage());
    }
    return ontologyModel;
  }

  /**
   * Returns a Jena Model with the accoutns ontology file loaded
   * 
   * @return Model
   * @throws IOException in case the file cannot be loaded or a parsing error is presented
   */
  public static Model getOntologyAccountsModel() throws IOException {

    try {
      if (ontologyAccountsModel == null) {
        ontologyAccountsModel = ModelFactory.createDefaultModel();
        ontologyAccountsModel.read(accountsOntologyFile);
      }
    } catch (RiotException e) {
      e.printStackTrace();
      throw new IOException("Couldn't read " + accountsOntologyFile + " file: " + e.getMessage());
    }

    return ontologyAccountsModel;
  }

  /**
   * Returns a Jena Model with the Linked Data Integration Schema file loaded
   * 
   * @return Model
   * @throws IOException in case the file cannot be loaded or a parsing error is presented
   */
  public static Model getLdisModel() throws IOException {
    try {
      if (ldisModel == null) {
        ldisModel = ModelFactory.createDefaultModel();
        ldisModel.read(ldisSchemaFile);
      }
    } catch (RiotException e) {
      e.printStackTrace();
      throw new IOException("Couldn't read " + ldisSchemaFile + " file: " + e.getMessage());
    }

    return ldisModel;
  }

}
