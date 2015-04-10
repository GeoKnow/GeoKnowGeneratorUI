/**
 * 
 */
package eu.geoknow.generator.rest;

import static com.jayway.restassured.RestAssured.delete;
import static com.jayway.restassured.RestAssured.expect;
import static com.jayway.restassured.RestAssured.given;
import static org.hamcrest.Matchers.hasItem;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;
import org.junit.Test;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.response.Response;
import com.jayway.restassured.response.ValidatableResponse;


/**
 * Simple unit test to check the functionality of creating and deleting mappings
 * 
 * @author mvoigt
 *
 */
public class DataMappingApiIT {

  // TODO: this mapping may not work
  private String testMapping =
      "{\"mapping\": {\"ontology\":{\"id\": 4, \"uri\": \"http://lindas.info/def/top/\", \"version\": 0 }, \"classUri\": \"http://lindas.info/def/top/Canton\", \"id_pattern\": \"http://lindas-data.ch/id/Canton/\", \"uniqueIdColumn\": 1, \"properties\":[{\"langTag\": \"en\", type: \"DATA_PROPERTY\", \"uri\": \"http://xmlns.com/foaf/0.1/name\"}, {\"relatedClass\": \"http://lindas.info/def/top/Commune\", \"relatedPropertyUri\": \"http://purl.org/dc/elements/1.1/title\", \"type\": \"OBJECT_PROPERTY\", \"uri\": \"http://lindas.info/def/top/hasPart\"}]}}";

  private static final Logger log = Logger.getLogger(DataMappingApiIT.class);

  public DataMappingApiIT() {
    RestAssured.baseURI = "http://localhost";
    RestAssured.port = 8080;
    RestAssured.basePath = "/lindas";
  }

  @Test
  public void testGetJobsByAnnonymous() {
    expect().statusCode(401).when().get("/rest/mappings");

  }

  @Test
  public void dataMappingCRUDTest() throws UnsupportedEncodingException {
    Calendar calendar = new GregorianCalendar();
    // authenticate
    // TODO change credentials to the user defied in framework-configuration.ttl
    ValidatableResponse auth =
        given().param("mode", "login").param("username", "testing")
            .param("password", "integration-testing").when().post("/AuthenticationServlet").then();
    auth.assertThat().statusCode(200);

    // get cookie
    Map<String, String> cookies = new HashMap<String, String>(auth.extract().cookies());

    // create a mapping
    Response r =
        given().cookies(cookies).contentType("application/x-www-form-urlencoded")
            .body("mapping=" + URLEncoder.encode(testMapping, "utf-8")).when()
            .post("/rest/mappings").then().assertThat().statusCode(201).extract().response();
    // .and().body("mapping", equalTo("0"))
    String rString = r.body().asString();
    log.info(rString);
    JsonObject o = new JsonParser().parse(rString).getAsJsonObject();
    String mapping = String.valueOf(o.get("mapping").getAsInt());
    log.info(mapping);

    // get the user's mappings
    given().cookies(cookies).when().get("/rest/mappings").then().body("id", hasItem(mapping));

    // delete a mapping without credentials
    delete("/rest/mappings/1").then().assertThat().statusCode(401);

    // delete unexisting mapping
    given().cookies(cookies).when().delete("/rest/mappings/XYZ").then().assertThat()
        .statusCode(404);

    // delete mapping
    given().cookies(cookies).when().delete("/rest/mappings/" + mapping).then().assertThat()
        .statusCode(204);

  }

}
