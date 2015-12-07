package eu.geoknow.generator.workflow.beans;

/**
 * Detailed description of the execution of a step
 * 
 * @author alejandragarciarojas
 *
 *
 */
public class StepExecutionDetail {

  private String id;
  private String name;
  private String resource;
  private Status status;
  private String startTime;
  private String duration;
  private int readCount;
  private int writeCount;
  private int filterCount;
  private int readSkipCount;
  private int processSkipCount;
  private int commitCount;
  private String rollbackCount;
  private String exitCode;
  private String exitDescription;

  public int getReadCount() {
    return readCount;
  }

  public int getWriteCount() {
    return writeCount;
  }

  public int getCommitCount() {
    return commitCount;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getStartTime() {
    return startTime;
  }

  public void setStartTime(String startTime) {
    this.startTime = startTime;
  }

  public int getFilterCount() {
    return filterCount;
  }

  public void setFilterCount(int filterCount) {
    this.filterCount = filterCount;
  }

  public int getReadSkipCount() {
    return readSkipCount;
  }

  public void setReadSkipCount(int readSkipCount) {
    this.readSkipCount = readSkipCount;
  }

  public int getProcessSkipCount() {
    return processSkipCount;
  }

  public void setProcessSkipCount(int processSkipCount) {
    this.processSkipCount = processSkipCount;
  }

  public String getExitDescription() {
    return exitDescription;
  }

  public void setExitDescription(String exitDescription) {
    this.exitDescription = exitDescription;
  }

  public void setReadCount(int readCount) {
    this.readCount = readCount;
  }

  public void setWriteCount(int writeCount) {
    this.writeCount = writeCount;
  }

  public void setCommitCount(int commitCount) {
    this.commitCount = commitCount;
  }

  public Status getStatus() {
    return status;
  }

  public void setStatus(Status status) {
    this.status = status;
  }

  public String getExitCode() {
    return exitCode;
  }

  public void setExitCode(String exitCode) {
    this.exitCode = exitCode;
  }

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

  public String getRollbackCount() {
    return rollbackCount;
  }

  public void setRollbackCount(String rollbackCount) {
    this.rollbackCount = rollbackCount;
  }

  public String getDuration() {
    return duration;
  }

  public void setDuration(String duration) {
    this.duration = duration;
  }

}
