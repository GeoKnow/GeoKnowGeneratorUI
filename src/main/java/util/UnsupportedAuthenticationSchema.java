package util;

public class UnsupportedAuthenticationSchema extends RuntimeException {
    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public UnsupportedAuthenticationSchema(String message) {
	super(message);
    }
}
