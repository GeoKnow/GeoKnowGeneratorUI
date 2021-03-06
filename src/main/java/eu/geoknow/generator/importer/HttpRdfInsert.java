package eu.geoknow.generator.importer;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.UUID;

import org.apache.log4j.Logger;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.RDFNode;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.rdf.model.StmtIterator;

import eu.geoknow.generator.common.APP_CONSTANT;
import eu.geoknow.generator.common.Queries;
import eu.geoknow.generator.exceptions.ServiceInternalServerError;
import eu.geoknow.generator.rdf.RdfStoreManager;

public class HttpRdfInsert {

  private RdfStoreManager rdfStoreManager;

  private static final Logger log = Logger.getLogger(HttpRdfInsert.class);

  public HttpRdfInsert(RdfStoreManager rdfStoreManager) {
    this.rdfStoreManager = rdfStoreManager;
  }

  public int localCopy(String sourceGraph, String targetGraph) throws ServiceInternalServerError {
    try {

      String query = "COPY <" + sourceGraph + "> TO <" + targetGraph + ">";
      log.debug(query);
      String res = rdfStoreManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(res);
      return Queries.countGraphTriples(targetGraph, rdfStoreManager);

    } catch (Exception e) {
      e.printStackTrace();
      throw new ServiceInternalServerError(e.getMessage());

    }

  }

  public int localAdd(String sourceGraph, String targetGraph) throws ServiceInternalServerError {
    try {
      int initialTriples = Queries.countGraphTriples(targetGraph, rdfStoreManager);
      String query = "ADD <" + sourceGraph + "> TO <" + targetGraph + ">";
      log.debug(query);
      String res = rdfStoreManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(res);
      return Queries.countGraphTriples(targetGraph, rdfStoreManager) - initialTriples;
    } catch (Exception e) {
      e.printStackTrace();
      throw new ServiceInternalServerError(e.getMessage());

    }

  }

  public int localInsertQuery(String quertString, String sourceGraph, String targetGraph)
      throws ServiceInternalServerError {

    try {
      int initialTriples = Queries.countGraphTriples(targetGraph, rdfStoreManager);
      String query = quertString;
      log.debug(query);
      String res = rdfStoreManager.execute(query, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);
      log.debug(res);
      return Queries.countGraphTriples(targetGraph, rdfStoreManager) - initialTriples;
    } catch (Exception e) {
      e.printStackTrace();
      throw new ServiceInternalServerError(e.getMessage());

    }
  }

  public int httpInsert(String graph, Model model, String uriBase) throws Exception {

    // generate queries of 100 lines each
    StmtIterator stmts = model.listStatements();
    int linesLimit = 100, linesCount = 0, total = 0;
    HashMap<String, String> blancNodes = new HashMap<String, String>();

    Model tmpModel = ModelFactory.createDefaultModel();

    while (stmts.hasNext()) {

      if (linesCount < linesLimit) {

        Statement stmt = stmts.next();
        Resource subject = null;
        RDFNode object = null;
        // find bnodes to skolemise them
        if (stmt.getSubject().isAnon()) {
          String oldBN = stmt.getSubject().asNode().getBlankNodeLabel();
          if (blancNodes.containsKey(oldBN)) {
            subject = tmpModel.getResource(blancNodes.get(oldBN));
          } else {
            String newBN = uriBase + "bnode#" + UUID.randomUUID();
            blancNodes.put(oldBN, newBN);
            subject = tmpModel.createResource(newBN);
          }
        } else
          subject = stmt.getSubject();

        if (stmt.getObject().isAnon()) {
          String oldBN = stmt.getObject().asNode().getBlankNodeLabel();
          if (blancNodes.containsKey(oldBN)) {
            object = tmpModel.getResource(blancNodes.get(oldBN));
          } else {
            String newBN = uriBase + "bnode#" + UUID.randomUUID();
            blancNodes.put(oldBN, newBN);
            object = tmpModel.createResource(newBN);
          }
        } else
          object = stmt.getObject();

        tmpModel.add(subject, stmt.getPredicate(), object);
        linesCount++;
      } else {

        ByteArrayOutputStream os = new ByteArrayOutputStream();
        tmpModel.write(os, "N-TRIPLES");

        String queryString = "INSERT DATA { GRAPH <" + graph + "> { " + os.toString() + " } }";
        log.debug(queryString);
        os.close();
        String res = rdfStoreManager.execute(queryString, APP_CONSTANT.SPARQL_JSON_RESPONSE_FORMAT);
        log.debug(res);
        total += linesCount;
        linesCount = 0;
        tmpModel.removeAll();
      }

    }

    if (!tmpModel.isEmpty()) {

      ByteArrayOutputStream os = new ByteArrayOutputStream();
      tmpModel.write(os, "N-TRIPLES");

      String queryString = "INSERT DATA { GRAPH <" + graph + "> { " + os.toString() + "} }";
      os.close();
      String res = rdfStoreManager.execute(queryString, null);
      log.debug(res);
      total += linesCount;

    }

    return total;

  }
}
