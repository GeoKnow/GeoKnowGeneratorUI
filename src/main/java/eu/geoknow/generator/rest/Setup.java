package eu.geoknow.generator.rest;

import javax.servlet.ServletContext;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.configuration.RDFStoreSetupManager;

/**
 * TODO: documentation using something like https://github.com/kongchen/swagger-maven-plugin
 */

@Path("/setup")
public class Setup {

  private static final Logger log = Logger.getLogger(Setup.class);

  private @Context ServletContext context;

  /**
   * Get the status of the setup
   * 
   * @return true/false
   */
  @GET
  @Produces(MediaType.TEXT_PLAIN)
  public Response isSetuUp() {
    FrameworkConfiguration fc;
    try {
      fc = FrameworkConfiguration.getInstance();
    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
    return Response.ok(fc.isSetUp(), MediaType.TEXT_PLAIN).build();
  }

  /**
   * Reset the configuration of the workbench
   * 
   * @param context
   * @return 200
   */
  @POST
  @Produces(MediaType.TEXT_PLAIN)
  public Response reset(@Context ServletContext context) {

    try {
      RDFStoreSetupManager setupManager = new RDFStoreSetupManager();
      setupManager.setUp(true);
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      if (e.getClass().getName().equals("virtuoso.jdbc4.VirtuosoException"))
        return Response.status(Response.Status.SERVICE_UNAVAILABLE).entity(e.getMessage())
            .type(MediaType.TEXT_PLAIN).build();
      else
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
            .type(MediaType.TEXT_PLAIN).build();
    }
    log.info("System was reseted successfully.");
    return Response.ok().entity("System reseted successfully").build();
  }

  /**
   * Initializes the workbench
   * 
   * @param context
   * @return
   */
  @PUT
  @Produces(MediaType.TEXT_PLAIN)
  public Response initialize(@Context ServletContext context) {

    // try to get the framework config, if not existing, create it
    // setup the system by pushing the config data also to the triple store
    try {
      RDFStoreSetupManager setupManager = new RDFStoreSetupManager();
      setupManager.setUp(false);
    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
          .type(MediaType.TEXT_PLAIN).build();
    }
    log.info("System was set up successfully.");
    return Response.ok().entity("System initialized successfully").type(MediaType.TEXT_PLAIN)
        .build();
  }
}
