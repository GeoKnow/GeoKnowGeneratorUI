'use strict';


function EndpointCtrl($scope, ConfigurationService,  AccountService){
	
	var emptyEndpoint = { uri: "", label:"", endpoint: "", homepage: ""};
	var newEndpoint=true;
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.endpoint = emptyEndpoint;
	$scope.uribase = ConfigurationService.getUriBase();
	$scope.modaltitle = "";

  $scope.isNew = function(){
		return newEndpoint;
	};

	$scope.new = function(){
		// default values
		newEndpoint=true;
		$scope.modaltitle = "_new-endpoint-title_";
		$scope.endpoint = angular.copy(emptyEndpoint);
		$scope.endpointForm.$setPristine();
	};

	$scope.edit = function(uri){
		$scope.endpoint = angular.copy(ConfigurationService.getEndpoint(uri));
		$scope.endpoint.uri = $scope.endpoint.uri.replace(':',''); //for the validation to be accepted
		newEndpoint=false;
		$scope.modaltitle = "_edit-endpoint-title_";
	};

	$scope.delete = function(uri){
		ConfigurationService.deleteResource(uri);
		$scope.refreshTable();
	};

	$scope.refreshTable = function(){
		$scope.endpoints = ConfigurationService.getAllEndpoints();
	};

	$scope.save = function(){
		var success =  false;
		$scope.endpoint.uri =  ":" + $scope.endpoint.uri;
		if(newEndpoint)
			success = ConfigurationService.addEndpoint($scope.endpoint);
		else
			success = ConfigurationService.updateEndpoint($scope.endpoint);

		if(success){
			$scope.close('#modalEndpoint');
			$scope.refreshTable();
		}
		else{
			// TODO: check if success then close the window or where to put error messages		
		}
	};

    $scope.close = function(modalID) {
    	$(modalID).modal('hide');
        $('body').removeClass('modal-open');
      	$('.modal-backdrop').slideUp();
      	$('.modal-scrollable').slideUp();
    };

}
