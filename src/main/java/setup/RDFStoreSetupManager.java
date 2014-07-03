package setup;

import accounts.FrameworkUserManager;
import accounts.VirtuosoUserManager;
import authentication.FrameworkConfiguration;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.RiotException;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import rdf.RdfStoreManager;
import rdf.RdfStoreManagerImpl;
import rdf.SecureRdfStoreManagerImpl;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;

/**
 * Created by taleksaschina on 30.06.2014.
 */
public class RDFStoreSetupManager {
    private File catalinaBase = new File(System.getProperty("catalina.base")).getAbsoluteFile();
    private File initFile = new File(catalinaBase.getAbsoluteFile(), "webapps/generator/WEB-INF/init.txt");

    //set rdf store up using configuration; if reset==true than clear (using config) rdf store and set up once again
    public void setUp(FrameworkConfiguration config, boolean reset) throws Exception {
        //already set up
        System.out.println("[DEBUG] System is already initialized. Reset is not required.");
        if (isSetUp() && !reset)
            return;

        //clear init flag
        System.out.println("[DEBUG] Clear flag");
        if (initFile.exists()) {
            boolean deleted = initFile.delete();
            if (!deleted)
                throw new Exception("Failed to delete init flag file " + initFile.getPath());
        }

        //reset
        if (reset) {
            clear(config);
        }

        //init
        VirtuosoUserManager userManager = config.getVirtuosoUserManager();

        //check if auth user doesn't exists
        boolean authSparqlUserExist = userManager.checkUserExists(config.getAuthSparqlUser(), null);
        if (authSparqlUserExist)
            throw new Exception("Auth SPARQL user " + config.getAuthSparqlUser() + " already exists");

        // check if system graphs doesn't exist
        RdfStoreManagerImpl publicRdfStoreManager = new RdfStoreManagerImpl(config.getPublicSparqlEndpoint());
        String queryString = "SELECT DISTINCT ?g WHERE {GRAPH ?g {?s ?p ?o}}";
        String response = publicRdfStoreManager.execute(queryString, "json");
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(response);
        Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").getElements();
        while (bindingsIter.hasNext()) {
            JsonNode bindingNode = bindingsIter.next();
            String graph = bindingNode.path("g").path("value").getTextValue();
            if (graph.equals(config.getSettingsGraph()) || graph.equals(config.getAccountsGraph())
                    || graph.equals(config.getGroupsGraph()) || graph.equals(config.getInitialSettingsGraph())) {
                throw new Exception("Graph " + graph + " already exists");
            }
        }

        // Read configuration files
        String configurationFile = "framework-configuration.ttl";
        String datasetsFile = "framework-datasets.ttl";
        String componentsFile = "framework-components.ttl";
        String ontologyFile = "framework-ontology.ttl";
        String accountsOntologyFile = "framework-ontology.ttl";
        Model configurationModel = ModelFactory.createDefaultModel();
        Model datasetModel = ModelFactory.createDefaultModel();
        Model componentsModel = ModelFactory.createDefaultModel();
        Model ontologyModel = ModelFactory.createDefaultModel();
        Model ontologyAccountsModel = ModelFactory.createDefaultModel();
        try {
            configurationModel.read(configurationFile);
            datasetModel.read(datasetsFile);
            componentsModel.read(componentsFile);
            ontologyModel.read(ontologyFile);
            ontologyAccountsModel.read(accountsOntologyFile);
        } catch (RiotException e) {
            throw new IOException("Malformed configuration files");
        }

        System.out.println("[INFO] System Initialization ");

        //create user
        userManager.createUser(config.getAuthSparqlUser(), config.getAuthSparqlPassword());
        userManager.setDefaultRdfPermissions(config.getAuthSparqlUser(), 3);
        userManager.grantRole(config.getAuthSparqlUser(), "SPARQL_UPDATE");
        userManager.grantLOLook(config.getAuthSparqlUser());
        try {
            userManager.grantRole("SPARQL", "SPARQL_UPDATE");
            userManager.grantLOLook("SPARQL");
        } catch (Exception e) {
            //role is already granted
            e.printStackTrace();
        }
        System.out.println("[INFO] System User was created ");

        // TODO: replace with a logging implementation
        System.out.println("[INFO] Default Graphs creation/configuration ");

        SecureRdfStoreManagerImpl frameworkRdfStoreManager = new SecureRdfStoreManagerImpl(config.getAuthSparqlEndpoint(),
                config.getAuthSparqlUser(), config.getAuthSparqlPassword());

        // create required named graphs and load the configuration files
        // using framework default user
        frameworkRdfStoreManager.createGraph(config.getSettingsGraph());
        frameworkRdfStoreManager.createGraph(config.getAccountsGraph());
        frameworkRdfStoreManager.createGraph(config.getGroupsGraph());
        frameworkRdfStoreManager.createGraph(config.getInitialSettingsGraph());

        // Make graphs accessible to framework user only
        userManager.setDefaultRdfPermissions("nobody", 0);
        userManager.setRdfGraphPermissions(config.getAuthSparqlUser(), config.getSettingsGraph(), 3);
        userManager.setRdfGraphPermissions(config.getAuthSparqlUser(), config.getAccountsGraph(), 3);
        userManager.setRdfGraphPermissions(config.getAuthSparqlUser(), config.getGroupsGraph(), 3);
        userManager.setRdfGraphPermissions(config.getAuthSparqlUser(), config.getInitialSettingsGraph(), 3);

        //settings model
        Model settingsModel = ModelFactory.createDefaultModel();
        settingsModel.add(datasetModel);
        settingsModel.add(componentsModel);
        settingsModel.add(ontologyModel);

        // add to settings virtuoso component without users/passwords
        queryString = "PREFIX foaf:<http://xmlns.com/foaf/0.1/> "
                + "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
                + "PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> "
                + "PREFIX lds:<http://stack.linkeddata.org/ldis-schema/>" + " CONSTRUCT   { <"
                + config.getFrameworkUri() + "> ?p ?o . " + "<" + config.getFrameworkUri()
                + "> lds:integrates ?component ."
                + "?component rdfs:label ?label . ?component rdf:type ?type . "
                + "?component lds:providesService ?service . ?service rdf:type ?servicetype ."
                + "?service lds:serviceUrl ?serviceUrl .} " + " WHERE  { <"
                + config.getFrameworkUri() + "> ?p ?o ." + "<" + config.getFrameworkUri()
                + "> lds:integrates ?component ."
                + "?component rdfs:label ?label . ?component rdf:type ?type . "
                + "?component lds:providesService ?service . ?service rdf:type ?servicetype ."
                + "?service lds:serviceUrl ?serviceUrl .}";
        QueryExecution qexec = QueryExecutionFactory.create(queryString, configurationModel);
        Model triples = qexec.execConstruct();
        settingsModel.add(triples);
        qexec.close();

        // write the initial settings model (default settings for new users)
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        settingsModel.write(os, "N-TRIPLES");
        queryString = "INSERT DATA { GRAPH <" + config.getInitialSettingsGraph() + "> { " + os.toString() + " } }";
        os.close();
        frameworkRdfStoreManager.execute(queryString, null);

        // write the system settings model (include system graphs data)
        os = new ByteArrayOutputStream();
        settingsModel.write(os, "N-TRIPLES");
        queryString = "INSERT DATA { GRAPH <" + config.getSettingsGraph() + "> { " + os.toString() + " } }";
        os.close();
        frameworkRdfStoreManager.execute(queryString, null);

        // create and add accounts ontology to the accounts graph
        os = new ByteArrayOutputStream();
        ontologyAccountsModel.write(os, "N-TRIPLES");
        queryString = "INSERT DATA { GRAPH <" + config.getAccountsGraph() + "> { " + os.toString() + " } }";
        os.close();
        frameworkRdfStoreManager.execute(queryString, null);

        //create users from framework configuration
        FrameworkUserManager frameworkUserManager = config.getFrameworkUserManager();
        String query = "PREFIX gkg: <http://ldiw.ontos.com/acc/ontology/> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
                + " PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX lds: <http://stack.linkeddata.org/ldis-schema/> "
                + " SELECT ?accountName ?password ?mailto ?role WHERE { ?account rdf:type gkg:Account . ?account foaf:accountName ?accountName . "
                + " ?account lds:password ?password . ?account foaf:mbox ?mailto . ?account gkg:Role ?role . } ";
        qexec = QueryExecutionFactory.create(query, configurationModel);
        ResultSet results = qexec.execSelect();
        while (results.hasNext()) {
            QuerySolution soln = results.next();
            String accountName = soln.get("accountName").asLiteral().getString();
            String password = soln.get("password").asLiteral().getString();
            String email = soln.get("mailto").toString().substring("mailto:".length());
            String role = soln.get("role").toString();
            if (frameworkUserManager.checkUserExists(accountName, email))
                throw new Exception("User " + accountName + " already exists");
            frameworkUserManager.createUser(accountName, password, email);
            frameworkUserManager.setRole(accountName, role);
        }
        qexec.close();

        System.out.println("[DEBUG] System was initialized successfully. Create flag.");
        boolean created = initFile.createNewFile();
        if (!created)
            throw new Exception("Failed to create init flag file " + initFile.getPath());
    }

    //clear rdf store using configuration: drop system graphs, sparql auth user, all registered users (if exists)
    public void clear(FrameworkConfiguration config) throws Exception {
        System.out.println("[INFO] Clear system");

        VirtuosoUserManager virtuosoUserManager = config.getVirtuosoUserManager();

        System.out.println("[INFO] Check system SPARQL user exists");
        if (!virtuosoUserManager.checkUserExists(config.getAuthSparqlUser(), null)) {
            //if user doesn't exists than we cannot drop registered users and system graphs
            //if system graphs exists than it may be used by another installation, so drop it manually if you need
            return;
        }

        FrameworkUserManager frameworkUserManager = config.getFrameworkUserManager();
        RdfStoreManager rdfStoreManager = new SecureRdfStoreManagerImpl(config.getAuthSparqlEndpoint(),
                config.getAuthSparqlUser(), config.getAuthSparqlPassword());

        //drop registered users
        System.out.println("[DEBUG] Drop registered users");
        Collection<String> users = frameworkUserManager.getAllUsernames();
        for (String user : users) {
            frameworkUserManager.dropUser(user);
        }

        //drop system graphs
        System.out.println("[DEBUG] Drop system graphs");
        rdfStoreManager.dropGraph(config.getSettingsGraph());
        rdfStoreManager.dropGraph(config.getAccountsGraph());
        rdfStoreManager.dropGraph(config.getGroupsGraph());
        rdfStoreManager.dropGraph(config.getInitialSettingsGraph());

        //drop sparql user
        System.out.println("[DEBUG] Drop system SPARQL user");
        virtuosoUserManager.dropUser(config.getAuthSparqlUser());
    }

    public boolean isSetUp() {
        return initFile.exists();
    }
}
