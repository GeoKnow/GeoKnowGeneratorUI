'use strict';
app.controller("LoginCtrl",LoginCtrl);
function LoginCtrl($scope, $modal, $location, flash, authService, cfpLoadingBar, AccountService, LoginService, ServerErrorResponse, Base64, UsersService, ConfigurationService, AuthenticationErrorResponse, RolesService) {   


  $scope.ngJoyride = true;
  // handle unauthorized requests with login-modal
  var loginWindowShown=false;
  $scope.$on('event:auth-loginRequired', function(event, response) {
    flash.error = 'Session Expired';
    
    if(!loginWindowShown){
      loginWindowShown = true;
      $scope.login();
    }
    });
  
  $scope.$on('event:auth-loginCancelled', function(event, response) {
  
    document.execCommand("ClearAuthenticationCache");
    ConfigurationService.restoreDefaultSettingsGraph();
    
    $location.path("/#/home");
    loginWindowShown = false;
    cfpLoadingBar.complete();
    return AccountService.clearAccount(); 
  
    });
 
  $scope.$on('event:auth-loginConfirmed', function(event, response) {
    
    
    loginWindowShown = false;
    });
  
  
  $scope.getUsername = function(){
    return AccountService.getAccount().getUsername();
  }
  
  
  function initialize(){
              
    $scope.signUp = {username:null, email:null};
    $scope.restorePassword = {username:null};
    $scope.isRegistering = false;

    // get the application settings and initalize scope variables
    ConfigurationService.getSettings().then(function(settings){
      
      $scope.currentAccount = AccountService.getAccount();

      console.log($scope.currentAccount);
      
      
      // retrive default role if no user logged in
      if(AccountService.getAccount().getRole() == undefined){
        RolesService.getNotLoggedInRole().then(function(response) {
          $scope.currentAccount.setRole(response);
        });
      }
    
    });
  }
  
  $scope.isUserAuthenticated = function () {
    return AccountService.getAccount().getUsername() != undefined;
  };

  $scope.isAdminLogged = function () {
    return AccountService.getAccount().isAdmin();
  };

  $scope.login = function() {
        
    var modalInstance = $modal.open({
      templateUrl: 'modal-forms/modal-login.html',
      controller: 'ModalLoginCtrl',
      size: 'sm',
      backdrop: 'static',
      windowClass: 'onTop'
      
    });
        
    modalInstance.result.then(function (login) {
      
      if(login.password==null){ //restore password
        
        LoginService.restorePassword(login.username)
              .then(function(response) {
                  flash.success = response.data.message;
              }, function(response) {
                  if (response.status==500 && response.data) {
                      flash.error = AuthenticationErrorResponse.getMessage(parseInt(response.data.code));
                  } else {
                      flash.error = ServerErrorResponse.getMessage(response);
                  }
              });
        
      }else{ //password given, try to log in
        LoginService.login(Base64.encode(login.username), Base64.encode(login.password)).then(
          //success
          function(data) {
            $scope.currentAccount = data;
            console.log(data);
            if($scope.currentAccount.getUsername() != undefined){
              initialize();
              //flash.success = "Login Successful";

            }else{
              flash.error = "User or password are not correct"; 
            }
            
            authService.loginConfirmed();
          }, 
          // error
          function(response) {                
            authService.loginCancelled();    
          });
        }       
    }, function(reject){
      authService.loginCancelled();    
    });

  };

   
    $scope.logout = function() {
      LoginService.logout()
            .then(function(data) {
              $scope.currentAccount = data;
              initialize();
            });
    };


  $scope.startDemo = function(){

    LoginService.startDemo().then(function(response){
      var login = response.data;
      LoginService.login(Base64.encode(login.username), Base64.encode(login.password)).then(
          //success
          function(data) {
            $scope.currentAccount = data;
            console.log(data);
            if($scope.currentAccount.getUsername() != undefined){
              initialize();
              //flash.success = "Login Successful";

            }else{
              flash.error = "User or password are not correct";
            }

            authService.loginConfirmed();
          },
          // error
          function(response) {
            authService.loginCancelled();
          });
    });

  };


   

  $scope.register = function(){
    
    var signUpModal = $modal.open({
      templateUrl: 'modal-forms/modal-signup.html',
      controller: 'ModalSignupCtrl',
      size: 'sm',
      backdrop: 'static',
      windowClass: 'onTop'
    });

    signUpModal.result.then(function(signup) {
      console.log(signup);
      
      LoginService.createAccount(signup.username, signup.email).then(
        //success
        function(response) {
          console.log(response);
          flash.success = response.data.message;
      
        }, 
        //error
        function(response) {
          flash.error = ServerErrorResponse.getMessage(response);
      
        });
    });
  };


    initialize();
}