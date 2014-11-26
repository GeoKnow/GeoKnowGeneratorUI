'use strict';
/****************************************************************************************************
*
* Facete Controller
*
***************************************************************************************************/

app.controller('FaceteFormCtrl', function($scope, ConfigurationService, GraphService, AccountService) {
	//Settings for Facete

	$scope.namedGraphs = [];
	$scope.component = ConfigurationService.getComponent(":Facete");
	var services = ConfigurationService.getComponentServices(":Facete");

	$scope.refreshGraphList = function() {
        GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
            $scope.namedGraphs = graphs;
            $scope.facete = {
            		service   : ConfigurationService.getSPARQLEndpoint(),
            	 	dataset   : $scope.namedGraphs[0].name,
            	};
        });
    };

    $scope.refreshGraphList();
	$scope.url = "";

	$scope.setUrl = function(){
		$scope.url= services[0].serviceUrl + 
								'?service-uri='+ $scope.facete.service+
                '&default-graph-uri=' + $scope.facete.dataset.name.replace(':',ConfigurationService.getUriBase());
	};

	$scope.$watch( function () { return AccountService.getAccount().getUsername(); }, function () {
	    $scope.refreshGraphList();
	});
});
