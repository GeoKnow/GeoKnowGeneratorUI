package eu.geoknow.generator.rdf;

import java.io.IOException;

import org.apache.http.HttpException;

public interface RdfStoreManager {
	
	 /**
     * Creates graph in RDF store
     * @param graph
     *          Graph URI
     * @return
     *          SPARQL CREATE query result
     * @throws Exception
     */
    public String createGraph(String graph) throws Exception;
    
    /**
     * Drops existing from RDF store
     * @param graph
     *          Existing graph URI
     * @return
     *          SPARQL DROP query result
     * @throws Exception
     */
    public String dropGraph(String graph) throws Exception;
    
    /**
     * Executes given sparql query
     * @param sparqlQuery
     *          SPARQL query to execute
     * @param responseFormat
     *          SPARQL endpoint response format
     * @return
     *          SPARQL response as a string in specified format
     * @throws Exception
     */
    public String execute(String sparqlQuery, String responseFormat) throws IOException, Exception;
}
