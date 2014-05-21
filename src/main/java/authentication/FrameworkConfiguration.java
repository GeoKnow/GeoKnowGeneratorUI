package authentication;

import accounts.FrameworkUserManager;
import accounts.VirtuosoUserManager;
import rdf.SecureRdfStoreManagerImpl;
import util.EmailSender;
import util.SSLEmailSender;
import util.TLSEmailSender;

public class FrameworkConfiguration {
    //virtuoso jdbc
    private String virtuosoJdbcConnString = "jdbc:virtuoso://localhost:1111";
    private String virtuosoDbaUser = "dba";
    private String virtuosoDbaPassword = "dba";

    //virtuoso sparql
    private String sparqlEndpoint = "http://localhost:8890/sparql-auth";
    private String publicSparqlEndpoint = "http://localhost:8890/sparql";
    private String sparqlFrameworkLogin = "generator";
    private String sparqlFrameworkPassword = "generator";

    //system graphs
    private String accountsGraph = "http://generator.geoknow.eu/accounts/accountsGraph";
    private String defaultSettingsGraph = "http://generator.geoknow.eu/resource/settingsGraph"; //settings for unauthorized users
    private String initialSettingsGraph = "http://generator.geoknow.eu/resource/initialSettingsGraph"; //initial setting for new users
    private String groupsGraph = "http://generator.geoknow.eu/resource/graphGroups";

    //namespaces
    private String accountsNamespace = "http://generator.geoknow.eu/accounts/";
    private String accountsOntologyNamespace = "http://generator.geoknow.eu/accounts/ontology/";
    private String resourceNamespace = "http://generator.geoknow.eu/resource/";

    //email
	private String smtpHost		= "smtp-relay.gmail.com";
	private String smtpTLSPort	= "587";
	private String smtpSSLPort	= "465";
    //set this parameters before run
	private String emailAddress	= "do_not_reply@acc.ontos.com";
    private String emailUsername = "";
    private String emailPassword = "";

    private static FrameworkConfiguration instance;

    public static synchronized FrameworkConfiguration getInstance() {
        if (instance==null)
            instance = new FrameworkConfiguration();
        return instance;
    }

    public String getVirtuosoJdbcConnString() {
        return virtuosoJdbcConnString;
    }

    public String getVirtuosoDbaUser() {
        return virtuosoDbaUser;
    }

    public String getVirtuosoDbaPassword() {
        return virtuosoDbaPassword;
    }

    public String getSparqlEndpoint() {
        return sparqlEndpoint;
    }

    public String getSparqlFrameworkLogin() {
        return sparqlFrameworkLogin;
    }

    public String getSparqlFrameworkPassword() {
        return sparqlFrameworkPassword;
    }

    public String getAccountsNamespace() {
        return accountsNamespace;
    }

    public String getAccountsOntologyNamespace() {
        return accountsOntologyNamespace;
    }

    public String getAccountsGraph() {
        return accountsGraph;
    }

    public String getDefaultSettingsGraph() {
        return defaultSettingsGraph;
    }

    public String getInitialSettingsGraph() {
        return initialSettingsGraph;
    }

    public String getResourceNamespace() {
        return resourceNamespace;
    }

    public String getPublicSparqlEndpoint() {
        return publicSparqlEndpoint;
    }

    public String getGroupsGraph() {
        return groupsGraph;
    }

    public FrameworkUserManager getFrameworkUserManager() {
        return new FrameworkUserManager(new VirtuosoUserManager(getVirtuosoJdbcConnString(), getVirtuosoDbaUser(), getVirtuosoDbaPassword()),
                new SecureRdfStoreManagerImpl(getSparqlEndpoint(), getSparqlFrameworkLogin(), getSparqlFrameworkPassword()));
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
}
