'use strict';

var module = angular.module('app.account-service', []);

module.factory("AccountService", function ($cookieStore) {
    var username = null;
    var accountURI = null;
    var email = null;
    var role = null;

    var getUsername = function () {
        return username;
    };

    var setUsername = function (name) {
        username = name;
    };

    var getAccountURI = function () {
        return accountURI;
    };

    var setAccountURI = function (uri) {
        accountURI = uri;
    };

    var getEmail = function () {
        return email;
    };

    var setEmail = function (mail) {
        email = mail;
    };

    var getRole = function() {
        return role;
    };

    var setRole = function(r) {
        role = r;
    };

    var clear = function () {
        setUsername(null);
        setAccountURI(null);
        setEmail(null);
        setRole(null);
    };

    var isLogged = function () {
        return username != null;
    };

    var getAccount = function () {
        var user = $cookieStore.get('User');
        var pass = $cookieStore.get('Pass');
        return {
            username: username,
            email: email,
            user: user,
            pass: pass,
            role: role
        };
    };

    var isAdmin = function () {
        return role && role.uri == "gkg:Administrator";
    };

    return {
        getUsername: getUsername,
        setUsername: setUsername,
        getAccountURI: getAccountURI,
        setAccountURI: setAccountURI,
        getEmail: getEmail,
        setEmail: setEmail,
        clear: clear,
        isLogged: isLogged,
        getAccount: getAccount,
        isAdmin: isAdmin,
        getRole: getRole,
        setRole: setRole
    };
});