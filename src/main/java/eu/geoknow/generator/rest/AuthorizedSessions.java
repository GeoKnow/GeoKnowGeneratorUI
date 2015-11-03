package eu.geoknow.generator.rest;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.Iterator;
import java.util.List;
import java.util.Map.Entry;
import java.util.UUID;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.ws.rs.CookieParam;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedHashMap;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;
import javax.ws.rs.core.UriInfo;

import org.apache.http.NameValuePair;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.ontos.ldiw.vocabulary.LDIWO;

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.graphs.GraphsManager;
import eu.geoknow.generator.graphs.beans.Contribution;
import eu.geoknow.generator.graphs.beans.NamedGraph;
import eu.geoknow.generator.rdf.SecureRdfStoreManagerImpl;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserProfile;

/**
 * 
 * @author alejandragarciarojas
 * 
 *         TODO: errors on the server are not given back to the client
 */
@Path("/session")
public class AuthorizedSessions {

  private static final Logger log = Logger.getLogger(AuthorizedSessions.class);
  private static final String jsonResponseFormat = "application/sparql-results+json";

  private FrameworkUserManager frameworkUserManager;
  private String sessionsGraph;
  private String endpoint;

  private SecureRdfStoreManagerImpl frameworkRdfStoreManager;

  public AuthorizedSessions(@Context ServletContext context) throws ServletException,
      InformationMissingException {

    try {
      frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
      sessionsGraph = FrameworkConfiguration.getInstance().getAuthSessionsGraph();
      endpoint = FrameworkConfiguration.getInstance().getAuthSparqlEndpoint();
      frameworkRdfStoreManager = FrameworkConfiguration.getInstance().getSystemRdfStoreManager();
      log.debug(this.toString());
    } catch (IOException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

  }

  @PUT
  @Produces(MediaType.APPLICATION_JSON)
  public Response create(@CookieParam(value = "user") Cookie userc,
      @CookieParam(value = "token") String token) {

    /*
     * authenticates the user, throw exception if failed
     */
    UserProfile userProfile;
    try {
      // authenticates the user, throw exception if fail
      userProfile = frameworkUserManager.validate(userc, token);
      if (userProfile == null)
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      log.info(" user: " + userProfile.getUsername());
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    // TODO reuse an existing session token, if it exists?

    /*
     * generates a session for the user and stores it in the sessions graph <accountURI>
     * LDIWO.sessionToken "1fe39ef0-6987-11e4-9803-0800200c9a66"^^xsd:string
     */
    String sessionToken = UUID.randomUUID().toString();

    String query =
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>" + "\n" + "INSERT DATA { GRAPH <"
            + sessionsGraph + "> { <" + userProfile.getAccountURI() + ">   <" + LDIWO.sessionToken
            + "> \"" + sessionToken + "\"^^xsd:string . } }";
    log.debug(query);

    try {
      frameworkRdfStoreManager.execute(query, jsonResponseFormat);
    } catch (Exception e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    JsonObject body = new JsonObject();
    body.addProperty("endpoint", "rest/session/" + sessionToken);
    return Response.status(Response.Status.CREATED).entity(body.toString()).build();
  }

  @GET
  @Path("{sessionToken}")
  public Response get(@PathParam("sessionToken") String sessionToken, @Context UriInfo uriInfo,
      @Context HttpHeaders headers) throws Exception {
    MultivaluedMap<String, String> formParams = new MultivaluedHashMap<String, String>();
    return post(sessionToken, uriInfo, formParams, headers);
  }

  @POST
  @Path("{sessionToken}")
  public Response post(@PathParam("sessionToken") String sessionToken, @Context UriInfo uriInfo,
      MultivaluedMap<String, String> formParams, @Context HttpHeaders headers) throws Exception {

    String username = "";
    try {
      username = getUser(sessionToken);
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }


    log.debug("user:" + username + "-");
    if (username.equals(""))
      return Response.status(Response.Status.NOT_FOUND).build();

    UsernamePasswordCredentials credentials =
        new UsernamePasswordCredentials(FrameworkConfiguration.getInstance()
            .getWorkbenchSystemAdmin(), FrameworkConfiguration.getInstance()
            .getWorkbenchSystemAdminPassword());
    BasicCredentialsProvider credsProvider = new BasicCredentialsProvider();
    credsProvider.setCredentials(AuthScope.ANY, credentials);
    HttpClientContext context = HttpClientContext.create();
    context.setCredentialsProvider(credsProvider);
    // create post method and set parameters
    HttpPost proxyMethod = new HttpPost(endpoint);

    MultivaluedMap<String, String> requestHeaders = headers.getRequestHeaders();

    log.debug("REQUEST HEADERS");
    for (Entry<String, List<String>> entity : requestHeaders.entrySet()) {
      log.debug(entity.getKey() + " -> " + entity.getValue());
      if (entity.getKey().equals("cookie") || entity.getKey().equals("content-length"))
        continue;
      proxyMethod.addHeader(entity.getKey(), entity.getValue().get(0));
    }

    ArrayList<NameValuePair> postParameters = new ArrayList<NameValuePair>();
    // when is GET we extract query params using uriInfo
    for (Entry<String, List<String>> entity : uriInfo.getQueryParameters().entrySet())
      postParameters.add(new BasicNameValuePair(entity.getKey(), entity.getValue().get(0)));
    // when is POST we extract using formParams
    for (String key : formParams.keySet())
      postParameters.add(new BasicNameValuePair(key, formParams.getFirst(key)));

    proxyMethod.setEntity(new UrlEncodedFormEntity(postParameters, "UTF-8"));
    // create the httpclient and reads/wirtes repsponse
    CloseableHttpClient httpClient = HttpClients.createDefault();

    try {
      final CloseableHttpResponse response = httpClient.execute(proxyMethod, context);
      StreamingOutput stream = new StreamingOutput() {
        @Override
        public void write(OutputStream os) throws IOException, WebApplicationException {
          // TODO Auto-generated method stub
          Writer writer = new BufferedWriter(new OutputStreamWriter(os));
          int b;
          while ((b = response.getEntity().getContent().read()) != -1) {
            writer.write(b);
          }
          writer.flush();
        }
      };
      return Response.ok(stream).build();
    } catch (Exception e) {
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
    // retuns response


  }

  private String getUser(String sessionToken) throws Exception {
    /*
     * retrieves form user that created that session and the rdfUser and paswword for that user
     */
    String username = "";
    String query =
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>" + "\n" + "SELECT ?user FROM <"
            + sessionsGraph + "> WHERE { ?user " + " <" + LDIWO.sessionToken + "> \""
            + sessionToken + "\"^^xsd:string .}";

    String result = frameworkRdfStoreManager.execute(query, jsonResponseFormat);

    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();

    if (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();
      username = bindingNode.get("user").path("value").textValue();
    }
    return username;

  }

  @DELETE
  @Path("{sessionToken}")
  public Response delete(@PathParam("sessionToken") String sessionToken, @CookieParam(
      value = "user") Cookie userc, @CookieParam(value = "token") String token) {

    /*
     * authenticates the user, throw exception if failed
     */
    UserProfile userProfile;
    try {
      // authenticates the user, throw exception if fail
      userProfile = frameworkUserManager.validate(userc, token);
      if (userProfile == null)
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      log.info(" user: " + userProfile.getUsername());
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    String query =
        "DELETE { GRAPH <" + sessionsGraph + "> {?s ?p ?o .} } " + "WHERE { GRAPH <"
            + sessionsGraph + "> { ?s ?p ?o . FILTER(str(?o) = \"" + sessionToken + "\") } } ";
    log.debug(query);

    try {
      log.info(frameworkRdfStoreManager.execute(query, jsonResponseFormat));
    } catch (Exception e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    return Response.status(Response.Status.NO_CONTENT).build();
  }

  /**
   * Update the metadata of a contributiuon
   * 
   * @param sessionToken
   * @param userc
   * @param token
   * @return
   */
  @PUT
  @Path("{sessionToken}")
  public Response addContribution(@PathParam("sessionToken") String sessionToken,
      Contribution contribution) {

    /*
     * Check that the session exists
     */
    String username = "";
    try {
      username = getUser(sessionToken);
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    log.debug("user:" + username + "-");
    if (username.equals(""))
      return Response.status(Response.Status.UNAUTHORIZED).build();

    try {
      if (contribution.getDate() == null) {
        // 2015-06-12T14:35:00
        Calendar cal = GregorianCalendar.getInstance();
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        format.setCalendar(cal);
        contribution.setDate(format.format(cal.getTime()));
      }
      GraphsManager manager = new GraphsManager();
      NamedGraph graph = manager.addContribution(contribution);

      Gson gson = new Gson();
      String json = "{ \"namedgraph\" : " + gson.toJson(graph) + "}";
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }
}
