package authentication.web;

import accounts.FrameworkUserManager;
import accounts.UserProfile;
import authentication.FrameworkConfiguration;
import org.codehaus.jackson.map.ObjectMapper;
import util.EmailSender;
import util.HttpUtils;
import util.RandomStringGenerator;

import javax.mail.MessagingException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.UUID;

public class AuthenticationServlet extends HttpServlet {
    private FrameworkUserManager frameworkUserManager;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        frameworkUserManager = FrameworkConfiguration.getInstance().getFrameworkUserManager();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doGet(req, resp);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String mode = request.getParameter("mode");
        if ("login".equals(mode)) {
            String username = request.getParameter("username");
            String password = request.getParameter("password");

            // check username and password
            boolean correctCredentials = false;
            try {
                correctCredentials = frameworkUserManager.checkPassword(username, password);
            } catch (Exception e) {
                throw new ServletException("Failed to check password", e);
            }
            if (!correctCredentials)
                throw new ServletException("Invalid username or password");

            // create and save session token
            String token = UUID.randomUUID().toString();
            try {
                frameworkUserManager.saveSessionToken(username, token);
            } catch (Exception e) {
                throw new ServletException("Failed to save session token");
            }

            // get user profile
            UserProfile userProfile;
            try {
                userProfile = frameworkUserManager.getUserProfile(username);
            } catch (Exception e) {
                throw new ServletException(e);
            }

            // send request with session token and user profile
            response.addCookie(new Cookie("token", token));
            ObjectMapper objectMapper = new ObjectMapper();
            String responseStr = objectMapper.writeValueAsString(userProfile);
            response.getWriter().print(responseStr);
        } else if ("logout".equals(mode)) {
            String username = request.getParameter("username");
            //remove user session tokens
            try {
                frameworkUserManager.removeAllSessionTokens(username);
            } catch (Exception e) {
                e.printStackTrace();
                //todo
            }
            //remove session token from cookies
            Cookie tokenCookie = new Cookie("token", "");
            tokenCookie.setMaxAge(0);
        } else if ("create".equals(mode)) {
            String username = request.getParameter("username");
            String email = request.getParameter("email");

            //create user
            String password = new RandomStringGenerator().generateSimple(8);
            try {
                frameworkUserManager.createUser(username, password, email);
            } catch (Exception e) {
                throw new ServletException("Failed to create account " + username, e);
            }

            EmailSender emailSender = FrameworkConfiguration.getInstance().getDefaultEmailSender();
            try {
                emailSender.send(email, "GeoKnow registration", "Your login: " + username + ", password: " + password);
            } catch (MessagingException e) {
                throw new ServletException(e);
            }

            String responseStr = "{\"message\" : \"Your password will be sent to your e-mail address " + email + " \"}";
            response.getWriter().print(responseStr);
        } else if ("changePassword".equals(mode)) {
            String username = request.getParameter("username");
            String oldPassword = request.getParameter("oldPassword");
            String newPassword = request.getParameter("newPassword");

            //check token
            String token = HttpUtils.getCookieValue(request, "token");
            boolean valid;
            try {
                valid = frameworkUserManager.checkToken(username, token);
            } catch (Exception e) {
                throw new ServletException(e);
            }
            if (!valid)
                throw new ServletException("invalid token " + token + " for user " + username);

            //change password
            try {
                frameworkUserManager.changePassword(username, oldPassword, newPassword);
            } catch (Exception e) {
                throw new ServletException("Failed to change password", e);
            }

            String responseStr = "{\"message\" : \"Your password was changed\"}";
            response.getWriter().print(responseStr);
        } else if ("restorePassword".equals(mode)) {
            String username = request.getParameter("username");

            //get user profile
            UserProfile userProfile;
            try {
                userProfile = frameworkUserManager.getUserProfile(username);
            } catch (Exception e) {
                throw new ServletException(e);
            }
            if (userProfile==null)
                throw new ServletException("User not found");

            //change password
            String password = new RandomStringGenerator().generateSimple(8);
            try {
                frameworkUserManager.setPassword(username, password);
            } catch (Exception e) {
                throw new ServletException(e);
            }

            //send new password to user
            EmailSender emailSender = FrameworkConfiguration.getInstance().getDefaultEmailSender();
            try {
                emailSender.send(userProfile.getEmail(), "GeoKnow restore password", "Your login: " + username + ", password: " + password);
            } catch (MessagingException e) {
                throw new ServletException(e);
            }

            String responseStr = "{\"message\" : \"New password will be sent to your e-mail address " + userProfile.getEmail() + " \"}";
            response.getWriter().print(responseStr);
        } else if ("getUsers".equals(mode)) {
            Collection<UserProfile> profiles;
            try {
                profiles = frameworkUserManager.getAllUsersProfiles();
            } catch (Exception e) {
                throw new ServletException(e);
            }

            Collection<String> accounts = new ArrayList<String>();
            for (UserProfile p : profiles)
                accounts.add(p.getAccountURI());
            String responseStr = new ObjectMapper().writeValueAsString(accounts);
            response.getWriter().print(responseStr);
        } else {
            throw new ServletException("Unexpected mode: " + mode);
        }
    }
}
