'use strict';

function LoginCtrl($scope, $modal, $location, flash, AccountService, LoginService, ServerErrorResponse, Base64, RolesService, ConfigurationService, AuthenticationErrorResponse) {

  initialize();

  function initialize() {

    $scope.login = {
      username: null,
      password: null
    };
    $scope.signUp = {
      username: null,
      email: null
    };
    $scope.restorePassword = {
      username: null
    };
    $scope.isRegistering = false;

    // get the application settings and initalize scope variables
    ConfigurationService.getSettings().then(
      //success
      function(settings) {

        $scope.currentAccount = AccountService.getAccount();
        // retrive default role if no user logged in
        if ($scope.currentAccount.getRole() == undefined) {
          RolesService.getNotLoggedInRole().then(function(response) {
              $scope.currentAccount.setRole(response);
              console.log($scope.currentAccount);
            });
        }
        
        $scope.isUserAuthenticated = function() {
          return AccountService.getAccount().getUsername() != undefined;
        };

        $scope.isAdminLogged = function() {
          return AccountService.getAccount().isAdmin();
        };

      },
      //error
      function(response) {
        flash.error = ServerErrorResponse.getMessage(response);
      });
  }


  $scope.signUp = function(){
    var modalInstance = $modal.open({
      templateUrl: 'modal-forms/modal-signup.html',
      controller: 'ModalSignupCtrl',
      size: 'sm',
      backdrop: 'static'
    });
    modalInstance.result.then(function(response) {
      console.log(response)
    });
  };

  $scope.login = function() {
    var modalInstance = $modal.open({
      templateUrl: 'modal-forms/modal-login.html',
      controller: 'ModalLoginCtrl',
      size: 'sm',
      backdrop: 'static'
    });
    modalInstance.result.then(function(login) {
      LoginService.login(Base64.encode(login.username), Base64.encode(login.password))
        .then(function(data) {
          console.log(data);
          $scope.currentAccount = data;
        }, function(response) {
          flash.error = ServerErrorResponse.getMessage(response);
        });
    });
  };

  $scope.logout = function() {
    LoginService.logout()
      .then(function(data) {
        $scope.currentAccount = data;
        $location.path("/");
        // initialize();
      });
  };


}