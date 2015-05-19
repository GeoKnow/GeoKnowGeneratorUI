'use strict';

var module = angular.module('app.import-rdf-service', []);

module.factory('ImportRdfService', function ($http, Ns) {


	var service = {

		importFromFile : function(file, targetGraph){
			var config ={
        fileName: file, 
        targetGraph: Ns.lengthen(targetGraph)
      }; 
      console.log(config);
			return $http({
        url: 'rest/import-rdf/file', 
        method: "POST",
        data: config,
        headers: { 'Content-Type': 'application/json' },
        contentType: "application/json; charset=utf-8"
      });
		},

		importFromUrl : function(inputUrl, targetGraph){
			var config ={
        rdfUrl: inputUrl, 
        targetGraph: Ns.lengthen(targetGraph), 
      };
      console.log(config);

      return $http({
        url: 'rest/import-rdf/url', 
        method: "POST",
        data: config,
        headers: { 'Content-Type': 'application/json' },
        contentType: "application/json; charset=utf-8"
      });
		}, 

		importFromEndpoint : function(sparqlQuery, endPoint, targetGraph){
			var config ={
        sparqlQuery: sparqlQuery,
        sourceEndpoint: endPoint, 
        targetGraph: Ns.lengthen(targetGraph), 
      };
      console.log(config);

      response = $http({
        url: 'rest/import-rdf/endpoint-query', 
        method: "POST",
        data: config,
        headers: { 'Content-Type': 'application/json' },
        contentType: "application/json; charset=utf-8"
      });
		}, 

		importFromLocalEndpoint : function(sourceGraph, targetGraph, sparqlQuery){
			var config ={
        sparqlQuery: sparqlQuery,
        targetGraph: Ns.lengthen(targetGraph), 
        sourceGraph: Ns.lengthen(sourceGraph), 
      };
      console.log(config);

      response = $http({
        url: 'rest/import-rdf/local-query', 
        method: "POST",
        data: config,
        headers: { 'Content-Type': 'application/json' },
        contentType: "application/json; charset=utf-8"
      });
		}

	};
	return service;
});