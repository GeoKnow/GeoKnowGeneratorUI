import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
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
        String urlParameters = "query=" + URLEncoder.encode(this.getUpdateString(), "UTF-8") + "&"+
                	  "default-graph-uri="+ URLEncoder.encode(this.getGraph(), "UTF-8");
       
        
        URL url = new URL(endpoint); 
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();           
        connection.setDoOutput(true);
        connection.setDoInput(true);
        connection.setInstanceFollowRedirects(false); 
        connection.setRequestMethod("POST"); 
        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded"); 
        connection.setRequestProperty("charset", "utf-8");
        connection.setRequestProperty("Content-Length", "" + Integer.toString(urlParameters.getBytes().length));
        connection.setUseCaches (false);

        System.out.println("\nSending 'POST' request to URL : " + url);
        
        DataOutputStream wr = new DataOutputStream(connection.getOutputStream ());
        wr.writeBytes(urlParameters);
        wr.flush();
		wr.close();
 
		int responseCode = connection.getResponseCode();
		
		System.out.println("Response Code : " + responseCode);
		System.out.println("Response Message : " + connection.getResponseMessage());
		
 		BufferedReader in = new BufferedReader(
		        new InputStreamReader(connection.getInputStream()));
		String inputLine;
		StringBuffer response = new StringBuffer();
 
		while ((inputLine = in.readLine()) != null) {
			response.append(inputLine);
		}
		in.close();
        
        boolean res = true;      
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