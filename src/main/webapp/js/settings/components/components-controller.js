'use strict';

function ComponentCtrl($scope, ConfigurationService){

	ConfigurationService.getSettings().then(function(settings){
		$scope.components = ConfigurationService.getAllComponents();

		$scope.getServices = function(uri){
			$scope.services = ConfigurationService.getComponentServices(uri);
		};

	});

}

