package eu.geoknow.generator.servlets;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.UUID;

import javax.mail.MessagingException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;

import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.users.FrameworkUserManager;
import eu.geoknow.generator.users.PasswordStore;
import eu.geoknow.generator.users.RoleType;
import eu.geoknow.generator.users.UserProfile;
import eu.geoknow.generator.utils.EmailSender;
import eu.geoknow.generator.utils.HttpUtils;
import eu.geoknow.generator.utils.RandomStringGenerator;

/**
 * Servlet provides some authentication functions: login, logout, register new user, restore
 * password, change password.
 * 
 * For some types of errors it sends error code and description in response. In these cases response
 * has json format: {code : ERROR_CODE, message : ERROR_DESCRIPTION}.
 * 
 * Error codes: 1 - user already exists (during user registration, user with the same name or e-mail
 * already exists) 2 - incorrect old password (change password) 3 - user doesn't exists (in restore
 * password)
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
      frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
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
        if (username != null && !username.isEmpty())
          correctCredentials = frameworkUserManager.checkPassword(username, password);
      } catch (Exception e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        return;
      }

      if (!correctCredentials) {
        response.sendError(HttpServletResponse.SC_OK);
        return;
      }

      // save user's password in password store
      PasswordStore.put(username, password);

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

        ObjectMapper objectMapper = new ObjectMapper();
        String responseStr = objectMapper.writeValueAsString(userProfile);

        response.addCookie(new Cookie("token", token));
        response.addCookie(new Cookie("user", URLEncoder.encode(responseStr, "utf-8")));
        response.setHeader("content-type", "application/json");
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
        if (username != null && !username.isEmpty())
          frameworkUserManager.removeAllSessionTokens(username);
        // remove session token from cookies
        Cookie tokenCookie = new Cookie("token", "");
        Cookie userCookie = new Cookie("user", "");
        tokenCookie.setMaxAge(0);
        userCookie.setMaxAge(0);

      } catch (Exception e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
      }

    } else if ("create".equals(mode)) {

      String username = request.getParameter("username");
      String emailTo = request.getParameter("email");
      // check if user already exists
      boolean userExists = false;
      try {
        userExists = frameworkUserManager.checkUserExists(username, emailTo);
      } catch (Exception e) {
        e.printStackTrace();
      }
      if (userExists) {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        response.setHeader("content-type", "application/json");
        out.print("{\"code\" : \"1\", \"message\" : \"User already exists\"}");
        return;
      }
      // create user
      String password = new RandomStringGenerator().generateBasic(6);

      try {
        frameworkUserManager.createUser(username, password, emailTo);


        EmailSender emailSender = FrameworkConfiguration.getInstance().getDefaultEmailSender();
        emailSender.send(emailTo, "GeoKnow registration", "Your login: " + username
            + ", password: " + password);
        String responseStr =
            "{\"message\" : \"Your password will be sent to your e-mail address " + emailTo
                + " \"}";
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
        if (!valid) {
          response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "invalid token " + token
              + " for user " + username);
        } else {
          // check old password
          boolean isCorrect = frameworkUserManager.checkPassword(username, oldPassword);
          if (!isCorrect) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.print("{\"code\" : \"2\", \"message\" : \"Incorrect old password\"}");
            return;
          }

          // change password
          frameworkUserManager.changePassword(username, oldPassword, newPassword);

          // send new password to user
          UserProfile userProfile = frameworkUserManager.getUserProfile(username);
          if (userProfile == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "User profile " + username
                + " not found");
            return;
          }
          FrameworkConfiguration frameworkConfiguration = FrameworkConfiguration.getInstance();
          EmailSender emailSender = frameworkConfiguration.getDefaultEmailSender();
          emailSender.send(userProfile.getEmail(), "GeoKnow change password",
              "Your password was changed. Your login: " + username + ", new password: "
                  + newPassword);

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
          response.setStatus(HttpServletResponse.SC_NOT_FOUND);
          out.print("{\"code\" : \"3\", \"message\" : \"User doesn't exists\"}");
          return;
        }
        // change password
        String password = new RandomStringGenerator().generateBasic(6);
        frameworkUserManager.setPassword(username, password);

        // send new password to user
        FrameworkConfiguration frameworkConfiguration = FrameworkConfiguration.getInstance();
        EmailSender emailSender = frameworkConfiguration.getDefaultEmailSender();
        emailSender.send(userProfile.getEmail(), "GeoKnow registration", "Your login: " + username
            + ", password: " + password);
        String responseStr =
            "{\"message\" : \"Your password will be sent to your e-mail address "
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

      } else if ("demo_start".equals(mode)) {
        
        long now = new Date().getTime();
        int rnd = (int) (((Math.random()) * 100) + 1);
        String value = String.valueOf(rnd)+String.valueOf(now).substring(String.valueOf(now).length()-4);
        String username = "demo"+value;
        String emailTo = username+"@demogenerator.geoknow.eu";
        
     // check if user already exists
        boolean userExists = false;
        try {
          userExists = frameworkUserManager.checkUserExists(username, emailTo);
        } catch (Exception e) {
          e.printStackTrace();
        }
        if (userExists) {
          int rnd2 = (int) (((Math.random()) * 100) + 1);
          username = username+String.valueOf(rnd2);
          emailTo = username+"@demogenerator.geoknow.eu";
        }
        // create user
        String password = new RandomStringGenerator().generateBasic(6);

        try {
          frameworkUserManager.createUser(username, password, emailTo);
          frameworkUserManager.setRole(username, "http://generator.geoknow.eu/resource/BasicUser");

          
          String responseStr =
                  "{\"username\" : \"" + username + "\","
                  + "\"password\" : \"" + password + "\","
                  + "\"email\" : \"" + emailTo + "\"}";
          response.getWriter().print(responseStr);

        } catch (MessagingException e) {
          e.printStackTrace();
          response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        } catch (Exception e) {
          e.printStackTrace();
          response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
        
      

      } else if ("demo_end".equals(mode)) {
        
        
        String username = request.getParameter("username");
        // remove user session tokens
        try {
          if (username != null && !username.isEmpty())
            //frameworkUserManager.removeAllSessionTokens(username);
          frameworkUserManager.dropUser(username);
          // remove session token from cookies
          Cookie tokenCookie = new Cookie("token", "");
          Cookie userCookie = new Cookie("user", "");
          tokenCookie.setMaxAge(0);
          userCookie.setMaxAge(0);

        } catch (Exception e) {
          e.printStackTrace();
          response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
        
       

     } else {

      // throw new ServletException("Unexpected mode: " + mode);
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unexpected mode: " + mode);

    }
  }
}
