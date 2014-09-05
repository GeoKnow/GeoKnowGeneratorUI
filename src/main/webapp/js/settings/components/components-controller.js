'use strict';

function ComponentCtrl($scope, ConfigurationService){
	$scope.components = ConfigurationService.getNS;
}


function ComponentServicesCtrl($scope, ConfigurationService){
	
	$scope.services = [];

	$scope.getServices = function(uri){
		console.log("get Services"+uri);
		$scope.services = ConfigurationService.getComponentServices(uri);
	};

}
