package eu.geoknow.generator.workflow.beans;

/**
 * 
 * These objects holds more detail about each step execution, we are mainly interested in the
 * exitDescription
 * 
 * @author alejandragarciarojas
 * 
 *
 */
public class StepJobExecution {

  private StepExecutionDetail stepExecution;
  private JobExecutionStep jobExecution;

  public StepExecutionDetail getStepExecution() {
    return stepExecution;
  }

  public void setStepExecution(StepExecutionDetail stepExecution) {
    this.stepExecution = stepExecution;
  }

  public JobExecutionStep getJobExecution() {
    return jobExecution;
  }

  public void setJobExecution(JobExecutionStep jobExecution) {
    this.jobExecution = jobExecution;
  }
}
