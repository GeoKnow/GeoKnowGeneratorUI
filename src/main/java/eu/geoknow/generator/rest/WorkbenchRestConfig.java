/**
 * 
 */
package eu.geoknow.generator.rest;

import javax.ws.rs.ApplicationPath;

import org.glassfish.jersey.server.ResourceConfig;


/**
 * Main configuration for Jersey REST
 * 
 * @author mvoigt
 *
 */
@ApplicationPath("/rest/*")
public class WorkbenchRestConfig extends ResourceConfig {

  public WorkbenchRestConfig() {
    packages("eu.geoknow.generator.rest");
  }

}
