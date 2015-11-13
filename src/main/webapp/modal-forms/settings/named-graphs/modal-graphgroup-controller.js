'use strict';

function ModalGraphGroupCtrl($scope, $http, $modalInstance, currentGroup, allGraphs, Helpers) {
	
	$scope.modaltitle="New";
	$scope.allgraphs = allGraphs;
	$scope.graphgroup = {
	        name: "",
	        label: "",
	        description: "",
	        created: Helpers.getCurrentDate(),
	        modified: Helpers.getCurrentDate(),
	        namedGraphs: []
	    };
	$scope.isNewGroup=true;

	if(currentGroup!=null){
		$scope.modaltitle = "Edit";
		$scope.graphgroup = angular.copy(currentGroup);
		$scope.graphgroup.name = $scope.graphgroup.name.replace(':', '');
		$scope.isNewGroup=false;
	}
	
	$scope.toggleGraph = function (graphName) {
        var index = $scope.graphgroup.namedGraphs.indexOf(graphName);
        if (index > -1) { // is currently selected
            $scope.graphgroup.namedGraphs.splice(index, 1);
        } else { // is newly selected
            $scope.graphgroup.namedGraphs.push(graphName);
        }
    };
	
	  $scope.ok = function () {
		  $scope.graphgroup.name = ":" + $scope.graphgroup.name;
		  var input = angular.copy($scope.graphgroup);
		  $modalInstance.close(input);
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	}