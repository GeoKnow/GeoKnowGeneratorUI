'use strict';

function ModalUserCtrl($scope, $http, $modalInstance, currentUser, ConfigurationService, UsersService, GraphService) {
	
	$scope.modaltitle = "New";
	$scope.allgraphs = [];
	
	GraphService.getAllNamedGraphs(true).then(function(data){
		$scope.allgraphs = data;
		
	});
	
	$scope.allroles = UsersService.getAllRoles();
	$scope.user = { 
			  profile: { accountURI:"", username:"", email:"", role:null}
    		, ownGraphs: []
    		, readableGraphs: []
    		, writableGraphs: [] };
	
	$scope.isNew=true;
	if(currentUser!=null){
		$scope.modaltitle = "Edit";
		$scope.isNew=false;
		$scope.user = angular.copy(currentUser);
	}
	$scope.notOwn = function(graph) {
        return $scope.user.ownGraphs.indexOf(graph) == -1;
    };
    
    $scope.toggleGraphRead = function(graph) {
        var index = $scope.user.readableGraphs.indexOf(graph.graph);
        if (index > -1) { // is currently selected
            $scope.user.readableGraphs.splice(index, 1);
        } else { // is newly selected
            $scope.user.readableGraphs.push(graph.graph);
        }
    };

    $scope.toggleGraphWrite = function(graph) {
        var index = $scope.user.writableGraphs.indexOf(graph.graph);
        if (index > -1) { // is currently selected
            $scope.user.writableGraphs.splice(index, 1);
        } else { // is newly selected
            $scope.user.writableGraphs.push(graph.graph);
        }
    };
    
    
	
	  $scope.ok = function () {
		  
		  var input = angular.copy($scope.user);
		 
	    $modalInstance.close(input);
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	}