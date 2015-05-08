'use strict';

function DatabaseCtrl($scope, $modal, ConfigurationService){
	
	
    ConfigurationService.getSettings().then(
        function(settings){
            $scope.databases = ConfigurationService.getAllDatabases();
            $scope.uribase = ConfigurationService.getUriBase();
            $scope.identifiers = ConfigurationService.getIdentifiers();
        }, 
        function(response){
            flash.error = ServerErrorResponse.getMessage(response);
        });

	$scope.modaltitle = "";

	$scope.new = function(){
		
		var modalInstance = $modal.open({
        	templateUrl: 'modal-forms/settings/datasource/modal-database.html',
        	controller: 'ModalDatabaseCtrl',
        	size: 'lg',
        	backdrop: 'static',
        	resolve: {
        	currentDatabase: function () {
            	return null;
      	    }
      		}
        });
    	
    	
    	modalInstance.result.then(function (database) { 
    		ConfigurationService.addDatabase(database);
    		$scope.refreshTable();
    	});
		
	};

	$scope.edit = function(uri){
		
		var modalInstance = $modal.open({
        	templateUrl: 'modal-forms/settings/datasource/modal-database.html',
        	controller: 'ModalDatabaseCtrl',
        	size: 'lg',
        	backdrop: 'static',
        	resolve: {
        	currentDatabase: function () {
            	return ConfigurationService.getDatabase(uri);
      	    }
      		}
        });
    	
    	
    	modalInstance.result.then(function (database) { 
    		ConfigurationService.updateDatabase(database);
    		$scope.refreshTable();
    	});
	};

	$scope.delete = function(uri){
		ConfigurationService.deleteResource(uri);
		$scope.refreshTable();
	};

	$scope.refreshTable = function(){
		$scope.databases = ConfigurationService.getAllDatabases();
	};

	

    
}
