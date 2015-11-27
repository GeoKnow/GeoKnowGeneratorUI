package eu.geoknow.generator.workflow.beans;

/**
 * 
 * 
 * @author alejandragarciarojas
 *
 *
 *        "multiStep_actorsex1446562308585_2" : {
            "status" : "NONE",
            "exitCode" : "NONE",
            "readCount" : "0",
            "writeCount" : "0",
            "commitCount" : "0",
            "rollbackCount" : "0",
            "duration" : "-"
        },
        
                "multiStep_actorsex1446562308585_1" : {
            "status" : "FAILED",
            "exitCode" : "FAILED",
            "id" : "29",
            "resource" : "http://generator.geoknow.eu:8080/spring-batch-admin-geoknow/jobs/executions/12/steps/29.json",
            "readCount" : "0",
            "writeCount" : "0",
            "commitCount" : "0",
            "rollbackCount" : "1",
            "duration" : "00:00:00"
        }
 */
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
    // exitDescription data is added after the POJO deserialization
    private String exitDescription;

    public StepExecution(){}
    
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

    public String getExitDescription() {
      return exitDescription;
    }

    public void setExitDescription(String exitDescription) {
      this.exitDescription = exitDescription;
    }

}
