package authentication.web;

import accounts.FrameworkUserManager;
import accounts.UserProfile;
import accounts.UserProfileExtended;
import authentication.FrameworkConfiguration;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import util.EmailSender;
import util.HttpUtils;
import util.RandomStringGenerator;

import javax.mail.MessagingException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;

public class UserManagerServlet extends HttpServlet {
    private FrameworkUserManager frameworkUserManager;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        frameworkUserManager = FrameworkConfiguration.getInstance(getServletContext()).getFrameworkUserManager();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doPost(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String mode = req.getParameter("mode");
        String currentUser = req.getParameter("curuser");
        String token = HttpUtils.getCookieValue(req, "token");

        //check token
        boolean correctToken;
        try {
            correctToken = frameworkUserManager.checkToken(currentUser, token);
        } catch (Exception e) {
            throw new ServletException(e);
        }
        if (!correctToken)
            throw new ServletException("Invalid token " + token + " for user " + currentUser);

        //check admin rights
        UserProfile userProfile;
        try {
            userProfile = frameworkUserManager.getUserProfile(currentUser);
        } catch (Exception e) {
            throw new ServletException(e);
        }
        if (!userProfile.isAdmin())
            throw new ServletException("Access denied");

        //actions
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
            String username = rootNode.path("profile").path("username").getTextValue();
            String email = rootNode.path("profile").path("email").getTextValue();
            Collection<String> readableGraphs = new ArrayList<String>();
            Iterator<JsonNode> readableGraphsIter = rootNode.path("readableGraphs").getElements();
            while (readableGraphsIter.hasNext())
                readableGraphs.add(readableGraphsIter.next().getTextValue());
            Collection<String> writableGraphs = new ArrayList<String>();
            Iterator<JsonNode> writableGraphsIter = rootNode.path("writableGraphs").getElements();
            while (writableGraphsIter.hasNext())
                writableGraphs.add(writableGraphsIter.next().getTextValue());

            //create user
            String password = new RandomStringGenerator().generateSimple(8);
            try {
                frameworkUserManager.createUser(username, password, email);
            } catch (Exception e) {
                throw new ServletException("Failed to create account " + username, e);
            }

            //graphs access
            try {
                setGraphsAccess(username, readableGraphs, writableGraphs);
            } catch (Exception e) {
                throw new ServletException(e);
            }

            //send email with login and password
            EmailSender emailSender = FrameworkConfiguration.getInstance(getServletContext()).getDefaultEmailSender();
            try {
                emailSender.send(email, "GeoKnow registration", "Your login: " + username + ", password: " + password);
            } catch (MessagingException e) {
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
            String username = rootNode.path("profile").path("username").getTextValue();
            Collection<String> readableGraphs = new ArrayList<String>();
            Iterator<JsonNode> readableGraphsIter = rootNode.path("readableGraphs").getElements();
            while (readableGraphsIter.hasNext())
                readableGraphs.add(readableGraphsIter.next().getTextValue());
            Collection<String> writableGraphs = new ArrayList<String>();
            Iterator<JsonNode> writableGraphsIter = rootNode.path("writableGraphs").getElements();
            while (writableGraphsIter.hasNext())
                writableGraphs.add(writableGraphsIter.next().getTextValue());

            //graphs access
            try {
                setGraphsAccess(username, readableGraphs, writableGraphs);
            } catch (Exception e) {
                throw new ServletException(e);
            }
        } else
            throw new ServletException("Unexpected mode " + mode);
    }

    private void setGraphsAccess(String username, Collection<String> readableGraphs, Collection<String> writableGraphs) throws Exception {
        Collection<String> oldReadableGraphs = frameworkUserManager.getReadableGraphs(username);
        for (String g : oldReadableGraphs) {
            if (!readableGraphs.contains(g))
                frameworkUserManager.deleteRdfGraphPermissions(username, g);
        }
        for (String g : readableGraphs) {
            if (!oldReadableGraphs.contains(g))
                frameworkUserManager.setRdfGraphPermissions(username, g, 1);
        }

        Collection<String> oldWritableGraphs = frameworkUserManager.getWritableGraphs(username);
        for (String g : oldWritableGraphs) {
            if (!writableGraphs.contains(g))
                frameworkUserManager.deleteRdfGraphPermissions(username, g);
        }
        for (String g : writableGraphs) {
            if (!oldWritableGraphs.contains(g))
                frameworkUserManager.setRdfGraphPermissions(username, g, 3);
        }
    }
}
