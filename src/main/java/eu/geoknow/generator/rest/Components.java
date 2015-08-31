package eu.geoknow.generator.rest;

import java.io.IOException;
import java.util.Collection;

import javax.ws.rs.Consumes;
import javax.ws.rs.CookieParam;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
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
import eu.geoknow.generator.component.beans.Service;
import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.ResourceExistsException;
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

  /**
   * Add a new component
   * 
   * @param userc
   * @param token
   * @param component {@link Component} in JSON format
   * @return {@link Component} in JSON format
   */
  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @Consumes(MediaType.APPLICATION_JSON)
  public Response createComponent(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token, Component component) {

    FrameworkUserManager frameworkUserManager;
    UserProfile user;
    try {
      frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
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
      // the system user will perform the changes to the Store
      ComponentManager manager =
          new ComponentManager(FrameworkConfiguration.getInstance().getSystemRdfStoreManager());
      Component c = manager.addComponent(component);
      Gson gson = new Gson();
      String json = "{\"component\" : " + gson.toJson(c) + "}";
      log.info(json);
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (ResourceExistsException e) {
      log.error(e);
      return Response.status(Response.Status.CONFLICT).entity(e.getMessage()).build();
    } catch (SPARQLEndpointException | IOException | InformationMissingException e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  /**
   * Updates the data of a component
   * 
   * @param userc
   * @param token
   * @param component {@link Component} in JSON format
   * @return {@link Component} in JSON format object
   */
  @PUT
  @Produces(MediaType.APPLICATION_JSON)
  @Consumes(MediaType.APPLICATION_JSON)
  public Response updateComponent(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token, Component component) {

    FrameworkUserManager frameworkUserManager;
    UserProfile user;
    try {
      frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
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
      // the system user will perform the changes to the Store
      ComponentManager manager =
          new ComponentManager(FrameworkConfiguration.getInstance().getSystemRdfStoreManager());
      Component c = manager.updateComponent(component);
      Gson gson = new Gson();
      String json = "{\"component\" : " + gson.toJson(c) + "}";
      log.info(json);
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (ResourceNotFoundException e) {
      log.error(e);
      return Response.status(Response.Status.CONFLICT).entity(e.getMessage()).build();
    } catch (SPARQLEndpointException | IOException | InformationMissingException e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }


  /**
   * Updates the data of a service
   * 
   * @param userc
   * @param token
   * @param component {@link Component} in JSON format
   * @return {@link Component} in JSON format object
   */
  @PUT
  @Path("/services")
  @Produces(MediaType.APPLICATION_JSON)
  @Consumes(MediaType.APPLICATION_JSON)
  public Response updateService(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token, Service service) {

    FrameworkUserManager frameworkUserManager;
    UserProfile user;
    try {
      frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
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
      // the system user will perform the changes to the Store
      ComponentManager manager =
          new ComponentManager(FrameworkConfiguration.getInstance().getSystemRdfStoreManager());
      Service s = manager.updateService(service);
      Gson gson = new Gson();
      String json = "{\"service\" : " + gson.toJson(s) + "}";
      log.info(json);
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (ResourceNotFoundException e) {
      log.error(e);
      return Response.status(Response.Status.CONFLICT).entity(e.getMessage()).build();
    } catch (SPARQLEndpointException | IOException | InformationMissingException e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  /**
   * Get the components integrated in the system. Any registered user can read this data.
   * 
   * @return JSON Array of {@link Component} in JSON format
   */
  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response getComponents(@CookieParam(value = "user") Cookie userc, @CookieParam(
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
      Collection<Component> components = manager.getAllComponents();

      // in fact not all properties should be accessible by any user
      if (!frameworkUserManager.isAdmin(user.getAccountURI())) {
        for (Component c : components) {
          for (Service s : c.getServices())
            s.getProperties().clear();
        }
      }

      Gson gson = new Gson();
      String json = "{ \"components\" : " + gson.toJson(components) + "}";
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (Exception e) {
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
  @Path("/{id : .+}")
  @Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN})
  public Response getComponent(@PathParam("id") String id,
      @CookieParam(value = "user") Cookie userc, @CookieParam(value = "token") String token) {

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
      Component component = manager.getComponent(id);
      // in fact not all properties should be accessible by any user
      if (!frameworkUserManager.isAdmin(user.getAccountURI())) {
        for (Service s : component.getServices())
          s.getProperties().clear();
      }
      Gson gson = new Gson();
      String json = "{ \"component\" : " + gson.toJson(component) + "}";
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (ResourceNotFoundException e) {
      log.error(e);
      return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage())
          .type(MediaType.TEXT_PLAIN).build();
    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
          .type(MediaType.TEXT_PLAIN).build();
    }

  }

  /**
   * Delete a component of the given URI
   * 
   * @param uri
   * @param userc
   * @param token
   * @return
   */
  @DELETE
  @Path("/{uri : .+}")
  public Response deleteComponent(@PathParam("uri") String uri,
      @CookieParam(value = "user") Cookie userc, @CookieParam(value = "token") String token) {

    FrameworkUserManager frameworkUserManager;
    UserProfile user;
    try {
      frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
      // only admin can delete
      if (!frameworkUserManager.isAdmin(user.getAccountURI())) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Admin role required").build();
      }

    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
    try {

      ComponentManager manager =
          new ComponentManager(FrameworkConfiguration.getInstance().getSystemRdfStoreManager());
      manager.deleteComponent(uri);

      return Response.status(Response.Status.OK).build();

    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

}
