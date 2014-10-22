package workflow.rest;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

import org.apache.log4j.Logger;

import util.ObjectPair;
import workflow.BatchAdminClient;
import workflow.JobFactory;
import workflow.beans.JobExecution;
import workflow.beans.Registration;
import accounts.FrameworkUserManager;
import authentication.FrameworkConfiguration;

import com.google.gson.Gson;

/**
 * Interface for Batch processing manager
 * 
 * @author alejandragarciarojas
 *
 *
 */

@Path("/jobs")
public class Jobs {

    private static final Logger log = Logger.getLogger(Jobs.class);

    private static FrameworkUserManager frameworkUserManager;
    public static Map<String, List<String>> userJobId = new HashMap<String, List<String>>();

    /**
     * Jobs constructor
     * 
     * @param context
     * @throws ServletException
     */
    public Jobs(@Context ServletContext context) throws ServletException {
        try {
            frameworkUserManager = FrameworkConfiguration.getInstance(context)
                    .getFrameworkUserManager();
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            throw new WebApplicationException(e);
        }
    }

    /**
     * Executes job method: Authenticates the user and call the BatchAdminClient
     * to run the job of jobName
     * 
     * @param username
     * @param token
     * @param jobName
     * @return json execution object
     */
    @POST
    @Path("/{jobName}/run")
    @Produces(MediaType.APPLICATION_JSON)
    public Response executesJobs(@QueryParam("username") String username,
            @CookieParam(value = "token") String token, @PathParam("jobName") String jobName) {
        try {
            /*
             * authenticates the user, throw exception if failed
             */
            frameworkUserManager.getRdfStoreUser(username, token);
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.UNAUTHORIZED).entity(e.getMessage()).build();
        }
        JobExecution execution;
        try {
            execution = BatchAdminClient.runJob(jobName);
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }
        Gson gson = new Gson();
        String json = "{execution : " + gson.toJson(execution) + "}";
        log.info(json);

        return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
                .build();
    }

    /**
     * Get all jobs and instances of each job of a given user
     * 
     * @param username
     * @param token
     * @return registrations array json
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getJobs(@QueryParam("username") String username,
            @CookieParam(value = "token") String token) {

        ObjectPair<String, String> rdfStoreUser;
        String settingsGraph;

        try {
            // authenticates the user, throw exception if fail
            rdfStoreUser = frameworkUserManager.getRdfStoreUser(username, token);

        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.UNAUTHORIZED).entity(e.getMessage()).build();
        }

        // get all registered jobs
        Map<String, Registration> registrations;
        try {
            registrations = BatchAdminClient.getRegistedJobs().getJobs().getRegistrations();
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.EXPECTATION_FAILED).entity(e.getMessage())
                    .build();
        }

        List<Registration> userRegistrations = new ArrayList<Registration>();
        // filter the jobs that belong to the user
        if (userJobId.containsKey(username)) {
            List<String> ids = userJobId.get(username);
            log.debug(username + " has " + ids.size());
            for (Entry<String, Registration> reg : registrations.entrySet())
                if (ids.contains(reg.getKey())) {

                    log.info("add " + reg.getKey());
                    userRegistrations.add(reg.getValue());
                }
        }

        Gson gson = new Gson();
        String json = "{ \"jobs\" : " + gson.toJson(userRegistrations) + "}";
        log.info(json);

        return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
                .build();

    }

    /**
     * Authenticates the users session and creates a xml job file of the
     * required service and registers this job in the batch-admin.
     * 
     * @param username
     * @param token
     * @param method
     * @param service
     * @param contenttype
     * @param body
     * @return jobId
     */
    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    public Response create(@QueryParam("username") String username,
            @CookieParam(value = "token") String token, @QueryParam("method") String method,
            @QueryParam("service") String service, @QueryParam("contenttype") String contenttype,
            @QueryParam("body") String body) {

        ObjectPair<String, String> rdfStoreUser;
        String settingsGraph;
        String jobId = username + "_" + UUID.randomUUID().toString();

        // authenticates the user, throw exception if fail
        try {
            log.debug("registering: " + username + " token:" + token);
            rdfStoreUser = frameworkUserManager.getRdfStoreUser(username, token);
            settingsGraph = frameworkUserManager.getUserProfile(username).getSettingsGraph();
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.UNAUTHORIZED).entity(e.getMessage()).build();
        }

        JobFactory.getInstance();
        Registration job = null;
        File file;
        try {
            file = JobFactory
                    .createOneStepServiceJobFile(jobId, service, contenttype, method, body);
            // register job in the batch-admin
            job = BatchAdminClient.registerJob(jobId, file);

            // add the Job to the settings graph
            if (userJobId.containsKey(username))
                userJobId.get(username).add(jobId);
            else {
                ArrayList<String> list = new ArrayList<String>();
                list.add(jobId);
                userJobId.put(username, list);
            }

            log.debug("registered:" + job.getName());

            return Response.status(Response.Status.CREATED).entity(job).build();

        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }

    }
}
