'use strict';

function ModalLimesJobCtrl($scope, $modalInstance, GraphService, Ns) {


	  $scope.modaltitle="New Limes Job";

	  $scope.job = {
	    name : "",
	    label:"",
	    description : "",
	    namedgraph:null,
	    newRevision:true,
	    additionalSources: true,
	  };

	  //scope variables used in the target-graph direcitve
		$scope.target = { graph : ""};
	  $scope.newTarget ={
	  	prefix : "LimesLinks" ,
	  	label : "",
	  	description : ""
	  };
	 
	  
	  $scope.ok = function () {
		  
		  var today = new Date();
		  $scope.job.name = $scope.job.label.replace(/[^a-zA-Z0-9]/g,'') + today.valueOf();
		  $scope.job.namedgraph = Ns.lengthen($scope.target.graph);
		  console.log($scope.job);
	    var input= angular.copy($scope.job)
	    $modalInstance.close(input);
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };

	  $scope.updateNewTargetLabel = function () {
	  	$scope.newTarget.label = "Links from " + $scope.job.label;
	  };

	  $scope.updateNewTargetDescription = function () {
	  	$scope.newTarget.description = "Links from " + $scope.job.description;
	  };

	}