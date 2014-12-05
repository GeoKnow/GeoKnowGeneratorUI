package workflow.beans;

import java.util.NavigableMap;
import java.util.TreeMap;

public class Registration {

    private String name;
    private String resource;
    private String description;
    private String created;
    private int executionCount;
    private boolean launchable;
    private boolean incrementable;
    private NavigableMap<Integer, JobInstance> jobInstances;

    public Registration() {
        // use treeMap to have keys sorted
        jobInstances = new TreeMap<Integer, JobInstance>();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getExecutionCount() {
        return executionCount;
    }

    public void setExecutionCount(int executionCount) {
        this.executionCount = executionCount;
    }

    public boolean isLaunchable() {
        return launchable;
    }

    public void setLaunchable(boolean launchable) {
        this.launchable = launchable;
    }

    public boolean isIncrementable() {
        return incrementable;
    }

    public void setIncrementable(boolean incrementable) {
        this.incrementable = incrementable;
    }

    public NavigableMap<Integer, JobInstance> getJobInstances() {
        return jobInstances;
    }

    public void setJobInstances(NavigableMap<Integer, JobInstance> jobInstances) {
        this.jobInstances = jobInstances;
    }

    public String getCreated() {
        return created;
    }

    public void setCreated(String created) {
        this.created = created;
    }

}
