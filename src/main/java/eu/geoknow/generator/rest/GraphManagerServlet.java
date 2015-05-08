package eu.geoknow.generator.rest;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.ws.rs.CookieParam;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.rdf.GraphGroupManager;
import eu.geoknow.generator.rdf.RdfStoreManager;
import eu.geoknow.generator.rdf.RdfStoreManagerImpl;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserManager;
import eu.geoknow.generator.users.UserProfile;

@Path("/GraphManagerServlet")
public class GraphManagerServlet {
  private static final Logger log = Logger.getLogger(GraphManagerServlet.class);


  @POST
  @Path("/createGraph")
  @Produces(MediaType.APPLICATION_JSON)
  public Response createGraph(@Context ServletContext context, @CookieParam("token") String token,
      @FormParam("graph") String graph, @FormParam("permissions") String permissions,
      @FormParam("username") String username, @FormParam("metadata") String metadata) {
    FrameworkConfiguration frameworkConfiguration;
    try {
      frameworkConfiguration = FrameworkConfiguration.getInstance();
    } catch (Exception e) {
      log.error("Failed to get framework configuration", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("Failed to get framework config").build();
    }
    UserManager rdfStoreUserManager = frameworkConfiguration.getRdfStoreUserManager();
    FrameworkUserManager frameworkUserManager = frameworkConfiguration.getFrameworkUserManager();

    try {
      checkToken(username, token, frameworkUserManager);
    } catch (Exception e) {
      log.error("Token checking failed: user = " + username + ", token = " + token, e);
      return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
    }
    log.info(metadata);
    log.info(permissions);
    RdfStoreManager rdfStoreManager;
    boolean unauthorizedUser = username == null || username.isEmpty();
    try {
      if (unauthorizedUser) {
        log.info("unauthorised user creates a graph <" + graph + ">");
        rdfStoreManager = new RdfStoreManagerImpl(frameworkConfiguration.getPublicSparqlEndpoint());
        rdfStoreUserManager.setDefaultGraphPermissions(graph, UserManager.GraphPermissions.WRITE);
      } else {
        log.info(username + " user creates a graph <" + graph + ">");
        rdfStoreManager = frameworkUserManager.getRdfStoreManager(username);
        rdfStoreUserManager.setRdfGraphPermissions(username, graph,
            UserManager.GraphPermissions.WRITE);
        setGraphPermissions(graph, permissions, rdfStoreUserManager);
      }
      // in current version we write graph metadata in fronted (js), so
      // here we need just to create graph in RDF store
      // todo maybe later move all metadata operation to backend
      String result = rdfStoreManager.createGraph(graph);
      return Response.status(Response.Status.OK).entity(result).build();
    } catch (Exception e) {
      log.error("Failed to create graph " + graph + " for user " + username, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  @POST
  @Path("/dropGraph")
  @Produces(MediaType.APPLICATION_JSON)
  public Response dropGraph(@Context ServletContext context,
      @CookieParam(value = "user") Cookie userc, @CookieParam(value = "token") String token,
      @FormParam("graph") String graph) {
    FrameworkConfiguration frameworkConfig = null;
    try {
      frameworkConfig = FrameworkConfiguration.getInstance();
    } catch (Exception e) {
      log.error("Failed to get framework configuration", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("Failed to get framework config").build();
    }
    FrameworkUserManager frameworkUserManager = frameworkConfig.getFrameworkUserManager();

    UserProfile user;
    try {
      // authenticates the user, throw exception if fail
      user = frameworkConfig.getFrameworkUserManager().validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
    String username = user.getUsername();

    boolean unauthorizedUser = username == null || username.isEmpty();

    try {
      // get rdf store manager
      RdfStoreManager rdfStoreManager;
      if (unauthorizedUser)
        rdfStoreManager = new RdfStoreManagerImpl(frameworkConfig.getPublicSparqlEndpoint());
      else
        rdfStoreManager = frameworkUserManager.getRdfStoreManager(username);

      // drop graph
      String result = rdfStoreManager.dropGraph(graph);

      // remove graph from graph groups descriptions
      RdfStoreManager frameworkRdfStoreManager = frameworkConfig.getSystemRdfStoreManager();
      String query =
          "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#> "
              + " DELETE WHERE {GRAPH <" + frameworkConfig.getGroupsGraph()
              + "> {?s sd:namedGraph <" + graph + ">}}";
      frameworkRdfStoreManager.execute(query, null);

      return Response.status(Response.Status.OK).entity(result).build();
    } catch (Exception e) {
      log.error("Failed to drop graph " + graph + " for user " + username, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  @POST
  @Path("/updateGraph")
  @Produces(MediaType.APPLICATION_JSON)
  public Response updateGraph(@Context ServletContext context, @CookieParam("token") String token,
      @FormParam("graph") String graph, @FormParam("permissions") String permissions,
      @FormParam("username") String username) {
    FrameworkConfiguration frameworkConfig = null;
    try {
      frameworkConfig = FrameworkConfiguration.getInstance();
    } catch (Exception e) {
      log.error("Failed to get framework configuration", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("Failed to get framework config").build();
    }
    FrameworkUserManager frameworkUserManager = frameworkConfig.getFrameworkUserManager();

    try {
      checkToken(username, token, frameworkUserManager);
    } catch (Exception e) {
      log.error("Token checking failed: user = " + username + ", token = " + token, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      UserManager rdfStoreUserManager = frameworkConfig.getRdfStoreUserManager();

      // delete old user permissions
      Collection<String> users = frameworkUserManager.getUsers(graph);
      for (String u : users) {
        rdfStoreUserManager.deleteRdfGraphPermissions(u, graph);
      }

      // set new user permissions
      setGraphPermissions(graph, permissions, rdfStoreUserManager);

      String result = "{\"results\" : \"success\"}";
      return Response.status(Response.Status.OK).entity(result).build();
    } catch (Exception e) {
      log.error("Failed to update graph " + graph + " permissions", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  @POST
  @Path("/getAllGraphs")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getAllGraphs(@Context ServletContext context, @CookieParam("token") String token,
      @FormParam("username") String username) {
    FrameworkConfiguration frameworkConfig = null;
    try {
      frameworkConfig = FrameworkConfiguration.getInstance();
    } catch (Exception e) {
      log.error("Failed to get framework configuration", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("Failed to get framework config").build();
    }
    FrameworkUserManager frameworkUserManager = frameworkConfig.getFrameworkUserManager();

    try {
      checkToken(username, token, frameworkUserManager);
    } catch (Exception e) {
      log.error("Token checking failed: user = " + username + ", token = " + token, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      Collection<String> graphs = frameworkUserManager.getAllGraphs();
      String result = new ObjectMapper().writeValueAsString(graphs);

      return Response.status(Response.Status.OK).entity(result).build();
    } catch (Exception e) {
      log.error("Failed to read all graphs", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  @POST
  @Path("/getAllGraphsSparql")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getAllGraphsSparql(@Context ServletContext context,
      @CookieParam("token") String token, @FormParam("username") String username) {
    FrameworkConfiguration frameworkConfig = null;
    try {
      frameworkConfig = FrameworkConfiguration.getInstance();
    } catch (Exception e) {
      log.error("Failed to get framework configuration", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("Failed to get framework config").build();
    }
    FrameworkUserManager frameworkUserManager = frameworkConfig.getFrameworkUserManager();

    try {
      checkToken(username, token, frameworkUserManager);
    } catch (Exception e) {
      log.error("Token checking failed: user = " + username + ", token = " + token, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      String result = frameworkUserManager.getAllGraphsSparql();
      return Response.status(Response.Status.OK).entity(result).build();
    } catch (Exception e) {
      log.error("Failed to read all graphs", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  @POST
  @Path("/updateForeign")
  @Produces(MediaType.APPLICATION_JSON)
  public Response updateForeign(@Context ServletContext context,
      @CookieParam("token") String token, @FormParam("graph") String graph,
      @FormParam("format") String responseFormat, @FormParam("username") String username) {
    FrameworkConfiguration frameworkConfig = null;
    try {
      frameworkConfig = FrameworkConfiguration.getInstance();
    } catch (Exception e) {
      log.error("Failed to get framework configuration", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("Failed to get framework config").build();
    }
    FrameworkUserManager frameworkUserManager = frameworkConfig.getFrameworkUserManager();

    try {
      checkToken(username, token, frameworkUserManager);
    } catch (Exception e) {
      log.error("Token checking failed: user = " + username + ", token = " + token, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      if (!frameworkUserManager.isAdmin(username))
        return Response.status(Response.Status.FORBIDDEN).entity("Access denied").build();

      ObjectMapper objectMapper = new ObjectMapper();
      JsonNode graphNode = objectMapper.readTree(graph);
      String graphURI = graphNode.path("name").textValue();
      String settingsGraph = frameworkUserManager.getDescribedIn(graphURI);

      // update metadata
      RdfStoreManager frameworkRdfStoreManager = frameworkConfig.getSystemRdfStoreManager();

      String graphLabel = graphNode.path("graph").path("label").textValue();
      String graphDescription = graphNode.path("graph").path("description").textValue();
      String graphModified = graphNode.path("graph").path("modified").textValue();
      // OntoQuad doesn't support DELETE {...} INSERT {...} WHERE {...},
      // so use 2 queries
      String deleteQuery =
          "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
              + "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
              + "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>\n"
              + " DELETE {GRAPH <"
              + settingsGraph
              + "> { ?s rdfs:label ?label . ?s dcterms:description ?descr . ?s dcterms:modified ?modif. } } "
              + " WHERE {GRAPH <"
              + settingsGraph
              + "> { <"
              + graphURI
              + "> sd:graph ?s . ?s rdfs:label ?label . ?s dcterms:description ?descr . ?s dcterms:modified ?modif. }}";
      String insertQuery =
          "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
              + "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
              + "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>\n"
              + " INSERT {GRAPH <"
              + settingsGraph
              + "> { ?s rdfs:label \""
              + graphLabel
              + "\" . ?s dcterms:description \""
              + graphDescription
              + "\" . ?s dcterms:modified \""
              + graphModified
              + "\" . } } "
              + " WHERE {GRAPH <"
              + settingsGraph
              + "> { <"
              + graphURI
              + "> sd:graph ?s . ?s rdfs:label ?label . ?s dcterms:description ?descr . ?s dcterms:modified ?modif. } }";
      // todo replace 2 queries with this query when OntoQuad will support
      // DELETE {...} INSERT {...} WHERE {...} queries
      // String query =
      // "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
      // + "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
      // +
      // "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>\n"
      // + "WITH <" + settingsGraph + "> "
      // +
      // " DELETE { ?s rdfs:label ?label . ?s dcterms:description ?descr . ?s dcterms:modified ?modif. } "
      // + " INSERT { ?s rdfs:label \"" + graphLabel +
      // "\" . ?s dcterms:description \"" + graphDescription +
      // "\" . ?s dcterms:modified \"" + graphModified + "\" . } "
      // + " WHERE { <" + graphURI +
      // "> sd:graph ?s . ?s rdfs:label ?label . ?s dcterms:description ?descr . ?s dcterms:modified ?modif. }";
      frameworkRdfStoreManager.execute(deleteQuery, responseFormat);
      frameworkRdfStoreManager.execute(insertQuery, responseFormat);

      // set public access
      String publicAccess = graphNode.path("publicAccess").textValue();
      if (publicAccess.equals("acl:Read"))
        frameworkUserManager
            .setDefaultGraphPermissions(graphURI, UserManager.GraphPermissions.READ);
      else if (publicAccess.equals("acl:Write"))
        frameworkUserManager.setDefaultGraphPermissions(graphURI,
            UserManager.GraphPermissions.WRITE);
      else
        frameworkUserManager.setDefaultGraphPermissions(graphURI, UserManager.GraphPermissions.NO);

      // set users access
      Collection<String> users = frameworkUserManager.getUsers(graphURI);
      for (String u : users)
        frameworkUserManager.deleteRdfGraphPermissions(u, graphURI);
      Iterator<JsonNode> readersIter = graphNode.path("usersRead").elements();
      while (readersIter.hasNext())
        frameworkUserManager.setRdfGraphPermissions(readersIter.next().textValue(), graphURI,
            UserManager.GraphPermissions.READ);
      Iterator<JsonNode> writersIter = graphNode.path("usersWrite").elements();
      while (writersIter.hasNext())
        frameworkUserManager.setRdfGraphPermissions(writersIter.next().textValue(), graphURI,
            UserManager.GraphPermissions.WRITE);

      String result = "{\"results\" : \"success\"}";
      return Response.status(Response.Status.OK).entity(result).build();
    } catch (Exception e) {
      log.error("Failed to update foreign " + graph, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  @POST
  @Path("/dropForeign")
  @Produces(MediaType.APPLICATION_JSON)
  public Response dropForeign(@Context ServletContext context, @CookieParam("token") String token,
      @FormParam("graph") String graph, @FormParam("format") String responseFormat,
      @FormParam("username") String username) {
    FrameworkConfiguration frameworkConfig = null;
    try {
      frameworkConfig = FrameworkConfiguration.getInstance();
    } catch (Exception e) {
      log.error("Failed to get framework configuration", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("Failed to get framework config").build();
    }
    FrameworkUserManager frameworkUserManager = frameworkConfig.getFrameworkUserManager();

    try {
      checkToken(username, token, frameworkUserManager);
    } catch (Exception e) {
      log.error("Token checking failed: user = " + username + ", token = " + token, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      if (!frameworkUserManager.isAdmin(username))
        return Response.status(Response.Status.FORBIDDEN).entity("Access denied").build();

      // drop graph
      RdfStoreManager rdfStoreManager = frameworkUserManager.getRdfStoreManager(username);
      rdfStoreManager.dropGraph(graph);

      // drop graph metadata
      String settingsGraph = frameworkUserManager.getDescribedIn(graph);
      RdfStoreManager frameworkRdfStoreManager = frameworkConfig.getSystemRdfStoreManager();
      String query =
          "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>\n"
              + "PREFIX gkg: <http://ldiw.ontos.com/ontology/>\n" + " DELETE {GRAPH <"
              + settingsGraph
              + "> {?s ?p ?o} } "
              + " WHERE { "
              + " {GRAPH <"
              + settingsGraph
              + "> { ?s ?p ?o . FILTER (?s = <"
              + graph
              + ">) } } "
              + " UNION "
              + " {GRAPH <"
              + settingsGraph
              + "> { <"
              + graph
              + "> sd:graph ?s . ?s ?p ?o . } } "
              + " UNION "
              + " {GRAPH <"
              + settingsGraph
              + "> { <"
              + graph
              + "> gkg:access ?s . ?s ?p ?o . } } "
              + " UNION "
              + " {GRAPH <"
              + settingsGraph
              + "> {?s ?p ?o . FILTER (?s = <http://ldiw.ontos.com/resource/default-dataset> && ?p = sd:namedGraph && ?o = <"
              + graph + ">) } } " + "}";
      frameworkRdfStoreManager.execute(query, responseFormat);

      // remove graph from graph groups descriptions
      query =
          "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#> "
              + " DELETE WHERE {GRAPH <" + frameworkConfig.getGroupsGraph()
              + "> {?s sd:namedGraph <" + graph + ">} }";
      frameworkRdfStoreManager.execute(query, null);

      String result = "{\"results\" : \"success\"}";
      return Response.status(Response.Status.OK).entity(result).build();
    } catch (Exception e) {
      log.error("Failed to drop foreign " + graph, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  @POST
  @Path("/createGroup")
  @Produces(MediaType.APPLICATION_JSON)
  public Response createGroup(@Context ServletContext context, @CookieParam("token") String token,
      @FormParam("group") String group, @FormParam("graphs") List<String> graphs,
      @FormParam("username") String username) {
    FrameworkConfiguration frameworkConfig = null;
    try {
      frameworkConfig = FrameworkConfiguration.getInstance();
    } catch (Exception e) {
      log.error("Failed to get framework configuration", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("Failed to get framework config").build();
    }
    FrameworkUserManager frameworkUserManager = frameworkConfig.getFrameworkUserManager();

    try {
      checkToken(username, token, frameworkUserManager);
    } catch (Exception e) {
      log.error("Token checking failed: user = " + username + ", token = " + token, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      GraphGroupManager graphGroupManager = frameworkConfig.getGraphGroupManager();
      UserManager rdfStoreUserManager = frameworkConfig.getRdfStoreUserManager();

      graphGroupManager.createGraphGroup(group);
      if (graphs != null) {
        for (String g : graphs)
          graphGroupManager.addGraph(group, g);
      }
      rdfStoreUserManager.setDefaultGraphPermissions(group,
          UserManager.GraphPermissions.LIST_GRAPH_GROUP);

      String result = "{\"results\" : \"success\"}";
      return Response.status(Response.Status.OK).entity(result).build();
    } catch (Exception e) {
      log.error("Failed to create graph group " + group, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  @POST
  @Path("/updateGroup")
  @Produces(MediaType.APPLICATION_JSON)
  public Response updateGroup(@Context ServletContext context, @CookieParam("token") String token,
      @FormParam("group") String group, @FormParam("graphs") List<String> graphs,
      @FormParam("username") String username) {
    FrameworkConfiguration frameworkConfig = null;
    try {
      frameworkConfig = FrameworkConfiguration.getInstance();
    } catch (Exception e) {
      log.error("Failed to get framework configuration", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("Failed to get framework config").build();
    }
    FrameworkUserManager frameworkUserManager = frameworkConfig.getFrameworkUserManager();

    try {
      checkToken(username, token, frameworkUserManager);
    } catch (Exception e) {
      log.error("Token checking failed: user = " + username + ", token = " + token, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      GraphGroupManager graphGroupManager = frameworkConfig.getGraphGroupManager();
      graphGroupManager.dropGroup(group);
      graphGroupManager.createGraphGroup(group);
      if (graphs != null) {
        for (String g : graphs)
          graphGroupManager.addGraph(group, g);
      }

      String result = "{\"results\" : \"success\"}";
      return Response.status(Response.Status.OK).entity(result).build();
    } catch (Exception e) {
      log.error("Failed to update graph group " + group, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  @POST
  @Path("/dropGroup")
  @Produces(MediaType.APPLICATION_JSON)
  public Response dropGroup(@Context ServletContext context, @CookieParam("token") String token,
      @FormParam("group") String group, @FormParam("username") String username) {
    FrameworkConfiguration frameworkConfig = null;
    try {
      frameworkConfig = FrameworkConfiguration.getInstance();
    } catch (Exception e) {
      log.error("Failed to get framework configuration", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("Failed to get framework config").build();
    }
    FrameworkUserManager frameworkUserManager = frameworkConfig.getFrameworkUserManager();

    try {
      checkToken(username, token, frameworkUserManager);
    } catch (Exception e) {
      log.error("Token checking failed: user = " + username + ", token = " + token, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      GraphGroupManager graphGroupManager = frameworkConfig.getGraphGroupManager();

      graphGroupManager.dropGroup(group);

      String result = "{\"results\" : \"success\"}";
      return Response.status(Response.Status.OK).entity(result).build();
    } catch (Exception e) {
      log.error("Failed to drop graph group " + group, e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  private void setGraphPermissions(String graph, String permissionsString,
      UserManager rdfStoreUserManager) throws Exception {
    if (permissionsString == null || permissionsString.isEmpty())
      return;
    // set public graph permissions
    GraphPermissions graphPermissions = parsePermissions(permissionsString);
    rdfStoreUserManager.setDefaultGraphPermissions(graph, graphPermissions.getDefaultPermissions());
    // set users permissions
    for (Map.Entry<String, UserManager.GraphPermissions> userPerm : graphPermissions
        .getUserPermissions().entrySet()) {
      rdfStoreUserManager.setRdfGraphPermissions(userPerm.getKey(), graph, userPerm.getValue());
    }
  }

  private GraphPermissions parsePermissions(String permissionsStr) throws IOException {
    log.info("User graph permissions: " + permissionsStr);
    GraphPermissions graphPermissions = new GraphPermissions();
    if (permissionsStr != null && !permissionsStr.isEmpty()) {
      ObjectMapper mapper = new ObjectMapper();
      Iterator<JsonNode> permissionsIter = mapper.readTree(permissionsStr).elements();
      while (permissionsIter.hasNext()) {
        JsonNode permissionNode = permissionsIter.next();
        String username = permissionNode.path("username").textValue();
        String permStr = permissionNode.path("permissions").textValue();
        UserManager.GraphPermissions perm = null;
        if ("n".equals(permStr))
          perm = UserManager.GraphPermissions.NO;
        else if ("r".equals(permStr))
          perm = UserManager.GraphPermissions.READ;
        else if ("w".equals(permStr))
          perm = UserManager.GraphPermissions.WRITE;
        if (perm != null) {
          if (username == null || username.isEmpty())
            graphPermissions.setDefaultPermissions(perm);
          else
            graphPermissions.setUserPermissions(username, perm);
        }
      }
    }
    return graphPermissions;
  }

  private void checkToken(String username, String token, FrameworkUserManager frameworkUserManager)
      throws Exception {
    boolean unauthorizedUser = username == null || username.isEmpty();
    if (!unauthorizedUser) {
      if (token == null)
        throw new Exception("null token");
      boolean checkToken = frameworkUserManager.checkToken(username, token);
      if (!checkToken)
        throw new Exception("Invalid token " + token + " for user " + username);
    }
  }

  private class GraphPermissions {
    private UserManager.GraphPermissions defaultPermissions = UserManager.GraphPermissions.NO;
    private HashMap<String, UserManager.GraphPermissions> userPermissions =
        new HashMap<String, UserManager.GraphPermissions>(); // username->permissions

    public UserManager.GraphPermissions getDefaultPermissions() {
      return defaultPermissions;
    }

    public void setDefaultPermissions(UserManager.GraphPermissions defaultPermissions) {
      this.defaultPermissions = defaultPermissions;
    }

    public HashMap<String, UserManager.GraphPermissions> getUserPermissions() {
      return userPermissions;
    }

    public void setUserPermissions(String username, UserManager.GraphPermissions permissions) {
      userPermissions.put(username, permissions);
    }
  }
}
