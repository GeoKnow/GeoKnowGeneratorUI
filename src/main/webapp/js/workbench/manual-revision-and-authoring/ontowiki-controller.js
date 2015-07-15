'use strict';
/****************************************************************************************************
*
* ONTOWIKI Controller
*
***************************************************************************************************/

app.controller('OntoWikiCtrl', function($scope, ComponentsService) {

	var componentUri ="http://generator.geoknow.eu/resource/OntoWiki";
	var serviceUri = "http://generator.geoknow.eu/resource/OntoWikiService";

	ComponentsService.getComponent(componentUri).then(
		//success
		function(response){
			$scope.component = response;
			$scope.service = ComponentsService.getComponentService(serviceUri, $scope.component);
			if($scope.service== null)
				flash.error="Service not configured: " +serviceUrl;	
		}, 
		function(response){
			flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
		});

	$scope.openService = function(){
		window.open($scope.service.serviceUrl);
    return false;
	}
	
});

