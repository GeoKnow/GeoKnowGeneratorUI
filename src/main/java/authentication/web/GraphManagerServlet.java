package authentication.web;

import accounts.FrameworkUserManager;
import accounts.UserProfile;
import accounts.VirtuosoUserManager;
import authentication.FrameworkConfiguration;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import rdf.RdfStoreManager;
import rdf.RdfStoreManagerImpl;
import rdf.SecureRdfStoreManagerImpl;
import rdf.VirtuosoGraphGroupManager;
import util.HttpUtils;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;

public class GraphManagerServlet extends HttpServlet {
    private FrameworkUserManager frameworkUserManager;
    private VirtuosoUserManager virtuosoUserManager;
    private VirtuosoGraphGroupManager virtuosoGraphGroupManager;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        FrameworkConfiguration frameworkConfig = FrameworkConfiguration.getInstance();
        frameworkUserManager = frameworkConfig.getFrameworkUserManager();
        virtuosoUserManager = frameworkConfig.getVirtuosoUserManager();
        virtuosoGraphGroupManager = new VirtuosoGraphGroupManager(frameworkConfig.getVirtuosoJdbcConnString(),
                frameworkConfig.getVirtuosoDbaUser(), frameworkConfig.getVirtuosoDbaPassword());
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doPost(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String responseFormat = req.getParameter("format");
        String username = req.getParameter("username");
        String token = HttpUtils.getCookieValue(req, "token");
        String mode = req.getParameter("mode");

        boolean unauthorizedUser = username==null || username.isEmpty();

        if (!unauthorizedUser) {
            if (token==null)
                throw new ServletException("null token");
            boolean checkToken;
            try {
                checkToken = frameworkUserManager.checkToken(username, token);
            } catch (Exception e) {
                throw new ServletException(e);
            }
            if (!checkToken)
                throw new ServletException("Invalid token " + token + " for user " + username);
        }

        String result;

        try {
            if ("create".equals(mode)) {
                String graph = req.getParameter("graph");
                String permissions = req.getParameter("permissions");
                RdfStoreManager rdfStoreManager;
                if (unauthorizedUser) {
                    rdfStoreManager = new RdfStoreManagerImpl(FrameworkConfiguration.getInstance().getPublicSparqlEndpoint());
                    virtuosoUserManager.setDefaultGraphPermissions(graph, 3); //unauthorized user can create only public writable graph
                } else {
                    rdfStoreManager = frameworkUserManager.getRdfStoreManager(username);
                    String virtuosoUser = frameworkUserManager.getRdfStoreUser(username).getFirst();
                    virtuosoUserManager.setRdfGraphPermissions(virtuosoUser, graph, 3); //owner can read and write graph
                    setGraphPermissions(graph, permissions);
                }
                result = rdfStoreManager.execute("CREATE SILENT GRAPH <" + graph + ">", responseFormat);
            } else if ("drop".equals(mode)) {
                String graph = req.getParameter("graph");

                //get rdf store manager
                RdfStoreManager rdfStoreManager;
                if (unauthorizedUser)
                    rdfStoreManager = new RdfStoreManagerImpl(FrameworkConfiguration.getInstance().getPublicSparqlEndpoint());
                else
                    rdfStoreManager = frameworkUserManager.getRdfStoreManager(username);

                //drop graph
                result = rdfStoreManager.execute("DROP SILENT GRAPH <" + graph + ">", responseFormat);

                //remove graph from graph groups descriptions
                FrameworkConfiguration frameworkConf = FrameworkConfiguration.getInstance();
                RdfStoreManager frameworkRdfStoreManager = new SecureRdfStoreManagerImpl(frameworkConf.getSparqlEndpoint(),
                        frameworkConf.getSparqlFrameworkLogin(), frameworkConf.getSparqlFrameworkPassword());
                String query = "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#> "
                        + " WITH <" + frameworkConf.getGroupsGraph() + "> DELETE {?s sd:namedGraph <" + graph + ">} "
                        + " WHERE {?s sd:namedGraph <" + graph + ">}";
                frameworkRdfStoreManager.execute(query, null);
            } else if ("update".equals(mode)) {
                String graph = req.getParameter("graph");

                //delete old user permissions
                Collection<String> users = frameworkUserManager.getUsers(graph);
                for (String u : users) {
                    String virtuosoUser = frameworkUserManager.getRdfStoreUser(u).getFirst();
                    virtuosoUserManager.deleteRdfGraphPermissions(virtuosoUser, graph);
                }

                //set new user permissions
                String permissions = req.getParameter("permissions");
                setGraphPermissions(graph, permissions);

                result = "{\"results\" : \"success\"}";
            } else if ("getAll".equals(mode)) {
                Collection<String> graphs = frameworkUserManager.getAllGraphs();
                result = new ObjectMapper().writeValueAsString(graphs);
            } else if ("getAllSparql".equals(mode)) {
                result = frameworkUserManager.getAllGraphsSparql();
            } else if ("updateForeign".equals(mode)) {
                UserProfile userProfile = frameworkUserManager.getUserProfile(username);
                if (!userProfile.isAdmin())
                    throw new ServletException("Access denied");

                String graph = req.getParameter("graph");
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode graphNode = objectMapper.readTree(graph);
                String graphURI = graphNode.path("name").getTextValue();
                String settingsGraph = frameworkUserManager.getDescribedIn(graphURI);

                //update metadata
                FrameworkConfiguration frameworkConf = FrameworkConfiguration.getInstance();
                RdfStoreManager frameworkRdfStoreManager = new SecureRdfStoreManagerImpl(frameworkConf.getSparqlEndpoint(),
                        frameworkConf.getSparqlFrameworkLogin(), frameworkConf.getSparqlFrameworkPassword());

                String graphLabel = graphNode.path("graph").path("label").getTextValue();
                String graphDescription = graphNode.path("graph").path("description").getTextValue();
                String graphModified = graphNode.path("graph").path("modified").getTextValue();
                String query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                        + "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
                        + "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>\n"
                        + "WITH <" + settingsGraph + "> "
                        + " DELETE { ?s rdfs:label ?label . ?s dcterms:description ?descr . ?s dcterms:modified ?modif. } "
                        + " INSERT { ?s rdfs:label \"" + graphLabel + "\" . ?s dcterms:description \"" + graphDescription + "\" . ?s dcterms:modified \"" + graphModified + "\" . } "
                        + " WHERE { <" + graphURI + "> sd:graph ?s . ?s rdfs:label ?label . ?s dcterms:description ?descr . ?s dcterms:modified ?modif. }";
                frameworkRdfStoreManager.execute(query, responseFormat);

                //set public access
                String publicAccess = graphNode.path("publicAccess").getTextValue();
                if (publicAccess.equals("acl:Read"))
                    frameworkUserManager.setDefaultGraphPermissions(graphURI, 1);
                else if (publicAccess.equals("acl:Write"))
                    frameworkUserManager.setDefaultGraphPermissions(graphURI, 3);
                else
                    frameworkUserManager.setDefaultGraphPermissions(graphURI, 0);

                //set users access
                Collection<String> users = frameworkUserManager.getUsers(graphURI);
                for (String u : users)
                    frameworkUserManager.deleteRdfGraphPermissions(u, graphURI);
                Iterator<JsonNode> readersIter = graphNode.path("usersRead").getElements();
                while (readersIter.hasNext())
                    frameworkUserManager.setRdfGraphPermissions(readersIter.next().getTextValue(), graphURI, 1);
                Iterator<JsonNode> writersIter = graphNode.path("usersWrite").getElements();
                while (writersIter.hasNext())
                    frameworkUserManager.setRdfGraphPermissions(writersIter.next().getTextValue(), graphURI, 3);

                //result
                result = "{\"results\" : \"success\"}";
            } else if ("dropForeign".equals(mode)) {
                UserProfile userProfile = frameworkUserManager.getUserProfile(username);
                if (!userProfile.isAdmin())
                    throw new ServletException("Access denied");

                // drop graph
                String graph = req.getParameter("graph");
                RdfStoreManager rdfStoreManager = frameworkUserManager.getRdfStoreManager(username);
                rdfStoreManager.execute("DROP SILENT GRAPH <" + graph + ">", responseFormat);

                //drop graph metadata
                String settingsGraph = frameworkUserManager.getDescribedIn(graph);
                FrameworkConfiguration frameworkConf = FrameworkConfiguration.getInstance();
                RdfStoreManager frameworkRdfStoreManager = new SecureRdfStoreManagerImpl(frameworkConf.getSparqlEndpoint(),
                        frameworkConf.getSparqlFrameworkLogin(), frameworkConf.getSparqlFrameworkPassword());
                String query = "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>\n"
                        + "PREFIX gkg: <http://generator.geoknow.eu/ontology/>\n"
                        + "WITH <" + settingsGraph + "> "
                        + " DELETE {?s ?p ?o} "
                        + " WHERE { "
                        + " { ?s ?p ?o . FILTER (?s = <" + graph + ">) } "
                        + " UNION "
                        + " { <" + graph + "> sd:graph ?s . ?s ?p ?o . } "
                        + " UNION "
                        + " { <" + graph + "> gkg:access ?s . ?s ?p ?o . } "
                        + " UNION "
                        + " {?s ?p ?o . FILTER (?s = <http://generator.geoknow.eu/resource/default-dataset> && ?p = sd:namedGraph && ?o = <" + graph + ">) } "
                        + "}";
                frameworkRdfStoreManager.execute(query, responseFormat);

                //remove graph from graph groups descriptions
                query = "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#> "
                        + " WITH <" + frameworkConf.getGroupsGraph() + "> DELETE {?s sd:namedGraph <" + graph + ">} "
                        + " WHERE {?s sd:namedGraph <" + graph + ">}";
                frameworkRdfStoreManager.execute(query, null);

                //result
                result = "{\"results\" : \"success\"}";
            } else if ("createGroup".equals(mode)) {
                String group = req.getParameter("group");
                String[] graphs = req.getParameterValues("graphs");
                virtuosoGraphGroupManager.createGraphGroup(group);
                if (graphs!=null) {
                    for (String g : graphs)
                        virtuosoGraphGroupManager.addGraph(group, g);
                }
                virtuosoUserManager.setDefaultGraphPermissions(group, 8);

                result = "{\"results\" : \"success\"}";
            } else if ("updateGroup".equals(mode)) {
                String group = req.getParameter("group");
                String[] graphs = req.getParameterValues("graphs");
                virtuosoGraphGroupManager.dropGroup(group);
                virtuosoGraphGroupManager.createGraphGroup(group);
                if (graphs!=null) {
                    for (String g : graphs)
                        virtuosoGraphGroupManager.addGraph(group, g);
                }

                result = "{\"results\" : \"success\"}";
            } else if ("dropGroup".equals(mode)) {
                String group = req.getParameter("group");
                virtuosoGraphGroupManager.dropGroup(group);

                result = "{\"results\" : \"success\"}";
            } else {
                throw new ServletException("Unexpected mode " + mode);
            }

            resp.setContentType(responseFormat);
            resp.getWriter().print(result);
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    private void setGraphPermissions(String graph, String permissionsString) throws Exception {
        if (permissionsString==null || permissionsString.isEmpty())
            return;
        //set public graph permissions
        GraphPermissions graphPermissions = parsePermissions(permissionsString);
        virtuosoUserManager.setDefaultGraphPermissions(graph, graphPermissions.getDefaultPermissions());
        //set users permissions
        for (Map.Entry<String, Integer> userPerm : graphPermissions.getUserPermissions().entrySet()) {
            String virtuosoUser = frameworkUserManager.getRdfStoreUser(userPerm.getKey()).getFirst();
            virtuosoUserManager.setRdfGraphPermissions(virtuosoUser, graph, userPerm.getValue());
        }
    }

    private GraphPermissions parsePermissions(String permissionsStr) throws IOException {
        System.out.println("User graph permissions: " + permissionsStr);
        GraphPermissions graphPermissions = new GraphPermissions();
        if (permissionsStr!=null && !permissionsStr.isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            Iterator<JsonNode> permissionsIter = mapper.readTree(permissionsStr).getElements();
            while (permissionsIter.hasNext()) {
                JsonNode permissionNode = permissionsIter.next();
                String username = permissionNode.path("username").getTextValue();
                String permStr = permissionNode.path("permissions").getTextValue();
                Integer perm = null;
                if ("n".equals(permStr))
                    perm = 0;
                else if ("r".equals(permStr))
                    perm = 1;
                else if ("w".equals(permStr))
                    perm = 3;
                if (perm!=null) {
                    if (username==null || username.isEmpty())
                        graphPermissions.setDefaultPermissions(perm);
                    else
                        graphPermissions.setUserPermissions(username, perm);
                }
            }
        }
        return graphPermissions;
    }

    private class GraphPermissions {
        private int defaultPermissions = 0;
        private HashMap<String, Integer> userPermissions = new HashMap<String, Integer>(); // username->permissions

        public Integer getDefaultPermissions() {
            return defaultPermissions;
        }

        public void setDefaultPermissions(int defaultPermissions) {
            this.defaultPermissions = defaultPermissions;
        }

        public HashMap<String, Integer> getUserPermissions() {
            return userPermissions;
        }

        public void setUserPermissions(String username, int permissions) {
            userPermissions.put(username, permissions);
        }
    }
}
