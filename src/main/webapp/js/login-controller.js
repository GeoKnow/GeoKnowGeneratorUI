'use strict';


function LoginCtrl($scope, flash, AccountService, LoginService, ServerErrorResponse, Base64, $rootScope) {
    $scope.currentAccount = angular.copy(AccountService.getAccount());
    $scope.loggedIn = false;
    $scope.signUp = {username:null, email:null};
    $scope.restorePassword = {username:null};

    if($scope.currentAccount.user && $rootScope.isSystemSetUp){
    	LoginService.login($scope.currentAccount.user, $scope.currentAccount.pass)
        .then(function(data) {
            $scope.currentAccount = angular.copy(AccountService.getAccount());
            $scope.close('#modalLogin');
            $scope.login.username = null;
            $scope.login.password = null;
             $scope.loggedIn = true;
        }, function(response) {
            flash.error = ServerErrorResponse.getMessage(response.status);
            $scope.login.username = null;
            $scope.login.password = null;
        });
    }

    $scope.login = {
        username : null,
        password : null //$scope.currentAccount.user, $scope.currentAccount.pass
    }; 

    $scope.isUserAuthenticated = function () {
        return $scope.loggedIn;
    };

    $scope.isAdminLogged = function () {
        return AccountService.isAdmin();
    };

    $scope.login = function() {
        LoginService.login(Base64.encode($scope.login.username), Base64.encode($scope.login.password))
            .then(function(data) {
                $scope.currentAccount = angular.copy(AccountService.getAccount());
                $scope.close('#modalLogin');
                $scope.login.username = null;
                $scope.login.password = null;
                 if($scope.currentAccount.user != null){
                 	$scope.loggedIn = true;
                 }
            }, function(response) {
                flash.error = ServerErrorResponse.getMessage(response.status);
                $scope.login.username = null;
                $scope.login.password = null;
                $scope.loggedIn = false;
            });
    };
    
    $scope.close = function(modalID) {
    	$(modalID).modal('hide');
        $('body').removeClass('modal-open');
      	$('.modal-backdrop').slideUp();
      	$('.modal-scrollable').slideUp();
    };

    $scope.logout = function() {
        LoginService.logout()
            .then(function(data) {
                $scope.currentAccount = angular.copy(AccountService.getAccount());
                 $scope.loggedIn = false;
            });
    };

    $scope.createAccount = function() {
        LoginService.createAccount($scope.signUp.username, $scope.signUp.email)
            .then(function(response) {
            	$scope.close('#modalSignUp');
                flash.success = response.data.message;
            }, function(response) {
            	$scope.close('#modalSignUp');
                flash.error = ServerErrorResponse.getMessage(response.status);
            });
    };

    $scope.restorePassword = function() {
        LoginService.restorePassword($scope.restorePassword.username)
            .then(function(response) {
            	$scope.close('#modalRestorePassword');
                flash.success = response.data.message;
            }, function(response) {
            	$scope.close('#modalRestorePassword');
                flash.error = ServerErrorResponse.getMessage(response.status);
            });
    };

    $scope.clearLoginForm = function() {
        $scope.loginForm.$setPristine();
        $scope.login.username = null;
        $scope.login.password = null;
    };

    $scope.clearSignUpForm = function() {
        $scope.signUpForm.$setPristine();
        $scope.signUp.username = null;
        $scope.signUp.email = null;
    };

    $scope.clearRestorePasswordForm = function() {
        $scope.restorePasswordForm.$setPristine();
        $scope.restorePassword.username = null;
    };
}