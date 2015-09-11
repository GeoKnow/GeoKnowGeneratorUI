'use strict';
/****************************************************************************************************
*
* Facete Controller
*
***************************************************************************************************/

app.controller('EstaLdCtrl', function($scope, ConfigurationService, ComponentsService, GraphService, AuthSessionService) {
	//Settings for Facete


	var componentId ="esta-ld";
	var serviceId = "esta-ld-service";
	var workbenchHP ="";
	ComponentsService.getComponent(componentId).then(
		//success
		function(response){
			$scope.component = response;
			$scope.sevice = ComponentsService.getComponentService(serviceId, $scope.component);
			if($scope.sevice== null)
				flash.error="Service not configured: " +serviceId;	

    	$scope.endpoints = ConfigurationService.getAllEndpoints();

    	workbenchHP = ConfigurationService.getFrameworkHomepage();
			if (workbenchHP.substr(-1) != '/') 
				workbenchHP += '/';
		}, 
		function(response){
			flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
		});

	  //scope variable is for the source-graph direcitve
  $scope.source = { 
  		endpoint : "",
      label : "Source Graph",
      graph : "" };

  $scope.isLocalEndpoint = function(){
  	return $scope.source.endpoint == ConfigurationService.getSPARQLEndpoint()
  }

	$scope.openService = function(){
		// generate the authorised-session
		console.log($scope.source.endpoint);

		if ($scope.isLocalEndpoint()){

			return AuthSessionService.createSession().then(function(response){
      		
				var authEndpoint = workbenchHP + response.data.endpoint;
				var url = $scope.sevice.serviceUrl + 
								'?endpoint=' + encodeURIComponent(authEndpoint) +
      					'&graph=' + encodeURIComponent($scope.source.graph.replace(':',ConfigurationService.getUriBase()));
    		
    		console.log("endpoint: " + authEndpoint);
    		console.log("graph: " + $scope.source.graph.replace(':',ConfigurationService.getUriBase()));
    		console.log(url);
				window.open(url);
    		return false;
      		
			});
		}
		else{
			var url = $scope.sevice.serviceUrl + 
								'?endpoint=' + encodeURIComponent($scope.source.endpoint) +
      					'&graph=' + encodeURIComponent($scope.source.graph.replace(':',ConfigurationService.getUriBase()));
    	console.log(url);
			window.open(url);
		}
	}
	

});
