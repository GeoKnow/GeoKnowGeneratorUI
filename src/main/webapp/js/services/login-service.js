'use strict';

var module = angular.module('app.login-service', []);

module.factory("LoginService", function ($http, $location, $cookies, AccountService, ConfigurationService, Base64, flash, ServerErrorResponse) {

    
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
            
             return AccountService.create(
                     response.data.username, 
                     response.data.accountURI,
                     response.data.email, 
                     response.data.role,
                     response.data.settingsGraph);

        }, 
        function(response){ 
            flash.error = ServerErrorResponse.getMessage(response);
        });
    };

    var logout = function () {
        var postData = {
            username: AccountService.getAccount().getUsername(),
            mode: "logout"
        }
        //stop demo mode - delete and logout
        if(AccountService.getAccount().getEmail().indexOf("@demogenerator.geoknow.eu")>-1){

            postData.mode="demo_end";

        }

            return $http({
                url: "AuthenticationServlet",
                method: "POST",
                data: $.param(postData),
                contentType: "application/x-www-form-urlencoded"
            }).then(function (response) {
                document.execCommand("ClearAuthenticationCache");
                ConfigurationService.restoreDefaultSettingsGraph();

                $location.path("/#/home");
                return AccountService.clearAccount();


            }, function (response) {
                flash.error = ServerErrorResponse.getMessage(response);

            });

    };

    var startDemo = function(){
        var postData = {
            mode: "demo_start"
        };
        return $http({
            url: "AuthenticationServlet",
            method: "POST",
            data: $.param(postData),
            contentType: "application/x-www-form-urlencoded"
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
        startDemo:  startDemo,
        createAccount: createAccount,
        changePassword: changePassword,
        restorePassword: restorePassword
    };
});