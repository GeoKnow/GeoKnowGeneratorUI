'use strict';

function UsersCtrl($scope, $http, $modal, flash, Config, Helpers, AccountService, ConfigurationService, GraphService, UsersService) {

    $scope.notCurrent = function(user) {
        return user.profile.accountURI != AccountService.getAccount().getAccountURI();
    };


	$scope.users = [];
    $scope.refreshUsersList = function() {
        var parameters = {
            mode: "getProfiles",
            curuser: AccountService.getAccount().getUsername()
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
    if (AccountService.getAccount().getUsername()!=undefined) { $scope.refreshUsersList(); }

    $scope.graphs = [];
    $scope.refreshGraphsList = function(){
    	GraphService.getAllNamedGraphs(true).then(function(data){
    		$scope.graphs = data;
    		
    	});
    }

	

	$scope.new = function(){

		var modalInstance = $modal.open({
        	templateUrl: 'modal-forms/settings/modal-user.html',
        	controller: 'ModalUserCtrl',
        	size: 'lg',
        	backdrop: 'static',
        	resolve: {
        		currentUser: function(){        		
        			return null;            	       			
        		}        		
        	}
        	
        });
    	
    	
    	modalInstance.result.then(function (user) { 

    		save(user, true);
    	});

	};

    $scope.edit = function(username) {
    	
    	var modalInstance = $modal.open({
        	templateUrl: 'modal-forms/settings/modal-user.html',
        	controller: 'ModalUserCtrl',
        	size: 'lg',
        	backdrop: 'static',
        	resolve: {
        		currentUser: function(){
        		
        			for (var ind in $scope.users) {
        	   		    if ($scope.users[ind].profile.username == username) {
        	   		    	var user =  angular.copy($scope.users[ind]);
        	   		    	user.profile.role = user.profile.role.uri.replace(Config.getFrameworkOntologyNS(), "gkg:");
        	   		        return user;
        	   		        
        	   		    }
        	   		}
        			
        		}
        		
        	}
        	
        });
    	
    	
    	modalInstance.result.then(function (user) { 

    		save(user, false);
    	});
    	
    	
    	
   		
   	};
   	
   	
   	$scope.shorten = function(graph){
   		return graph.replace(ConfigurationService.getUriBase(),":");
   	}
   	
	var save = function(user, newUser){
		user.profile.role = user.profile.role.replace("gkg:", Config.getFrameworkOntologyNS());
	    var parameters = {
	        mode: newUser ? "create" : "update",
	        user: JSON.stringify(user),
	        curuser: AccountService.getAccount().getUsername()
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

	$scope.delete = function(username) {
	    var parameters = {
	        mode: "delete",
	        username: username,
	        curuser: AccountService.getAccount().getUsername()
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
    
}
