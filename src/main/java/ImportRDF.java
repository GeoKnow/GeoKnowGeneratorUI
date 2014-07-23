import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.UUID;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;

import rdf.RdfStoreManager;
import util.HttpUtils;
import util.JsonResponse;
import accounts.FrameworkUserManager;
import authentication.FrameworkConfiguration;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.RDFNode;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.rdf.model.StmtIterator;

public class ImportRDF extends HttpServlet {

  /**
	 * 
	 */
  private static final long serialVersionUID = 1L;
  private String rdfUrl;
  private String rdfFiles;
  private String endpoint;
  private static String uriBase;
  private String graph;
  private String rdfQuery;
  private String rdfQueryEndpoint;
  private String username;
  private String token;

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    doPost(request, response);
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

    response.setContentType("application/json");

    PrintWriter out = response.getWriter();

    // get the paht where files were uploaded
    String filePath = getServletContext().getRealPath(File.separator)
        + getServletContext().getInitParameter("file-upload").replaceFirst("/", "");
    filePath = "file:///" + filePath.replace("\\", "/");
    filePath = filePath.replace(" ", "%20");
    JsonResponse res = new JsonResponse();
    ObjectMapper mapper = new ObjectMapper();

    // jdbcConnection = getServletContext().getInitParameter("virtuoso-jdbc");
    // jdbcUser = getServletContext().getInitParameter("virtuoso-user");
    // jdbcPassword = getServletContext().getInitParameter("virtuoso-password");

    uriBase = request.getParameter("uriBase");
    rdfUrl = request.getParameter("rdfUrl");
    endpoint = request.getParameter("endpoint");
    graph = request.getParameter("graph");
    rdfFiles = request.getParameter("rdfFiles");
    rdfQuery = request.getParameter("rdfQuery");
    rdfQueryEndpoint = request.getParameter("rdfQueryEndpoint");
    username = request.getParameter("username");
    token = HttpUtils.getCookieValue(request, "token");

    // boolean useJDBC= false;
    // System.out.println("rdfUrl   " +rdfUrl);
    // System.out.println("rdfFiles " +rdfFiles);
    // System.out.println("endpoint " +endpoint);
    // System.out.println("graph    " +graph);

    // if(useJDBC){
    // // this solution is much faster but not working yet in java
    // if(rdfFiles!= null){
    // try {
    // jdbcUpdate(filePath+rdfFiles, graph);
    // res.setStatus("SUCESS");
    // res.setMessage("Nothing to import");
    // } catch (ClassNotFoundException e) {
    // res.setStatus("FAIL");
    // res.setMessage(e.getMessage());
    // e.printStackTrace();
    // } catch (SQLException e) {
    // res.setStatus("FAIL");
    // res.setMessage(e.getMessage());
    // e.printStackTrace();
    // }
    // }
    // }

    String source = ((rdfFiles == null) ? rdfUrl : filePath + rdfFiles);
    try {
      if (source != null) {
        String file = source;
        System.out.println("import    " + file);
        Model model = ModelFactory.createDefaultModel();
        model.read(source);
        int inserted = httpUpdate(endpoint, graph, model);
        res.setStatus("SUCESS");
        res.setMessage("Data Imported " + inserted + " triples");
      } else {
        int inserted = queryImport(endpoint, graph, rdfQueryEndpoint, rdfQuery);
        res.setStatus("SUCESS");
        res.setMessage("Data Imported " + inserted + " triples");
      }
    } catch (Exception e) {
      res.setStatus("FAIL");
      res.setMessage(e.getMessage());
      e.printStackTrace();
    }

    mapper.writeValue(out, res);
    out.close();
  }

  // private static void jdbcUpdate(String file, String graph) throws
  // ClassNotFoundException, SQLException{
  // UpdateJDBC ujdbc = new UpdateJDBC(jdbcConnection, jdbcUser, jdbcPassword);
  // ujdbc.loadLocalFile(file, graph);
  // }

  private int queryImport(String destEndpoint, String graph, String sourceEndpoint, String sparql)
      throws Exception {
    Query query = QueryFactory.create(sparql);
    QueryExecution qexec = QueryExecutionFactory.sparqlService(sourceEndpoint, query);
    Model model = qexec.execConstruct();
    int inserted = httpUpdate(destEndpoint, graph, model);
    qexec.close();
    return inserted;
  }

  private int httpUpdate(String endpoint, String graph, Model model) throws Exception {
    RdfStoreManager rdfStoreManager = null;
    if (username != null && !username.isEmpty() && token != null && !token.isEmpty()) {
      FrameworkUserManager frameworkUserManager = FrameworkConfiguration.getInstance(
          getServletContext()).getFrameworkUserManager();
      if (frameworkUserManager.checkToken(username, token))
        rdfStoreManager = frameworkUserManager.getRdfStoreManager(username);
    }

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

        if (rdfStoreManager != null) {
          String queryString = "INSERT DATA { GRAPH <" + graph + "> { " + os.toString() + " } }";
          os.close();
          rdfStoreManager.execute(queryString, null);
        } else {
          String queryString = "INSERT {  " + os.toString() + "}";
          os.close();

          HttpSPARQLUpdate p = new HttpSPARQLUpdate();
          p.setEndpoint(endpoint);
          p.setGraph(graph);
          p.setUpdateString(queryString);

          if (!p.execute())
            throw new Exception("UPDATE/SPARQL failed: " + queryString);
        }

        total += linesCount;
        linesCount = 0;
        tmpModel.removeAll();
      }

    }

    if (!tmpModel.isEmpty()) {

      ByteArrayOutputStream os = new ByteArrayOutputStream();
      tmpModel.write(os, "N-TRIPLES");

      if (rdfStoreManager != null) {
        String queryString = "INSERT DATA { GRAPH <" + graph + "> { " + os.toString() + "} }";
        os.close();
        rdfStoreManager.execute(queryString, null);
      } else {
        String queryString = "INSERT {  " + os.toString() + "}";
        os.close();

        HttpSPARQLUpdate p = new HttpSPARQLUpdate();
        p.setEndpoint(endpoint);
        p.setGraph(graph);
        p.setUpdateString(queryString);

        if (!p.execute())
          throw new Exception("UPDATE/SPARQL failed: " + queryString);
      }

      total += linesCount;

    }

    return total;

  }

}
