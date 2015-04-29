'use strict';

function ModalLimesJobCtrl($scope, $modalInstance, GraphService) {

	  $scope.job = {
	    name : "",
	    label:"",
	    description : "",
	    namedgraph:null,
	    newRevision:true,
	    additionalSources: true,
	  };
	 
	  $scope.jobnamedgraphs=[];
	  $scope.modaltitle="New";
	  
	  GraphService.getAccessibleGraphs(true, false, true).then(function(result) {
          $scope.jobnamedgraphs = result;
      });
		
	  
	  $scope.ok = function () {
		  
		  var today = new Date();
		  $scope.job.name = $scope.job.label.replace(/[^a-zA-Z0-9]/g,'') + today.valueOf();
		  
	    var input= angular.copy($scope.job)
	    $modalInstance.close(input);
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };

	}