package eu.geoknow.generator.users;

/**
 * Created by taleksaschina on 17.10.2014.
 */

import java.util.HashMap;
import java.util.Map;

/**
 * This class is simple in-memory temporary password store.
 * When user logs in, password saves here.
 * Then it can be used in authenticated SPARQL requests (user's RDF store password is equal to Workbench password).
 * So, we don't need to store password as plain text in RDF store.
 */
public class PasswordStore {
    private static Map<String, String> user2password = new HashMap<>();

    public static synchronized void put(String username, String password) {
        user2password.put(username, password);
    }

    public static synchronized void remove(String username) {
        user2password.remove(username);
    }

    public static synchronized String getPassword(String username) {
        return user2password.get(username);
    }
}
