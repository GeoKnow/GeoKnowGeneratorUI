'use strict';

var module = angular.module('app.login-service', []);

module.factory("LoginService", function ($http, $cookieStore, AccountService, ConfigurationService, Base64, flash, ServerErrorResponse) {

    var login = function (username, password) {

        var username = Base64.decode(username);
        var password = Base64.decode(password);

        var postData = {
            username: username,
            password: password,
            mode: "login"
        };
        return $http({
            url: "AuthenticationServlet",
            method: "POST",
            data: $.param(postData),
            contentType: "application/x-www-form-urlencoded"
        }).then(function (response) {
            
            // var role = {
            //     // uri: response.data.role.uri.replace(ConfigurationService.getFrameworkOntologyNS(), "gkg:"),
            //     uri: response.data.role.uri,
            //     name: response.data.role.name,
            //     services: response.data.role.services
            // };

            return AccountService.create(
                response.data.username, 
                response.data.accountURI,
                response.data.email, 
                response.data.role,
                response.data.settingsGraph);

        }, function (response) {
            flash.error = ServerErrorResponse.getMessage(response);
        });
    };

    var logout = function () {
        var postData = {
            username: AccountService.getAccount().getUsername(),
            mode: "logout"
        }
        return $http({
            url: "AuthenticationServlet",
            method: "POST",
            data: $.param(postData),
            contentType: "application/x-www-form-urlencoded"
        }).then(function (response) {
            document.execCommand("ClearAuthenticationCache");
            ConfigurationService.restoreDefaultSettingsGraph();
            return AccountService.clearAccount();
        }, function (response) {
            console.log(response);
            flash.error = ServerErrorResponse.getMessage(response);
            
        });
    };

    var createAccount = function (username, email) {
        var postData = {
            username: username,
            email: email,
            mode: "create"
        };
        return $http({
            url: "AuthenticationServlet",
            method: "POST",
            data: $.param(postData),
            contentType: "application/x-www-form-urlencoded"
        });
    };

    var changePassword = function (oldPassword, newPassword) {
        var postData = {
            username: AccountService.getAccount().getUsername(),
            oldPassword: oldPassword,
            newPassword: newPassword,
            mode: "changePassword"
        };
        return $http({
            url: "AuthenticationServlet",
            method: "POST",
            data: $.param(postData),
            contentType: "application/x-www-form-urlencoded"
        });
    };

    var restorePassword = function (username) {
        var postData = {
            username: username,
            mode: "restorePassword"
        };
        return $http({
            url: "AuthenticationServlet",
            method: "POST",
            data: $.param(postData),
            contentType: "application/x-www-form-urlencoded"
        });
    };

    return {
        login: login,
        logout: logout,
        createAccount: createAccount,
        changePassword: changePassword,
        restorePassword: restorePassword
    };
});