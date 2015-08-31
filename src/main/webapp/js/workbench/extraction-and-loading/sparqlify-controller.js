'use strict';

/****************************************************************************************************
*
* SPARQLIFY Controller
*
***************************************************************************************************/
app.controller('SparqlifyCtrl', function($scope, ComponentsService) {
	//Settings for Sparqlilfy

	var componentId ="Sparqlify";
	var serviceId = "SparqlifyService";

	ComponentsService.getComponent(componentId).then(
		//success
		function(response){
			$scope.component = response;
			$scope.service = ComponentsService.getComponentService(serviceId, $scope.component);
			if($scope.service== null)
				flash.error="Service not configured: " +serviceId;	
		}, 
		function(response){
			flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
		});

	$scope.openService = function(){
		window.open($scope.service.serviceUrl);
    return false;
	}

});
