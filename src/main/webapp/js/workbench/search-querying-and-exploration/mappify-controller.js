'use strict';

/****************************************************************************************************
*
* Mappify Controller
*
***************************************************************************************************/

app.controller('MappifyFormCtrl', function($scope, ComponentsService, GraphService) {
	//Settings for Facete

	var componentId ="Mappify";
	var serviceId = "MappifyService";

	ComponentsService.getComponent(componentId).then(
		//success
		function(response){
			$scope.component = response;
			$scope.sevice = ComponentsService.getComponentService(serviceId, $scope.component);
			if($scope.sevice== null)
				flash.error="Service not configured: " +serviceId;	
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
