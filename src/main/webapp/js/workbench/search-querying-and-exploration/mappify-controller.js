'use strict';

/****************************************************************************************************
*
* Mappify Controller
*
***************************************************************************************************/

app.controller('MappifyFormCtrl', function($scope, ConfigurationService, GraphService) {
	//Settings for Facete

	$scope.namedGraphs = [];
	$scope.component = ConfigurationService.getComponent(":Mappify");
	var services = ConfigurationService.getComponentServices(":Mappify");
	
	$scope.url = services[0].serviceUrl;

});
