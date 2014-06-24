package accounts;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class VirtuosoUserManager implements UserManager {
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
  public void createUser(String name, String password) throws ClassNotFoundException, SQLException {
    executeUpdate(getConnection(), "DB.DBA.USER_CREATE('" + name + "', '" + password + "')");
    // executeUpdate(getConnection(), "USER_SET_OPTION('" + name +
    // "', 'DAV_ENABLE', 1)");
  }

  @Override
  public void dropUser(String name) throws ClassNotFoundException, SQLException {
    executeUpdate(getConnection(), "USER_DROP('" + name + "', 1)");
  }

  @Override
  public void grantRole(String user, String role) throws ClassNotFoundException, SQLException {
    executeUpdate(getConnection(), "GRANT " + role + " TO \"" + user + "\"");
  }

  @Override
  public void setDefaultRdfPermissions(String user, int permissions) throws ClassNotFoundException,
      SQLException {
    executeUpdate(getConnection(), "DB.DBA.RDF_DEFAULT_USER_PERMS_SET ('" + user + "', "
        + permissions + ")");
  }

  @Override
  public void setRdfGraphPermissions(String user, String graph, int permissions)
      throws ClassNotFoundException, SQLException {
    executeUpdate(getConnection(), "DB.DBA.RDF_GRAPH_USER_PERMS_SET ('" + graph + "', '" + user
        + "', " + permissions + ")");
  }

  @Override
  public void deleteRdfGraphPermissions(String user, String graph) throws ClassNotFoundException,
      SQLException {
    executeUpdate(getConnection(), "DB.DBA.RDF_GRAPH_USER_PERMS_DEL ('" + graph + "', '" + user
        + "')");
  }

  @Override
  public void setDefaultGraphPermissions(String graph, int permissions)
      throws ClassNotFoundException, SQLException {
    executeUpdate(getConnection(), "DB.DBA.RDF_GRAPH_USER_PERMS_SET ('" + graph + "', 'nobody', "
        + permissions + ")");
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
    executeUpdate(getConnection(), "GRANT EXECUTE ON DB.DBA.L_O_LOOK TO '" + user + "'");
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
    System.out.println("EXECUTE: " + query);
    Statement stmt = conn.createStatement();
    try {
      stmt.executeUpdate(query);
    } finally {
      stmt.close();
    }
  }
}
