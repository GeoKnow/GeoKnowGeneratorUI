'use strict';


function NamespacesCtrl($scope, ConfigurationService) {

	$scope.namespaces = ConfigurationService.getAllNamespaces();

	var newGraph=true;
	$scope.new = function(){
	};

	$scope.edit = function(){
	};

	$scope.save = function(){
	};

	$scope.delete = function(){
	};
}

function ComponentServicesCtrl($scope, ConfigurationService){
	
	$scope.services = [];

	$scope.getServices = function(uri){
		$scope.services = ConfigurationService.getComponentServices(uri);
	};

}

function ComponentCtrl($scope, ConfigurationService){
	$scope.components = ConfigurationService.getAllComponents();
}

function EndpointCtrl($scope, ConfigurationService){
	
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
			$('#modalEndpoint').modal('hide');
			$scope.refreshTable();
		}
		else{
			// TODO: check if success then close the window or where to put error messages		
		}
	};

}

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


function UserCtrl($scope, $http, flash, DateService, AccountService) {
	var emptyUser = { profile: { accountURI:"", username:"", email:""}
	                    , ownGraphs: []
	                    , readableGraphs: []
	                    , writableGraphs: [] };

    var newUser = true;

    $scope.isNew = function() {
        return newUser;
    };

    $scope.notCurrent = function(user) {
        return user.profile.accountURI != AccountService.getAccountURI();
    };

    $scope.modaltitle = "";

	$scope.users = [];
    $scope.refreshUsersList = function() {
        var parameters = {
            mode: "getProfiles",
            curuser: AccountService.getUsername()
        };
        $http({
            url: "UserManagerServlet",
    	    method: "POST",
    	    dataType: "json",
    	    params: parameters,
    	    contentType: "application/json; charset=utf-8"
    	    })
    	    .success(function (data, status, headers, config) {
    	        $scope.users = data;
    	    })
    	    .error(function(data, status, headers, config) {
    	        flash.error = data;
    	    });
    }
    if (AccountService.getUsername()!=null) { $scope.refreshUsersList(); }

    $scope.graphs = [];
    $scope.refreshGraphsList = function() {
        var parameters = {
            mode: "getAll",
            username: AccountService.getUsername()
        };
        $http({
            url: "GraphManagerServlet",
    	    method: "POST",
    	    dataType: "json",
    	    params: parameters,
    	    contentType: "application/json; charset=utf-8"
    	    })
    	    .success(function (data, status, headers, config) {
    	        $scope.graphs = data;
    	    })
    	    .error(function(data, status, headers, config) {
    	        flash.error = data;
    	    });
    };

	$scope.user = emptyUser;

	$scope.new = function(){
	    newUser = true;
	    $scope.modaltitle = "New User";
		$scope.userForm.$setPristine();
		$scope.user = angular.copy(emptyUser);
		$scope.refreshGraphsList();
	};

    $scope.edit = function(username) {
   		newUser = false;
   		$scope.modaltitle = "Edit User";
   		for (var ind in $scope.users) {
   		    if ($scope.users[ind].profile.username == username) {
   		        $scope.user = angular.copy($scope.users[ind]);
   		        break;
   		    }
   		}
   		$scope.refreshGraphsList();
   	};

	$scope.save = function(){
	    var parameters = {
	        mode: newUser ? "create" : "update",
	        user: JSON.stringify($scope.user),
	        curuser: AccountService.getUsername()
        };
        $http({
            url: "UserManagerServlet",
            method: "POST",
            dataType: "json",
            params: parameters,
            contentType: "application/json; charset=utf-8"
            })
            .success(function (data, status, headers, config) {
                $scope.refreshUsersList();
                $('#modalUser').modal('hide');
            })
            .error(function(data, status, headers, config) {
                flash.error = data;
                $('#modalUser').modal('hide');
            });
	};

	$scope.delete = function(username) {
	    var parameters = {
	        mode: "delete",
	        username: username,
	        curuser: AccountService.getUsername()
        };
        $http({
            url: "UserManagerServlet",
            method: "POST",
            dataType: "json",
            params: parameters,
            contentType: "application/json; charset=utf-8"
            })
            .success(function (data, status, headers, config) {
                $scope.refreshUsersList();
            })
            .error(function(data, status, headers, config) {
                flash.error = data;
            });
	};

    $scope.toggleGraphRead = function(graph) {
        var index = $scope.user.readableGraphs.indexOf(graph);
        if (index > -1) { // is currently selected
            $scope.user.readableGraphs.splice(index, 1);
        } else { // is newly selected
            $scope.user.readableGraphs.push(graph);
        }
    };

    $scope.toggleGraphWrite = function(graph) {
        var index = $scope.user.writableGraphs.indexOf(graph);
        if (index > -1) { // is currently selected
            $scope.user.writableGraphs.splice(index, 1);
        } else { // is newly selected
            $scope.user.writableGraphs.push(graph);
        }
    };

    $scope.notOwn = function(graph) {
        return $scope.user.ownGraphs.indexOf(graph) == -1;
    };
}
