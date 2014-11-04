package workflow;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map.Entry;

import javax.ws.rs.core.MediaType;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MIME;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.log4j.Logger;

import workflow.beans.JobExecution;
import workflow.beans.JobExecutionWraper;
import workflow.beans.JobExecutions;
import workflow.beans.JobWraper;
import workflow.beans.JobsRegistered;
import workflow.beans.Registration;

import com.google.gson.Gson;

/**
 * A client class for spring-batch-admin service. This service doesn't support
 * authentication, thus it is warped inside the workbench.
 * 
 * @author alejandragarciarojas
 *
 */
public class BatchAdminClient {

    private static final Logger log = Logger.getLogger(BatchAdminClient.class);

    private static String serviceUrl = "http://localhost:9999/spring-batch-admin-geoknow";

    /**
     * Get the service URL
     * 
     * @return url
     */
    public static String getServiceUrl() {
        return serviceUrl;
    }

    /**
     * Set the service URL
     * 
     * @param serviceUrl
     */
    public static void setServiceUrl(String serviceUrl) {
        BatchAdminClient.serviceUrl = serviceUrl;
    }

    /**
     * Retrieves the execution detail of an execution.
     * 
     * @param executionId
     * @return JobExecution
     * @throws Exception
     */
    public static JobExecutionWraper getExecutionDetail(String executionId) throws Exception {
        HttpGet JobExecution = new HttpGet(serviceUrl + "/jobs/executions/" + executionId + ".json");
        String jsonString = apiRequest(JobExecution);
        Gson gson = new Gson();
        JobExecutionWraper execution = gson.fromJson(jsonString, JobExecutionWraper.class);
        return execution;
    }

    /**
     * Retrieves all executions
     * 
     * @return JobExecutions
     * @throws Exception
     */
    public static JobExecutions getAllExecutions() throws Exception {
        HttpGet getExecutions = new HttpGet(serviceUrl + "/jobs/executions.json");
        String jsonString = apiRequest(getExecutions);
        Gson gson = new Gson();
        JobExecutions executions = gson.fromJson(jsonString, JobExecutions.class);
        return executions;
    }

    /**
     * Retrieves all instances of a job that were executed.
     * 
     * @param jobName
     *            name of the job
     * @param instanceId
     *            instance id
     * @return JobExecutions
     * @throws Exception
     */
    public static JobExecutions getJobInstanceExecutions(String jobName, int instanceId)
            throws Exception {
        HttpGet getExecutions = new HttpGet(serviceUrl + "/jobs/" + jobName + "/" + instanceId
                + "/executions.json");
        String jsonString = apiRequest(getExecutions);
        Gson gson = new Gson();
        JobExecutions executions = gson.fromJson(jsonString, JobExecutions.class);
        return executions;
    }

    /**
     * Runs a job.
     * 
     * @param jobName
     *            name of the job
     * @return JobExecution execution object
     * @throws Exception
     */
    public static JobExecution runJob(String jobName) throws Exception {
        String params = getLastJobExecutionParameters(jobName);
        return runJob(jobName, params);
    }

    /**
     * Runs a job with the defined parameters.
     * 
     * @param jobName
     *            name of the job
     * @param jobParameters
     *            job parameters for the execution
     * @return JobExecution
     * @throws Exception
     */
    public static JobExecution runJob(String jobName, String jobParameters) throws Exception {
        HttpPost postJob = new HttpPost(serviceUrl + "/jobs/" + jobName + ".json");
        postJob.addHeader(MIME.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED);

        log.debug("execute " + jobName + " with parameters: " + jobParameters);
        ArrayList<NameValuePair> postParameters = new ArrayList<NameValuePair>();
        postParameters.add(new BasicNameValuePair("jobParameters", jobParameters));
        postJob.setEntity(new UrlEncodedFormEntity(postParameters));

        String jsonString = apiRequest(postJob);
        Gson gson = new Gson();
        JobExecutionWraper execution = gson.fromJson(jsonString, JobExecutionWraper.class);
        return execution.getJobExecution();
    }

    /**
     * Stop job execution
     * 
     * @param execId
     * @return JobExecution
     * @throws Exception
     */
    public static JobExecutionWraper stopExecution(String execId) throws Exception {
        HttpDelete deleteJob = new HttpDelete(serviceUrl + "/jobs/executions/" + execId + ".json");
        String jsonString = apiRequest(deleteJob);
        log.debug(jsonString);
        Gson gson = new Gson();
        JobExecutionWraper execution = gson.fromJson(jsonString, JobExecutionWraper.class);

        return execution;
    }

    /**
     * Retrieves a job description
     * 
     * @param jobName
     * @return Registration
     * @throws Exception
     */
    public static Registration getJob(String jobName) throws Exception {
        HttpGet getJob = new HttpGet(serviceUrl + "/jobs/" + jobName + ".json");
        String jsonString = apiRequest(getJob);
        Gson gson = new Gson();
        JobWraper job = gson.fromJson(jsonString, JobWraper.class);
        return job.getJob();
    }

    /**
     * Retrieves all registered jobs.
     * 
     * @return JobsRegistered
     * @throws Exception
     */
    public static JobsRegistered getRegistedJobs() throws Exception {
        HttpGet getJobs = new HttpGet(serviceUrl + "/jobs.json");
        String jsonString = apiRequest(getJobs);
        Gson gson = new Gson();
        JobsRegistered allJobs = gson.fromJson(jsonString, JobsRegistered.class);
        return allJobs;
    }

    /**
     * Registers a job in the batch admin service
     * 
     * @param File
     *            configuration file
     * @return
     * @throws Exception
     */
    public static Registration registerJob(String id, File file) throws Exception {

        HttpPost uploadFile = new HttpPost(serviceUrl + "/job-configuration");
        MultipartEntityBuilder builder = MultipartEntityBuilder.create();
        builder.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
        FileBody fb = new FileBody(file);
        builder.addPart("file", fb);
        HttpEntity multipart = builder.build();
        uploadFile.setEntity(multipart);
        // simulate registerJob(String configuration)
        apiRequest(uploadFile);
        return getJob(id);

    }

    /*
     * public static String registerJob(String configuration) throws Exception {
     * 
     * HttpPost postConfig = new HttpPost(serviceUrl +
     * "/job-configuration.json"); // postConfig.addHeader(MIME.CONTENT_TYPE,
     * MediaType.APPLICATION_JSON); StringEntity entity = new
     * StringEntity(configuration); postConfig.setEntity(entity);
     * 
     * String response = apiRequest(postConfig); return response; }
     */

    /**
     * Retrieves the last execution parameter that can be used to execute the
     * job again
     * 
     * @param jobName
     * @return jobParameters as a string of key=value separated by comma
     * @throws Exception
     */
    private static String getLastJobExecutionParameters(String jobName) throws Exception {
        String params = "";
        Registration job = getJob(jobName);
        if (!job.getJobInstances().isEmpty()) {
            // get the last instance
            Integer lastJobInstanceId = job.getJobInstances().lastEntry().getKey();
            JobExecutions executions = getJobInstanceExecutions(jobName, lastJobInstanceId);
            // the executions of an instance have the same JobParameters
            JobExecution last = executions.getJobExecutions().get(
                    executions.getJobExecutions().size() - 1);

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
     * @return json string
     * @throws Exception
     */
    private static String apiRequest(HttpRequestBase method) throws Exception {

        CloseableHttpClient httpClient = HttpClients.createDefault();
        try {
            log.debug(method.getURI().toString());
            CloseableHttpResponse response = httpClient.execute(method);
            String jsonString = IOUtils.toString(response.getEntity().getContent());
            return jsonString;
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            throw new Exception(e);
        } finally {
            // Release the connection.
            method.releaseConnection();
            httpClient.close();
        }
    }

}
