package workflow.rest;

import java.io.File;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.ws.rs.Consumes;
import javax.ws.rs.CookieParam;
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
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;

import rdf.RdfStoreManager;
import rdf.SecureRdfStoreManagerImpl;
import workflow.BatchAdminClient;
import workflow.JobFactory;
import workflow.beans.JobExecution;
import workflow.beans.JobExecutionWraper;
import workflow.beans.JobExecutions;
import workflow.beans.OneStepServiceJob;
import workflow.beans.Registration;
import accounts.FrameworkUserManager;
import accounts.UserProfile;
import authentication.FrameworkConfiguration;

import com.google.gson.Gson;
import com.hp.hpl.jena.vocabulary.DC;

/**
 * Rest API for Batch Job processing
 * 
 * @author alejandragarciarojas
 *
 *         TODO: add pagination to responses
 * 
 *         TODO: jobs are deleted each time the spring-batch-admin is
 *         reinitialized, we need to register them again if the jobGraph has
 *         them
 * 
 */

@Path("/jobs")
public class Jobs {

    private static final Logger log = Logger.getLogger(Jobs.class);

    private static FrameworkUserManager frameworkUserManager;
    private static String jobsGraph;
    private static RdfStoreManager frameworkRdfStoreManager;
    private static String uriBase;

    /**
     * Jobs constructor
     * 
     * @param context
     * @throws ServletException
     */
    public Jobs(@Context ServletContext context) throws ServletException {
        try {
            FrameworkConfiguration frameworkConfig = FrameworkConfiguration.getInstance(context);
            uriBase = frameworkConfig.getResourceNamespace();
            frameworkUserManager = frameworkConfig.getFrameworkUserManager();
            jobsGraph = frameworkConfig.getJobsGraph();
            frameworkRdfStoreManager = new SecureRdfStoreManagerImpl(frameworkConfig
                    .getAuthSparqlEndpoint(), frameworkConfig.getAuthSparqlUser(), frameworkConfig
                    .getAuthSparqlPassword());
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
    public Response executesJobs(@CookieParam(value = "user") Cookie userc,
            @CookieParam(value = "token") String token, @PathParam("jobName") String jobName) {

        /*
         * authenticates the user, throw exception if failed
         */
        UserProfile user;
        try {
            // authenticates the user, throw exception if fail
            user = validate(userc, token);
        } catch (WebApplicationException e) {
            return e.getResponse();
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
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
        String json = "{\"execution\" : " + gson.toJson(execution) + "}";
        log.info(json);

        return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
                .build();
    }

    /**
     * Get job information and executions details. This response has one call to
     * the BatchAdminClient to get the job info and a short info about
     * instances, and the response is completed with one getExecutionDetail
     * request for each instance to grab other useful information about the
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
            user = validate(userc, token);
        } catch (WebApplicationException e) {
            return e.getResponse();
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }

        try {
            String query = "SELECT ?desc FROM <" + jobsGraph + "> WHERE { <" + uriBase + jobName
                    + "> <" + DC.creator.getURI() + "> <" + user.getAccountURI() + "> . <"
                    + uriBase + jobName + "> <" + DC.description.getURI() + "> ?desc}";
            log.debug(query);

            String result = frameworkRdfStoreManager.execute(query, "json");
            log.debug(result);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(result);
            Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings")
                    .getElements();

            if (bindingsIter.hasNext()) {
                JsonNode bindingNode = bindingsIter.next();
                String jobDesc = bindingNode.get("desc").path("value").getTextValue();
                log.debug(jobName + " description:" + jobDesc);
                JobExecutions executions = new JobExecutions();

                Registration job = BatchAdminClient.getJob(jobName);
                job.setDescription(jobDesc);
                // complete with execution information

                Set<Integer> instances = job.getJobInstances().keySet();
                log.debug(instances.size() + "instances ");
                Iterator<Integer> it = instances.iterator();
                while (it.hasNext()) {
                    int id = it.next();
                    JobExecutionWraper execution = BatchAdminClient.getExecutionDetail("" + id);
                    executions.getJobExecutions().add(execution.getJobExecution());
                }
                Gson gson = new Gson();
                String json = "{ \"job\" : " + gson.toJson(job) + ", \"executions\":"
                        + gson.toJson(executions.getJobExecutions()) + "}";
                return Response.status(Response.Status.OK).entity(json).type(
                        MediaType.APPLICATION_JSON).build();
            }

            return Response.status(Response.Status.NO_CONTENT).entity("User do not have job")
                    .build();

        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.EXPECTATION_FAILED).entity(e.getMessage())
                    .build();
        }

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
    public Response getJobs(@CookieParam(value = "user") Cookie userc,
            @CookieParam(value = "token") String token) {

        UserProfile user;
        try {
            // authenticates the user, throw exception if fail
            user = validate(userc, token);
        } catch (WebApplicationException e) {
            return e.getResponse();
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }

        // get all registered jobs
        Map<String, Registration> registrations;
        try {
            registrations = BatchAdminClient.getRegistedJobs().getJobs().getRegistrations();

            List<Registration> userRegistrations = new ArrayList<Registration>();

            String query = "SELECT ?job ?desc FROM <" + jobsGraph + "> WHERE { ?job <"
                    + DC.creator.getURI() + "> <" + user.getAccountURI() + "> . ?job <"
                    + DC.description.getURI() + "> ?desc}";
            log.debug(query);

            String result = frameworkRdfStoreManager.execute(query, "json");
            log.debug(result);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(result);
            Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings")
                    .getElements();
            while (bindingsIter.hasNext()) {
                JsonNode bindingNode = bindingsIter.next();
                String jobId = bindingNode.get("job").path("value").getTextValue();
                String jobDesc = bindingNode.get("desc").path("value").getTextValue();
                Registration registration = registrations.get(jobId.replace(uriBase, ""));
                registration.setDescription(jobDesc);
                userRegistrations.add(registration);
            }
            Gson gson = new Gson();
            String json = "{ \"jobs\" : " + gson.toJson(userRegistrations) + "}";
            return Response.status(Response.Status.OK).entity(json)
                    .type(MediaType.APPLICATION_JSON).build();

        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.EXPECTATION_FAILED).entity(e.getMessage())
                    .build();
        }

    }

    /**
     * 
     * 
     * Authenticates the users session and creates a xml job file of the
     * required service and registers this job in the batch-admin.
     * 
     * OneStepServiceJob.setBody should be encoded to avoid confusion with the
     * job object in the case where the body content for the service is also
     * json.
     * 
     * @param user
     *            information about the registered user
     * @param token
     *            for authentication
     * @param serviceJob
     *            OneStepServiceJob JOSN
     * @return job in JSON format
     */
    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(@CookieParam(value = "user") Cookie userc,
            @CookieParam(value = "token") String token, OneStepServiceJob serviceJob) {
        UserProfile user;
        try {
            // authenticates the user, throw exception if fail
            user = validate(userc, token);
            // TODO: validate serviceJob
            log.debug(serviceJob.toString());

        } catch (WebApplicationException e) {
            return e.getResponse();
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }

        JobFactory.getInstance();
        Registration job = null;
        File file;
        try {
            file = JobFactory.createOneStepServiceJobFile(serviceJob);
            // register job in the batch-admin
            job = BatchAdminClient.registerJob(serviceJob.getName(), file);
            job.setDescription(serviceJob.getDescription());

            String query = "INSERT INTO <" + jobsGraph + "> { <" + uriBase + job.getName() + "> <"
                    + DC.creator.getURI() + "> <" + user.getAccountURI() + "> . " + "<" + uriBase
                    + job.getName() + "> <" + DC.description.getURI() + "> \""
                    + job.getDescription() + "\"^^xsd:string}";
            log.debug(query);

            frameworkRdfStoreManager.execute(query, "json");

            Gson gson = new Gson();
            String json = "{ \"job\" : " + gson.toJson(job) + "}";

            log.debug("registered:" + json);

            return Response.status(Response.Status.CREATED).entity(json).build();

        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }

    }

    private UserProfile validate(Cookie userc, String token) throws Exception {

        if (userc == null || token == null)
            throw new WebApplicationException(Response.Status.UNAUTHORIZED);

        String userstr = URLDecoder.decode(userc.getValue(), "utf-8");
        log.debug(" userstr: " + userstr + " token:" + token);
        Gson gson = new Gson();
        UserProfile user = gson.fromJson(userstr, UserProfile.class);

        boolean checkToken = frameworkUserManager.checkToken(user.getUsername(), token);

        if (!checkToken)
            throw new WebApplicationException(Response.Status.UNAUTHORIZED);

        return user;
    }
}
