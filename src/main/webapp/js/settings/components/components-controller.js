'use strict';

function ComponentCtrl($scope, $modal, flash, ComponentsService, ConfigurationService, ServerErrorResponse){

	$scope.integratedComponents = [];
	$scope.requiredComponents = [];
	var init = function(){
		// get all exisiting services
		ComponentsService.getAllComponents().then(
			//success
			function(components){
				$scope.components = components;
				ConfigurationService.getIntegratedComponents().then(
					function(resp){
						console.log(resp);
						$scope.integratedComponents = resp.integrated;
						$scope.requiredComponents = resp.required;
						
					},
					function(response){
						flash.error = ServerErrorResponse.getMessage(response);
					});
			},
			// fail 
			function(response){
				flash.error = ServerErrorResponse.getMessage(response);
			});
	};

	init();

	$scope.isNotRequired=function(uri){
		return ($scope.requiredComponents.indexOf(uri) == -1);
	}

	$scope.isIntegrated=function(uri){
		for(var i in $scope.integratedComponents)
			if($scope.integratedComponents[i].uri==uri)
				return true;
		return false;
	}

	$scope.toggleComponent=function(uri){
		var promise;
		if($scope.isIntegrated(uri))
			promise = ConfigurationService.removeComponent(uri);
		else
			promise = ConfigurationService.integrateComponent(uri);

		promise.then(
			function(response){
				init();
			}, 
			function(response){
				flash.error = ServerErrorResponse.getMessage(response);
				return false;
			});
	}

	$scope.changeServiceUrl= function(service){
		 var modalInstance = $modal.open({
      templateUrl: 'modal-forms/settings/components/modal-component-service.html',
      controller: 'ModalComponentServiceCtrl',
      backdrop: 'static',
      size: 'lg',
      resolve: {
        resource: function() {
          return service;
        },
        modaltitle: function(){
          return "Update";
        }
      }
    });
    modalInstance.result.then(function(vService) {
      ComponentsService.updateService(vService).then(
	      	function(response){
					init();
				}, 
				function(response){
					flash.error = ServerErrorResponse.getMessage(response);
					return false;
				});
    });
	}

	
}
