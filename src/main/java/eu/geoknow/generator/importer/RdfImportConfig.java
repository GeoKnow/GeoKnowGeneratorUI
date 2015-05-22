package eu.geoknow.generator.importer;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty;

public class RdfImportConfig {

  @NotEmpty
  @NotNull
  @Valid
  private String targetGraph;
  private String sourceGraph;
  private String sourceEndpoint;
  private String sourceUrl;
  private String fileName;
  private int triples;

  public String getTargetGraph() {
    return targetGraph;
  }

  public void setTargetGraph(String targetGraph) {
    this.targetGraph = targetGraph;
  }

  public String getSourceGraph() {
    return sourceGraph;
  }

  public void setSourceGraph(String sourceGraph) {
    this.sourceGraph = sourceGraph;
  }

  public String getSourceEndpoint() {
    return sourceEndpoint;
  }

  public void setSourceEndpoint(String sourceEndpoint) {
    this.sourceEndpoint = sourceEndpoint;
  }

  public String getSparqlQuery() {
    return sparqlQuery;
  }

  public void setSparqlQuery(String sparqlQuery) {
    this.sparqlQuery = sparqlQuery;
  }

  private String sparqlQuery;

  public String getSourceUrl() {
    return sourceUrl;
  }

  public void setSourceUrl(String sourceUrl) {
    this.sourceUrl = sourceUrl;
  }

  public String getFileName() {
    return fileName;
  }

  public void setFileName(String fileName) {
    this.fileName = fileName;
  }

  public int getTriples() {
    return triples;
  }

  public void setTriples(int triples) {
    this.triples = triples;
  }


}
