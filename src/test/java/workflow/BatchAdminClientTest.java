package workflow;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotSame;
import static org.junit.Assert.assertTrue;

import java.util.Calendar;
import java.util.GregorianCalendar;

import org.junit.Test;

import workflow.beans.JobExecution;
import workflow.beans.JobExecutionWraper;
import workflow.beans.JobExecutions;
import workflow.beans.JobsRegistered;
import workflow.beans.Registration;
import ApplicationExceptions.ResourceNotFoundException;

/**
 * To run these tests we assume that spring-batch-admin-xxxxx is running
 * somewhere in BatchAdminClient.setServiceUrl(serviceUrl).
 * 
 * @author alejandragarciarojas
 *
 */
public class BatchAdminClientTest {

    @Test
    public void registeXmlJobTest() throws Exception {

        Calendar calendar = new GregorianCalendar();

        JobFactory.getInstance();
        String id = "testXml_" + calendar.getTimeInMillis();
        String description = "some description";
        String xml = JobFactory.createOneStepServiceJobXml(id, description, "http://...",
                "application/json", "post", "{some:json}");
        assertTrue(xml.startsWith("<?xml version="));

        Registration response = BatchAdminClient.registerJob(id, xml);
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

    @Test(expected = ResourceNotFoundException.class)
    public void getUnexistingExecution() throws Exception {
        JobExecutionWraper execution = BatchAdminClient.getExecutionDetail("91919");
        execution.getJobExecution();
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

        JobExecutionWraper execution = BatchAdminClient.getExecutionDetail(exec.getId());
        assertEquals(exec.getId(), execution.getJobExecution().getId());

        JobExecutionWraper execWr = BatchAdminClient.stopExecution(exec.getId());
        assertEquals("STOPPING", execWr.getJobExecution().getStatus());

    }

}
