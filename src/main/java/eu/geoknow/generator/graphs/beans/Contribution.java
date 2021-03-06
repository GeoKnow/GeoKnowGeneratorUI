package eu.geoknow.generator.graphs.beans;

import java.util.List;

import org.hibernate.validator.constraints.NotEmpty;


/**
 * This bean is for adding information about the changes made to a graph
 * 
 * @contributor alejandragarciarojas
 *
 */
public class Contribution {

  @NotEmpty
  private String namedGraph;
  private String date;
  @NotEmpty
  private List<String> source;
  @NotEmpty
  private String contributor;


  public String getNamedGraph() {
    return namedGraph;
  }

  public void setNamedGraph(String namedGraph) {
    this.namedGraph = namedGraph;
  }

  public String getDate() {
    return date;
  }

  public void setDate(String date) {
    this.date = date;
  }

  public List<String> getSource() {
    return source;
  }

  public void setSource(List<String> source) {
    this.source = source;
  }

  public String getContributor() {
    return contributor;
  }

  public void setContributor(String contributor) {
    this.contributor = contributor;
  }


}
