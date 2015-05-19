'use strict';

function ModalLicenseCtrl($scope, $http, $modalInstance, currentLicense, ConfigurationService) {
	
	$scope.modaltitle = "_new-license-source-title_";
	$scope.license = { 
			uri: "", 
			label:"", 
			url:""};
	
	$scope.isNew=true;

	if(currentLicense!=null){
		$scope.modaltitle = "_edit-license-source-title_";
		
		$scope.license = angular.copy(currentLicense);
		$scope.license.uri = $scope.license.uri.replace(':','');
		$scope.isNew=false;
		
	}
	  $scope.ok = function () {
		  $scope.license.uri = ":"+$scope.license.uri;
		  var input = angular.copy($scope.license);
		 
	    $modalInstance.close(input);
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	}