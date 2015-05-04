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
import eu.geoknow.generator.component.beans.Service;
import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.exceptions.SPARQLEndpointException;
import eu.geoknow.generator.rdf.RdfStoreManager;
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
   * Updates the data of a component
   * 
   * @param userc
   * @param token
   * @param component
   * @return JSON Component object
   */
  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @Consumes(MediaType.APPLICATION_JSON)
  public Response updateComponent(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token, Component component) {

    FrameworkUserManager frameworkUserManager;
    RdfStoreManager storeManager;
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
      // get the manager of the user that will perform the transaction
      storeManager = frameworkUserManager.getRdfStoreManager(user.getUsername());

    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      ComponentManager manager = new ComponentManager(storeManager);
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
  public Response getComponents(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token) {

    FrameworkUserManager frameworkUserManager;
    RdfStoreManager storeManager;
    UserProfile user;
    try {
      frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
      // get the manager of the user that will perform the transaction
      storeManager = frameworkUserManager.getRdfStoreManager(user.getUsername());

    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      ComponentManager manager = new ComponentManager(storeManager);
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
  @Path("/{uri : .+}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getComponent(@PathParam("uri") String uri,
      @CookieParam(value = "user") Cookie userc, @CookieParam(value = "token") String token) {

    FrameworkUserManager frameworkUserManager;
    RdfStoreManager storeManager;
    UserProfile user;
    try {
      frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
      // get the manager of the user that will perform the transaction
      storeManager = frameworkUserManager.getRdfStoreManager(user.getUsername());

    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      ComponentManager manager = new ComponentManager(storeManager);
      Component component = manager.getComponent(uri);
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
      return Response.status(Response.Status.NO_CONTENT).entity(e.getMessage()).build();
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
  @Path("services/{uri : .+}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getService(@PathParam("uri") String uri,
      @CookieParam(value = "user") Cookie userc, @CookieParam(value = "token") String token) {

    FrameworkUserManager frameworkUserManager;
    RdfStoreManager storeManager;
    UserProfile user;
    try {
      frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
      // get the manager of the user that will perform the transaction
      storeManager = frameworkUserManager.getRdfStoreManager(user.getUsername());
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {

      ComponentManager manager = new ComponentManager(storeManager);

      Service service = manager.getService(uri);
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
   * Get the the data of a single component
   * 
   * @return JSON
   */
  @GET
  @Path("services")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getServices(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token) {

    FrameworkUserManager frameworkUserManager;
    RdfStoreManager storeManager;
    UserProfile user;
    try {
      frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
      // get the manager of the user that will perform the transaction
      storeManager = frameworkUserManager.getRdfStoreManager(user.getUsername());
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {

      ComponentManager manager = new ComponentManager(storeManager);

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
