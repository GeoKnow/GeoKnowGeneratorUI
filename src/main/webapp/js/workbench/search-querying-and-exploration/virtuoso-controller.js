'use strict';

/****************************************************************************************************
*
* Virtuoso Controller
*
***************************************************************************************************/
app.controller('VirtuosoCtrl', function($scope, ConfigurationService, ComponentsService, AccountService, GraphService, GraphGroupService) {

	var componentUri ="http://generator.geoknow.eu/resource/Virtuoso";
	var serviceUri = "http://generator.geoknow.eu/resource/VirtuosoAuthSPARQLEndpoint";

	ComponentsService.getComponent(componentUri).then(
		//success
		function(response){
			$scope.component = response;
			$scope.sevice = ComponentsService.getComponentService(serviceUri, $scope.component);
			if($scope.sevice== null)
				flash.error="Service not configured: " +serviceUri;	
		}, 
		function(response){
			flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
		});

	$scope.namedGraphs = [];
	
	$scope.virtuoso = {
		service   : AccountService.getAccount().getUsername()==null ? ConfigurationService.getPublicSPARQLEndpoint() : ConfigurationService.getSPARQLEndpoint(),
	 	dataset   : "",
	}

  $scope.refreshGraphList = function() {
    GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
     	    var ngraphs = graphs;
     	    GraphGroupService.getAllGraphGroups(true).then(function(groups) {
     	        ngraphs = ngraphs.concat(groups);
     	        $scope.namedGraphs = ngraphs;
     	        // set $scope.url variable
     	        
     	    });
     	});
	};
	
	$scope.updateServiceParams = function(){
	    if (AccountService.getAccount().getUsername()==null) { //user is not authorized
	      $scope.url= $scope.virtuoso.service +
	            '?default-graph-uri=' + encodeURIComponent( $scope.virtuoso.dataset.replace(':',ConfigurationService.getUriBase()))+
	            '&qtxt=select+distinct+%3FConcept+where+%7B%5B%5D+a+%3FConcept%7D+LIMIT+100'
	            '&format=text%2Fhtml' +
	            '&timeout=30000';
	    } else {
        $scope.url= 'VirtuosoProxy' +
                    '?default-graph-uri=' + encodeURIComponent($scope.virtuoso.dataset.replace(':',ConfigurationService.getUriBase())) +
                    '&qtxt=select+distinct+%3FConcept+where+%7B%5B%5D+a+%3FConcept%7D+LIMIT+100' +
                    '&format=text%2Fhtml' +
                    '&timeout=30000';
      }
      console.log($scope.url);
	};

	$scope.refreshGraphList();
	$scope.updateServiceParams();

	$scope.$watch( function () { return AccountService.getAccount().getUsername(); }, function () {
    $scope.refreshGraphList();
  });

});
