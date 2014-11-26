package workflow.beans;

public class JobInstance {

    private String resource;
    private String executionCount;
    private String lastJobExecution;
    private String lastJobExecutionStatus;

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getExecutionCount() {
        return executionCount;
    }

    public void setExecutionCount(String executionCount) {
        this.executionCount = executionCount;
    }

    public String getLastJobExecution() {
        return lastJobExecution;
    }

    public void setLastJobExecution(String lastJobExecution) {
        this.lastJobExecution = lastJobExecution;
    }

    public String getLastJobExecutionStatus() {
        return lastJobExecutionStatus;
    }

    public void setLastJobExecutionStatus(String lastJobExecutionStatus) {
        this.lastJobExecutionStatus = lastJobExecutionStatus;
    }

}
