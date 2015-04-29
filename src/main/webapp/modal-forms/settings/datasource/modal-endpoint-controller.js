'use strict';

function ModalEndpointCtrl($scope, $http, $modalInstance, currentEndpoint) {
	
	$scope.modaltitle = "New";
	$scope.endpoint = { 
			uri: "", 
			label:"", 
			endpoint: "", 
			homepage: ""
		};
	
	$scope.isNew=true;
	
	if(currentEndpoint!=null){
		$scope.modaltitle = "Edit";
		$scope.endpoint = angular.copy(currentEndpoint);		
		$scope.isNew=false;
		
	}
	  $scope.ok = function () {
		  if($scope.endpoint.uri.indexOf(":")==-1) $scope.endpoint.uri = ":"+$scope.endpoint.uri;
		  var input = angular.copy($scope.endpoint);
		 
	    $modalInstance.close(input);
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	}