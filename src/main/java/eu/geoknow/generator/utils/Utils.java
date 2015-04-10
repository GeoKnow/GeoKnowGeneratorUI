/**
 * 
 */
package eu.geoknow.generator.utils;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import org.apache.log4j.Logger;

/**
 * Store some tools to handle files and strings
 * @author mvoigt
 *
 */
public class Utils {

	private static Logger logger = Logger.getRootLogger();
	
	/**
	 * Simple method to create directories in a platform independent manner
	 * @param path dir to create
	 * @return folder path created
	 * @throws IOException
	 */
	public static String createDir(String path) throws IOException{
		logger.debug("Path to create: " + path);
		//replace "\" 
		if(path.indexOf('\\') != -1 )path.replace('\\', '/');
		File p = new File(path);
		if(p.exists()) return path;
		else if(p.mkdirs()) return path;
		else throw new IOException("Could no create path "+ path);
	}
	
	/**
	 * Convenience method which checks if a string is null or empty
	 * @param s string to check
	 * @return true if the strig is NULL or empty
	 */
	public static boolean isNullOrEmpty(String s){
		if(s == null  || s.isEmpty()) return true;
		return false;
	}

	/**
	 * Method to remove control chars from a string 
	 * @param toBeEscaped String to escape
	 * @return
	 */
	public static String removeFormattingCharacters(final String toBeEscaped) {
		StringBuffer escapedBuffer = new StringBuffer();
		for (int i = 0; i < toBeEscaped.length(); i++) {
			if ((toBeEscaped.charAt(i) != '\n')
					&& (toBeEscaped.charAt(i) != '\r')
					&& (toBeEscaped.charAt(i) != '\t')) {
				escapedBuffer.append(toBeEscaped.charAt(i));
			}
		}
		String s = escapedBuffer.toString();
		return s;//
	}

	/**
	 * Helper to get the stack trace of a exception as string
	 * @param t the exception with the stack trace
	 * @return string representation of the trace
	 */
	public static String getExceptionStackTraceAsString(Throwable t){
		StringWriter sw = new StringWriter();
		PrintWriter pw = new PrintWriter(sw);
		t.printStackTrace(pw);
		return sw.toString();
	}
	
}
