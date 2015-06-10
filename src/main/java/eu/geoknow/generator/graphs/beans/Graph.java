package eu.geoknow.generator.graphs.beans;

import java.util.ArrayList;
import java.util.List;


/**
 * A graph
 * 
 * @contributor alejandragarciarojas
 *
 */

public class Graph {


  private String label;
  private String description;
  private String graphset;
  private String created;
  private String modified;
  private String issued;
  private long triples;
  private List<String> source;
  private List<String> contributor;

  public Graph() {
    source = new ArrayList<String>();
    contributor = new ArrayList<String>();
  }

  public String getCreated() {
    return created;
  }

  public void setCreated(String created) {
    this.created = created;
  }

  public String getLabel() {
    return label;
  }

  public void setLabel(String label) {
    this.label = label;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getGraphset() {
    return graphset;
  }

  public void setGraphset(String graphset) {
    this.graphset = graphset;
  }

  public String getModified() {
    return modified;
  }

  public void setModified(String modified) {
    this.modified = modified;
  }

  public String getIssued() {
    return issued;
  }

  public void setIssued(String issued) {
    this.issued = issued;
  }

  public long getTriples() {
    return triples;
  }

  public void setTriples(long triples) {
    this.triples = triples;
  }

  public List<String> getSource() {
    return source;
  }

  public void setSource(List<String> source) {
    this.source = source;
  }

  public List<String> getContributor() {
    return contributor;
  }

  public void setContributor(List<String> contributor) {
    this.contributor = contributor;
  }

}
