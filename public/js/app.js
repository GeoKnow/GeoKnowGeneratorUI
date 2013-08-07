'use strict';

angular.module('app', ['app.services', 'app.directives'])
    .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl:'partials/default.html', 
            controller:LoginCtrl 
        }).when('/login', {
        	templateUrl:'partials/login.html', 
        	controller:LoginCtrl 
        })
        .when('/settings', {
            templateUrl:'partials/settings.html', 
            controller:SettingsCtrl 
        })
        .when('/about', {
            templateUrl:'partials/about.html', 
            controller:LoginCtrl 
        })
        .otherwise({redirectTo:'/home'});
}]);
