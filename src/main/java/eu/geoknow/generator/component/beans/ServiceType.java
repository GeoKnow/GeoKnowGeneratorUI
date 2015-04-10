package eu.geoknow.generator.component.beans;

import java.util.HashMap;
import java.util.Map;

public class ServiceType {

  private String uri;
  private Map<String, String> labels;

  public ServiceType() {
    setLabels(new HashMap<String, String>());
  }

  public String getUri() {
    return uri;
  }

  public void setUri(String uri) {
    this.uri = uri;
  }

  public Map<String, String> getLabels() {
    return labels;
  }

  public void setLabels(Map<String, String> labels) {
    this.labels = labels;
  }

}
