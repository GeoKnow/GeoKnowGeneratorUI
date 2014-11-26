package workflow.beans;

import java.util.ArrayList;
import java.util.List;

public class JobExecutions {

    private List<JobExecution> jobExecutions;
    private Page page;

    public JobExecutions() {
        jobExecutions = new ArrayList<JobExecution>();
    }

    public List<JobExecution> getJobExecutions() {
        return jobExecutions;
    }

    public void setJobExecutions(List<JobExecution> jobExecutions) {
        this.jobExecutions = jobExecutions;
    }

    public Page getPage() {
        return page;
    }

    public void setPage(Page page) {
        this.page = page;
    }
}
