package eu.geoknow.generator.exceptions;

/**
 * This error will be thrown if a 3rd party service fails
 * 
 * @author alejandragarciarojas
 *
 */
public class ServiceInternalServerError extends Exception {

  private static final long serialVersionUID = 1L;

  public ServiceInternalServerError(String message) {
    super(message);
  }


}
