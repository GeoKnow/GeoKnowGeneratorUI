package eu.geoknow.generator.graphs.beans;

import java.util.List;

/**
 * POJO for Graphs using AccessControl and Metadata classes. Objects of this class also provide
 * implicit access rule information via owner and delegated user (URIs of user entities) attributes.
 * An owner represents the user, that told the system to create the graph and is able to change
 * metadata or dropping the graph. A delegate is a user, who has the same administrative rights as
 * the owner.
 * 
 * @author Jonas
 *
 */
public class NamedGraph {


  private String uri;
  private String owner;
  private AccessControl accessControl;
  private Graph graph;

  public NamedGraph() {

  }

  public NamedGraph(String uri, String owner, List<String> delegates, AccessControl access,
      Graph graph) {
    this.setGraph(graph);
    this.setUri(uri);
    this.setOwner(owner);
    this.setAccessControl(access);
  }

  public String getOwner() {
    return owner;
  }

  public void setOwner(String owner) {
    this.owner = owner;
  }


  public AccessControl getAccessControl() {
    return accessControl;
  }

  public void setAccessControl(AccessControl access) {
    this.accessControl = access;
  }

  public Graph getGraph() {
    return graph;
  }

  public void setGraph(Graph graph) {
    this.graph = graph;
  }

  public String getUri() {
    return uri;
  }

  public void setUri(String uri) {
    this.uri = uri;
  }


}
