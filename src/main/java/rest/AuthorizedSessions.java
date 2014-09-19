package rest;

import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
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

import org.apache.commons.httpclient.Credentials;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.UsernamePasswordCredentials;
import org.apache.commons.httpclient.auth.AuthScope;
import org.apache.commons.httpclient.methods.PostMethod;
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

    private static final Logger log = Logger
	    .getLogger(AuthorizedSessions.class);

    private FrameworkUserManager frameworkUserManager;
    private ObjectPair<String, String> rdfStoreUser;
    public static Hashtable<String, String> map = new Hashtable<String, String>();
    private String endpoint;

    public AuthorizedSessions(@Context ServletContext context)
	    throws ServletException {

	try {
	    frameworkUserManager = FrameworkConfiguration.getInstance(context)
		    .getFrameworkUserManager();
	    endpoint = FrameworkConfiguration.getInstance(context)
		    .getAuthSparqlEndpoint();
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
	    rdfStoreUser = frameworkUserManager
		    .getRdfStoreUser(username, token);
	} catch (Exception e) {
	    log.error(e);
	    e.printStackTrace();
	    return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
		    .entity(e.getMessage()).build();

	}
	String sessionToken = UUID.randomUUID().toString();
	map.put(sessionToken,
		rdfStoreUser.getFirst() + ":" + rdfStoreUser.getSecond());
	log.debug(map.toString());
	JsonObject body = new JsonObject();
	body.addProperty("endpoint", "rest/session/" + sessionToken);
	return Response.ok(body.toString(), MediaType.APPLICATION_JSON).build();
    }

    @GET
    @Path("{sessionToken}")
    public Response get(@PathParam("sessionToken") String sessionToken,
	    @Context UriInfo uriInfo) throws Exception {
	return post(sessionToken, uriInfo);
    }

    @POST
    @Path("{sessionToken}")
    public Response post(@PathParam("sessionToken") String sessionToken,
	    @Context UriInfo uriInfo) throws Exception {

	log.info(sessionToken);
	log.debug(AuthorizedSessions.map.toString());

	String userLogin = AuthorizedSessions.map.get(sessionToken);
	log.debug(userLogin);
	if (userLogin == null) {
	    return Response.status(Response.Status.UNAUTHORIZED).build();
	}

	String[] creds = userLogin.split(":");
	Credentials defaultcreds = new UsernamePasswordCredentials(creds[0],
		creds[1]);

	HttpClient proxy = new HttpClient();
	proxy.getState().setCredentials(AuthScope.ANY, defaultcreds);

	final PostMethod proxyMethod = new PostMethod(endpoint);

	for (Entry<String, List<String>> entity : uriInfo.getQueryParameters()
		.entrySet()) {
	    proxyMethod.addParameter(entity.getKey(), entity.getValue().get(0));
	}

	log.debug(proxyMethod.getParameters().toString());

	proxyMethod.setDoAuthentication(true);
	proxy.executeMethod(proxyMethod);

	StreamingOutput stream = new StreamingOutput() {
	    @Override
	    public void write(OutputStream os) throws IOException {
		Writer writer = new BufferedWriter(new OutputStreamWriter(os));
		int b;
		while ((b = proxyMethod.getResponseBodyAsStream().read()) != -1) {
		    writer.write(b);
		}
		writer.flush();
	    }
	};

	return Response.ok(stream).build();

    }

}
