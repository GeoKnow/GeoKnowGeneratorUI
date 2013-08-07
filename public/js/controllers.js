'use strict';

function LoginCtrl() {}
LoginCtrl.$inject = [];

function SettingsCtrl() {

	SettingsService.async().then(function(d) {
    	$scope.data = d;
  	});
}

SettingsCtrl.$inject = [];


// app.controller('MainCtrl', function( myService,$scope) {
//   // Call the async method and then do stuff with what is returned inside our own then function
//   myService.async().then(function(d) {
//     $scope.data = d;
//   });
// });
