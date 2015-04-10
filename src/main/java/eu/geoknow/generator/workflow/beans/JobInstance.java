package eu.geoknow.generator.workflow.beans;

public class JobInstance {

  private int id;
  private String jobName;
  private JobExecutions jobExecutions;

  public JobInstance(int id, String jobName, JobExecutions jobExecutions) {
    this.id = id;
    this.jobName = jobName;
    this.jobExecutions = jobExecutions;
  }

  public JobInstance() {}

  public int getId() {
    return id;
  }

  public void setId(int id) {
    this.id = id;
  }

  public String getJobName() {
    return jobName;
  }

  public void setJobName(String jobName) {
    this.jobName = jobName;
  }

  public JobExecutions getJobExecutions() {
    return jobExecutions;
  }

  public void setJobExecutions(JobExecutions jobExecutions) {
    this.jobExecutions = jobExecutions;
  }



}
