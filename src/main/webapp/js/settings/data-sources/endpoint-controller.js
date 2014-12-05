'use strict';


function EndpointCtrl($scope, ConfigurationService){
	
	var emptyEndpoint = { uri: "", label:"", endpoint: "", homepage: ""};
	var newEndpoint=true;
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.endpoint = emptyEndpoint;
	$scope.uribase = ConfigurationService.getUriBase();
	$scope.modaltitle = "";

	$scope.isEditable = function(endpoint){
		if (endpoint==ConfigurationService.getSPARQLEndpoint() || endpoint==ConfigurationService.getPublicSPARQLEndpoint() ) 
			return false;
		else
			return true;
	};

  $scope.isNew = function(){
		return newEndpoint;
	};

	$scope.new = function(){
		// default values
		newEndpoint=true;
		$scope.modaltitle = "New Endpoint";
		$scope.endpoint = angular.copy(emptyEndpoint);
		$scope.endpointForm.$setPristine();
	};

	$scope.edit = function(uri){
		$scope.endpoint = angular.copy(ConfigurationService.getEndpoint(uri));
		$scope.endpoint.uri = $scope.endpoint.uri.replace(':',''); //for the validation to be accepted
		newEndpoint=false;
		$scope.modaltitle = "Edit Endopoint";
	};

	$scope.delete = function(uri){
		ConfigurationService.deleteResource(uri).then(
			function(response){
				$scope.refreshTable();	
			},
			function(response){
				flash.error = ServerErrorResponse.getMessage(response);
			});
	};

	$scope.refreshTable = function(){
		$scope.endpoints = ConfigurationService.getAllEndpoints();
	};

	$scope.save = function(){
		var promise;
		$scope.endpoint.uri =  ":" + $scope.endpoint.uri;
		if(newEndpoint)
			promise = ConfigurationService.addEndpoint($scope.endpoint);
		else
			promise = ConfigurationService.updateEndpoint($scope.endpoint);

		promise.then(
			function(response){
				$scope.close('#modalEndpoint');
				$scope.refreshTable();}, 
			function(response){
				flash.error = ServerErrorResponse.getMessage(response);
			});
		
	};

  $scope.close = function(modalID) {
    	$(modalID).modal('hide');
        $('body').removeClass('modal-open');
      	$('.modal-backdrop').slideUp();
      	$('.modal-scrollable').slideUp();
    };

}
