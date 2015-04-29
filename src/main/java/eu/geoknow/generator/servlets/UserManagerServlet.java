package eu.geoknow.generator.servlets;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;

import javax.mail.MessagingException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.UserManager;
import eu.geoknow.generator.users.UserProfile;
import eu.geoknow.generator.users.UserProfileExtended;
import eu.geoknow.generator.utils.EmailSender;
import eu.geoknow.generator.utils.HttpUtils;
import eu.geoknow.generator.utils.RandomStringGenerator;


public class UserManagerServlet extends HttpServlet {
  /**
	 * 
	 */
  private static final long serialVersionUID = 1L;

  private FrameworkUserManager frameworkUserManager;

  private static final Logger log = Logger.getLogger(UserManagerServlet.class);

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
    String mode = req.getParameter("mode");

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

    // check admin rights
    boolean isAdmin;
    try {
      isAdmin = frameworkUserManager.isAdmin(userProfile.getUsername());
    } catch (Exception e) {
      throw new ServletException(e);
    }
    if (!isAdmin) {
      resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Access denied");
      return;
    }
    // throw new ServletException("Access denied");

    // actions
    if ("getProfiles".equals(mode)) {
      Collection<UserProfileExtended> userProfiles;
      try {
        userProfiles = frameworkUserManager.getAllUsersProfilesExtended();
      } catch (Exception e) {
        throw new ServletException(e);
      }
      ObjectMapper mapper = new ObjectMapper();
      String responseStr = mapper.writeValueAsString(userProfiles);
      resp.getWriter().print(responseStr);
    } else if ("create".equals(mode)) {
      String userJsonStr = req.getParameter("user");
      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(userJsonStr);
      String username = rootNode.path("profile").path("username").textValue();
      String email = rootNode.path("profile").path("email").textValue();
      Collection<String> readableGraphs = new ArrayList<String>();
      JsonNode readableGraphsNode = rootNode.path("readableGraphs");
      if (readableGraphsNode != null) {
        Iterator<JsonNode> readableGraphsIter = readableGraphsNode.elements();
        while (readableGraphsIter.hasNext())
          readableGraphs.add(readableGraphsIter.next().textValue());
      }
      Collection<String> writableGraphs = new ArrayList<String>();
      JsonNode writableGraphsNode = rootNode.path("writableGraphs");
      if (writableGraphsNode != null) {
        Iterator<JsonNode> writableGraphsIter = writableGraphsNode.elements();
        while (writableGraphsIter.hasNext())
          writableGraphs.add(writableGraphsIter.next().textValue());
      }
      String role =
          rootNode.path("profile").path("role") == null ? null : rootNode.path("profile")
              .path("role").textValue();

      // create user
      // TODO use the same name for workbench and triple store
      String password = new RandomStringGenerator().generateBasic(6);
      try {
        frameworkUserManager.createUser(username, password, email);
      } catch (Exception e) {
        throw new ServletException("Failed to create account " + username, e);
      }

      // set role
      if (role != null) {
        try {
          frameworkUserManager.setRole(username, role);
        } catch (Exception e) {
          throw new ServletException("Failed to set role " + role + " for user " + username, e);
        }
      }

      // graphs access
      try {
        setGraphsAccess(username, readableGraphs, writableGraphs);
      } catch (Exception e) {
        throw new ServletException(e);
      }

      // send email with login and password

      EmailSender emailSender = null;
      try {
        String language = req.getParameter("lang");
        if (language == null)
          language = "en";
        FrameworkConfiguration frameworkConfiguration = FrameworkConfiguration.getInstance();
        emailSender = frameworkConfiguration.getDefaultEmailSender();
        emailSender.send(email, "GeoKnow registration", "Your login: " + username + ", password: "
            + password);
      } catch (MessagingException e) {
        throw new ServletException("Failed to send email to " + email + " using " + emailSender, e);
      } catch (Exception e) {
        throw new ServletException(e);
      }
    } else if ("delete".equals(mode)) {
      String username = req.getParameter("username");
      try {
        frameworkUserManager.dropUser(username);
      } catch (Exception e) {
        throw new ServletException(e);
      }
    } else if ("update".equals(mode)) {
      String userJsonStr = req.getParameter("user");
      ObjectMapper mapper = new ObjectMapper();
      JsonNode rootNode = mapper.readTree(userJsonStr);
      String username = rootNode.path("profile").path("username").textValue();
      Collection<String> readableGraphs = new ArrayList<String>();
      Iterator<JsonNode> readableGraphsIter = rootNode.path("readableGraphs").elements();
      while (readableGraphsIter.hasNext())
        readableGraphs.add(readableGraphsIter.next().textValue());
      Collection<String> writableGraphs = new ArrayList<String>();
      Iterator<JsonNode> writableGraphsIter = rootNode.path("writableGraphs").elements();
      while (writableGraphsIter.hasNext())
        writableGraphs.add(writableGraphsIter.next().textValue());

      // graphs access
      try {
        setGraphsAccess(username, readableGraphs, writableGraphs);
      } catch (Exception e) {
        throw new ServletException(e);
      }
    } else
      throw new ServletException("Unexpected mode " + mode);
  }

  private void setGraphsAccess(String username, Collection<String> readableGraphs,
      Collection<String> writableGraphs) throws Exception {
    Collection<String> oldReadableGraphs = frameworkUserManager.getReadableGraphs(username);
    for (String g : oldReadableGraphs) {
      if (!readableGraphs.contains(g))
        frameworkUserManager.deleteRdfGraphPermissions(username, g);
    }
    for (String g : readableGraphs) {
      if (!oldReadableGraphs.contains(g))
        frameworkUserManager.setRdfGraphPermissions(username, g, UserManager.GraphPermissions.READ);
    }

    Collection<String> oldWritableGraphs = frameworkUserManager.getWritableGraphs(username);
    for (String g : oldWritableGraphs) {
      if (!writableGraphs.contains(g))
        frameworkUserManager.deleteRdfGraphPermissions(username, g);
    }
    for (String g : writableGraphs) {
      if (!oldWritableGraphs.contains(g))
        frameworkUserManager
            .setRdfGraphPermissions(username, g, UserManager.GraphPermissions.WRITE);
    }
  }
}
