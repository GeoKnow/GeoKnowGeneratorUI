'use strict';

function ModalSignupCtrl($scope, $modalInstance) {
	
	$scope.signUp = {
      username : null,
      email : null 
  }; 

  $scope.ok = function () {
    
    var input = angular.copy($scope.signUp);      
    $modalInstance.close(input);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}