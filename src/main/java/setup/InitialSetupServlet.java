package setup;

import java.io.IOException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import authentication.FrameworkConfiguration;

/**
 * Created by taleksaschina on 27.06.2014.
 * 
 * This servlet initializes RDF store for framework (creates users, system
 * graphs, etc.). If it is called with parameter reset=true, than setup data
 * will be removed and created once again. If it is called with parameter
 * check==true, than it just check if the store is set up.
 * 
 * TODO: this class will be replaced by rest.WorkbenchSetup, but there are
 * several things to fix first on the front-end
 */
public class InitialSetupServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
	    throws ServletException, IOException {
	doPost(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
	    throws ServletException, IOException {
	RDFStoreSetupManager setupManager = new RDFStoreSetupManager();

	// just check if store is set up
	String check = req.getParameter("check");
	if ("true".equals(check)) {
	    boolean isSetUp = setupManager.isSetUp();
	    String respStr = "{\"setup\" : \"" + isSetUp + "\"}";
	    resp.getWriter().print(respStr);
	    return;
	}

	// get reset parameter
	String resetStr = req.getParameter("reset");
	boolean reset = resetStr == null ? false : Boolean
		.parseBoolean(resetStr);

	// already set up
	if (setupManager.isSetUp() && !reset) {
	    resp.getWriter()
		    .print("System is already set up. To reset system use parameter reset=true.");
	    return;
	}

	ServletContext context = getServletContext();
	FrameworkConfiguration frameworkConfiguration = null;
	try {
	    frameworkConfiguration = FrameworkConfiguration
		    .getInstance(context);
	} catch (Exception e) {
	    throw new ServletException("Failed to get framework configuration",
		    e);
	}
	try {
	    setupManager.setUp(frameworkConfiguration, reset);
	} catch (Exception e) {
	    throw new ServletException(e);
	}
	resp.getWriter().print("System was set up successfully.");
    }
}
