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
		}
	};

	return service;

});