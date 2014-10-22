'use strict';

function DashboardCtrl($scope, JobService) {
  
	$scope.jobs = [];
  // 0: Object
  // description: "No description"
  // executionCount: 0
  // incrementable: true
  // jobInstances: Object
  // launchable: true
  // name: "admin_60aefecc-371a-490b-a309-19b4c519f881"
  // resource: "http://localhost:8080/spring-batch-admin-geoknow/jobs/admin_60aefecc-371a-490b-a309-19b4c519f881.json"

  JobService.getAllJobs().then(function(jobs){
  	$scope.jobs = jobs;
  	console.log($scope.jobs);
  });

 

}
