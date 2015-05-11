package eu.geoknow.generator.users;

import java.util.ArrayList;
import java.util.Collection;

import org.codehaus.jackson.annotate.JsonIgnore;

/**
 * 
 * @author taleksaschina created on 24.06.2014.
 * @author alejandragarciarojas added RoleType
 *
 */
public class UserRole {
  private String uri;
  private String name;
  private Collection<String> services;
  @JsonIgnore
  private boolean isDefault;
  @JsonIgnore
  private boolean isNotLoggedIn;

  public UserRole() {
    services = new ArrayList<String>();
    isDefault = false;
    isNotLoggedIn = false;
  }

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

  public boolean isDefault() {
    return isDefault;
  }

  public void setIsDefault(boolean isDefault) {
    this.isDefault = isDefault;
  }

  public boolean isNotLoggedIn() {
    return isNotLoggedIn;
  }

  public void setIsNotLoggedIn(boolean isNotLoggedIn) {
    this.isNotLoggedIn = isNotLoggedIn;
  }

  public Collection<String> getServices() {
    return services;
  }

  public void setServices(Collection<String> services) {
    this.services = services;
  }
}
