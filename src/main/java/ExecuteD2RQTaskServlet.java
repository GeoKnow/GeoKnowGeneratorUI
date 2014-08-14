import accounts.FrameworkUserManager;
import authentication.FrameworkConfiguration;
import authentication.web.HttpRequestManager;
import util.HttpUtils;
import util.ObjectPair;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

public class ExecuteD2RQTaskServlet extends HttpServlet {
    private FrameworkUserManager frameworkUserManager;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        try {
            frameworkUserManager = FrameworkConfiguration.getInstance(getServletContext()).getFrameworkUserManager();
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doPost(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String targetUrl = req.getParameter("targetUrl");
        String frameworkUser = req.getParameter("user");
        String token = HttpUtils.getCookieValue(req, "token");

        boolean unauthorizedUser = frameworkUser==null || frameworkUser.isEmpty();

        String urlParameters = "{}";

        if (!unauthorizedUser) {
            //check token
            if (token==null)
                throw new ServletException("null token");
            boolean checkToken;
            try {
                checkToken = frameworkUserManager.checkToken(frameworkUser, token);
            } catch (Exception e) {
                throw new ServletException(e);
            }
            if (!checkToken)
                throw new ServletException("Invalid token " + token + " for user " + frameworkUser);

            //get rdf store user
            try {
                ObjectPair<String, String> rdfStoreUser = frameworkUserManager.getRdfStoreUser(frameworkUser, token);
                urlParameters = "{ \"user\":\"" + frameworkUser + "\", \"rdfStoreUser\":\"" + rdfStoreUser.getFirst() + "\", "
                                        + "\"rdfStorePassword\":\"" + rdfStoreUser.getSecond() + "\" }";
            } catch (Exception e) {
                throw new ServletException(e);
            }
        }

        //send execute task request
        URL url = new URL(targetUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setDoOutput(true);
        connection.setDoInput(true);
        connection.setInstanceFollowRedirects(false);
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("charset", "utf-8");
        connection.setUseCaches (false);
        DataOutputStream wr = new DataOutputStream(connection.getOutputStream ());
        wr.writeBytes(urlParameters);
        wr.flush();
        wr.close();
        int responseCode = connection.getResponseCode();
        String responseMessage = connection.getResponseMessage();
        BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        String inputLine;
        StringBuilder response = new StringBuilder();
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();

        resp.getWriter().print(response.toString());
    }
}
