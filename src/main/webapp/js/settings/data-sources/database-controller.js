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
		ConfigurationService.deleteResource(uri).then(
			function(response){
				$scope.refreshTable();	
			},
			function(response){
				flash.error = ServerErrorResponse.getMessage(response);
			});
	};

	$scope.refreshTable = function(){
		$scope.databases = ConfigurationService.getAllDatabases();
	};

	$scope.save = function(){
		var promise;
		$scope.database.uri =  ":" + $scope.database.uri;
		if(newDatabase)
			promise = ConfigurationService.addDatabase($scope.database);
		else
			promise = ConfigurationService.updateDatabase($scope.database);
		promise.then(
			function(response){
				$scope.close('#modalDatabase');
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
