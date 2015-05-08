package eu.geoknow.generator.workflow;

import java.io.IOException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.GregorianCalendar;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletException;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hp.hpl.jena.datatypes.xsd.XSDDateTime;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.vocabulary.DCTerms;
import com.hp.hpl.jena.vocabulary.RDFS;
import com.hp.hpl.jena.vocabulary.XSD;
import com.ontos.ldiw.vocabulary.LDIWO;
import com.ontos.ldiw.vocabulary.SD;

import eu.geoknow.generator.common.APP_CONSTANT;
import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.exceptions.ServiceInternalServerError;
import eu.geoknow.generator.exceptions.ServiceNotAvailableException;
import eu.geoknow.generator.exceptions.UnknownException;
import eu.geoknow.generator.rdf.RdfStoreManager;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserProfile;
import eu.geoknow.generator.workflow.beans.JobExecution;
import eu.geoknow.generator.workflow.beans.JobExecutionWrapper;
import eu.geoknow.generator.workflow.beans.JobExecutions;
import eu.geoknow.generator.workflow.beans.MultiStepJob;
import eu.geoknow.generator.workflow.beans.Registration;



/**
 * JobsManager contains all the Job creation, extraction, deletion and execution of jobs.
 * 
 * @author alejandragarciarojas
 * 
 *         TODO: jobs are deleted each time the spring-batch-admin is reinitialized, we need to
 *         register them again if the jobGraph has them
 *
 */
public class JobsManager {

  private static final Logger log = Logger.getLogger(JobsManager.class);

  private static FrameworkUserManager frameworkUserManager;
  private static String jobsGraph;
  private static RdfStoreManager frameworkRdfStoreManager;
  private static String uriBase;
  private static String springBatchServiceUri;
  private static String springBatchDataDir;

  private static JobsManager manager;

  /**
   * JobsManager initialization.
   * 
   * @param context
   * @throws IOException
   * @throws InformationMissingException
   * @throws ServletException
   */
  public static JobsManager getInstance() throws IOException, InformationMissingException {

    if (manager == null) {
      manager = new JobsManager();
      FrameworkConfiguration frameworkConfig = FrameworkConfiguration.getInstance();
      uriBase = frameworkConfig.getResourceNamespace();
      frameworkUserManager = frameworkConfig.getFrameworkUserManager();
      jobsGraph = frameworkConfig.getJobsGraph();
      frameworkRdfStoreManager = frameworkConfig.getSystemRdfStoreManager();
      springBatchServiceUri = frameworkConfig.getSpringBatchUri();
      springBatchDataDir = frameworkConfig.getSpringBatchJobsDir();
      // remove last slash if existing
      if (springBatchServiceUri.endsWith("/")) {
        springBatchServiceUri =
            springBatchServiceUri.substring(0, springBatchServiceUri.length() - 1);
      }
      // remove last slash if existing
      if (springBatchDataDir.endsWith("/")) {
        springBatchDataDir = springBatchDataDir.substring(0, springBatchDataDir.length() - 1);
      }
    }
    return manager;
  }

  /**
   * Retrieve all the jobs form the user
   * 
   * @param user
   * @return
   * @throws Exception
   */
  public List<Registration> getUserJobs(UserProfile user) throws Exception {

    // get all registered jobs from Spring Batch Admin
    Map<String, Registration> registrations =
        BatchAdminClient.getRegistedJobs(springBatchServiceUri).getJobs().getRegistrations();

    List<Registration> userRegistrations = new ArrayList<Registration>();
    // also get the job from the graph - this list is the complete one
    // since SBA is maybe restarted and empty
    // be aware: if it is a manual job there is no schedule
    String query =
        "SELECT ?job ?desc ?created ?label ?creator ?xml ?targetGraph FROM <" + jobsGraph
            + "> WHERE { " + "?job <" + DCTerms.creator.getURI() + "> <" + user.getAccountURI()
            + "> ; " + "<" + DCTerms.description.getURI() + "> ?desc ; " + "<"
            + DCTerms.created.getURI() + "> ?created ; " + "<" + RDFS.label.getURI() + "> ?label ;"
            + "<" + DCTerms.creator.getURI() + "> ?creator ;" + "<" + SD.graph.getURI()
            + "> ?targetGraph ;" + "<" + LDIWO.xmlDefinition.getURI() + "> ?xml . " + "}";
    log.debug(query);

    String result =
        frameworkRdfStoreManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);
    log.debug(result);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    while (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();
      String jobId = bindingNode.get("job").path("value").textValue();
      String jobDesc = bindingNode.get("desc").path("value").textValue();
      String created = bindingNode.get("created").path("value").asText();
      String xml = URLDecoder.decode(bindingNode.get("xml").path("value").asText(), "UTF-8");
      // check, if the job is registered in SBA
      Registration registration = registrations.get(jobId.replace(uriBase, ""));
      if (registration == null) {
        // if not existing, re-register it
        log.warn("re-registering a not registered job: " + jobId);
        registration =
            BatchAdminClient.registerJob(jobId.replace(uriBase, ""), xml, springBatchServiceUri,
                springBatchDataDir);
      }
      // now, add additional meta information
      String label = bindingNode.get("label").path("value").textValue();
      String creator = bindingNode.get("creator").path("value").textValue().replace(uriBase, "");
      String targetGraph = bindingNode.get("targetGraph").path("value").textValue();
      registration.setDescription(jobDesc);
      registration.setCreated(created);
      registration.setLabel(label);
      registration.setCreator(creator);
      registration.setTargetGraph(targetGraph);
      // if it is a manual job there is no schedule



      // add to list
      userRegistrations.add(registration);
    }
    return userRegistrations;
  }

  /**
   * Stops executions of a Job
   * 
   * @param jobName
   * @param user
   * @return JobExecution or null if there was no execution to be stopped
   * @throws IOException
   * @throws ResourceNotFoundException
   * @throws UnknownException
   * @throws ServiceNotAvailableException
   * @throws Exception
   */
  public JobExecution stopJob(String jobName, UserProfile user) throws IOException,
      ResourceNotFoundException, UnknownException, ServiceNotAvailableException, Exception {

    // check if the job really exists
    if (jobExist(jobName, user.getAccountURI())) {
      // if so, stop the execution if running
      JobExecution execution = null;
      JobExecutions executions =
          BatchAdminClient.getAllExecutionsForJob(jobName, springBatchServiceUri);
      if (executions != null) {
        log.debug("job has " + executions.getJobExecutions().size() + " execuition ");
        for (int i = 0; i < executions.getJobExecutions().size(); i++) {
          // check all executions and not only the last!!
          JobExecution exec = executions.getJobExecutions().get(i);
          if (exec != null && exec.getStatus().contains("START")) {
            log.debug("stopping execuition " + exec.getResource());
            execution = BatchAdminClient.stopExecution(exec.getResource());
          }
        }
        return execution;
      }
      throw new ResourceNotFoundException("The job was never ran");
    } else
      throw new ResourceNotFoundException("The job was not found in the system.");

  }

  /**
   * Deletes a Job
   * 
   * @param jobName
   * @param user
   * @return boolean
   * @throws IOException
   * @throws Exception
   */
  public boolean deleteJob(String jobName, UserProfile user) throws IOException, Exception {

    // check if the job really exists
    if (jobExist(jobName, user.getAccountURI())) {
      // if so, stop the execution if running
      JobExecutions executions =
          BatchAdminClient.getAllExecutionsForJob(jobName, springBatchServiceUri);
      if (executions != null) {
        for (int i = 0; i < executions.getJobExecutions().size(); i++) {
          // check all executions and not only the last!!
          JobExecution exec = executions.getJobExecutions().get(i);
          if (exec != null && exec.getStatus().contains("START")) {
            log.debug("stopping execuition " + exec.getResource());
            BatchAdminClient.stopExecution(exec.getResource());
            log.debug("stopped");
          }
        }
      }
      // TODO delete job in spring batch admin BUT this is currently
      // not possible!
      // thus we just delete the jobs in file system, so the couldn't
      // be execute anymore after restart
      BatchAdminClient.removeJobXmlFromFileSystem(jobName, springBatchDataDir);


      // if successful, delete it from store
      // but don't forget to delete the associated schedules
      String query =
          "DELETE { GRAPH <" + jobsGraph + "> { " + "<" + uriBase + jobName + "> ?p ?o . "
              + "<"
              + uriBase
              + jobName
              + "_schedule_1"
              + "> ?a ?b . " // this won't work with multiple
                             // schedule, but this is not required now
              + "} } " + " WHERE { GRAPH <" + jobsGraph + "> { " + "<" + uriBase + jobName
              + "> ?p ?o ;  " + "<" + DCTerms.creator.getURI() + "> <" + user.getAccountURI()
              + "> ." + "OPTIONAL { <" + uriBase + jobName + "_schedule_1" + "> ?a ?b } . " + "} }";
      String result =
          frameworkRdfStoreManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);

      log.debug(result);
      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(result);
      Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
      if (bindingsIter.hasNext()) {
        JsonNode bindingNode = bindingsIter.next();
        // VIRTUOSO
        if (bindingNode.get("callret-0").path("value").textValue().contains("done"))
          return true;
      }
      return false;
    } else
      throw new ResourceNotFoundException("The job was not found in the system.");
  }

  /**
   * Execute a job
   * 
   * @param jobName
   * @return JobExecution
   * @throws ResourceNotFoundException
   * @throws UnknownException
   * @throws IOException
   * @throws ServiceNotAvailableException
   * @throws ServiceInternalServerError
   */
  public JobExecution executesJobs(String jobName) throws ResourceNotFoundException,
      UnknownException, IOException, ServiceNotAvailableException, ServiceInternalServerError {

    JobExecution execution;
    log.debug("Executes job: " + jobName);
    execution = BatchAdminClient.runJob(jobName, springBatchServiceUri);

    return execution;

  }

  /**
   * Get the description of a Job
   * 
   * @param jobName
   * @param user
   * @return Registration
   * @throws Exception
   */
  public Registration getJob(String jobName, UserProfile user) throws Exception {

    Registration job = null;
    String query =
        "SELECT ?desc ?created FROM <" + jobsGraph + "> WHERE { <" + uriBase + jobName + "> <"
            + DCTerms.creator.getURI() + "> <" + user.getAccountURI() + ">; <"
            + DCTerms.description.getURI() + "> ?desc ; <" + DCTerms.created.getURI()
            + "> ?created }";
    log.debug(query);

    String result =
        frameworkRdfStoreManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);
    log.debug(result);
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();

    if (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();
      String jobDesc = bindingNode.get("desc").path("value").textValue();
      String created = bindingNode.get("created").path("value").textValue();

      // TODO the job is maybe not defined in Spring Batch, if the
      // system was restarted. thus, register it
      job = BatchAdminClient.getJob(jobName, springBatchServiceUri);
      job.setDescription(jobDesc);
      job.setCreated(created);
    }

    return job;
  }

  public JobExecutions getExcecutions(Registration job) throws IOException, Exception {

    // complete with execution information
    JobExecutions executions = new JobExecutions();

    if (job.getJobInstances().size() > 0) {
      Set<Integer> instances = job.getJobInstances().keySet();
      log.debug(instances.size() + "instances ");
      Iterator<Integer> it = instances.iterator();

      while (it.hasNext()) {
        // this is just the instance number, no the ID:
        // http://localhost:8080/spring-batch-admin-geoknow/jobs/d2rq_2/4
        int id = it.next();
        JobExecutionWrapper execution =
            BatchAdminClient.getExecutionDetail(job.getName(), "" + id, springBatchServiceUri);
        executions.getJobExecutions().add(execution.getJobExecution());

      }
    }
    return executions;
  }

  /**
   * Creates a new job
   * 
   * @param serviceJob
   * @param user
   * @return
   * @throws IOException
   * @throws Exception
   * 
   *         TODO: validate serviceJob, especially if the name is unique and dattime, like with
   *         http:/
   *         /docs.oracle.com/javase/6/docs/api/javax/xml/bind/DatatypeConverter.html#parseDateTime
   *         %28java.lang.String%29
   */
  public Registration createJob(MultiStepJob serviceJob, UserProfile user) throws IOException,
      Exception {

    // create spring batch XML
    String xml = JobFactory.getInstance().createMultiStepServiceJobXml(serviceJob);

    // register job in the batch-admin
    Registration job =
        BatchAdminClient.registerJob(serviceJob.getName(), xml, springBatchServiceUri,
            springBatchDataDir);
    job.setDescription(serviceJob.getDescription());


    // store the job information in the triple store, distinguish
    // between scheduled and unscheduled
    XSDDateTime xsdDate = new XSDDateTime(GregorianCalendar.getInstance());
    String query;

    query =
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>" + "\n" + "INSERT DATA { GRAPH <"
            + jobsGraph + "> { " + "<" + uriBase + job.getName() + "> a <" + LDIWO.Job.getURI()
            + "> ; " + "<" + RDFS.label.getURI() + "> \"" + serviceJob.getLabel() + "\"^^<"
            + XSD.xstring.getURI() + "> ; " + "<" + DCTerms.creator.getURI() + "> <"
            + user.getAccountURI() + "> ; " + "<" + DCTerms.created.getURI() + "> \""
            + ResourceFactory.createTypedLiteral(xsdDate).getString() + "\"^^<"
            + XSD.dateTime.getURI() + "> ; " + "<" + DCTerms.description.getURI() + "> \""
            + job.getDescription() + "\"^^<" + XSD.xstring.getURI() + "> ; " + "<"
            + SD.graph.getURI() + "> \"" + serviceJob.getTargetGraph() + "\"^^<"
            + XSD.xstring.getURI() + "> ; " + "<" + LDIWO.xmlDefinition.getURI() + "> \""
            + URLEncoder.encode(xml, "utf-8") + "\"^^<" + XSD.xstring.getURI() + "> . " + "} }";
    log.debug(query);

    // write information to the jobs graph
    frameworkRdfStoreManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);

    return job;
  }

  /**
   * Verify that a user has a given job.
   * 
   * @param jobName
   * @param userUri
   * @return
   * @throws IOException
   * @throws Exception
   */
  private boolean jobExist(String jobName, String userUri) throws IOException, Exception {
    // ask if the resource exists
    String query =
        "ASK { GRAPH <" + jobsGraph + "> {<" + uriBase + jobName + "> <" + DCTerms.creator.getURI()
            + "> <" + userUri + "> }}";
    log.debug(query);
    String result =
        frameworkRdfStoreManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);

    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(result);

    return rootNode.path("boolean").booleanValue();
  }
}
