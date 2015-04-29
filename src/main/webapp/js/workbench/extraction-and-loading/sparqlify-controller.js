'use strict';

/****************************************************************************************************
*
* SPARQLIFY Controller
*
***************************************************************************************************/
app.controller('SparqlifyCtrl', function($scope, ComponentsService) {
	//Settings for Sparqlilfy

	var componentUri ="http://generator.geoknow.eu/resource/Sparqlify";
	var serviceUri = "http://generator.geoknow.eu/resource/SparqlifyService";

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

	$scope.openService = function(){
		window.open($scope.sevice.serviceUrl);
    return false;
	}

});
