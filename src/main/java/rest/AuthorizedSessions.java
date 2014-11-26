package rest;

import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
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
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;

import rdf.SecureRdfStoreManagerImpl;
import util.ObjectPair;
import accounts.FrameworkUserManager;
import accounts.UserProfile;
import authentication.FrameworkConfiguration;

import com.google.gson.JsonObject;
import com.ontos.ldiw.vocabulary.LDIWO;

/**
 * 
 * @author alejandragarciarojas
 * 
 */
@Path("/session")
public class AuthorizedSessions {

    private static final Logger log = Logger.getLogger(AuthorizedSessions.class);

    private FrameworkUserManager frameworkUserManager;
    private String sessionsGraph;
    private String endpoint;

    private SecureRdfStoreManagerImpl frameworkRdfStoreManager;

    public AuthorizedSessions(@Context ServletContext context) throws ServletException {
        try {
            FrameworkConfiguration frameworkConfig = FrameworkConfiguration.getInstance(context);
            frameworkUserManager = frameworkConfig.getFrameworkUserManager();
            sessionsGraph = frameworkConfig.getAuthSessionsGraph();
            endpoint = FrameworkConfiguration.getInstance(context).getAuthSparqlEndpoint();
            frameworkRdfStoreManager = new SecureRdfStoreManagerImpl(frameworkConfig
                    .getAuthSparqlEndpoint(), frameworkConfig.getAuthSparqlUser(), frameworkConfig
                    .getAuthSparqlPassword());
        } catch (FileNotFoundException e) {
            log.error(e);
            e.printStackTrace();
            throw new WebApplicationException(e);
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            throw new WebApplicationException(e);
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
                return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials")
                        .build();
            log.info(" user: " + userProfile.getUsername());
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }
        /*
         * generates a session for the user and stores it in the sessions graph
         * <accountURI> LDIWO.sessionToken
         * "1fe39ef0-6987-11e4-9803-0800200c9a66"^^xsd:string
         */
        String sessionToken = UUID.randomUUID().toString();

        String query = "INSERT INTO <" + sessionsGraph + "> { <" + userProfile.getAccountURI()
                + ">   <" + LDIWO.sessionToken + "> \"" + sessionToken + "\"^^xsd:string . }";
        log.debug(query);

        try {
            frameworkRdfStoreManager.execute(query, "json");
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }

        JsonObject body = new JsonObject();
        body.addProperty("endpoint", "rest/session/" + sessionToken);
        return Response.status(Response.Status.CREATED).entity(body.toString()).build();
    }

    @GET
    @Path("{sessionToken}")
    public Response get(@PathParam("sessionToken") String sessionToken, @Context UriInfo uriInfo)
            throws Exception {
        MultivaluedMap<String, String> formParams = new MultivaluedHashMap<String, String>();
        return post(sessionToken, uriInfo, formParams);
    }

    @POST
    @Path("{sessionToken}")
    public Response post(@PathParam("sessionToken") String sessionToken, @Context UriInfo uriInfo,
            MultivaluedMap<String, String> formParams) throws Exception {

        String username = "";
        /*
         * retrieves form user that created that session and the rdfUser and
         * paswword for that user
         */
        try {
            String query = "SELECT ?user FROM <" + sessionsGraph + "> WHERE { ?user " + " <"
                    + LDIWO.sessionToken + "> \"" + sessionToken + "\"^^xsd:string .}";

            String result = frameworkRdfStoreManager.execute(query, "json");

            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(result);
            Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings")
                    .getElements();

            if (bindingsIter.hasNext()) {
                JsonNode bindingNode = bindingsIter.next();
                username = bindingNode.get("user").path("value").getTextValue();
            }

        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }
        log.debug("user:" + username + "-");
        if (username.equals(""))
            return Response.status(Response.Status.NOT_FOUND).build();

        ObjectPair<String, String> rdfStoreUser = frameworkUserManager.getRdfStoreUser(username);

        // create a context with credentials
        UsernamePasswordCredentials credentials = new UsernamePasswordCredentials(rdfStoreUser
                .getFirst(), rdfStoreUser.getSecond());
        BasicCredentialsProvider credsProvider = new BasicCredentialsProvider();
        credsProvider.setCredentials(AuthScope.ANY, credentials);
        HttpClientContext context = HttpClientContext.create();
        context.setCredentialsProvider(credsProvider);
        // create post method and set parameters
        HttpPost proxyMethod = new HttpPost(endpoint);
        ArrayList<NameValuePair> postParameters = new ArrayList<NameValuePair>();
        // when is GET we extract query params using uriInfo
        for (Entry<String, List<String>> entity : uriInfo.getQueryParameters().entrySet())
            postParameters.add(new BasicNameValuePair(entity.getKey(), entity.getValue().get(0)));
        // when is POST we extract using formParams
        for (String key : formParams.keySet())
            postParameters.add(new BasicNameValuePair(key, formParams.getFirst(key)));

        proxyMethod.setEntity(new UrlEncodedFormEntity(postParameters));
        // create the httpclient and reads/wirtes repsponse
        CloseableHttpClient httpClient = HttpClients.createDefault();
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
        // retuns response
        return Response.ok(stream).build();

    }

    @DELETE
    @Path("{sessionToken}")
    public Response delete(@PathParam("sessionToken") String sessionToken,
            @CookieParam(value = "user") Cookie userc, @CookieParam(value = "token") String token) {

        /*
         * authenticates the user, throw exception if failed
         */
        UserProfile userProfile;
        try {
            // authenticates the user, throw exception if fail
            userProfile = frameworkUserManager.validate(userc, token);
            if (userProfile == null)
                return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials")
                        .build();
            log.info(" user: " + userProfile.getUsername());
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }

        String query = "DELETE FROM <" + sessionsGraph + "> {?s ?p ?o} "
                + "WHERE { ?s ?p ?o . FILTER(str(?o) = \"" + sessionToken + "\") } ";
        log.debug(query);

        try {
            log.info(frameworkRdfStoreManager.execute(query, "json"));
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }

        return Response.status(Response.Status.NO_CONTENT).build();
    }
}
