/* CVS $Id: $ */
package com.ontos.ldiw.vocabulary;

import java.io.ByteArrayInputStream;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.Resource;

/**
 * Vocabulary definitions from framework-ontology_0.1.3.ttl
 * 
 * @author Auto-generated by schemagen on 03 Jun 2015 12:05
 */
public class LDIWO {
  /**
   * <p>
   * The RDF model that holds the vocabulary terms
   * </p>
   */
  private static Model m_model = ModelFactory.createDefaultModel();

  private static final String SOURCE =
      "@prefix :      <http://ldiw.ontos.com/ontology/> .        \n"
          + "@prefix ldis:  <http://stack.linkeddata.org/ldis-schema/> .        \n"
          + "@prefix sd:    <http://www.w3.org/ns/sparql-service-description#> .        \n"
          + "@prefix void:  <http://rdfs.org/ns/void#> .        \n"
          + "@prefix owl:   <http://www.w3.org/2002/07/owl#> .        \n"
          + "@prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .        \n"
          + "@prefix xsd:   <http://www.w3.org/2001/XMLSchema#> .        \n"
          + "@prefix dcterms: <http://purl.org/dc/terms/> .        \n"
          + "@prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> .        \n"
          + "@prefix lds:   <http://stack.linkeddata.org/ldis-schema/> .        \n"
          + "@prefix acl:   <http://www.w3.org/ns/auth/acl#> .        \n"
          + "@prefix foaf:  <http://xmlns.com/foaf/0.1/> .        \n"
          + ":SPARQLEndpoint  a       owl:Class ;        \n"
          + "        rdfs:label       \"SPARQL endpoint\"@en ;        \n"
          + "        rdfs:subClassOf  :DataSource .        \n"
          + ":passwordSha1Hash  a  owl:DatatypeProperty ;        \n"
          + "        rdfs:comment  \"Workbench account password hash\"@en ;        \n"
          + "        rdfs:domain   :Account ;        \n"
          + "        rdfs:label    \"password sha1 hash\"@en ;        \n"
          + "        rdfs:range    xsd:string .        \n"
          + ":ClassificationAndEnrichment        \n"
          + "        a           :ToolCategory ;        \n"
          + "        rdfs:label  \"Classification and Enrichment\"@en .        \n"
          + ":LinkingAndFusing  a  :ToolCategory ;        \n"
          + "        rdfs:label  \"Linking and Fusing\"@en .        \n"
          + ":intervalWeek  a            owl:DatatypeProperty ;        \n"
          + "        rdfs:domain         :Schedule ;        \n"
          + "        rdfs:label          \"interval week\"@en ;        \n"
          + "        rdfs:range          xsd:boolean ;        \n"
          + "        rdfs:subPropertyOf  :interval .        \n"
          + ":requires  a        owl:ObjectProperty ;        \n"
          + "        rdfs:label  \"requires \"@en .        \n"
          + ":jsonString  a      owl:DatatypeProperty ;        \n"
          + "        rdfs:label  \"json string\"@en ;        \n"
          + "        rdfs:range  xsd:string .        \n"
          + ":hasAccess  a         owl:ObjectProperty ;        \n"
          + "        rdfs:comment  \"A role is configured with a set of Modules it can use {@en}\\t\"^^xsd:string ;        \n"
          + "        rdfs:domain   :Role ;        \n"
          + "        rdfs:label    \"has access\"@en ;        \n"
          + "        rdfs:range    :Tool .        \n"
          + ":DataSource  a           owl:Class ;        \n"
          + "        rdfs:label       \"Data Source\"@en ;        \n"
          + "        rdfs:subClassOf  owl:Thing .        \n"
          + ":smtpTlsPort  a      owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :EmailService ;        \n"
          + "        rdfs:label   \"TLS SMTP Port\"^^xsd:string ;        \n"
          + "        rdfs:range   xsd:string .        \n"
          + ":lastAccessLocation  a  owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  [ a            owl:Class ;        \n"
          + "                       owl:unionOf  ( :AuthorisedSessions :Account )        \n"
          + "                     ] ;        \n"
          + "        rdfs:label   \"requires \"@en ;        \n"
          + "        rdfs:range   xsd:string .        \n"
          + "void:Dataset  a          owl:Class ;        \n"
          + "        rdfs:label       \"Dataset\"@en ;        \n"
          + "        rdfs:subClassOf  owl:Thing .        \n"
          + "dcterms:source  a   owl:DatatypeProperty ;        \n"
          + "        rdfs:label  \"source\"^^xsd:string .        \n"
          + ":requiresSession  a         owl:ObjectProperty ;        \n"
          + "        rdfs:domain         :Job ;        \n"
          + "        rdfs:label          \"requires \"@en ;        \n"
          + "        rdfs:range          :AuthorisedSessions ;        \n"
          + "        rdfs:subPropertyOf  :requires .        \n"
          + ":Account  a              owl:Class ;        \n"
          + "        rdfs:comment     \"Account for the workbench\"@en ;        \n"
          + "        rdfs:label       \"Account\"@en ;        \n"
          + "        rdfs:subClassOf  foaf:OnlineAccount .        \n"
          + ":MySQL  a           :DatabaseType ;        \n"
          + "        rdfs:label  \"MySQL\"^^xsd:string .        \n"
          + ":frameworkDataDir  a  owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  lds:StackComponent ;        \n"
          + "        rdfs:label   \"Directory for Framework Data\"@en ;        \n"
          + "        rdfs:range   xsd:string .        \n"
          + ":License  a              owl:Class ;        \n"
          + "        rdfs:label       \"License\"@en ;        \n"
          + "        rdfs:subClassOf  :DataSource .        \n"
          + ":ToolCategory  a         owl:Class ;        \n"
          + "        rdfs:comment     \"The tools are categorised in order to show them in the corresponding menu on the workbench\"@en ;        \n"
          + "        rdfs:label       \"Tool Categories\"@en ;        \n"
          + "        rdfs:subClassOf  owl:Thing .        \n"
          + ":PostGIS  a         :DatabaseType ;        \n"
          + "        rdfs:label  \"PostGIS\"^^xsd:string .        \n"
          + ":IBM_DB2  a         :DatabaseType ;        \n"
          + "        rdfs:label  \"IBM DB2\"^^xsd:string .        \n"
          + ":interval  a        owl:DatatypeProperty ;        \n"
          + "        rdfs:label  \"interval\"@en ;        \n"
          + "        rdfs:range  xsd:boolean .        \n"
          + ":start  a            owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :Schedule ;        \n"
          + "        rdfs:label   \"start time\"@en ;        \n"
          + "        rdfs:range   xsd:dateTime .        \n"
          + ":role   a            owl:ObjectProperty ;        \n"
          + "        rdfs:domain  :Account ;        \n"
          + "        rdfs:label   \"role\"@en ;        \n"
          + "        rdfs:range   :Role .        \n"
          + "foaf:lastName  a     owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :User ;        \n"
          + "        rdfs:label   \"Last name\"@en .        \n"
          + "acl:Authorization  a  rdfs:Class ;        \n"
          + "        rdfs:label  \"requires \"@en .        \n"
          + "foaf:homepage  a     owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :SoftwareComponent ;        \n"
          + "        rdfs:label   \"homepage\"^^xsd:string ;        \n"
          + "        rdfs:range   xsd:anyURI .        \n"
          + "acl:accessTo  a     owl:ObjectProperty ;        \n"
          + "        rdfs:label  \"requires \"@en .        \n"
          + "dcterms:created  a   owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  void:Dataset ;        \n"
          + "        rdfs:label   \"created \"@en ;        \n"
          + "        rdfs:range   xsd:dateTime .        \n"
          + ":smtpHost  a         owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :EmailService ;        \n"
          + "        rdfs:label   \"Host address for SMTP\"^^xsd:string ;        \n"
          + "        rdfs:range   xsd:string .        \n"
          + ":MicrosoftSQLServer  a  :DatabaseType ;        \n"
          + "        rdfs:label  \"MicrosoftSQLServer\"^^xsd:string .        \n"
          + "dcterms:creator  a   owl:ObjectProperty ;        \n"
          + "        rdfs:domain  void:Dataset ;        \n"
          + "        rdfs:label   \"creator\"^^xsd:string ;        \n"
          + "        rdfs:range   :User .        \n"
          + "dcterms:title  a      owl:DatatypeProperty ;        \n"
          + "        rdfs:comment  \"The name of the dataset.\"^^xsd:string ;        \n"
          + "        rdfs:label    \"Title\"^^xsd:string .        \n"
          + ":dbPassword  a       owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :Database ;        \n"
          + "        rdfs:label   \"password\"^^xsd:string ;        \n"
          + "        rdfs:range   xsd:string .        \n"
          + ":mapFileString  a    owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :Csv2RdfDataMapping ;        \n"
          + "        rdfs:label   \"map file string\"@en ;        \n"
          + "        rdfs:range   xsd:string .        \n"
          + ":isDefault  a         owl:DatatypeProperty ;        \n"
          + "        rdfs:comment  \"Role is used as default for newly registered user\" ;        \n"
          + "        rdfs:domain   :Role ;        \n"
          + "        rdfs:label    \"isDefault\"@en ;        \n"
          + "        rdfs:range    xsd:boolean .        \n"
          + ":ManualRevisionAndAuthoring        \n"
          + "        a           :ToolCategory ;        \n"
          + "        rdfs:label  \"Manual revision and Authoring\"@en .        \n"
          + ":dbUser  a            owl:DatatypeProperty ;        \n"
          + "        rdfs:comment  \"If the component requires user/password authentication method (for instance a database)\"^^xsd:string ;        \n"
          + "        rdfs:domain   :Database ;        \n"
          + "        rdfs:label    \"Service user\"^^xsd:string ;        \n"
          + "        rdfs:range    xsd:string .        \n"
          + ":DatabaseType  a         owl:Class ;        \n"
          + "        rdfs:label       \"Database Type\"@en ;        \n"
          + "        rdfs:subClassOf  owl:Thing .        \n"
          + ":category  a         owl:ObjectProperty ;        \n"
          + "        rdfs:domain  :Tool ;        \n"
          + "        rdfs:label   \"category \"@en ;        \n"
          + "        rdfs:range   :ToolCategory .        \n"
          + ":smtpSslPort  a      owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :EmailService ;        \n"
          + "        rdfs:label   \"SSL SMTP Port\"^^xsd:string ;        \n"
          + "        rdfs:range   xsd:string .        \n"
          + "sd:NamedGraph  a    rdfs:Class ;        \n"
          + "        rdfs:label  \"Named Graph\"^^xsd:string .        \n"
          + ":dbName  a            owl:DatatypeProperty ;        \n"
          + "        rdfs:comment  \"Name of the database to connect\"^^xsd:string ;        \n"
          + "        rdfs:domain   :Database ;        \n"
          + "        rdfs:label    \"database\"^^xsd:string ;        \n"
          + "        rdfs:range    xsd:string .        \n"
          + ":       a                    owl:Ontology ;        \n"
          + "        dcterms:contributor  \"Alejandra Garcia Rojas\"^^xsd:string , \"Martin Voigt\"^^xsd:string ;        \n"
          + "        dcterms:descripton   \"Schema the Linked Data Integration Workbench\"^^xsd:string ;        \n"
          + "        owl:versionInfo      \"0.1.2\"^^xsd:string .        \n"
          + "foaf:mbox  a         owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :User ;        \n"
          + "        rdfs:label   \"e-mail \"@en .        \n"
          + "sd:Service  a       rdfs:Class ;        \n"
          + "        rdfs:label  \"Service\"^^xsd:string .        \n"
          + ":isAllowedToUseService        \n"
          + "        a             owl:ObjectProperty ;        \n"
          + "        rdfs:comment  \"This may disappear with the use of  hasAccess property based on the definition of Tools\"@en ;        \n"
          + "        rdfs:domain   :Role ;        \n"
          + "        rdfs:label    \"is allowed to use service\"@en .        \n"
          + ":lastAcess  a        owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  [ a            owl:Class ;        \n"
          + "                       owl:unionOf  ( :AuthorisedSessions :Account )        \n"
          + "                     ] ;        \n"
          + "        rdfs:label   \"requires \"@en ;        \n"
          + "        rdfs:range   xsd:dateTime .        \n"
          + ":Role   a                owl:Class ;        \n"
          + "        rdfs:comment     \"Class associate with rights to use service which could be assigned to users.\"@en ;        \n"
          + "        rdfs:label       \"Role\"@en ;        \n"
          + "        rdfs:subClassOf  owl:Thing .        \n"
          + ":dbType  a           owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :Database ;        \n"
          + "        rdfs:label   \"Database Type\"^^xsd:string ;        \n"
          + "        rdfs:range   :DatabaseType .        \n"
          + ":SearchQueryingAndExploration        \n"
          + "        a           :ToolCategory ;        \n"
          + "        rdfs:label  \"Search Querying and Exploration \"@en .        \n"
          + ":springBatchAdminJobsDir        \n"
          + "        a           owl:DatatypeProperty ;        \n"
          + "        rdfs:label  \"spring batch admin jobs dir\"^^xsd:string ;        \n"
          + "        rdfs:range  xsd:string .        \n"
          + ":Job    a                owl:Class ;        \n"
          + "        rdfs:label       \"Job\"@en ;        \n"
          + "        rdfs:subClassOf  owl:Thing .        \n"
          + "foaf:accountName  a  owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :Account ;        \n"
          + "        rdfs:label   \"service \"@en ;        \n"
          + "        rdfs:range   xsd:string .        \n"
          + ":AuthorisedSessions  a   owl:Class ;        \n"
          + "        rdfs:comment     \"Sessions are fake endpoints provided to the Jobs in order to access private data.\"@en ;        \n"
          + "        rdfs:label       \"Authorised Sessions \"@en ;        \n"
          + "        rdfs:subClassOf  owl:Thing .        \n"
          + ":isNotLoggedIn  a     owl:DatatypeProperty ;        \n"
          + "        rdfs:comment  \"Role is used as default for not logged in user\" ;        \n"
          + "        rdfs:domain   :Role ;        \n"
          + "        rdfs:label    \"isNotLoggedIn\"@en ;        \n"
          + "        rdfs:range    xsd:boolean .        \n"
          + "foaf:fistName  a     owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :User ;        \n"
          + "        rdfs:label   \"First Name\"@en .        \n"
          + "void:Linkset  a          owl:Class ;        \n"
          + "        rdfs:label       \"Linkset\"@en ;        \n"
          + "        rdfs:subClassOf  void:Dataset .        \n"
          + ":Tool   a                owl:Class ;        \n"
          + "        rdfs:comment     \"A Tool is the actual interface in the Workbench that is going to be used for a specific task (i.e. transform Relational data to RDF)\"@en ;        \n"
          + "        rdfs:label       \"Tool\"@en ;        \n"
          + "        rdfs:subClassOf  owl:Thing .        \n"
          + ":account  a          owl:ObjectProperty ;        \n"
          + "        rdfs:domain  :User ;        \n"
          + "        rdfs:label   \"account\"@en ;        \n"
          + "        rdfs:range   :Account .        \n"
          + ":route  a            owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :Tool ;        \n"
          + "        rdfs:label   \"route \"@en ;        \n"
          + "        rdfs:range   xsd:string .        \n"
          + ":Schedule  a             owl:Class ;        \n"
          + "        rdfs:label       \"Schedule\"@en ;        \n"
          + "        rdfs:subClassOf  owl:Thing .        \n"
          + ":Ontology  a             owl:Class ;        \n"
          + "        rdfs:label       \"Xml Definition\"@en ;        \n"
          + "        rdfs:subClassOf  :DataSource .        \n"
          + ":end    a            owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :Schedule ;        \n"
          + "        rdfs:label   \"end\"@en ;        \n"
          + "        rdfs:range   xsd:dateTime .        \n"
          + "dcterms:modified  a  owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  void:Dataset ;        \n"
          + "        rdfs:label   \"modified\"@en ;        \n"
          + "        rdfs:range   xsd:dateTime .        \n"
          + ":Csv2RdfDataMapping  a   owl:Class ;        \n"
          + "        rdfs:label       \"Csv2Rdf data mapping\"@en ;        \n"
          + "        rdfs:subClassOf  :DataMapping .        \n"
          + ":requiresService  a         owl:ObjectProperty ;        \n"
          + "        rdfs:domain         [ a            owl:Class ;        \n"
          + "                              owl:unionOf  ( :Tool :AuthorisedSessions :Job )        \n"
          + "                            ] ;        \n"
          + "        rdfs:label          \"requires\"@en ;        \n"
          + "        rdfs:range          lds:ComponentService ;        \n"
          + "        rdfs:subPropertyOf  :requires .        \n"
          + ":access  a             owl:ObjectProperty ;        \n"
          + "        rdfs:comment   \"Property that defines the Authorization for a Named Graph\"@en ;        \n"
          + "        rdfs:domain    sd:NamedGraph ;        \n"
          + "        rdfs:label     \"access\"@en ;        \n"
          + "        rdfs:range     acl:Authorization ;        \n"
          + "        owl:inverseOf  acl:accessTo .        \n"
          + ":OracleSpatial  a   :DatabaseType ;        \n"
          + "        rdfs:label  \"Oracle Spatial\"^^xsd:string .        \n"
          + ":sessionToken  a     owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :Account ;        \n"
          + "        rdfs:label   \"session token\"@en ;        \n"
          + "        rdfs:range   xsd:string .        \n"
          + ":DataMapping  a          owl:Class ;        \n"
          + "        rdfs:label       \"Data mapping\"@en ;        \n"
          + "        rdfs:subClassOf  owl:Thing .        \n"
          + ":dbPort  a           owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :Database ;        \n"
          + "        rdfs:label   \"Database port number\"^^xsd:string ;        \n"
          + "        rdfs:range   xsd:integer .        \n"
          + ":intervalDay  a             owl:DatatypeProperty ;        \n"
          + "        rdfs:domain         :Schedule ;        \n"
          + "        rdfs:label          \"interval day\"@en ;        \n"
          + "        rdfs:range          xsd:boolean ;        \n"
          + "        rdfs:subPropertyOf  :interval .        \n"
          + ":xmlDefinition  a    owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :Job ;        \n"
          + "        rdfs:label   \"Xml Definition\"@en ;        \n"
          + "        rdfs:range   xsd:string .        \n"
          + ":CsvFile  a              owl:Class ;        \n"
          + "        rdfs:label       \"Csv file\"@en ;        \n"
          + "        rdfs:subClassOf  :DataSource .        \n"
          + "dcterms:description  a  owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  void:Dataset ;        \n"
          + "        rdfs:label   \"description\"^^xsd:string ;        \n"
          + "        rdfs:range   xsd:string .        \n"
          + ":accessCount  a      owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  [ a            owl:Class ;        \n"
          + "                       owl:unionOf  ( :AuthorisedSessions :Account )        \n"
          + "                     ] ;        \n"
          + "        rdfs:label   \"access count\"@en ;        \n"
          + "        rdfs:range   xsd:integer .        \n"
          + "acl:owner  a         owl:ObjectProperty ;        \n"
          + "        rdfs:domain  [ a            owl:Class ;        \n"
          + "                       owl:unionOf  ( void:Dataset :AuthorisedSessions :Job )        \n"
          + "                     ] ;        \n" + "        rdfs:label   \"owner\"@en ;        \n"
          + "        rdfs:range   :User .        \n"
          + ":hasSchedule  a      owl:ObjectProperty ;        \n"
          + "        rdfs:domain  :Job ;        \n"
          + "        rdfs:label   \"has schedule\"@en ;        \n"
          + "        rdfs:range   :Schedule .        \n"
          + ":Database  a             owl:Class ;        \n"
          + "        rdfs:label       \"Database\"@en ;        \n"
          + "        rdfs:subClassOf  :DataSource .        \n"
          + ":User   a                owl:Class ;        \n"
          + "        rdfs:label       \"User\"@en ;        \n"
          + "        rdfs:subClassOf  owl:Thing .        \n"
          + ":rdfStoreUsername  a  owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :Account ;        \n"
          + "        rdfs:label   \"RDF store username\"@en ;        \n"
          + "        rdfs:range   xsd:string .        \n"
          + ":url    a            owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  [ a            owl:Class ;        \n"
          + "                       owl:unionOf  ( :DataSource :AuthorisedSessions )        \n"
          + "                     ] ;        \n" + "        rdfs:label   \"url\"@en ;        \n"
          + "        rdfs:range   xsd:anyURI .        \n"
          + ":intervalMonth  a           owl:DatatypeProperty ;        \n"
          + "        rdfs:domain         :Schedule ;        \n"
          + "        rdfs:label          \"interval month\"^^xsd:string ;        \n"
          + "        rdfs:range          xsd:boolean ;        \n"
          + "        rdfs:subPropertyOf  :interval .        \n"
          + ":requiresDatasource  a      owl:ObjectProperty ;        \n"
          + "        rdfs:domain         :Job ;        \n"
          + "        rdfs:label          \"Authorised Sessions \"@en ;        \n"
          + "        rdfs:range          :DataSource ;        \n"
          + "        rdfs:subPropertyOf  :requires .        \n"
          + ":rdfStorePassword  a  owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :Account ;        \n"
          + "        rdfs:label   \"RDF Store Password\"@en ;        \n"
          + "        rdfs:range   xsd:string .        \n" + ":extractionAndLoading        \n"
          + "        a           :ToolCategory ;        \n"
          + "        rdfs:label  \"Extraction and Loading\"@en .        \n"
          + ":dbHost  a           owl:DatatypeProperty ;        \n"
          + "        rdfs:domain  :Database ;        \n"
          + "        rdfs:label   \"Service URL\"^^xsd:string ;        \n"
          + "        rdfs:range   xsd:string .        \n";

  /** Read the ontology definition into the source model */
  static {
    m_model.read(new ByteArrayInputStream(SOURCE.getBytes()), null, "N3");
  }

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
  public static final String VERSION_INFO = "0.1.2";


  public static Model getModel() {
    return m_model;
  }

  /**
   * <p>
   * Property that defines the Authorization for a Named Graph
   * </p>
   */
  public static final Property access = m_model
      .createProperty("http://ldiw.ontos.com/ontology/access");

  public static final Property accessCount = m_model
      .createProperty("http://ldiw.ontos.com/ontology/accessCount");

  public static final Property account = m_model
      .createProperty("http://ldiw.ontos.com/ontology/account");

  public static final Property category = m_model
      .createProperty("http://ldiw.ontos.com/ontology/category");

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
   * If the component requires user/password authentication method (for instance a database)
   * </p>
   */
  public static final Property dbUser = m_model
      .createProperty("http://ldiw.ontos.com/ontology/dbUser");

  public static final Property end = m_model.createProperty("http://ldiw.ontos.com/ontology/end");

  public static final Property frameworkDataDir = m_model
      .createProperty("http://ldiw.ontos.com/ontology/frameworkDataDir");

  /**
   * <p>
   * A role is configured with a set of Modules it can use {@en}
   * </p>
   */
  public static final Property hasAccess = m_model
      .createProperty("http://ldiw.ontos.com/ontology/hasAccess");

  public static final Property hasSchedule = m_model
      .createProperty("http://ldiw.ontos.com/ontology/hasSchedule");

  public static final Property interval = m_model
      .createProperty("http://ldiw.ontos.com/ontology/interval");

  public static final Property intervalDay = m_model
      .createProperty("http://ldiw.ontos.com/ontology/intervalDay");

  public static final Property intervalMonth = m_model
      .createProperty("http://ldiw.ontos.com/ontology/intervalMonth");

  public static final Property intervalWeek = m_model
      .createProperty("http://ldiw.ontos.com/ontology/intervalWeek");

  /**
   * <p>
   * This may disappear with the use of hasAccess property based on the definition of Tools
   * </p>
   */
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

  public static final Property jsonString = m_model
      .createProperty("http://ldiw.ontos.com/ontology/jsonString");

  public static final Property lastAccessLocation = m_model
      .createProperty("http://ldiw.ontos.com/ontology/lastAccessLocation");

  public static final Property lastAcess = m_model
      .createProperty("http://ldiw.ontos.com/ontology/lastAcess");

  public static final Property mapFileString = m_model
      .createProperty("http://ldiw.ontos.com/ontology/mapFileString");

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

  public static final Property requires = m_model
      .createProperty("http://ldiw.ontos.com/ontology/requires");

  public static final Property requiresDatasource = m_model
      .createProperty("http://ldiw.ontos.com/ontology/requiresDatasource");

  public static final Property requiresService = m_model
      .createProperty("http://ldiw.ontos.com/ontology/requiresService");

  public static final Property requiresSession = m_model
      .createProperty("http://ldiw.ontos.com/ontology/requiresSession");

  public static final Property role = m_model.createProperty("http://ldiw.ontos.com/ontology/role");

  public static final Property route = m_model
      .createProperty("http://ldiw.ontos.com/ontology/route");

  public static final Property sessionToken = m_model
      .createProperty("http://ldiw.ontos.com/ontology/sessionToken");

  public static final Property smtpHost = m_model
      .createProperty("http://ldiw.ontos.com/ontology/smtpHost");

  public static final Property smtpSslPort = m_model
      .createProperty("http://ldiw.ontos.com/ontology/smtpSslPort");

  public static final Property smtpTlsPort = m_model
      .createProperty("http://ldiw.ontos.com/ontology/smtpTlsPort");

  public static final Property springBatchAdminJobsDir = m_model
      .createProperty("http://ldiw.ontos.com/ontology/springBatchAdminJobsDir");

  public static final Property start = m_model
      .createProperty("http://ldiw.ontos.com/ontology/start");

  public static final Property url = m_model.createProperty("http://ldiw.ontos.com/ontology/url");

  public static final Property xmlDefinition = m_model
      .createProperty("http://ldiw.ontos.com/ontology/xmlDefinition");

  /**
   * <p>
   * Account for the workbench
   * </p>
   */
  public static final Resource Account = m_model
      .createResource("http://ldiw.ontos.com/ontology/Account");

  /**
   * <p>
   * Sessions are fake endpoints provided to the Jobs in order to access private data.
   * </p>
   */
  public static final Resource AuthorisedSessions = m_model
      .createResource("http://ldiw.ontos.com/ontology/AuthorisedSessions");

  public static final Resource Csv2RdfDataMapping = m_model
      .createResource("http://ldiw.ontos.com/ontology/Csv2RdfDataMapping");

  public static final Resource CsvFile = m_model
      .createResource("http://ldiw.ontos.com/ontology/CsvFile");

  public static final Resource DataMapping = m_model
      .createResource("http://ldiw.ontos.com/ontology/DataMapping");

  public static final Resource DataSource = m_model
      .createResource("http://ldiw.ontos.com/ontology/DataSource");

  public static final Resource Database = m_model
      .createResource("http://ldiw.ontos.com/ontology/Database");

  public static final Resource DatabaseType = m_model
      .createResource("http://ldiw.ontos.com/ontology/DatabaseType");

  public static final Resource Job = m_model.createResource("http://ldiw.ontos.com/ontology/Job");

  public static final Resource License = m_model
      .createResource("http://ldiw.ontos.com/ontology/License");

  public static final Resource Ontology = m_model
      .createResource("http://ldiw.ontos.com/ontology/Ontology");

  /**
   * <p>
   * Class associate with rights to use service which could be assigned to users.
   * </p>
   */
  public static final Resource Role = m_model.createResource("http://ldiw.ontos.com/ontology/Role");

  public static final Resource SPARQLEndpoint = m_model
      .createResource("http://ldiw.ontos.com/ontology/SPARQLEndpoint");

  public static final Resource Schedule = m_model
      .createResource("http://ldiw.ontos.com/ontology/Schedule");

  /**
   * <p>
   * A Tool is the actual interface in the Workbench that is going to be used for a specific task
   * (i.e. transform Relational data to RDF)
   * </p>
   */
  public static final Resource Tool = m_model.createResource("http://ldiw.ontos.com/ontology/Tool");

  /**
   * <p>
   * The tools are categorised in order to show them in the corresponding menu on the workbench
   * </p>
   */
  public static final Resource ToolCategory = m_model
      .createResource("http://ldiw.ontos.com/ontology/ToolCategory");

  public static final Resource User = m_model.createResource("http://ldiw.ontos.com/ontology/User");

  public static final Resource ClassificationAndEnrichment = m_model
      .createResource("http://ldiw.ontos.com/ontology/ClassificationAndEnrichment");

  public static final Resource IBM_DB2 = m_model
      .createResource("http://ldiw.ontos.com/ontology/IBM_DB2");

  public static final Resource LinkingAndFusing = m_model
      .createResource("http://ldiw.ontos.com/ontology/LinkingAndFusing");

  public static final Resource ManualRevisionAndAuthoring = m_model
      .createResource("http://ldiw.ontos.com/ontology/ManualRevisionAndAuthoring");

  public static final Resource MicrosoftSQLServer = m_model
      .createResource("http://ldiw.ontos.com/ontology/MicrosoftSQLServer");

  public static final Resource MySQL = m_model
      .createResource("http://ldiw.ontos.com/ontology/MySQL");

  public static final Resource OracleSpatial = m_model
      .createResource("http://ldiw.ontos.com/ontology/OracleSpatial");

  public static final Resource PostGIS = m_model
      .createResource("http://ldiw.ontos.com/ontology/PostGIS");

  public static final Resource SearchQueryingAndExploration = m_model
      .createResource("http://ldiw.ontos.com/ontology/SearchQueryingAndExploration");

  public static final Resource extractionAndLoading = m_model
      .createResource("http://ldiw.ontos.com/ontology/extractionAndLoading");

}
