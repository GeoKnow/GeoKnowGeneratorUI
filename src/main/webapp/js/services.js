'use strict';

var module = angular.module('app.services', []);

module.factory('ConfiurationService', function() {

  var NamedGraphsStatic= { namedgraphs: [
        { name: "http://localhost:8890/DAV", graph: {label: "Default Graph", description:"", created:"2013-09-12", modified:"" }},
        { name: "http://generator.geoknow.eu/tests", graph: {label: "Testing Graph", description:"", created:"2013-09-12", modified:"" }},
        { name: "http://generator.geoknow.eu/settingsGraph", graph: {label: "Generator Settings", description:"", created:"2013-09-12",modified:""}},
        { name: "http://generator.geoknow.eu/schemaGraph", graph: {label: "LDS Schema", description:"", created:"2013-09-12",modified:""}},
        { name: "http://generator.geoknow.eu/serviceDescription", graph: {label: "Service Description", description:"", created:"2013-09-12",modified:""}}]};

  var SettingsService = {

    getEndpoint: function() {
      return CONFIG.getEndpoint();
    },

    getDefaultGraph: function() {
      return CONFIG.getGraph();
    },

    getUriBase: function() {
      return CONFIG.getUriBase();
    },

    /**
    * NAMESPACES functions
    */
    getNamespaces: function(){

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
  	getComponents: function() {
  		var results = [];
      var elements = CONFIG.select("rdf:type", "lds:StackComponent");
  		for (var resource in elements)
  		{
  			var element = elements[resource];
  			results.push(
  			{
  				uri      : "<" + resource + ">"
  			,	url      : resource
  			,	label    : element["rdfs:label"][0]
  			,	version  : element[":version"]
  			,	category : element[":category"]
  			});
  		}
		  return { components: results };     
    },

    /**
    * NAMEDGRAPH functions
    *
    * for each named graph the rdf would be
    * :settingsGraph a sd:NamedGraph;
    *     sd:name :settingsGraph;
    *     sd:graph [
    *               a sd:Graph, void:Dataset;
    *               rdfs:label "Generator Settings";
    *               dcterms:description "GeoKnow Generator settings and configurations";
    *               foaf:homepage <http://localhost/#/settings/>; 
    *               dcterms:modified "2013-09-12"^^xsd:date;
    *               dcterms:created "2013-09-12"^^xsd:date;
    *               void:sparqlEndpoint <http://localhost:8890/sparql>;
    *           ];
    */
    // TODO @Vadim: implement a CONFIG.select(uri), to get the graph properties
    getNamedGraphs: function() {
      var results = [];
  		var elements = CONFIG.select("rdf:type", "sd:NamedGraph");
  		for (var resource in elements)
  		{
  			var element = elements[resource];
        // TODO: to read the sd:graph properties and add to the results
        results.push(
  			{
  				name  : element["sd:name"][0] // name is the URI
        , graph : { label : element["sd:name"][0] }// to be replaced with the graph description
  			});  
  		}
  		return results;      
    },

    getNamedGraph: function(name) {
      return NamedGraphsStatic.namedgraphs[1];  // dummy allways return the same to test
    },

    // add a named graph in the store
    addGraph: function(namedGraph) {
  		CONFIG.createGraph(namedGraph);

      return true;
    },

    // saves a named graph in the store
    updateGraph: function(namedGraph) {
      alert(" to implement update graph");
      return true;
    },

    // saves a named graph in the store
    deleteGraph: function(namedGraph) {
  		CONFIG.dropGraph(namedGraph);
      return true;
    }

  };
  return SettingsService;
});