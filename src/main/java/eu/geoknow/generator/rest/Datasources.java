package eu.geoknow.generator.rest;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.CookieParam;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.StmtIterator;
import com.hp.hpl.jena.vocabulary.RDF;
import com.hp.hpl.jena.vocabulary.RDFS;
import com.ontos.ldiw.vocabulary.LDIWO;

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.datasources.beans.DatabaseType;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserProfile;

@Path("/datasources")
public class Datasources {

  private static final Logger log = Logger.getLogger(Datasources.class);

  /**
   * Get the types of Databases
   * 
   * @return JSON
   */
  @GET
  @Path("database-types")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getService(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token) {

    FrameworkUserManager frameworkUserManager;
    UserProfile user;
    try {
      frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    try {

      List<DatabaseType> types = new ArrayList<DatabaseType>();
      Model model = LDIWO.getModel();
      StmtIterator uris = model.listStatements(null, RDF.type, LDIWO.DatabaseType);
      while (uris.hasNext()) {
        DatabaseType d = new DatabaseType();
        Resource s = uris.next().getSubject();
        d.setUri(s.getURI());
        d.setLabel(s.getProperty(RDFS.label).getLiteral().getString());
        types.add(d);
      }

      Gson gson = new Gson();
      String json = "{ \"databaseTypes\" : " + gson.toJson(types) + "}";
      return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
          .build();

    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

  }
}
