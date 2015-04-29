package eu.geoknow.generator.publish;

import java.util.HashMap;

import com.hp.hpl.jena.rdf.model.Model;

import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.utils.Utils;


/**
 * Class for holding all required information to do a data publishing.
 * 
 * @author mvoigt
 *
 */
public class PublishingConfiguration {

  private String endpointUri;
  private HashMap<String, Boolean> inputGraphs;
  private String targetGraphUri;
  private boolean backupExistingData;
  private Model metaData;
  private String user;


  /**
   * Constructor to create a config with initial data.
   * 
   * @param ep SPARQL endpoint
   * @param in map with the input graphs and a flag if the service should try to drop them
   *        afterwards
   * @param target target named graph
   * @param backup should the existing data be backed and versioned
   * @param meta a Jena model with triples of meta data to add to the graph
   * @param user the logged in framework user, not the RDF store user
   * @throws InformationMissingException
   */
  public PublishingConfiguration(String ep, HashMap<String, Boolean> in, String target,
      boolean backup, Model meta, String user) throws InformationMissingException {
    if (!Utils.isNullOrEmpty(ep)) {
      this.endpointUri = ep;
    } else {
      throw new InformationMissingException("No endpoint given");
    }
    if (in != null) {
      this.inputGraphs = in;
    } else {
      throw new InformationMissingException("No input graphs given");
    }
    if (!Utils.isNullOrEmpty(target)) {
      this.targetGraphUri = target;
    } else {
      throw new InformationMissingException("No target graph given");
    }
    this.backupExistingData = backup;
    if (meta != null) {
      this.metaData = meta;
    } else {
      throw new InformationMissingException(
          "Metadata model is NULL. If no metadata available, pass an empty model");
    }
    if (!Utils.isNullOrEmpty(user)) {
      this.user = user;
    } else {
      throw new InformationMissingException("No framework user given");
    }
  }

  public String getEndpointUri() {
    return endpointUri;
  }

  public void setEndpointUri(String endpointUri) {
    this.endpointUri = endpointUri;
  }

  public HashMap<String, Boolean> getInputGraphs() {
    return inputGraphs;
  }

  public void addInputGraphs(HashMap<String, Boolean> inputGraphs) {
    this.inputGraphs.putAll(inputGraphs);
  }

  public String getTargetGraphUri() {
    return targetGraphUri;
  }

  public void setTargetGraphUri(String targetGraphUri) {
    this.targetGraphUri = targetGraphUri;
  }

  public boolean backupExistingData() {
    return backupExistingData;
  }

  public void setBackupExistingData(boolean backupExistingData) {
    this.backupExistingData = backupExistingData;
  }

  public Model getMetaData() {
    return metaData;
  }

  public void setMetaData(Model metaData) {
    this.metaData = metaData;
  }

  public String getUser() {
    return user;
  }

  public void setUser(String user) {
    this.user = user;
  }

}
