package accounts;

import java.util.Collection;

/**
 * Created by taleksaschina on 24.06.2014.
 */
public class UserRole {
    private String uri;
    private String name;
    private Collection<String> services;

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

    public Collection<String> getServices() {
        return services;
    }

    public void setServices(Collection<String> services) {
        this.services = services;
    }
}
