'use strict';

function ComponentCtrl($scope, ComponentsService){

	ComponentsService.getAllComponents().then(
		//success
		function(response){
			$scope.components = response;
		},
		// fail 
		function(response){

		});
}
