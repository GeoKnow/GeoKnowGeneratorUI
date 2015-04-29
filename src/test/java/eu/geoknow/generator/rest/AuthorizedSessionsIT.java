package eu.geoknow.generator.rest;

import static com.jayway.restassured.RestAssured.delete;
import static com.jayway.restassured.RestAssured.get;
import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static org.hamcrest.Matchers.containsString;

import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.response.ValidatableResponse;

public class AuthorizedSessionsIT {

  private static final Logger log = Logger.getLogger(AuthorizedSessionsIT.class);
  private Map<String, String> cookies;

  public AuthorizedSessionsIT() {
    RestAssured.baseURI = "http://localhost";
    RestAssured.port = 8080;
    // TODO: find a way to parametrise this basePath
    RestAssured.basePath = "/generator";
  }

  @Before
  public void login() {

    // TODO: create here a user TEST
    ValidatableResponse auth =
        given().param("mode", "login").param("username", "testing")
            .param("password", "integration-testing").when().post("/AuthenticationServlet").then();
    auth.assertThat().statusCode(200);
    cookies = new HashMap<String, String>(auth.extract().cookies());
    log.info("authenticated user ldiw (admin)" + cookies.get("token"));

  }

  @After
  public void logout() {
    given().param("mode", "logout").param("username", "ldiw").when().post("/AuthenticationServlet")
        .then().assertThat().statusCode(200);
  }

  @Test
  public void testAccessingUnexistingSession() throws Exception {
    log.info(given().when().get("rest/session/1223344").statusLine());
    given().when().get("rest/session/1223344").then().assertThat().statusCode(404);
  }

  @Test
  public void testCreateAndDeleteSession() throws Exception {

    // creates a auth session with registered user (cookies)
    String body =
        given().cookies(cookies).when().put("/rest/session/").then().assertThat().statusCode(201)
            .body("endpoint", containsString("rest/session")).extract().body().asString();

    // verify the session is available
    String session = from(body).get("endpoint");
    log.info(session);
    get(session).then().assertThat().statusCode(200);

    // try to delete session with no credentials
    delete(session).then().assertThat().statusCode(401);

    // try to delete with credentials
    given().when().cookies(cookies).delete(session).then().assertThat().statusCode(204);

    // test that deleted session is not found
    given().when().get(session).then().assertThat().statusCode(404);

  }
}
