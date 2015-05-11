'use strict';

function ModalRolesCtrl($scope, $http, $modalInstance, ConfigurationService) {
	
	$scope.modaltitle = "New Role";
	$scope.newRole = {
			uri:"", 
			name:""
			};
	
	
	  $scope.ok = function () {
		  
		  var input = angular.copy($scope.newRole);
		 
	    $modalInstance.close(input);
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	}