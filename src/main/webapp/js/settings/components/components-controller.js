'use strict';

function ComponentCtrl($scope, ComponentsService, ConfigurationService, ServerErrorResponse){

	var workbenchMeta;
	ConfigurationService.getSettings().then(function(response){
		workbenchMeta = ConfigurationService.getMeta();	
		console.log(workbenchMeta);
	})
	
	var init = function(){
		// get all exisiting services
		ComponentsService.getAllComponents().then(
			//success
			function(components){

				console.log(components);
				$scope.components = components;

				ConfigurationService.getIntegratedComponents().then(
					function(iservs){
						$scope.integratedServices = iservs;
						console.log(iservs);

						// get the workbench services
						ConfigurationService.getWorkbenchServices().then(
							//success
							function(services){
								console.log(services);
								workbenchMeta["services"] = services;
								$scope.components.push(workbenchMeta);
							},
							//error
							function(response){
								flash.error = ServerErrorResponse.getMessage(response);
							});
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

	$scope.isConfigurable=function(uri){
		for(workbenchMeta)
	}

	$scope.isIntegrated=function(uri){
		return ($scope.integratedServices.indexOf(uri))>=0);
	}

	$scope.toggleService=function(uri){
		if($scope.isIntegrated(uri))
		ConfigurationService.integrateComponent
	}

	init();
}
