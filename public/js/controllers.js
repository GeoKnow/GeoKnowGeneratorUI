'use strict';

function LoginCtrl() {}
LoginCtrl.$inject = [];

function SettingsCtrl(scope, service) {
	scope.settings = "";
	service.getSettings().then(
		function(promise) {
    		scope.settings = angular.fromJson(promise);
  		}, 
  		function(reason) {console.log("Error SettingsCtrl"); throw reason });
}

SettingsCtrl.$inject = ['$scope', 'SettingsService'];


// app.controller('MainCtrl', function( myService,$scope) {
//   // Call the async method and then do stuff with what is returned inside our own then function
//   myService.async().then(function(d) {
//     $scope.data = d;
//   });
// });
