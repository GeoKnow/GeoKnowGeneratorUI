'use strict';

function NamespacesCtrl($scope, ConfigurationService) {

	$scope.namespaces = ConfigurationService.getNamespaces();

	var newGraph=true;
	$scope.new = function(){
	};

	$scope.edit = function(graphName){
	};

	$scope.save = function(){
	};

	$scope.delete = function(graphName){
	};
}

function ComponentCtrl($scope, ConfiurationService){
	$scope.components = ConfiurationService.getComponents();
}

function GraphCtrl($scope, ConfigurationService){

	$scope.namedgraphs = ConfigurationService.getNamedGraphs();
	$scope.namedgraph = {};
	var newGraph=true;
	$scope.new = function(){
		// default values
		newGraph=true;
		var defaultEndpoint = ConfigurationService.getEndpoint();
		var newGraph = { graph:{ created:"now", endpoint: defaultEndpoint }};
		$scope.namedgraph = angular.copy(newGraph);
	};

	$scope.edit = function(graphName){
		var namedg = ConfigurationService.getNamedGraph(graphName);
		$scope.namedgraph = angular.copy(namedg);
		newGraph=false;
	};

	$scope.save = function(){
		if(newGraph)
			ConfigurationService.addGraph($scope.namedgraph);
		else
			ConfigurationService.updateGraph($scope.namedgraph);
	};

	$scope.delete = function(graphName){
		ConfigurationService.deleteGraph(graphName);
	};
}
