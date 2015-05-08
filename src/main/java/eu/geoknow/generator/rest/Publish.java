package eu.geoknow.generator.rest;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.SPARQLEndpointException;
import eu.geoknow.generator.publish.DataHandler;
import eu.geoknow.generator.publish.PublishingConfiguration;
import eu.geoknow.generator.users.UserManager;
import eu.geoknow.generator.users.UserManager.GraphPermissions;
import eu.geoknow.generator.users.VirtuosoUserManager;
import eu.geoknow.generator.utils.Utils;

/**
 * REST API that allows for publishing RDF data from one or more input graphs into one target graph.
 * 
 * @author mvoigt
 *
 */
@Path("/publish")
public class Publish {

  private static Logger logger = Logger.getLogger(Publish.class);

  /**
   * Method to publish RDF data with a given target graph
   * 
   * @param endpointUri URI of the SPARQL enpoint with the input graphs and the target graph
   * @param targetGraphUri URI of the target graph
   * @param inputArray JSON array with the input graphs (key: graph) and a flag (key: delete) if the
   *        graph should be dropped after publishing or not. <br>
   *        Example: [{"graph":"http://ex.com/ng1","delete": "true"},
   *        {"graph":"http://ex.com/ng2","delete": "false"}]
   * @param backupExistingData String with boolean values "true" or "false". If yes, the existing
   *        data in the tragetGraphUri will be versioned
   * @param meta URL-encoded String with RDF triples to add as meta data
   * @param userName user name of the graphs owner in the workbench
   * @return
   */
  @POST
  @Produces(MediaType.APPLICATION_JSON)
  public Response publish(@FormParam("endpointUri") String endpointUri,
      @FormParam("targetGraphUri") String targetGraphUri,
      @FormParam("inputGraphArray") String inputArray,
      @FormParam("backupExistingData") String backupExistingData,
      @FormParam("metaRdf") String meta, @FormParam("userName") String userName) {

    // create config
    PublishingConfiguration config;
    try {
      // parse JSON array, [{"graph":"http://ex.com/ng1","delete":
      // "true"},
      // {"graph":"http://ex.com/ng2","delete": "false"}]
      JsonArray entries = (JsonArray) new JsonParser().parse(inputArray);
      HashMap<String, Boolean> input = new HashMap<String, Boolean>();
      for (int i = 0; i < entries.size(); i++) {
        JsonObject elem = (JsonObject) entries.get(i);
        JsonElement graph = elem.get("graph");
        JsonElement delFlag = elem.get("delete");
        if (graph == null || delFlag == null) {
          throw new InformationMissingException("The input graph array contains erros.");
        }
        logger.info("JSON pair: " + graph.getAsString() + " - " + delFlag.getAsString());
        input.put(graph.getAsString(), Boolean.parseBoolean(delFlag.getAsString()));
      }
      // if no input is provided, throw exception
      if (input.isEmpty()) {
        throw new InformationMissingException("No input graphs provided.");
      }
      // check if meta data is provided. if so, create Jena model from
      // string
      Model metaData = ModelFactory.createDefaultModel();
      if (!Utils.isNullOrEmpty(meta)) {
        metaData.read(new ByteArrayInputStream(meta.getBytes()), null, "TURTLE");
      }
      // finally, create config object
      config =
          new PublishingConfiguration(endpointUri, input, targetGraphUri,
              Boolean.parseBoolean(backupExistingData), metaData, userName);

    } catch (InformationMissingException e) {
      logger.error(e);
      return Response.status(Response.Status.BAD_REQUEST)
          .entity("{\"status\" : \"" + e.getMessage() + "\"}").build();
    } catch (Exception e) {
      logger.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("{\"status\" : \"" + e.getMessage() + "\"}").build();
    }
    // if the config is initialized, call the publishing pipeline
    try {
      DataHandler dh = new DataHandler(config);
      dh.publishData();
    } catch (Exception e) {
      logger.error(e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("{\"status\" : \"" + e.getMessage() + "\"}").build();
    }

    String json =
        "{\"status\" : \"Data successfully published in target graph <"
            + config.getTargetGraphUri() + ">\"}";
    return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
        .build();
  }

  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/createTempGraph")
  public Response createTempGraph(@FormParam("endpointUri") String endpointUri,
      @FormParam("tempGraphUri") String tempGraphUri, @FormParam("userName") String userName) {
    String rdfStoreUser;

    UserManager rdfStoreUserManager;
    try {
      rdfStoreUserManager = FrameworkConfiguration.getInstance().getRdfStoreUserManager();
      rdfStoreUserManager.setRdfGraphPermissions(userName, tempGraphUri, GraphPermissions.WRITE);

      ((VirtuosoUserManager) rdfStoreUserManager).grantLOLook(userName);

    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

    // String query = "CREATE SILENT GRAPH <" + tempGraphUri + ">";
    try {
      String response =
          FrameworkConfiguration.getInstance().getSystemRdfStoreManager().createGraph(tempGraphUri);
      // check if it worked


      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(response);
      Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
      if (bindingsIter.hasNext()) {
        JsonNode bindingNode = bindingsIter.next();
        if (bindingNode.get("callret-0").path("value").textValue().contains("done")) {
          logger.info("temp graph <" + tempGraphUri + "> created.");
        } else {
          throw new SPARQLEndpointException("Creating the temp graph <" + tempGraphUri + "> fails.");
        }
      }

    } catch (Exception e) {
      Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }

    String json = "{\"status\" : \"Temporary graph successfully created.\"}";
    return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
        .build();
  }

  /**
   * A helper method to wait in the process chain until the D2RQ task is finished
   * 
   * TODO this functionality should be removed after an update of the D2RQ service
   * 
   * @param serviceUri the D2RQ service URI to call, which includes the task ID
   *        (/tasks/{id}/metadata/get)
   * @return
   */
  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/waitTillD2rqTaskIsDone")
  public Response waitTillD2rqTaskIsDone(@FormParam("serviceUri") String serviceUri) {
    // is the URI is missing, return an error
    if (Utils.isNullOrEmpty(serviceUri)) {
      String json = "{\"status\" : \"Service URI is missing.\"}";
      return Response.status(Response.Status.BAD_REQUEST).entity(json)
          .type(MediaType.APPLICATION_JSON).build();
    }
    // track the time
    long start = System.currentTimeMillis();

    /*
     * Task Metadata { "id" : 1234, "name" : "persons", "created" : "2013-06-12T13:49:02.656Z",
     * "compositeMapping" : 543, "dataset" : 324, "owner" : "test", "started" :
     * "2013-06-15T13:49:02.656Z", "done" : "2013-06-15T13:59:02.656Z", "status" : "DONE",
     * "description" : null, "rdfFilePath" : "c://d2rq/rdf/persons.rdf", "compositeMappingName" :
     * "persons", "httpEndpoint" : "http://sparql", "graph" : "http://persons/graph" }
     */

    // add empty query params
    ArrayList<NameValuePair> postParameters = new ArrayList<NameValuePair>();
    boolean isFinished = false;
    try {
      // call service again and again until the task is DONE
      while (!isFinished) {
        String jsonResponse = executeHttpPostQuery(serviceUri, postParameters);
        // check response
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(jsonResponse);
        JsonNode status = rootNode.get("status");
        if ("DONE".equals(status.textValue().toUpperCase())) {
          // leave while statement
          isFinished = true;
        } else {
          // wait a short while: 2s
          Thread.sleep(2000);
        }
      }
    } catch (Exception e) {
      // catch any error and return 500
      Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
    long end = System.currentTimeMillis();
    long duration = end - start;
    logger.info("D2RQ task is finished in at least " + duration + "ms.");
    // return after d2RQ task finished
    String json = "{\"status\" : \"D2RQ task successfully finished in about " + duration + "ms.\"}";
    return Response.status(Response.Status.OK).entity(json).type(MediaType.APPLICATION_JSON)
        .build();
  }

  /**
   * Method to call the SPARQL endpoint and to send the given query as HTTP POST. It returns the
   * response body as string.
   * 
   * This should be moved later to the new graph REST API
   * 
   * @param query the query to POST
   * @param endpointUri the URi to call
   * @return the response text
   * @throws ClientProtocolException
   * @throws IOException
   */
  private static String executeSparqlQuery(String query, String endpointUri)
      throws ClientProtocolException, IOException {
    // create query params
    // TODO double check if it the same for OntoQuad!
    ArrayList<NameValuePair> postParameters = new ArrayList<NameValuePair>();
    postParameters.add(new BasicNameValuePair("query", query));
    postParameters.add(new BasicNameValuePair("format", "application/sparql-results+json"));
    // call service
    return executeHttpPostQuery(endpointUri, postParameters);
  }

  /**
   * Method to call a service endpoint using a POST request. It returns the response body as string.
   * 
   * This should be moved later to the new graph REST API
   * 
   * @param endpointUri the URI to call
   * @param postParameters list of post parameters, could be empty but not null
   * @return the response text
   * @throws ClientProtocolException
   * @throws IOException
   */
  private static String executeHttpPostQuery(String endpointUri,
      ArrayList<NameValuePair> postParameters) throws ClientProtocolException, IOException {
    HttpPost request = new HttpPost(endpointUri);
    // use UTF8!
    request.setEntity(new UrlEncodedFormEntity(postParameters, "UTF-8"));
    // create HTTP client
    CloseableHttpClient httpClient = HttpClients.createDefault();
    // call
    final CloseableHttpResponse response = httpClient.execute(request);
    // TODO check status code and return exception on error
    logger.info("Response code of the query against the server: "
        + response.getStatusLine().getStatusCode());
    // read data and return the response string
    BufferedReader in =
        new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
    StringBuilder builder = new StringBuilder();
    for (String line = null; (line = in.readLine()) != null;) {
      builder.append(line).append("\n");
    }
    in.close();
    httpClient.close();
    return builder.toString();
  }

}
