'use strict';
/****************************************************************************************************
*
* FAGI-gis Controller
*
***************************************************************************************************/

app.controller('FagiGisCtrl', function($q, $scope, ConfigurationService, ComponentsService, GraphService, AuthSessionService, Ns) {

	var componentId ="FagiGis";
	var serviceId = "FagiGisService";
	var workbenchHP;

	ComponentsService.getComponent(componentId).then(
		//success
		function(response){
			$scope.component = response;
			$scope.service = ComponentsService.getComponentService(serviceId, $scope.component);
			if($scope.service== null)
				flash.error="Service not configured: " +serviceId;	

			workbenchHP = ConfigurationService.getFrameworkHomepage();
			if (workbenchHP.substr(-1) != '/') 
				workbenchHP += '/';

		}, 
		function(response){
			flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
		});

	$scope.namedGraphs = [];
	$scope.endpoint = ConfigurationService.getSPARQLEndpoint();
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.databases = ConfigurationService.getAllDatabases();
	console.log($scope.databases);

	$scope.fagi = {
		datasetA : "",
		datasetB : "", 
		targetEndpoint : "",
		targetGraph : ""
	};
	
	$scope.openService = function(){

		createAuthEndpoint().then(function(authEndpoint){
			var url= $scope.service.serviceUrl +
					'?endpoint-a=' + encodeURIComponent($scope.fagi.endpointA == $scope.endpoint? authEndpoint : $scope.fagi.endpointA ) +
					'&endpoint-b=' + encodeURIComponent($scope.fagi.endpointB == $scope.endpoint? authEndpoint : $scope.fagi.endpointB ) +
					'&dataset-a='  + encodeURIComponent($scope.fagi.datasetA!=""? Ns.lengthen($scope.fagi.datasetA):"") +
					'&dataset-b='  + encodeURIComponent($scope.fagi.datasetB!=""? Ns.lengthen($scope.fagi.datasetB):"") +
					'&postgis-username='+ encodeURIComponent("fagi") +
					'&postgis-password='+ encodeURIComponent("fagi") +
					// '&postgis-database='+ encodeURIComponent($scope.fagi.database.dbName) +
					// '&virtuoso-host='+ encodeURIComponent($scope.fagi.database.dbHost) +
					// '&virtuoso-port='+ encodeURIComponent($scope.fagi.database.dbPort) +
					'&target-endpoint='+ encodeURIComponent(authEndpoint) +
					'&target-dataset='+ encodeURIComponent(Ns.lengthen($scope.fagi.targetGraph)) ;
			console.log("endpoint" + authEndpoint);
			console.log(url);
			window.open(url);
		});
		
    return false;
	}
  
  $scope.refreshGraphList = function() {
    GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
      $scope.namedGraphs = graphs;
    });
  };

  $scope.refreshGraphList();

	var createAuthEndpoint = function(){
		var deferred = $q.defer();
		console.log ($scope.fagi.targetEndpoint);
		if($scope.fagi.targetEndpoint != "")
			deferred.resolve($scope.fagi.targetEndpoint);
		else{
			// get proxied endpoint
			AuthSessionService.createSession().then(function(response){
  			deferred.resolve(workbenchHP + response.data.endpoint);
  		});
		}
		return deferred.promise;
	}; 

	$scope.describeGraph=function (ngraph) {
    return  ngraph.graph.label + " | " + ngraph.name;
  };


	$scope.createTargetGraph = function(){
		// create a new graph to save data
  	var name  = "Fagi_" + new Date().getTime();
  	var label = "Fagi-gis fusion";
  	var description = "Fagi-gis fusion results";
  	GraphService.addSimpleGraph(name, label, description).then(function(response){
  		$scope.refreshGraphList();
  		$scope.fagi.targetGraph = ":"+name;
  	});
  };

  $scope.updateGraphsA = function(){
  	if( $scope.fagi.endpointA == ConfigurationService.getSPARQLEndpoint())
				GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
					$scope.namedGraphsA = graphs;
    		});
		else
			$scope.namedGraphsA = {};
  };

  $scope.updateGraphsB = function(){
  	if( $scope.fagi.endpointB == ConfigurationService.getSPARQLEndpoint())
			GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
    		$scope.namedGraphsB = graphs;
    	});
		else
			$scope.namedGraphsB = {};
  };

});
