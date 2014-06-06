'use strict';


function NamespacesCtrl($scope, ConfigurationService) {

	$scope.namespaces = ConfigurationService.getAllNamespaces();

	var newGraph=true;
	$scope.new = function(){
	};

	$scope.edit = function(){
	};

	$scope.save = function(){
	};

	$scope.delete = function(){
	};
}



