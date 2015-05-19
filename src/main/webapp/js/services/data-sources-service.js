'use strict';

var module = angular.module('app.datasources-service', []);

module.factory('DatasourcesService', function ($http, $q) {

	var service = {

		getDatabaseTypes : function(){
			return $http.get("rest/datasources/database-types").then( 
				// success
				function (response){
					return response.data.databaseTypes;
	    });
		}, 

		getAllEndpoints : function() {
			return $http.get("rest/datasources/endpoints").then( 
				// success
				function (response){
					return response.data.endpoints;
	    });
		}
	};

	return service;

});