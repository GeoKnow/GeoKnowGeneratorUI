package eu.geoknow.generator.graphs;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Iterator;
import java.util.List;

import javax.ws.rs.NotFoundException;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hp.hpl.jena.sparql.vocabulary.FOAF;
import com.hp.hpl.jena.vocabulary.DCTerms;
import com.hp.hpl.jena.vocabulary.RDF;
import com.hp.hpl.jena.vocabulary.RDFS;
import com.ontos.ldiw.vocabulary.ACL;
import com.ontos.ldiw.vocabulary.LDIWO;
import com.ontos.ldiw.vocabulary.SD;
import com.ontos.ldiw.vocabulary.VOID;

import eu.geoknow.generator.common.MediaType;
import eu.geoknow.generator.common.Queries;
import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.exceptions.SPARQLEndpointException;
import eu.geoknow.generator.graphs.beans.AccessControl;
import eu.geoknow.generator.graphs.beans.Contribution;
import eu.geoknow.generator.graphs.beans.Graph;
import eu.geoknow.generator.graphs.beans.NamedGraph;
import eu.geoknow.generator.rdf.RdfStoreManagerImpl;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserManager;
import eu.geoknow.generator.users.UserManager.GraphPermissions;


/**
 * Manager for creating, retrieving and updating graphs. It is mainly used by @GraphsService, but
 * can also be used by all classes.
 * 
 * @author Jonas
 *
 */
public class GraphsManager {

  private static final Logger log = Logger.getLogger(GraphsManager.class);
  private static GraphsManager instance;
  private static FrameworkConfiguration frameworkConfig;
  private static UserManager storeAdmin;
  private static RdfStoreManagerImpl systemAdmin;
  private static FrameworkUserManager fuManager;
  private static String graphsGraph;


  public static synchronized GraphsManager getInstance() {

    if (instance == null)
      instance = new GraphsManager();
    return instance;

  }

  public GraphsManager() {
    try {
      frameworkConfig = FrameworkConfiguration.getInstance();
      // systemAdmin for graph creation (SPARQL-Level); storeAdmin for setting permissions (Store
      // System-Level)
      systemAdmin = frameworkConfig.getSystemRdfStoreManager();
      storeAdmin = frameworkConfig.getRdfStoreUserManager();
      // FrameworkUserManager has the power to manage User
      fuManager = frameworkConfig.getFrameworkUserManager();

      graphsGraph = FrameworkConfiguration.getInstance().getSettingsGraph();
    } catch (IOException e) {
      log.error(e);
      e.printStackTrace();
    } catch (InformationMissingException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
  }

  /**
   * will only update the metadata
   * 
   * @param newNamedGraph
   * @return
   * @throws SPARQLEndpointException
   */
  public NamedGraph addContribution(Contribution contribution) throws SPARQLEndpointException {

    int triples = Queries.countGraphTriples(contribution.getNamedGraph(), systemAdmin);

    log.debug(contribution.getDate());
    // "2005-07-14T03:18:56+0100"^^xsd:dateTime

    List<String> sources = contribution.getSource();

    // Check if the source is a URI
    String sourcesTriples = "";
    for (String source : sources) {
      try {
        new URL(source);
        source = "<" + source + ">";
      } catch (MalformedURLException e) {
        source = "\"" + source + "\"";
      }
      sourcesTriples += "?graph <" + DCTerms.source.getURI() + "> " + source + " . ";
    }


    String query =
        " WITH <" + graphsGraph + "> " + "DELETE { ?graph <" + DCTerms.modified.getURI() + "> ?m ."
            + "?graph <" + VOID.triples.getURI() + "> ?t . " + "} INSERT { ?graph <"
            + DCTerms.modified.getURI() + "> \"" + contribution.getDate() + "\" ." + "?graph <"
            + VOID.triples.getURI() + "> " + triples + " . " + "?graph <"
            + DCTerms.contributor.getURI() + "> <" + contribution.getContributor() + "> . "
            + sourcesTriples + " } WHERE { <" + contribution.getNamedGraph() + "> <"
            + SD.graph.getURI() + "> ?graph" + " . OPTIONAL{ ?graph <" + DCTerms.modified.getURI()
            + "> ?m .?graph <" + VOID.triples.getURI() + "> ?t .}}";

    log.debug(query);

    try {
      String result = systemAdmin.execute(query, MediaType.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(result);
    } catch (Exception e) {
      e.printStackTrace();
      throw new SPARQLEndpointException(e.getMessage());
    }



    return getNamedGraphByUri(contribution.getNamedGraph());
  }

  public NamedGraph getNamedGraphByUri(String uri) {

    String query =
        "SELECT distinct ?label ?description ?owner ?publicAccess ?created ?modified ?contributor ?source ?triples where {Graph <"
            + graphsGraph
            + "> {"
            + "?graph <"
            + SD.name.getURI()
            + "> <"
            + uri
            + "> ."
            + "\n"
            // + "?graph <" + DCTerms.identifier.getURI() + "> \"" + id + "\"^^<"+
            // XSD.xstring.getURI() + "> ." + "\n"
            + "?graph <"
            + ACL.owner.getURI()
            + "> ?owner ."
            + "\n"
            + "?graph <"
            + SD.graph.getURI()
            + "> ?metadata ."
            + "\n"
            + "OPTIONAL {?graph <"
            + LDIWO.access.getURI()
            + "> ?access ."
            + "\n"
            // public access information
            + "?access <"
            + ACL.agentClass.getURI()
            + "> <"
            + FOAF.Agent.getURI()
            + "> . "
            + "\n"
            + "?access <"
            + ACL.mode.getURI()
            + "> ?publicAccess .} "
            + "\n"
            // metadatagraph
            + "?metadata <"
            + RDF.type.getURI()
            + "> <"
            + SD.Graph.getURI()
            + ">."
            + "\n"
            + "?metadata <"
            + RDFS.label.getURI()
            + "> ?label ."
            + "\n"
            + "?metadata <"
            + DCTerms.description.getURI()
            + "> ?description ."
            + "\n"
            + "?metadata <"
            + DCTerms.created.getURI()
            + "> ?created ."
            + "\n"
            + "OPTIONAL { ?metadata <"
            + VOID.triples.getURI()
            + "> ?triples ."
            + "\n"
            + "?metadata <"
            + DCTerms.contributor.getURI()
            + "> ?contributor ."
            + "\n"
            + "?metadata <"
            + DCTerms.source.getURI()
            + "> ?source ."
            + "\n"
            + "?metadata <"
            + DCTerms.modified.getURI() + "> ?modified ." + "\n" + "} }}";

    // String delegatesQuery =
    // "SELECT distinct ?delegate where {GRAPH <" + graphsGraph + "> {" + "\n" + "<"
    // + frameworkConfig.getDefaultDataset() + "> <" + SD.namedGraph.getURI() + "> ?graph ."
    // + "\n" + "?graph <" + DCTerms.identifier.getURI() + "> \"" + id + "\"^^<"
    // + XSD.xstring.getURI() + "> ." + "\n" + "?graph <" + ACL.delegates.getURI()
    // + "> ?delegate ." + "\n" + "}}";
    //
    // String accessQuery =
    // "SELECT distinct ?mode ?user where {GRAPH <" + graphsGraph + "> {" + "\n" + "<"
    // + frameworkConfig.getDefaultDataset() + "> <" + SD.namedGraph.getURI() + "> ?graph ."
    // + "\n" + "?graph <" + DCTerms.identifier.getURI() + "> \"" + id + "\"^^<"
    // + XSD.xstring.getURI() + "> ." + "\n" + "?graph ldiw:access ?access ." + "\n"
    // + "?access <" + ACL.mode.getURI() + "> ?mode . " + "\n" + "?access <"
    // + ACL.agent.getURI() + "> ?user . " + "\n" + "}}";

    log.debug(query);

    String result;
    NamedGraph graph = new NamedGraph();
    Graph graphMeta = new Graph();
    AccessControl graphAccess = new AccessControl();

    // fetch graph data without accessinformation
    try {
      result = systemAdmin.execute(query, "application/sparql-results+json");
      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(result);

      Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
      if (!bindingsIter.hasNext())
        throw new ResourceNotFoundException("Graph with uri " + uri + " not found");

      while (bindingsIter.hasNext()) {
        JsonNode bindNode = bindingsIter.next();
        // graph.setId(id);
        graph.setUri(bindNode.path("uri").path("value").textValue());
        graph.setOwner(bindNode.path("owner").path("value").textValue());


        graphMeta.setLabel(bindNode.path("label").path("value").textValue());
        graphMeta.setDescription(bindNode.path("description").path("value").textValue());
        graphMeta.setCreated(bindNode.path("created").path("value").textValue());
        graphMeta.setModified(bindNode.path("modified").path("value").textValue());
        graphMeta.setTriples(bindNode.path("triples").path("value").asInt());


        if (bindNode.path("contributor").path("value").textValue() != null
            && !bindNode.path("contributor").path("value").textValue().isEmpty()) {
          if (!graphMeta.getContributor().contains(
              bindNode.path("contributor").path("value").textValue()))
            graphMeta.getContributor().add(bindNode.path("contributor").path("value").textValue());
        }

        if (bindNode.path("source").path("value").textValue() != null
            && !bindNode.path("source").path("value").textValue().isEmpty()) {
          if (!graphMeta.getSource().contains(bindNode.path("source").path("value").textValue()))
            graphMeta.getSource().add(bindNode.path("source").path("value").textValue());
        }

        if (bindNode.path("publicAccess").path("value").textValue() != null
            && !bindNode.path("publicAccess").path("value").textValue().isEmpty()) {
          graphAccess.setPublicAccess(bindNode.path("publicAccess").path("value").textValue()
              .replace(ACL.NS + "#", ""));
        } else {
          graphAccess.setPublicAccess(GraphPermissions.NO);
        }
      }
    } catch (Exception e) {

      e.printStackTrace();
      throw new NotFoundException();
    }



    // fetch access information
    // try {
    // result = systemAdmin.execute(prefix + accessQuery, "application/sparql-results+json");
    // ObjectMapper mapper = new ObjectMapper();
    // JsonNode rootNode = mapper.readTree(result);
    // Iterator<JsonNode> bindingsIter = rootNode.path("results").path("bindings").elements();
    // graphAccess.setReadPermissionUsers(new ArrayList<String>());
    // graphAccess.setWritePermissionUsers(new ArrayList<String>());
    // while (bindingsIter.hasNext()) {
    // JsonNode bindNode = bindingsIter.next();
    // graphAccess.addPermissionUser(
    // bindNode.path("mode").path("value").textValue().replace(ACL.NS + "#", ""), bindNode
    // .path("user").path("value").textValue());
    //
    // }
    //
    // } catch (Exception e) {
    //
    // e.printStackTrace();
    // throw new NotFoundException();
    // }


    graph.setGraph(graphMeta);
    graph.setAccessControl(graphAccess);
    return graph;
  }

}
