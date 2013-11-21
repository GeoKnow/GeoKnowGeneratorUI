'use strict';

function GeneralSettingsCtrl($scope, ConfigurationService) {

	$scope.endpointServices = ConfigurationService.getResourcesType("lds:SPARQLEndPointService");

	$scope.settings = { 
			uriBase 				: ConfigurationService.getUriBase(), 
			endpointService : ConfigurationService.getSPARQLEndpoint(),
			settingsGraph 	: ConfigurationService.getSettingsGraph()
	};

	// $scope.update = function(){
	// 	ConfigurationService.setUriBase($scope.settings.);
	// 	ConfigurationService.getSPARQLEndpoint($scope.settings);
	// }
}

function NamespacesCtrl($scope, ConfigurationService) {

	$scope.namespaces = ConfigurationService.getAllNamespaces();

	var newGraph=true;
	$scope.new = function(){
	};

	$scope.edit = function(){
	};

	$scope.save = function(){
	};

	$scope.delete = function(){
	};
}

function ComponentServicesCtrl($scope, ConfigurationService){
	
	$scope.services = [];

	$scope.getServices = function(uri){
		$scope.services = ConfigurationService.getComponentServices(uri);
	};

}

function ComponentCtrl($scope, ConfigurationService){
	$scope.components = ConfigurationService.getAllComponents();
}

function EndpointCtrl($scope, ConfigurationService){
	
	var emptyEndpoint = { uri: "", label:"", endpoint: "", homepage: ""};
	var newEndpoint=true;
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.endpoint = emptyEndpoint;
	$scope.uribase = ConfigurationService.getUriBase();
	$scope.modaltitle = "";

  $scope.isNew = function(){
		return newEndpoint;
	};

	$scope.new = function(){
		// default values
		newEndpoint=true;
		$scope.modaltitle = "New Endpoint";
		$scope.endpoint = angular.copy(emptyEndpoint);
		$scope.endpointForm.$setPristine();
	};

	$scope.edit = function(uri){
		$scope.endpoint = angular.copy(ConfigurationService.getEndpoint(uri));
		$scope.endpoint.uri = $scope.endpoint.uri.replace(':',''); //for the validation to be accepted
		newEndpoint=false;
		$scope.modaltitle = "Edit Endopoint";
	};

	$scope.delete = function(uri){
		ConfigurationService.deleteResource(uri);
		$scope.refreshTable();
	};

	$scope.refreshTable = function(){
		$scope.endpoints = ConfigurationService.getAllEndpoints();
	};

	$scope.save = function(){
		var success =  false;
		$scope.endpoint.uri =  ":" + $scope.endpoint.uri;
		if(newEndpoint)
			success = ConfigurationService.addEndpoint($scope.endpoint);
		else
			success = ConfigurationService.updateEndpoint($scope.endpoint);

		if(success){
			$('#modalEndpoint').modal('hide');
			$scope.refreshTable();
		}
		else{
			// TODO: check if success then close the window or where to put error messages		
		}
	};

}

function DatabaseCtrl($scope, ConfigurationService){
	
	var emptyDatabase = { uri: "", label:"", dbHost:"", dbName: "", dbType: "", dbUser: "", dbPassword: "", dbPort:""};
	var newDatabase=true;
	$scope.databases = ConfigurationService.getAllDatabases();
	$scope.databaseTypes = ConfigurationService.getDatabaseTypes();
	$scope.database = emptyDatabase;
	$scope.uribase = ConfigurationService.getUriBase();
	$scope.modaltitle = "";
	$scope.identifiers = ConfigurationService.getIdentifiers();

	$scope.isNew = function(){
		return newDatabase;
	};

	$scope.new = function(){
		// default values
		$scope.databaseForm.$setPristine();
		newDatabase=true;
		$scope.modaltitle = "New Database";
		$scope.database = angular.copy(emptyDatabase);
	};

	$scope.edit = function(uri){
		$scope.database = angular.copy(ConfigurationService.getDatabase(uri));
		$scope.database.uri = $scope.database.uri.replace(':','');
		newDatabase=false;
		$scope.modaltitle = "Edit Database";
	};

	$scope.delete = function(uri){
		ConfigurationService.deleteResource(uri);
		$scope.refreshTable();
	};

	$scope.refreshTable = function(){
		$scope.databases = ConfigurationService.getAllDatabases();
	};

	$scope.save = function(){
		var success =  false;
		$scope.database.uri =  ":" + $scope.database.uri;
		if(newDatabase)
			success = ConfigurationService.addDatabase($scope.database);
		else
			success = ConfigurationService.updateDatabase($scope.database);
		
		if(success){
			$('#modalDatabase').modal('hide');
			$scope.refreshTable();
		}
		else{
		// TODO: check if success then close the window or where to put error messages		
		}
	};
}

function GraphCtrl($scope, ConfigurationService, DateService){

	var emptyGraph = {  name:"", 
										  graph: {
										  	created:"now", endpoint: "", description: "", modified:"", label:"" 
										}};
	var newGraph=true;
	
	$scope.namedgraphs = ConfigurationService.getAllNamedGraphs();
	$scope.namedgraph = emptyGraph;
	$scope.modaltitle = "";

	$scope.isNew = function(){
		return newGraph;
	};

	$scope.new = function(){
		// default values
		newGraph=true;
		$scope.graphForm.$setPristine();
		$scope.modaltitle = "New Named Graph";

		var s_now = DateService.getCurrentDate();
		var defaultEndpoint = ConfigurationService.getSPARQLEndpoint();

		$scope.namedgraph = angular.copy(emptyGraph);
		$scope.namedgraph.graph.created = s_now;
		$scope.namedgraph.graph.modified = s_now;
		$scope.namedgraph.graph.endpoint = ConfigurationService.getSPARQLEndpoint();
	};

	$scope.edit = function(graphName){
		$scope.namedgraph = angular.copy(ConfigurationService.getNamedGraph(graphName));
		$scope.namedgraph.name = $scope.namedgraph.name.replace(':','');
		newGraph=false;
		$scope.modaltitle = "Edit Named Graph";
	};

	$scope.save = function(){
		
		var success =  false;
		$scope.namedgraph.name =  ":" + $scope.namedgraph.name;
		if(newGraph)
			success = ConfigurationService.addGraph($scope.namedgraph);
		else
			success = ConfigurationService.updateGraph($scope.namedgraph);
			
		if(success){
			$('#modalGraph').modal('hide');
			$scope.refreshTable();
		}
		else{
		// TODO: check if success then close the window or where to put error messages		
		}
	};

	$scope.delete = function(graphName){
		ConfigurationService.deleteGraph(graphName);
		$scope.refreshTable();
	};

	$scope.refreshTable = function(){
		$scope.namedgraphs = ConfigurationService.getAllNamedGraphs();
	};
}
