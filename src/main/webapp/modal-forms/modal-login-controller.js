'use strict';

function ModalLoginCtrl($scope, $http, $modalInstance) {
	
  $scope.modaltitle = "Login"
  $scope.forgot = false;
  $scope.login = {
            username : null,
            password : null 
        }; 
      
    
  $scope.forgotPw = function(){
    $scope.forgot = true;
    $scope.modaltitle = "Recover password";
    $scope.login = {
            username : null,
            password : null 
        }; 
  }
    
  $scope.ok = function () {
    if($scope.forgot) $scope.login.password = null;
    var input = angular.copy($scope.login);      
    $modalInstance.close(input);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}