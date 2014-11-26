package beans;

public class Component {

    private String identifier;
    private String serviceurl;
    private String user;
    private String password;

    public Component(String identifier) {
        this(identifier, null, null, null);
    }

    public Component(String identifier, String serviceurl) {
        this(identifier, serviceurl, null, null);
    }

    public Component(String identifier, String serviceurl, String user, String password) {
        this.identifier = identifier;
        this.serviceurl = serviceurl;
        this.user = user;
        this.password = password;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getServiceURL() {
        return serviceurl;
    }

    public void setServiceURL(String serviceurl) {
        this.serviceurl = serviceurl;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}
