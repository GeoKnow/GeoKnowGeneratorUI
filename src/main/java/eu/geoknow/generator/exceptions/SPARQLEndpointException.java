/**
 * 
 */
package eu.geoknow.generator.exceptions;

/**
 * Exception is thrown if something went wrong in the communicatin with the SPARQL endpoint (or the database connection).
 * @author mvoigt
 *
 */
public class SPARQLEndpointException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = -4640931511117987722L;

	/**
	 * 
	 */
	public SPARQLEndpointException() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * @param message
	 */
	public SPARQLEndpointException(String message) {
		super(message);
		// TODO Auto-generated constructor stub
	}

	/**
	 * @param cause
	 */
	public SPARQLEndpointException(Throwable cause) {
		super(cause);
		// TODO Auto-generated constructor stub
	}

	/**
	 * @param message
	 * @param cause
	 */
	public SPARQLEndpointException(String message, Throwable cause) {
		super(message, cause);
		// TODO Auto-generated constructor stub
	}

	/**
	 * @param message
	 * @param cause
	 * @param enableSuppression
	 * @param writableStackTrace
	 */
	public SPARQLEndpointException(String message, Throwable cause,
			boolean enableSuppression, boolean writableStackTrace) {
		super(message, cause, enableSuppression, writableStackTrace);
		// TODO Auto-generated constructor stub
	}

}
