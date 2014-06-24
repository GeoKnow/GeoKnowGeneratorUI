'use strict';

function UserRolesCtrl($scope, UsersService, ConfigurationService, $q) {
    $scope.services = ConfigurationService.getAllServices();
    $scope.users = UsersService.getAllUsers();
    $scope.roles = UsersService.getAllRoles();

    $scope.roleCreating = false;
    $scope.newRole = {id:"", name:""};

    $scope.changedRoles = [];
    $scope.changedUsers = [];

    $scope.savingRoles = false;
    $scope.savingUsers = false;

    $scope.refreshUsers = function() {
        UsersService.reloadUsers().then(function(result) {
            $scope.users = result;
        });
    };

    $scope.refreshRoles = function() {
        UsersService.reloadRoles().then(function(result) {
            $scope.roles = result;
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
        console.log(role);
    };

    $scope.serviceAllowed = function(service, role) {
        if (role.uri=="gkg:Administrator") return true;
        return role.services.indexOf(service.uri) > -1;
    };

    $scope.hasRole = function(user, role) {
        return user.profile.role==role.uri;
    };

    $scope.toggleRole = function(user, role) {
        if (user.profile.role==role.uri) user.profile.role = "gkg:BasicUser";
        else user.profile.role = role.uri;
        if ($scope.changedUsers.indexOf(user.profile.accountURI) == -1) $scope.changedUsers.push(user.profile.accountURI);
        console.log(user);
    };

    $scope.createRole = function() {
        $scope.roleCreating = true;
        UsersService.createRole($scope.newRole.id, $scope.newRole.name).then(function(response) {
            $scope.refreshRoles();
            $scope.roleCreating = false;
            $scope.close("#modalRole");
        }, function(response) {
            $scope.roleCreating = false;
            $scope.close("#modalRole");
        });
    };

    $scope.new = function() {
        $scope.roleCreating = false;
        $scope.newRole = {id:"", name:""};
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
            $scope.changedRoles = [];
            $scope.refreshRoles();
        });
    };

    $scope.revertRoles = function() {
        $scope.refreshRoles();
        $scope.changedRoles = [];
    };

    $scope.saveUsers = function() {
        $scope.savingUsers = true;
        var promises = [];
        for (var ind in $scope.users) {
            if ($scope.changedUsers.indexOf($scope.users[ind]) > -1) {
                promises.push(UsersService.setUserRole($scope.users[ind].profile.accountURI, $scope.users[ind].profile.role));
            }
        }
        $q.all(promises).then(function(data) {
            $scope.savingUsers = false;
            $scope.changedUsers = [];
            $scope.refreshUsers();
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

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };

    console.log($scope.services);
    console.log($scope.roles);
    console.log($scope.users);
}