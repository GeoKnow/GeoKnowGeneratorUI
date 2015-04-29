package eu.geoknow.generator.rest;

import java.io.IOException;
import java.util.Collection;

import javax.ws.rs.Consumes;
import javax.ws.rs.CookieParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;

import com.google.gson.Gson;

import eu.geoknow.generator.component.ComponentManager;
import eu.geoknow.generator.component.beans.Component;
import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.exceptions.SPARQLEndpointException;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserProfile;

/**
 * A REST interface for the Components manager that will allow to manage components integrated in
 * the workbench
 * 
 * @author alejandragarciarojas
 *
 */
@Path("/components")
public class Components {

  private static final Logger log = Logger.getLogger(Components.class);



  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @Consumes(MediaType.APPLICATION_JSON)
  public Response updateComponent(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token, Component component) {

    UserProfile user;
    try {
      FrameworkUserManager frameworkUserManager =
          FrameworkConfiguration.getInstance().getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
      // check that the user is admin so he can update the component
      if (!frameworkUserManager.isAdmin(user.getAccountURI())) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Admin role required").build();
      }
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      ComponentManager manager = new ComponentManager();
      Component c = manager.updateComponent(component);
      Gson gson = new Gson();
      String json = "{\"component\" : " + gson.toJson(c) + "}";
      log.info(json);
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (ResourceNotFoundException e) {
      log.error(e);
      return Response.status(Response.Status.NO_CONTENT)
          .entity("The component was not found in the system.").build();
    } catch (SPARQLEndpointException | IOException | InformationMissingException e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }


  }

  /**
   * Get the components integrated in the system. Any one can read this data.
   * 
   * @return JSON Array of Components
   */
  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response getComponents() {

    try {
      ComponentManager manager = new ComponentManager();
      Collection<Component> components = manager.getAllComponents();
      Gson gson = new Gson();
      String json = "{ \"components\" : " + gson.toJson(components) + "}";
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (SPARQLEndpointException | IOException | InformationMissingException e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

  }

  /**
   * Get the the data of a single component
   * 
   * @return JSON
   */
  @GET
  @Path("/{uri : .+}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getComponent(@PathParam("uri") String uri) {

    try {
      ComponentManager manager = new ComponentManager();
      Component component = manager.getComponent(uri);
      Gson gson = new Gson();
      String json = "{ \"component\" : " + gson.toJson(component) + "}";
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (SPARQLEndpointException | IOException | InformationMissingException e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    } catch (ResourceNotFoundException e) {
      log.error(e);
      return Response.status(Response.Status.NO_CONTENT)
          .entity("The component was not found in the system.").build();
    }

  }

}
