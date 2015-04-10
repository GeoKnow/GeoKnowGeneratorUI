package eu.geoknow.generator.workflow.beans;

public class StepExecution {

    private Status status;
    private Status exitCode;
    private String id;
    private String resource;
    private String readCount;
    private String writeCoun;
    private String commitCount;
    private String rollbackCount;
    private String duration;

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Status getExitCode() {
        return exitCode;
    }

    public void setExitCode(Status exitCode) {
        this.exitCode = exitCode;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getReadCount() {
        return readCount;
    }

    public void setReadCount(String readCount) {
        this.readCount = readCount;
    }

    public String getWriteCoun() {
        return writeCoun;
    }

    public void setWriteCoun(String writeCoun) {
        this.writeCoun = writeCoun;
    }

    public String getCommitCount() {
        return commitCount;
    }

    public void setCommitCount(String commitCount) {
        this.commitCount = commitCount;
    }

    public String getRollbackCount() {
        return rollbackCount;
    }

    public void setRollbackCount(String rollbackCount) {
        this.rollbackCount = rollbackCount;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

}
