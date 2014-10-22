package workflow.beans;

import java.util.HashMap;
import java.util.Map;

public class Jobs {

    private Map<String, Registration> registrations;
    private String resource;

    public Jobs() {
        registrations = new HashMap<String, Registration>();
    }

    public Map<String, Registration> getRegistrations() {
        return registrations;
    }

    public void setRegistrations(Map<String, Registration> registrations) {
        this.registrations = registrations;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

}
