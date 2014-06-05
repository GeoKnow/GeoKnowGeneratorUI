'use strict';

function GeneralSettingsCtrl($scope, ConfigurationService) {

	$scope.endpointServices = ConfigurationService.getResourcesType("lds:SPARQLEndPointService");

	$scope.settings = { 
			uriBase 				: ConfigurationService.getUriBase(), 
			endpointService : ConfigurationService.getSPARQLEndpoint(),
			settingsGraph 	: ConfigurationService.getSettingsGraph()
	};

	$scope.$watch( function () { return ConfigurationService.getSettingsGraph(); }, function () {
	    $scope.settings.settingsGraph = ConfigurationService.getSettingsGraph();
	});

	// $scope.update = function(){
	// 	ConfigurationService.setUriBase($scope.settings.);
	// 	ConfigurationService.getSPARQLEndpoint($scope.settings);
	// }
}

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
		$scope.modaltitle = "_new-db-title_";
		$scope.database = angular.copy(emptyDatabase);
	};

	$scope.edit = function(uri){
		$scope.database = angular.copy(ConfigurationService.getDatabase(uri));
		$scope.database.uri = $scope.database.uri.replace(':','');
		newDatabase=false;
		$scope.modaltitle = "_edit-db-title_";
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
			$scope.close('#modalDatabase');
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

function GraphCtrl($scope, $http, flash, ConfigurationService, DateService, AccountService, GraphService, GraphGroupService, localize){
    $scope.accessModes = ConfigurationService.getAccessModes();

    $scope.localize = function(str) {
        return localize.getLocalizedString(str);
    };

    $scope.users = [];
    $scope.refreshUsersList = function() {
        var parameters = {
            mode: "getUsers"
        }
        $http({
            url: "AuthenticationServlet",
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

	var emptyGraph = {  name:"", 
										  graph: {
										  	created:"now", endpoint: "", description: "", modified:"", label:""
										},
						owner: "",
						publicAccess:"",
						usersWrite: [],
						usersRead: []};
	var newGraph=true;
	
	$scope.namedgraphs = ConfigurationService.getAllNamedGraphs();

    GraphService.getAccessibleGraphs(false, true, false).then(function(graphs) {
        $scope.accnamedgraphs = graphs;
    });

    $scope.allgraphs = [];
    GraphService.getAllNamedGraphs(false).then(function(graphs) {
        $scope.allgraphs = graphs;
    });

	$scope.namedgraph = emptyGraph;
	$scope.modaltitle = "";

	$scope.isNew = function(){
		return newGraph;
	};

	$scope.new = function(){
		// default values
		newGraph=true;
		$scope.graphForm.$setPristine();
		$scope.modaltitle = "_new-ngraph-title_";

		var s_now = DateService.getCurrentDate();
		var defaultEndpoint = ConfigurationService.getSPARQLEndpoint();

		$scope.namedgraph = angular.copy(emptyGraph);
		$scope.namedgraph.graph.created = s_now;
		$scope.namedgraph.graph.modified = s_now;
		$scope.namedgraph.graph.endpoint = ConfigurationService.getSPARQLEndpoint();
		$scope.namedgraph.publicAccess = ConfigurationService.getNoAccessMode();
		$scope.namedgraph.owner = AccountService.getAccountURI();

		$scope.refreshUsersList();
	};

	$scope.edit = function(graphName){
		$scope.namedgraph = angular.copy(ConfigurationService.getNamedGraph(graphName));
		$scope.namedgraph.name = $scope.namedgraph.name.replace(':','');
		$scope.namedgraph.owner = AccountService.getAccountURI();
		newGraph=false;
		$scope.modaltitle = "_edit-ngraph-title_";
		$scope.refreshUsersList();
	};

    $scope.editAdmin = function(graphName){
        $scope.namedgraph = angular.copy(GraphService.getNamedGraph(graphName));
        $scope.namedgraph.name = $scope.namedgraph.name.replace(':','');
		newGraph=false;
		$scope.modaltitle = "_edit-ngraph-title_";
		$scope.refreshUsersList();
	};

	$scope.save = function(){
		
		var success =  false;
		$scope.namedgraph.name =  ":" + $scope.namedgraph.name;
		if(newGraph)
			success = ConfigurationService.addGraph($scope.namedgraph);
		else {
			if ($scope.namedgraph.owner==AccountService.getAccountURI())
			    success = ConfigurationService.updateGraph($scope.namedgraph);
			else {
			    GraphService.updateForeignGraph($scope.namedgraph).then(function(response) {
			        $scope.refreshAllGraphs();
			    });
			    success = true;
			}
		}
			
		if(success){
			$scope.close('#modalGraph');
			$scope.refreshTable();
			$scope.refreshAllGraphs();
		}
		else{
		// TODO: check if success then close the window or where to put error messages		
		}
	};

	$scope.delete = function(graphName){
		ConfigurationService.deleteGraph(graphName);
		$scope.refreshTable();
		$scope.refreshAllGraphs();
		$scope.refreshGraphGroups();
	};

	$scope.deleteForeign = function(graphName) {
	    GraphService.deleteForeignGraph(graphName).then(function(response) {
	        $scope.refreshTable();
            $scope.refreshAllGraphs();
            $scope.refreshGraphGroups();
	    });
	};

    $scope.toggleUserRead = function(user) {
        var index = $scope.namedgraph.usersRead.indexOf(user);
        if (index > -1) { // is currently selected
            $scope.namedgraph.usersRead.splice(index, 1);
        } else { // is newly selected
            $scope.namedgraph.usersRead.push(user);
        }
    };

    $scope.toggleUserWrite = function(user) {
        var index = $scope.namedgraph.usersWrite.indexOf(user);
        if (index > -1) { // is currently selected
            $scope.namedgraph.usersWrite.splice(index, 1);
        } else { // is newly selected
            $scope.namedgraph.usersWrite.push(user);
        }
    };

	$scope.refreshTable = function(){
		$scope.namedgraphs = ConfigurationService.getAllNamedGraphs();
	};

    $scope.refreshAccessibleGraphs = function() {
        GraphService.getAccessibleGraphs(false, true, true).then(function(graphs) {
            $scope.accnamedgraphs = graphs;
        });
	};

	$scope.refreshAllGraphs = function() {
	    GraphService.getAllNamedGraphs(true).then(function(graphs) {
	        $scope.allgraphs = graphs;
	    });
	};

	$scope.isUserAuthenticated = function() {
	    return AccountService.isLogged();
	};

	$scope.isAdminLogged = function() {
	    return AccountService.isAdmin();
	};

    $scope.userFilter = function(user) {
        return user != $scope.namedgraph.owner;
    };

    $scope.graphFilter = function(namedgraph) {
        return namedgraph.owner != AccountService.getAccountURI();
    };

    $scope.graphgroups = [];
    GraphGroupService.getAllGraphGroups(false).then(function(result) {
        $scope.graphgroups = result;
    });
    var emptyGroup = { name : "", label : "", description : "", created : "", modified : "", namedGraphs : [] };
    var newGroup = false;
    $scope.isNewGroup = function(){
		return newGroup;
	};

	$scope.graphgroup = emptyGroup;

	$scope.newGroup = function() {
		newGroup=true;
		$scope.groupForm.$setPristine();
		$scope.modaltitle = "_new-graph-group-title_";
		var s_now = DateService.getCurrentDate();
		$scope.graphgroup = angular.copy(emptyGroup);
		$scope.graphgroup.created = s_now;
		$scope.graphgroup.modified = s_now;
		$scope.refreshAllGraphs();
	};

	$scope.editGroup = function(groupName) {
		$scope.graphgroup = angular.copy(GraphGroupService.getGraphGroup(groupName));
		$scope.graphgroup.name = $scope.graphgroup.name.replace(':','');
		newGroup=false;
		$scope.modaltitle = "_edit-graph-group-title_";
		$scope.refreshAllGraphs();
	};

	$scope.saveGroup = function() {
		$scope.graphgroup.name =  ":" + $scope.graphgroup.name;
		if (newGroup) {
			GraphGroupService.addGraphGroup($scope.graphgroup).then(function(result) {
			    $scope.close('#modalGroup');
			    $scope.refreshGraphGroups();
			});
		} else {
			GraphGroupService.updateGraphGroup($scope.graphgroup).then(function(result) {
			    $scope.close('#modalGroup');
			    $scope.refreshGraphGroups();
			});
		}
	};

	$scope.deleteGroup = function(groupName){
		GraphGroupService.deleteGraphGroup(groupName).then(function(result) {
		    $scope.refreshGraphGroups();
		});
	};

	$scope.refreshGraphGroups = function() {
	    GraphGroupService.getAllGraphGroups(true).then(function(result) {
            $scope.graphgroups = result;
        });
    };

    $scope.toggleGraph = function(graphName) {
        var index = $scope.graphgroup.namedGraphs.indexOf(graphName);
        if (index > -1) { // is currently selected
            $scope.graphgroup.namedGraphs.splice(index, 1);
        } else { // is newly selected
            $scope.graphgroup.namedGraphs.push(graphName);
        }
    };

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };

    //watch
	$scope.$watch( function () { return ConfigurationService.getAllNamedGraphs(); }, function () {
	    $scope.refreshTable();
	}, true);

	$scope.$watch( function () { return AccountService.getUsername(); }, function () {
        $scope.refreshAccessibleGraphs();
        $scope.refreshAllGraphs();
    });
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
	    $scope.modaltitle = "_new-user-title_";
		$scope.userForm.$setPristine();
		$scope.user = angular.copy(emptyUser);
		$scope.refreshGraphsList();
	};

    $scope.edit = function(username) {
   		newUser = false;
   		$scope.modaltitle = "_edit-user-title_";
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
                $scope.close('#modalUser');
            })
            .error(function(data, status, headers, config) {
                flash.error = data;
                $scope.close('#modalUser');
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

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };
}
