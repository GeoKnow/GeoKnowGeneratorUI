package accounts;

import authentication.FrameworkConfiguration;
import org.apache.commons.codec.digest.DigestUtils;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.util.ISO8601Utils;
import rdf.RdfStoreManager;
import rdf.SecureRdfStoreManagerImpl;
import util.ObjectPair;
import util.RandomStringGenerator;

import java.io.IOException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.Iterator;

//todo make methods synchronized?
public class FrameworkUserManager implements UserManager {
    private static final String jsonResponseFormat = "application/sparql-results+json";

    private String prefixes = null;
    private UserManager rdfStoreUserManager;
    private RdfStoreManager rdfStoreManager;
    private FrameworkConfiguration frameworkConfig;
    
//    private FrameworkConfiguration frameworkConfig = FrameworkConfiguration.getInstance();

    public FrameworkUserManager(UserManager rdfStoreUserManager, RdfStoreManager rdfStoreManager, FrameworkConfiguration frameworkConfig) {
        this.rdfStoreUserManager = rdfStoreUserManager;
        this.rdfStoreManager = rdfStoreManager;
        this.frameworkConfig = frameworkConfig;
    }

    public void createUser(String name, String password, String email) throws Exception {
        if (name==null || name.isEmpty())
            throw new IllegalArgumentException("name cannon be null or empty");
        if (password==null || password.isEmpty())
            throw new IllegalArgumentException("password  cannon be null or empty");
        if (email==null || email.isEmpty())
            throw new IllegalArgumentException("email cannon be null or empty");

        if (checkUserExists(name, email))
            throw new Exception("User already exists");

        // try to create Virtuoso user
        RandomStringGenerator randomStringGenerator = new RandomStringGenerator();
        String rdfStoreUser = name;
        String rdfStorePassword = randomStringGenerator.generateSimple(8);
        boolean error;
        int counter = 0;
        do { //retry on error
            try {
                rdfStoreUserManager.createUser(rdfStoreUser, rdfStorePassword);
                error = false;
            } catch (Exception e) {
                error = true;
                rdfStoreUser = name + randomStringGenerator.generateSimple(5);
            }
            counter++;
        } while (error && counter<10);
        //grant SPARQL_UPDATE role to created Virtuoso user
        //TODO: users with only read access?
        rdfStoreUserManager.grantRole(rdfStoreUser, "SPARQL_UPDATE");

        //create setting graph for user
        String userSettingsGraphURI = frameworkConfig.getResourceNamespace() + URLEncoder.encode(name, "UTF-8") + "/settingsGraph";
        // grant write permissions to framework - otherwise framework fails to create graph
        rdfStoreUserManager.setRdfGraphPermissions(frameworkConfig.getAuthSparqlUser(), userSettingsGraphURI, 3);
        rdfStoreManager.createGraph(userSettingsGraphURI);
        //grant write permissions to user
        rdfStoreUserManager.setRdfGraphPermissions(rdfStoreUser, userSettingsGraphURI, 3); // todo deny access for user?

        //copy data from initial settings graph
        String query = getPrefixes() + "\n"
                + "INSERT INTO <" + userSettingsGraphURI + "> {?s ?p ?o} "
                + "WHERE {GRAPH <" + frameworkConfig.getInitialSettingsGraph() + "> {?s ?p ?o} }";
        try{
        	rdfStoreManager.execute(query, jsonResponseFormat);
        }
        catch(IOException e)
        {	// failed to write user graph 
        	// rollback actions:
            rdfStoreUserManager.dropUser(rdfStoreUser);
            throw e;
        }
        // write user account to accounts graph
        query = getPrefixes() + "\n"
                + "INSERT DATA { GRAPH <" + frameworkConfig.getAccountsGraph() + "> {\n"
                + " :" + name + " rdf:type ao:Account .\n"
                + " :" + name + " user:loginName \"" + name + "\" .\n"
                + " :" + name + " user:passwordSha1Hash \"" + DigestUtils.sha1Hex(password) + "\" .\n"
                + " :" + name + " ao:rdfStoreUsername \"" + rdfStoreUser + "\" .\n"
                + " :" + name + " ao:rdfStorePassword \"" + rdfStorePassword + "\" .\n"
                + " :" + name + " ao:settingsGraph \"" + userSettingsGraphURI + "\"^^xsd:anyURI .\n"
                + " :" + name + " foaf:mbox <mailto:" + email + "> .\n"
                + " :" + name + " dcterms:created \"" + ISO8601Utils.format(new Date()) + "\"^^xsd:date .\n"
                + "} }";
        
        try{
        	rdfStoreManager.execute(query, jsonResponseFormat);
        }
        catch(IOException e)
        {	// failed to register user in to the accounts graph
        	// rollback actions:
            rdfStoreUserManager.dropUser(rdfStoreUser);
            rdfStoreManager.dropGraph(userSettingsGraphURI);
            throw e;
        }
        //todo delete Virtuoso user if failed to write account triples
    }

    @Override
    public void createUser(String name, String password) throws Exception {
        throw new UnsupportedOperationException("Unsupported operation createUser(name, password). Use createUser(name, password, email");
    }

    @Override
    public void dropUser(String name) throws Exception {
        if (name==null || name.isEmpty())
            throw new IllegalArgumentException("name cannot be null or empty");

        // get account (URI) and rdf store user by framework user name
        String query = getPrefixes() + "\n"
                + "SELECT ?account, ?rdfStoreUsername FROM <" + frameworkConfig.getAccountsGraph() + "> "
                + "WHERE {?account user:loginName \"" + name + "\" . ?account ao:rdfStoreUsername ?rdfStoreUsername}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        if (!bindingsIter.hasNext())
            return;
        JsonNode bindingNode = bindingsIter.next();
        String accountURI = bindingNode.path("account").path("value").getTextValue();
        String rdfStoreUsername = bindingNode.path("rdfStoreUsername").path("value").getTextValue();

        //drop rdf store user
        rdfStoreUserManager.dropUser(rdfStoreUsername);

        String userSettingsGraph = getSettingsGraph(name);

        // remove account triples
        query = getPrefixes() + "\n"
                + "DELETE FROM <" + frameworkConfig.getAccountsGraph() + "> {?s ?p ?o} WHERE { ?s ?p ?o . FILTER (?s = <" + accountURI + ">) }";
        rdfStoreManager.execute(query, jsonResponseFormat);

        //delete user settings graph
        rdfStoreManager.dropGraph(userSettingsGraph);

        //todo restore Virtuoso user if failed to remove account triples
    }

    @Override
    public void grantRole(String user, String role) throws Exception {
        ObjectPair<String, String> rdfStoreUser = getRdfStoreUser(user);
        if (rdfStoreUser==null)
            throw new Exception("Rdf store user was not found for " + user);
        rdfStoreUserManager.grantRole(rdfStoreUser.getFirst(), role);
    }

    @Override
    public void setDefaultRdfPermissions(String user, int permissions) throws Exception {
        ObjectPair<String, String> rdfStoreUser = getRdfStoreUser(user);
        if (rdfStoreUser==null)
            throw new Exception("Rdf store user was not found for " + user);
        rdfStoreUserManager.setDefaultRdfPermissions(rdfStoreUser.getFirst(), permissions);
    }

    @Override
    public void setRdfGraphPermissions(String user, String graph, int permissions) throws Exception {
        String settingsGraph = getDescribedIn(graph);
        if (settingsGraph==null)
            throw new Exception("Graph " + graph + " description was not found");

        UserProfile userProfile = getUserProfile(user);
        if (userProfile==null)
            throw new Exception("User " + user + " was not found");

        //remove old access triples
        String query = getPrefixes() + "\n"
                + "WITH <" + settingsGraph + "> "
                + " DELETE {?s ?p ?o} "
                + " WHERE { "
                + " {<" + graph + "> gkg:access ?s . ?s acl:agent <" + userProfile.getAccountURI() + "> . ?s ?p ?o . } "
                + " UNION "
                + " {?s gkg:access ?ao . ?ao acl:agent <" + userProfile.getAccountURI() + "> . ?s ?p ?o . FILTER (?s = <" + graph + "> && ?p = gkg:access) } "
                + "}";
        rdfStoreManager.execute(query, jsonResponseFormat);

        //add new public access triples
        switch (permissions) {
            case 0: //no access
                break;
            case 1: //read
                query = getPrefixes() + "\n"
                        + "INSERT INTO <" + settingsGraph + "> { "
                        + " <" + graph + "> gkg:access _:b1. "
                        + " _:b1 acl:agent <" + userProfile.getAccountURI() + "> . "
                        + " _:b1 acl:mode acl:Read . "
                        + "}";
                rdfStoreManager.execute(query, jsonResponseFormat);
                break;
            case 3: //write
                query = getPrefixes() + "\n"
                        + "INSERT INTO <" + settingsGraph + "> { "
                        + " <" + graph + "> gkg:access _:b1. "
                        + " _:b1 acl:agent <" + userProfile.getAccountURI() + "> . "
                        + " _:b1 acl:mode acl:Write . "
                        + "} ";
                rdfStoreManager.execute(query, jsonResponseFormat);
                break;
        }

        //set rdf store permissions
        ObjectPair<String, String> rdfStoreUser = getRdfStoreUser(user);
        if (rdfStoreUser==null)
            throw new Exception("Rdf store user was not found for " + user);
        System.out.println("Set graph permissions " + permissions + " for graph " + graph + ", user " + user);
        rdfStoreUserManager.setRdfGraphPermissions(rdfStoreUser.getFirst(), graph, permissions);
    }

    @Override
    public void deleteRdfGraphPermissions(String user, String graph) throws Exception {
        String settingsGraph = getDescribedIn(graph);
        if (settingsGraph==null)
            throw new Exception("Graph " + graph + " description was not found");

        UserProfile userProfile = getUserProfile(user);
        if (userProfile==null)
            throw new Exception("User " + user + " was not found");

        //remove old access triples
        String query = getPrefixes() + "\n"
                + "WITH <" + settingsGraph + "> "
                + " DELETE {?s ?p ?o} "
                + " WHERE { "
                + " {<" + graph + "> gkg:access ?s . ?s acl:agent <" + userProfile.getAccountURI() + "> . ?s ?p ?o . } "
                + " UNION "
                + " {?s gkg:access ?ao . ?ao acl:agent <" + userProfile.getAccountURI() + "> . ?s ?p ?o . FILTER (?s = <" + graph + "> && ?p = gkg:access) } "
                + "}";
        rdfStoreManager.execute(query, jsonResponseFormat);

        //remove rdf store permissions
        ObjectPair<String, String> rdfStoreUser = getRdfStoreUser(user);
        if (rdfStoreUser==null)
            throw new Exception("Rdf store user was not found for " + user);
        System.out.println("Remove graph permissions for graph " + graph + ", user " + user);
        rdfStoreUserManager.deleteRdfGraphPermissions(rdfStoreUser.getFirst(), graph);
    }

    @Override
    public void setDefaultGraphPermissions(String graph, int permissions) throws Exception {
        String settingsGraph = getDescribedIn(graph);
        if (settingsGraph==null)
            throw new Exception("Graph " + graph + " description was not found");

        //remove old public access triples
        String query = getPrefixes() + "\n"
                + "WITH <" + settingsGraph + "> "
                + " DELETE {?s ?p ?o} "
                + " WHERE { "
                + " {<" + graph + "> gkg:access ?s . ?s acl:agentClass foaf:Agent . ?s ?p ?o . } "
                + " UNION "
                + " {?s gkg:access ?ao . ?ao acl:agentClass foaf:Agent . ?s ?p ?o . FILTER (?s = <" + graph + "> && ?p = gkg:access) } "
                + "}";
        rdfStoreManager.execute(query, jsonResponseFormat);

        //add new public access triples
        switch (permissions) {
            case 0: //no public access
                break;
            case 1: //public read
                query = getPrefixes() + "\n"
                        + "INSERT INTO <" + settingsGraph + "> { "
                        + " <" + graph + "> gkg:access _:b1. "
                        + " _:b1 acl:agentClass foaf:Agent . "
                        + " _:b1 acl:mode acl:Read . "
                        + "}";
                rdfStoreManager.execute(query, jsonResponseFormat);
                break;
            case 3: //public write
                query = getPrefixes() + "\n"
                        + "INSERT INTO <" + settingsGraph + "> { "
                        + " <" + graph + "> gkg:access _:b1. "
                        + " _:b1 acl:agentClass foaf:Agent . "
                        + " _:b1 acl:mode acl:Write . "
                        + "}";
                rdfStoreManager.execute(query, jsonResponseFormat);
                break;
        }

        // set permissions in rdf store
        rdfStoreUserManager.setDefaultGraphPermissions(graph, permissions);
    }

    public void changePassword(String username, String oldPassword, String newPassword) throws Exception {
        if (username==null || username.isEmpty())
            throw new IllegalArgumentException("username cannot be null or empty");
        if (oldPassword==null || oldPassword.isEmpty())
            throw new IllegalArgumentException("oldPassword cannot be null or empty");
        if (newPassword==null || newPassword.isEmpty())
            throw new IllegalArgumentException("newPassword cannon be null or empty");

        if (!checkPassword(username, oldPassword))
            throw new Exception("Invalid old password");

        String query = getPrefixes() + "\n"
                + "WITH <" + frameworkConfig.getAccountsGraph() + "> "
                + " DELETE {?account user:passwordSha1Hash ?o} "
                + " INSERT {?account user:passwordSha1Hash \"" + DigestUtils.sha1Hex(newPassword) + "\"} "
                + " WHERE {?account user:loginName \"" + username + "\" . ?account user:passwordSha1Hash ?o . }";
        rdfStoreManager.execute(query, jsonResponseFormat);
    }

    public void setPassword(String usernameOrEmail, String password) throws Exception {
        if (usernameOrEmail==null || usernameOrEmail.isEmpty())
            throw new IllegalArgumentException("username cannot be null or empty");
        if (password==null || password.isEmpty())
            throw new IllegalArgumentException("password cannot be null or empty");

        String query = getPrefixes() + "\n"
                + "WITH <" + frameworkConfig.getAccountsGraph() + "> "
                + " DELETE {?account user:passwordSha1Hash ?o} "
                + " INSERT {?account user:passwordSha1Hash \"" + DigestUtils.sha1Hex(password) + "\"} "
                + " WHERE { "
                + " {?account user:loginName \"" + usernameOrEmail + "\" . OPTIONAL { ?account user:passwordSha1Hash ?o . } } "
                + " UNION "
                + " { ?account foaf:mbox <mailto:" + usernameOrEmail + "> . OPTIONAL { ?account user:passwordSha1Hash ?o . } } "
                + " }";
        rdfStoreManager.execute(query, jsonResponseFormat);
    }

    public boolean checkPassword(String usernameOrEmail, String password) throws Exception {
        String query = getPrefixes() + "\n"
                + "SELECT DISTINCT ?passwordHash FROM <" + frameworkConfig.getAccountsGraph() + "> "
                + "WHERE {"
                + " {?account user:loginName \"" + usernameOrEmail + "\" . ?account user:passwordSha1Hash ?passwordHash . } "
                + " UNION "
                + " {?account foaf:mbox <mailto:" + usernameOrEmail + "> . ?account user:passwordSha1Hash ?passwordHash . } "
                + "}";
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
        String query = getPrefixes() + "\n"
                + "ASK {GRAPH <" + frameworkConfig.getAccountsGraph() + "> "
                + " {?account user:loginName \"" + username + "\" . ?account ao:sessionToken \"" + token + "\" . } "
                + "}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        return rootNode.path("boolean").getBooleanValue();
    }

    public void saveSessionToken(String usernameOrEmail, String token) throws Exception {
        if (usernameOrEmail==null || usernameOrEmail.isEmpty())
            throw new IllegalArgumentException("username cannot be null or empty");
        if (token==null || token.isEmpty())
            throw new IllegalArgumentException("token cannot be null or empty");

        //todo replace old token if exists? or add new if user may have more than one token?
        String query = getPrefixes() + "\n"
                + "WITH <" + frameworkConfig.getAccountsGraph() + "> "
                + " INSERT { ?account ao:sessionToken \"" + token + "\" } "
                + " WHERE {"
                + " { ?account user:loginName \"" + usernameOrEmail + "\" } "
                + " UNION "
                + " { ?account foaf:mbox <mailto:" + usernameOrEmail + "> } "
                + "}";
        rdfStoreManager.execute(query, jsonResponseFormat);
    }

    public void removeAllSessionTokens(String username) throws Exception {
        if (username==null || username.isEmpty())
            throw new IllegalArgumentException("username cannot be null or empty");

        String query = getPrefixes() + "\n"
                + "DELETE FROM <" + frameworkConfig.getAccountsGraph() + "> {?account ao:sessionToken ?o} "
                + "WHERE {?account user:loginName \"" + username + "\" . ?account ao:sessionToken ?o . }";
        rdfStoreManager.execute(query, jsonResponseFormat);
    }

    // userId - username, email or account URI
    public UserProfile getUserProfile(String userId) throws Exception {
        String query = getPrefixes() + "\n"
                + "SELECT DISTINCT * FROM <" + frameworkConfig.getAccountsGraph() + "> "
                + "WHERE {"
                + " {?account user:loginName \"" + userId + "\" . ?account ?p ?o . } "
                + " UNION "
                + " {?account foaf:mbox <mailto:" + userId + "> . ?account ?p ?o . } "
                + " UNION "
                + " {?account ?p ?o . FILTER (?account = <" + userId + ">)} "
                + "}";
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
            if (predicate.equals("http://schemas.talis.com/2005/user/schema#loginName"))
                userProfile.setUsername(bindingNode.path("o").path("value").getTextValue());
            else if (predicate.endsWith("/settingsGraph"))
                userProfile.setSettingsGraph(bindingNode.path("o").path("value").getTextValue());
            else if (predicate.equals("http://xmlns.com/foaf/0.1/mbox")) {
                String mbox = bindingNode.path("o").path("value").getTextValue();
                userProfile.setEmail(mbox.substring("mailto:".length()));
            } else if (predicate.equals("http://generator.geoknow.eu/accounts/ontology/role")) {
                String role = bindingNode.path("o").path("value").getTextValue();
                userProfile.setAdmin(role.equals("http://generator.geoknow.eu/accounts/admin"));
            }
        }
        return userProfile;
    }

    public void setAdminRole(String username) throws Exception {
        String query = getPrefixes() + "\n"
                + "INSERT INTO <" + frameworkConfig.getAccountsGraph() + "> "
                + " { ?account ao:role :admin } "
                + " WHERE { ?account user:loginName \"" + username + "\" }";
        rdfStoreManager.execute(query, jsonResponseFormat);
        setDefaultRdfPermissions(username, 3);
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
        if (username==null || username.isEmpty())
            throw new IllegalArgumentException("username cannot be null");
        ObjectPair<String, String> rdfStoreUser = getRdfStoreUser(username);
        return new SecureRdfStoreManagerImpl(frameworkConfig.getAuthSparqlEndpoint(), rdfStoreUser.getFirst(), rdfStoreUser.getSecond());
    }

    //todo username must be not null (may be null now - for VirtuosoProxy)
    public ObjectPair<String, String> getRdfStoreUser(String frameworkUsername, String token) throws Exception {
        String query = getPrefixes() + "\n"
                + "SELECT ?rdfStoreUsername, ?rdfStorePassword FROM <" + frameworkConfig.getAccountsGraph() + "> "
                + "WHERE { "
                + (frameworkUsername==null || frameworkUsername.isEmpty() ? "" : "?account user:loginName \"" + frameworkUsername + "\" . ")
                + "?account ao:sessionToken \"" + token + "\" . "
                + "?account ao:rdfStoreUsername ?rdfStoreUsername . "
                + "?account ao:rdfStorePassword ?rdfStorePassword . "
                + "}";
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

    //returns list of URIs
    public Collection<String> getReadableGraphs(String username) throws Exception {
        String settingsGraph = getSettingsGraph(username);
        Collection<String> settingsGraphList = getSettingsGraphs();
        String fromGraphsStr = "";
        for (String graph : settingsGraphList) {
            if (!graph.equals(settingsGraph))
                fromGraphsStr += (" FROM <" + graph + "> \n");
        }

        String query = getPrefixes() + "\n"
                + "SELECT DISTINCT ?ng "
                + " FROM <" + frameworkConfig.getAccountsGraph() + ">\n"
                + fromGraphsStr
                + " WHERE { ?ng rdf:type sd:NamedGraph . ?ng gkg:access ?ao . ?ao acl:mode acl:Read . ?ao acl:agent ?account . ?account user:loginName \"" + username + "\" . }";
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

    //returns list of URIs
    public Collection<String> getWritableGraphs(String username) throws Exception {
        String settingsGraph = getSettingsGraph(username);
        Collection<String> settingsGraphList = getSettingsGraphs();
        String fromGraphsStr = "";
        for (String graph : settingsGraphList) {
            if (!graph.equals(settingsGraph))
                fromGraphsStr += (" FROM <" + graph + "> \n");
        }

        String query = getPrefixes() + "\n"
                + "SELECT DISTINCT ?ng "
                + " FROM <" + frameworkConfig.getAccountsGraph() + ">\n"
                + fromGraphsStr
                + " WHERE { ?ng rdf:type sd:NamedGraph . ?ng gkg:access ?ao . ?ao acl:mode acl:Write . ?ao acl:agent ?account . ?account user:loginName \"" + username + "\" . }";
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

    //returns list of URIs
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

    //returns sparql response string
    public String getAllGraphsSparql() throws Exception {
        Collection<String> settingsGraphs = getSettingsGraphs();
        String fromStr = "";
        for (String sg : settingsGraphs)
            fromStr += ("FROM <" + sg + ">\n");
        String query = getPrefixes() + "\n"
                + "SELECT ?s ?p ?o "
                + fromStr
                + " WHERE {"
                + " { ?s rdf:type sd:NamedGraph . ?s ?p ?o . } "
                + " UNION "
                + " { ?ng rdf:type sd:NamedGraph . ?ng sd:graph ?s . ?s ?p ?o . } "
                + " UNION "
                + " { ?ng rdf:type sd:NamedGraph . ?ng gkg:access ?s . ?s ?p ?o . } "
                + "}";
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
        if (settingsGraph==null)
            throw new Exception("Graph " + graph + " description was not found");
        String query = getPrefixes() + "\n"
                + "SELECT ?account FROM <" + settingsGraph + "> WHERE {?ng rdf:type sd:NamedGraph . ?ng gkg:access ?ao . ?ao acl:agent ?account . } ";
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
        String query = getPrefixes() + "\n"
                + "SELECT ?rdfStoreUsername ?rdfStorePassword FROM <" + frameworkConfig.getAccountsGraph() + "> "
                + "WHERE {"
                + " {?account user:loginName \"" + frameworkUserId + "\" . ?account ao:rdfStoreUsername ?rdfStoreUsername . ?account ao:rdfStorePassword ?rdfStorePassword . } "
                + " UNION "
                + " {?account foaf:mbox <mailto:" + frameworkUserId + "> . ?account ao:rdfStoreUsername ?rdfStoreUsername . ?account ao:rdfStorePassword ?rdfStorePassword . } "
                + " UNION "
                + " {<" + frameworkUserId + "> rdf:type ao:Account . <" + frameworkUserId + "> ao:rdfStoreUsername ?rdfStoreUsername . <" + frameworkUserId + "> ao:rdfStorePassword ?rdfStorePassword . } "
                + "}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        if (!bindingsIter.hasNext())
            return null;
        JsonNode binding = bindingsIter.next();
        return new ObjectPair<String, String>(binding.path("rdfStoreUsername").path("value").getTextValue(), binding.path("rdfStorePassword").path("value").getTextValue());
    }

    public String getDescribedIn(String graph) throws Exception {
        Collection<String> settingsGraphs = getSettingsGraphs();
        StringBuilder queryBuilder = new StringBuilder();
        queryBuilder.append(getPrefixes()).append("\n").append("SELECT DISTINCT ?sg \n");
        queryBuilder.append("FROM <").append(frameworkConfig.getAccountsGraph()).append(">\n");
        for (String sg : settingsGraphs)
            queryBuilder.append("FROM <").append(sg).append(">\n");
        queryBuilder.append("WHERE { <").append(graph).append("> rdf:type sd:NamedGraph . <").append(graph).append("> acl:owner ?account . ?account ao:settingsGraph ?sg }");
        String result = rdfStoreManager.execute(queryBuilder.toString(), jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        if (bindingsIter.hasNext()) {
            return bindingsIter.next().path("sg").path("value").getTextValue();
        }
        return null;
    }

    private String getPrefixes() {
        if (prefixes==null) {
            prefixes ="PREFIX : <" + frameworkConfig.getResourceNamespace() + ">\n" 
            		+ "PREFIX ao: <" + frameworkConfig.getAccountsOntologyNamespace() + ">\n"
            		+ "PREFIX gkg: <"+ frameworkConfig.getFrameworkOntologyNS() +">\n"
                    + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"
                    + "PREFIX user: <http://schemas.talis.com/2005/user/schema#>\n"
                    + "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>\n"
                    + "PREFIX acl: <http://www.w3.org/ns/auth/acl#>\n"
                    + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"
                    + "PREFIX dcterms: <http://purl.org/dc/terms/>";
        }
        return prefixes;
    }

    private String getSettingsGraph(String username) throws Exception {
        String query = getPrefixes() + "\n"
                + "SELECT ?settingsGraph FROM <" + frameworkConfig.getAccountsGraph() + "> "
                + "WHERE {?account user:loginName \"" + username + "\" . ?account ao:settingsGraph ?settingsGraph .}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        return bindingsIter.hasNext() ? bindingsIter.next().path("settingsGraph").path("value").getTextValue() : null;
    }

    private boolean checkUserExists(String username, String email) throws Exception {
        String query = getPrefixes() + "\n"
                + "ASK {"
                + " { GRAPH <" + frameworkConfig.getAccountsGraph() + "> {?account user:loginName \"" + username + "\"} } "
                + " UNION "
                + " { GRAPH <" + frameworkConfig.getAccountsGraph() + "> {?account foaf:mbox <mailto:" + email + ">} }"
                + "}";
        String result = rdfStoreManager.execute(query, jsonResponseFormat);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(result);
        return rootNode.path("boolean").getBooleanValue();
    }

    private Collection<String> getSettingsGraphs() throws Exception {
        Collection<String> settingsGraphList = new ArrayList<String>();
        settingsGraphList.add(frameworkConfig.getSettingsGraph());
        String query = getPrefixes() + "\n"
                + " SELECT DISTINCT ?sg FROM <" + frameworkConfig.getAccountsGraph() + "> "
                + " WHERE { ?account ao:settingsGraph ?sg }";
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

    private Collection<String> getAllUsernames() throws Exception {
        String query = getPrefixes() + "\n"
                + "SELECT DISTINCT ?username FROM <" + frameworkConfig.getAccountsGraph() + "> "
                + " WHERE {?account rdf:type ao:Account . ?account user:loginName ?username}";
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
        String query = getPrefixes() + "\n"
                + "SELECT DISTINCT ?ng "
                + " FROM <" + settingsGraph + "> "
                + " FROM <" + frameworkConfig.getAccountsGraph() + "> "
                + " WHERE { ?ng rdf:type sd:NamedGraph . ?ng acl:owner ?account . ?account user:loginName \"" + username + "\" . }";
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
}
