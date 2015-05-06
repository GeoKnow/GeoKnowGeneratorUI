'use strict';

function UserRolesCtrl($scope, $modal, UsersService, ConfigurationService, ComponentsService, RolesService, $q, ServerErrorResponse, flash, AccountService, $window) {

    var refreshRoles = function() {
        RolesService.getAllRoles().then(
            function(roles){
                $scope.roles = roles;
                for(var i in $scope.roles){
                    if($scope.roles[i].isDefault)
                        $scope.defaultRole = $scope.roles[i];
                    if($scope.roles[i].isNotLoggedIn)
                        $scope.notLoggedInRole = $scope.roles[i];
                }
            },
            function(response){
                flash.error = ServerErrorResponse.getMessage(response);
            });
        };
    var refreshUsers = function() {
        UsersService.reloadUsers().then(function(result) {
            $scope.users = result;
            $scope.changedUsers = [];
        });
    };

    // initialise settings and scope variables  
    ConfigurationService.getSettings().then(
        //success
        function(){
            // initialise roles
            refreshRoles();
            refreshUsers();
            // get all services
            ComponentsService.getAllServices().then(function(services){
                $scope.services = services;   
            });
        },
        //fail
        function(response){
            flash.error = ServerErrorResponse.getMessage(response);
        });

    $scope.roleUnchangeable = function(role) {
        return role.uri==ConfigurationService.getUriBase()+"Administrator" ;
    };

    $scope.toggleService = function(service, role) {
        var index = role.services.indexOf(service.uri);
        if (index > -1) { // is currently selected
            role.services.splice(index, 1);
        } else { // is newly selected
            role.services.push(service.uri);
        }
        RolesService.updateRole(role).then(
            //success
            function(response){
                refreshRoles();
            },
            //fail
            function(response){
                flash.error = ServerErrorResponse.getMessage(response);
            });
    };

    $scope.serviceAllowed = function(service, role) {
        if (role.uri==ConfigurationService.getUriBase()+"Administrator") 
            return true;
        return role.services.indexOf(service.uri) > -1;
    };

    $scope.hasRole = function(user, role) {
        return user.profile.role.uri==role.uri;
    };

    $scope.toggleRole = function(user, role) {
        UsersService.setUserRole(user.profile.accountURI, role.uri).then(
            function(response){
                refreshUsers();
            },
            function(response){
                flash.error = ServerErrorResponse.getMessage(response);
            });
    };

    $scope.newRole = function() {
      
    	var modalInstance = $modal.open({
        	templateUrl: 'modal-forms/settings/modal-roles.html',
        	controller: 'ModalRolesCtrl',
        	size: 'lg',
        	backdrop: 'static'
        	
        });
    	
        modalInstance.result.then(function (newRole) { 
    		RolesService.addRole(newRole).then(
                function(response) {
                    refreshRoles();
                }, function(response) {
    	            flash.error = ServerErrorResponse.getMessage(response);
    	        });
    	});

    };


    $scope.setDefaultRole = function() {

        RolesService.setDefaultRole($scope.defaultRole.uri).then(
            //success
            function(response){
                refreshRoles();
            },
            //fail
            function(response){
                flash.error = ServerErrorResponse.getMessage(response);
            });
    };

    $scope.setNotLoggedInRole = function() {
        RolesService.setNotLoggedInRole($scope.notLoggedInRole.uri).then(
            //success
            function(response){
                refreshRoles();
            },
            //fail
            function(response){
                flash.error = ServerErrorResponse.getMessage(response);
            });
    };


    var createUser = function(newUser) {
        var user = angular.copy(newUser);
        UsersService.createUser(user).then(function(response) {
            refreshUsers();
            flash.success ="Created";
        }, function(response) {
           
            flash.error = ServerErrorResponse.getMessage(response);
            
        });
    };

    $scope.newUser = function(){
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
    		createUser(user);
    	});
    }
    
    $scope.deleteUser = function(user) {
        UsersService.deleteUser(user.profile.username).then(function(response) {
            refreshUsers();
        }, function(response) {
            flash.error = ServerErrorResponse.getMessage(response);
            $window.scrollTo(0,0);
            refreshUsers();
        })
    };

    $scope.isCurrentUser = function(user) {
        return user.profile.username == AccountService.getAccount().getUsername();
    };

}