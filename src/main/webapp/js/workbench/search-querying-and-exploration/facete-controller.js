'use strict';
/****************************************************************************************************
*
* Facete Controller
*
***************************************************************************************************/

app.controller('FaceteFormCtrl', function($scope, ConfigurationService, ComponentsService, GraphService, AccountService) {
	//Settings for Facete


	var componentId ="Facete";
	var serviceId = "FaceteService";

	ComponentsService.getComponent(componentId).then(
		//success
		function(response){
			$scope.component = response;
			$scope.sevice = ComponentsService.getComponentService(serviceId, $scope.component);
			if($scope.sevice== null)
				flash.error="Service not configured: " +serviceId;	
			$scope.url= $scope.sevice.serviceUrl + 
				'?service-uri='+ encodeURIComponent($scope.facete.service) +
    		'&default-graph-uri=';
		}, 
		function(response){
			flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
		});

	$scope.namedGraphs = [];
	
	$scope.facete = {
  	service   : ConfigurationService.getSPARQLEndpoint(),
   	dataset   : "",
  };
  
	$scope.refreshGraphList = function() {
    GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
      $scope.namedGraphs = graphs;
    });
  };

  $scope.refreshGraphList();

	$scope.updateServiceParams = function(){
		$scope.url= $scope.sevice.serviceUrl + 
			'?service-uri='				+ encodeURIComponent($scope.facete.service) +
      '&default-graph-uri=' + encodeURIComponent($scope.facete.dataset.replace(':',ConfigurationService.getUriBase()));
    console.log($scope.url);
	};

	$scope.openService = function(){
		window.open($scope.url);
    return false;
	}
	
	$scope.$watch( function () { return AccountService.getAccount().getUsername(); }, function () {
	    $scope.refreshGraphList();
	});
});
