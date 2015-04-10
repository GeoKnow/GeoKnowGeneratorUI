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

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.utils.HttpUtils;
import eu.geoknow.generator.utils.ObjectPair;



public class VirtuosoProxy extends HttpServlet {
  /**
	 * 
	 */
  private static final long serialVersionUID = 1L;
  private FrameworkUserManager frameworkUserManager;

  @Override
  public void init(ServletConfig config) throws ServletException {
    super.init(config);
    try {
      frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
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
    String username = req.getParameter("username");
    String token = HttpUtils.getCookieValue(req, "token");

    StringBuilder urlParameters = new StringBuilder();
    Enumeration parameterNames = req.getParameterNames();
    while (parameterNames.hasMoreElements()) {
      String pname = (String) parameterNames.nextElement();
      if ("username".equals(pname))
        continue;
      for (String pval : req.getParameterValues(pname))
        urlParameters.append("&").append(pname).append("=")
            .append(URLEncoder.encode(pval, "utf-8"));
    }
    urlParameters.replace(0, 1, "");

    try {
      ObjectPair<String, String> rdfStoreUser =
          frameworkUserManager.getRdfStoreUser(username, token);
      String result =
          HttpRequestManager.executePost(FrameworkConfiguration.getInstance()
              .getAuthSparqlEndpoint(), urlParameters.toString(), rdfStoreUser.getFirst(),
              rdfStoreUser.getSecond());
      resp.getWriter().print(result);
    } catch (Exception e) {
      throw new ServletException(e);
    }
  }
}
