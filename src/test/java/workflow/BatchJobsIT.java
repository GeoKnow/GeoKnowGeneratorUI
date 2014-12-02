package workflow;

import static com.jayway.restassured.RestAssured.delete;
import static com.jayway.restassured.RestAssured.expect;
import static com.jayway.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;

import java.net.URLEncoder;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;
import org.junit.Test;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.response.ValidatableResponse;

public class BatchJobsIT {

    private static final Logger log = Logger.getLogger(BatchJobsIT.class);

    private String limesConfig = "{\"uuid\":\"\",\"metric\":\"hausdorff(x.polygon, y.polygon)\",\"source\":{\"id\":\"linkedgeodata\",\"endpoint\":\"http://linkedgeodata.org/sparql\",\"graph\":null,\"var\":\"?x\",\"pagesize\":\"2000\",\"restriction\":\"?x a lgdo:RelayBox\",\"property\":[\"geom:geometry/geos:asWKT RENAME polygon\"],\"type\":null},\"target\":{\"id\":\"linkedgeodata\",\"endpoint\":\"http://linkedgeodata.org/sparql\",\"graph\":null,\"var\":\"?y\",\"pagesize\":\"2000\",\"restriction\":\"?y a lgdo:RelayBox\",\"property\":[\"geom:geometry/geos:asWKT RENAME polygon\"],\"type\":null},\"acceptance\":{\"threshold\":\"0.9\",\"relation\":\"lgdo:near\",\"file\":null},\"review\":{\"threshold\":\"0.5\",\"relation\":\"lgdo:near\",\"file\":null},\"execution\":\"Simple\",\"granularity\":null,\"output\":\"N3\",\"prefix\":[{\"label\":\"geom\",\"namespace\":\"http://geovocab.org/geometry#\"},{\"label\":\"geos\",\"namespace\":\"http://www.opengis.net/ont/geosparql#\"},{\"label\":\"lgdo\",\"namespace\":\"http://linkedgeodata.org/ontology/\"}]}";

    public BatchJobsIT() {
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = 8080;
        RestAssured.basePath = "/generator";
    }

    @Test
    public void testGetJobsByAnnonymous() {
        expect().statusCode(401).when().get("/rest/jobs");

    }

    @Test
    public void testCreateAndRegister() throws Exception {

        Calendar calendar = new GregorianCalendar();

        ValidatableResponse auth = given().param("mode", "login").param("username", "test").param(
                "password", "test").when().post("/AuthenticationServlet").then();

        auth.assertThat().statusCode(200);

        Map<String, String> cookies = new HashMap<String, String>(auth.extract().cookies());

        String jobId = "TestJob_" + calendar.getTimeInMillis();

        String jobService = "{ \"name\": \"" + jobId + "\",\n"
                + " \"service\": \"http://localhost:8080/limes-service/\",\n"
                + " \"description\": \"a job from test\",\n"
                + " \"contenttype\": \"application/json\",\n" + " \"method\": \"post\",\n"
                + " \"body\": \"" + URLEncoder.encode(limesConfig, "utf-8") + "\" } ";

        log.info("job test: " + jobId);
        // creates a job
        given().cookies(cookies).contentType("application/json").body(jobService).when().put(
                "/rest/jobs").then().assertThat().statusCode(201).and().body("job.name",
                equalTo(jobId));

        // check job description
        given().cookies(cookies).when().get("/rest/jobs/" + jobId).then().body("job.description",
                equalTo("a job from test"));

        // get the user's jobs
        given().cookies(cookies).when().get("/rest/jobs").then().body("jobs.name", hasItem(jobId));

        // executes a job
        given().cookies(cookies).when().post("/rest/jobs/" + jobId + "/run").then().body(
                "execution.status", equalTo("STARTED"));

        // stops a job
        given().cookies(cookies).when().delete("/rest/jobs/" + jobId + "/run").then().body(
                "execution.status", not("STARTED"));

        // deletes a job with no credentials
        delete("/rest/jobs/" + jobId).then().assertThat().statusCode(401);

        // delete unexisitng job
        given().cookies(cookies).when().delete("/rest/jobs/22222").then().assertThat().statusCode(
                404);

        // delete a job
        given().cookies(cookies).when().delete("/rest/jobs/" + jobId).then().assertThat()
                .statusCode(204);

    }
}
