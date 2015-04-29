package eu.geoknow.generator.rest;

import java.util.Collection;

import javax.servlet.ServletContext;
import javax.ws.rs.CookieParam;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import eu.geoknow.generator.component.beans.Service;
import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.configuration.FrameworkManager;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserProfile;

/**
 * Retrieves the configuration
 * 
 * @author alejandragarciarojas
 *
 */
@Path("/config")
public class Configuration {

  private static final Logger log = Logger.getLogger(Configuration.class);

  private static FrameworkUserManager frameworkUserManager;

  /**
   * Get application basic parameters
   * 
   * @return JSON object with the configuration information available in the
   *         configuration-famework.nt file
   */
  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response getConfiguration(@Context ServletContext context) {

    FrameworkConfiguration frameworkConf;
    JsonObject config = null;
    try {
      frameworkConf = FrameworkConfiguration.getInstance();
      config = new JsonObject();
      config.addProperty("frameworkUri", frameworkConf.getFrameworkUri());
      config.addProperty("ns", frameworkConf.getResourceNamespace());
      config.addProperty("defaultSettingsGraphUri", frameworkConf.getSettingsGraph());
      config.addProperty("groupsGraphUri", frameworkConf.getGroupsGraph());
      config.addProperty("accountsGraph", frameworkConf.getAccountsGraph());
      config.addProperty("sparqlEndpoint", frameworkConf.getPublicSparqlEndpoint());
      config.addProperty("authSparqlEndpoint", frameworkConf.getAuthSparqlEndpoint());
      config.addProperty("homepage", frameworkConf.getHomepage());
      config.addProperty("flagPath", frameworkConf.getFrameworkDataDir());

    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.EXPECTATION_FAILED).entity(e.getMessage()).build();
    }
    return Response.ok(config.toString(), MediaType.APPLICATION_JSON).build();
  }

  /**
   * 
   * @param context
   * @return
   */
  @GET
  @Path("/services")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getServices(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token) {

    UserProfile user;
    try {
      FrameworkUserManager frameworkUserManager =
          FrameworkConfiguration.getInstance().getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      FrameworkManager manager = new FrameworkManager();
      Collection<Service> services = manager.getFrameworkServices();
      Gson gson = new Gson();
      String json = "{ \"services\" : " + gson.toJson(services) + "}";
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();
    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  /**
   * 
   * @param context
   * @return
   */
  @GET
  @Path("/services/{uri : .+}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getService(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token, @PathParam("uri") String uri) {

    UserProfile user;
    try {
      FrameworkUserManager frameworkUserManager =
          FrameworkConfiguration.getInstance().getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      FrameworkManager manager = new FrameworkManager();
      Service service = manager.getFrameworkService(uri);
      Gson gson = new Gson();
      String json = "{ \"service\" : " + gson.toJson(service) + "}";
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();
    } catch (ResourceNotFoundException e) {
      log.error(e);
      return Response.status(Response.Status.NO_CONTENT).entity(e.getMessage()).build();
    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

}
