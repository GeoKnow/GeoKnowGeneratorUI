'use strict';


function EndpointCtrl($scope, $modal, ConfigurationService,  AccountService){
	
	
    ConfigurationService.getSettings().then(
        function(settings){
            $scope.endpoints = ConfigurationService.getAllEndpoints();
            $scope.uribase = ConfigurationService.getUriBase();
        }, 
        function(response){
            flash.error = ServerErrorResponse.getMessage(response);
        });
	
	
	$scope.modaltitle = "";

	$scope.isEditable = function(endpoint){
		if (endpoint==ConfigurationService.getSPARQLEndpoint() || endpoint==ConfigurationService.getPublicSPARQLEndpoint() ) 
			return false;
		else
			return true;
	};

 

	$scope.new = function(){
		var modalInstance = $modal.open({
        	templateUrl: 'modal-forms/settings/datasource/modal-endpoint.html',
        	controller: 'ModalEndpointCtrl',
        	size: 'lg',
        	backdrop: 'static',
        	resolve: {
        	currentEndpoint: function () {
            	return null;
      	    }
      		}
        });
    	
    	
    	modalInstance.result.then(function (endpoint) { 
    		ConfigurationService.addEndpoint(endpoint);
    		$scope.refreshTable();
    	});
    	
    	
		
	};

	$scope.edit = function(uri){
		
		var modalInstance = $modal.open({
        	templateUrl: 'modal-forms/settings/datasource/modal-endpoint.html',
        	controller: 'ModalEndpointCtrl',
        	size: 'lg',
        	backdrop: 'static',
        	resolve: {
        	currentEndpoint: function () {
            	return ConfigurationService.getEndpoint(uri);
      	    }
      		}
        });
    	
    	
    	modalInstance.result.then(function (endpoint) { 
    		ConfigurationService.updateEndpoint(endpoint);
    		$scope.refreshTable();
    	});
		
	};

	
	$scope.delete = function(uri){
		ConfigurationService.deleteResource(uri);
		$scope.refreshTable();
	};

	$scope.refreshTable = function(){
		$scope.endpoints = ConfigurationService.getAllEndpoints();
	};

	


}
