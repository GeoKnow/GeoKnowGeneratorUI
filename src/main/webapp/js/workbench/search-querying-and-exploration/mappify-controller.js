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
	$scope.facete = {
		service   : ConfigurationService.getSPARQLEndpoint(),
	 	dataset   : "",
	};

	GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
	    $scope.namedGraphs = graphs;
        $scope.facete.dataset = $scope.namedGraphs[0];
    });
	
	$scope.url = "";

	$scope.setUrl = function(){
		$scope.url= services[0].serviceUrl;
   

	};
});
