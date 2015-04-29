'use strict';

function ModalLoginCtrl($scope, $http, $modalInstance) {
	
	$scope.login = {
      username : null,
      password : null 
  }; 
	  	
  $scope.ok = function () {
	  var input = angular.copy($scope.login);
    $modalInstance.close(input);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}