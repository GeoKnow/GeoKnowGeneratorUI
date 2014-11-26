'use strict';

var module = angular.module('app.job-service', []);

module.factory('JobService', function ($http, $q) {

	var jobService = {

		getAllJobs : function(){
			return $http.get("rest/jobs").then( 
				// success
				function (response){
					return response.data.jobs;
	    });
		},

		getJob : function(jobName){
			
			return $http.get("rest/jobs/"+jobName).then( 
				// success
				function (response){
					return response.data;
	    	});	
		},

		run : function(jobName){
			return $http.post("rest/jobs/"+jobName+"/run").then( 
				// success
				function (response){
					return response.data;
	    	});
		},

		deleteJob : function(jobName){
			return $http.delete("rest/jobs/"+jobName);
		},

		/**
		* body is encoced to avoid confusion with the job object in the case
		* where the body content for the service is also json
		*/
		addServiceJob : function(id, pdescription, pservice, pcontenttype, pmethod, pbody){
			var data = { 
				name : id,
				description : pdescription,
				service : pservice,
				contenttype : pcontenttype,
				method : pmethod,
				body : pbody
			};
			return $http.put("rest/jobs", data).then( function (response){
					return response.data;
	    });
		}

	};

	

	return jobService;

});