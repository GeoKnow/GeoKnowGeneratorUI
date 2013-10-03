'use strict';

function NamespacesCtrl($scope, ConfiurationService) {

	$scope.namespaces = ConfiurationService.getNamespaces();

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


function GraphCtrl($scope, ConfiurationService){

	$scope.namedgraphs = ConfiurationService.getNamedGraphs();
	$scope.namedgraph = {};
	var newGraph=true;
	$scope.new = function(){
		// default values
		newGraph=true;
		var defaultEndpoint = ConfiurationService.getEndpoint();
		var newGraph = { graph:{ created:"now", endpoint: defaultEndpoint }};
		$scope.namedgraph = angular.copy(newGraph);
	};

	$scope.edit = function(graphName){
		var namedg = ConfiurationService.getNamedGraph(graphName);
		$scope.namedgraph = angular.copy(namedg);
		newGraph=false;
	};

	$scope.save = function(){
		if(newGraph)
			ConfiurationService.addGraph($scope.namedgraph);
		else
			ConfiurationService.updateGraph($scope.namedgraph);
	};

	$scope.delete = function(graphName){
		ConfiurationService.deleteGraph(graphName);
	};
}
