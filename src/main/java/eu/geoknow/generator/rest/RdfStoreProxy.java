package eu.geoknow.generator.rest;

import javax.servlet.ServletContext;
import javax.ws.rs.CookieParam;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.rdf.RdfStoreManager;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserProfile;


/**
 * This servlet redirects SPARQL query to RDF store without any changes and returns original SPARQL
 * result in response. It can communicate both with public and secure SPARQL endpoints (user name
 * required).
 */
@Path("/RdfStoreProxy")
public class RdfStoreProxy {
  private static final Logger log = Logger.getLogger(RdfStoreProxy.class);

  /**
   * Send SPARQL request to RDF store and return original result.
   * 
   * @param context servlet context
   * @param token user token specified in cookies
   * @param username user name for secure SPARQL endpoint
   * @param query SPARQL query
   * @param mode if this parameter is set to "settings" SPARQL query will be executed with framework
   *        admin credentials
   * @param responseFormat SPARQL response format
   * @return
   */
  @POST
  @Produces(MediaType.APPLICATION_JSON)
  public Response executeQuery(@Context ServletContext context, @CookieParam("token") String token,
      @FormParam("username") String username, @FormParam("query") String query,
      @FormParam("mode") String mode, @FormParam("format") String responseFormat) {
    FrameworkConfiguration frameworkConfiguration;
    try {
      frameworkConfiguration = FrameworkConfiguration.getInstance();
      FrameworkUserManager frameworkUserManager = frameworkConfiguration.getFrameworkUserManager();
      RdfStoreManager frameworkRdfStoreManager = frameworkConfiguration.getAdminRdfStoreManager();

      log.debug("mode: " + mode);
      log.debug("username: " + username);

      RdfStoreManager rdfStoreManager;
      if ("settings".equals(mode)) {
        // read user settings graph - use framework admin user for that
        // purpose
        // here we need to check if system is set up, if not we cannot
        // query settings - framework admin user and settings graph
        // don't exist
        if (!frameworkConfiguration.isSetUp()) {
          log.info("System is not set up");
          // if Workbench is not set up return empty SPARQL result
          // like if no settings were found
          // in this case we don't get any parsing or http fail errors
          // in frontend
          // maybe it is better to return error response, but in this
          // case we have to change some frontend code to distinguish
          // between real SPARQL errors and this special case
          String emptySPARQLResponse =
              "{ \"head\": { \"link\": [], \"vars\": [\"s\", \"p\", \"o\"] }, \"results\": { \"distinct\": false, \"ordered\": false, \"bindings\": [] }}";
          return Response.status(Response.Status.OK).entity(emptySPARQLResponse).build();
        } else {
          log.info("Use admin rdf store manager");
          rdfStoreManager = frameworkRdfStoreManager;
        }
      } else if (username != null && !username.isEmpty()) { // execute
                                                            // query using
                                                            // given user
                                                            // credentials
        boolean valid = frameworkUserManager.checkToken(username, token);
        if (!valid)
          return Response.status(Response.Status.FORBIDDEN).entity("User token is invalid").build();
        log.info("Use user rdf manager");
        rdfStoreManager = frameworkUserManager.getRdfStoreManager(username);
      } else { // no username provided => use public endpoint
        log.info("Use public rdf manager");
        rdfStoreManager = frameworkConfiguration.getPublicRdfStoreManager();
      }

      String result = rdfStoreManager.execute(query, responseFormat);
      return Response.status(Response.Status.OK).entity(result).build();
    } catch (Exception e) {
      log.error("Failed to execute SPARQL query", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }

  @POST
  @Path("/rewriteGraph")
  @Produces(MediaType.APPLICATION_JSON)
  public Response rewriteGraph(@Context ServletContext context, @CookieParam("token") String token,
      @CookieParam(value = "user") Cookie userc, @FormParam("graph") String graph,
      @FormParam("data") String data, @FormParam("prefixes") String prefixes,
      @FormParam("mode") String mode, @FormParam("format") String responseFormat) {
    try {
      FrameworkConfiguration frameworkConfiguration = FrameworkConfiguration.getInstance();
      FrameworkUserManager frameworkUserManager = frameworkConfiguration.getFrameworkUserManager();
      RdfStoreManager frameworkRdfStoreManager = frameworkConfiguration.getAdminRdfStoreManager();

      RdfStoreManager rdfStoreManager;
      UserProfile user =
          FrameworkConfiguration.getInstance().getFrameworkUserManager().validate(userc, token);
      if ("settings".equals(mode)) { // rewrite user settings graph - use
                                     // framework admin user for that
                                     // purpose
        // here we need to check if system is set up, if not we cannot
        // rewrite settings - framework admin user and settings graph
        // don't exist

        if (!frameworkConfiguration.isSetUp()) {
          log.error("System is not set up");
          return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
              .entity("Failed to rewrite graph " + graph + ": system is not set up").build();
        } else {
          log.info("Use admin rdf store manager");
          rdfStoreManager = frameworkRdfStoreManager;
        }
      } else if (user != null) { // execute query using given user
                                 // credentials
        rdfStoreManager = frameworkUserManager.getRdfStoreManager(user.getUsername());
      } else { // no username provided => use public endpoint
        log.info("Use public rdf manager");
        rdfStoreManager = frameworkConfiguration.getPublicRdfStoreManager();
      }

      // OntoQuad doesn't support DROP and CREATE operations, so we need
      // to execute it via RdfStoreManager (cannot send everything in one
      // query)
      // todo optimisation for Virtuoso is possible: send DROP, CREATE and
      // INSERT DATA in one query
      rdfStoreManager.dropGraph(graph);
      rdfStoreManager.createGraph(graph);
      String query = "";
      query = (prefixes == null ? "" : prefixes) + " INSERT INTO <" + graph + "> { " + data + " } ";

      String result = rdfStoreManager.execute(query, responseFormat);
      return Response.status(Response.Status.OK).entity(result).build();
    } catch (Exception e) {
      log.error("Failed to execute SPARQL query", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
  }
}
