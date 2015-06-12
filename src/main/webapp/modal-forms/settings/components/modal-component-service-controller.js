'use strict';

function ModalComponentServiceCtrl($scope, $modalInstance, modaltitle, resource) {
	
	console.log(resource);
	if(resource == null)
		$scope.service = {
			uri 	: "" , 
			label : label,
			serviceUrl 	: ""
		};
	else
		$scope.service = resource;
	
	$scope.modaltitle = modaltitle;

	$scope.ok = function () {
	  var input = angular.copy($scope.service);
	  $modalInstance.close(input);
	};

	$scope.cancel = function () {
	  $modalInstance.dismiss('cancel');
	};
}