'use strict';

function UsersCtrl($scope, $http, flash, Helpers, AccountService) {
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
