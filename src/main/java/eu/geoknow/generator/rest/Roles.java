package eu.geoknow.generator.rest;

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

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.RoleManager;
import eu.geoknow.generator.users.RoleType;
import eu.geoknow.generator.users.UserProfile;
import eu.geoknow.generator.users.UserRole;

/**
 * A Rest interface to manage Roles
 * 
 * @author alejandragarciarojas
 *
 */
@Path("/roles")
public class Roles {

  private static final Logger log = Logger.getLogger(Roles.class);

  /**
   * Return an array of roles with the allowed services. This is a public method because the
   * notLoggedIn Role needs to be retrieved without the authentication
   * 
   * @return JSON Collection<UserRole>
   */
  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response getRoles() {

    try {
      RoleManager manager =
          new RoleManager(FrameworkConfiguration.getInstance().getSystemRdfStoreManager());
      Collection<UserRole> roles = manager.getRoles();
      Gson gson = new Gson();
      String json = "{\"roles\" : " + gson.toJson(roles) + "}";
      log.info(json);
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  /**
   * Get the role of the given URI
   * 
   * @param uri
   * @param userc
   * @param token
   * @return
   */
  @GET
  @Path("{uri : .+}")
  public Response getRole(@PathParam("uri") String uri, @CookieParam(value = "user") Cookie userc,
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
      RoleManager manager =
          new RoleManager(FrameworkConfiguration.getInstance().getSystemRdfStoreManager());
      UserRole res = manager.getRole(uri);
      Gson gson = new Gson();
      String json = "{\"role\" : " + gson.toJson(res) + "}";
      log.info(json);
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  /**
   * Add a new role
   * 
   * @param UserRole role
   * @param user cookie
   * @param token
   * @return UserRole
   */
  @PUT
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response createRole(UserRole role, @CookieParam(value = "user") Cookie userc,
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

      RoleManager manager =
          new RoleManager(FrameworkConfiguration.getInstance().getSystemRdfStoreManager());
      UserRole res = manager.create(role);
      Gson gson = new Gson();
      String json = "{\"role\" : " + gson.toJson(res) + "}";
      log.info(json);
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (ResourceNotFoundException e) {
      log.error(e);
      return Response.status(Response.Status.NO_CONTENT)
          .entity("The component was not found in the system.").build();
    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }


  /**
   * Update a role
   * 
   * @param role
   * @param userc
   * @param token
   * @return
   */
  @POST
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response updateRole(UserRole role, @CookieParam(value = "user") Cookie userc,
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

      RoleManager manager =
          new RoleManager(FrameworkConfiguration.getInstance().getSystemRdfStoreManager());
      role = manager.updateRole(role);
      Gson gson = new Gson();
      String json = "{\"role\" : " + gson.toJson(role) + "}";
      log.info(json);
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (ResourceNotFoundException e) {
      log.error(e);
      return Response.status(Response.Status.NO_CONTENT)
          .entity("The component was not found in the system.").build();
    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  /**
   * Delete a role with the given URI
   * 
   * @param uri
   * @param userc
   * @param token
   * @return
   */
  @DELETE
  @Path("{uri : .+}")
  public Response deleteRole(@PathParam("uri") String uri,
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
      RoleManager manager =
          new RoleManager(FrameworkConfiguration.getInstance().getSystemRdfStoreManager());
      manager.deleteRole(uri);

      return Response.status(Response.Status.OK).build();

    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  /**
   * Sets the provided role as uri, as the given type (i.e. NotLoggedIn, Default ...)
   * 
   * @param type
   * @param uri of the role
   * @param userc
   * @param token
   * @return
   */
  @POST
  @Path("{type}/{uri : .+}")
  public Response setType(@PathParam("type") String type, @PathParam("uri") String uri,
      @CookieParam(value = "user") Cookie userc, @CookieParam(value = "token") String token) {

    log.debug(type + "/" + uri);
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

      RoleManager manager =
          new RoleManager(FrameworkConfiguration.getInstance().getSystemRdfStoreManager());
      if (type.equals(RoleType.DEFAULT))
        manager.setDefaultRole(uri);
      else if (type.equals(RoleType.NOT_LOGGED_IN_USER))
        manager.setNotLoggedInRole(uri);

      return Response.status(Response.Status.OK).build();

    } catch (ResourceNotFoundException e) {
      log.error(e);
      return Response.status(Response.Status.NO_CONTENT)
          .entity("The component was not found in the system.").build();
    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }
}
