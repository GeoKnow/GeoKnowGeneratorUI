package workflow;

import static com.jayway.restassured.RestAssured.expect;
import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static org.junit.Assert.assertNotSame;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.junit.Test;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.response.ValidatableResponse;

public class BatchJobsIT {

    private static final Logger log = Logger.getLogger(BatchJobsIT.class);

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

        ValidatableResponse auth = given().param("mode", "login").param("username", "admin").param(
                "password", "admin").when().post("/AuthenticationServlet").then();

        auth.assertThat().statusCode(200);

        Map<String, String> cookies = new HashMap<String, String>(auth.extract().cookies());

        // registers a job
        String json = given().param("username", "admin").param("service", "http://...").param(
                "method", "post").param("contenttype", "applciation/json").param("body",
                "{some:json}").cookies(cookies).when().put("/rest/jobs").asString();

        // TODO: there is an issue when executing this PUT because I get 500
        // error but in fact the PUT is well executed and at some point the
        // previews code is also doing a GET and this produces the error which
        // is in fact a Invalid User Credentials error
        log.info(json);

        // has one job registered
        json = given().param("username", "admin").cookies(cookies).when().get("/rest/jobs")
                .asString();

        log.info(json);
        List<String> jobs = from(json).get("jobs");

        assertNotSame(0, jobs.size());

        // TODO: executes job test

        // registers a job with dummy service
        // given().param("username", "admin").param("service",
        // "http://...").param("method", "post")
        // .param("contenttype", "applciation/json").param("body",
        // "{some:json}").cookies(
        // cookies).when().put("/rest/jobs").then().assertThat().statusCode(201);

        // log.info(job.extract().body().toString());

        // get the user's jobs
        //
        // log.info(given().param("username",
        // "admin").cookies(cookies).when().get("/rest/jobs")
        // .then().extract().body().asString());
        //
        // given().param("username",
        // "admin").cookies(cookies).when().get("/rest/jobs").then().body(
        // "jobs[0].name", equalTo(jobId));
    }
}
