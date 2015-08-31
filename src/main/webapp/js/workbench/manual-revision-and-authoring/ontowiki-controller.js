'use strict';
/****************************************************************************************************
*
* ONTOWIKI Controller
*
***************************************************************************************************/

app.controller('OntoWikiCtrl', function($scope, ComponentsService) {

	var componentId ="OntoWiki";
	var serviceId = "OntoWikiService";

	ComponentsService.getComponent(componentId).then(
		//success
		function(response){
			$scope.component = response;
			$scope.service = ComponentsService.getComponentService(serviceId, $scope.component);
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

