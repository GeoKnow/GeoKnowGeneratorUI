'use strict';

function ModalSignupCtrl($scope, $http, $modalInstance, LoginService, flash) {
	
	$scope.signUp = {
      username : null,
      email : null 
  }; 
	  	
  $scope.register = function () {
	  $scope.isRegistering = true;
    LoginService.createAccount($scope.signUp.username, $scope.signUp.email)
      .then(function(response) {
        var input = angular.copy($scope.signup);
        $scope.isRegistering = false;
    		$modalInstance.close(input);
        flash.success = response.data.message;
      }, function(response) {
        flash.error = ServerErrorResponse.getMessage(response);
        $scope.isRegistering = false;
        $modalInstance.dismiss('cancel');
      });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}