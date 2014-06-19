'use strict';

/****************************************************************************************************
*
* Virtuoso Controller
*
***************************************************************************************************/
app.controller('VirtuosoCtrl', function($scope, ConfigurationService, AccountService, GraphService, GraphGroupService) {

	$scope.namedGraphs = [];
	$scope.component = ConfigurationService.getComponent(":Virtuoso");
	// $scope.services = ConfigurationService.getComponentServices(":Virtuoso", "lds:SPARQLEndPointService");
	$scope.virtuoso = {
		service   : AccountService.getUsername()==null ? ConfigurationService.getPublicSPARQLEndpoint() : ConfigurationService.getSPARQLEndpoint(),
	 	dataset   : "",
	}

    $scope.refreshGraphList = function() {
	    GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
       	    var ngraphs = graphs;
       	    GraphGroupService.getAllGraphGroups(true).then(function(groups) {
       	        ngraphs = ngraphs.concat(groups);
       	        $scope.namedGraphs = ngraphs;
       	        $scope.virtuoso.dataset = $scope.namedGraphs[0];
       	    });
       	});
	};

	$scope.refreshGraphList();

	$scope.url = "";
	$scope.setUrl = function(){
	    if (AccountService.getUsername()==null) { //user is not authorized
	        $scope.url= $scope.virtuoso.service +
	            '?default-graph-uri=' + $scope.virtuoso.dataset.replace(':',ConfigurationService.getUriBase()) +
	            '&qtxt=select+distinct+%3FConcept+where+%7B%5B%5D+a+%3FConcept%7D+LIMIT+100'
	            '&format=text%2Fhtml' +
	            '&timeout=30000';
	    } else {
            $scope.url= "VirtuosoProxy" +
                    '?default-graph-uri=' + $scope.virtuoso.dataset.replace(':',ConfigurationService.getUriBase()) +
                                    '&qtxt=select+distinct+%3FConcept+where+%7B%5B%5D+a+%3FConcept%7D+LIMIT+100' +
                                    '&format=text%2Fhtml' +
                                    '&timeout=30000' +
                                    '&username=' + AccountService.getUsername();
        }
	};

	$scope.$watch( function () { return AccountService.getUsername(); }, function () {
	    $scope.refreshGraphList();
    });

});
