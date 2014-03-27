package rdf;

public interface RdfStoreManager {
    public void createGraph(String graph) throws Exception;
    public void dropGraph(String graph) throws Exception;
    public String execute(String sparqlQuery, String responseFormat) throws Exception;
}
