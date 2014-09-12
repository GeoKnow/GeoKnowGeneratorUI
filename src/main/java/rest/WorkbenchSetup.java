package rest;

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

import setup.RDFStoreSetupManager;
import authentication.FrameworkConfiguration;

/**
 * TODO: documentation using something like
 * https://github.com/kongchen/swagger-maven-plugin
 */

@Path("/setup")
public class WorkbenchSetup {

    private static final Logger log = Logger.getLogger(WorkbenchSetup.class);

    private @Context
    ServletContext context;

    /**
     * Get the status of the setup
     * 
     * @return true/false
     */
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public Response isSetuUp() {
	RDFStoreSetupManager setupManager = new RDFStoreSetupManager(
		context.getInitParameter("framework-setup-path"));
	return Response.ok(setupManager.isSetUp(), MediaType.TEXT_PLAIN)
		.build();
    }

    /**
     * Reset the configuration of the workbench
     * 
     * @param context
     * @return 200
     */
    @POST
    public Response reset(@Context ServletContext context) {
	RDFStoreSetupManager setupManager = new RDFStoreSetupManager(
		context.getInitParameter("framework-setup-path"));
	FrameworkConfiguration frameworkConfiguration = null;
	try {
	    frameworkConfiguration = FrameworkConfiguration
		    .getInstance(context);
	    setupManager.setUp(frameworkConfiguration, true);
	} catch (Exception e) {
	    log.error(e);
	    e.printStackTrace();
	    if (e.getClass().getName()
		    .equals("virtuoso.jdbc4.VirtuosoException"))
		return Response.status(Response.Status.SERVICE_UNAVAILABLE)
			.entity(e.getMessage()).build();
	    else
		return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
			.entity(e.getMessage()).build();
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
    public Response initialize(@Context ServletContext context) {
	RDFStoreSetupManager setupManager = new RDFStoreSetupManager(
		context.getInitParameter("framework-setup-path"));

	if (setupManager.isSetUp()) {
	    log.info("System is already set up. To reset system use PUT method");
	    return Response
		    .status(Response.Status.CONFLICT)
		    .entity("System is already set up. To reset system use PUT method")
		    .build();
	} else {
	    FrameworkConfiguration frameworkConfiguration = null;
	    try {
		frameworkConfiguration = FrameworkConfiguration
			.getInstance(context);
	    } catch (Exception e) {
		log.error(e);
		return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
			.entity(e.getMessage()).build();
	    }
	    try {
		setupManager.setUp(frameworkConfiguration, false);
	    } catch (Exception e) {
		log.error(e);
		return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
			.entity(e.getMessage()).build();
	    }
	    log.info("System was set up successfully.");
	    return Response.ok().entity("System initialized successfully")
		    .build();
	}
    }
}