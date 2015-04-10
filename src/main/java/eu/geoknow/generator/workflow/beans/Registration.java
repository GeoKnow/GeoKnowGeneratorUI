package eu.geoknow.generator.workflow.beans;

import java.util.NavigableMap;
import java.util.TreeMap;

public class Registration {

  private String name;
  private String resource;
  private String description;
  private String created;
  private int executionCount;
  private boolean launchable;
  private boolean incrementable;
  private NavigableMap<Integer, JobInstance> jobInstances;
  private String label ;
  private String creator ;
  private int iDay ;
  private int iWeek ;
  private int iMonth ;
  private String start ;
  private String end ;
  private String nextFire;
  private String targetGraph;

  public Registration() {
    // use treeMap to have keys sorted
    jobInstances = new TreeMap<Integer, JobInstance>();
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getResource() {
    return resource;
  }

  public void setResource(String resource) {
    this.resource = resource;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public int getExecutionCount() {
    return executionCount;
  }

  public void setExecutionCount(int executionCount) {
    this.executionCount = executionCount;
  }

  public boolean isLaunchable() {
    return launchable;
  }

  public void setLaunchable(boolean launchable) {
    this.launchable = launchable;
  }

  public boolean isIncrementable() {
    return incrementable;
  }

  public void setIncrementable(boolean incrementable) {
    this.incrementable = incrementable;
  }

  public NavigableMap<Integer, JobInstance> getJobInstances() {
    return jobInstances;
  }

  public void setJobInstances(NavigableMap<Integer, JobInstance> jobInstances) {
    this.jobInstances = jobInstances;
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

  public String getCreator() {
    return creator;
  }

  public void setCreator(String creator) {
    this.creator = creator;
  }


  public void setiDay(int iDay) {
    this.iDay = iDay;
  }

  public String getNextFire() {
    return nextFire;
  }

  public void setNextFire(String nextFire) {
    this.nextFire = nextFire;
  }

  public String getTargetGraph() {
    return targetGraph;
  }

  public void setTargetGraph(String targetGraph) {
    this.targetGraph = targetGraph;
  }

  public int getiDay() {
    return iDay;
  }

  public int getiWeek() {
    return iWeek;
  }

  public int getiMonth() {
    return iMonth;
  }

  public void setiWeek(int iWeek) {
    this.iWeek = iWeek;
  }

  public void setiMonth(int iMonth) {
    this.iMonth = iMonth;
  }

  public String getStart() {
    return start;
  }

  public void setStart(String start) {
    this.start = start;
  }

  public String getEnd() {
    return end;
  }

  public void setEnd(String end) {
    this.end = end;
  }

  

}
