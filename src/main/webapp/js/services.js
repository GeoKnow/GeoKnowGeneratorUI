'use strict';

var module = angular.module('app.services', []);

module.factory('SettingsServiceStatic', function($http) {

  var NamedGraphsStatic= { namedgraphs: [
        { name: "http://localhost:8890/DAV", graph: {label: "Defautl Graph", description:"", created:"2013-09-12", modified:"" }},
        { name: "http://generator.geoknow.eu/tests", graph: {label: "Testing Graph", description:"", created:"2013-09-12", modified:"" }},
        { name: "http://generator.geoknow.eu/settingsGraph", graph: {label: "Generator Settings", description:"", created:"2013-09-12",modified:""}},
        { name: "http://generator.geoknow.eu/schemaGraph", graph: {label: "LDS Schema", description:"", created:"2013-09-12",modified:""}},
        { name: "http://generator.geoknow.eu/serviceDescription", graph: {label: "Service Description", description:"", created:"2013-09-12",modified:""}}]};

  var SettingsService = {

    getComponentCategories: function() {
      return { categories:
        [ { name: "Extraction and Loading", id:"extraction-and-loading" },
          { name: "Querying and Exploration", id:"querying-and-exploration" },
          { name: "Authoring", id:"authoring" },
          { name: "Linking", id:"linking" },
          { name: "Enriching and Data Cleaning", id:"enriching-and-cleaning" }]
      }
    },
    
<<<<<<< HEAD
    getComponents: function() {
=======
	getComponents: function() {
/*
		var components = [];

		var elements = CONFIG.select("rdf:type", ":component");
		for (var resource in elements)
		{
			var element = elements[resource];
			components.push(
			{
				uri      : "<" + resource + ">"
			,	url      : resource
			,	label    : element["rdfs:label"][0]
			,	version  : element[":version"][0]
			,	category : element[":category"][0]
			,	route    : element[":route"][0]
			});
		}

		return { components: components };
*/
>>>>>>> Configuration management updated.
      return { components:
        [ { uri: "<http://geoknow.eu/resource/Virtuoso>", label: "Virtuoso", version:"6", category:"storage-querying", 
            url: "http://192.168.43.209:8890/conductor", route:"/authoring/ontowiki"},
          { uri: "<http://geoknow.eu/resource/ontowiki>", label: "OntoWiki", version:"0.9.7", category:"authoring", 
            url: "http://10.0.0.90/ontowiki", route:"/authoring/ontowiki"},
          { uri: "<http://geoknow.eu/resource/Facete>", label: "Facete", version:"0.1-SNAPSHOT", category:"querying-and-exploration", 
            url: "http://10.0.0.90/facete", route:"/querying-and-exploration/facete"},
          { uri: "<http://geoknow.eu/resource/geoknow-workbench>", label: "GeoKnow Workbench", version:"0.1.0", 
            url: "http://localhost/geoknow-workbench" } ] 
      };      
    },

    getEndpoint: function() {
      return "http://10.0.0.64:8890/sparql" ;      
    },

    getDefaultGraph: function() {
      return "<http://localhost:8890/DAV>";      
    },

    // get all named graphs described in the service description graph
//     SELECT ?namedGraph ?name ?graph
// WHERE {
// ?namedGraph a sd:NamedGraph .
// ?namedGraph sd:name ?name .
// ?namedGraph sd:graph ?graph .
// }
    getNamedGraphs: function() {
      return NamedGraphsStatic;      
    },

  // get all named graphs described in the service description graph
//   SELECT ?s ?p
// WHERE {
// <http://generator.geoknow.eu/serviceDescription> sd:graph ?graph .
// ?graph ?s ?p
// }
    getNamedGraph: function(name) {
      return NamedGraphsStatic.namedgraphs[1];  // dummy allways return the same to test
    },

    // add a named graph in the store
    createGraph: function(namedGraph) {
      alert("insert graph");
      return true;
    },

    // saves a named graph in the store
    updateGraph: function(namedGraph) {
      alert("save graph");
      return true;
    },

    // saves a named graph in the store
    deleteGraph: function(namedGraph) {
      alert("delete graph");
      return true;
    }

  };
  return SettingsService;
});