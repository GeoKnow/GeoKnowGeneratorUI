'use strict';

function DashboardCtrl($scope, JobService, ConfigurationService, $http) {
 
  $scope.component = ConfigurationService.getComponent(":SpringBatchAdmin");
  
  $scope.jobs = [];
 
  JobService.getAllJobs().then(function(jobs){
  	$scope.jobs = jobs;
  });

  $scope.getJobDetail = function(index){
    if($scope.jobs[index].executions == undefined){
      JobService.getJob($scope.jobs[index].name).then(
        function(response){
          // if(response.executions.status!="COMPLETED" || response.executions.status!="FAILED")
          $scope.jobs[index].executions = response.executions;
        });
    }
  },

  $scope.execute = function(index){
    JobService.run($scope.jobs[index].name).then(
      function(response){
        $scope.jobs[index].executions.push(response.execution);
    });
  }

  $scope.reload = function(index){
    $scope.jobs[index].executions = undefined;
    $scope.getJobDetail(index);
  },

  $scope.delete = function(index){
     JobService.deleteJob($scope.jobs[index].name).then(
      function(response){
        //refresh the table
        JobService.getAllJobs().then(function(jobs){
          $scope.jobs = jobs;
        });
    });
  },

  $scope.stopExecution = function(id){

  }
}
