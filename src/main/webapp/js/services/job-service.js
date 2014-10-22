'use strict';

var module = angular.module('app.job-service', []);

module.factory('JobService', function ($http, $q, AccountService) {

	var jobService = {

		getAllJobs : function(){
			var config = { params: { username: AccountService.getUsername() }};
			return $http.get("rest/jobs", config).then( function (result){
					return result.data.jobs;
	    });
		}

	};

	return jobService;

});