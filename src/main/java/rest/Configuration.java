package rest;

import javax.servlet.ServletContext;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.apache.log4j.Logger;

import authentication.FrameworkConfiguration;

import com.google.gson.JsonObject;

/**
 * TODO: documentation using something like
 * https://github.com/kongchen/swagger-maven-plugin
 */

@Path("/config")
public class Configuration {

    private static final Logger log = Logger.getLogger(Configuration.class);

    /**
     * Get application basic parameters
     * 
     * @return true/false
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String getConfiguration(@Context ServletContext context) {

	FrameworkConfiguration frameworkConf;
	JsonObject config = null;
	try {
	    frameworkConf = FrameworkConfiguration.getInstance(context);
	    config = new JsonObject();
	    config.addProperty("frameworkUri", frameworkConf.getFrameworkUri());
	    config.addProperty("ns", frameworkConf.getResourceNamespace());
	    config.addProperty("defaultSettingsGraphUri",
		    frameworkConf.getSettingsGraph());
	    config.addProperty("groupsGraphUri",
		    frameworkConf.getGroupsGraph());
	    config.addProperty("frameworkOntologyNs",
		    frameworkConf.getFrameworkOntologyNS());
	    config.addProperty("accountsGraph",
		    frameworkConf.getAccountsGraph());

	} catch (Exception e) {
	    log.error(e);
	    e.printStackTrace();
	}
	return config.toString();
    }
}