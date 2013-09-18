/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.Writer;

import org.apache.jena.riot.Lang ;
import org.apache.jena.riot.RDFDataMgr ;
import org.apache.jena.riot.RiotNotFoundException;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.sparql.modify.request.Target ;
import com.hp.hpl.jena.sparql.modify.request.UpdateCreate ;
import com.hp.hpl.jena.sparql.modify.request.UpdateDrop ;
import com.hp.hpl.jena.sparql.modify.request.UpdateLoad ;
import com.hp.hpl.jena.sparql.sse.SSE ;
import com.hp.hpl.jena.update.* ;

/** Build an update request up out of indvidiual Update objects, not by parsing.
 *  This is quite low-level.
 *  See UpdateExecuteOperations for ways to build the request up from strings. 
 *  These two approaches can be mixed.
 */

public class UpdateProgrammatic
{
    public static void main(String []args) throws Exception
    {
    	String endpoint= "http://10.0.0.64:8890/sparql";
    	String graph ="http://localhost:8890/test";
    	String queryString = "INSERT DATA {  " +
    	" <http://localhost:8890/rec/test1> <http://purl.org/dc/elements/1.1/title> <http://localhost:8890/rec/test2> }";
    	
    	String file = "/Users/alejandragarciarojas/Developments/GeoKnow/GeoKnowGeneratorUI/src/resources/service-description.ttl";
    	Model model = ModelFactory.createDefaultModel() ; 
    	try{
    		model.read(file) ;
    	}
    	catch (RiotNotFoundException e){
    		 System.out.println("FAIL");
    		 System.out.println(e.getMessage());
    		 throw new IOException(e.getMessage());
    	}
		queryString="INSERT {  ";
		
		ByteArrayOutputStream os = new ByteArrayOutputStream();
		model.write(os, "N-TRIPLES");
		String triples = os.toString();
		os.close();
		//	 	String queryString = "INSERT DATA {  " +
//    	" <http://localhost:8890/rec/test1> <http://purl.org/dc/elements/1.1/title> <http://localhost:8890/rec/test2> }";
		queryString += triples;
		queryString += "} WHERE { ?s ?p ?o }";
		
		System.out.println(queryString);
    	HttpSPARQLUpdate p = new HttpSPARQLUpdate();
        p.setEndpoint(endpoint);
        p.setGraph(graph);
        p.setUpdateString(queryString);
        boolean response = p.execute();
        if (!response) {
            System.err.println("UPDATE/SPARQL failed: " + queryString);
           
        }
        System.out.println("SUCESS");
        
		
		// USING JENA
		
//        GraphStore graphStore = GraphStoreFactory.create() ;
//        
//        
//        UpdateRequest request = UpdateFactory.create("INSERT DATA {<http://example.org#a> <http://example.org#b> <http://example.org#c>.}");      
//        
//        
//        UpdateProcessor processor = UpdateExecutionFactory
//                .createRemote(request, "http://192.168.2.15:8890/sparql");
//       
//        
////        request.add(new UpdateDrop(Target.ALL)) ;
////        request.add(new UpdateCreate("http://example/g2")) ;
////        request.add(new UpdateLoad("file:/Users/alejandragarciarojas/Developments/GeoKnow/GeoKnowGeneratorUI/src/main/resources/service-description.ttl", "http://example/g2")) ;
////           
//        processor.execute();
//        
////        UpdateAction.execute(request, graphStore) ;
//        
//        System.out.println("# Debug format");
//        SSE.write(graphStore) ;
//        
//        
//        
//        System.out.println("# N-Quads: S P O G") ;
//        RDFDataMgr.write(System.out, graphStore, Lang.NQUADS) ;
    }
}