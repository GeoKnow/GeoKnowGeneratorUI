package accounts;

public interface UserManager {
    public void createUser(String name, String password) throws Exception;
    public void dropUser(String name) throws Exception;
    public void grantRole(String user, String role) throws Exception;
    public void setDefaultRdfPermissions(String user, int permissions) throws Exception;
    public void setRdfGraphPermissions(String user, String graph, int permissions) throws Exception;
    public void deleteRdfGraphPermissions(String user, String graph) throws Exception;
    public void setDefaultGraphPermissions(String graph, int permissions) throws Exception;
}
