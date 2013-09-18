import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;

/**
 *
 * @author admos0
 */
public class HttpSPARQLUpdate {

    private String updateString = "";
    private String endpoint = "";
    private String graph = "";

    public HttpSPARQLUpdate() {
        // empty constructor
    }

    public HttpSPARQLUpdate(String input) {
        this.updateString = input;
    }

    /**
     * @method  execute the update
     * @return  the response adapted from virtuoso "done"
     */
    public boolean execute() throws Exception {
        if (this.endpoint.equals("")) throw new Exception("No endpoint specified");
        if (this.updateString.equals("")) throw new Exception("No update string specified");
        if (this.graph.equals("")) throw new Exception("No default graph specified");
    
        // Construct data
        //  Virtuoso does not support INSERT DATA {graph <graph> {}} thus a default-graph-uri  parameter has to be passed
        // TODO: make store independent or implement special cases such as Virtuoso
        String data = "query=" + URLEncoder.encode(this.getUpdateString(), "UTF-8") + "&"+
                	  "default-graph-uri="+ URLEncoder.encode(this.getGraph(), "UTF-8");
        System.out.println(data);
        // Send data
        URL url = new URL(endpoint);
    
        URLConnection conn = url.openConnection();
        conn.setDoOutput(true);
        OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
        wr.write(data);
        wr.flush();
    
        // Get the response
        BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        String response = "";
        String line;
        while ((line = rd.readLine()) != null) {
            response += line;
        }
        
        wr.close();
        rd.close();
        
        boolean res = false;
        if (response.contains("done")) res=true;
        
        return res;
    }

    /**
     * @param set the endpoint
     */
    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    /**
     * @return the endpoint
     */
    public String getEndpoint() {
        return this.endpoint;
    }


    /**
     * @param updateString the updateString to set
     */
    public void setUpdateString(String updateString) {
        this.updateString = updateString;
    }

    /**
     * @return the updateString
     */
    public String getUpdateString() {
        return updateString;
    }

	public String getGraph() {
		return graph;
	}

	public void setGraph(String graph) {
		this.graph = graph;
	}
}