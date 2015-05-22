'use strict';

function ModalVersionGroupsCtrl($scope, $modalInstance, uriBase, modaltitle, resource, Helpers) {
	
	$scope.uriBase = uriBase;
	$scope.modaltitle = modaltitle;


	if(resource == null)
		$scope.resource = {
			identifier 			: "" , 
			label 	: "", 
			description : ""
		};
	else
		$scope.resource = resource;
	
	$scope.ok = function () {
	  var input = angular.copy($scope.resource);
	  $modalInstance.close(input);
	};

	$scope.cancel = function () {
	  $modalInstance.dismiss('cancel');
	};
}