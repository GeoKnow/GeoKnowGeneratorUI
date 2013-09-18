'use strict';

function SettingsComponentCtrl(scope, service){
	scope.components = service.getComponents().components;
}
SettingsComponentCtrl.$inject = ['$scope', 'SettingsServiceStatic'];


function GraphManagement(scope, service){

	scope.namedgraphs = service.getNamedGraphs().namedgraphs;
	scope.namedgraph = {};
	var newGraph=true;
	scope.new = function(){
		// default values
		newGraph=true;
		var defaultEndpoint = service.getEndpoint();
		var newGraph = { graph:{ created:"now", endpoint: defaultEndpoint }};
		scope.namedgraph = angular.copy(newGraph);
	};

	scope.edit = function(graphName){
		var namedg = service.getNamedGraph(graphName);
		scope.namedgraph = angular.copy(namedg);
		newGraph=false;
	};

	scope.save = function(){
		if(newGraph)
			service.createGraph(scope.namedgraph);
		else
			service.updateGraph(scope.namedgraph);
	};

	scope.delete = function(graphName){
		service.deleteGraph(graphName);
	};
}
GraphManagement.$inject = ['$scope', 'SettingsServiceStatic'];