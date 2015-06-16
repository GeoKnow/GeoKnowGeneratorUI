package eu.geoknow.generator.rest;

import static com.jayway.restassured.RestAssured.given;
import static org.hamcrest.Matchers.isOneOf;
import static org.junit.Assert.assertThat;

import java.io.IOException;
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

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;

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

  // private String limesConfig =
  // "{\"uuid\":\"\",\"metric\":\"hausdorff(x.polygon, y.polygon)\",\"source\":{\"id\":\"linkedgeodata\",\"endpoint\":\"http://linkedgeodata.org/sparql\",\"graph\":null,\"var\":\"?x\",\"pagesize\":\"2000\",\"restriction\":\"?x a lgdo:RelayBox\",\"property\":[\"geom:geometry/geos:asWKT RENAME polygon\"],\"type\":null},\"target\":{\"id\":\"linkedgeodata\",\"endpoint\":\"http://linkedgeodata.org/sparql\",\"graph\":null,\"var\":\"?y\",\"pagesize\":\"2000\",\"restriction\":\"?y a lgdo:RelayBox\",\"property\":[\"geom:geometry/geos:asWKT RENAME polygon\"],\"type\":null},\"acceptance\":{\"threshold\":\"0.9\",\"relation\":\"lgdo:near\",\"file\":null},\"review\":{\"threshold\":\"0.5\",\"relation\":\"lgdo:near\",\"file\":null},\"execution\":\"Simple\",\"granularity\":null,\"output\":\"N3\",\"prefix\":[{\"label\":\"geom\",\"namespace\":\"http://geovocab.org/geometry#\"},{\"label\":\"geos\",\"namespace\":\"http://www.opengis.net/ont/geosparql#\"},{\"label\":\"lgdo\",\"namespace\":\"http://linkedgeodata.org/ontology/\"}]}";

  String limesConfig =
      "{\n \"execution\": \"Simple\",\n \"output\": \"TTL\",\n \"metric\": \"jaro(x.rdfs:label,y.name)\",\n \"saveendpoint\": \"_SESSION_\",\n \"reviewgraph\": \"_REVIEW_GRAPH_\",\n \"acceptgraph\": \"_ACCEPTED_GRAPH_\",\n \"uribase\": \"http://generator.geoknow.eu/resource/\",\n \"prefix\": [\n {\n \"label\": \"rdf\",\n \"namespace\": \"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"\n },\n {\n \"label\": \"rdfs\",\n \"namespace\": \"http://www.w3.org/2000/01/rdf-schema#\"\n },\n {\n \"label\": \"owl\",\n \"namespace\": \"http://www.w3.org/2002/07/owl#\"\n },\n {\n \"label\": \"dbpedia\",\n \"namespace\": \"http://dbpedia.org/ontology/\"\n }\n ],\n \"source\": {\n \"id\": \"dbpedia\",\n \"endpoint\": \"http://dbpedia.org/sparql\",\n \"var\": \"?x\",\n \"pagesize\": \"1000\",\n \"restriction\": \"?x rdf:type dbpedia:Actor\",\n \"property\": [\n \"rdfs:label AS nolang->lowercase\"\n ]\n },\n \"target\": {\n \"id\": \"dbpedia\",\n \"endpoint\": \"http://dbpedia.org/sparql\",\n \"var\": \"?y\",\n \"pagesize\": \"1000\",\n \"restriction\": \"?y rdf:type dbpedia:Actor\",\n \"property\": [\n \"rdfs:label AS nolang->lowercase RENAME name\"\n ]\n },\n \"acceptance\": {\n \"threshold\": \"0.9\",\n \"relation\": \"owl:sameAs\",\n \"file\": \"dbpedia_actors_duplicates.nt\"\n },\n \"review\": {\n \"threshold\": \"0.8\",\n \"relation\": \"owl:sameAs\",\n \"file\": \"dbpedia_actors_reviewme.nt\"\n }";

  private String configurationFileTest = "dbpedia-actors.xml";

  private static String jobId;
  private static Map<String, String> cookies;

  @BeforeClass
  public static void init() throws IOException, InformationMissingException {
    RestAssured.baseURI = FrameworkConfiguration.getInstance().getHomepage();
    log.info("testing server: " + RestAssured.baseURI);
    RestAssured.port = 8080;
    // TODO: find a way to parametrise this basePath
    RestAssured.basePath = "";


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

    // create an aithorised session
    String session =
        RestAssured.baseURI
            + ":"
            + +RestAssured.port
            + RestAssured.basePath
            + given().cookies(cookies).when().put("/rest/session/").jsonPath()
                .getString("endpoint");

    log.debug(session);

    String config =
        limesConfig.replace("_SESSION_", session).replace("_ACCEPTED_GRAPH_", "")
            .replace("_REVIEW_GRAPH_", "");

    String jobService =
        " {\"name\": \"JOB_ID\",\"label\": \"limes job\",\"description\": \"desc\",\"steps\": "
            + " [{\"service\": \"http://localhost:8080/limes-linking-service/\",\"contenttype\": \"application/json\","
            + "\"method\": \"POST\",\"body\": \"LIMES_CONFIG\", \"numberOfOrder\": 1}]}";


    String job =
        jobService.replace("JOB_ID", jobId).replace("LIMES_CONFIG",
            URLEncoder.encode(limesConfig, "utf-8"));

    // // creates a job
    // log.info("creates job: " + jobId);
    // given().cookies(cookies).contentType("application/json").body(job).when().put("/rest/jobs")
    // .then().assertThat().statusCode(201).and().body("job.name", equalTo(jobId));
    //
    // // check job description
    // log.info("get job: " + jobId);
    // given().cookies(cookies).when().get("/rest/jobs/" + jobId).then()
    // .body("job.description", equalTo("desc"));
    //
    // // executes a job
    // log.info("executes job: " + jobId);
    // given().cookies(cookies).when().post("/rest/jobs/" + jobId + "/run").then()
    // .body("execution.status", equalTo("STARTED"));
  }

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
