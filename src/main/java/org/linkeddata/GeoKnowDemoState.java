package org.linkeddata;

import com.vaadin.ui.Label;
import com.vaadin.ui.Notification;
import org.openrdf.model.Resource;
import org.openrdf.model.Statement;
import org.openrdf.model.Value;
import org.openrdf.model.impl.LiteralImpl;
import org.openrdf.query.*;
import org.openrdf.repository.Repository;
import org.openrdf.repository.RepositoryConnection;
import org.openrdf.repository.RepositoryException;
import org.openrdf.rio.RDFFormat;
import org.openrdf.rio.RDFParseException;
import virtuoso.sesame2.driver.VirtuosoRepository;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Properties;
// import java.lang.RuntimeException;

public class GeoKnowDemoState
{
    // configuration store: this is an RDF graph with all configuration data installed.
    // We assume this graph is accessible via the Virtuoso connection.
    private String configurationRDFgraph = "http://10.0.0.90/lod2democonfiguration";

    // The lod2 runtime configuration file. This holds information on the users in the
    // system and can be extended with further information that is important to the
    // running system.
    private String runtimeRDFgraph ="http://10.0.0.90/lod2runtime";

    // the hostname and portnumber where the tools are installed.
    private String hostname = "http://10.0.0.90:8080";

    // the default graph on which the queries and actions will be performed
    private String currentGraph = "";
    public  Label cGraph = new Label("no current graph selected");

    // The virtuoso repository
    //private String jDBCconnectionstring = "jdbc:virtuoso://10.0.0.65:1111";
    private String jDBCconnectionstring = "jdbc://10.0.0.90:1111";
    private String jDBCuser = "gkdemo";
    private String jDBCpassword = "gkdemo";

    // the upload Directory for the application
    private String uploadDir = ".//uploads";

    // for googleAnalytics
    public String googleAnalyticsID = "";
    public String googleAnalyticsDomain = "";

    // for ckan
    public String CKANApiKey = "";
    public String CKANUser = "";
    public String CKANPwd = "";


    public Repository rdfStore;

    public Boolean InitStatus = false;
    public String ErrorMessage = "true";

    // initialize the state with an default configuration
    // After succesfull initialisation the rdfStore connection is an active connection 
    public GeoKnowDemoState() {

        readConfiguration();
        rdfStore = new VirtuosoRepository(jDBCconnectionstring, jDBCuser, jDBCpassword);
        try {
            rdfStore.initialize();
        } catch (RepositoryException e) {
            ErrorMessage = "Initialization connection to Virtuoso failed";
            e.printStackTrace();
        };

        String Filename = ".//conf/configuration.rdf";

        try {
            RepositoryConnection con = rdfStore.getConnection();


            File configurationFile = new File(Filename);
            Resource contextURI = con.getValueFactory().createURI(configurationRDFgraph);
            Resource[] contexts = new Resource[]{contextURI};

                // first empty the graph as the repository(Virtuoso) appends triples to a graph with the add.
            con.clear(contexts);
            con.add(configurationFile, "http://geoknow.eu/", RDFFormat.RDFXML, contexts);

            // initialize the hostname and portnumber
            String query = "select ?h from <" + configurationRDFgraph + "> where {<" + configurationRDFgraph + "> <http://lod2.eu/lod2demo/hostname> ?h} LIMIT 100";
            TupleQuery tupleQuery = con.prepareTupleQuery(QueryLanguage.SPARQL, query);
            TupleQueryResult result = tupleQuery.evaluate();
            while (result.hasNext()) {
                BindingSet bindingSet = result.next();
                Value valueOfH = bindingSet.getValue("h");
                if (valueOfH instanceof LiteralImpl) {
                    LiteralImpl literalH = (LiteralImpl) valueOfH;
                    hostname = "http://" +literalH.getLabel();
                };
            }

        } catch (IOException e) {
            ErrorMessage = "the configuration file is not readable or present:" + Filename;
            e.printStackTrace();
        } catch (RepositoryException e) {
            ErrorMessage = "Query execution failed due to problems with the repository.";
            e.printStackTrace();
        } catch (MalformedQueryException e) {
            ErrorMessage = "Query execution failed due to malformed query.";
            e.printStackTrace();
        } catch (QueryEvaluationException e) {
            ErrorMessage = "Query execution failed due to query evaluation problem.";
            e.printStackTrace();
        } catch (RDFParseException e) {
            ErrorMessage = "the configuration graph url is incorrect.";
            e.printStackTrace();
        } 

        InitStatus = new Boolean(ErrorMessage);

    }

    // initialize the state with a graphname
    public GeoKnowDemoState(String graphname) {
        this();
        currentGraph = graphname;
    };


    // accessors
    public String getCurrentGraph() {
        return currentGraph;
    };

    // accessors
    public String getHostName() {
        return hostname;
    };

    public void setCurrentGraph(String graphname) {
        currentGraph = graphname;
        cGraph.setValue(graphname);
    };


    public Repository getRdfStore() {
        return rdfStore;
    };

    public String getUploadDir(){
        return uploadDir;
    }

    public void setUploadDir(String ud) {
        uploadDir = ud;
    }


    public String getConfigurationRDFgraph() {
        return configurationRDFgraph;
    }

    //* returns the runtime RDF graph
    public String getRuntimeRDFgraph(){
        return this.runtimeRDFgraph;
    }

    // a method to reconnect to the rdfStore.
    public void reconnectRdfStore() {
        try {
            rdfStore.initialize();
        } catch (RepositoryException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        };
    }

    // read the local configuration file /etc/lod2demo/lod2demo.conf
    private void readConfiguration() {

        Properties properties = new Properties();
        try {
            properties.load(new FileInputStream(".//conf/GKDemo.conf"));
            jDBCconnectionstring = properties.getProperty("JDBCconnection");
            jDBCuser             = properties.getProperty("JDBCuser");
            jDBCpassword         = properties.getProperty("JDBCpassword");
            uploadDir            = properties.getProperty("uploadDirectory");
            googleAnalyticsID    = properties.getProperty("googleAnalyticsID", "");
            googleAnalyticsDomain = properties.getProperty("googleAnalyticsDomain", "");

            CKANApiKey = properties.getProperty("CKANApiKey");
            CKANUser = properties.getProperty("CKANUser");
            CKANPwd = properties.getProperty("CKANPwd");

            //		System.print("$"+jDBCuser+"$");
            //		System.print("$"+jDBCpassword+"$");

        } catch (IOException e) {
            // the file is absent or has faults in configuration settings
            ErrorMessage = "Reading configuration file in /conf/GKDemo.conf failed.";
            // print more detail to catalina logs
            e.printStackTrace();
        };
    }

    /**
     * logs in the given user and password combination. If the combination of
     * username and password matches a user in the system, the user is returned.
     * Otherwise, the function returns null.
     * An error window can be supplied to show error messages to the user. This is optional however.
     */
    public User logIn(String username, String password, Notification errorWindow){
        User user=this.findUser(username, password, errorWindow);
        this.setUser(user);
        return user;
    }

    /**
     * log in the given user and password combination with no error window
     * @see #logIn(String, String, com.vaadin.ui.Window)
     */
    public User logIn(String username, String password){
        return this.logIn(username,password,null);
    }

    /**
     * Looks up the given username - password combination in the database. Returns the user that is found if any.
     * Note: this method is not supported yet!
     * @param username : the username to look for
     * @param password : the password to look for
     * @return the user that was discovered in the database if any. Null is returned if no user was discovered with
     * a matching username password combination.
     * @throws IllegalStateException : a non-recoverable exception was thrown while processing the update operation.
     * this type of exceptions occur when the connection to the repository has failed or when there was an error in the
     * query.
     */
    private User findUser(String username, String password, Notification errorwindow){
        //* the user to return. Defaults to null, meaning no user was found.
        User result=null;

        if(username == null || password == null || username.length()<1 || password.length()<1 ){
            // safety to avoid looking up empty usernames and passwords
            return null;
        }

        try{
            RepositoryConnection con = this.getRdfStore().getConnection();
            String query =
                    "prefix foaf: <http://xmlns.com/foaf/0.1/>" +
                    "prefix lod2: <http://lod2.eu/lod2demo/>" +

                    "select ?fname ?lname ?org ?email from <" +
                    this.getRuntimeRDFgraph() + "> where {"+
                    "?u a foaf:Person." +
                    "?o a foaf:Organization." +
                    "?o foaf:member ?u." +
                    "?o foaf:name ?org." +
                    "?u foaf:firstName ?fname."+
                    "?u foaf:lastName ?lname."+
                    "?u foaf:mbox ?email."+

                    "?u lod2:password \"" + username + "\"^^<http://www.w3.org/2001/XMLSchema#string>."+
                    "?u lod2:username \"" + password + "\"^^<http://www.w3.org/2001/XMLSchema#string>."+

            "}";
            TupleQuery tupleQuery = con.prepareTupleQuery(QueryLanguage.SPARQL, query);
            TupleQueryResult queryResult = tupleQuery.evaluate();
            int count=0;
            while (queryResult.hasNext()) {
                // use the final result as the actual user to be returned. Logging when there is more than
                // one result might be advised.
                count++;
                BindingSet bindingSet = queryResult.next();
                result=new User(username);
                result.setFirstName(this.getStringValue(bindingSet,"fname"));
                result.setLastName(this.getStringValue(bindingSet,"lname"));
                result.setOrganization(this.getStringValue(bindingSet,"org"));

                String email=this.getStringValue(bindingSet,"email");
                if(email!=null){
                    email=email.replaceFirst("mailto:", "");
                }
                result.setEmail(email);
            }
            if(count>1){
                // multiple results for a single user-password combination. That's odd, let's log it.
                if(errorwindow!=null){
                    Notification.show("Multiple users found", "Something odd just happened: we found more " +
                            "than one version of this user-password combination. We simply took the last one we " +
                            "discovered, but it might be wise to have a word with your administrator...",  Notification.Type.WARNING_MESSAGE);
                }
                System.out.println("Multiple results were found in the database for the user "+username);
            }
            con.close();

        } catch (RepositoryException e) {
            // repository is no longer live. This exception cannot be handled correctly, show to user.
            e.printStackTrace(System.err);
            throw new IllegalStateException("Sorry, the repository is no longer live. Please contact an administrator.\n\n" +
                    "The original message was: "+e.getMessage());
        } catch (QueryEvaluationException e) {
            e.printStackTrace(System.err);
            // could not evaluate query or get a next result from it. API is no help on this exception. Some googling
            // tells us this results from improper setup. Nothing we can do here either! Show to user.
            throw new IllegalStateException("Sorry, the it appears that your system has been setup incorrectly. Please contact an administrator. \n\n" +
                    "The original message was: "+e.getMessage());
        } catch (MalformedQueryException e) {
            e.printStackTrace(System.err);
            // there was a mistake in the query! This exception cannot be handled correctly. Show to user.
            throw new IllegalStateException("Sorry, there appears to be a mistake in the authentication query. Please contact your software supplier.\n\n" +
                    "The original message was: "+e.getMessage());
        }
        return result;
    }

    /**
     * Updates the previous information on the given user to the new information available on the given user. The new
     * information on the user is contained in the given object.
     * @param newUser : the information on the user to add to the database
     * @throws IllegalStateException : a non-recoverable exception was thrown while processing the update operation.
     * this type of exceptions occur when the connection to the repository has failed or when there was an error in the
     * query.
     */
    public void updateUser(User newUser){
        try{
            RepositoryConnection con = this.getRdfStore().getConnection();
            Resource runtimeGraph = con.getValueFactory().createURI(this.getRuntimeRDFgraph());

            // first remove all previous information on the user (that can be edited)
            // NOTE that the following query will only remove the user from the organization. It will not remove the
            // organization as such or change the name of the organization in the rdf file!
            String removalQuery =
                    "prefix foaf: <http://xmlns.com/foaf/0.1/>" +
                    "prefix lod2: <http://lod2.eu/lod2demo/>" +

                    "CONSTRUCT {" +
                            "?u foaf:firstName ?fname."+
                            "?u foaf:lastName ?lname."+
                            "?u foaf:mbox ?email."+
                            "?o foaf:member ?u." +
                            "} " +
                    "FROM <" + this.getRuntimeRDFgraph() + "> WHERE {"+
                            "?u a foaf:Person." +
                            "?o a foaf:Organization." +
                            "?o foaf:member ?u." +
                            "?o foaf:name ?org." +
                            "?u foaf:firstName ?fname."+
                            "?u foaf:lastName ?lname."+
                            "?u foaf:mbox ?email."+
                            "?u lod2:username \"" + newUser.getUsername()+ "\"^^<http://www.w3.org/2001/XMLSchema#string>."+
                    "}";
            GraphQueryResult result=con.prepareGraphQuery(QueryLanguage.SPARQL, removalQuery).evaluate();
            while(result.hasNext()){
                Statement statement=result.next();
                con.remove(statement,runtimeGraph );
            }

            // then add the new information on the user to the store
            String creationQuery =
                    "prefix foaf: <http://xmlns.com/foaf/0.1/> " +
                    "prefix lod2: <http://lod2.eu/lod2demo/> " +

                    "CONSTRUCT {" +
                            "?u foaf:firstName \""+newUser.getFirstName()+"\". "+
                            "?u foaf:lastName \""+newUser.getLastName()+"\". "+
                            "?u foaf:mbox \"mailto:"+newUser.getEmail()+"\". "+
                            "_:o a foaf:Organization. "+
                            "_:o foaf:member ?u. " +
                            "_:o foaf:name \""+newUser.getOrganization()+"\". "+
                            "} " +
                    "FROM <" + this.getRuntimeRDFgraph() + "> WHERE { "+
                            "?u a foaf:Person. " +
                            "?u lod2:username \"" + newUser.getUsername()+ "\"^^<http://www.w3.org/2001/XMLSchema#string>. "+
                    "}";
            result=con.prepareGraphQuery(QueryLanguage.SPARQL, creationQuery).evaluate();
            while(result.hasNext()){
                Statement statement=result.next();
                con.add(statement,runtimeGraph);
            }
            con.close();
        }catch (RepositoryException e) {
            // repository is no longer live. This exception cannot be handled correctly, show to user.
            e.printStackTrace(System.err);
            throw new IllegalStateException("Sorry, the repository is no longer live. Please contact an administrator.\n\n" +
                    "The original message was: "+e.getMessage());
        } catch (QueryEvaluationException e) {
            // could not evaluate query or get a next result from it. API is no help on this exception. Some googling
            // tells us this results from improper setup. Nothing we can do here either! Show to user.
            e.printStackTrace(System.err);
            throw new IllegalStateException("Sorry, the it appears that your system has been setup incorrectly. Please contact an administrator. \n\n" +
                    "The original message was: "+e.getMessage());
        } catch (MalformedQueryException e) {
            // there was a mistake in the query! This exception cannot be handled correctly. Show to user.
            e.printStackTrace(System.err);
            throw new IllegalStateException("Sorry, there appears to be a mistake in the authentication query. Please contact your software supplier.\n\n" +
                    "The original message was: "+e.getMessage());
        }
    }

    /**
     * Returns the value of the parameter with the given name in the given bindingset if it exists and
     * is of the type LiteralImpl. Returns null otherwise.
     * @param bindings the bindingset to look for values in
     * @param name the name of the parameter to look in
     * @return return the value of the parameter with the given name if any.
     */
    private String getStringValue(BindingSet bindings, String name){
        Value value=bindings.getValue(name);
        String result=null;
        if (value instanceof LiteralImpl) {
            LiteralImpl literal = (LiteralImpl) value;
            result = literal.getLabel();
        }else{
            //fallback option
            result=value.stringValue();
        }
        return result;
    }

    //* the currently logged in user
    private User user;

    //* sets the currently logged in user to the given user.
    public void setUser(User user){
        this.user = user;
        for(LoginListener listener : loginListeners){
            this.notifyListener(listener);
        }
    }

    //* returns the currently logged in user.
    public User getUser(){
        return this.user;
    }

    //* the currently subscribed loginListeners
    protected HashSet<LoginListener> loginListeners=new HashSet<LoginListener>();

    /**
     * adds the given login listener as an actively subscribed listener. The listener
     * immediately receives a notification.
     */
    public void addLoginListener(LoginListener listener){
        this.loginListeners.add(listener);
        this.notifyListener(listener);
    }

    /**
     * removes the given listener from the set of listeners
     * @param listener :: the listener to remove
     */
    public void removeLoginListener(LoginListener listener){
        this.loginListeners.remove(listener);
    }

    //* notifies the given listener that of the current user.
    protected void notifyListener(LoginListener listener){
        listener.notifyLogin(this.getUser());
    }

    //* inner class representing a user of the system
    public class User implements  Serializable{

        protected String username;
        protected String organization;
        protected String email;
        protected String firstName;
        protected String lastName;

        public User(String username){
            this.username=username;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public void setOrganization(String organization) {
            this.organization = organization;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getUsername() {
            return username;
        }

        public String getOrganization() {
            return organization;
        }

        public String getEmail() {
            return email;
        }

        @Override
        public User clone(){
            User clone=new User(this.getUsername());
            clone.setFirstName(this.getFirstName());
            clone.setLastName(this.getLastName());
            clone.setOrganization(this.getOrganization());
            clone.setEmail(this.getEmail());
            return clone;
        }

    }

    public interface LoginListener {
        /**
         * the listener is informed that the user has changed. The logged in user is
         * provided if it exists.
         * @param user :: the user that is currently logged in or null if no such user exists.
         */
        public void notifyLogin(User user);
    }
}


