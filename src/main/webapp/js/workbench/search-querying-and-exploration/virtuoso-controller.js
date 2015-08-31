'use strict';

/****************************************************************************************************
*
* Virtuoso Controller
*
***************************************************************************************************/
app.controller('VirtuosoCtrl', function($scope, ConfigurationService, ComponentsService, AccountService, GraphService, GraphGroupService, Ns) {

	var componentId ="Virtuoso";
	var serviceId = "VirtuosoAuthSPARQLEndpoint";

	ComponentsService.getComponent(componentId).then(
		//success
		function(response){
			$scope.component = response;
			$scope.sevice = ComponentsService.getComponentService(serviceId, $scope.component);
			if($scope.sevice== null)
				flash.error="Service not configured: " +serviceId;	
		}, 
		function(response){
			flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
		});


  //scope variable is for the source-graph direcitve
  $scope.source = { 
      label : "Source Graph",
      graph : "" };

	$scope.virtuoso = {
		service   : AccountService.getAccount().getUsername()==null ? ConfigurationService.getPublicSPARQLEndpoint() : ConfigurationService.getSPARQLEndpoint(),
	 	dataset   : "",
	}

	
	$scope.updateServiceParams = function(){
		console.log($scope.source.graph);
	    if (AccountService.getAccount().getUsername()==null) { //user is not authorized
	      $scope.url= $scope.virtuoso.service +
	            '?default-graph-uri=' + encodeURIComponent( Ns.lengthen($scope.source.graph))+
	            '&qtxt=select+distinct+%3FConcept+where+%7B%5B%5D+a+%3FConcept%7D+LIMIT+100'
	            '&format=text%2Fhtml' +
	            '&timeout=30000';
	    } else {
        $scope.url= 'VirtuosoProxy' +
                    '?default-graph-uri=' + encodeURIComponent(Ns.lengthen($scope.source.graph)) +
                    '&qtxt=select+distinct+%3FConcept+where+%7B%5B%5D+a+%3FConcept%7D+LIMIT+100' +
                    '&format=text%2Fhtml' +
                    '&timeout=30000';
      }
	};

	$scope.updateServiceParams();

});
