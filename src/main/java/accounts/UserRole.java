package accounts;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by taleksaschina on 24.06.2014.
 */
public class UserRole {
    private String uri;
    private String name;
    private List<String> services;

    public UserRole() {
        this.services = new ArrayList<String>();
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getServices() {
        return services;
    }

    public void setServices(List<String> services) {
        this.services = services;
    }
}
