'use strict';

var module = angular.module('app.roles-service', []);

module.factory('RolesService', function ($http) {


	var service = {

		getAllRoles : function(){
			return $http.get("rest/roles").then( 
				// success
				function (response){
					return response.data.roles;
	    });
		},

		getDefaultRole : function(){
			return $http.get("rest/roles").then( 
				// success
				function (response){
					for(var i in response.data.roles)
            if(response.data.roles[i].isDefault)
              return response.data.roles[i];
          // not Default defined
					return null;
	    });
		},
		getNotLoggedInRole : function(){
			return $http.get("rest/roles").then( 
				// success
				function (response){
					for(var i in response.data.roles)
            if(response.data.roles[i].isNotLoggedIn)
              return response.data.roles[i];
          // not NotLoggedInRole defined
					return null;
	    });
		},

		addRole : function(role){
			var request = {
				method: 'POST',
 				url: 'rest/roles',
 				headers: {
   				'Content-Type': 'application/json'
 				},
 				data: role
			};
			return $http(request).then(function(response){
				return response.data.role;
			});
		},

		deleteRole : function(uri){
			console.log("delete " + uri);
			var request = {
				method: 'DELETE',
 				url: 'rest/roles/'+uri,
			};

			return $http(request);

			// return $http.delete("rest/roles/"+uri);
		},

		updateRole : function(role){
			var request = {
				method: 'PUT',
 				url: 'rest/roles',
 				headers: {
   				'Content-Type': 'application/json'
 				},
 				data: role
			};

			return $http(request).then(function(response){
				return response.data.role;
			});

		},

		setDefaultRole : function(uri){
			var request = {
				method: 'PUT',
 				url: "rest/roles/default/"+uri,
 				headers: {
   				'Content-Type': 'application/json'
 				}
			};

			return $http(request).then();

			// return $http.put("rest/roles/BasicUser/"+uri);
		},

		setNotLoggedInRole : function(uri){
			var request = {
				method: 'PUT',
 				url: "rest/roles/not-logged-in/"+uri,
 				headers: {
   				'Content-Type': 'application/json'
 				}
			};

			return $http(request).then();
			//return $http.put("rest/roles/NotLoggedIn/"+uri);
		},
	}
	return service;

});