package authentication.web;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.util.List;

import javax.xml.ws.http.HTTPException;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.log4j.Logger;

public class HttpRequestManager {

    private static final Logger log = Logger.getLogger(HttpRequestManager.class);

    public static String executePost(String url, String urlParameters) throws Exception {
        HttpURLConnection connection = sendPost(url, urlParameters);
        int responseCode = connection.getResponseCode();
        switch (responseCode) {
        case 200:
            return readResult(connection);
        default:
            log.error(connection.getResponseCode() + "\n\t " + connection.getResponseMessage()
                    + "\n\t url:" + url + "\n\t params:"
                    + URLDecoder.decode(urlParameters, "UTF-8"));
            throw new HTTPException(responseCode);
        }
    }

    public static String executePost(String url, String urlParameters, String username,
            String password) throws Exception {
        // TODO: May be try to do Authorized post by default first ??? to avoid
        // doing two queries? are all the queries made by the generator will use
        // the
        // generator user?
        HttpURLConnection connection = sendPost(url, urlParameters);
        int responseCode = connection.getResponseCode();
        String decodedUrlParameters = URLDecoder.decode(urlParameters, "UTF-8");
        switch (responseCode) {
        case 200:
            return readResult(connection);
        case 401: // unauthorized
            log.debug("401 : Retry with authentication header with user:" + username);
            WWWAuthenticateHeader wwwAuthenticateHeader = getWWWAuthenticationHeader(connection);
            if (wwwAuthenticateHeader.isDigest()) {
                // send authorized request
                connection = sendAuthorizedPost(url, urlParameters, wwwAuthenticateHeader,
                        username, password);
                responseCode = connection.getResponseCode();
                switch (responseCode) {
                case 200:
                    return readResult(connection);
                case 400: // bad request
                    log.error(connection.getResponseCode() + "\n\t "
                            + connection.getResponseMessage() + "\n\t url:" + url + "\n\t params:"
                            + decodedUrlParameters);
                    throw new HTTPException(responseCode);
                default:
                    log.error(connection.getResponseCode() + "\n\t "
                            + connection.getResponseMessage() + "\n\t url:" + url + "\n\t params:"
                            + decodedUrlParameters);
                    throw new HTTPException(responseCode);
                }
            } else
                throw new Exception("Unsupported authentication type: "
                        + wwwAuthenticateHeader.getAuthenticationScheme());
        case 400: // bad request
            log.error(connection.getResponseCode() + "\n\t " + connection.getResponseMessage()
                    + "\n\t url:" + url + "\n\t params:" + decodedUrlParameters);
            throw new HTTPException(responseCode);
        default:
            log.error(connection.getResponseCode() + "\n\t " + connection.getResponseMessage()
                    + "\n\t url:" + url + "\n\t params:" + decodedUrlParameters);

            throw new HTTPException(responseCode);
        }

    }

    private static HttpURLConnection sendPost(String url, String urlParameters) throws IOException {
        // TODO: catch TimeOut exception java.net.ConnectException: Operation
        // timed out
        log.debug("Execute normal POST to " + url);
        URL targetURL = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) targetURL.openConnection();
        connection.setDoOutput(true);
        connection.setDoInput(true);
        connection.setInstanceFollowRedirects(false);
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        connection.setRequestProperty("charset", "utf-8");
        connection.setRequestProperty("Content-Length", ""
                + Integer.toString(urlParameters.getBytes().length));
        connection.setUseCaches(false);
        DataOutputStream wr = new DataOutputStream(connection.getOutputStream());
        wr.writeBytes(urlParameters);
        wr.flush();
        wr.close();
        return connection;
    }

    private static HttpURLConnection sendAuthorizedPost(String url, String urlParameters,
            WWWAuthenticateHeader wwwAuthenticateHeader, String username, String password)
            throws Exception {
        log.debug("Execute authorized POST to " + url);
        URL targetURL = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) targetURL.openConnection();
        connection.setDoOutput(true);
        connection.setDoInput(true);
        connection.setInstanceFollowRedirects(false);
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        connection.setRequestProperty("charset", "utf-8");
        connection.setRequestProperty("Content-Length", ""
                + Integer.toString(urlParameters.getBytes().length));
        connection.setUseCaches(false);
        connection.setRequestProperty("Authorization", getDigestAuthorizationProperty(url,
                wwwAuthenticateHeader, username, password, "POST"));
        DataOutputStream wr = new DataOutputStream(connection.getOutputStream());
        wr.writeBytes(urlParameters);
        wr.flush();
        wr.close();
        return connection;
    }

    private static WWWAuthenticateHeader getWWWAuthenticationHeader(HttpURLConnection connection) {
        List<String> authenticateParams = connection.getHeaderFields().get("WWW-Authenticate");

        if (authenticateParams == null) {
            log.debug("Autenticate params is null");
            return null;
        }

        WWWAuthenticateHeader wwwAuthenticateHeader = new WWWAuthenticateHeader();
        for (String s : authenticateParams) {
            String[] fields = s.split(",");
            for (String f : fields) {
                String[] pair = f.trim().split("=");
                String paramName = pair[0].trim();
                String paramValue = pair[1].trim();
                if (paramValue.startsWith("\"") && paramValue.endsWith("\""))
                    paramValue = paramValue.substring(1, paramValue.length() - 1);
                if (paramName.startsWith("Digest")) {
                    wwwAuthenticateHeader.setAuthenticationScheme("digest");
                    paramName = paramName.substring("Digest".length()).trim();
                }
                wwwAuthenticateHeader.set(paramName, paramValue);
            }
        }
        return wwwAuthenticateHeader;
    }

    private static String getDigestAuthorizationProperty(String endpoint,
            WWWAuthenticateHeader wwwAuthenticateHeader, String username, String password,
            String requestMethod) throws Exception {
        if (!wwwAuthenticateHeader.isDigest())
            throw new Exception("Unexpected authentication scheme "
                    + wwwAuthenticateHeader.getAuthenticationScheme() + ", Digest expected");
        String nc = "00000001";
        String cnonce = DigestUtils.md5Hex(Long.toString(System.currentTimeMillis()));
        String a1 = DigestUtils.md5Hex(username + ":" + wwwAuthenticateHeader.getRealm() + ":"
                + password);
        String a2 = DigestUtils.md5Hex(requestMethod + ":" + endpoint);
        String hash = DigestUtils.md5Hex(a1 + ":" + wwwAuthenticateHeader.getNonce() + ":" + nc
                + ":" + cnonce + ":" + wwwAuthenticateHeader.getQop() + ":" + a2);

        return "Digest username=\"" + username + "\"" + ", realm="
                + wwwAuthenticateHeader.getRealm() + ", nonce=" + wwwAuthenticateHeader.getNonce()
                + ", uri=" + endpoint + ", response=" + hash + ", opaque="
                + wwwAuthenticateHeader.getOpaque() + ", qop=" + wwwAuthenticateHeader.getQop()
                + ", nc=" + nc + ", cnonce=" + cnonce;
    }

    private static String readResult(HttpURLConnection connection) throws IOException {

        log.debug("Response Code : " + connection.getResponseCode());
        log.debug("Response Message : " + connection.getResponseMessage());

        BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        String inputLine;
        StringBuilder response = new StringBuilder();
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine).append("\n");
        }
        in.close();
        return response.toString();
    }

    public static class WWWAuthenticateHeader {
        private String realm;
        private String domain;
        private String nonce;
        private String opaque;
        private String stale;
        private String qop;
        private String algorithm;
        private String authenticationScheme;

        public void set(String paramName, String paramValue) {
            if (paramName.equals("realm"))
                realm = paramValue;
            else if (paramName.equals("domain"))
                domain = paramValue;
            else if (paramName.equals("nonce"))
                nonce = paramValue;
            else if (paramName.equals("opaque"))
                opaque = paramValue;
            else if (paramName.equals("stale"))
                stale = paramValue;
            else if (paramName.equals("qop"))
                qop = paramValue;
            else if (paramName.equals("algorithm"))
                algorithm = paramValue;
        }

        public String getRealm() {
            return realm;
        }

        public String getDomain() {
            return domain;
        }

        public String getNonce() {
            return nonce;
        }

        public String getOpaque() {
            return opaque;
        }

        public String getStale() {
            return stale;
        }

        public String getQop() {
            return qop;
        }

        public String getAlgorithm() {
            return algorithm;
        }

        public String getAuthenticationScheme() {
            return authenticationScheme;
        }

        public void setAuthenticationScheme(String authenticationScheme) {
            this.authenticationScheme = authenticationScheme;
        }

        public boolean isDigest() {
            return authenticationScheme != null
                    && authenticationScheme.toLowerCase().equals("digest");
        }
    }
}
