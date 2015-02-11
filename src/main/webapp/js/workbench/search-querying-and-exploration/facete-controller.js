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
	$scope.facete = {
  	service   : ConfigurationService.getSPARQLEndpoint(),
   	dataset   : "",
  };
  $scope.url= services[0].serviceUrl + 
		'?service-uri='+ encodeURIComponent($scope.facete.service) +
    '&default-graph-uri=';
  
	$scope.refreshGraphList = function() {
    GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
      $scope.namedGraphs = graphs;
    });
  };

  $scope.refreshGraphList();

	$scope.updateServiceParams = function(){
		$scope.url= services[0].serviceUrl + 
			'?service-uri='				+ encodeURIComponent($scope.facete.service) +
      '&default-graph-uri=' + encodeURIComponent($scope.facete.dataset.replace(':',ConfigurationService.getUriBase()));
    console.log($scope.url);
	};

	$scope.$watch( function () { return AccountService.getAccount().getUsername(); }, function () {
	    $scope.refreshGraphList();
	});
});
