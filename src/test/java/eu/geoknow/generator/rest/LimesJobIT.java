package eu.geoknow.generator.rest;

import static com.jayway.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.isOneOf;
import static org.junit.Assert.assertThat;

import java.net.URLEncoder;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.apache.log4j.Logger;
import org.junit.BeforeClass;
import org.junit.Test;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.response.Response;
import com.jayway.restassured.response.ValidatableResponse;

/**
 * Tests a limes Job. Limes Service has to be available
 * 
 * <pre>
 * {
 *     "name": "JOB_ID",
 *     "label": "limes job",
 *     "description": "desc",
 *     "steps": [
 *         {
 *             "service": "http://localhost:8080/limes-linking-service/",
 *             "contenttype": "application/json",
 *             "method": "POST",
 *             "body": LIMES_CONFIG,
 *             "numberOfOrder": 1
 *         }
 *     ]
 * }
 * </pre>
 * 
 * @author alejandragarciarojas
 *
 */
public class LimesJobIT {

  private static final Logger log = Logger.getLogger(LimesJobIT.class);

  private String limesConfig =
      "{\"uuid\":\"\",\"metric\":\"hausdorff(x.polygon, y.polygon)\",\"source\":{\"id\":\"linkedgeodata\",\"endpoint\":\"http://linkedgeodata.org/sparql\",\"graph\":null,\"var\":\"?x\",\"pagesize\":\"2000\",\"restriction\":\"?x a lgdo:RelayBox\",\"property\":[\"geom:geometry/geos:asWKT RENAME polygon\"],\"type\":null},\"target\":{\"id\":\"linkedgeodata\",\"endpoint\":\"http://linkedgeodata.org/sparql\",\"graph\":null,\"var\":\"?y\",\"pagesize\":\"2000\",\"restriction\":\"?y a lgdo:RelayBox\",\"property\":[\"geom:geometry/geos:asWKT RENAME polygon\"],\"type\":null},\"acceptance\":{\"threshold\":\"0.9\",\"relation\":\"lgdo:near\",\"file\":null},\"review\":{\"threshold\":\"0.5\",\"relation\":\"lgdo:near\",\"file\":null},\"execution\":\"Simple\",\"granularity\":null,\"output\":\"N3\",\"prefix\":[{\"label\":\"geom\",\"namespace\":\"http://geovocab.org/geometry#\"},{\"label\":\"geos\",\"namespace\":\"http://www.opengis.net/ont/geosparql#\"},{\"label\":\"lgdo\",\"namespace\":\"http://linkedgeodata.org/ontology/\"}]}";

  private static String jobId;
  private static Map<String, String> cookies;

  @BeforeClass
  public static void init() {
    RestAssured.baseURI = "http://localhost";
    RestAssured.port = 8080;
    // TODO: find a way to parametrise this basePath
    RestAssured.basePath = "/ldiw";


    ValidatableResponse auth =
        given().param("mode", "login").param("username", "testing")
            .param("password", "integration-testing").when().post("/AuthenticationServlet").then();

    log.info("Authenticates testing user");
    auth.assertThat().statusCode(200);

    cookies = new HashMap<String, String>(auth.extract().cookies());

    Calendar calendar = new GregorianCalendar();
    jobId = "LimesJob_" + calendar.getTimeInMillis();

  }

  @Test
  public void testCreateAndRegisterLimesJob() throws Exception {
    String jobService =
        " {\"name\": \"JOB_ID\",\"label\": \"limes job\",\"description\": \"desc\",\"steps\": "
            + " [{\"service\": \"http://localhost:8080/limes-linking-service/\",\"contenttype\": \"application/json\","
            + "\"method\": \"POST\",\"body\": \"LIMES_CONFIG\", \"numberOfOrder\": 1}]}";

    String job =
        jobService.replace("JOB_ID", jobId).replace("LIMES_CONFIG",
            URLEncoder.encode(limesConfig, "utf-8"));

    // creates a job
    log.info("creates job: " + jobId);
    given().cookies(cookies).contentType("application/json").body(job).when().put("/rest/jobs")
        .then().assertThat().statusCode(201).and().body("job.name", equalTo(jobId));

    // check job description
    log.info("get job: " + jobId);
    given().cookies(cookies).when().get("/rest/jobs/" + jobId).then()
        .body("job.description", equalTo("desc"));

    // executes a job
    log.info("executes job: " + jobId);
    given().cookies(cookies).when().post("/rest/jobs/" + jobId + "/run").then()
        .body("execution.status", equalTo("STARTED"));
  }

  @Test
  public void testStopAndDelete() throws Exception {

    log.info("stops job: " + jobId);

    TimeUnit.SECONDS.sleep(2);

    Response res = given().cookies(cookies).when().post("/rest/jobs/" + jobId + "/stop");
    String json = res.getBody().asString();

    assertThat(res.getStatusCode(), isOneOf(200, 204));

    log.info(res.getStatusCode());
    log.info(res.getStatusLine());
    log.info(json);
    // stops a job

    // given().cookies(cookies).when().post("/rest/jobs/" + jobId + "/stop").then()
    // .body("execution.status", equalTo("STOPPING"));

    // delete a job
    log.info("deletes job: " + jobId);
    given().cookies(cookies).when().delete("/rest/jobs/" + jobId).then().assertThat()
        .statusCode(204);

  }
}
