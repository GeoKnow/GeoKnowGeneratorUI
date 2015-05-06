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

		getNotLoggedInRole : function(){
			return $http.get("rest/roles").then( 
				// success
				function (response){
					for(var i in response.data.roles)
            if(response.data.roles[i].isNotLoggedIn)
              return response.data.roles[i];
          // not getNotLoggedInRole defined
					return null;
	    });
		},

		addRole : function(role){
			return $http.put("rest/roles", role).then( 
				// success
				function (response){
					return response.data.role;
	    });
		},

		updateRole : function(role){
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

			// return $http.post("rest/roles", role).then( 
			// 	// success
			// 	function (response){
			// 		return response.data.role;
	  	//   });
		},

		setDefaultRole : function(uri){
			return $http.post("rest/roles/BasicUser/"+uri);
		},

		setNotLoggedInRole : function(uri){
			return $http.post("rest/roles/NotLoggedIn/"+uri);
		},
	}
	return service;

});