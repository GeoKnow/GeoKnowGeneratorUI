package authentication;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.servlet.ServletContext;

import org.apache.jena.riot.RiotException;

import rdf.SecureRdfStoreManagerImpl;
import util.EmailSender;
import util.SSLEmailSender;
import util.TLSEmailSender;
import accounts.FrameworkUserManager;
import accounts.VirtuosoUserManager;

import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;

public class FrameworkConfiguration {

  // email registration notifications
  private String smtpHost = "";
  private String smtpTLSPort = "587";
  private String smtpSSLPort = "465";
  private String emailAddress = "";
  private String emailUsername = "";
  private String emailPassword = "";

  private String accountsOntologyNS = "";
  private String resourceNS = "";
  private String frameworkOntologyNS = "";

  private String virtuosoJdbcConnString = "";
  private String virtuosoDbaUser = "";
  private String virtuosoDbaPassword = "";

  private String publicSparqlEndpoint = "";
  private String authSparqlEndpoint = "";
  private String AuthSparqlUser = "";
  private String AuthSparqlPassword = "";

  private String accountsGraph = "";
  private String settingsGraph = "";
  private String initialSettingsGraph = "";
  private String groupsGraph = "";

  private static FrameworkConfiguration instance;

  /**
   * 
   * @param context
   * @param reset
   * @return
   * @throws Exception
   */
  // TODO: replace System.out.println with a logging implementation
  public static synchronized FrameworkConfiguration getInstance(ServletContext context,
      boolean reset) throws Exception {

    if (instance == null) {

      System.out.println("[INFO] System Initialization ");

      instance = new FrameworkConfiguration();

      String configurationFile = "framework-configuration.ttl";
      String datasetsFile = "framework-datasets.ttl";
      String componentsFile = "framework-components.ttl";
      String ontologyFile = "framework-ontology.ttl";
      String accountsOntologyFile = "framework-accounts-ontology.ttl";

      // initialize parameters from context
      String frameworkUri = context.getInitParameter("framework-uri");

      instance.setFrameworkOntologyNS(context.getInitParameter("framework-ontology-ns"));
      instance.setAccountsOntologyNamespace(context.getInitParameter("accounts-ns"));
      instance.setResourceNamespace(context.getInitParameter("framework-ns"));

      instance.setSmtpHost(context.getInitParameter("smtp-host"));
      instance.setSmtpTLSPort(context.getInitParameter("smpt-tls-port"));
      instance.setSmtpSSLPort(context.getInitParameter("smtp-ssl-port"));
      instance.setEmailAddress(context.getInitParameter("email"));
      instance.setEmailUsername(context.getInitParameter("user-name"));
      instance.setEmailPassword(context.getInitParameter("password"));

      Model configurationModel = ModelFactory.createDefaultModel();

      // read configuration files
      try {
        configurationModel.read(configurationFile);
      } catch (RiotException e) {
        throw new IOException("Malformed " + configurationFile + " file");
      }
      // get and set the properties framework configuration (endpoints and
      // credentials)
      String query = "PREFIX lds: <http://stack.linkeddata.org/ldis-schema/> "
          + " SELECT ?endpoint WHERE {" + " <" + frameworkUri + ">  lds:integrates ?component ."
          + " ?component lds:providesService ?service ."
          + " ?service a lds:SPARQLEndPointService ." + " ?service lds:serviceUrl ?endpoint  }";

      QueryExecution qexec = QueryExecutionFactory.create(query, configurationModel);
      ResultSet results = qexec.execSelect();
      if (!results.hasNext())
        throw new NullPointerException("Invalid initial parameter required at:" + query);
      for (; results.hasNext();) {
        QuerySolution soln = results.next();
        instance.setPublicSparqlEndpoint(soln.get("endpoint").toString());
      }
      qexec.close();

      query = "PREFIX lds: <http://stack.linkeddata.org/ldis-schema/>"
          + " SELECT ?endpoint ?user ?password WHERE {" + " <" + frameworkUri
          + ">  lds:integrates ?component ." + " ?component lds:providesService ?service ."
          + " ?service a lds:SecuredSPARQLEndPointService ."
          + " ?service lds:serviceUrl ?endpoint ." + " ?service lds:user ?user ."
          + " ?service lds:password ?password }";

      qexec = QueryExecutionFactory.create(query, configurationModel);
      results = qexec.execSelect();
      if (!results.hasNext())
        throw new NullPointerException("Invalid initial parameter required");
      for (; results.hasNext();) {
        QuerySolution soln = results.next();
        instance.setAuthSparqlEndpoint(soln.get("endpoint").toString());
        instance.setAuthSparqlUser(soln.get("user").asLiteral().getString());
        instance.setAuthSparqlPassword(soln.get("password").asLiteral().getString());
      }
      qexec.close();

      // get and set the database configuration (Virtuoso)
      query = "PREFIX lds: <http://stack.linkeddata.org/ldis-schema/>"
          + " SELECT ?connectionString ?user ?password WHERE {" + " <" + frameworkUri
          + ">  lds:integrates ?component ." + " ?component lds:providesService ?service ."
          + " ?service a lds:StorageService ."
          + " ?service lds:connectionString ?connectionString ." + " ?service lds:user ?user ."
          + " ?service lds:password ?password }";
      qexec = QueryExecutionFactory.create(query, configurationModel);
      results = qexec.execSelect();
      if (!results.hasNext())
        throw new NullPointerException("Invalid initial parameter required");
      for (; results.hasNext();) {
        QuerySolution soln = results.next();
        instance.setVirtuosoJdbcConnString(soln.get("connectionString").asLiteral().getString());
        instance.setVirtuosoDbaUser(soln.get("user").asLiteral().getString());
        instance.setVirtuosoDbaPassword(soln.get("password").asLiteral().getString());
      }
      qexec.close();

      // get and set the named graphs
      query = "PREFIX  sd:    <http://www.w3.org/ns/sparql-service-description#> "
          + "PREFIX  rdfs:  <http://www.w3.org/2000/01/rdf-schema#> " + "SELECT ?name ?label  "
          + "WHERE "
          + "{ ?s sd:namedGraph  ?o .  ?o sd:name ?name . ?o sd:graph ?g . ?g rdfs:label ?label } ";

      qexec = QueryExecutionFactory.create(query, configurationModel);
      results = qexec.execSelect();
      if (!results.hasNext())
        throw new NullPointerException("Invalid initial parameter required");
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
      }
      qexec.close();

      // creates the system user exist for the application in virtuoso
      VirtuosoUserManager userManager = instance.getVirtuosoUserManager();

      // if the flag to reinstall is true
      if (reset) {
        try {
          userManager.dropUser(instance.getAuthSparqlUser());
        } catch (Exception e) {
          // catches the error in case the user do not exist
        }
        // TODO: we may need to delete all users before to clean the store?
      }

      try {

        userManager.createUser(instance.getAuthSparqlUser(), instance.getAuthSparqlPassword());
        userManager.setDefaultRdfPermissions(instance.getAuthSparqlUser(), 3);
        userManager.grantRole(instance.getAuthSparqlUser(), "SPARQL_UPDATE");
        userManager.grantRole("SPARQL", "SPARQL_UPDATE");

        System.out.println("[INFO] System User was created ");
      } catch (Exception e) {
        if ("virtuoso.jdbc4.VirtuosoException".equals(e.getClass().getCanonicalName()))
          // TODO: replace with a logging implementation
          System.out.println("Seems that the user is already there");
        else
          throw e;
      }

      SecureRdfStoreManagerImpl frameworkRdfStoreManager = new SecureRdfStoreManagerImpl(instance
          .getAuthSparqlEndpoint(), instance.getAuthSparqlUser(), instance.getAuthSparqlPassword());
      // delete all graphs if reinstall is requested
      if (reset) {
        try {
          frameworkRdfStoreManager.dropGraph(instance.getSettingsGraph());
          frameworkRdfStoreManager.dropGraph(instance.getAccountsGraph());
          frameworkRdfStoreManager.dropGraph(instance.getGroupsGraph());
          frameworkRdfStoreManager.dropGraph(instance.getInitialSettingsGraph());
        } catch (Exception e) {
        }
      }

      // check if settingsGraph exist do not overwrite
      String queryString = " ASK { GRAPH <" + instance.getSettingsGraph() + "> {?s a ?o} }";
      String response = frameworkRdfStoreManager.execute(queryString, "text/plain");
      if (response.toLowerCase().indexOf("true") < 0) {

        // TODO: replace with a logging implementation
        System.out.println("[INFO] Default Graphs creation/configuration ");

        // Read configuration files
        Model datrasetModel = ModelFactory.createDefaultModel();
        Model componentsModel = ModelFactory.createDefaultModel();
        Model ontologyModel = ModelFactory.createDefaultModel();
        Model ontologyAccountsModel = ModelFactory.createDefaultModel();

        try {
          datrasetModel.read(datasetsFile);
          componentsModel.read(componentsFile);
          ontologyModel.read(ontologyFile);
          ontologyAccountsModel.read(accountsOntologyFile);
        } catch (RiotException e) {
          throw new IOException("Malformed configuration files");
        }

        // create required named graphs and load the configuration files
        // using framework default user
        frameworkRdfStoreManager.createGraph(instance.getSettingsGraph());
        frameworkRdfStoreManager.createGraph(instance.getAccountsGraph());
        frameworkRdfStoreManager.createGraph(instance.getGroupsGraph());
        frameworkRdfStoreManager.createGraph(instance.getInitialSettingsGraph());

        // Make graphs accessible to framework user only
        userManager.setDefaultRdfPermissions("nobody", 0);
        userManager.setRdfGraphPermissions(instance.getAuthSparqlUser(), instance
            .getSettingsGraph(), 3);
        userManager.setRdfGraphPermissions(instance.getAuthSparqlUser(), instance
            .getAccountsGraph(), 3);
        userManager.setRdfGraphPermissions(instance.getAuthSparqlUser(), instance.getGroupsGraph(),
            3);
        userManager.setRdfGraphPermissions(instance.getAuthSparqlUser(), instance
            .getInitialSettingsGraph(), 3);

        Model settingsModel = ModelFactory.createDefaultModel();
        settingsModel.add(datrasetModel);
        settingsModel.add(componentsModel);
        settingsModel.add(ontologyModel);
        // write the initial settings model (default settings for new
        // users)
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        settingsModel.write(os, "N-TRIPLES");
        queryString = "INSERT DATA { GRAPH <" + instance.getInitialSettingsGraph() + "> { "
            + os.toString() + " } }";
        os.close();
        frameworkRdfStoreManager.execute(queryString, null);

        // write the system settings model (include system graphs data)
        // settingsModel.add(graphsModel);
        os = new ByteArrayOutputStream();
        settingsModel.write(os, "N-TRIPLES");
        queryString = "INSERT DATA { GRAPH <" + instance.getSettingsGraph() + "> { "
            + os.toString() + " } }";
        os.close();
        frameworkRdfStoreManager.execute(queryString, null);

        // create and add accounts ontology to the accounts graph
        os = new ByteArrayOutputStream();
        ontologyAccountsModel.write(os, "N-TRIPLES");
        queryString = "INSERT DATA { GRAPH <" + instance.getAccountsGraph() + "> { "
            + os.toString() + " } }";
        os.close();
        frameworkRdfStoreManager.execute(queryString, null);
      }
    }

    return instance;
  }

  public FrameworkUserManager getFrameworkUserManager() {
    return new FrameworkUserManager(new VirtuosoUserManager(this.virtuosoJdbcConnString,
        this.virtuosoDbaUser, this.virtuosoDbaPassword), new SecureRdfStoreManagerImpl(
        this.authSparqlEndpoint, this.AuthSparqlUser, this.AuthSparqlPassword), instance);
  }

  public VirtuosoUserManager getVirtuosoUserManager() {
    return new VirtuosoUserManager(this.virtuosoJdbcConnString, this.virtuosoDbaUser,
        this.virtuosoDbaPassword);
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

  public String getVirtuosoDbaUser() {
    return virtuosoDbaUser;
  }

  public void setVirtuosoDbaUser(String virtuosoDbaUser) {
    this.virtuosoDbaUser = virtuosoDbaUser;
  }

  public String getVirtuosoDbaPassword() {
    return virtuosoDbaPassword;
  }

  public void setVirtuosoDbaPassword(String virtuosoDbaPassword) {
    this.virtuosoDbaPassword = virtuosoDbaPassword;
  }

  public String getAuthSparqlEndpoint() {
    return authSparqlEndpoint;
  }

  public void setAuthSparqlEndpoint(String authSparqlEndpoint) {
    this.authSparqlEndpoint = authSparqlEndpoint;
  }

  public String getAuthSparqlUser() {
    return AuthSparqlUser;
  }

  public void setAuthSparqlUser(String authSparqlUser) {
    this.AuthSparqlUser = authSparqlUser;
  }

  public String getAuthSparqlPassword() {
    return AuthSparqlPassword;
  }

  public void setAuthSparqlPassword(String authSparqlPassword) {
    this.AuthSparqlPassword = authSparqlPassword;
  }

  // public String getAccountsNamespace() {
  // return accountsNamespace;
  // }
  //
  // public void setAccountsNamespace(String accountsNamespace) {
  // this.accountsNamespace = accountsNamespace;
  // }

  public String getAccountsOntologyNamespace() {
    return accountsOntologyNS;
  }

  public void setAccountsOntologyNamespace(String accountsNamespace) {
    this.accountsOntologyNS = accountsNamespace;
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

  public String getFrameworkOntologyNS() {
    return frameworkOntologyNS;
  }

  public void setFrameworkOntologyNS(String frameworkOntologyNS) {
    this.frameworkOntologyNS = frameworkOntologyNS;
  }
}
