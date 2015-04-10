package eu.geoknow.generator.utils;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

public class HttpUtils {
    public static String getCookieValue(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies==null)
            return null;
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName()))
                return cookie.getValue();
        }
        return null;
    }
}
