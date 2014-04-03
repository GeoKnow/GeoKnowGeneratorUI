package rdf;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class VirtuosoGraphGroupManager {
    private static final String jdbcDriver = "virtuoso.jdbc4.Driver";
    private String connectionString;
    private String user;
    private String password;
    private Connection connection;

    public VirtuosoGraphGroupManager(String connectionString, String user, String password) {
        this.connectionString = connectionString;
        this.user = user;
        this.password = password;
    }

    public void createGraphGroup(String group) throws Exception {
        executeUpdate(getConnection(), "DB.DBA.RDF_GRAPH_GROUP_CREATE('" + group + "', 0)");
    }

    public void addGraph(String group, String graph) throws Exception {
        executeUpdate(getConnection(), "DB.DBA.RDF_GRAPH_GROUP_INS('" + group + "', '" + graph + "')");
    }

    public void removeGraph(String group, String graph) throws Exception {
        executeUpdate(getConnection(), "DB.DBA.RDF_GRAPH_GROUP_DEL('" + group + "', '" + graph + "')");
    }

    public void dropGroup(String group) throws Exception {
        executeUpdate(getConnection(), "DB.DBA.RDF_GRAPH_GROUP_DROP('" + group + "', 1)");
    }

    private Connection getConnection() throws ClassNotFoundException, SQLException {
        if (connection==null || connection.isClosed()) {
            Class.forName(jdbcDriver);
            connection = DriverManager.getConnection(connectionString, user, password);
        }
        return connection;
    }

    public void close() throws SQLException {
        if (connection!=null)
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
