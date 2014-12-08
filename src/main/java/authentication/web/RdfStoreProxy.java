package authentication.web;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.ConnectException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.WebApplicationException;

import org.apache.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;

import rdf.RdfStoreManager;
import rdf.RdfStoreManagerImpl;
import rdf.SecureRdfStoreManagerImpl;
import util.HttpUtils;
import util.JsonResponse;
import accounts.FrameworkUserManager;
import authentication.FrameworkConfiguration;

public class RdfStoreProxy extends HttpServlet {
    /**
	 * 
	 */

    private static final Logger log = Logger.getLogger(RdfStoreProxy.class);

    private static final long serialVersionUID = 1L;

    private FrameworkUserManager frameworkUserManager;
    private RdfStoreManager frameworkRdfStoreManager;

    // provides a response to the webapp with more information about errors
    JsonResponse res = new JsonResponse();
    ObjectMapper mapper = new ObjectMapper();

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        FrameworkConfiguration frameworkConf;
        try {
            // TODO: parameterize from client the to reset configuration
            frameworkConf = FrameworkConfiguration.getInstance(getServletContext());
            frameworkUserManager = frameworkConf.getFrameworkUserManager();
            frameworkRdfStoreManager = new SecureRdfStoreManagerImpl(frameworkConf
                    .getAuthSparqlEndpoint(), frameworkConf.getAuthSparqlUser(), frameworkConf
                    .getAuthSparqlPassword());
        } catch (FileNotFoundException e) {
            throw new ServletException(e.getLocalizedMessage(), e);
        } catch (Exception e) {
            throw new ServletException(e.getLocalizedMessage(), e);
        }

    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        doGet(req, resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
            IOException {
        String responseFormat = req.getParameter("format");
        String username = req.getParameter("username");
        String token = HttpUtils.getCookieValue(req, "token");
        String mode = req.getParameter("mode");
        String query = req.getParameter("query");

        log.debug("mode " + mode);
        log.debug("username " + username);

        try {
            RdfStoreManager rdfStoreManager;
            if ("settings".equals(mode)) { // framework manages settings graphs
                // (public setting for unauthorized
                // user)
                rdfStoreManager = frameworkRdfStoreManager;
            } else if (username != null && !username.isEmpty()) {
                System.out.println("username:" + username);
                boolean valid = frameworkUserManager.checkToken(username, token);
                if (!valid)
                    throw new ServletException("invalid token");
                rdfStoreManager = frameworkUserManager.getRdfStoreManager(username);
            } else {
                System.out.println("new RdfStoreManagerImpl");
                rdfStoreManager = new RdfStoreManagerImpl(FrameworkConfiguration.getInstance(
                        getServletContext()).getPublicSparqlEndpoint());
            }
            String result = rdfStoreManager.execute(query, responseFormat);
            resp.setContentType(responseFormat);
            resp.getWriter().print(result);
        } catch (ConnectException e) {
            // 503 Service Unavailable
            log.error(e);
            throw new WebApplicationException(503);
        } catch (Exception e) {
            log.error(e);
            e.printStackTrace();
            throw new WebApplicationException(500);
        }
    }
}
