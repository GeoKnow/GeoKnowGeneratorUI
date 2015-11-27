package eu.geoknow.generator.rest;

import java.io.File;

import javax.servlet.ServletContext;
import javax.ws.rs.CookieParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.ServiceInternalServerError;
import eu.geoknow.generator.importer.HttpRdfInsert;
import eu.geoknow.generator.importer.RdfImportConfig;
import eu.geoknow.generator.rdf.RdfStoreManager;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserProfile;

@Path("/import-rdf")
public class ImportRdf {

  private static final Logger log = Logger.getLogger(ImportRdf.class);

  private static String filePath;

  public ImportRdf(@Context ServletContext context) {

    filePath =
        context.getRealPath(File.separator) + context.getInitParameter("file-upload")
            + File.separator;
    filePath = "file:///" + filePath.replace("\\", "/");
    filePath = filePath.replace(" ", "%20");
    log.info("Uploading directory: " + filePath);

  }

  @POST
  @Path("file")
  @Produces(MediaType.APPLICATION_JSON)
  public Response fromFile(@CookieParam(value = "user") Cookie userc,
      @CookieParam(value = "token") String token, RdfImportConfig importConfig) {

    FrameworkConfiguration config;
    FrameworkUserManager frameworkUserManager;
    RdfStoreManager rdfStoreManager;
    try {
      config = FrameworkConfiguration.getInstance();
      frameworkUserManager = config.getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      UserProfile user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
      rdfStoreManager = frameworkUserManager.getRdfStoreManager(userc.getName());
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    log.debug(importConfig.getTargetGraph());
    // validate required values
    if (importConfig.getFiles().isEmpty())
      return Response.status(Response.Status.BAD_REQUEST)
          .entity("List of files to be imported is required").build();

    int triples = 0;

    for (String file : importConfig.getFiles()) {
      log.info("importing " + filePath + file);

      HttpRdfInsert insert = new HttpRdfInsert(rdfStoreManager);
      try {
        Model model = ModelFactory.createDefaultModel();
        model.read(filePath + file);
        triples +=
            insert.httpInsert(importConfig.getTargetGraph(), model, config.getResourceNamespace());
      } catch (Exception e) {
        log.error(e);
        e.printStackTrace();
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage())
            .build();
      }
    }

    importConfig.setTriples(triples);
    Gson gson = new Gson();
    String json = "{ \"import\" : " + gson.toJson(importConfig) + "}";
    return Response.status(Response.Status.OK).type(MediaType.APPLICATION_JSON).entity(json)
        .build();
  }

  @POST
  @Path("url")
  @Produces(MediaType.APPLICATION_JSON)
  public Response fromUrl(@CookieParam(value = "user") Cookie userc,
      @CookieParam(value = "token") String token, RdfImportConfig importConfig) {

    FrameworkConfiguration config;
    FrameworkUserManager frameworkUserManager;
    RdfStoreManager rdfStoreManager;
    try {
      config = FrameworkConfiguration.getInstance();
      frameworkUserManager = config.getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      UserProfile user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
      rdfStoreManager = frameworkUserManager.getRdfStoreManager(userc.getName());
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    if (importConfig.getSourceUrl().isEmpty())
      return Response.status(Response.Status.BAD_REQUEST).entity("Source URL is not provided")
          .build();

    int triples = 0;
    Model model = ModelFactory.createDefaultModel();
    model.read(importConfig.getSourceUrl());
    HttpRdfInsert insert = new HttpRdfInsert(rdfStoreManager);
    try {
      triples +=
          insert.httpInsert(importConfig.getTargetGraph(), model, config.getResourceNamespace());
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    importConfig.setTriples(triples);
    Gson gson = new Gson();
    String json = "{ \"import\" : " + gson.toJson(importConfig) + "}";

    return Response.status(Response.Status.OK).type(MediaType.APPLICATION_JSON).entity(json)
        .build();
  }

  @POST
  @Path("endpoint-query")
  @Produces(MediaType.APPLICATION_JSON)
  public Response fromEndpoint(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token, RdfImportConfig importConfig) {

    FrameworkConfiguration config;
    FrameworkUserManager frameworkUserManager;
    RdfStoreManager rdfStoreManager;
    try {
      config = FrameworkConfiguration.getInstance();
      frameworkUserManager = config.getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      UserProfile user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
      rdfStoreManager = frameworkUserManager.getRdfStoreManager(userc.getName());
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }


    if (importConfig.getSourceEndpoint().isEmpty())
      return Response.status(Response.Status.BAD_REQUEST).entity("Source endpoint is not provided")
          .build();
    if (importConfig.getSparqlQuery().isEmpty())
      return Response.status(Response.Status.BAD_REQUEST).entity("Sparql query is not provided")
          .build();

    int triples = 0;
    Query query = QueryFactory.create(importConfig.getSparqlQuery());
    QueryExecution qexec =
        QueryExecutionFactory.sparqlService(importConfig.getSourceEndpoint(), query);

    Model model = qexec.execConstruct();
    HttpRdfInsert insert = new HttpRdfInsert(rdfStoreManager);
    try {
      triples =
          insert.httpInsert(importConfig.getTargetGraph(), model, config.getResourceNamespace());
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
    qexec.close();
    importConfig.setTriples(triples);
    Gson gson = new Gson();
    String json = "{ \"import\" : " + gson.toJson(importConfig) + "}";

    return Response.status(Response.Status.OK).type(MediaType.APPLICATION_JSON).entity(json)
        .build();

  }

  @POST
  @Path("local-query")
  @Produces(MediaType.APPLICATION_JSON)
  public Response fromLocalQuery(@CookieParam(value = "user") Cookie userc, @CookieParam(
      value = "token") String token, RdfImportConfig importConfig) {

    FrameworkConfiguration config;
    FrameworkUserManager frameworkUserManager;
    RdfStoreManager rdfStoreManager;
    try {
      config = FrameworkConfiguration.getInstance();
      frameworkUserManager = config.getFrameworkUserManager();
      // authenticates the user, throw exception if fail
      UserProfile user = frameworkUserManager.validate(userc, token);
      if (user == null) {
        return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
      }
      rdfStoreManager = frameworkUserManager.getRdfStoreManager(userc.getName());
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    if (importConfig.getSourceGraph().isEmpty())
      return Response.status(Response.Status.BAD_REQUEST).entity("Source graph is not provided")
          .build();
    if (importConfig.getSparqlQuery().isEmpty())
      return Response.status(Response.Status.BAD_REQUEST).entity("Sparql query is not provided")
          .build();

    int triples = 0;
    HttpRdfInsert insert = new HttpRdfInsert(rdfStoreManager);
    try {
      log.debug(importConfig.getSparqlQuery());
      if (importConfig.getSparqlQuery().equals("ADD"))
        triples = insert.localAdd(importConfig.getSourceGraph(), importConfig.getTargetGraph());
      else if (importConfig.getSparqlQuery().equals("COPY"))
        triples = insert.localCopy(importConfig.getSourceGraph(), importConfig.getTargetGraph());
      else {
        triples =
            insert.localInsertQuery(importConfig.getSparqlQuery(), importConfig.getSourceGraph(),
                importConfig.getTargetGraph());
      }
    } catch (ServiceInternalServerError e) {
      return Response.status(Response.Status.EXPECTATION_FAILED).entity(e.getMessage()).build();
    } catch (Exception e) {
      log.error(e);
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    importConfig.setTriples(triples);
    Gson gson = new Gson();
    String json = "{ \"import\" : " + gson.toJson(importConfig) + "}";

    return Response.status(Response.Status.OK).type(MediaType.APPLICATION_JSON).entity(json)
        .build();

  }
}
