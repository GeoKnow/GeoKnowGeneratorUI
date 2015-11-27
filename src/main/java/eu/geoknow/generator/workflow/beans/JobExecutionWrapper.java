package eu.geoknow.generator.workflow.beans;

import java.util.HashMap;
import java.util.Map;

public class JobExecutionWrapper {
  private JobExecution jobExecution;
  private Map<String, StepExecutionDetail> errors;

  private String page;

  public JobExecutionWrapper() {
    this.errors = new HashMap<String, StepExecutionDetail>();
  }

  public JobExecution getJobExecution() {
    return jobExecution;
  }

  public void setJobExecution(JobExecution jobExecution) {
    this.jobExecution = jobExecution;
  }

  public Map<String, StepExecutionDetail> getErrors() {
    return errors;
  }

  public void setErrors(Map<String, StepExecutionDetail> errors) {
    this.errors = errors;
  }

  public String getPage() {
    return page;
  }

  public void setPage(String page) {
    this.page = page;
  }


}
