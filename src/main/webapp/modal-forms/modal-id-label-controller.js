'use strict';

function ModalIdLabelCtrl($scope, $modalInstance, modaltitle, resource) {
	
	$scope.modaltitle = modaltitle;
	if(resource == null)
		$scope.resource = {
			id 			: "" , 
			label 	: ""
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