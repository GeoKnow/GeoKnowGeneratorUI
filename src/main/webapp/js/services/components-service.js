'use strict';

var module = angular.module('app.components-service', []);

module.factory('ComponentsService', function ($http, $q, ConfigurationService) {


	var service = {

		getAllComponents : function(){
			return $http.get("rest/components").then( 
				// success
				function (response){
					return response.data.components;
	    });
		},

		getComponent: function(id){
			return $http.get("rest/components/" + id).then( 
				// success
				function (response){
					return response.data.component;
	    	});	
		},
		// parse the component data to find a service
		getComponentService : function(id, component){
			var uri = ConfigurationService.getUriBase() + id;
			
			for(var i in component.services){
				console.log(uri) + " ==?" + component.services[i].uri;	
				if (component.services[i].uri == uri)
					return component.services[i];
			}
			return null;
		},

		getAllServices : function(){
			return $http.get("rest/services").then( 
				// success
				function (response){
					return response.data.services;
	    });
		},

		getService: function(id){
			return $http.get("rest/services/"+id).then( 
				// success
				function (response){
					return response.data.service;
	    });
		},

		updateService : function(service){
			var request = {
				method: 'PUT',
 				url: "rest/components/services/",
 				headers: {
   				'Content-Type': 'application/json'
 				},
 				data: service
			};
			return $http(request).then(function(response){
				return response.data.service;
			});
		}, 
/*

Not implemented yet

		addService : function(service){
			var request = {
				method: 'POST',
 				url: "rest/components/services/",
 				headers: {
   				'Content-Type': 'application/json'
 				},
 				data: service
			};
			return $http(request).then(function(response){
				return response.data.service;
			});
		}, 
*/

	};

	return service;

});