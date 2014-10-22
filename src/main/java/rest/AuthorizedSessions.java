package rest;

import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.Map.Entry;
import java.util.UUID;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.ws.rs.CookieParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
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

import util.ObjectPair;
import accounts.FrameworkUserManager;
import authentication.FrameworkConfiguration;

import com.google.gson.JsonObject;

/**
 * 
 * @author alejandragarciarojas
 * 
 */
@Path("/session")
public class AuthorizedSessions {

    private static final Logger log = Logger.getLogger(AuthorizedSessions.class);

    private FrameworkUserManager frameworkUserManager;
    private ObjectPair<String, String> rdfStoreUser;
    // TODO: the information of this map has to be stored in the user settings
    // graph instead
    public static Hashtable<String, String> map = new Hashtable<String, String>();
    private String endpoint;

    public AuthorizedSessions(@Context ServletContext context) throws ServletException {
        try {
            frameworkUserManager = FrameworkConfiguration.getInstance(context)
                    .getFrameworkUserManager();
            endpoint = FrameworkConfiguration.getInstance(context).getAuthSparqlEndpoint();
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
    public Response create(@QueryParam("username") String username,
            @CookieParam(value = "token") String token) {

        log.debug("user:" + username + " token:" + token);
        try {
            rdfStoreUser = frameworkUserManager.getRdfStoreUser(username, token);
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();

        }
        String sessionToken = UUID.randomUUID().toString();
        map.put(sessionToken, rdfStoreUser.getFirst() + ":" + rdfStoreUser.getSecond());
        log.debug(map.toString());
        JsonObject body = new JsonObject();
        body.addProperty("endpoint", "rest/session/" + sessionToken);
        return Response.ok(body.toString(), MediaType.APPLICATION_JSON).build();
    }

    @GET
    @Path("{sessionToken}")
    public Response get(@PathParam("sessionToken") String sessionToken, @Context UriInfo uriInfo)
            throws Exception {
        return post(sessionToken, uriInfo);
    }

    @POST
    @Path("{sessionToken}")
    public Response post(@PathParam("sessionToken") String sessionToken, @Context UriInfo uriInfo)
            throws Exception {

        log.info(sessionToken);
        log.debug(AuthorizedSessions.map.toString());

        String userLogin = AuthorizedSessions.map.get(sessionToken);
        log.debug(userLogin);
        if (userLogin == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        // create a context with credentials
        String[] creds = userLogin.split(":");
        UsernamePasswordCredentials credentials = new UsernamePasswordCredentials(creds[0],
                creds[1]);
        BasicCredentialsProvider credsProvider = new BasicCredentialsProvider();
        credsProvider.setCredentials(AuthScope.ANY, credentials);
        HttpClientContext context = HttpClientContext.create();
        context.setCredentialsProvider(credsProvider);
        // create post method and set parameters
        HttpPost proxyMethod = new HttpPost(endpoint);
        ArrayList<NameValuePair> postParameters = new ArrayList<NameValuePair>();
        for (Entry<String, List<String>> entity : uriInfo.getQueryParameters().entrySet()) {
            postParameters.add(new BasicNameValuePair(entity.getKey(), entity.getValue().get(0)));

        }
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
}
