'use strict';

function LicenseSourceCtrl($scope, $sce, $http, $modal, ConfigurationService){
	
	
	$scope.licenses = ConfigurationService.getAllLicenseSources();
	$scope.uribase = ConfigurationService.getUriBase();
	$scope.identifiers = ConfigurationService.getIdentifiers();
	


	/**
	 * function called, when modal form for creating new data source gets opened
	 */
	$scope.new = function(){
		
		var modalInstance = $modal.open({
        	templateUrl: 'modal-forms/settings/datasource/modal-license.html',
        	controller: 'ModalLicenseCtrl',
        	size: 'lg',
        	backdrop: 'static',
        	resolve: {
        		currentLicense: function () {
            	return null;
      	    }
      		}
        });
    	
    	
    	modalInstance.result.then(function (license) { 
    		ConfigurationService.addLicenseSource(license);
    		$scope.refreshTable();
    	});
	};

	/**
	 * function called, when modal form for editing existing data source gets opened.
	 * gets also data source object by its uri
	 * @param uri as identifier of object
	 */
	$scope.edit = function(uri){
		
		var modalInstance = $modal.open({
        	templateUrl: 'modal-forms/settings/datasource/modal-license.html',
        	controller: 'ModalLicenseCtrl',
        	size: 'lg',
        	backdrop: 'static',
        	resolve: {
        		currentLicense: function () {
            	return ConfigurationService.getLicenseSource(uri);
      	    }
      		}
        });
    	
    	
    	modalInstance.result.then(function (license) { 
    		ConfigurationService.updateLicenseSource(license);
    		$scope.refreshTable();
    	});
	};

	/**
	 * function for deleting csv data source
	 */
	$scope.delete = function(uri){
		
		ConfigurationService.deleteResource(uri);
		$scope.refreshTable();
	};

	/**
	 * function, that gets the current list of csv data sources from the ConfigurationService
	 */
	$scope.refreshTable = function(){
		
		$scope.licenses = ConfigurationService.getAllLicenseSources();
		
	};

	
}
