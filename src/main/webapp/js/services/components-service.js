'use strict';

var module = angular.module('app.components-service', []);

module.factory('ComponentsService', function ($http, $q) {

	var service = {

		getAllComponents : function(){
			return $http.get("rest/components").then( 
				// success
				function (response){
					return response.data.components;
	    });
		},

		getComponent: function(id){
			return $http.get("rest/components/"+id).then( 
				// success
				function (response){
					return response.data.component;
	    	});	
		},
		// parse the component data to find a service
		getComponentService : function(uri, component){
			for(var i in component.services){
				if (component.services[i].uri == uri)
					return component.services[i];
			}
			return null;
		}
	};

	return service;

});