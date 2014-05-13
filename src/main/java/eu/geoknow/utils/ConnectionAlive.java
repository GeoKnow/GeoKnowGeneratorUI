
// package eu.geoknow.utils;

// import java.sql.Connection;
// import java.sql.DriverManager;
// import java.sql.SQLException;
// /**
//  *
//  * @author Alegrm
//  */
//   class ConnectionAlive {

//     private String url = "jdbc:mysql://localhost:3306/database";
//     private String user = "user"; // defaultnya adalah root
//     private String pass = "****";// sesuaikan dengan konfigurasi saat install
    
//     public ConnectionAlive() {
    	
//     	Connection con = null;
        
//         try {
//             Class.forName("com.mysql.jdbc.Driver").newInstance();
//             con = (Connection) DriverManager.getConnection(url, user, pass);

//              System.out.print("connecté à la base!");
//         } catch (SQLException ex) {
//             ex.printStackTrace();
//         } catch (InstantiationException ex) {
//             ex.printStackTrace();
//         } catch (IllegalAccessException ex) {
//             ex.printStackTrace();
//         } catch (ClassNotFoundException ex) {
//             ex.printStackTrace();
//         }
//     }
//         public Connection getCon() {
//         return con;
//     }
//         public Connection crtst() {
//         return con;
//     }
// }