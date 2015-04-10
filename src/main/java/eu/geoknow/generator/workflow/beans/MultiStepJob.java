package eu.geoknow.generator.workflow.beans;

import java.util.List;

/**
 * POJO for a job with multiple steps.
 * 
 * @author mvoigt
 *
 */
public class MultiStepJob {

  private String name;
  private String label;
  private String description;
  private List<Step> steps;
  private String targetGraph;


  public MultiStepJob() {}

  /**
   * Constructor for the POJO with all fields.
   * 
   * @param name
   * @param description
   * @param steps
   * @param schedule
   */
  public MultiStepJob(String name, String label, String description, List<Step> steps,
      String targetGraph) {
    this.name = name;
    this.label = label;
    this.description = description;
    this.steps = steps;
    this.targetGraph = targetGraph;
  }



  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public List<Step> getSteps() {
    return steps;
  }

  public void setSteps(List<Step> steps) {
    this.steps = steps;
  }

  public String getLabel() {
    return label;
  }

  public void setLabel(String label) {
    this.label = label;
  }

  public String getTargetGraph() {
    return targetGraph;
  }

  public void setTargetGraph(String targetGraph) {
    this.targetGraph = targetGraph;
  }



}
