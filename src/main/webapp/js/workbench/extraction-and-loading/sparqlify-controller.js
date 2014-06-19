'use strict';

/****************************************************************************************************
*
* SPARQLIFY Controller
*
***************************************************************************************************/
app.controller('SparqlifyCtrl', function($scope, ConfigurationService, GraphService) {
	//Settings for Sparqlilfy

	$scope.namedGraphs = [];
	$scope.component = ConfigurationService.getComponent(":Sparqlify");
	var services = ConfigurationService.getComponentServices(":Sparqlify");
	
	$scope.sparqlify = {
	 	service   : ConfigurationService.getSPARQLEndpoint(),
	 	dataset   : "",
	}

    GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
	    $scope.namedGraphs = graphs;
    	$scope.sparqlify.dataset = $scope.namedGraphs[0];
    });

	$scope.url = "";

	$scope.setUrl = function(){
		$scope.url= services[0].serviceUrl;
    
	};
});
