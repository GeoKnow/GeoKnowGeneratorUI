'use strict';

var module = angular.module('app.ontology-service', []);

module.factory("OntologyService", function($http, $q, ConfigurationService) {
    var d2rqServices = ConfigurationService.getComponentServices(":D2RQ");
    var d2rqServiceUrl = d2rqServices[0].serviceUrl;

    var ontologies = [];
    var isLoaded = false;

    var readOntologies = function() {
        if (isLoaded) {
            var deferred = $q.defer();
            deferred.resolve(ontologies);
            return deferred.promise;
        } else {
            return $http.get(d2rqServiceUrl + "/ontologies/uris/get")
                .then(function(response) {
                    ontologies = response.data;
                    isLoaded = true;
                });
        }
    };

    var refreshOntologies = function() {
        isLoaded = false;
        return readOntologies();
    };

    var getAllOntologies = function() {
        return ontologies;
    };

    return {
        readOntologies      : readOntologies,
        refreshOntologies   : refreshOntologies,
        getAllOntologies    : getAllOntologies
    };
});