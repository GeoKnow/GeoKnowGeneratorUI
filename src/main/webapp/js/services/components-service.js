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
		},

		getAllServices : function(){
			return $http.get("rest/services").then( 
				// success
				function (response){
					return response.data.services;
	    });
		},

		getService: function(uri){
			return $http.get("rest/services/"+uri).then( 
				// success
				function (response){
					return response.data.service;
	    });
		},
/*

Not implemented yet

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