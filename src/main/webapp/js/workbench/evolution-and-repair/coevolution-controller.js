'use strict';

var CoevolutionCtrl = function($scope, $http,  CoevolutionService, flash, ServerErrorResponse, GraphService){
	
	CoevolutionService.getComponent().then(
		//success
		function(response){
			console.log(response);
			$scope.component = response;
			$scope.sevice = CoevolutionService.serviceUrl;
			console.log(response);
		}, 
		function(response){
			flash.error= ServerErrorResponse.getMessage(response);
		});

	$scope.refreshGraphs = function() {
    GraphService.getAccessibleGraphs(true, false, true).then(function(graphs) {
      $scope.namedGraphs = graphs;
      console.log($scope.namedGraphs);
    });
  };

  $scope.refreshGraphs();
}