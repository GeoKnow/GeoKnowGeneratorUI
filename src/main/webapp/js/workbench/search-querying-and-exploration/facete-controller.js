'use strict';
/****************************************************************************************************
*
* Facete Controller
*
***************************************************************************************************/

app.controller('FaceteFormCtrl', function($scope, ConfigurationService, ComponentsService, GraphService, AccountService, AuthSessionService, Ns) {
	//Settings for Facete


	var componentId ="Facete";
	var serviceId = "FaceteService";
	var workbenchHP = "";
	ComponentsService.getComponent(componentId).then(
		//success
		function(response){
			$scope.component = response;
			$scope.sevice = ComponentsService.getComponentService(serviceId, $scope.component);
			if($scope.sevice== null)
				flash.error="Service not configured: " +serviceId;	

			workbenchHP = ConfigurationService.getFrameworkHomepage();
			if (workbenchHP.substr(-1) != '/') 
				workbenchHP += '/';
			$scope.endpoints = ConfigurationService.getAllEndpoints();
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
		if ($scope.isLocalEndpoint()){

			return AuthSessionService.createSession().then(function(response){
				var authEndpoint = workbenchHP + response.data.endpoint;
				var url= $scope.sevice.serviceUrl + 
					'?service-uri='				+ encodeURIComponent(authEndpoint) +
		      '&default-graph-uri=' + encodeURIComponent(Ns.lengthen($scope.source.graph));
		     console.log(url);
				window.open(url);
		    return false;
	  	});
		}
		else{
			var url= $scope.sevice.serviceUrl + 
				'?service-uri='				+ encodeURIComponent($scope.source.endpoint) +
	      '&default-graph-uri=' + encodeURIComponent(Ns.lengthen($scope.source.graph));
	     console.log(url);
			window.open($scope.url);
	    return false;
		}

	}
	
});
