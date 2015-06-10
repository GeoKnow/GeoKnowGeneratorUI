package eu.geoknow.generator.graphs.beans;


/**
 * This bean is for adding information about the changes made to a graph
 * 
 * @contributor alejandragarciarojas
 *
 */
public class Contribution {

  private String namedGraph;
  private String date;
  private String source;
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

  public String getSource() {
    return source;
  }

  public void setSource(String source) {
    this.source = source;
  }

  public String getContributor() {
    return contributor;
  }

  public void setContributor(String contributor) {
    this.contributor = contributor;
  }


}
