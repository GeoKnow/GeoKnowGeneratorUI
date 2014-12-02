package workflow.rest;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.GregorianCalendar;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
import com.hp.hpl.jena.datatypes.xsd.XSDDateTime;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.vocabulary.DCTerms;
import com.hp.hpl.jena.vocabulary.XSD;
import com.ontos.ldiw.vocabulary.LDIWO;

/**
 * Rest API for Batch Job processing
 * 
 * @author alejandragarciarojas
 *
 *         Jobs that are registered in the Store but not in spring-batch-admin,
 *         are automatically registered in the GET method
 * 
 *         TODO: add pagination to responses
 * 
 *         TODO: use the ResourceNotFoundException to return more meaningful
 *         errors
 * 
 *         TODO: define a job access control (the user may decide who can
 *         read/write/execute jobs he has created)
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

    @DELETE
    @Path("/{jobName}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteJob(@CookieParam(value = "user") Cookie userc,
            @CookieParam(value = "token") String token, @PathParam("jobName") String jobName) {
        UserProfile user;
        try {
            user = frameworkUserManager.validate(userc, token);
            if (user == null)
                return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials")
                        .build();
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }
        try {
            // ask if ther resource exists
            String query = "ASK { GRAPH <" + jobsGraph + "> {<" + uriBase + jobName + "> <"
                    + DCTerms.creator.getURI() + "> <" + user.getAccountURI() + "> }}";
            log.debug(query);
            String result = frameworkRdfStoreManager.execute(query, "json");
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(result);
            if (rootNode.path("boolean").getBooleanValue()) {

                // stop the execution if running
                JobExecutions executions = BatchAdminClient.getAllExecutions();
                JobExecution lastExec = executions.getJobExecutions().get(0);
                if (lastExec.getStatus().contains("START")) {
                    log.info("stopping " + lastExec.getId());
                    BatchAdminClient.stopExecution(lastExec.getId());
                }

                query = "DELETE FROM <" + jobsGraph + "> { <" + uriBase + jobName + "> ?p ?o} "
                        + " WHERE { <" + uriBase + jobName + "> ?p ?o ;  <"
                        + DCTerms.creator.getURI() + "> <" + user.getAccountURI() + "> } ";
                log.debug(query);

                result = frameworkRdfStoreManager.execute(query, "json");
                log.debug(result);
                mapper = new ObjectMapper();
                rootNode = mapper.readTree(result);
                Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings")
                        .getElements();
                if (bindingsIter.hasNext()) {
                    JsonNode bindingNode = bindingsIter.next();
                    if (bindingNode.get("callret-0").path("value").getTextValue().contains("done"))
                        return Response.status(Response.Status.NO_CONTENT).build();
                }
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(
                        "For some reason, the record was not deleted").build();

            } else
                return Response.status(Response.Status.NOT_FOUND).build();

        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
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
            user = frameworkUserManager.validate(userc, token);
            if (user == null)
                return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials")
                        .build();
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }
        JobExecution execution;
        log.debug("Executes job: " + jobName);
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
            // authenticates the user, throw exception if fail
            user = frameworkUserManager.validate(userc, token);
            if (user == null)
                return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials")
                        .build();
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }

        try {
            String query = "SELECT ?desc ?created FROM <" + jobsGraph + "> WHERE { <" + uriBase
                    + jobName + "> <" + DCTerms.creator.getURI() + "> <" + user.getAccountURI()
                    + ">; <" + DCTerms.description.getURI() + "> ?desc ; <"
                    + DCTerms.created.getURI() + "> ?created }";
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
                String created = bindingNode.get("created").path("value").getTextValue();
                JobExecutions executions = new JobExecutions();

                Registration job = BatchAdminClient.getJob(jobName);
                job.setDescription(jobDesc);
                job.setCereated(created);
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
            // authenticates the user, throw exception if fail
            user = frameworkUserManager.validate(userc, token);
            if (user == null)
                return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials")
                        .build();
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

            String query = "SELECT ?job ?desc ?created ?xml FROM <" + jobsGraph
                    + "> WHERE { ?job <" + DCTerms.creator.getURI() + "> <" + user.getAccountURI()
                    + "> ; <" + DCTerms.description.getURI() + "> ?desc ; <"
                    + DCTerms.created.getURI() + "> ?created ; <" + LDIWO.xmlDefinition.getURI()
                    + "> ?xml }";
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
                String created = bindingNode.get("created").path("value").asText();
                String xml = URLDecoder.decode(bindingNode.get("xml").path("value").asText(),
                        "UTF-8");
                log.debug(xml);
                Registration registration = registrations.get(jobId.replace(uriBase, ""));

                if (registration == null) {
                    log.warn("registering not registered job: " + jobId);
                    registration = BatchAdminClient.registerJob(jobId.replace(uriBase, ""), xml);
                } else {
                    registration.setDescription(jobDesc);
                    registration.setCereated(created);
                }

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
            user = frameworkUserManager.validate(userc, token);
            if (user == null)
                return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials")
                        .build();

            // TODO: validate serviceJob
            log.debug(serviceJob.toString());

        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
                    .build();
        }

        Registration job = null;
        String xml;
        try {
            JobFactory.getInstance();
            xml = JobFactory.createOneStepServiceJobXml(serviceJob);
            // register job in the batch-admin
            job = BatchAdminClient.registerJob(serviceJob.getName(), xml);
            job.setDescription(serviceJob.getDescription());

            XSDDateTime xsdDate = new XSDDateTime(GregorianCalendar.getInstance());

            // TODO: currently using URLencoder to save the XML, but there
            // should be used another encoder for unicode/turtle
            String query = "INSERT INTO <" + jobsGraph + "> { " + "<" + uriBase + job.getName()
                    + "> a <" + LDIWO.Job.getURI() + "> ;" + "<" + DCTerms.creator.getURI() + "> <"
                    + user.getAccountURI() + "> ; " + "<" + DCTerms.created.getURI() + "> \""
                    + ResourceFactory.createTypedLiteral(xsdDate).getString() + "\"^^<"
                    + XSD.dateTime.getURI() + "> ; " + "<" + DCTerms.description.getURI() + "> \""
                    + job.getDescription() + "\"^^<" + XSD.xstring.getURI() + "> ; " + "<"
                    + LDIWO.xmlDefinition.getURI() + "> \"" + URLEncoder.encode(xml, "utf-8")
                    + "\"^^<" + XSD.xstring.getURI() + "> }";
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
}
