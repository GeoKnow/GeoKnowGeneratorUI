package accounts;

public class UserProfile {
    private String username;
    private String settingsGraph;
    private String accountURI;
    private String email;
    private boolean admin;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getSettingsGraph() {
        return settingsGraph;
    }

    public void setSettingsGraph(String settingsGraph) {
        this.settingsGraph = settingsGraph;
    }

    public String getAccountURI() {
        return accountURI;
    }

    public void setAccountURI(String accountURI) {
        this.accountURI = accountURI;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isAdmin() {
        return admin;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }

    @Override
    public String toString() {
        return "UserProfile{" +
                "username='" + username + '\'' +
                ", settingsGraph='" + settingsGraph + '\'' +
                ", accountURI='" + accountURI + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
