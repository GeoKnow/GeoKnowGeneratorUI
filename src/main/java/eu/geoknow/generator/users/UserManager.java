package eu.geoknow.generator.users;

/**
 * Manages users operations (create, drop, etc.), users and graphs permissions
 */
public interface UserManager {
    /**
     * Creates new user
     * @param name
     *          New user name
     * @param password
     *          New user password
     * @throws Exception
     */
    public void createUser(String name, String password) throws Exception;

    /**
     * Drops existing user
     * @param name
     *          User name
     * @throws Exception
     */
    public void dropUser(String name) throws Exception;

    /**
     * Sets default permissions of the user on all graphs
     * @param user
     *          Target user
     * @param permissions
     *          Graph access permissions
     * @throws Exception
     */
    public void setDefaultRdfPermissions(String user, GraphPermissions permissions) throws Exception;

    /**
     * Sets public permissions on all graphs
     * @param permissions
     *          Graph access permissions
     * @throws Exception
     */
    public void setPublicRdfPermissions(GraphPermissions permissions) throws Exception;

    /**
     * Sets permissions of the user on specified graph
     * @param user
     *          Target user
     * @param graph
     *          Target graph
     * @param permissions
     *          Graph access permissions
     * @throws Exception
     */
    public void setRdfGraphPermissions(String user, String graph, GraphPermissions permissions) throws Exception;

    /**
     * Clear permissions of the user on specified graph
     * @param user
     *          Target user
     * @param graph
     *          Target graph
     * @throws Exception
     */
    public void deleteRdfGraphPermissions(String user, String graph) throws Exception;

    /**
     * Sets public permissions on the specified graph
     * @param graph
     *          Target graph
     * @param permissions
     *          Graph access permissions
     * @throws Exception
     */
    public void setDefaultGraphPermissions(String graph, GraphPermissions permissions) throws Exception;

    /**
     * Checks if specified user exists
     * @param username
     *          Target user
     * @param email
     *          Target user e-mail
     * @return
     *          true, if user exists,
     *          false otherwise
     * @throws Exception
     */
    public boolean checkUserExists(String username, String email) throws Exception;

    /**
     * Changes user's password
     * @param username
     *          Target user
     * @param oldPassword
     *          Old user password
     * @param newPassword
     *          New user password
     * @throws Exception
     */
    public void changePassword(String username, String oldPassword, String newPassword) throws Exception;

    /**
     * Explicitly sets a new password for specified user.
     * It allows the administrator to reset lost passwords.
     * @param username
     *          Target user name or e-mail
     * @param newPassword
     *          New password
     * @throws Exception
     */
    public void setPassword(String username, String newPassword) throws Exception;

    /**
     * Set up some default features (some specific user, for example, as SPARQL user in Virtuoso) of RDF store.
     */
    public void setup();

    /**
     * Supported graphs permissions.
     */
    public static enum GraphPermissions {
        NO,
        READ,
        WRITE,
        LIST_GRAPH_GROUP
    }
}
