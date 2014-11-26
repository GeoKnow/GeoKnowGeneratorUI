'use strict';

var module = angular.module('app.authsession-service', []);

module.factory("AuthSessionService", function ($http) {

	var service = {

		createSession : function() {
      return $http({
        url: "rest/session",
        method: "PUT"
      });
		},

		deleteSession : function(id) {
      return $http({
        url: "rest/session/"+id,
        method: "DELETE"
      });
		}
	};

	return service;

});