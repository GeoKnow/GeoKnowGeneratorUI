/**
 * 
 */
package eu.geoknow.generator.exceptions;

/**
 * Exception that should be thrown if mandatory information during upload is missing.
 * 
 * @author mvoigt
 *
 */
public class InformationMissingException extends Exception {

  /**
	 * 
	 */
  private static final long serialVersionUID = 1L;

  /**
	 * 
	 */
  public InformationMissingException() {
    // TODO Auto-generated constructor stub
  }

  /**
   * @param arg0
   */
  public InformationMissingException(String arg0) {
    super(arg0);
    // TODO Auto-generated constructor stub
  }

  /**
   * @param arg0
   */
  public InformationMissingException(Throwable arg0) {
    super(arg0);
    // TODO Auto-generated constructor stub
  }

  /**
   * @param arg0
   * @param arg1
   */
  public InformationMissingException(String arg0, Throwable arg1) {
    super(arg0, arg1);
    // TODO Auto-generated constructor stub
  }

  /**
   * @param arg0
   * @param arg1
   * @param arg2
   * @param arg3
   */
  public InformationMissingException(String arg0, Throwable arg1, boolean arg2, boolean arg3) {
    super(arg0, arg1, arg2, arg3);
    // TODO Auto-generated constructor stub
  }

}
