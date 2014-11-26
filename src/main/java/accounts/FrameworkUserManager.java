package accounts;

import java.io.IOException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

import javax.ws.rs.core.Cookie;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.util.ISO8601Utils;

import rdf.RdfStoreManager;
import rdf.SecureRdfStoreManagerImpl;
import util.ObjectPair;
import util.RandomStringGenerator;
import authentication.FrameworkConfiguration;

import com.google.gson.Gson;

// TODO: make methods synchronized?
public class FrameworkUserManager implements UserManager {

    private static final Logger log = Logger.getLogger(FrameworkUserManager.class);

    private static final String jsonResponseFormat = "application/sparql-results+json";

    private String prefixes = null;
    private UserManager rdfStoreUserManager;
    private RdfStoreManager rdfStoreManager;
    private FrameworkConfiguration frameworkConfig;

    // private FrameworkConfiguration frameworkConfig =
    // FrameworkConfiguration.getInstance();

    public FrameworkUserManager(UserManager rdfStoreUserManager, RdfStoreManager rdfStoreManager,
            FrameworkConfiguration frameworkConfig) {
        this.rdfStoreUserManager = rdfStoreUserManager;
        this.rdfStoreManager = rdfStoreManager;
        this.frameworkConfig = frameworkConfig;
    }

    public void createUser(String name, String password, String email) throws Exception {
        if (name == null || name.isEmpty())
            throw new IllegalArgumentException("name cannon be null or empty");
        if (password == null || password.isEmpty())
            throw new IllegalArgumentException("password  cannon be null or empty");
        if (email == null || email.isEmpty())
            throw new IllegalArgumentException("email cannon be null or empty");

        if (checkUserExists(name, email))
            throw new Exception("User already exists");

        // try to create Virtuoso user
        RandomStringGenerator randomStringGenerator = new RandomStringGenerator();
        String rdfStoreUser = name;
        String rdfStorePassword = randomStringGenerator.generateSimple(8);
        // change rdf store user name if already exists
        int counter = 0;
        while (rdfStoreUserManager.checkUserExists(rdfStoreUser, null)) {
            if (counter >= 10)
                throw new Exception("Failed to create Virtuoso user: already exists");
            rdfStoreUser = name + randomStringGenerator.generateSimple(5);
            counter++;
        }
        rdfStoreUserManager.createUser(rdfStoreUser, rdfStorePassword);
        // grant SPARQL_UPDATE role to created Virtuoso user
        // TODO: users with only read access?
        rdfStoreUserManager.grantRole(rdfStoreUser, "SPARQL_UPDATE");

        // create setting graph for user
        String userSettingsGraphURI = frameworkConfig.getResourceNamespace()
                + URLEncoder.encode(name, "UTF-8") + "/settingsGraph";
        // grant write permissions to framework - otherwise framework fails to
        // create graph
        rdfStoreUserManager.setRdfGraphPermissions(frameworkConfig.getAuthSparqlUser(),
                userSettingsGraphURI, 3);
        rdfStoreManager.createGraph(userSettingsGraphURI);
        // grant write permissions to user
        rdfStoreUserManager.setRdfGraphPermissions(rdfStoreUser, userSettingsGraphURI, 3); // todo
                                                                                           // deny
                                                                                           // access
                                                                                           // for
                                                                                           // user?

        // copy data from initial settings graph
        String query = getPrefixes() + "\n" + "INSERT INTO <" + userSettingsGraphURI
                + "> {?s ?p ?o} " + "WHERE {GRAPH <" + frameworkConfig.getInitialSettingsGraph()
                + "> {?s ?p ?o} }";
        try {
            rdfStoreManager.execute(query, jsonResponseFormat);
        } catch (IOException e) { // failed to write user graph
                                  // rollback actions:
            rdfStoreUserManager.dropUser(rdfStoreUser);
            throw e;
        }
        // get default role uri
        String role = getDefaultRoleURI();
        // write user account to accounts graph
        query = getPrefixes() + "\n" + "INSERT DATA { GRAPH <" + frameworkConfig.getAccountsGraph()
                + "> {\n" + " :" + name + " rdf:type gkg:Account .\n" + " :" + name
                + " foaf:accountName \"" + name + "\" .\n" + " :" + name
                + " gkg:passwordSha1Hash \"" + DigestUtils.sha1Hex(password) + "\" .\n" + " :"
                + name + " gkg:rdfStoreUsername \"" + rdfStoreUser + "\" .\n" + " :" + name
                + " gkg:rdfStorePassword \"" + rdfStorePassword + "\" .\n" + " :" + name
                + " gkg:settingsGraph \"" + userSettingsGraphURI + "\"^^xsd:anyURI .\n" + " :"
                + name + " foaf:mbox <mailto:" + email + "> .\n" + " :" + name
                + " dcterms:created \"" + ISO8601Utils.format(new Date()) + "\"^^xsd:date .\n"
                + " :" + name + " gkg:role <" + role + "> .\n" + "} }";

        try {
            rdfStoreManager.execute(query, jsonResponseFormat);
        } catch (IOException e) { // failed to register user in to the accounts
                                  // graph
                                  // rollback actions:
            rdfStoreUserManager.dropUser(rdfStoreUser);
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

        // get account (URI) and rdf store user by framework user name
        String query = getPrefixes() + "\n" + "SELECT ?account, ?rdfStoreUsername FROM <"
                + frameworkConfig.getAccountsGraph() + "> " + "WHERE {?account foaf:accountName \""
                + name + "\" . ?account gkg:rdfStoreUsername ?rdfStoreUsername}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        if (!bindingsIter.hasNext())
            return;
        JsonNode bindingNode = bindingsIter.next();
        String accountURI = bindingNode.path("account").path("value").getTextValue();
        String rdfStoreUsername = bindingNode.path("rdfStoreUsername").path("value").getTextValue();

        // drop rdf store user
        rdfStoreUserManager.dropUser(rdfStoreUsername);

        String userSettingsGraph = getSettingsGraph(name);

        // remove account triples
        query = getPrefixes() + "\n" + "DELETE FROM <" + frameworkConfig.getAccountsGraph()
                + "> {?s ?p ?o} WHERE { ?s ?p ?o . FILTER (?s = <" + accountURI + ">) }";
        rdfStoreManager.execute(query, jsonResponseFormat);

        // delete user settings graph
        rdfStoreManager.dropGraph(userSettingsGraph);

        // todo restore Virtuoso user if failed to remove account triples
    }

    @Override
    public void grantRole(String user, String role) throws Exception {
        ObjectPair<String, String> rdfStoreUser = getRdfStoreUser(user);
        if (rdfStoreUser == null)
            throw new Exception("Rdf store user was not found for " + user);
        rdfStoreUserManager.grantRole(rdfStoreUser.getFirst(), role);
    }

    @Override
    public void setDefaultRdfPermissions(String user, int permissions) throws Exception {
        ObjectPair<String, String> rdfStoreUser = getRdfStoreUser(user);
        if (rdfStoreUser == null)
            throw new Exception("Rdf store user was not found for " + user);
        rdfStoreUserManager.setDefaultRdfPermissions(rdfStoreUser.getFirst(), permissions);
    }

    @Override
    public void setRdfGraphPermissions(String user, String graph, int permissions) throws Exception {
        String settingsGraph = getDescribedIn(graph);
        if (settingsGraph == null)
            throw new Exception("Graph " + graph + " description was not found");

        UserProfile userProfile = getUserProfile(user);
        if (userProfile == null)
            throw new Exception("User " + user + " was not found");

        // remove old access triples
        String query = getPrefixes() + "\n" + "WITH <" + settingsGraph + "> "
                + " DELETE {?s ?p ?o} " + " WHERE { " + " {<" + graph
                + "> gkg:access ?s . ?s acl:agent <" + userProfile.getAccountURI()
                + "> . ?s ?p ?o . } " + " UNION " + " {?s gkg:access ?ao . ?ao acl:agent <"
                + userProfile.getAccountURI() + "> . ?s ?p ?o . FILTER (?s = <" + graph
                + "> && ?p = gkg:access) } " + "}";
        rdfStoreManager.execute(query, jsonResponseFormat);

        // add new public access triples
        switch (permissions) {
        case 0: // no access
            break;
        case 1: // read
            query = getPrefixes() + "\n" + "INSERT INTO <" + settingsGraph + "> { " + " <" + graph
                    + "> gkg:access _:b1. " + " _:b1 acl:agent <" + userProfile.getAccountURI()
                    + "> . " + " _:b1 acl:mode acl:Read . " + "}";
            rdfStoreManager.execute(query, jsonResponseFormat);
            break;
        case 3: // write
            query = getPrefixes() + "\n" + "INSERT INTO <" + settingsGraph + "> { " + " <" + graph
                    + "> gkg:access _:b1. " + " _:b1 acl:agent <" + userProfile.getAccountURI()
                    + "> . " + " _:b1 acl:mode acl:Write . " + "} ";
            rdfStoreManager.execute(query, jsonResponseFormat);
            break;
        }

        // set rdf store permissions
        ObjectPair<String, String> rdfStoreUser = getRdfStoreUser(user);
        if (rdfStoreUser == null)
            throw new Exception("Rdf store user was not found for " + user);
        System.out.println("Set graph permissions " + permissions + " for graph " + graph
                + ", user " + user);
        rdfStoreUserManager.setRdfGraphPermissions(rdfStoreUser.getFirst(), graph, permissions);
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
        String query = getPrefixes() + "\n" + "WITH <" + settingsGraph + "> "
                + " DELETE {?s ?p ?o} " + " WHERE { " + " {<" + graph
                + "> gkg:access ?s . ?s acl:agent <" + userProfile.getAccountURI()
                + "> . ?s ?p ?o . } " + " UNION " + " {?s gkg:access ?ao . ?ao acl:agent <"
                + userProfile.getAccountURI() + "> . ?s ?p ?o . FILTER (?s = <" + graph
                + "> && ?p = gkg:access) } " + "}";
        rdfStoreManager.execute(query, jsonResponseFormat);

        // remove rdf store permissions
        ObjectPair<String, String> rdfStoreUser = getRdfStoreUser(user);
        if (rdfStoreUser == null)
            throw new Exception("Rdf store user was not found for " + user);
        System.out.println("Remove graph permissions for graph " + graph + ", user " + user);
        rdfStoreUserManager.deleteRdfGraphPermissions(rdfStoreUser.getFirst(), graph);
    }

    @Override
    public void setDefaultGraphPermissions(String graph, int permissions) throws Exception {
        String settingsGraph = getDescribedIn(graph);
        if (settingsGraph == null)
            throw new Exception("Graph " + graph + " description was not found");

        // remove old public access triples
        String query = getPrefixes() + "\n" + "WITH <" + settingsGraph + "> "
                + " DELETE {?s ?p ?o} " + " WHERE { " + " {<" + graph
                + "> gkg:access ?s . ?s acl:agentClass foaf:Agent . ?s ?p ?o . } " + " UNION "
                + " {?s gkg:access ?ao . ?ao acl:agentClass foaf:Agent . ?s ?p ?o . FILTER (?s = <"
                + graph + "> && ?p = gkg:access) } " + "}";
        rdfStoreManager.execute(query, jsonResponseFormat);

        // add new public access triples
        switch (permissions) {
        case 0: // no public access
            break;
        case 1: // public read
            query = getPrefixes() + "\n" + "INSERT INTO <" + settingsGraph + "> { " + " <" + graph
                    + "> gkg:access _:b1. " + " _:b1 acl:agentClass foaf:Agent . "
                    + " _:b1 acl:mode acl:Read . " + "}";
            rdfStoreManager.execute(query, jsonResponseFormat);
            break;
        case 3: // public write
            query = getPrefixes() + "\n" + "INSERT INTO <" + settingsGraph + "> { " + " <" + graph
                    + "> gkg:access _:b1. " + " _:b1 acl:agentClass foaf:Agent . "
                    + " _:b1 acl:mode acl:Write . " + "}";
            rdfStoreManager.execute(query, jsonResponseFormat);
            break;
        }

        // set permissions in rdf store
        rdfStoreUserManager.setDefaultGraphPermissions(graph, permissions);
    }

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

        String query = getPrefixes() + "\n" + "WITH <" + frameworkConfig.getAccountsGraph() + "> "
                + " DELETE {?account gkg:passwordSha1Hash ?o} "
                + " INSERT {?account gkg:passwordSha1Hash \"" + DigestUtils.sha1Hex(newPassword)
                + "\"} " + " WHERE {?account foaf:accountName \"" + username
                + "\" . ?account gkg:passwordSha1Hash ?o . }";
        rdfStoreManager.execute(query, jsonResponseFormat);
    }

    public void setPassword(String usernameOrEmail, String password) throws Exception {
        if (usernameOrEmail == null || usernameOrEmail.isEmpty())
            throw new IllegalArgumentException("username cannot be null or empty");
        if (password == null || password.isEmpty())
            throw new IllegalArgumentException("password cannot be null or empty");

        String query = getPrefixes() + "\n" + "WITH <" + frameworkConfig.getAccountsGraph() + "> "
                + " DELETE {?account gkg:passwordSha1Hash ?o} "
                + " INSERT {?account gkg:passwordSha1Hash \"" + DigestUtils.sha1Hex(password)
                + "\"} " + " WHERE { " + " {?account foaf:accountName \"" + usernameOrEmail
                + "\" . OPTIONAL { ?account gkg:passwordSha1Hash ?o . } } " + " UNION "
                + " { ?account foaf:mbox <mailto:" + usernameOrEmail
                + "> . OPTIONAL { ?account gkg:passwordSha1Hash ?o . } } " + " }";
        rdfStoreManager.execute(query, jsonResponseFormat);
    }

    public boolean checkPassword(String usernameOrEmail, String password) throws Exception {
        String query = getPrefixes() + "\n" + "SELECT DISTINCT ?passwordHash FROM <"
                + frameworkConfig.getAccountsGraph() + "> " + "WHERE {"
                + " {?account foaf:accountName \"" + usernameOrEmail
                + "\" . ?account gkg:passwordSha1Hash ?passwordHash . } " + " UNION "
                + " {?account foaf:mbox <mailto:" + usernameOrEmail
                + "> . ?account gkg:passwordSha1Hash ?passwordHash . } " + "}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        if (!bindingsIter.hasNext())
            return false;
        JsonNode bindingNode = bindingsIter.next();
        String correctPasswordHash = bindingNode.path("passwordHash").path("value").getTextValue();
        return DigestUtils.sha1Hex(password).equals(correctPasswordHash);
    }

    public boolean checkToken(String username, String token) throws Exception {
        String query = getPrefixes() + "\n" + "ASK {GRAPH <" + frameworkConfig.getAccountsGraph()
                + "> " + " {?account foaf:accountName \"" + username
                + "\" . ?account gkg:sessionToken \"" + token + "\" . } " + "}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        return rootNode.path("boolean").getBooleanValue();
    }

    public void saveSessionToken(String usernameOrEmail, String token) throws Exception {
        if (usernameOrEmail == null || usernameOrEmail.isEmpty())
            throw new IllegalArgumentException("username cannot be null or empty");
        if (token == null || token.isEmpty())
            throw new IllegalArgumentException("token cannot be null or empty");

        // TODO: replace old token if exists? or add new if user may have more
        // than
        // one token?
        String query = getPrefixes() + "\n" + "WITH <" + frameworkConfig.getAccountsGraph() + "> "
                + " INSERT { ?account gkg:sessionToken \"" + token + "\" } " + " WHERE {"
                + " { ?account foaf:accountName \"" + usernameOrEmail + "\" } " + " UNION "
                + " { ?account foaf:mbox <mailto:" + usernameOrEmail + "> } " + "}";
        rdfStoreManager.execute(query, jsonResponseFormat);
    }

    public void removeAllSessionTokens(String username) throws Exception {
        if (username == null || username.isEmpty())
            throw new IllegalArgumentException("username cannot be null or empty");

        String query = getPrefixes() + "\n" + "DELETE FROM <" + frameworkConfig.getAccountsGraph()
                + "> {?account gkg:sessionToken ?o} " + "WHERE {?account foaf:accountName \""
                + username + "\" . ?account gkg:sessionToken ?o . }";
        rdfStoreManager.execute(query, jsonResponseFormat);
    }

    // userId - username, email or account URI
    public UserProfile getUserProfile(String userId) throws Exception {
        String query = getPrefixes() + "\n" + "SELECT DISTINCT * FROM <"
                + frameworkConfig.getAccountsGraph() + "> " + "WHERE {"
                + " {?account foaf:accountName \"" + userId + "\" . ?account ?p ?o . } "
                + " UNION " + " {?account foaf:mbox <mailto:" + userId + "> . ?account ?p ?o . } "
                + " UNION " + " {?account ?p ?o . FILTER (?account = <" + userId + ">)} " + "}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        if (!bindingsIter.hasNext())
            return null;
        UserProfile userProfile = new UserProfile();
        userProfile.setAccountURI(bindingsIter.next().path("account").path("value").getTextValue());
        bindingsIter = rootNode.path("results").path("bindings").getElements();
        while (bindingsIter.hasNext()) {
            JsonNode bindingNode = bindingsIter.next();
            String predicate = bindingNode.path("p").path("value").getTextValue();
            if (predicate.equals("http://xmlns.com/foaf/0.1/accountName"))
                userProfile.setUsername(bindingNode.path("o").path("value").getTextValue());
            else if (predicate.endsWith("/settingsGraph"))
                userProfile.setSettingsGraph(bindingNode.path("o").path("value").getTextValue());
            else if (predicate.equals("http://xmlns.com/foaf/0.1/mbox")) {
                String mbox = bindingNode.path("o").path("value").getTextValue();
                userProfile.setEmail(mbox.substring("mailto:".length()));
            } else if (predicate.equals(frameworkConfig.getFrameworkOntologyNS() + "role")) {
                String roleURI = bindingNode.path("o").path("value").getTextValue();
                UserRole role = getRole(roleURI);
                userProfile.setRole(role);
            }
        }
        return userProfile;
    }

    public UserProfileExtended getUserProfileExtended(String username) throws Exception {
        UserProfile userProfile = getUserProfile(username);
        UserProfileExtended userProfileExtended = new UserProfileExtended();
        userProfileExtended.setProfile(userProfile);
        userProfileExtended.setOwnGraphs(getOwnGraphs(username));
        userProfileExtended.setReadableGraphs(getReadableGraphs(username));
        userProfileExtended.setWritableGraphs(getWritableGraphs(username));
        return userProfileExtended;
    }

    public RdfStoreManager getRdfStoreManager(String username) throws Exception {
        if (username == null || username.isEmpty())
            throw new IllegalArgumentException("username cannot be null");
        ObjectPair<String, String> rdfStoreUser = getRdfStoreUser(username);
        return new SecureRdfStoreManagerImpl(frameworkConfig.getAuthSparqlEndpoint(), rdfStoreUser
                .getFirst(), rdfStoreUser.getSecond());
    }

    // todo username must be not null (may be null now - for VirtuosoProxy)
    public ObjectPair<String, String> getRdfStoreUser(String frameworkUsername, String token)
            throws Exception {
        String query = getPrefixes()
                + "\n"
                + "SELECT ?rdfStoreUsername, ?rdfStorePassword FROM <"
                + frameworkConfig.getAccountsGraph()
                + "> "
                + "WHERE { "
                + (frameworkUsername == null || frameworkUsername.isEmpty() ? ""
                        : "?account foaf:accountName \"" + frameworkUsername + "\" . ")
                + "?account gkg:sessionToken \"" + token + "\" . "
                + "?account gkg:rdfStoreUsername ?rdfStoreUsername . "
                + "?account gkg:rdfStorePassword ?rdfStorePassword . " + "}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        if (!bindingsIter.hasNext())
            throw new Exception("Invalid user credentials.");
        JsonNode bindingNode = bindingsIter.next();
        String rdfStoreUsername = bindingNode.path("rdfStoreUsername").path("value").getTextValue();
        String rdfStorePassword = bindingNode.path("rdfStorePassword").path("value").getTextValue();
        return new ObjectPair<String, String>(rdfStoreUsername, rdfStorePassword);
    }

    // returns list of URIs
    public Collection<String> getReadableGraphs(String username) throws Exception {
        String settingsGraph = getSettingsGraph(username);
        Collection<String> settingsGraphList = getSettingsGraphs();
        String fromGraphsStr = "";
        for (String graph : settingsGraphList) {
            if (!graph.equals(settingsGraph))
                fromGraphsStr += (" FROM <" + graph + "> \n");
        }

        String query = getPrefixes()
                + "\n"
                + "SELECT DISTINCT ?ng "
                + " FROM <"
                + frameworkConfig.getAccountsGraph()
                + ">\n"
                + fromGraphsStr
                + " WHERE { ?ng rdf:type sd:NamedGraph . ?ng gkg:access ?ao . ?ao acl:mode acl:Read . ?ao acl:agent ?account . ?account foaf:accountName \""
                + username + "\" . }";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        Collection<String> readableGraphs = new ArrayList<String>();
        while (bindingsIter.hasNext()) {
            readableGraphs.add(bindingsIter.next().path("ng").path("value").getTextValue());
        }
        return readableGraphs;
    }

    // returns list of URIs
    public Collection<String> getWritableGraphs(String username) throws Exception {
        String settingsGraph = getSettingsGraph(username);
        Collection<String> settingsGraphList = getSettingsGraphs();
        String fromGraphsStr = "";
        for (String graph : settingsGraphList) {
            if (!graph.equals(settingsGraph))
                fromGraphsStr += (" FROM <" + graph + "> \n");
        }

        String query = getPrefixes()
                + "\n"
                + "SELECT DISTINCT ?ng "
                + " FROM <"
                + frameworkConfig.getAccountsGraph()
                + ">\n"
                + fromGraphsStr
                + " WHERE { ?ng rdf:type sd:NamedGraph . ?ng gkg:access ?ao . ?ao acl:mode acl:Write . ?ao acl:agent ?account . ?account foaf:accountName \""
                + username + "\" . }";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        Collection<String> writableGraphs = new ArrayList<String>();
        while (bindingsIter.hasNext()) {
            writableGraphs.add(bindingsIter.next().path("ng").path("value").getTextValue());
        }
        return writableGraphs;
    }

    // returns list of URIs
    public Collection<String> getAllGraphs() throws Exception {
        Collection<String> settingsGraphs = getSettingsGraphs();
        StringBuilder queryBuilder = new StringBuilder();
        queryBuilder.append(getPrefixes()).append("\n").append("SELECT DISTINCT ?ng \n");
        for (String sg : settingsGraphs)
            queryBuilder.append("FROM <").append(sg).append(">\n");
        queryBuilder.append("WHERE { ?ng rdf:type sd:NamedGraph }");
        String result = rdfStoreManager.execute(queryBuilder.toString(), jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        Collection<String> graphs = new ArrayList<String>();
        while (bindingsIter.hasNext()) {
            graphs.add(bindingsIter.next().path("ng").path("value").getTextValue());
        }
        return graphs;
    }

    /**
     * Gets the named graphs described inside the settingsGraph and the Graph
     * description of each. And gkg:access??
     * 
     * @return SPARQL response
     * @throws Exception
     */
    public String getAllGraphsSparql() throws Exception {
        Collection<String> settingsGraphs = getSettingsGraphs();
        String fromStr = "";
        for (String sg : settingsGraphs)
            fromStr += ("FROM <" + sg + ">\n");
        String query = getPrefixes() + "\n" + "SELECT ?s ?p ?o " + fromStr + " WHERE {"
                + " { ?s rdf:type sd:NamedGraph . ?s ?p ?o . } " + " UNION "
                + " { ?ng rdf:type sd:NamedGraph . ?ng sd:graph ?s . ?s ?p ?o . } " + " UNION "
                + " { ?ng rdf:type sd:NamedGraph . ?ng gkg:access ?s . ?s ?p ?o . } " + "}";
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
        String query = getPrefixes()
                + "\n"
                + "SELECT ?account FROM <"
                + settingsGraph
                + "> WHERE {?ng rdf:type sd:NamedGraph . ?ng gkg:access ?ao . ?ao acl:agent ?account . } ";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        Collection<String> users = new ArrayList<String>();
        while (bindingsIter.hasNext()) {
            users.add(bindingsIter.next().path("account").path("value").getTextValue());
        }
        return users;
    }

    // frameworkUserId - username, email or account URI
    public ObjectPair<String, String> getRdfStoreUser(String frameworkUserId) throws Exception {
        String query = getPrefixes()
                + "\n"
                + "SELECT ?rdfStoreUsername ?rdfStorePassword FROM <"
                + frameworkConfig.getAccountsGraph()
                + "> "
                + "WHERE {"
                + " {?account foaf:accountName \""
                + frameworkUserId
                + "\" . ?account gkg:rdfStoreUsername ?rdfStoreUsername . ?account gkg:rdfStorePassword ?rdfStorePassword . } "
                + " UNION "
                + " {?account foaf:mbox <mailto:"
                + frameworkUserId
                + "> . ?account gkg:rdfStoreUsername ?rdfStoreUsername . ?account gkg:rdfStorePassword ?rdfStorePassword . } "
                + " UNION " + " {<" + frameworkUserId + "> rdf:type gkg:Account . <"
                + frameworkUserId + "> gkg:rdfStoreUsername ?rdfStoreUsername . <"
                + frameworkUserId + "> gkg:rdfStorePassword ?rdfStorePassword . } " + "}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        if (!bindingsIter.hasNext())
            return null;
        JsonNode binding = bindingsIter.next();
        return new ObjectPair<String, String>(binding.path("rdfStoreUsername").path("value")
                .getTextValue(), binding.path("rdfStorePassword").path("value").getTextValue());
    }

    public String getDescribedIn(String graph) throws Exception {
        Collection<String> settingsGraphs = getSettingsGraphs();
        StringBuilder queryBuilder = new StringBuilder();
        queryBuilder.append(getPrefixes()).append("\n").append("SELECT DISTINCT ?sg \n");
        queryBuilder.append("FROM <").append(frameworkConfig.getAccountsGraph()).append(">\n");
        for (String sg : settingsGraphs)
            queryBuilder.append("FROM <").append(sg).append(">\n");
        queryBuilder.append("WHERE { <").append(graph).append("> rdf:type sd:NamedGraph . <")
                .append(graph).append("> acl:owner ?account . ?account gkg:settingsGraph ?sg }");
        String result = rdfStoreManager.execute(queryBuilder.toString(), jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        if (bindingsIter.hasNext()) {
            return bindingsIter.next().path("sg").path("value").getTextValue();
        }
        return null;
    }

    /**
     * Validates that the user has a session using the token and returns the
     * UserProfile object
     * 
     * @param userc
     *            json object passed in the request cookies
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
        Gson gson = new Gson();
        UserProfile user = gson.fromJson(userstr, UserProfile.class);

        boolean checkToken = checkToken(user.getUsername(), token);

        if (!checkToken)
            return null;

        return user;
    }

    private String getPrefixes() {
        if (prefixes == null) {
            prefixes = "PREFIX : <" + frameworkConfig.getResourceNamespace() + ">\n"
                    + "PREFIX gkg: <" + frameworkConfig.getFrameworkOntologyNS() + ">\n"
                    + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"
                    + "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>\n"
                    + "PREFIX acl: <http://www.w3.org/ns/auth/acl#>\n"
                    + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"
                    + "PREFIX dcterms: <http://purl.org/dc/terms/>";
        }
        return prefixes;
    }

    private String getSettingsGraph(String username) throws Exception {
        String query = getPrefixes() + "\n" + "SELECT ?settingsGraph FROM <"
                + frameworkConfig.getAccountsGraph() + "> " + "WHERE {?account foaf:accountName \""
                + username + "\" . ?account gkg:settingsGraph ?settingsGraph .}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        return bindingsIter.hasNext() ? bindingsIter.next().path("settingsGraph").path("value")
                .getTextValue() : null;
    }

    public boolean checkUserExists(String username, String email) throws Exception {
        String query = getPrefixes() + "\n" + "ASK {" + " { GRAPH <"
                + frameworkConfig.getAccountsGraph() + "> {?account foaf:accountName \"" + username
                + "\"} } " + " UNION " + " { GRAPH <" + frameworkConfig.getAccountsGraph()
                + "> {?account foaf:mbox <mailto:" + email + ">} }" + "}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        return rootNode.path("boolean").getBooleanValue();
    }

    private Collection<String> getSettingsGraphs() throws Exception {
        Collection<String> settingsGraphList = new ArrayList<String>();
        settingsGraphList.add(frameworkConfig.getSettingsGraph());
        String query = getPrefixes() + "\n" + " SELECT DISTINCT ?sg FROM <"
                + frameworkConfig.getAccountsGraph() + "> "
                + " WHERE { ?account gkg:settingsGraph ?sg }";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        while (bindingsIter.hasNext()) {
            JsonNode bindingNode = bindingsIter.next();
            settingsGraphList.add(bindingNode.path("sg").path("value").getTextValue());
        }
        return settingsGraphList;
    }

    public Collection<String> getAllUsernames() throws Exception {
        String query = getPrefixes() + "\n" + "SELECT DISTINCT ?username FROM <"
                + frameworkConfig.getAccountsGraph() + "> "
                + " WHERE {?account rdf:type gkg:Account . ?account foaf:accountName ?username}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        Collection<String> usernames = new ArrayList<String>();
        while (bindingsIter.hasNext()) {
            usernames.add(bindingsIter.next().path("username").path("value").getTextValue());
        }
        return usernames;
    }

    private Collection<String> getOwnGraphs(String username) throws Exception {
        String settingsGraph = getSettingsGraph(username);
        String query = getPrefixes()
                + "\n"
                + "SELECT DISTINCT ?ng "
                + " FROM <"
                + settingsGraph
                + "> "
                + " FROM <"
                + frameworkConfig.getAccountsGraph()
                + "> "
                + " WHERE { ?ng rdf:type sd:NamedGraph . ?ng acl:owner ?account . ?account foaf:accountName \""
                + username + "\" . }";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        Collection<String> ownGraphs = new ArrayList<String>();
        while (bindingsIter.hasNext()) {
            ownGraphs.add(bindingsIter.next().path("ng").path("value").getTextValue());
        }
        return ownGraphs;
    }

    // userId - username, email or account URI
    public boolean isAdmin(String userId) throws Exception {
        String query = getPrefixes() + "\n" + "SELECT DISTINCT ?role FROM <"
                + frameworkConfig.getAccountsGraph() + "> " + "WHERE {"
                + " {?account foaf:accountName \"" + userId + "\" . ?account gkg:role ?role . } "
                + " UNION " + " {?account foaf:mbox <mailto:" + userId
                + "> . ?account gkg:role ?role . } " + " UNION "
                + " {?account gkg:role ?role . FILTER (?account = <" + userId + ">)} " + "}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        if (!bindingsIter.hasNext())
            return false;
        JsonNode binding = bindingsIter.next();
        String role = binding.path("role").path("value").getTextValue();
        return role.equals(frameworkConfig.getFrameworkOntologyNS() + "Administrator");
    }

    public void setRole(String userId, String role) throws Exception {
        String query = getPrefixes() + "\n" + " WITH <" + frameworkConfig.getAccountsGraph() + "> "
                + " DELETE {?account gkg:role ?o} " + " INSERT {?account gkg:role <" + role + ">} "
                + " WHERE {?account foaf:accountName \"" + userId
                + "\" . optional {?account gkg:role ?o .} }";
        rdfStoreManager.execute(query, jsonResponseFormat);
    }

    private UserRole getRole(String roleURI) throws Exception {
        UserRole role = new UserRole();
        role.setUri(roleURI);
        List<String> roleServices = new ArrayList<>();
        String query = getPrefixes() + "\n" + "SELECT ?s ?p ?o FROM <"
                + frameworkConfig.getAccountsGraph() + "> " + "WHERE {?s ?p ?o . filter(?s=<"
                + roleURI + ">)}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        while (bindingsIter.hasNext()) {
            JsonNode bindingNode = bindingsIter.next();
            String predicate = bindingNode.path("p").path("value").getTextValue();
            if (predicate.equals("http://xmlns.com/foaf/0.1/name"))
                role.setName(bindingNode.path("o").path("value").getTextValue());
            else if (predicate.equals(frameworkConfig.getFrameworkOntologyNS()
                    + "isAllowedToUseService"))
                roleServices.add(bindingNode.path("o").path("value").getTextValue());
        }
        role.setServices(roleServices);
        return role;
    }

    private String getDefaultRoleURI() throws Exception {
        String query = getPrefixes() + "\n" + "SELECT DISTINCT ?role FROM <"
                + frameworkConfig.getAccountsGraph() + "> "
                + "WHERE { ?role gkg:isDefault true . }";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        String role;
        if (!bindingsIter.hasNext()) {
            role = frameworkConfig.getFrameworkOntologyNS() + "BasicUser";
        } else {
            JsonNode binding = bindingsIter.next();
            role = binding.path("role").path("value").getTextValue();
        }
        return role;
    }
}
