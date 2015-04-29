package eu.geoknow.generator.publish;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.UUID;

import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.log4j.Logger;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.rdf.model.StmtIterator;
import com.hp.hpl.jena.vocabulary.DCTerms;
import com.hp.hpl.jena.vocabulary.XSD;

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.SPARQLEndpointException;
import eu.geoknow.generator.rdf.SecureRdfStoreManagerImpl;
import eu.geoknow.generator.users.UserManager;
import eu.geoknow.generator.users.UserManager.GraphPermissions;
import eu.geoknow.generator.users.VirtuosoUserManager;
import eu.geoknow.generator.utils.Utils;

/**
 * Class which does the data handling for the REST API.
 * 
 * @author mvoigt
 *
 */
public class DataHandler {

  private static Logger logger = Logger.getLogger(DataHandler.class);
  private static final String jsonResponseFormat = "application/sparql-results+json";
  private PublishingConfiguration config;
  private String statefulUri;
  private LocalDateTime dateTime;
  private LocalDate date;
  private SecureRdfStoreManagerImpl frameworkRdfStoreManager;

  /**
   * Constructor to init a new data handler.
   * 
   * @param config the configuration to use for the publishing task
   * @throws InformationMissingException
   */
  public DataHandler(PublishingConfiguration config) throws InformationMissingException {
    if (config == null) {
      throw new InformationMissingException("No configuration provided.");
    }
    this.config = config;
    // create current data and date since both are requierd for metadata and
    // eventually for the
    // stateful graph
    this.date = LocalDate.now();
    this.dateTime = LocalDateTime.now();
    try {
      frameworkRdfStoreManager = FrameworkConfiguration.getInstance().getAdminRdfStoreManager();
    } catch (IOException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

  }

  /**
   * Method that controls the publishing pipeline for the given configuration.
   * 
   * @throws IOException
   * @throws ClientProtocolException
   * @throws SPARQLEndpointException
   * @throws SQLException
   * @throws ClassNotFoundException
   * @throws InformationMissingException
   */
  public void publishData() throws ClientProtocolException, IOException, ClassNotFoundException,
      SQLException, SPARQLEndpointException, InformationMissingException {
    logger.info("starting publishing pipeline");
    // if the data should be backed up and the graph really exists, create a
    // stateful graph
    // reminder: if graphExists returns false it could also mean that it
    // exists but it is empty
    // --> thus a new version is not need
    if (config.backupExistingData() && graphExists(config.getTargetGraphUri())) {
      createStatefulGraphAndCopyData();
    }
    // it could be that a the target graph is also input if the information
    // should just be extended. In that case, do not clear the target graph
    if (!config.getInputGraphs().containsKey(config.getTargetGraphUri())) {
      // now, clear the target graph for the new data
      clearGraph(config.getTargetGraphUri());
    }
    // go through all input graphs and copy the data
    for (String uri : config.getInputGraphs().keySet()) {
      // do not try to copy target graph to target graph
      if (!config.getTargetGraphUri().equals(uri)) {
        copyGraph(uri, config.getTargetGraphUri());
      }
    }
    // add meta data to target graph
    addMetadataToTargetGraph();
    // delete input graphs, if needed
    for (String uri : config.getInputGraphs().keySet()) {
      if (config.getInputGraphs().get(uri) && !config.getTargetGraphUri().equals(uri)) {
        dropGraph(uri);
      }
    }
  }

  /**
   * Checks in the triple store if a graph exists. ATTENTION: If the graph exists but not triples
   * are in, the query returns false!
   * 
   * @param graphUri graph URI to check
   * @return true if it exists, false otherwise
   * @throws ClientProtocolException
   * @throws IOException
   */
  private boolean graphExists(String graphUri) throws ClientProtocolException, IOException {
    // ASK doesnt really work
    // ASK { GRAPH <http://test.de/graph3> { $s $p $o . } }
    String query = "ASK { GRAPH <" + graphUri + "> { ?s ?p ?o . } }";
    String response = "false";
    try {
      response = frameworkRdfStoreManager.execute(query, jsonResponseFormat);
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(response);
    // if exists, delete
    return rootNode.path("boolean").booleanValue();
  }

  /**
   * Method thats creates a new stateful graph based on the target graph by adding the date as URL
   * part. Then it copies the data and adds some metadata.
   * 
   * @throws ClientProtocolException
   * @throws IOException
   * @throws ClassNotFoundException
   * @throws SQLException
   * @throws SPARQLEndpointException
   * @throws InformationMissingException
   */
  private void createStatefulGraphAndCopyData() throws ClientProtocolException, IOException,
      ClassNotFoundException, SQLException, SPARQLEndpointException, InformationMissingException {
    // try to create a stateful graph with the current data. if it already
    // exists, use the
    // datetime
    String stateful = config.getTargetGraphUri();
    // add last slash if not existing
    if (!stateful.endsWith("/")) {
      stateful += "/";
    }
    stateful += this.date.toString();
    if (graphExists(stateful)) {
      stateful = config.getTargetGraphUri();
      if (!stateful.endsWith("/")) {
        stateful += "/";
      }
      stateful += this.dateTime.toString();
    }
    // create the graph
    createGraph(stateful);
    // copy data
    copyGraph(config.getTargetGraphUri(), stateful);
    logger.info("existing data is backed up to new stateful graph: <" + stateful + ">");
    this.statefulUri = stateful;
    // add meta data
    // stateful graph isReplacedBy target graph
    String query =
        "INSERT DATA { GRAPH <" + stateful + "> { " + "<" + stateful + "> <"
            + DCTerms.isReplacedBy.getURI() + "> <" + config.getTargetGraphUri() + "> .} }";
    try {
      frameworkRdfStoreManager.execute(query, jsonResponseFormat);
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
  }

  /**
   * Copies the graph data from one graph to another graph.
   * 
   * @param inputGraphUri input graph
   * @param targetGraphUri target graph
   * @throws ClientProtocolException
   * @throws IOException
   * @throws SPARQLEndpointException
   */
  private void copyGraph(String inputGraphUri, String targetGraphUri)
      throws ClientProtocolException, IOException, SPARQLEndpointException {
    // ADD <http://test.de/graph> TO <http://test.de/graph2>
    // String query = "ADD <" + inputGraphUri + "> TO <" + targetGraphUri +
    // ">";
    // INSERT { GRAPH <http://dds.ontos.com/resource/wirrwarr> {?s ?p ?o} }
    // where { graph <http://dds.ontos.com/resource/accountsGraph> {?s ?p
    // ?o}}

    String query =
        "INSERT { GRAPH <" + targetGraphUri + "> { ?s ?p ?o }} WHERE { GRAPH <" + inputGraphUri
            + "> { ?s ?p ?o }}";

    String response = "";
    try {
      response = frameworkRdfStoreManager.execute(query, jsonResponseFormat);
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    // check if it worked
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(response);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    if (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();
      if (bindingNode.get("callret-0").path("value").textValue().contains("done")) {
        logger.info("graph data from <" + inputGraphUri + "> to <" + targetGraphUri + "> copied.");
      } else {
        throw new SPARQLEndpointException("Copy the graph <" + inputGraphUri + "> to <"
            + targetGraphUri + "> fails.");
      }


    }

  }

  /**
   * Method that creates a new graph via SPARQL endpoint and also gives the user write permissions.
   * 
   * @param uri URI of the graph to create
   * @throws IOException
   * @throws SQLException
   * @throws ClassNotFoundException
   * @throws SPARQLEndpointException
   * @throws InformationMissingException
   */
  private void createGraph(String uri) throws IOException, ClassNotFoundException, SQLException,
      SPARQLEndpointException, InformationMissingException {
    // before the graph could be created, the user needs the rights, 3 means
    // read/write, and the
    // Virtuoso bug need to be resolved
    UserManager rdfStoreUserManager = FrameworkConfiguration.getInstance().getRdfStoreUserManager();
    /*
     * String rdfStoreUser = FrameworkConfiguration.getInstance().getFrameworkUserManager()
     * .getRdfStoreUser(this.config.getUser()).getFirst();
     */
    try {
      // rdfStoreUserManager.setRdfGraphPermissions(rdfStoreUser, uri,
      // GraphPermissions.WRITE);
      // name of workbench user should be the same as the rdfstoreuser
      rdfStoreUserManager
          .setRdfGraphPermissions(this.config.getUser(), uri, GraphPermissions.WRITE);

    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    // to avoid error, in virtuoso - more information in VirtuosoUserManager
    // class
    // ((VirtuosoUserManager)rdfStoreUserManager).grantLOLook(rdfStoreUser);
    ((VirtuosoUserManager) rdfStoreUserManager).grantLOLook(this.config.getUser());

    // CREATE GRAPH <http://test.de/graph>

    String query = "CREATE GRAPH <" + uri + ">";
    String response = executeSparqlQuery(query);
    // check if it worked, 1st if there is no error message that it
    // already exists
    if (response.contains("has been explicitly created before")) {
      return;
    }
    // it it wasn't created before, check response JSON
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(response);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    if (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();

      // VIRTUOSO
      if (bindingNode.get("callret-0").path("value").textValue().contains("done")) {
        logger.info("graph <" + uri + "> created");
      } else {
        throw new SPARQLEndpointException("Creating the graph <" + uri + "> fails.");
      }


    }

  }

  /**
   * Method to remove the data within a named graph.
   * 
   * @param graphUri
   * @throws SPARQLEndpointException
   * @throws IOException
   * @throws JsonProcessingException
   */
  private void clearGraph(String graphUri) throws SPARQLEndpointException, JsonProcessingException,
      IOException {

    String query = "DELETE WHERE { GRAPH <" + graphUri + "> { ?s ?p ?o } }";

    String response = "";
    try {
      response = frameworkRdfStoreManager.execute(query, jsonResponseFormat);
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

    // check if it worked
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(response);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    if (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();
      // VIRTUOSO
      if (bindingNode.get("callret-0").path("value").textValue().contains("done")
          || bindingNode.get("callret-0").path("value").textValue().contains("nothing")) {
        logger.info("graph <" + graphUri + "> cleared.");
      } else {
        throw new SPARQLEndpointException("Clearing the graph <" + graphUri + "> fails.");
      }


    }
  }

  /**
   * Method to delete a graph from the triple store.
   * 
   * @param graphUri
   * @throws ClientProtocolException
   * @throws IOException
   * @throws SPARQLEndpointException
   */
  private void dropGraph(String graphUri) throws ClientProtocolException, IOException,
      SPARQLEndpointException {
    // DROP GRAPH <http://test.de/graph>
    // String query = "DROP GRAPH <" + graphUri + ">";
    // String response = executeSparqlQuery(query);
    String response = "";
    try {
      response = frameworkRdfStoreManager.dropGraph(graphUri);
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    // check if it worked
    ObjectMapper mapper = new ObjectMapper();
    JsonNode rootNode = mapper.readTree(response);
    Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    if (bindingsIter.hasNext()) {
      JsonNode bindingNode = bindingsIter.next();
      if (bindingNode.get("callret-0").path("value").textValue().contains("done")) {
        logger.info("graph <" + graphUri + "> deleted.");
      } else {
        throw new SPARQLEndpointException("Deleting the graph <" + graphUri + "> fails.");
      }

    }
  }

  /**
   * Method that adds the metadata send by the request. Additionally, it adds the datetime of the
   * graph creation s well as a link to the former version if available.
   * 
   * @throws ClientProtocolException
   * @throws IOException
   */
  private void addMetadataToTargetGraph() throws ClientProtocolException, IOException {
    // create INSERT statement based on the graph
    String query;
    // create INSERT stmt only if statements in he model exist
    if (this.config.getMetaData().size() > 0) {
      query = modelToInsertStatement(this.config.getMetaData(), this.config.getTargetGraphUri());
      logger.info(query);
      try {
        frameworkRdfStoreManager.execute(query, jsonResponseFormat);
      } catch (Exception e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      }
    }

    // since the graph could have multiple source and versioning, we need to
    // remove old versioning information
    query =
        "DELETE WHERE { GRAPH <" + config.getTargetGraphUri() + "> { " + "<"
            + config.getTargetGraphUri() + "> <" + DCTerms.replaces.getURI() + "> ?o . " + "} }";
    logger.info(query);
    try {
      frameworkRdfStoreManager.execute(query, jsonResponseFormat);
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

    // add meta data with date time of creation and a reference to the
    // former graph, if it
    // exists
    // stateful graph isReplacedBy target graph
    query =
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>" + "\n" + "INSERT DATA { GRAPH <"
            + config.getTargetGraphUri() + "> { ";
    if (!Utils.isNullOrEmpty(this.statefulUri)) {
      query +=
          "<" + config.getTargetGraphUri() + "> <" + DCTerms.replaces.getURI() + "> <"
              + this.statefulUri + "> . ";
    }

    query +=
        "<" + config.getTargetGraphUri() + "> <" + DCTerms.created.getURI() + "> \""
            + this.dateTime.toString() + "\"^^<" + XSD.dateTime.getURI() + "> .} }";
    try {
      frameworkRdfStoreManager.execute(query, jsonResponseFormat);
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

  }

  /**
   * Method to call the SPARQL endpoint and to send the given query as HTTP POST. It returns the
   * responsebody as string
   * 
   * @param query
   * @return
   * @throws ClientProtocolException
   * @throws IOException
   */
  private String executeSparqlQuery(String query) throws ClientProtocolException, IOException {
    HttpPost request = new HttpPost(config.getEndpointUri());
    // add query params
    // TODO double check if it the same for OntoQuad!
    ArrayList<NameValuePair> postParameters = new ArrayList<NameValuePair>();
    postParameters.add(new BasicNameValuePair("query", query));
    postParameters.add(new BasicNameValuePair("format", "application/sparql-results+json"));
    // use UTF8!
    request.setEntity(new UrlEncodedFormEntity(postParameters, "UTF-8"));
    // create HTTP client
    CloseableHttpClient httpClient = HttpClients.createDefault();
    // call
    final CloseableHttpResponse response = httpClient.execute(request);
    // TODO check status code and return exception on error
    logger.info("Response code of the query against SPARQl store: "
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

  /**
   * Method that creates an INSERT statement based on a given Jena model. It also renames the blank
   * nodes.
   * 
   * @param model model to convert
   * @param graph the URI of the named graph where to insert the data
   * @return SPARQL INSERT statement as String
   */
  private String modelToInsertStatement(Model model, String graph) {
    // blankndes need an URI, thus define one
    String uriBase = graph;
    if (!uriBase.endsWith("/")) {
      uriBase += "/";
    }
    uriBase += "bnode/";
    // create initial INERT query part
    StringBuilder insert = new StringBuilder();
    insert.append("INSERT DATA { GRAPH <" + graph + "> { ");
    // go through statements
    StmtIterator stmts = model.listStatements();
    // store created blanknodes for reuse
    HashMap<String, String> blankNodes = new HashMap<String, String>();
    while (stmts.hasNext()) {
      Statement stmt = stmts.next();
      String subject = null;
      String object = null;
      // find bnodes to skolemise them
      // first, the subject
      if (stmt.getSubject().isAnon()) {
        String bnLabel = stmt.getSubject().asNode().getBlankNodeLabel();
        if (blankNodes.containsKey(bnLabel)) {
          subject = blankNodes.get(bnLabel);
        } else {
          subject = uriBase + UUID.randomUUID();
          blankNodes.put(bnLabel, subject);
        }
      } else {
        subject = stmt.getSubject().getURI();
      }
      // check object now and create INSERT line directly since it depends
      // on the type
      String line;
      if (stmt.getObject().isAnon()) {
        String bnLabel = stmt.getObject().asNode().getBlankNodeLabel();
        if (blankNodes.containsKey(bnLabel)) {
          object = blankNodes.get(bnLabel);
        } else {
          object = uriBase + UUID.randomUUID();
          blankNodes.put(bnLabel, object);
        }
        line = "<" + subject + "> <" + stmt.getPredicate().getURI() + "> <" + object + "> . ";
      } else if (stmt.getObject().isURIResource()) {
        object = stmt.getObject().asResource().getURI();
        line = "<" + subject + "> <" + stmt.getPredicate().getURI() + "> <" + object + "> . ";
      } else {
        // no blank node and no URI Resource - it is a literal
        object = stmt.getObject().asLiteral().toString();
        line = "<" + subject + "> <" + stmt.getPredicate().getURI() + "> \"" + object + "\" . ";
      }
      // add line
      insert.append(line);
    }

    // add closing brackets and return
    insert.append(" } }");
    return insert.toString();
  }

}
