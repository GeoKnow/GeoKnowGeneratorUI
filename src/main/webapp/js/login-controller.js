'use strict';

/**
* LoginCtrl is at the top of all controles, thus its scope is shared among all of them
* and  are ment to be used by the childs contollers :
*
* $scope.$parent.currentAccount and $scope.$parent.settings
*/
function LoginCtrl($q, $scope, $location, flash, AccountService, LoginService, ServerErrorResponse, Base64, AuthenticationErrorResponse, ConfigurationService, UsersService) {

    initialize();

    function initialize(){

        $scope.login = {
            username : null,
            password : null 
        }; 
        $scope.signUp = {username:null, email:null};
        $scope.restorePassword = {username:null};
        $scope.isRegistering = false;

        // get the application settings and initalize scope variables
        ConfigurationService.getSettings().then(
            //success
            function(settings){
                $scope.currentAccount = AccountService.getAccount();
                // retrive default role if no user logged in
                if($scope.currentAccount.getRole() == undefined){
                    console.log("assign readNotLoggedInRole");
                    UsersService.readNotLoggedInRole().then(function(response) {
                        $scope.currentAccount.setRole(response);
                    });
                }
                
                $scope.isUserAuthenticated = function () {
                    return AccountService.getAccount().getUsername() != undefined;
                };

                $scope.isAdminLogged = function () {
                    return AccountService.getAccount().isAdmin();
                };
            // error 
            },function(response){
                flash.error = ServerErrorResponse.getMessage(response);
            });
    }

    $scope.login = function() {
        
        LoginService.login(Base64.encode($scope.login.username), Base64.encode($scope.login.password))
            .then(function(data) {
                console.log(data);
                $scope.currentAccount = data;
                // $scope.account = $scope.currentAccount.getData();
                $scope.close('#modalLogin');
                $scope.login.username = null;
                $scope.login.password = null;
                $location.path("/workbench");
                
            }, function(response) {
                flash.error = ServerErrorResponse.getMessage(response);
                $scope.login.username = null;
                $scope.login.password = null;
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
                console.log(data);
                $scope.currentAccount = data;
                $location.path("/");
            });
    };

    $scope.createAccount = function() {
        $scope.isRegistering = true;
        LoginService.createAccount($scope.signUp.username, $scope.signUp.email)
            .then(function(response) {
            	$scope.close('#modalSignUp');
                flash.success = response.data.message;
                $scope.isRegistering = false;
            }, function(response) {
            	$scope.close('#modalSignUp');
            	if (response.status==500 && response.data) {
                    flash.error = AuthenticationErrorResponse.getMessage(parseInt(response.data.code));
                } else {
                    flash.error = ServerErrorResponse.getMessage(response);
                }
                $scope.isRegistering = false;
            });
    };

    $scope.restorePassword = function() {
        LoginService.restorePassword($scope.restorePassword.username)
            .then(function(response) {
            	$scope.close('#modalRestorePassword');
                flash.success = response.data.message;
            }, function(response) {
            	$scope.close('#modalRestorePassword');
                if (response.status==500 && response.data) {
                    flash.error = AuthenticationErrorResponse.getMessage(parseInt(response.data.code));
                } else {
                    flash.error = ServerErrorResponse.getMessage(response);
                }
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
        $scope.isRegistering = false;
    };

    $scope.clearRestorePasswordForm = function() {
        $scope.restorePasswordForm.$setPristine();
        $scope.restorePassword.username = null;
    };
}