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

		//TODO becomes obsolte of it works with multistep concept
		/**
		* body is encoced to avoid confusion with the job object in the case
		* where the body content for the service is also json
		*/
		addServiceJob : function(id, pdescription, pservice, pcontenttype, pmethod, pbody){
			console.log(pbody);
			
			var data = { 
				name : id,
				description : pdescription,
				service : pservice,
				contenttype : pcontenttype,
				method : pmethod,
				//body : pbody
				body : JSON.stringify(pbody)
			};
			console.log(data);
			return $http.put("rest/jobs", data).then( function (response){
					return response.data;
	    });
		},
		
		/**
		* Do a PUT call to register a job
		* 
		* @param id unique name of the job
		* @param desc description of the job
		* @param steps an array with job steps as objects. a steps comrpises the following keys: 
		* 	service, contenttype, method, body, numberOfOrder. The body parameter is encoced to 
		*   avoid confusion with the job object in the case where the body content for the 
		*   service is also jso
		*/
		addMultiServiceJob : function(id, label, desc, steps, targetGraph){
			//create json object
			var data = { 
				name : id,
				label: label,
				description :desc,
				steps : steps,
				targetGraph : targetGraph
			};
			console.log(data);
			
			return $http.put("rest/jobs", data).then( function (response){
					return response.data;
	    });
		}

	};

	

	return jobService;

});