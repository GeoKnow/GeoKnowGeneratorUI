package eu.geoknow.generator.rest;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.CookieParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;

import com.google.gson.Gson;

import eu.geoknow.generator.common.Namespace;
import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserProfile;

@Path("/namespaces")
public class Namespaces {

  private static final Logger log = Logger.getLogger(Components.class);

  private static Map<String, String> prefixToNamespace;
  static {
    prefixToNamespace = new HashMap<String, String>();
    prefixToNamespace.put("acl", "http://www.w3.org/ns/auth/acl#");
    prefixToNamespace.put("cco", "http://purl.org/acco/ns#");
    prefixToNamespace.put("dbo", "http://dbpedia.org/ontology/");
    prefixToNamespace.put("dbp", "http://dbpedia.org/property/");
    prefixToNamespace.put("dbr", "http://dbpedia.org/resource/");
    prefixToNamespace.put("dcterms", "http://purl.org/dc/terms/");
    prefixToNamespace.put("dc", "http://purl.org/dc/elements/1.1/");
    prefixToNamespace.put("foaf", "http://xmlns.com/foaf/0.1/");
    prefixToNamespace.put("geo", "http://www.w3.org/2003/01/geo/wgs84_pos#");
    prefixToNamespace.put("geoknow", "http://geoknow.eu/geodata#");
    prefixToNamespace.put("geom", "http://geovocab.org/geometry#");
    prefixToNamespace.put("geos", "http://www.opengis.net/ont/geosparql#");
    prefixToNamespace.put("ontos", "http://ldiw.ontos.com/ontology/");
    prefixToNamespace.put("gz", "http://data.admin.ch/vocab/");
    prefixToNamespace.put("gzp", "http://data.admin.ch/bfs/class/1.0");
    prefixToNamespace.put("ld", "http://ld.geoknow.eu/flights/ontology/");
    prefixToNamespace.put("lds", "http://stack.linkeddata.org/ldis-schema/");
    prefixToNamespace.put("lexvo", "http://lexvo.org/ontology#");
    prefixToNamespace.put("lgdo", "http://linkedgeodata.org/ontology/");
    prefixToNamespace.put("ch", "http://opendata.ch/ontology#");
    prefixToNamespace.put("owl", "http://www.w3.org/2002/07/owl#");
    prefixToNamespace.put("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    prefixToNamespace.put("rdfs", "http://www.w3.org/2000/01/rdf-schema#");
    prefixToNamespace.put("sd", "http://www.w3.org/ns/sparql-service-description#");
    prefixToNamespace.put("skos", "http://www.w3.org/2004/02/skos/core#");
    prefixToNamespace.put("void", "http://rdfs.org/ns/void#");
    prefixToNamespace.put("wktrm", "http://wiktionary.dbpedia.org/terms/");
    prefixToNamespace
        .put("drugbank", "http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/");
    prefixToNamespace.put("sider", "http://www4.wiwiss.fu-berlin.de/sider/resource/sider/");
    prefixToNamespace.put("diseasome",
        "http://www4.wiwiss.fu-berlin.de/diseasome/resource/diseasome/");
    prefixToNamespace.put("gv", "http://geoknow.eu/coevolution/graphversioning/");
    prefixToNamespace.put("gvg", "http://geoknow.eu/coevolution/graphversioning/graphset");
    prefixToNamespace.put("cec", "http://geoknow.eu/coevolution/change/");
  }

  /**
   * Get the data of a single service
   * 
   * @return JSON
   */
  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response getAll(@CookieParam(value = "user") Cookie userc,
      @CookieParam(value = "token") String token) {

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

    Gson gson = new Gson();
    String json = "{ \"service\" : " + gson.toJson(prefixToNamespace) + "}";
    return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
        .build();
  }

  @POST
  @Produces(MediaType.APPLICATION_JSON)
  public Response getAll(@CookieParam(value = "user") Cookie userc,
      @CookieParam(value = "token") String token, Namespace ns) {

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

    if (!prefixToNamespace.containsKey(ns.getPrefix()))
      prefixToNamespace.put(ns.getPrefix(), ns.getUri());
    else {

      return Response.status(Response.Status.CONFLICT)
          .entity("The prefix already exists for " + prefixToNamespace.get(ns.getPrefix()))
          .type(MediaType.APPLICATION_JSON).build();
    }

    return Response.status(Response.Status.CREATED).type(MediaType.APPLICATION_JSON).build();
  }

}
