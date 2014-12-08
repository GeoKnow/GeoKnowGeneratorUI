'use strict';
/****************************************************************************************************
*
* FAGI-gis Controller
*
***************************************************************************************************/

app.controller('FagiGisCtrl', function($q, $scope, ConfigurationService, GraphService, AuthSessionService) {

	$scope.namedGraphs = [];
	$scope.endpoint = ConfigurationService.getSPARQLEndpoint();
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.component = ConfigurationService.getComponent(":FagiGis");
	$scope.databases = ConfigurationService.getAllDatabases();
	console.log($scope.databases);

	$scope.fagi = {
		datasetA : "",
		datasetB : "", 
		targetEndpoint : "",
		targetGraph : ""
	};
	
	var services = ConfigurationService.getComponentServices(":FagiGis");
  
  $scope.refreshGraphList = function() {
    GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
      $scope.namedGraphs = graphs;
    });
  };

  $scope.refreshGraphList();

	var createAuthEndpoint = function(){
		var deferred = $q.defer();
		if($scope.fagi.targetEndpoint != "")
			deferred.resolve($scope.fagi.targetEndpoint);
		else{
			var workbench = ConfigurationService.getComponent(ConfigurationService.getFrameworkUri());
			// get proxied endpoint
			AuthSessionService.createSession().then(function(response){
  			deferred.resolve(workbench.homepage + response.data.endpoint);
  		});
		}
		return deferred.promise;
	}; 

	$scope.updateServiceParams = function(){

		if(!$scope.fagiForm.$valid) 
			return;

		createAuthEndpoint().then(function(authEndpoint){
			$scope.url= services[0].serviceUrl +
					'?endpoint-a=' + encodeURIComponent($scope.fagi.endpointA == $scope.endpoint? authEndpoint : $scope.fagi.endpointA ) +
					'&endpoint-b=' + encodeURIComponent($scope.fagi.endpointB == $scope.endpoint? authEndpoint : $scope.fagi.endpointB ) +
					'&dataset-a='  + encodeURIComponent($scope.fagi.datasetA!=""? $scope.fagi.datasetA.replace(':',ConfigurationService.getUriBase()):"") +
					'&dataset-b='  + encodeURIComponent($scope.fagi.datasetB!=""? $scope.fagi.datasetB.replace(':',ConfigurationService.getUriBase()):"") +
					'&postgis-username='+ encodeURIComponent($scope.fagi.database.dbUser) +
					'&postgis-password='+ encodeURIComponent($scope.fagi.database.dbPassword) +
					'&postgis-database='+ encodeURIComponent($scope.fagi.database.dbName) +
					'&postgis-host='+ encodeURIComponent($scope.fagi.database.dbHost) +
					'&postgis-port='+ encodeURIComponent($scope.fagi.database.dbPort) +
					'&target-endpoint='+ encodeURIComponent(authEndpoint) +
					'&target-dataset='+ encodeURIComponent($scope.fagi.targetGraph.replace(':',ConfigurationService.getUriBase())) ;
			console.log($scope.url);
		});
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
  	$scope.updateServiceParams();
  };

  $scope.updateGraphsA = function(){
  	if( $scope.fagi.endpointA == ConfigurationService.getSPARQLEndpoint())
				GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
					$scope.namedGraphsA = graphs;
    		});
		else
			$scope.namedGraphsA = {};
		$scope.updateServiceParams();
  };

  $scope.updateGraphsB = function(){
  	if( $scope.fagi.endpointB == ConfigurationService.getSPARQLEndpoint())
			GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
    		$scope.namedGraphsB = graphs;
    	});
		else
			$scope.namedGraphsB = {};
		$scope.updateServiceParams();
  };

  $scope.$watch( function () { return $scope.fagiForm.$valid; }, function () {
  	console.log("valid");
    $scope.updateServiceParams();
  });

});
