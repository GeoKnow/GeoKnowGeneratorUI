'use strict';
/****************************************************************************************************
*
* Facete Controller
*
***************************************************************************************************/

app.controller('EstaLdCtrl', function($scope, ConfigurationService, ComponentsService, GraphService) {
	//Settings for Facete


	var componentId ="esta-ld";
	var serviceId = "esta-ld-service";

	ComponentsService.getComponent(componentId).then(
		//success
		function(response){
			$scope.component = response;
			$scope.sevice = ComponentsService.getComponentService(serviceId, $scope.component);
			if($scope.sevice== null)
				flash.error="Service not configured: " +serviceId;	
			$scope.url= $scope.sevice.serviceUrl + 
				'?service-uri='+ encodeURIComponent($scope.estald.service) +
    		'&default-graph-uri=';
		}, 
		function(response){
			flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
		});

	  //scope variable is for the source-graph direcitve
  $scope.source = { 
      label : "Source Graph",
      graph : "" };

	$scope.estald = {
  	service   : ConfigurationService.getSPARQLEndpoint(),
   	dataset   : "",
  };


	$scope.updateServiceParams = function(){
		$scope.url= $scope.sevice.serviceUrl + 
			'?service-uri='				+ encodeURIComponent($scope.estald.service) +
      '&default-graph-uri=' + encodeURIComponent($scope.estald.dataset.replace(':',ConfigurationService.getUriBase()));
    console.log($scope.url);
	};

	$scope.openService = function(){
		window.open($scope.url);
    return false;
	}
	

});
