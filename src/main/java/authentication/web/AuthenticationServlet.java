package authentication.web;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.UUID;

import javax.mail.MessagingException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;

import util.EmailSender;
import util.HttpUtils;
import util.RandomStringGenerator;
import accounts.FrameworkUserManager;
import accounts.UserProfile;
import authentication.FrameworkConfiguration;

/**
 * Servlet provides some authentication functions: login, logout, register new user, restore password, change password.
 *
 * For some types of errors it sends error code and description in response.
 * In these cases response has json format: {code : ERROR_CODE, message : ERROR_DESCRIPTION}.
 *
 * Error codes:
 * 1 - user already exists (during user registration, user with the same name or e-mail already exists)
 */
public class AuthenticationServlet extends HttpServlet {
  /**
   * 
   */
  private static final long serialVersionUID = 1L;
  private FrameworkUserManager frameworkUserManager;

  @Override
  public void init(ServletConfig config) throws ServletException {
    super.init(config);
    try {
      frameworkUserManager = FrameworkConfiguration.getInstance(getServletContext())
          .getFrameworkUserManager();
    } catch (FileNotFoundException e) {
      throw new ServletException(e);
    } catch (Exception e) {
      throw new ServletException(e);
    }

  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
      IOException {
    doGet(req, resp);
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String mode = request.getParameter("mode");

    PrintWriter out = response.getWriter();

    if ("login".equals(mode)) {
      String username = request.getParameter("username");
      String password = request.getParameter("password");

      // check username and password
      boolean correctCredentials = false;
      try {
        correctCredentials = frameworkUserManager.checkPassword(username, password);
      } catch (Exception e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        return;
      }

      if (!correctCredentials) {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        return;
      }

      // create and save session token
      String token = UUID.randomUUID().toString();
      try {
        frameworkUserManager.saveSessionToken(username, token);
      } catch (Exception e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        return;
      }

      // get user profile
      UserProfile userProfile;
      try {
        userProfile = frameworkUserManager.getUserProfile(username);
        // send request with session token and user profile
        response.addCookie(new Cookie("token", token));
        ObjectMapper objectMapper = new ObjectMapper();
        String responseStr = objectMapper.writeValueAsString(userProfile);
        out.print(responseStr);

      } catch (Exception e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        return;
      }

    } else if ("logout".equals(mode)) {
      String username = request.getParameter("username");
      // remove user session tokens
      try {
        frameworkUserManager.removeAllSessionTokens(username);
        // remove session token from cookies
        Cookie tokenCookie = new Cookie("token", "");
        tokenCookie.setMaxAge(0);

      } catch (Exception e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
      }

    } else if ("create".equals(mode)) {

      String username = request.getParameter("username");
      String email = request.getParameter("email");
      //check if user already exists
      boolean userExists = false;
      try {
          userExists = frameworkUserManager.checkUserExists(username, email);
      } catch (Exception e) {
          e.printStackTrace();
      }
      if (userExists) {
          response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
          out.print("{\"code\" : \"1\", \"message\" : \"User already exists\"}");
          return;
      }
      // create user
      String password = new RandomStringGenerator().generateBasic(6);
      try {
        frameworkUserManager.createUser(username, password, email);

        EmailSender emailSender = FrameworkConfiguration.getInstance(getServletContext())
            .getDefaultEmailSender();

        emailSender.send(email, "GeoKnow registration", "Your login: " + username + ", password: "
            + password);
        String responseStr = "{\"message\" : \"Your password will be sent to your e-mail address "
            + email + " \"}";
        response.getWriter().print(responseStr);

      } catch (MessagingException e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
      } catch (Exception e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
      }

    } else if ("changePassword".equals(mode)) {
      String username = request.getParameter("username");
      String oldPassword = request.getParameter("oldPassword");
      String newPassword = request.getParameter("newPassword");

      // check token
      String token = HttpUtils.getCookieValue(request, "token");
      boolean valid;
      try {
        valid = frameworkUserManager.checkToken(username, token);
        if (!valid)
          response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "invalid token " + token
              + " for user " + username);
        else {
          // change password
          frameworkUserManager.changePassword(username, oldPassword, newPassword);

            // send new password to user
            UserProfile userProfile = frameworkUserManager.getUserProfile(username);
            if (userProfile == null) {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "User profile " + username + " not found");
                return;
            }
            EmailSender emailSender = FrameworkConfiguration.getInstance(getServletContext()).getDefaultEmailSender();
            emailSender.send(userProfile.getEmail(), "GeoKnow change password", "Your password was changed. Your login: " + username + ", new password: " + newPassword);

          String responseStr = "{\"message\" : \"Your password was changed\"}";
          response.getWriter().print(responseStr);
        }
      } catch (Exception e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
      }

    } else if ("restorePassword".equals(mode)) {
      String username = request.getParameter("username");

      // get user profile
      UserProfile userProfile;
      try {
        userProfile = frameworkUserManager.getUserProfile(username);
        if (userProfile == null) {
          response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "User profile "
              + username + " not found");
        }
        // change password
        String password = new RandomStringGenerator().generateBasic(6);
        frameworkUserManager.setPassword(username, password);

        // send new password to user
        EmailSender emailSender = FrameworkConfiguration.getInstance(getServletContext())
            .getDefaultEmailSender();
        emailSender.send(userProfile.getEmail(), "GeoKnow restore password", "Your login: "
            + username + ", password: " + password);
        String responseStr = "{\"message\" : \"New password will be sent to your e-mail address "
            + userProfile.getEmail() + " \"}";
        response.getWriter().print(responseStr);

      } catch (MessagingException e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
      } catch (Exception e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
      }

    } else if ("getUsers".equals(mode)) {
      Collection<UserProfile> profiles;
      try {
        profiles = frameworkUserManager.getAllUsersProfiles();
      } catch (Exception e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        return;
      }

      Collection<String> accounts = new ArrayList<String>();
      for (UserProfile p : profiles)
        accounts.add(p.getAccountURI());
      String responseStr = new ObjectMapper().writeValueAsString(accounts);
      response.getWriter().print(responseStr);
    } else {
      // throw new ServletException("Unexpected mode: " + mode);
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unexpected mode: " + mode);

    }
  }
}
