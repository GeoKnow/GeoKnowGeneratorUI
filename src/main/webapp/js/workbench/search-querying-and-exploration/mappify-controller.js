'use strict';

/****************************************************************************************************
*
* Mappify Controller
*
***************************************************************************************************/

app.controller('MappifyFormCtrl', function($scope, ComponentsService, GraphService) {
	//Settings for Facete

	var componentUri ="http://generator.geoknow.eu/resource/Mappify";
	var serviceUri = "http://generator.geoknow.eu/resource/MappifyService";

	ComponentsService.getComponent(componentUri).then(
		//success
		function(response){
			$scope.component = response;
			$scope.sevice = ComponentsService.getComponentService(serviceUri, $scope.component);
			if($scope.sevice== null)
				flash.error="Service not configured: " +serviceUri;	
		}, 
		function(response){
			flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
		});

	$scope.namedGraphs = [];
	
	$scope.openService = function(){
		window.open($scope.sevice.serviceUrl);
    return false;
	}

});
