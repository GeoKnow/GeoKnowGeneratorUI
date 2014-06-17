'use strict';

function DatabaseCtrl($scope, ConfigurationService){
	
	var emptyDatabase = { uri: "", label:"", dbHost:"", dbName: "", dbType: "", dbUser: "", dbPassword: "", dbPort:""};
	var newDatabase=true;
	$scope.databases = ConfigurationService.getAllDatabases();
	$scope.databaseTypes = ConfigurationService.getDatabaseTypes();
	$scope.database = emptyDatabase;
	$scope.uribase = ConfigurationService.getUriBase();
	$scope.modaltitle = "";
	$scope.identifiers = ConfigurationService.getIdentifiers();

	$scope.isNew = function(){
		return newDatabase;
	};

	$scope.new = function(){
		// default values
		$scope.databaseForm.$setPristine();
		newDatabase=true;
		$scope.modaltitle = "New Database";
		$scope.database = angular.copy(emptyDatabase);
	};

	$scope.edit = function(uri){
		$scope.database = angular.copy(ConfigurationService.getDatabase(uri));
		$scope.database.uri = $scope.database.uri.replace(':','');
		newDatabase=false;
		$scope.modaltitle = "Edit Database";
	};

	$scope.delete = function(uri){
		ConfigurationService.deleteResource(uri);
		$scope.refreshTable();
	};

	$scope.refreshTable = function(){
		$scope.databases = ConfigurationService.getAllDatabases();
	};

	$scope.save = function(){
		var success =  false;
		$scope.database.uri =  ":" + $scope.database.uri;
		if(newDatabase)
			success = ConfigurationService.addDatabase($scope.database);
		else
			success = ConfigurationService.updateDatabase($scope.database);
		
		if(success){
			$('#modalDatabase').modal('hide');
			$scope.refreshTable();
		}
		else{
		// TODO: check if success then close the window or where to put error messages		
		}
	};
}
