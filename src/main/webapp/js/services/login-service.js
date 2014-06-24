'use strict';

var module = angular.module('app.login-service', []);

module.factory("LoginService", function ($http, $location, $cookieStore, AccountService, ConfigurationService, Base64, flash, ServerErrorResponse) {

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
            AccountService.setUsername(response.data.username);
            AccountService.setAccountURI(response.data.accountURI.replace(ConfigurationService.getUriBase(), ':'));
            AccountService.setEmail(response.data.email);
            AccountService.setRole(response.data.role);
            ConfigurationService.setSettingsGraph(response.data.settingsGraph);

            var encodedUser = Base64.encode(username);
            var encodedPass = Base64.encode(password);
            $http.defaults.headers.common.Authorization = 'User ' + encodedUser + ' Pass ' + encodedPass;
            $cookieStore.put('User', encodedUser);
            $cookieStore.put('Pass', encodedPass);
            //console.log($http.defaults.headers.common);

        }, function (response) {
            flash.error = ServerErrorResponse.getMessage(response.status);
        });
    };

    var logout = function () {
        var postData = {
            username: AccountService.getUsername(),
            mode: "logout"
        }
        return $http({
            url: "AuthenticationServlet",
            method: "POST",
            data: $.param(postData),
            contentType: "application/x-www-form-urlencoded"
        }).then(function (response) {
            AccountService.clear();
            ConfigurationService.restoreDefaultSettingsGraph();
            $location.path("/home");

            document.execCommand("ClearAuthenticationCache");
            $cookieStore.remove('User');
            $cookieStore.remove('Pass');
            $http.defaults.headers.common.Authorization = 'User Pass';

            console.log($http.defaults.headers.common);

        }, function (response) {
            console.log("error? esponse:")
            console.log(response);
            // flash.error = message;
            
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
            username: AccountService.getUsername(),
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
        var encodedUser = Base64.encode(AccountService.getUsername());
        var encodedPass = Base64.encode(newPassword);
        $http.defaults.headers.common.Authorization = 'User ' + encodedUser + ' Pass ' + encodedPass;
        $cookieStore.put('User', encodedUser);
        $cookieStore.put('Pass', encodedPass);
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