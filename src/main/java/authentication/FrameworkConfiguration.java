package authentication;

import java.io.IOException;
import java.util.HashMap;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

import javax.servlet.ServletContext;

import org.apache.jena.riot.RiotException;
import org.apache.log4j.Logger;

import rdf.SecureRdfStoreManagerImpl;
import util.EmailSender;
import util.Localizer;
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
import com.hp.hpl.jena.vocabulary.RDFS;
import com.ontos.ldiw.vocabulary.LDIWO;

public class FrameworkConfiguration {

    private static final Logger log = Logger
	    .getLogger(FrameworkConfiguration.class);

    // email registration notifications
    private String smtpHost = "";
    private String smtpTLSPort = "587";
    private String smtpSSLPort = "465";
    private String emailAddress = "";
    private String emailUsername = "";
    private String emailPassword = "";

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
    private String frameworkUri;

    private static FrameworkConfiguration instance;

    private HashMap<Locale, Localizer> localizers = new HashMap<Locale, Localizer>();

    /**
     * 
     * @param context
     * @return
     * @throws IOException
     * @throws Exception
     */
    public static synchronized FrameworkConfiguration getInstance(
	    ServletContext context) throws IOException {

	if (instance == null) {

	    instance = new FrameworkConfiguration();

	    String configurationFile = "framework-configuration.ttl";

	    instance.setFrameworkOntologyNS(LDIWO.NS);

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
		throw new IOException("Malformed " + configurationFile
			+ " file");
	    }
	    // get the endpoint URI and endpoint to use for the framework
	    String query = "PREFIX lds: <http://stack.linkeddata.org/ldis-schema/> "
		    + "PREFIX rdfs: <"
		    + RDFS.getURI()
		    + ">"
		    + " SELECT ?uri ?endpoint WHERE {"
		    + " ?uri rdfs:label ?label . "
		    + " ?uri lds:integrates ?component ."
		    + " ?component lds:providesService ?service ."
		    + " ?service a lds:SPARQLEndPointService ."
		    + " ?service lds:serviceUrl ?endpoint ."
		    + " FILTER regex(?label, \"LDWorkbench\", \"i\" )}";

	    QueryExecution qexec = QueryExecutionFactory.create(query,
		    configurationModel);
	    ResultSet results = qexec.execSelect();
	    if (!results.hasNext())
		throw new NullPointerException(
			"Invalid initial parameter required at:" + query);
	    for (; results.hasNext();) {
		QuerySolution soln = results.next();
		instance.setFrameworkUri(soln.get("uri").toString());
		instance.setPublicSparqlEndpoint(soln.get("endpoint")
			.toString());
		instance.setResourceNamespace(instance
			.getFrameworkUri()
			.substring(0,
				instance.getFrameworkUri().lastIndexOf("/") + 1));
	    }
	    qexec.close();

	    log.info("Framework URI:" + instance.getFrameworkUri());
	    log.info("Framework endpoint:" + instance.getPublicSparqlEndpoint());
	    log.info("Framework ResourceNamespace:"
		    + instance.getResourceNamespace());
	    log.info("Framework Ontology:" + instance.getFrameworkOntologyNS());
	    // get the endpoint for authenticated users, and user and password
	    // of the system framework
	    query = "PREFIX lds: <http://stack.linkeddata.org/ldis-schema/>"
		    + " SELECT ?endpoint ?user ?password WHERE {" + " <"
		    + instance.getFrameworkUri()
		    + ">  lds:integrates ?component ."
		    + " ?component lds:providesService ?service ."
		    + " ?service a lds:SecuredSPARQLEndPointService ."
		    + " ?service lds:serviceUrl ?endpoint ."
		    + " ?service lds:user ?user ."
		    + " ?service lds:password ?password }";

	    qexec = QueryExecutionFactory.create(query, configurationModel);
	    results = qexec.execSelect();
	    if (!results.hasNext())
		throw new NullPointerException(
			"Invalid initial parameter required");
	    for (; results.hasNext();) {
		QuerySolution soln = results.next();
		instance.setAuthSparqlEndpoint(soln.get("endpoint").toString());
		instance.setAuthSparqlUser(soln.get("user").asLiteral()
			.getString());
		instance.setAuthSparqlPassword(soln.get("password").asLiteral()
			.getString());
	    }
	    qexec.close();

	    // get and set the database configuration (Virtuoso)
	    query = "PREFIX lds: <http://stack.linkeddata.org/ldis-schema/>"
		    + " SELECT ?connectionString ?user ?password WHERE {"
		    + " <" + instance.getFrameworkUri()
		    + ">  lds:integrates ?component ."
		    + " ?component lds:providesService ?service ."
		    + " ?service a lds:StorageService ."
		    + " ?service lds:connectionString ?connectionString ."
		    + " ?service lds:user ?user ."
		    + " ?service lds:password ?password }";
	    qexec = QueryExecutionFactory.create(query, configurationModel);
	    results = qexec.execSelect();
	    if (!results.hasNext())
		throw new NullPointerException(
			"Invalid initial parameter required");
	    for (; results.hasNext();) {
		QuerySolution soln = results.next();
		instance.setVirtuosoJdbcConnString(soln.get("connectionString")
			.asLiteral().getString());
		instance.setVirtuosoDbaUser(soln.get("user").asLiteral()
			.getString());
		instance.setVirtuosoDbaPassword(soln.get("password")
			.asLiteral().getString());
	    }
	    qexec.close();

	    // get and set the system named graphs
	    query = "PREFIX  sd:    <http://www.w3.org/ns/sparql-service-description#> "
		    + "PREFIX  rdfs:  <http://www.w3.org/2000/01/rdf-schema#> "
		    + "SELECT ?name ?label  "
		    + "WHERE "
		    + "{ ?s sd:namedGraph  ?o .  ?o sd:name ?name . ?o sd:graph ?g . ?g rdfs:label ?label } ";
	    qexec = QueryExecutionFactory.create(query, configurationModel);
	    results = qexec.execSelect();
	    if (!results.hasNext())
		throw new NullPointerException(
			"Invalid initial parameter required");
	    for (; results.hasNext();) {
		QuerySolution soln = results.next();

		if ("settings"
			.equals(soln.get("label").asLiteral().getString()))
		    instance.setSettingsGraph(soln.get("name").toString());
		else if ("initialSettings".equals(soln.get("label").asLiteral()
			.getString()))
		    instance.setInitialSettingsGraph(soln.get("name")
			    .toString());
		else if ("accounts".equals(soln.get("label").asLiteral()
			.getString()))
		    instance.setAccountsGraph(soln.get("name").toString());
		else if ("groups".equals(soln.get("label").asLiteral()
			.getString()))
		    instance.setGroupsGraph(soln.get("name").toString());
	    }
	    qexec.close();
	}

	return instance;
    }

    public FrameworkUserManager getFrameworkUserManager() {
	return new FrameworkUserManager(new VirtuosoUserManager(
		this.virtuosoJdbcConnString, this.virtuosoDbaUser,
		this.virtuosoDbaPassword), new SecureRdfStoreManagerImpl(
		this.authSparqlEndpoint, this.AuthSparqlUser,
		this.AuthSparqlPassword), instance);
    }

    public VirtuosoUserManager getVirtuosoUserManager() {
	return new VirtuosoUserManager(this.virtuosoJdbcConnString,
		this.virtuosoDbaUser, this.virtuosoDbaPassword);
    }

    public EmailSender getDefaultEmailSender() {
	return getTLSEmailSender();
    }

    public EmailSender getTLSEmailSender() {
	return new TLSEmailSender(this.smtpHost, this.smtpTLSPort,
		this.emailAddress, this.emailUsername, this.emailPassword);
    }

    public EmailSender getSSLEmailSender() {
	return new SSLEmailSender(this.smtpHost, this.smtpSSLPort,
		this.emailAddress, this.emailUsername, this.emailPassword);
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

    public String getFrameworkUri() {
	return frameworkUri;
    }

    public void setFrameworkUri(String frameworkUri) {
	this.frameworkUri = frameworkUri;
    }

    public Localizer getLocalizer(Locale locale) {
	Localizer localizer = localizers.get(locale);
	if (localizer == null) {
	    try {
		final ResourceBundle bundle = ResourceBundle.getBundle(
			"locale/generator", locale);
		localizer = new Localizer() {
		    @Override
		    public String localize(String str) {
			try {
			    return bundle.getString(str);
			} catch (Exception e) {
			    return str;
			}
		    }
		};
	    } catch (MissingResourceException e) {
		localizer = new Localizer() {
		    public String localize(String str) {
			return str;
		    }
		};
	    }
	    localizers.put(locale, localizer);
	}
	return localizer;
    }
}
