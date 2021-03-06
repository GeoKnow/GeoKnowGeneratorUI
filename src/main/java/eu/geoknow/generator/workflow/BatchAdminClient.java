package eu.geoknow.generator.workflow;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map.Entry;

import javax.ws.rs.core.MediaType;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MIME;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.exceptions.ServiceInternalServerError;
import eu.geoknow.generator.exceptions.ServiceNotAvailableException;
import eu.geoknow.generator.exceptions.UnknownException;
import eu.geoknow.generator.utils.Utils;
import eu.geoknow.generator.workflow.beans.JobExecution;
import eu.geoknow.generator.workflow.beans.JobExecutionWrapper;
import eu.geoknow.generator.workflow.beans.JobExecutions;
import eu.geoknow.generator.workflow.beans.JobWraper;
import eu.geoknow.generator.workflow.beans.JobsRegistered;
import eu.geoknow.generator.workflow.beans.Registration;
import eu.geoknow.generator.workflow.beans.Status;
import eu.geoknow.generator.workflow.beans.StepExecution;
import eu.geoknow.generator.workflow.beans.StepJobExecution;

/**
 * A client class for spring-batch-admin service. This service doesn't support authentication, thus
 * it is warped inside the workbench.
 * 
 * @author alejandragarciarojas
 *
 */
public class BatchAdminClient {

  private static final Logger log = Logger.getLogger(BatchAdminClient.class);

  // removed from code to ttl
  // private static String serviceUrl =
  // "http://localhost:8080/spring-batch-admin-geoknow";

  /**
   * Retrieves the execution detail of an execution.
   * 
   * 
   * http://generator.geoknow.eu:8080/spring-batch-admin-geoknow/jobs/executions/0.json?
   * 
   * @param jobName name of the job
   * @param executionNum number of the job execution it is not the ID
   * @param springBatchServiceUri the URI of Spring Batch Admin
   * @return JobExecution
   * @throws ServiceNotAvailableException
   * @throws ServiceInternalServerError
   * @throws Exception
   */
  public static List<JobExecutionWrapper> getExecutionDetail(String jobName, String jobInstanceId,
      String springBatchServiceUri) throws ResourceNotFoundException, UnknownException,
      IOException, ServiceNotAvailableException, ServiceInternalServerError {

    // get executions of an instance
    log.debug(springBatchServiceUri + "/jobs/" + jobName + "/" + jobInstanceId + ".json");
    HttpGet jobInstance =
        new HttpGet(springBatchServiceUri + "/jobs/" + jobName + "/" + jobInstanceId + ".json");
    String jsonString = apiRequest(jobInstance);

    List<JobExecutionWrapper> executionsList = new ArrayList<JobExecutionWrapper>();
    // create Java object
    ObjectMapper mapper = new ObjectMapper();
    Gson gson = new Gson();

    JobExecutions jobExecutions = mapper.readValue(jsonString, JobExecutions.class);
    // a job instance may contain several executions
    Iterator<JobExecution> executionsIterator = jobExecutions.getJobExecutions().iterator();

    // "http://generator.geoknow.eu:8080/spring-batch-admin-geoknow/jobs/executions/11.json",
    while (executionsIterator.hasNext()) {
      JobExecution execution = executionsIterator.next();
      // wrapper
      log.debug("get execution:" + execution.getResource());
      HttpGet JobExecution = new HttpGet(execution.getResource());
      jsonString = apiRequest(JobExecution);
      JobExecutionWrapper ewrap = gson.fromJson(jsonString, JobExecutionWrapper.class);
      List<StepJobExecution> failedSteps = new ArrayList<StepJobExecution>();

      // get the URL with the execution detailed error message
      for (Entry<String, StepExecution> entries : ewrap.getJobExecution().getStepExecutions()
          .entrySet()) {
        log.debug(entries.getKey());
        // next values may be null if the step was not executed
        log.debug(entries.getValue().getId() == null);

        if (entries.getValue().getId() != null) {
          if (entries.getValue().getExitCode() == Status.FAILED) {
            log.debug(entries.getValue().getResource());
            HttpGet stepExecution = new HttpGet(entries.getValue().getResource());
            jsonString = apiRequest(stepExecution);
            StepJobExecution failedStep = gson.fromJson(jsonString, StepJobExecution.class);
            failedSteps.add(failedStep);
            // we add the exit description to the step metadata
            entries.getValue().setExitDescription(
                failedStep.getStepExecution().getExitDescription());
          }
        }
      }

      // here we add a exit description to the hole execution (i.e.) step 1 failed
      Iterator<StepJobExecution> iter = failedSteps.iterator();
      while (iter.hasNext()) {
        StepJobExecution fs = iter.next();
        String oldesc = ewrap.getJobExecution().getExitDescription();
        if (!oldesc.equals(""))
          oldesc += "<br/>";
        ewrap.getJobExecution().setExitDescription(
            oldesc + fs.getStepExecution().getName() + " : "
                + fs.getStepExecution().getExitCode().toString());
      }
      executionsList.add(ewrap);
    }
    return executionsList;
  }

  /**
   * Retrieves all executions
   * 
   * @param springBatchServiceUri the URI of Spring Batch Admin
   * @return JobExecutions
   * @throws ServiceNotAvailableException
   * @throws ServiceInternalServerError
   * @throws Exception
   */
  public static JobExecutions getAllExecutions(String springBatchServiceUri)
      throws ResourceNotFoundException, UnknownException, IOException,
      ServiceNotAvailableException, ServiceInternalServerError {
    HttpGet getExecutions = new HttpGet(springBatchServiceUri + "/jobs/executions.json");
    String jsonString = apiRequest(getExecutions);
    Gson gson = new Gson();
    JobExecutions executions = gson.fromJson(jsonString, JobExecutions.class);
    return executions;
  }

  /**
   * Retrieves all executions for a specific job
   * 
   * @param jobId id of the job to get the executions for
   * @param springBatchServiceUri the URI of Spring Batch Admin
   * @return JobExecutions
   * @throws ServiceNotAvailableException
   * @throws ServiceInternalServerError
   * @throws Exception
   */
  public static JobExecutions getAllExecutionsForJob(String jobId, String springBatchServiceUri)
      throws ResourceNotFoundException, UnknownException, IOException,
      ServiceNotAvailableException, ServiceInternalServerError {
    HttpGet getExecutions =
        new HttpGet(springBatchServiceUri + "/jobs/" + jobId + "/executions.json");
    String jsonString = apiRequest(getExecutions);
    // create Java object
    ObjectMapper mapper = new ObjectMapper();
    JobExecutions executions = mapper.readValue(jsonString, JobExecutions.class);
    return executions;
  }

  /**
   * Retrieves all executions of a job that were executed.
   * 
   * @param jobName name of the job
   * @param instanceId instance id
   * @param springBatchServiceUri the URI of Spring Batch Admin
   * @return JobExecutions
   * @throws ServiceNotAvailableException
   * @throws ServiceInternalServerError
   * @throws Exception
   */
  public static JobExecutions getJobInstanceExecutions(String jobName, int instanceId,
      String springBatchServiceUri) throws ResourceNotFoundException, UnknownException,
      IOException, ServiceNotAvailableException, ServiceInternalServerError {
    HttpGet getExecutions =
        new HttpGet(springBatchServiceUri + "/jobs/" + jobName + "/" + instanceId
            + "/executions.json");
    String jsonString = apiRequest(getExecutions);
    log.debug(jsonString);
    ObjectMapper mapper = new ObjectMapper();
    // JobInstanceWrapper jobInst = mapper.readValue(jsonString, JobInstanceWrapper.class);
    // return jobInst.getJobInstance().getJobExecutions();
    JobExecutions jobExecutions = mapper.readValue(jsonString, JobExecutions.class);
    return jobExecutions;
  }

  /**
   * Runs a job.
   * 
   * @param jobName name of the job
   * @return JobExecution execution object
   * @throws ServiceNotAvailableException
   * @throws ServiceInternalServerError
   * @throws Exception
   */
  public static JobExecution runJob(String jobName, String springBatchServiceUri)
      throws ResourceNotFoundException, UnknownException, IOException,
      ServiceNotAvailableException, ServiceInternalServerError {
    String params = getLastJobExecutionParameters(jobName, springBatchServiceUri);
    return runJob(jobName, params, springBatchServiceUri);
  }

  /**
   * Runs a job with the defined parameters.
   * 
   * @param jobName name of the job
   * @param jobParameters job parameters for the execution
   * @param springBatchServiceUri the URI of Spring Batch Admin
   * @return JobExecution
   * @throws ServiceNotAvailableException
   * @throws ServiceInternalServerError
   * @throws Exception
   */
  public static JobExecution runJob(String jobName, String jobParameters,
      String springBatchServiceUri) throws ResourceNotFoundException, UnknownException,
      IOException, ServiceNotAvailableException, ServiceInternalServerError {
    HttpPost postJob = new HttpPost(springBatchServiceUri + "/jobs/" + jobName + ".json");
    postJob.addHeader(MIME.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED);

    log.debug("execute " + jobName + " with parameters: " + jobParameters);
    ArrayList<NameValuePair> postParameters = new ArrayList<NameValuePair>();
    postParameters.add(new BasicNameValuePair("jobParameters", jobParameters));
    postJob.setEntity(new UrlEncodedFormEntity(postParameters));

    String jsonString = apiRequest(postJob);
    Gson gson = new Gson();
    JobExecutionWrapper execution = gson.fromJson(jsonString, JobExecutionWrapper.class);
    return execution.getJobExecution();
  }

  /**
   * Stop job execution
   * 
   * @param resourceString the URI to the SBA execution resource
   * @return JobExecution
   * @throws ServiceNotAvailableException
   * @throws ServiceInternalServerError
   * @throws Exception
   */
  public static JobExecution stopExecution(String resourceString) throws ResourceNotFoundException,
      UnknownException, IOException, ServiceNotAvailableException, ServiceInternalServerError {
    HttpDelete deleteJob = new HttpDelete(resourceString);
    String jsonString = apiRequest(deleteJob);
    log.debug(jsonString);
    Gson gson = new Gson();
    JobExecutionWrapper execution = gson.fromJson(jsonString, JobExecutionWrapper.class);
    return execution.getJobExecution();
  }

  /**
   * Retrieves a job description
   * 
   * @param jobName
   * @param springBatchServiceUri the URI of Spring Batch Admin
   * @return Registration
   * @throws ServiceNotAvailableException
   * @throws ServiceInternalServerError
   * @throws Exception
   */
  public static Registration getJob(String jobName, String springBatchServiceUri)
      throws ResourceNotFoundException, UnknownException, IOException,
      ServiceNotAvailableException, ServiceInternalServerError {
    HttpGet getJob = new HttpGet(springBatchServiceUri + "/jobs/" + jobName + ".json");
    String jsonString = apiRequest(getJob);
    log.debug(jsonString);
    Gson gson = new Gson();
    JobWraper job = gson.fromJson(jsonString, JobWraper.class);
    return job.getJob();
  }

  /**
   * Retrieves all registered jobs.
   * 
   * @param springBatchServiceUri the URI of Spring Batch Admin
   * @return JobsRegistered
   * @throws ServiceNotAvailableException
   * @throws ServiceInternalServerError
   * @throws Exception
   */
  public static JobsRegistered getRegistedJobs(String springBatchServiceUri)
      throws ResourceNotFoundException, UnknownException, IOException,
      ServiceNotAvailableException, ServiceInternalServerError {
    HttpGet getJobs = new HttpGet(springBatchServiceUri + "/jobs.json");
    String jsonString = apiRequest(getJobs);
    Gson gson = new Gson();
    JobsRegistered allJobs = gson.fromJson(jsonString, JobsRegistered.class);
    return allJobs;
  }

  /**
   * Registers a job in the batch admin service
   * 
   * @param File configuration file
   * @param springBatchServiceUri the URI of Spring Batch Admin
   * @param sbaDir path to Spring Batch Admin "META-INF/spring/batch/jobs" dir
   * @return
   * @throws ServiceNotAvailableException
   * @throws ServiceInternalServerError
   * @throws InformationMissingException
   * @throws Exception
   */
  public static Registration registerJob(String id, String xml, String springBatchServiceUri,
      String sbaDir) throws ResourceNotFoundException, UnknownException, IOException,
      ServiceNotAvailableException, ServiceInternalServerError, InformationMissingException {

    // store the job data in the file system as well, otherwise SBA has
    // problems to manage jobs
    // this is ugly but the only way
    String path = storeXmlInJobDirectory(id, xml, sbaDir);
    // send data to register job
    HttpPost postConfig = new HttpPost(springBatchServiceUri + "/job-configuration");
    File file = new File(path);
    MultipartEntityBuilder builder = MultipartEntityBuilder.create();
    builder.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
    builder.addBinaryBody("file", file, ContentType.DEFAULT_BINARY, id + ".xml");
    HttpEntity entity = builder.build();
    postConfig.setEntity(entity);
    String responseString = "";
    CloseableHttpClient httpClient = HttpClients.createDefault();
    try {
      log.debug(postConfig.getMethod() + ": " + postConfig.getURI().toString());
      CloseableHttpResponse response = httpClient.execute(postConfig);
      responseString = IOUtils.toString(response.getEntity().getContent(), "UTF-8");
    } catch (Exception e) {
      log.error(Utils.getExceptionStackTraceAsString(e));
    }
    log.debug(responseString);
    // return
    return getJob(id, springBatchServiceUri);

  }

  /**
   * Method to store the XML in the Spring Batch Admin job dir and to backup them in the framework
   * data dir
   * 
   * @param id id of th job
   * @param xml XML to store in the file
   * @param sbaDir path to spring-batch-admin-geoknow/WEB-INF/classes/META-INF/spring /batch/jobs
   * @throws InformationMissingException
   */
  private static String storeXmlInJobDirectory(String id, String xml, String sbaDir)
      throws InformationMissingException {
    java.io.FileWriter fwSBA = null;
    java.io.FileWriter fwWB = null;
    try {
      // check if foder exists
      File jobsDir = new File(FrameworkConfiguration.getInstance().getFrameworkDataDir() + "/jobs");
      if (!jobsDir.exists()) {
        Utils.createDir(FrameworkConfiguration.getInstance().getFrameworkDataDir() + "/jobs");
      }
      fwSBA = new java.io.FileWriter(sbaDir + "/" + id + ".xml");
      fwWB =
          new java.io.FileWriter(FrameworkConfiguration.getInstance().getFrameworkDataDir()
              + "/jobs/" + id + ".xml");
      fwSBA.write(xml);
      fwWB.write(xml);
      fwSBA.close();
      fwWB.close();
    } catch (IOException e) {
      log.error(Utils.getExceptionStackTraceAsString(e));
    }
    // return the job path
    return sbaDir + "/" + id + ".xml";
  }

  /**
   * Method to remove job XML files from Spring Batch Admin job directory and framework data dir.
   * 
   * @param id ID of the job
   * @param sbaDir path to spring-batch-admin-geoknow/WEB-INF/classes/META-INF/spring /batch/jobs
   * @throws InformationMissingException
   */
  public static void removeJobXmlFromFileSystem(String id, String sbaDir)
      throws InformationMissingException {
    try {
      File sba = new File(sbaDir + "/" + id + ".xml");
      File fwd =
          new File(FrameworkConfiguration.getInstance().getFrameworkDataDir() + "/jobs/" + id
              + ".xml");
      FileUtils.forceDelete(sba);
      FileUtils.forceDelete(fwd);
    } catch (IOException e) {
      log.error(Utils.getExceptionStackTraceAsString(e));
    }
  }

  /**
   * Retrieves the last execution parameter that can be used to execute the job again
   * 
   * @param jobName
   * @param springBatchServiceUri the URI of Spring Batch Admin
   * @return jobParameters as a string of key=value separated by comma
   * @throws ServiceNotAvailableException
   * @throws ServiceInternalServerError
   * @throws Exception
   */
  private static String getLastJobExecutionParameters(String jobName, String springBatchServiceUri)
      throws ResourceNotFoundException, UnknownException, IOException,
      ServiceNotAvailableException, ServiceInternalServerError {
    String params = "";
    Registration job = getJob(jobName, springBatchServiceUri);
    if (!job.getJobInstances().isEmpty()) {
      // get the last instance
      Integer lastJobInstanceId = job.getJobInstances().lastEntry().getKey();
      JobExecutions executions =
          getJobInstanceExecutions(jobName, lastJobInstanceId, springBatchServiceUri);
      // the executions of an instance have the same JobParameters
      List<JobExecution> executionList = executions.getJobExecutions();
      // now, use last element (it has only one)
      JobExecution last = executionList.get(executions.getJobExecutions().size() - 1);

      List<String> list = new ArrayList<String>();
      for (Entry<String, String> entry : last.getJobParameters().entrySet())
        list.add(entry.getKey() + "= " + entry.getValue());
      params = StringUtils.join(list, ',');

    }
    return params;
  }

  /**
   * Performs requests method against the service
   * 
   * @param method
   * @return response body as string
   * @throws ResourceNotFoundException
   * @throws UnknownException
   * @throws IOException
   * @throws ServiceNotAvailableException
   * @throws ServiceInternalServerError
   */
  private static String apiRequest(HttpRequestBase method) throws ResourceNotFoundException,
      UnknownException, IOException, ServiceNotAvailableException, ServiceInternalServerError {

    String jsonString = "";
    CloseableHttpClient httpClient = HttpClients.createDefault();
    try {
      log.debug(method.getMethod() + ": " + method.getURI().toString());
      CloseableHttpResponse response = httpClient.execute(method);
      log.debug(response.getStatusLine().getStatusCode() + " : "
          + response.getStatusLine().getReasonPhrase());
      switch (response.getStatusLine().getStatusCode()) {
        case 404:
          throw new ServiceNotAvailableException("SBA is not 404");
        case 200:
          jsonString = IOUtils.toString(response.getEntity().getContent(), "UTF-8");
          // catch errors
          ObjectMapper mapper = new ObjectMapper();
          JsonNode rootNode = mapper.readTree(jsonString);
          if (rootNode.get("errors") != null) {
            log.error(jsonString);
            if (rootNode.get("errors").get("job.execution.not.running") != null)
              throw new ResourceNotFoundException(rootNode.get("errors")
                  .get("job.execution.not.running").asText());
            if (rootNode.get("errors").get("no.such.job.execution") != null)
              throw new ResourceNotFoundException(rootNode.get("errors")
                  .get("no.such.job.execution").asText());
            else if (rootNode.get("errors").get("no.such.job") != null)
              throw new ResourceNotFoundException(rootNode.get("errors").get("no.such.job")
                  .asText());
            else
              throw new UnknownException(rootNode.get("errors").asText());

          }
          break;
        case 500:
          throw new ServiceInternalServerError("Spring Batch Admin Interal Server Error");
      }

    } catch (com.fasterxml.jackson.core.JsonParseException e) {
      log.error(e);
      log.error(jsonString);
      throw new IOException(e);
    } catch (ClientProtocolException e) {
      e.printStackTrace();
      throw new IOException(e);
    } catch (IOException e) {
      e.printStackTrace();
      throw new IOException(e);
    } finally {
      // Release the connection.
      method.releaseConnection();
      httpClient.close();
    }

    return jsonString;
  }
}
