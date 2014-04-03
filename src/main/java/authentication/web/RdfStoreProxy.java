package authentication.web;

import accounts.FrameworkUserManager;
import authentication.FrameworkConfiguration;
import rdf.RdfStoreManager;
import rdf.RdfStoreManagerImpl;
import rdf.SecureRdfStoreManagerImpl;
import util.HttpUtils;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class RdfStoreProxy extends HttpServlet {
    private FrameworkUserManager frameworkUserManager;
    private RdfStoreManager frameworkRdfStoreManager;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        FrameworkConfiguration frameworkConf = FrameworkConfiguration.getInstance();
        frameworkUserManager = frameworkConf.getFrameworkUserManager();
        frameworkRdfStoreManager = new SecureRdfStoreManagerImpl(frameworkConf.getSparqlEndpoint(),
                frameworkConf.getSparqlFrameworkLogin(), frameworkConf.getSparqlFrameworkPassword());
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doGet(req, resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String responseFormat = req.getParameter("format");
        String username = req.getParameter("username");
        String token = HttpUtils.getCookieValue(req, "token");
        String mode = req.getParameter("mode");
        String query = req.getParameter("query");

        try {
            RdfStoreManager rdfStoreManager;
            if ("settings".equals(mode)) { // framework manages settings graphs (public setting for unauthorized user)
                rdfStoreManager = frameworkRdfStoreManager;
            } else if (username!=null && !username.isEmpty()) {
                boolean valid = frameworkUserManager.checkToken(username, token);
                if (!valid)
                    throw new ServletException("invalid token");
                rdfStoreManager = frameworkUserManager.getRdfStoreManager(username);
            } else {
                rdfStoreManager = new RdfStoreManagerImpl(FrameworkConfiguration.getInstance().getPublicSparqlEndpoint());
            }
            String result = rdfStoreManager.execute(query, responseFormat);
            resp.setContentType(responseFormat);
            resp.getWriter().print(result);
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }
}
