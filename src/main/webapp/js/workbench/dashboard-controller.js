'use strict';

function DashboardCtrl($scope, JobService, ComponentsService, $http, flash, ServerErrorResponse) {
 
  // var sbaId ="SpringBatch";
  // var sbaServiceId = "SpringBatchService";

  // ComponentsService.getComponent(sbaId).then(
  //   //success
  //   function(response){
  //     $scope.sba = response;
  //     $scope.sbaService = ComponentsService.getComponentService(sbaServiceId, $scope.sba);
  //     if($scope.sbaService== null)
  //       flash.error="Service not configured: " +sbaServiceId; 
  //   }, 
  //   function(response){
  //     flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
  //   });

  $scope.jobs = [];
 
  $scope.updateJobs = function(){
    JobService.getAllJobs().then(function(jobs){
      $scope.jobs = jobs;
    });
  };

  $scope.updateJobs();
  
  $scope.getJobDetail = function(index){
    if($scope.jobs[index].executions == undefined){
      JobService.getJob($scope.jobs[index].name).then(
        function(response){
          console.log(response);
          // if(response.executions.status!="COMPLETED" || response.executions.status!="FAILED")
          $scope.jobs[index].executions = response.executions;
        });
    }
  };

  $scope.execute = function(index){
    JobService.run($scope.jobs[index].name).then(
      function(response){
        $scope.jobs[index].executions.push(response.execution);
    });
  };

  $scope.reload = function(index){
    $scope.jobs[index].executions = undefined;
    $scope.getJobDetail(index);
  };

  $scope.delete = function(index){
     JobService.deleteJob($scope.jobs[index].name).then(
      function(response){
        //refresh the table
        JobService.getAllJobs().then(function(jobs){
          $scope.jobs = jobs;
        });
    });
  };

  $scope.stopExecution = function(id){

  };
}
