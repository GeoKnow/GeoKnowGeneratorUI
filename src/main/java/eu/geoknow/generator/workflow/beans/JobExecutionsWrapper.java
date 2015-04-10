package eu.geoknow.generator.workflow.beans;


public class JobExecutionsWrapper {
  private JobExecutions jobExecutions;
  private Page page;


  public JobExecutionsWrapper() {
  }

  public JobExecutions getJobExecutions() {
    return jobExecutions;
  }

  public void setJobExecutions(JobExecutions jobExecutions) {
    this.jobExecutions = jobExecutions;
  }

  public Page getPage() {
    return page;
  }

  public void setPage(Page page) {
    this.page = page;
  }

  
}
