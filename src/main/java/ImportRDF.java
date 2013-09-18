import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Writer;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.rdf.model.StmtIterator;


public class ImportRDF {

	public class UploadServlet extends HttpServlet {

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
		 
		    
		    //else if (rdfUrl != null)
		    	//model = RDFDataMgr.loadModel(rdfFile);
		    String source = null;
		    if(rdfFile != null)
		    	source = rdfFile;
		    else 
		    	source =rdfUrl;
		    	
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
		    // there is nothing to import
		    else{
		    	res.setStatus("SUCESS");
		    	res.setMessage("Nothing to import");
		    }
		    	
		    mapper.writeValue(out, res); 
		    out.close();
		 }
	}
	
	private void update(){
		// TODO: implement for standarized Insert data using Jena
		
//		GraphStore graphStore = GraphStoreFactory.create() ;
//		UpdateRequest request = UpdateFactory.create("INSERT DATA {<http://example.org#a> <http://example.org#b> <http://example.org#c>.}");      
//	    UpdateProcessor processor = UpdateExecutionFactory
//               .createRemote(request, "http://192.168.2.15:8890/sparql");
////       request.add(new UpdateDrop(Target.ALL)) ;
////       request.add(new UpdateCreate("http://example/g2")) ;
////       request.add(new UpdateLoad("file:/Users/alejandragarciarojas/Developments/GeoKnow/GeoKnowGeneratorUI/src/main/resources/service-description.ttl", "http://example/g2")) ;     
//	    processor.execute();
//        System.out.println("# Debug format");
//	    SSE.write(graphStore) ;
	}
	
	private void httpUpdate(String endpoint, String graph, String file) throws Exception{
		
		Model model = ModelFactory.createDefaultModel() ; 
		model.read(file) ;
	      
		String queryString="INSERT DATA {  ";
		
		ByteArrayOutputStream os = new ByteArrayOutputStream();
		model.write(os, "N-TRIPLES");
		queryString += os.toString();
		os.close();
		
		queryString += "}";
		
		System.out.println(queryString);
		HttpSPARQLUpdate p = new HttpSPARQLUpdate();
        p.setEndpoint(endpoint);
        p.setGraph(graph);
        p.setUpdateString(queryString);
        
        boolean response = p.execute();
        if (!response)  throw new Exception("UPDATE/SPARQL failed: " + queryString);
     
	}
}
