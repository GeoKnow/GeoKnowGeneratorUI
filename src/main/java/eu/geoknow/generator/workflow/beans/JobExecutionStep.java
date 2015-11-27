package eu.geoknow.generator.workflow.beans;

/**
 * 
 * @author alejandragarciarojas
 *
 */
public class JobExecutionStep {
  private String id;
  private String resource;
  private Status status;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getResource() {
    return resource;
  }

  public void setResource(String resource) {
    this.resource = resource;
  }

  public Status getStatus() {
    return status;
  }

  public void setStatus(Status status) {
    this.status = status;
  }

}
