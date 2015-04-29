package eu.geoknow.generator.rest;

import static com.jayway.restassured.RestAssured.get;
import static com.jayway.restassured.RestAssured.given;
import static org.junit.Assert.assertEquals;

import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;
import org.junit.BeforeClass;
import org.junit.Test;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.response.Response;
import com.jayway.restassured.response.ValidatableResponse;

/**
 * Integration test of the REST interface for Components Management
 * 
 * @author alejandragarciarojas
 *
 */
public class ComponentsIT {

  private static final Logger log = Logger.getLogger(ComponentsIT.class);

  private static Map<String, String> cookies;


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

  }


  @Test
  public void testGet() throws Exception {

    // check job description
    log.info("get all components");
    Response res = get("/rest/components").andReturn();
    assertEquals(200, res.statusCode());
    assertEquals("application/json", res.contentType());
    log.info(res.getBody().asString());
    // assertEquals("desc", res.jsonPath().);

  }
}
