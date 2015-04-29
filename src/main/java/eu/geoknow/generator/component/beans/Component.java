package eu.geoknow.generator.component.beans;

import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty;

/**
 * A bean to capture the description of a component and its services
 * 
 * <pre>
 * :Sparqlify a lds:StackComponent ; 
 *   rdfs:label "Sparqlify"^^xsd:string ; 
 *   lds:providesService
 *   
 * :SparqlifyService ; 
 *   lds:version "0.1-SNAPSHOT"^^xsd:string ; 
 *   foaf:homepage <http://aksw.org/Projects/Sparqlify.html> .
 * </pre>
 * 
 * @author alejandragarciarojas
 *
 */
public class Component {

  @NotEmpty
  private String uri;
  @NotEmpty
  private String version;
  @NotEmpty
  private String label;
  @NotEmpty
  private String homepage;
  @NotNull
  @Valid
  private List<Service> services;

  public Component() {
    setServices(new ArrayList<Service>());
  }

  public String getVersion() {
    return version;
  }

  public void setVersion(String version) {
    this.version = version;
  }

  public String getLabel() {
    return label;
  }

  public void setLabel(String label) {
    this.label = label;
  }

  public String getHomepage() {
    return homepage;
  }

  public void setHomepage(String homepage) {
    this.homepage = homepage;
  }

  public String getUri() {
    return uri;
  }

  public void setUri(String uri) {
    this.uri = uri;
  }

  public List<Service> getServices() {
    return services;
  }

  public void setServices(List<Service> services) {
    this.services = services;
  }

}
