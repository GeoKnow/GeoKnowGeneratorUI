package eu.geoknow.generator.servlets;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.Enumeration;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.rdf.HttpRequestManager;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.PasswordStore;
import eu.geoknow.generator.users.UserProfile;
import eu.geoknow.generator.utils.HttpUtils;

public class VirtuosoProxy extends HttpServlet {
  /**
     * 
     */

  private static final Logger log = Logger.getLogger(VirtuosoProxy.class);

  private static final long serialVersionUID = 1L;

  private static FrameworkUserManager frameworkUserManager;

  @Override
  public void init(ServletConfig config) throws ServletException {
    super.init(config);
    try {

      FrameworkConfiguration frameworkConfig = FrameworkConfiguration.getInstance();
      frameworkUserManager = frameworkConfig.getFrameworkUserManager();

    } catch (FileNotFoundException e) {
      throw new ServletException(e);
    } catch (Exception e) {
      throw new ServletException(e);
    }
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
      IOException {
    doPost(req, resp);
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
      IOException {
    String user = HttpUtils.getCookieValue(req, "user");
    String token = HttpUtils.getCookieValue(req, "token");

    UserProfile userProfile = null;
    try {
      userProfile = frameworkUserManager.validate(user, token);
      if (userProfile == null) {
        resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid credentials");
        return;
      }
      log.info(" user: " + userProfile.getUsername());
    } catch (Exception e) {
      e.printStackTrace();
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
      return;

    }

    StringBuilder urlParameters = new StringBuilder();
    Enumeration parameterNames = req.getParameterNames();
    while (parameterNames.hasMoreElements()) {
      String pname = (String) parameterNames.nextElement();
      for (String pval : req.getParameterValues(pname))
        urlParameters.append("&").append(pname).append("=")
            .append(URLEncoder.encode(pval, "utf-8"));
    }
    urlParameters.replace(0, 1, "");

    try {
      String result =
          HttpRequestManager.executePost(FrameworkConfiguration.getInstance()
              .getAuthSparqlEndpoint(), urlParameters.toString(), userProfile.getUsername(),
              PasswordStore.getPassword(userProfile.getUsername()));
      resp.getWriter().print(result);
    } catch (Exception e) {
      e.printStackTrace();
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
      return;
    }
  }
}
