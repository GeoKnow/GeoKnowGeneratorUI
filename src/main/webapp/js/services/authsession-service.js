'use strict';

var module = angular.module('app.authsession-service', []);

module.factory("AuthSessionService", function ($http) {

    var createSession = function() {
        return $http({
            url: "rest/session",
            method: "PUT"
        });
    };
});