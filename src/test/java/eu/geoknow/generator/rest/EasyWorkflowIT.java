package eu.geoknow.generator.rest;

import static com.jayway.restassured.RestAssured.delete;
import static com.jayway.restassured.RestAssured.expect;
import static com.jayway.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.isOneOf;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.apache.log4j.Logger;
import org.junit.BeforeClass;
import org.junit.Test;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.path.json.JsonPath;
import com.jayway.restassured.response.Response;
import com.jayway.restassured.response.ValidatableResponse;

/**
 * Tests a very simple 3 step workflow that pings google
 * 
 * <pre>
 * {
 *     "name": "JOB_ID",
 *     "label": "label",
 *     "description": "desc",
 *     "steps": [
 *         {
 *             "service": "http://google.com",
 *             "contenttype": "",
 *             "method": "GET",
 *             "body": "",
 *             "numberOfOrder": 1
 *         },
 *         {
 *             "service": "http://google.com",
 *             "contenttype": "",
 *             "method": "GET",
 *             "body": "",
 *             "numberOfOrder": 2
 *         },
 *         {
 *             "service": "http://google.com",
 *             "contenttype": "",
 *             "method": "GET",
 *             "body": "",
 *             "numberOfOrder": 3
 *         }
 *     ]
 * }
 * </pre>
 * 
 * job With schedule
 * 
 * <pre>
 * {
 *     "name": "myshceduledjob1426082643052",
 *     "label": "my shceduled job",
 *     "description": "my shceduled job",
 *     "steps": [
 *         {
 *             "service": "http://test.lindas-data.ch/rest/publish/createTempGraph",
 *             "contenttype": "application/x-www-form-urlencoded",
 *             "method": "POST",
 *             "body": "endpointUri=http://test....",
 *             "numberOfOrder": 1
 *         },
 *         {
 *             "service": "http://test...",
 *             "contenttype": "application/json",
 *             "method": "GET",
 *             "body": "{}",
 *             "numberOfOrder": 2
 *         },
 *         {
 *             "service": "http://test.lindas-data.ch/rest/publish",
 *             "contenttype": "application/x-www-form-urlencoded",
 *             "method": "POST",
 *             "body": "endpointUri=...": 3
 *         }
 *     ],
 *     "schedule": {
 *         "start": "2016-02-05T05:20:00.000Z",
 *         "end": "2016-10-01T05:30:00.000Z",
 *         "intervalDay": true,
 *         "intervalWeek": false,
 *         "intervalMonth": false
 *     },
 *     "targetGraph": "http://test.lindas-data.ch/resource/test01"
 * }
 * 
 * </pre>
 * 
 * @author alejandragarciarojas
 *
 */
public class EasyWorkflowIT {

  private static final Logger log = Logger.getLogger(EasyWorkflowIT.class);

  private String workflow =
      "{\"name\" : \"JOB_ID\",\"label\" : \"label\",\"description\" : \"desc\",\"steps\" : [ { \"service\": \"http://google.com\", \"contenttype\": \"\", \"method\": \"GET\", \"body\": \"\", \"numberOfOrder\": 1 }, { \"service\": \"http://google.com\", \"contenttype\": \"\", \"method\": \"GET\", \"body\": \"\", \"numberOfOrder\": 2 }, { \"service\": \"http://google.com\", \"contenttype\": \"\", \"method\": \"GET\", \"body\": \"\", \"numberOfOrder\": 3 }]}";
  private static Map<String, String> cookies;
  private static String jobId;


  @BeforeClass
  public static void init() {

    RestAssured.baseURI = "http://localhost";
    RestAssured.port = 8080;
    // TODO: find a way to parametrise this basePath
    RestAssured.basePath = "/generator";

    ValidatableResponse auth =
        given().param("mode", "login").param("username", "testing")
            .param("password", "integration-testing").when().post("/AuthenticationServlet").then();
    auth.assertThat().statusCode(200);
    cookies = new HashMap<String, String>(auth.extract().cookies());
    Calendar calendar = new GregorianCalendar();
    jobId = "TestJob_" + calendar.getTimeInMillis();

  }

  @Test
  public void testGetJobsByAnnonymous() {
    expect().statusCode(401).when().get("/rest/jobs");

  }

  @Test
  public void testCreate() throws Exception {

    log.info("add job: " + jobId);
    // creates a job
    given().cookies(cookies).contentType("application/json")
        .body(workflow.replace("JOB_ID", jobId)).when().put("/rest/jobs").then().assertThat()
        .statusCode(201).and().body("job.name", equalTo(jobId));

    // check job description
    log.info("get job: " + jobId);
    Response res = given().cookies(cookies).when().get("/rest/jobs/" + jobId).andReturn();
    assertEquals(200, res.statusCode());
    assertEquals("application/json", res.contentType());
    assertEquals("desc", res.jsonPath().get("job.description"));

  }

  @Test
  public void testGetJobsList() throws Exception {

    // find the added job into the user's jobs
    log.info("validate jobs.name of: " + jobId);
    List<String> names =
        given().cookies(cookies).when().get("/rest/jobs").jsonPath().getList("jobs.name");
    assertTrue(names.contains(jobId));

  }

  @Test
  public void testRun() throws Exception {
    // executes a job
    log.info("executes job: " + jobId);
    Response res = given().cookies(cookies).when().post("/rest/jobs/" + jobId + "/run");
    assertEquals(200, res.getStatusCode());
    String json = res.asString();
    JsonPath jp = new JsonPath(json);
    // the status can be STARTED or STARTING
    assertEquals("START", jp.get("execution.status").toString().substring(0, 5));

  }

  @Test
  public void testStop() throws Exception {
    // stops a job

    TimeUnit.SECONDS.sleep(2);

    log.info("stops job " + jobId);
    Response res = given().cookies(cookies).when().post("/rest/jobs/" + jobId + "/stop");
    String json = res.getBody().asString();

    assertThat(res.getStatusCode(), isOneOf(200, 204));

    log.info(res.getStatusCode());
    log.info(res.getStatusLine());
    log.info(json);
    // JsonPath jp = new JsonPath(json);
    // assertEquals("STOPPING", jp.get("execution.status").toString());

  }

  @Test
  public void testStopUnexisting() throws Exception { // stops a job
    log.info("stops job " + jobId);
    Response res = given().cookies(cookies).when().delete("/rest/jobs/" + jobId + "/run");
    String json = res.getBody().asString();
    assertEquals(404, res.getStatusCode());
    log.info(res.getStatusLine());
    log.info(json);
  }



  @Test
  public void testDeleteFails() throws Exception { // deletes a job with no credentials
    log.info("deletes with no credentials job " + jobId);
    delete("/rest/jobs/" + jobId).then().assertThat().statusCode(401);
    // delete unexisitng job log.info("deletes unexisting job ");
    given().cookies(cookies).when().delete("/rest/jobs/22222").then().assertThat().statusCode(404);

  }


  @Test
  public void testDelete() throws Exception {

    // delete a job log.info("deletes job " + jobId);
    given().cookies(cookies).when().delete("/rest/jobs/" + jobId).then().assertThat()
        .statusCode(204);
  }

  @Test
  public void verifyDelete() throws Exception { // check job does not exist anymore
    log.info("check job doesnt exist: " + jobId);
    given().cookies(cookies).when().get("/rest/jobs/" + jobId).then().assertThat().statusCode(204);
  }

}
