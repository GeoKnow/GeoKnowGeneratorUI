package workflow.beans;

import java.util.HashMap;
import java.util.Map;

public class JobExecution {

    private String resource;
    private String id;
    private String name;
    private String status;
    private String startTime;
    private String duration;
    private String exitCode;
    private String exitDescription;

    private Map<String, String> jobParameters;
    private Map<String, StepExecution> stepExecutions;

    public JobExecution() {
        setJobParameters(new HashMap<String, String>());
        stepExecutions = new HashMap<String, StepExecution>();
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getExitCode() {
        return exitCode;
    }

    public void setExitCode(String exitCode) {
        this.exitCode = exitCode;
    }

    public String getExitDescription() {
        return exitDescription;
    }

    public void setExitDescription(String exitDescription) {
        this.exitDescription = exitDescription;
    }

    public Map<String, StepExecution> getStepExecutions() {
        return stepExecutions;
    }

    public void setStepExecutions(Map<String, StepExecution> stepExecutions) {
        this.stepExecutions = stepExecutions;
    }

    public Map<String, String> getJobParameters() {
        return jobParameters;
    }

    public void setJobParameters(Map<String, String> jobParameters) {
        this.jobParameters = jobParameters;
    }

}
