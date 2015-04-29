'use strict';

function ModalChangePwCtrl($scope, $http, $modalInstance, AccountService) {
	
	$scope.modaltitle = "Change password";
	$scope.password = {
			oldPassword: null, 
			newPassword:null, 
			confirmPassword:null
			};
	  
	
	  $scope.ok = function () {
			if($scope.password.newPassword.indexOf(AccountService.getAccount().getUsername()) != -1){
				$scope.modaltitle = "Change password | Username in password not allowed!";
			}else{
		var input = angular.copy($scope.password);
	    $modalInstance.close(input);
			}
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	}