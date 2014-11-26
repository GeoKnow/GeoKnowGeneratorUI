package workflow.beans;

import java.util.HashMap;
import java.util.Map;

public class JobExecutionWraper {
    private JobExecution jobExecution;
    private Map<String, String> errors;

    public JobExecutionWraper() {
        this.errors = new HashMap<String, String>();
    }

    public JobExecution getJobExecution() {
        return jobExecution;
    }

    public void setJobExecution(JobExecution jobExecution) {
        this.jobExecution = jobExecution;
    }

    public Map<String, String> getErrors() {
        return errors;
    }

    public void setErrors(Map<String, String> errors) {
        this.errors = errors;
    }

}
