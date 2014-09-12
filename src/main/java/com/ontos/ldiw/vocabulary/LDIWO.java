/* CVS $Id: $ */
package com.ontos.ldiw.vocabulary;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.Resource;

/**
 * Vocabulary definitions from framework-ontology.ttl
 * 
 * @author Auto-generated by schemagen on 02 Sep 2014 10:31
 */
public class LDIWO {
    /**
     * <p>
     * The RDF model that holds the vocabulary terms
     * </p>
     */
    private static Model m_model = ModelFactory.createDefaultModel();

    /**
     * <p>
     * The namespace of the vocabulary as a string
     * </p>
     */
    public static final String NS = "http://ldiw.ontos.com/ontology/";

    /**
     * <p>
     * The namespace of the vocabulary as a string
     * </p>
     * 
     * @see #NS
     */
    public static String getURI() {
	return NS;
    }

    /**
     * <p>
     * The namespace of the vocabulary as a resource
     * </p>
     */
    public static final Resource NAMESPACE = m_model.createResource(NS);

    /**
     * <p>
     * The ontology's owl:versionInfo as a string
     * </p>
     */
    public static final String VERSION_INFO = "0.1.0";

    public static final Property dbHost = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/dbHost");

    /**
     * <p>
     * Name of the database to connect
     * </p>
     */
    public static final Property dbName = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/dbName");

    public static final Property dbPassword = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/dbPassword");

    public static final Property dbPort = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/dbPort");

    public static final Property dbType = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/dbType");

    /**
     * <p>
     * If the component requires user/password authentication method (for
     * instance a database)
     * </p>
     */
    public static final Property dbUser = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/dbUser");

    public static final Property endpoint = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/endpoint");

    public static final Property isAllowedToUseService = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/isAllowedToUseService");

    /**
     * <p>
     * Role is used as default for newly registered user
     * </p>
     */
    public static final Property isDefault = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/isDefault");

    /**
     * <p>
     * Role is used as default for not logged in user
     * </p>
     */
    public static final Property isNotLoggedIn = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/isNotLoggedIn");

    /**
     * <p>
     * JDBC data source name.
     * </p>
     */
    public static final Property jdbcDSN = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/jdbcDSN");

    public static final Property jdbcDriver = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/jdbcDriver");

    /**
     * <p>
     * ODBC DSN
     * </p>
     */
    public static final Property odbcDSN = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/odbcDSN");

    public static final Property partialUrl = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/partialUrl");

    /**
     * <p>
     * Workbench account password hash
     * </p>
     */
    public static final Property passwordSha1Hash = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/passwordSha1Hash");

    public static final Property rdfStorePassword = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/rdfStorePassword");

    public static final Property rdfStoreUsername = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/rdfStoreUsername");

    public static final Property requiredService = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/requiredService");

    public static final Property role = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/role");

    public static final Property sessionToken = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/sessionToken");

    public static final Property settingsGraph = m_model
	    .createProperty("http://ldiw.ontos.com/ontology/settingsGraph");

    /**
     * <p>
     * Account for the workbench
     * </p>
     */
    public static final Resource Account = m_model
	    .createResource("http://ldiw.ontos.com/ontology/Account");

    public static final Resource DataSource = m_model
	    .createResource("http://ldiw.ontos.com/ontology/DataSource");

    public static final Resource Database = m_model
	    .createResource("http://ldiw.ontos.com/ontology/Database");

    public static final Resource DatabaseType = m_model
	    .createResource("http://ldiw.ontos.com/ontology/DatabaseType");

    /**
     * <p>
     * Class associate with rights to use service which could be assigned to
     * users.
     * </p>
     */
    public static final Resource Role = m_model
	    .createResource("http://ldiw.ontos.com/ontology/Role");

    public static final Resource RouteRestriction = m_model
	    .createResource("http://ldiw.ontos.com/ontology/RouteRestriction");

    public static final Resource SPARQLEndpoint = m_model
	    .createResource("http://ldiw.ontos.com/ontology/SPARQLEndpoint");

    public static final Resource Administrator = m_model
	    .createResource("http://ldiw.ontos.com/ontology/Administrator");

    public static final Resource BasicUser = m_model
	    .createResource("http://ldiw.ontos.com/ontology/BasicUser");

    public static final Resource IBM_DB2 = m_model
	    .createResource("http://ldiw.ontos.com/ontology/IBM_DB2");

    public static final Resource MicrosoftSQLServer = m_model
	    .createResource("http://ldiw.ontos.com/ontology/MicrosoftSQLServer");

    public static final Resource MySQL = m_model
	    .createResource("http://ldiw.ontos.com/ontology/MySQL");

    public static final Resource OracleSpatial = m_model
	    .createResource("http://ldiw.ontos.com/ontology/OracleSpatial");

    public static final Resource PostGIS = m_model
	    .createResource("http://ldiw.ontos.com/ontology/PostGIS");

}
