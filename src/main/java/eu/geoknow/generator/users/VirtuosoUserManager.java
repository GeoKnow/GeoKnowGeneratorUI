package eu.geoknow.generator.users;

import java.sql.*;

import org.apache.log4j.Logger;

public class VirtuosoUserManager implements UserManager {
	
	 private static final Logger log = Logger.getLogger(VirtuosoUserManager.class);
	
  private static final String jdbcDriver = "virtuoso.jdbc4.Driver";
  private String connectionString;
  private String user;
  private String password;
  private Connection connection;

  /**
   * This class manages the User creation in virtuoso for authentication and graph access control
   * 
   * @param connectionString
   *          Connection string to Virtuoso
   * @param user
   *          Virtuoso user
   * @param password
   *          Virtuoso password
   */
  public VirtuosoUserManager(String connectionString, String user, String password) {
    this.connectionString = connectionString;
    this.user = user;
    this.password = password;
  }

  @Override
  public void createUser(String name, String password) throws Exception {
    if (checkUserExists(name, null))
        throw new Exception("User " + name + " already exists");
    executeUpdate(getConnection(), "DB.DBA.USER_CREATE('" + name + "', '" + password + "')");  //NB! this function doesn't throw exception if user already exists
    // executeUpdate(getConnection(), "USER_SET_OPTION('" + name +
    // "', 'DAV_ENABLE', 1)");
    grantRole(name, "SPARQL_UPDATE");
  }

  @Override
  public void dropUser(String name) throws ClassNotFoundException, SQLException {
    executeUpdate(getConnection(), "USER_DROP('" + name + "', 1)");
  }

  private void grantRole(String user, String role) throws ClassNotFoundException, SQLException {
    executeUpdate(getConnection(), "GRANT " + role + " TO \"" + user + "\""); //NB! this function throws exception if the role is already granted
  }

  @Override
  public void setDefaultRdfPermissions(String user, GraphPermissions permissions)
          throws ClassNotFoundException, SQLException
  {
      int virtuosoPerm = convertRdfStorePermissions(permissions);
      executeUpdate(getConnection(), "DB.DBA.RDF_DEFAULT_USER_PERMS_SET ('" + user + "', " + virtuosoPerm + ")");
  }

    @Override
    public void setPublicRdfPermissions(GraphPermissions permissions) throws Exception {
        setDefaultRdfPermissions("nobody", permissions);
    }

    @Override
  public void setRdfGraphPermissions(String user, String graph, GraphPermissions permissions)
          throws ClassNotFoundException, SQLException
  {
      int virtuosoPerm = convertRdfStorePermissions(permissions);
      executeUpdate(getConnection(), "DB.DBA.RDF_GRAPH_USER_PERMS_SET ('" + graph + "', '" + user + "', " + virtuosoPerm + ")");
  }

  @Override
  public void deleteRdfGraphPermissions(String user, String graph) throws ClassNotFoundException,
      SQLException {
    executeUpdate(getConnection(), "DB.DBA.RDF_GRAPH_USER_PERMS_DEL ('" + graph + "', '" + user
        + "')");
  }

  @Override
  public void setDefaultGraphPermissions(String graph, GraphPermissions permissions)
          throws ClassNotFoundException, SQLException
  {
      int virtuosoPerm = convertRdfStorePermissions(permissions);
      executeUpdate(getConnection(), "DB.DBA.RDF_GRAPH_USER_PERMS_SET ('" + graph + "', 'nobody', " + virtuosoPerm + ")");
  }

  /**
   * This function grant L_O_LOOK in virtuoso which was required to solve the error: Virtuoso 42000
   * Error SR186: No permission to execute dpipe DB.DBA.L_O_LOOK with user ID 106, group ID 106
   * 
   * @param user
   * @throws ClassNotFoundException
   * @throws SQLException
   */
  public void grantLOLook(String user) throws ClassNotFoundException, SQLException {
    executeUpdate(getConnection(), "GRANT EXECUTE ON DB.DBA.L_O_LOOK TO \"" + user + "\"");
  }

    @Override
    public boolean checkUserExists(String username, String email) throws Exception {
        //todo is there any simpler way to check if the user exists? some function?
        String query = "select * from DB.DBA.SYS_USERS where U_NAME='" + username + "'";
        Connection conn = getConnection();
        Statement stmt = conn.createStatement();
        try {
            ResultSet resultSet = stmt.executeQuery(query);
            return resultSet.next();
        } finally {
            stmt.close();
        }
    }

    @Override
    public void changePassword(String username, String oldPassword, String newPassword) throws Exception {
        executeUpdate(getConnection(), "USER_CHANGE_PASSWORD('" + username + "', '" + oldPassword + "', '" + newPassword + "')");
    }

    @Override
    public void setPassword(String username, String newPassword) throws Exception {
        executeUpdate(getConnection(), "user_set_password('" + username + "', '" + newPassword + "')");
    }

    @Override
    public void setup() {
        try {
            grantRole("SPARQL", "SPARQL_UPDATE");
            grantLOLook("SPARQL");
        } catch (Exception e) {
            // role is already granted
            log.warn("SPARQL has already SPARQL_UPDATE rol");
            // e.printStackTrace();
        }
    }

    private Connection getConnection() throws ClassNotFoundException, SQLException {
    if (connection == null || connection.isClosed()) {
      Class.forName(jdbcDriver);
      connection = DriverManager.getConnection(connectionString, user, password);
    }
    return connection;
  }

  public void close() throws SQLException {
    if (connection != null)
      connection.close();
  }

  private void executeUpdate(Connection conn, String query) throws SQLException {
    log.info("EXECUTE: " + query);
    Statement stmt = conn.createStatement();
    try {
      stmt.executeUpdate(query);
    } finally {
      stmt.close();
    }
  }

    private int convertRdfStorePermissions(GraphPermissions permissions) {
        switch (permissions) {
            case NO: return 0;
            case READ: return 1;
            case WRITE: return 3;
            case LIST_GRAPH_GROUP: return 8;
            default: throw new IllegalArgumentException("Invalid RDF store permissions " + permissions.name());
        }
    }
}
