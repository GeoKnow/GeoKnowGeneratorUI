package eu.geoknow.generator.component.beans;

import java.util.HashMap;

import org.hibernate.validator.constraints.NotEmpty;

/**
 * A bean to capture the properties of a service
 * 
 * <pre>
 * :PublishingService a lds:PublicationService ; 
 *   dcterms:description "Provides functionality to upload 
 *     data."^^xsd:string ; 
 *   lds:serviceUrl <http://localhost:8080/service/rest/> .
 * 
 * </pre>
 * 
 * Mandatory properties are uri, type, description and service URL. The service can have other
 * properties that are variables (user, password, paths, etc.). These last could be sensitive data.
 * These properties should be literals.
 * 
 * @author alejandragarciarojas
 *
 */
public class Service {
  @NotEmpty
  private String uri;
  @NotEmpty
  private String type;
  @NotEmpty
  private String description;
  @NotEmpty
  private String serviceUrl;
  private HashMap<String, String> properties;

  public Service() {
    properties = new HashMap<String, String>();
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getServiceUrl() {
    return serviceUrl;
  }

  public void setServiceUrl(String serviceUrl) {
    this.serviceUrl = serviceUrl;
  }

  public HashMap<String, String> getProperties() {
    return properties;
  }

  public void setProperties(HashMap<String, String> properties) {
    this.properties = properties;
  }

  public String getUri() {
    return uri;
  }

  public void setUri(String uri) {
    this.uri = uri;
  }

}
