'use strict';

function GeneralSettingsCtrl($scope, ConfigurationService) {
	$scope.settings = { uribase : ConfigurationService.getUriBase()};
}

function NamespacesCtrl($scope, ConfigurationService) {

	$scope.namespaces = ConfigurationService.getNamespaces();

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
	};

	$scope.edit = function(uri){
		$scope.endpoint = angular.copy(ConfigurationService.getEndpoint(uri));
		newEndpoint=false;
		$scope.modaltitle = "Edit Endopoint";
	};

	$scope.delete = function(uri){
		ConfigurationService.deleteEndpoint(uri);
		$scope.refreshTable();
	};

	$scope.refreshTable = function(){
		$scope.endpoints = ConfigurationService.getAllEndpoints();
	};

	$scope.save = function(){
		var success =  false;
		if(newEndpoint)
			success = ConfigurationService.addEndpoint($scope.endpoint);
		else
			success = ConfigurationService.updateEndpoint($scope.endpoint);
		
		if(success){
			$scope.$broadcast('closeModal', {id : 'modelEndpoint'}); 
			$scope.refreshTable();
		}
	};

}

function DatabaseCtrl($scope, ConfigurationService){
	$scope.databases = ConfigurationService.getAllDatabases();
}

function GraphCtrl($scope, ConfigurationService){

	var emptyGraph = { name:"", 
	                      graph: {created:"now", endpoint: "", description: "", modified:"", label:""}};
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
		$scope.modaltitle = "New Named Graph";
		var now = new Date();
	  //"YYYY-MM-DDThh:mm:ss"^^xsd:date;
	  var month = now.getMonth() + 1; // getMonth returns values from 0 to 11
		var s_now = now.getFullYear() + "-" 
							+ (month.toString().length==1 ? "0"+ month : month + "-") 
							+ (now.getDate().toString().length==1 ? "0"+now.getDate() : now.getDate())
							+ "T" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
	
		var defaultEndpoint = ConfigurationService.getSPARQLEndpoint();
		$scope.namedgraph = angular.copy(emptyGraph);
		$scope.namedgraph.graph.created = s_now;
		$scope.namedgraph.graph.modified = s_now;
		$scope.namedgraph.graph.endpoint = ConfigurationService.getSPARQLEndpoint();
	};

	$scope.edit = function(graphName){
		var namedg = ConfigurationService.getNamedGraph(graphName);
		$scope.namedgraph = angular.copy(namedg);
		newGraph=false;
		$scope.modaltitle = "Edit Named Graph";
	};

	$scope.save = function(){
		// TODO: check if success then close the window or where to put error messages
		var success =  false;
		if(newGraph)
			success = ConfigurationService.addEndpoint($scope.namedgraph);
		else
			success = ConfigurationService.updateEndpoint($scope.namedgraph);
			
		if(success){
			$scope.$broadcast('closeModal', {id : 'modelGraph'}); 
			$scope.refreshTable();
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
