'use strict';

function ModalJobCtrl($scope, $modalInstance, jobmappingid, mapType, GraphService, ConfigurationService, Helpers) {

  $scope.job = {
    name: "",
    label: "",
    description: "",
    mapType: mapType, //csv or d2rq  
    mappingId: jobmappingid,
    source: null,
    namedgraph: null,
    newRevision: true,
    additionalSources: false,
    // schedule:null
  };
  $scope.srcType = "";
  $scope.srctypes = ["from url", "from file"];
  $scope.jobnamedgraphs = [];
  $scope.modaltitle = "New";
  GraphService.getAccessibleGraphs(true, false, true).then(function(result) {
    $scope.jobnamedgraphs = result;
  });

  $scope.changeSourceType = function(type) {
    $scope.srcType = type;
    if (type == $scope.srctypes[1]) {
      $scope.job.source = null;
      $scope.options.scheduledExecution = false;
    }
  }

  $scope.ok = function() {
    if ($scope.options.scheduledExecution == true) {
      $scope.job.schedule = angular.copy($scope.scheduling);
      $scope.job.schedule.start = $scope.job.schedule.start.toISOString();
      if ($scope.job.schedule.intervalMode == 'none') {
        $scope.job.schedule.end = $scope.job.schedule.start;
      } else {
        $scope.job.schedule.end = $scope.job.schedule.end.toISOString();
      }
      delete $scope.job.schedule.intervalMode;
      delete $scope.job.schedule.repeatCount;
    } else {
      $scope.job.schedule = null;
    }
    $scope.job.name = $scope.job.label.replace(/[^a-zA-Z0-9]/g, '') + $scope.today.valueOf();
    console.log($scope.job);
    var input = angular.copy($scope.job)
    $modalInstance.close(input);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
}