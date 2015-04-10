package eu.geoknow.generator.workflow.beans;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JobExecutions {

  // @JsonIgnore
  private List<JobExecution> jobExecutions;

  public JobExecutions() {
    jobExecutions = new ArrayList<JobExecution>();
  }

  @JsonAnySetter
  public void setDynamicProperty(String name, Object exec) {
    // convert map to execution
    ObjectMapper mapper = new ObjectMapper();
    jobExecutions.add(mapper.convertValue(exec, JobExecution.class));
  }

  public List<JobExecution> getJobExecutions() {
    return jobExecutions;
  }

  public void setJobExecutionsList(List<JobExecution> jobExecutions) {
    this.jobExecutions = jobExecutions;
  }

}
