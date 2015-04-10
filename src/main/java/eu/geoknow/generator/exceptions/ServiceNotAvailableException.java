package eu.geoknow.generator.exceptions;

/**
 * This exception is to be used when one of the 3rd party services like SBA are not available
 * 
 * @author alejandragarciarojas
 *
 */
public class ServiceNotAvailableException extends Exception {

  /**
   * 
   */
  private static final long serialVersionUID = 1L;

  public ServiceNotAvailableException(String message) {
    super(message);
  }

}
