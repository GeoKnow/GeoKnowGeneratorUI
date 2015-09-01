package eu.geoknow.generator.rest;

import java.util.Collection;

import javax.ws.rs.CookieParam;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;

import com.google.gson.Gson;

import eu.geoknow.generator.component.ComponentManager;
import eu.geoknow.generator.component.beans.Service;
import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserProfile;

/**
 * A REST interface for the Components manager that will allow to manage components integrated in
 * the workbench
 * 
 * @author alejandragarciarojas
 *
 */
@Path("/services")
public class Services {

  private static final Logger log = Logger.getLogger(Components.class);

  /**
   * Get the data of a single service
   * 
   * @return JSON
   */
  @GET
  @Path("/{id : .+}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getService(@PathParam("id") String id, @CookieParam(value = "user") Cookie userc,
      @CookieParam(value = "token") String token) {

    FrameworkUserManager frameworkUserManager;
    UserProfile user;
    try {
      frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {

      ComponentManager manager =
          new ComponentManager(FrameworkConfiguration.getInstance().getSystemRdfStoreManager());

      Service service = manager.getService(id);
      // in fact not all properties should be accessible by any user
      if (!frameworkUserManager.isAdmin(user.getAccountURI())) {
        service.getProperties().clear();
      }

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


  /**
   * Get the all services
   * 
   * @return JSON
   */
  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response getServices(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token) {

    FrameworkUserManager frameworkUserManager;
    UserProfile user;
    try {
      frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {

      ComponentManager manager =
          new ComponentManager(FrameworkConfiguration.getInstance().getSystemRdfStoreManager());

      Collection<Service> services = manager.getAllServices();
      // in fact not all properties should be accessible by any user
      if (!frameworkUserManager.isAdmin(user.getAccountURI())) {
        for (Service s : services)
          s.getProperties().clear();
      }

      Gson gson = new Gson();
      String json = "{ \"services\" : " + gson.toJson(services) + "}";
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

  }

}
