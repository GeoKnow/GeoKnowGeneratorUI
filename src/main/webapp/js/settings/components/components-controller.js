'use strict';

function ComponentCtrl($scope, ComponentsService){

	ComponentsService.getAllComponents().then(
		//success
		function(response){
			console.log(response);
			$scope.components = response;
		},
		// fail 
		function(response){

		});
}
