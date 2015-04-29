'use strict';

function UserRolesCtrl($scope, $modal, UsersService, ConfigurationService, $q, ServerErrorResponse, flash, AccountService, $window) {
    $scope.services = ConfigurationService.getAllServices();
    $scope.users = UsersService.getAllUsers();
    $scope.roles = UsersService.getAllRoles();

    $scope.changedRoles = [];
    $scope.changedUsers = [];

    $scope.savingRoles = false;
    $scope.savingUsers = false;

    $scope.defaultRole = null;
    $scope.notLoggedInRole = null;

    var getBasicUserRole = function() {
        for (var ind in $scope.roles) {
            if ($scope.roles[ind].uri=="gkg:BasicUser") return $scope.roles[ind];
        }
        return null;
    };

    var initDefaultRoles = function() {
        $scope.defaultRole = null;
        $scope.notLoggedInRole = null;
        for (var ind in $scope.roles) {
            if ($scope.roles[ind].isDefault) $scope.defaultRole = $scope.roles[ind];
            else if ($scope.roles[ind].isNotLoggedIn) $scope.notLoggedInRole = $scope.roles[ind];
        }
        if ($scope.defaultRole==null) $scope.defaultRole = getBasicUserRole();
        if ($scope.notLoggedInRole==null) $scope.notLoggedInRole = getBasicUserRole();
    };

    initDefaultRoles();

    $scope.refreshUsers = function() {
        UsersService.reloadUsers().then(function(result) {
            $scope.users = result;
            $scope.changedUsers = [];
        });
    };

    $scope.refreshRoles = function() {
        UsersService.reloadRoles().then(function(result) {
            $scope.roles = result;
            $scope.changedRoles = [];
            initDefaultRoles();
        });
    };

    $scope.roleUnchangeable = function(role) {
        return role.uri=="gkg:Administrator" || role.uri=="gkg:BasicUser";
    };

    $scope.toggleService = function(service, role) {
        var index = role.services.indexOf(service.uri);
        if (index > -1) { // is currently selected
            role.services.splice(index, 1);
        } else { // is newly selected
            role.services.push(service.uri);
        }
        if ($scope.changedRoles.indexOf(role.uri)==-1) $scope.changedRoles.push(role.uri);
    };

    $scope.serviceAllowed = function(service, role) {
        if (role.uri=="gkg:Administrator") return true;
        return role.services.indexOf(service.uri) > -1;
    };

    $scope.hasRole = function(user, role) {
        return user.profile.role.uri==role.uri;
    };

    $scope.toggleRole = function(user, role) {
        if (user.profile.role.uri==role.uri) user.profile.role.uri = "gkg:BasicUser";
        else user.profile.role.uri = role.uri;
        if ($scope.changedUsers.indexOf(user.profile.accountURI) == -1) $scope.changedUsers.push(user.profile.accountURI);
    };

    $scope.newRole = function() {
      
    	var modalInstance = $modal.open({
        	templateUrl: 'modal-forms/settings/modal-roles.html',
        	controller: 'ModalRolesCtrl',
        	size: 'lg',
        	backdrop: 'static'
        	
        });
    	
    	
    	modalInstance.result.then(function (newRole) { 
    		 UsersService.createRole(newRole.id, newRole.name).then(function(response) {
    	            $scope.refreshRoles();
    	            flash.success = "Created";
    	            
    	        }, function(response) {
    	            
    	            flash.error = ServerErrorResponse.getMessage(response);
    	            
    	        });
    	});
    	

    };

    $scope.saveRoles = function() {
        $scope.savingRoles = true;
        var promises = [];
        for (var ind in $scope.roles) {
            if ($scope.changedRoles.indexOf($scope.roles[ind].uri) > -1) {
                promises.push(UsersService.updateRoleServices($scope.roles[ind].uri, $scope.roles[ind].services));
            }
        }
        $q.all(promises).then(function(data) {
            $scope.savingRoles = false;
            $scope.refreshRoles();
            flash.success = "Saved";
            $window.scrollTo(0,0);
        }, function(response) {
            $scope.savingRoles = false;
            flash.error = ServerErrorResponse.getMessage(response);
            $window.scrollTo(0,0);
        });
    };

    $scope.revertRoles = function() {
        $scope.refreshRoles();
        $scope.changedRoles = [];
    };

    $scope.setDefaultRole = function() {
        UsersService.setDefaultRole($scope.defaultRole.uri).then(function(response) {
            $scope.refreshRoles();
        }, function(response) {
            $scope.refreshRoles();
        });
    };

    $scope.setNotLoggedInRole = function() {
        UsersService.setNotLoggedInRole($scope.notLoggedInRole.uri).then(function(response) {
            $scope.refreshRoles();
        }, function(response) {
            $scope.refreshRoles();
        });
    };

    $scope.saveUsers = function() {
        $scope.savingUsers = true;
        var promises = [];
        for (var ind in $scope.users) {
            if ($scope.changedUsers.indexOf($scope.users[ind].profile.accountURI) > -1) {
                promises.push(UsersService.setUserRole($scope.users[ind].profile.accountURI, $scope.users[ind].profile.role.uri));
            }
        }
        $q.all(promises).then(function(data) {
            $scope.savingUsers = false;
            $scope.refreshUsers();
            flash.success = "Saved";
            $window.scrollTo(0,0);
        }, function(response) {
            $scope.savingUsers = false;
            flash.error = ServerErrorResponse.getMessage(response);
            $window.scrollTo(0,0);
        });
    };

    $scope.revertUsers = function() {
        $scope.refreshUsers();
        $scope.changedUsers = [];
    };

    $scope.isUsersChanged = function() {
        return $scope.changedUsers.length > 0;
    };

    $scope.isRolesChanged = function() {
        return $scope.changedRoles.length > 0;
    };

    var createUser = function(newUser) {
        var user = angular.copy(newUser);
        UsersService.createUser(user).then(function(response) {
            $scope.refreshUsers();
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
            $scope.refreshUsers();
        }, function(response) {
            flash.error = ServerErrorResponse.getMessage(response);
            $window.scrollTo(0,0);
            $scope.refreshUsers();
        })
    };

    $scope.isCurrentUser = function(user) {
        return user.profile.username == AccountService.getAccount().getUsername();
    };

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };
}