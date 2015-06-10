package eu.geoknow.generator.graphs.beans;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnore;

import eu.geoknow.generator.users.UserManager.GraphPermissions;


/**
 * POJO for AccessControl Objects, used by Graph class. Objects of this class are used for explicit
 * access rule information.
 * 
 * @author Jonas
 *
 */
public class AccessControl {

  private GraphPermissions publicAccess;
  private List<String> readPermissionUsers;
  private List<String> writePermissionUsers;

  public AccessControl() {}

  public AccessControl(String publicAccess, List<String> usersRead, List<String> usersWrite) {
    setPublicAccess(publicAccess);
    setWritePermissionUsers(usersWrite);
    setReadPermissionUsers(usersRead);
  }



  private GraphPermissions parsePermissions(String permissionsStr) {
    GraphPermissions perm = null;
    if (permissionsStr != null && !permissionsStr.isEmpty()) {

      switch (permissionsStr.toLowerCase()) {

        case "n":
        case "no":
          perm = GraphPermissions.NO;
          break;
        case "r":
        case "read":
          perm = GraphPermissions.READ;
          break;
        case "w":
        case "write":
          perm = GraphPermissions.WRITE;
          break;
        default:
          perm = GraphPermissions.NO;
          break;


      }


    }
    return perm;
  }

  public GraphPermissions getPublicAccess() {
    return publicAccess;
  }

  public void setPublicAccess(Object publicAccess) {
    if (publicAccess instanceof String)
      this.publicAccess = parsePermissions(String.valueOf(publicAccess));
    if (publicAccess instanceof GraphPermissions)
      this.publicAccess = (GraphPermissions) publicAccess;
  }


  @JsonIgnore
  public Map<GraphPermissions, List<String>> getUserPermissions() {
    HashMap<GraphPermissions, List<String>> accessMap =
        new HashMap<GraphPermissions, List<String>>();
    accessMap.put(GraphPermissions.WRITE, getWritePermissionUsers());
    accessMap.put(GraphPermissions.READ, getReadPermissionUsers());
    return accessMap;
  }


  public List<String> getReadPermissionUsers() {
    if (this.readPermissionUsers == null)
      this.readPermissionUsers = new ArrayList<String>();
    return this.readPermissionUsers;
  }

  public List<String> getWritePermissionUsers() {
    if (this.writePermissionUsers == null)
      this.writePermissionUsers = new ArrayList<String>();
    return this.writePermissionUsers;
  }

  public void setReadPermissionUsers(List<String> users) {
    this.readPermissionUsers = users;
  }

  public void setWritePermissionUsers(List<String> users) {
    this.writePermissionUsers = users;
  }


  @JsonIgnore
  public void addPermissionUser(String permission, String user) {

    GraphPermissions perm = parsePermissions(permission);
    if (perm.equals(GraphPermissions.WRITE)) {
      if (writePermissionUsers == null)
        writePermissionUsers = new ArrayList<String>();
      if (!writePermissionUsers.contains(user)) {
        writePermissionUsers.add(user);
      }
    }
    if (perm.equals(GraphPermissions.READ)) {
      if (readPermissionUsers == null)
        readPermissionUsers = new ArrayList<String>();
      if (!readPermissionUsers.contains(user)) {
        readPermissionUsers.add(user);
      }
    }

  }

}
