'use strict';

var module = angular.module('app.services', []);

module.factory('ConfigurationService', function() {

  var SettingsService = {

    getSPARQLEndpoint: function() {
      return CONFIG.getEndpoint();
    },

    getDefaultGraph: function() {
      return CONFIG.getGraph();
    },

    getUriBase: function() {
      return CONFIG.getNS();
    },

    deleteResource: function(uri){
      var settings = CONFIG.getSettings();
      delete settings[uri];
      CONFIG.write();
      return true;
    },

    getIdentifiers: function(){
      return Object.keys(CONFIG.getSettings());
    },

    /**
    * Data Sources Endpoint functions
    */
    getAllEndpoints: function(){
      var results = [];
      var elements = CONFIG.select("rdf:type", "lds:SPARQLendpoint");
      for (var resource in elements)
      {
        var element = elements[resource];
        results.push(
        {
          uri      : resource
        , label    : element["rdfs:label"][0]
        , endpoint    : element["void:sparqlEndpoint"][0]
        , homepage    : element["foaf:homepage"][0]
        });
      }
      return results;
    },

    getEndpoint: function(uri){
      var settings = CONFIG.getSettings();
      var results = {
          uri      : uri
        , label    : settings[uri]["rdfs:label"][0]
        , endpoint : settings[uri]["void:sparqlEndpoint"][0]
        , homepage : settings[uri]["foaf:homepage"][0]
      };
      return results;  
    },

    addEndpoint: function(endpoint){
      var settings = CONFIG.getSettings();
      settings[endpoint.uri] = { 
                    "rdfs:label" : [endpoint.label]
                  , "foaf:homepage" : [endpoint.homepage]
                  , "rdf:type": ["void:Dataset", "lds:SPARQLendpoint"] 
                  , "void:sparqlEndpoint" : [endpoint.endpoint]
                };
      CONFIG.write();
      return true;
    },

    updateEndpoint: function(pEndpoint){
      var endpoint = CONFIG.getSettings()[pEndpoint.uri];
      endpoint["rdfs:label"][0] = pEndpoint.label;
      endpoint["void:sparqlEndpoint"][0] = pEndpoint.endpoint;
      endpoint["foaf:homepage"][0] = pEndpoint.homepage;
      CONFIG.write();
      return true;
    },

    /**
    * Data Sources Database functions
    */
    getAllDatabases: function(){
      var results = [];
      var elements = CONFIG.select("rdf:type", "lds:Database");
      for (var resource in elements)
      {
        var element = elements[resource];
        results.push(
        {
          uri  : resource
        , label       : element["rdfs:label"][0]
        , server      : element["lds:serverIp"][0]
        , database    : element["lds:database"][0]
        , driver      : element["lds:driver"][0]
        , user        : element["lds:user"][0]
        , password    : element["lds:password"][0]
        });
      }
      return results;     
    },

    getDatabase: function(uri){
      var settings = CONFIG.getSettings();
      var results = {
          uri      : uri
        , label    : settings[uri]["rdfs:label"][0]
        , server   : settings[uri]["lds:serverIp"][0]
        , database : settings[uri]["lds:database"][0]
        , driver   : settings[uri]["lds:driver"][0]
        , user     : settings[uri]["lds:user"][0]
        , password : settings[uri]["lds:password"][0]
      };
      return results; 
    },

    addDatabase: function(database){
      var settings = CONFIG.getSettings();
      settings[database.uri] = { 
                    "rdfs:label"   : [database.label]
                  , "lds:serverIp" : [database.server]
                  , "rdf:type"     : ["void:Dataset", "lds:Database"] 
                  , "lds:database" : [database.database]
                  , "lds:driver"   : [database.driver]
                  , "lds:user"     : [database.user]
                  , "lds:password" : [database.password]
                };
      CONFIG.write();
      return true;
    },

    updateDatabase: function(pDatabase){
      var database = CONFIG.getSettings()[pDatabase.uri];
      database["rdfs:label"][0]    = pDatabase.label;
      database["lds:serverIp"][0]  = pDatabase.server;
      database["lds:driver"][0]    = pDatabase.driver;
      database["lds:database"][0]  = pDatabase.database;
      database["lds:user"][0]      = pDatabase.user;
      database["lds:password"][0]  = pDatabase.password;
      CONFIG.write();
      return true;
    },

    /**
    * NAMESPACES functions
    */
    getAllNamespaces: function(){

    },

    addNamespace: function(){

    },

    deleteNamespace: function(){

    },

    updateNamespace: function(){

    },

    /**
    * COMPONENTS functions
    */
    // TODO: @Alejandra add categories to the ontology and get them with the config service
    getComponentCategories: function() {
      return { categories:
        [ { name: "Extraction and Loading", id:"extraction-and-loading" },
          { name: "Querying and Exploration", id:"querying-and-exploration" },
          { name: "Authoring", id:"authoring" },
          { name: "Linking", id:"linking" },
          { name: "Enriching and Data Cleaning", id:"enriching-and-cleaning" }]
      }
    },
    
  	getAllComponents: function() {
  		var results = [];
      var elements = CONFIG.select("rdf:type", "lds:StackComponent");
  		for (var resource in elements)
  		{
  			var element = elements[resource];
  			results.push(
  			{
  				uri      : resource
  			,	url      : resource
  			,	label    : element["rdfs:label"][0]
  			,	version  : element["lds:version"][0]
  			,	category : element["lds:category"]
  			});
  		}
		  return results;     
    },

    /**
    * Named Graphs functions
    */
    getAllNamedGraphs: function() {
      var results = [];
  		var elements = CONFIG.select("rdf:type", "sd:NamedGraph");
  		for (var resource in elements)
  		{
  			var namedGraph = elements[resource];
        results.push(
  			{
  				name  : namedGraph["sd:name"][0] // name is the URI
          , graph : { 
              label : namedGraph["sd:graph"][0]["rdfs:label"][0] 
            , description : namedGraph["sd:graph"][0]["dcterms:description"][0]
            , modified : namedGraph["sd:graph"][0]["dcterms:modified"][0]
            , created : namedGraph["sd:graph"][0]["dcterms:created"][0]
            , endpoint : namedGraph["sd:graph"][0]["void:sparqlEndpoint"][0]
          }
  			});  
  		}
  		return results;      
    },

    getNamedGraph: function(name) {
      var settings = CONFIG.getSettings();
      var results = {
          name  : settings[name]["sd:name"][0] // name is the URI
          , graph : { 
              label : settings[name]["sd:graph"][0]["rdfs:label"][0] 
            , description : settings[name]["sd:graph"][0]["dcterms:description"][0]
            , modified : settings[name]["sd:graph"][0]["dcterms:modified"][0]
            , created : settings[name]["sd:graph"][0]["dcterms:created"][0]
            , endpoint : settings[name]["sd:graph"][0]["void:sparqlEndpoint"][0]
          }};
      return results;  
    },

    // add a named graph in the store
    addGraph: function(namedGraph) {
      // create the metadata for the graph
      var graphName = namedGraph.name
      var graph = { "rdf:type" : ["sd:NamedGraph"]
                  ,  "sd:name" : [graphName]
                  ,  "sd:graph" : [{ "rdfs:label" : [namedGraph.graph.label]
                                     , "rdf:type": ["void:Dataset", "sd:Graph"] 
                                     , "dcterms:description" : [namedGraph.graph.description]
                                     , "dcterms:modified" : [namedGraph.graph.modified]
                                     , "dcterms:created" : [namedGraph.graph.created]
                                     , "void:sparqlEndpoint" : [namedGraph.graph.endpoint]
                                  }] };
      // create the graph
      CONFIG.createGraph(CONFIG.getNS()+namedGraph.name);
      // if the creation succeed, then add the metadata
      // insert the metadata of the graph
      var settings = CONFIG.getSettings();
      settings[graphName] = graph;
      settings[":default-dataset"]["sd:namedGraph"].push(graphName);
      CONFIG.write();
      return true;
    },

    // saves a named graph in the store
    updateGraph: function(namedGraph) {
      var graph = CONFIG.getSettings()[namedGraph.name];
      // graph["sd:graph"][0]["rdfs:label"][0] = namedGraph.graph.label;
      // graph["sd:graph"][0]["dcterms:description"][0]= namedGraph.graph.description;
      // graph["sd:graph"][0]["dcterms:modified"][0] = namedGraph.graph.modified;
      // graph["sd:graph"][0]["dcterms:created"][0] = namedGraph.graph.created;
      // graph["sd:graph"][0]["void:sparqlEndpoint"][0] = namedGraph.graph.endpoint;
      CONFIG.write();
      return true;
    },

    // saves a named graph in the store
    deleteGraph: function(graphName) {
  		CONFIG.dropGraph(graphName.replace(':',CONFIG.getNS()));
      // if the creation succeed, then delete the metadata
      var settings = CONFIG.getSettings();
      settings[":default-dataset"]["sd:namedGraph"].pop(graphName);
      delete settings[graphName];
      CONFIG.write();
      return true;
    }

  };
  return SettingsService;
});