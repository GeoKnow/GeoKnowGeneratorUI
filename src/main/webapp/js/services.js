'use strict';

var module = angular.module('app.services', []);


module.factory('DateService', function(){
  var DateService = {
    getCurrentDate : function(){
      var now = new Date();
      //"YYYY-MM-DDThh:mm:ss"^^xsd:date;
      var month = now.getMonth() + 1; // getMonth returns values from 0 to 11
      var s_now = now.getFullYear() + "-" 
              + (month.toString().length==1 ? "0"+ month : month + "-") 
              + (now.getDate().toString().length==1 ? "0"+now.getDate() : now.getDate())
              + "T" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
      return s_now;
    }
  }
  return DateService;
});

module.factory('ServerErrorResponse', function() {

  var ServerErrorResponseService = {

   getMessage: function(statusText){
   
    var statusText = '';
      switch (status) {
      case 400:
        statusText = 'Bad Request';
        break;
      case 401:
        statusText = 'Unauthorized';
        break;
      case 403:
        statusText = 'Forbidden';
        break;
      case 404:
        statusText = 'Not Found ';
        break;
      case 500:
        statusText = 'Internal Server Error';
        break;
      default:
        statusText = 'An error occurred:'+status;
      };
      return statusText;
    }
  };
  return ServerErrorResponseService;
});

module.factory('ConfigurationService', function(Config) {

  var SettingsService = {

    setSPARQLEndpoint: function(endpoint) {
      Config.setEndpoint(endpoint);
    },

    getSPARQLEndpoint: function() {
      return Config.getEndpoint();
    },

    setUriBase: function(uri) {
      Config.setNS(uri);
    },

    getUriBase: function() {
      return Config.getNS();
    },

    getSettingsGraph: function() {
      return Config.getGraph();
    },

    deleteResource: function(uri){
      var settings = Config.getSettings();
      delete settings[uri];
      Config.write();
      return true;
    },

    getResourcesType : function(type){
      var results = [];
      var elements = Config.select("rdf:type", type);
      for (var resource in elements)
      {
        var element = elements[resource];
        results.push(this.elementToJson(resource, element));
      }
      return results; 
    },
    

    getIdentifiers: function(){
      Config.read(); //update the list of identifiers
      return Object.keys(Config.getSettings());
    },

    getDatabaseTypes: function(){
      var results = [];
      var elements = Config.select("rdf:type", "gkg:DatabaseType");
      for (var resource in elements)
      {
        var element = elements[resource];
        results.push(
        {
          uri      : resource
        , label    : element["rdfs:label"][0]
        });
      }
      return results;
    },

    // TODO: improve the function the will replace all the json object building
    // but this may be easier to do on the config.js since there we know the propertyTypes
    elementToJson: function(resource, element){
      //create the json string
      var jsonStr = '{ "uri" : "' + resource + '", '; 
      if(typeof element == "object"){ // do not consider arrays
        for (var prop in element)
          if (element[prop].length == 1)
            jsonStr += ' "' + prop.substring(prop.indexOf(':')+1, prop.length) + '" : "' + element[prop][0] + '",';
          //else make recursive
      }
      jsonStr += '}';
      // convert the json string into a object
      var results = eval ("(" + jsonStr + ")");
      return results;
    },

    /**
    * Data Sources Endpoint functions
    */
    getAllEndpoints: function(){
      var results = [];
      var elements = Config.select("rdf:type", "gkg:SPARQLEndpoint");

      for (var resource in elements)
      {
        var element = elements[resource];
        results.push(
        {
          uri      : resource
        , label    : element["rdfs:label"][0]
        , endpoint : element["void:sparqlEndpoint"][0]
        , homepage : element["foaf:homepage"][0]
        });
      }
      return results;
    },

    getEndpoint: function(uri){
      var settings = Config.getSettings();
      var results = {
          uri      : uri
        , label    : settings[uri]["rdfs:label"][0]
        , endpoint : settings[uri]["void:sparqlEndpoint"][0]
        , homepage : settings[uri]["foaf:homepage"][0]
      };
      return results;  
    },

    addEndpoint: function(endpoint){
      var settings = Config.getSettings();
      settings[endpoint.uri] = { 
                    "rdfs:label" : [endpoint.label]
                  , "foaf:homepage" : [endpoint.homepage]
                  , "rdf:type": ["void:Dataset", "gkg:SPARQLEndpoint", "gkg:DataSource"] 
                  , "void:sparqlEndpoint" : [endpoint.endpoint]
                };
      Config.write();
      return true;
    },

    updateEndpoint: function(pEndpoint){
      var endpoint = Config.getSettings()[pEndpoint.uri];
      endpoint["rdfs:label"][0] = pEndpoint.label;
      endpoint["void:sparqlEndpoint"][0] = pEndpoint.endpoint;
      endpoint["foaf:homepage"][0] = pEndpoint.homepage;
      Config.write();
      return true;
    },

    /**
    * Data Sources Database functions
    */
    getAllDatabases: function(){
      var results = [];
      var elements = Config.select("rdf:type", "gkg:Database");
      for (var resource in elements)
      {
        var element = elements[resource];
        // var typeLabel = Config.getSettings()[element["gkg:dbType"][0]]["rdfs:label"];
        var type = Config.getSettings()[element["gkg:dbType"][0]];
        
        if(type != undefined)
          type = type["rdfs:label"][0];
        results.push(
        {
          uri  : resource
        , label       : element["rdfs:label"][0]
        , dbHost      : element["gkg:dbHost"][0]
        , dbName      : element["gkg:dbName"][0]
        , dbUser      : element["gkg:dbUser"][0]
        , dbPort      : element["gkg:dbPort"][0]
        , dbType      : type
        , dbPassword  : element["gkg:dbPassword"][0]
        });
      }
      return results;     
    },

    getDatabase: function(uri){
      var settings = Config.getSettings();
      var results = {
          uri        : uri
        , label      : settings[uri]["rdfs:label"][0]
        , dbHost     : settings[uri]["gkg:dbHost"][0]
        , dbName     : settings[uri]["gkg:dbName"][0]
        , dbPort     : settings[uri]["gkg:dbPort"][0]
        , dbType     : settings[uri]["gkg:dbType"][0]
        , dbUser     : settings[uri]["gkg:dbUser"][0]
        , dbPassword : settings[uri]["gkg:dbPassword"][0]
      };
      return results; 
    },

    addDatabase: function(database){
      var settings = Config.getSettings();
      settings[database.uri] = { 
                    "rdfs:label"     : [database.label]
                  , "gkg:dbHost"     : [database.dbHost]
                  , "rdf:type"       : ["void:Dataset", "gkg:Database", "gkg:DataSource"] 
                  , "gkg:dbPort"     : [database.dbPort]
                  , "gkg:dbName"     : [database.dbName]
                  , "gkg:dbType"     : [database.dbType]
                  , "gkg:dbUser"     : [database.dbUser]
                  , "gkg:dbPassword" : [database.dbPassword]
                };
      Config.write();
      return true;
    },

    updateDatabase: function(pDatabase){
      var database = Config.getSettings()[pDatabase.uri];
      database["rdfs:label"][0]      = pDatabase.label;
      database["gkg:dbHost"][0]      = pDatabase.dbHost;
      database["gkg:dbType"][0]      = pDatabase.dbType;
      database["gkg:dbPort"][0]      = pDatabase.dbPort;
      database["gkg:dbName"][0]      = pDatabase.dbName;
      database["gkg:dbUser"][0]      = pDatabase.dbUser;
      database["gkg:dbPassword"][0]  = pDatabase.dbPassword;
      Config.write();
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

    getComponent : function(uri){
      var component = Config.getSettings()[uri];
      var results = this.elementToJson(uri, component)
      return results; 
    },

    getComponentServices : function(uri, serviceType){
      var settings = Config.getSettings();
      var elements = settings[uri]["lds:providesService"];
      
      var results = [];
      for (var resource in elements)
      {
        var element = elements[resource];

        // TODO: get a new version of config.js to provide also blanc nodes as URIS
        // if element is an string is an URI, otherwise is a nested node (blanc)
        if( typeof element == "string"){
          element = settings[element];
        }

        if (typeof serviceType != "undefined" && element["rdf:type"].indexOf(serviceType) === -1)
          continue; // not of the required type
        
        results.push(this.elementToJson(resource, element));
      }
      return results; 
    },

  	getAllComponents: function() {
  		var results = [];
      var elements = Config.select("rdf:type", "lds:StackComponent");
  		for (var resource in elements)
  		{
  			var element = elements[resource];
        results.push(this.elementToJson(resource, element));
  		}
		  return results;     
    },

    /**
    * Named Graphs functions
    */
    getAllNamedGraphs: function() {
      var results = [];
  		var elements = Config.select("rdf:type", "sd:NamedGraph");
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
      var settings = Config.getSettings();
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
      
      var graph = { "rdf:type" : ["sd:NamedGraph"]
                  ,  "sd:name" : [namedGraph.name]
                  ,  "sd:graph" : [{ "rdfs:label" : [namedGraph.graph.label]
                                     , "rdf:type": ["void:Dataset", "sd:Graph"] 
                                     , "dcterms:description" : [namedGraph.graph.description]
                                     , "dcterms:modified" : [namedGraph.graph.modified]
                                     , "dcterms:created" : [namedGraph.graph.created]
                                     , "void:sparqlEndpoint" : [namedGraph.graph.endpoint]
                                  }] };
      // create the graph
      Config.createGraph(Config.getNS()+namedGraph.name.replace(':',''));
      // if the creation succeed, then add the metadata
      // insert the metadata of the graph
      var settings = Config.getSettings();
      settings[namedGraph.name] = graph;
      console.log(settings[":default-dataset"]["rdf:type"]);
      settings[":default-dataset"]["sd:namedGraph"].push(namedGraph.name);
      Config.write();
      return true;
    },

    // saves a named graph in the store
    updateGraph: function(namedGraph) {
      var graph = Config.getSettings()[namedGraph.name];
      graph["sd:graph"][0]["rdfs:label"][0] = namedGraph.graph.label;
      graph["sd:graph"][0]["dcterms:description"][0]= namedGraph.graph.description;
      graph["sd:graph"][0]["dcterms:modified"][0] = namedGraph.graph.modified;
      graph["sd:graph"][0]["dcterms:created"][0] = namedGraph.graph.created;
      graph["sd:graph"][0]["void:sparqlEndpoint"][0] = namedGraph.graph.endpoint;
      Config.write();
      return true;
    },

    // saves a named graph in the store
    deleteGraph: function(graphName) {
  		Config.dropGraph(graphName.replace(':',Config.getNS()));
      // if the creation succeed, then delete the metadata
      var settings = Config.getSettings();
      settings[":default-dataset"]["sd:namedGraph"].pop(graphName);
      delete settings[graphName];
      Config.write();
      return true;
    }

  };
  return SettingsService;
});