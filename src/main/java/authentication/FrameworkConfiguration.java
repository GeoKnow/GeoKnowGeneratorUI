package authentication;

import javax.servlet.ServletContext;

import accounts.FrameworkUserManager;
import accounts.VirtuosoUserManager;
import rdf.SecureRdfStoreManagerImpl;
import util.EmailSender;
import util.SSLEmailSender;
import util.TLSEmailSender;

public class FrameworkConfiguration {
	//virtuoso jdbc
	// private String virtuosoJdbcConnString = "jdbc:virtuoso://localhost:1111";
	// private String virtuosoDbaUser = "dba";
	// private String virtuosoDbaPassword = "dba";

	//virtuoso sparql
	// private String sparqlEndpoint = "http://localhost:8890/sparql-auth";
	// private String publicSparqlEndpoint = "http://localhost:8890/sparql";
	// private String sparqlFrameworkLogin = "generator";
	// private String sparqlFrameworkPassword = "generator";

	// //system graphs
	// private String accountsGraph = "http://generator.geoknow.eu/accounts/accountsGraph";
	// private String defaultSettingsGraph = "http://generator.geoknow.eu/resource/settingsGraph"; //settings for unauthorized users
	// private String initialSettingsGraph = "http://generator.geoknow.eu/resource/initialSettingsGraph"; //initial setting for new users
	// private String groupsGraph = "http://generator.geoknow.eu/resource/graphGroups";

	// //namespaces
	// private String accountsNamespace = "http://generator.geoknow.eu/accounts/";
	// private String accountsOntologyNamespace = "http://generator.geoknow.eu/accounts/ontology/";
	// private String resourceNamespace = "http://generator.geoknow.eu/resource/";


	//email
	private String smtpHost = "smtp.gmail.com";
	private String smtpTLSPort = "587";
	private String smtpSSLPort = "465";
	//set this parameters before run
	private String emailAddress = "";
	private String emailUsername = "";
	private String emailPassword = "";

	private String virtuosoDbaUser = "";
	private String virtuosoDbaPassword = "";
	private String authSparqlEndpoint = "";
	private String sparqlFrameworkLogin = "";
	private String sparqlFrameworkPassword = "";
	private String accountsNamespace = "";
	private String accountsOntologyNamespace = "";
	private String accountsGraph = "";
	private String defaultSettingsGraph = "";
	private String initialSettingsGraph = "";
	private String resourceNamespace = "";
	private String publicSparqlEndpoint = "";
	private String groupsGraph = "";
	private String virtuosoJdbcConnString = "";

	private static FrameworkConfiguration instance;

	public static synchronized FrameworkConfiguration getInstance(ServletContext context) {
		if (instance==null){
			instance = new FrameworkConfiguration();
		
			instance.setVirtuosoJdbcConnString(context.getInitParameter("jdbc-virtuoso-conn-string"));            
			instance.setVirtuosoDbaUser(context.getInitParameter("virtuoso-dba-user")); 
			instance.setVirtuosoDbaPassword(context.getInitParameter("virtuoso-dba-password")); 
			instance.setAuthSparqlEndpoint(context.getInitParameter("sparql-auth-endpoint"));
			instance.setSparqlFrameworkLogin(context.getInitParameter("framework-user"));
			instance.setSparqlFrameworkPassword(context.getInitParameter("framework-password"));
			instance.setAccountsNamespace(context.getInitParameter("users-accounts-ns"));
			instance.setAccountsOntologyNamespace(context.getInitParameter("users-accounts-ontology"));
			instance.setAccountsGraph(context.getInitParameter("users-accounts-graph"));
			instance.setDefaultSettingsGraph(context.getInitParameter("guest-settings-graph"));
			instance.setInitialSettingsGraph(context.getInitParameter("new-user-settings"));
			instance.setResourceNamespace(context.getInitParameter("framework-ns"));
			instance.setPublicSparqlEndpoint(context.getInitParameter("sparql-public-endpoint"));
			instance.setGroupsGraph(context.getInitParameter("groups-graph"));
		}
		return instance;
	}

	
	public FrameworkUserManager getFrameworkUserManager() {
		return new FrameworkUserManager(new VirtuosoUserManager(getVirtuosoJdbcConnString(), getVirtuosoDbaUser(), getVirtuosoDbaPassword()),
				new SecureRdfStoreManagerImpl(getAuthSparqlEndpoint(), getSparqlFrameworkLogin(), getSparqlFrameworkPassword()), instance);
	}

	public VirtuosoUserManager getVirtuosoUserManager() {
		return new VirtuosoUserManager(getVirtuosoJdbcConnString(), getVirtuosoDbaUser(), getVirtuosoDbaPassword());
	}

	public EmailSender getDefaultEmailSender() {
		return getTLSEmailSender();
	}

	public EmailSender getTLSEmailSender() {
		return new TLSEmailSender(smtpHost, smtpTLSPort, emailAddress, emailUsername, emailPassword);
	}

	public EmailSender getSSLEmailSender() {
		return new SSLEmailSender(smtpHost, smtpSSLPort, emailAddress, emailUsername, emailPassword);
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

	public String getSparqlFrameworkLogin() {
		return sparqlFrameworkLogin;
	}

	public void setSparqlFrameworkLogin(String sparqlFrameworkLogin) {
		this.sparqlFrameworkLogin = sparqlFrameworkLogin;
	}

	public String getSparqlFrameworkPassword() {
		return sparqlFrameworkPassword;
	}

	public void setSparqlFrameworkPassword(String sparqlFrameworkPassword) {
		this.sparqlFrameworkPassword = sparqlFrameworkPassword;
	}

	public String getAccountsNamespace() {
		return accountsNamespace;
	}

	public void setAccountsNamespace(String accountsNamespace) {
		this.accountsNamespace = accountsNamespace;
	}

	public String getAccountsOntologyNamespace() {
		return accountsOntologyNamespace;
	}

	public void setAccountsOntologyNamespace(String accountsOntologyNamespace) {
		this.accountsOntologyNamespace = accountsOntologyNamespace;
	}

	public String getAccountsGraph() {
		return accountsGraph;
	}

	public void setAccountsGraph(String accountsGraph) {
		this.accountsGraph = accountsGraph;
	}

	public String getDefaultSettingsGraph() {
		return defaultSettingsGraph;
	}

	public void setDefaultSettingsGraph(String defaultSettingsGraph) {
		this.defaultSettingsGraph = defaultSettingsGraph;
	}

	public String getInitialSettingsGraph() {
		return initialSettingsGraph;
	}

	public void setInitialSettingsGraph(String initialSettingsGraph) {
		this.initialSettingsGraph = initialSettingsGraph;
	}

	public String getResourceNamespace() {
		return resourceNamespace;
	}

	public void setResourceNamespace(String resourceNamespace) {
		this.resourceNamespace = resourceNamespace;
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
}
