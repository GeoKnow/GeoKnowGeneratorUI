'use strict';

function ComponentCtrl($scope, ConfigurationService){

	ConfigurationService.getSettings().then(function(settings){
		$scope.components = ConfigurationService.getAllComponents();
		$scope.services = {};
		for(var i in $scope.components){
			$scope.services[$scope.components[i].uri] = ConfigurationService.getComponentServices($scope.components[i].uri);
		};
		console.log($scope.services);
		
	});

}
