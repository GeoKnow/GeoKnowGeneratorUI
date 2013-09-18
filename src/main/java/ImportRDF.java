import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;


public class ImportRDF extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private String rdfUrl;
	private String rdfFile;
	private String endpoint;
	private String graph;
	

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
	      doPost(request, response);
	
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		
		response.setContentType("application/json");
	    
		PrintWriter out = response.getWriter();
		
		rdfUrl = request.getParameter("url");
	    rdfFile = request.getParameter("file-location");
	    endpoint = request.getParameter("endpoint");
	    graph = request.getParameter("graph");
	    
	    JsonResponse res = new JsonResponse();
	    
	    ObjectMapper mapper = new ObjectMapper();
	 
	    String source = ((rdfFile == null) ? rdfUrl : rdfFile);
	    
		if(source != null){
			try {
				httpUpdate(endpoint, graph, rdfFile);
				res.setStatus("SUCESS");
				res.setMessage("Nothing to import");
				   
			} catch (Exception e) {
				res.setStatus("FAIL");
				res.setMessage(e.getMessage());
				e.printStackTrace();
			}    	
	    }
		// else try the sparql query 
	    // there is nothing to import
	    else{
	    	res.setStatus("SUCESS");
	    	res.setMessage("Nothing to import");
	    }
	    	
	    mapper.writeValue(out, res); 
	    out.close();
	 }

	
	private static void httpUpdate(String endpoint, String graph, String source) throws Exception{
		
		Model model = ModelFactory.createDefaultModel() ; 
		model.read(source) ;
		     
		String queryString="INSERT {  ";
		
		ByteArrayOutputStream os = new ByteArrayOutputStream();
		model.write(os, "N-TRIPLES");
		queryString += os.toString();
		os.close();
		model.close();
		   
		queryString += "}";
		
		HttpSPARQLUpdate p = new HttpSPARQLUpdate();
        p.setEndpoint(endpoint);
        p.setGraph(graph);
        p.setUpdateString(queryString);
        
     
        
        boolean response = p.execute();
        if (!response)  throw new Exception("UPDATE/SPARQL failed: " + queryString);
     
	}

}
