package workflow;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotSame;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.util.UUID;

import org.junit.Test;

import workflow.BatchAdminClient;
import workflow.JobFactory;
import workflow.beans.JobExecution;
import workflow.beans.JobExecutions;
import workflow.beans.JobsRegistered;
import workflow.beans.Registration;

/**
 * To run these tests we assume that spring-batch-admin-xxxxx is running
 * somewhere in BatchAdminClient.setServiceUrl(serviceUrl).
 * 
 * @author alejandragarciarojas
 *
 */
public class BatchAdminClientTest {

    //
    // @Test
    // public void registerXmlJobTest() throws Exception {
    // JobFactory.getInstance();
    // String id = "testXml_" + UUID.randomUUID().toString();
    // String xml = JobFactory.createOneStepServiceJobXml(id, "http:/ddd/...",
    // "application/json",
    // "post", "{some:json}");
    //
    // assertTrue(xml.contains(id));
    // String response = BatchAdminClient.registerJob(xml);
    //
    // }

    @Test
    public void registeFileJobTest() throws Exception {

        JobFactory.getInstance();
        String id = "testFile_" + UUID.randomUUID().toString();
        File file = JobFactory.createOneStepServiceJobFile(id, "http://...", "application/json",
                "post", "{some:json}");
        assertTrue(file.exists());

        Registration response = BatchAdminClient.registerJob(id, file);
        assertEquals(id, response.getName());
    }

    @Test
    public void getAllJobsTest() throws Exception {
        JobsRegistered jobs = BatchAdminClient.getRegistedJobs();
        assertNotSame(0, jobs.getJobs().getRegistrations().size());
    }

    @Test
    public void getAJob() throws Exception {
        Registration job = BatchAdminClient.getJob("job1");
        assertEquals("job1", job.getName());
    }

    // @Test
    // public void getNoExecutions() throws Exception {
    // JobExecutions executions = BatchAdminClient.getExecutions();
    // assertEquals(0, executions.getJobExecutions().size());
    // }

    @Test
    public void getUnexistingExecution() throws Exception {
        JobExecution execution = BatchAdminClient.getExecution("91919");
        assertEquals(null, execution);
    }

    @Test
    public void executeJobAndGetExecutions() throws Exception {
        JobExecution exec = BatchAdminClient.runJob("limesJobSampleJson");
        assertEquals("START", exec.getStatus().substring(0, 5));

        JobExecutions executions = BatchAdminClient.getExecutions();
        assertNotSame(0, executions.getJobExecutions().size());

        JobExecution execution = BatchAdminClient.getExecution("0");
        assertEquals("0", execution.getId());

        // run more times to test job parameters passing
        exec = BatchAdminClient.runJob("limesJobSampleJson");
        assertEquals("START", exec.getStatus().substring(0, 5));

    }

}
