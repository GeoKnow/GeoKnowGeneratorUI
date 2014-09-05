'use strict';

function ComponentCtrl($scope, ConfigurationService){
	$scope.components = ConfigurationService.getAllComponents();
}


function ComponentServicesCtrl($scope, ConfigurationService){
	
	$scope.services = [];

	$scope.getServices = function(uri){
		$scope.services = ConfigurationService.getComponentServices(uri);
	};

}
