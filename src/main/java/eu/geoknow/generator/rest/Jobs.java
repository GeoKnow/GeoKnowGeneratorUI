package eu.geoknow.generator.rest;

import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.ws.rs.Consumes;
import javax.ws.rs.CookieParam;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;

import com.google.gson.Gson;

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserProfile;
import eu.geoknow.generator.workflow.JobsManager;
import eu.geoknow.generator.workflow.beans.JobExecution;
import eu.geoknow.generator.workflow.beans.JobExecutions;
import eu.geoknow.generator.workflow.beans.MultiStepJob;
import eu.geoknow.generator.workflow.beans.Registration;


/**
 * Rest API for Batch Job processing.
 * 
 * @author alejandragarciarojas
 * @author mvoigt
 *
 *         TODO: add pagination to responses
 * 
 * 
 */
@Path("/jobs")
public class Jobs {

  private static final Logger log = Logger.getLogger(Jobs.class);

  private static FrameworkUserManager frameworkUserManager;
  private static JobsManager jmanager;

  /**
   * Jobs constructor, to init the servet with the configuration information.
   * 
   * @param context
   * @throws ServletException
   */
  public Jobs(@Context ServletContext context) throws ServletException {
    try {
      log.debug("init servlet");
      FrameworkConfiguration frameworkConfig = FrameworkConfiguration.getInstance();
      frameworkUserManager = frameworkConfig.getFrameworkUserManager();
      jmanager = JobsManager.getInstance();
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      throw new WebApplicationException(e);
    }
  }

  /**
   * Method to delete a job by its name.
   * 
   * @param userc
   * @param token
   * @param jobName
   * @return
   */
  @DELETE
  @Path("/{jobName}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response deleteJob(@CookieParam(value = "user") Cookie userc,
      @CookieParam(value = "token") String token, @PathParam("jobName") String jobName) {
    UserProfile user;
    try {
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

      if (jmanager.deleteJob(jobName, user))
        return Response.status(Response.Status.NO_CONTENT).build();
      else
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
            .entity("For some reason, the record was not deleted").build();
    } catch (ResourceNotFoundException e) {
      e.printStackTrace();
      return Response.status(Response.Status.NOT_FOUND)
          .entity("The job was not found in the system.").build();
    } catch (Exception e) {

      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

  }

  /**
   * Executes job method: Authenticates the user and call the BatchAdminClient to run the job of
   * jobName.
   * 
   * @param username
   * @param token
   * @param jobName
   * @return json execution object
   */
  @POST
  @Path("/{jobName}/run")
  @Produces(MediaType.APPLICATION_JSON)
  public Response executesJobs(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token, @PathParam("jobName") String jobName) {

    /*
     * authenticates the user, throw exception if failed
     */
    UserProfile user;
    try {
      user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
    JobExecution execution;
    try {
      execution = jmanager.executesJobs(jobName);
    } catch (Exception e) {
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
    Gson gson = new Gson();
    String json = "{\"execution\" : " + gson.toJson(execution) + "}";
    log.info(json);

    return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
        .build();
  }

  /**
   * Stops a job.
   * 
   * @param userc
   * @param token
   * @param jobName
   * @return
   */
  @POST
  @Path("/{jobName}/stop")
  @Produces(MediaType.APPLICATION_JSON)
  public Response stopJob(@CookieParam(value = "user") Cookie userc,
      @CookieParam(value = "token") String token, @PathParam("jobName") String jobName) {

    /*
     * authenticates the user, throw exception if failed
     */
    UserProfile user;
    try {
      user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      JobExecution execution = jmanager.stopJob(jobName, user);
      if (execution == null)
        return Response.status(Response.Status.NO_CONTENT)
            .entity("The execution was not found in the system.").build();

      Gson gson = new Gson();
      String json = "{\"execution\" : " + gson.toJson(execution) + "}";
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (ResourceNotFoundException e) {
      log.error(e);
      return Response.status(Response.Status.NO_CONTENT)
          .entity("The job was not found in the system.").build();
    } catch (Exception e) {
      log.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  /**
   * Get job information and executions details. This response has one call to the BatchAdminClient
   * to get the job info and a short info about instances, and the response is completed with one
   * getExecutionDetail request for each instance to grab other useful information about the
   * execution.
   * 
   * @param username
   * @param token
   * @return job
   */
  @GET
  @Path("/{jobName}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getJob(@CookieParam(value = "user") Cookie userc,
      @CookieParam(value = "token") String token, @PathParam("jobName") String jobName) {

    /*
     * authenticates the user, throw exception if failed
     */
    UserProfile user;
    try {
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
      Registration job = jmanager.getJob(jobName, user);
      if (job != null) {
        JobExecutions executions = jmanager.getExcecutions(job);
        Gson gson = new Gson();
        String json =
            "{ \"job\" : " + gson.toJson(job) + ", \"executions\":"
                + gson.toJson(executions.getJobExecutions()) + "}";
        return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
            .build();
      } else
        return Response.status(Response.Status.NO_CONTENT).entity("User do not have job").build();

    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.EXPECTATION_FAILED).entity(e.getMessage()).build();
    }

  }

  /**
   * Get all jobs and instances of each job of a given user.
   * 
   * @param username
   * @param token
   * @return registrations array json
   */
  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response getJobs(@CookieParam(value = "user") Cookie userc,
      @CookieParam(value = "token") String token) {

    UserProfile user;
    try {
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

      List<Registration> userRegistrations = jmanager.getUserJobs(user);
      Gson gson = new Gson();
      String json = "{ \"jobs\" : " + gson.toJson(userRegistrations) + "}";
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

  }

  /**
   * 
   * 
   * Authenticates the users session and creates a xml job file of the required services and
   * registers this job in the batch-admin.
   * 
   * OneStepServiceJob.setBody should be encoded to avoid confusion with the job object in the case
   * where the body content for the service is also json.
   * 
   * @param userc information about the registered user
   * @param token for authentication
   * @param serviceJob {@link MultiStepJob} JSON
   * @return job in JSON format
   */
  @PUT
  @Produces(MediaType.APPLICATION_JSON)
  @Consumes(MediaType.APPLICATION_JSON)
  public Response createMultiStepJob(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token, MultiStepJob serviceJob) {
    UserProfile user;
    try {
      // authenticates the user, throw exception if fail
      user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
      log.info(serviceJob.toString());

    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {
      Registration job = jmanager.createJob(serviceJob, user);
      // read and return response
      Gson gson = new Gson();
      String json = "{ \"job\" : " + gson.toJson(job) + "}";
      log.debug("registered:" + json);

      return Response.status(Response.Status.CREATED).entity(json).build();

    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

  }
}
