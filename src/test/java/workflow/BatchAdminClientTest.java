package workflow;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotSame;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.util.Calendar;
import java.util.GregorianCalendar;

import org.junit.Test;

import workflow.beans.JobExecution;
import workflow.beans.JobExecutionWraper;
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

        Calendar calendar = new GregorianCalendar();

        JobFactory.getInstance();
        String id = "testFile_" + calendar.getTimeInMillis();
        String description = "some description";
        File file = JobFactory.createOneStepServiceJobFile(id, description, "http://...",
                "application/json", "post", "{some:json}");
        assertTrue(file.exists());

        Registration response = BatchAdminClient.registerJob(id, file);
        assertEquals(id, response.getName());
        // TODO: descriptions of job is not implemented
        // assertEquals(description, response.getDescription());
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
        JobExecutionWraper execution = BatchAdminClient.getExecutionDetail("91919");
        assertEquals(null, execution.getJobExecution());
    }

    @Test
    public void executeJobAndGetExecutionsAndStop() throws Exception {
        JobExecution exec = BatchAdminClient.runJob("limesJobSampleJson");
        assertEquals("START", exec.getStatus().substring(0, 5));

        JobExecutions executions = BatchAdminClient.getAllExecutions();
        assertNotSame(0, executions.getJobExecutions().size());

        // run more times to test job parameters passing
        exec = BatchAdminClient.runJob("limesJobSampleJson");
        assertEquals("START", exec.getStatus().substring(0, 5));

        JobExecutionWraper execution = BatchAdminClient.getExecutionDetail("1");
        assertEquals("1", execution.getJobExecution().getId());

        JobExecutionWraper execWr = BatchAdminClient.stopExecution("1");
        System.out.println(execWr.toString());

    }

}
