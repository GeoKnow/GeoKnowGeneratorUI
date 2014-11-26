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

	$scope.url= services[0].serviceUrl;

});
