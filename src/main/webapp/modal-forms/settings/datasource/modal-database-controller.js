'use strict';

function ModalDatabaseCtrl($scope, $http, $modalInstance, currentDatabase, ConfigurationService) {
	
	$scope.modaltitle = "New";
	$scope.database = { 
			uri: "", 
			label:"", 
			dbHost:"", 
			dbName: "", 
			dbType: "", 
			dbUser: "", 
			dbPassword: "", 
			dbPort:""};
	
	$scope.isNew=true;
	$scope.databaseTypes = ConfigurationService.getDatabaseTypes();
	if(currentDatabase!=null){
		$scope.modaltitle = "Edit";
		
		$scope.database = angular.copy(currentDatabase);
		$scope.database.uri = $scope.database.uri.replace(':','');
		$scope.isNew=false;
		
	}
	  $scope.ok = function () {
		  $scope.database.uri = ":"+$scope.database.uri;
		  var input = angular.copy($scope.database);
		 
	    $modalInstance.close(input);
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	}