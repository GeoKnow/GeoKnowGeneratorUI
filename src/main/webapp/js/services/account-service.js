'use strict';

var module = angular.module('app.account-service', []);

module.factory("AccountService", function ( $cookieStore, $http, ConfigurationService) {

    var currentAccount;
    /**
    * Constructor, with class name
    */
    function Account(username, accountURI, email, role, settingsGraph) {
        this.username = username;
        this.accountURI = accountURI;
        this.role = role;
        this.email = email;
        this.settingsGraph = settingsGraph;
        // update with prefixes
        if (this.accountURI != undefined) 
            this.accountURI = accountURI.replace(ConfigurationService.getUriBase(), ':');
        // update preview result or original ones
        if (this.role != undefined) {
            this.role.uri = this.role.uri.replace(ConfigurationService.getFrameworkOntologyNS(), "gkg:");
            var roleServices = [];
            for (var ind in this.role.services) 
                roleServices.push(this.role.services[ind].replace(ConfigurationService.getUriBase(), ":"));
            this.role.services = roleServices;
        }
    };

    /**
    * Public method, assigned to prototype
    */
    Account.prototype.getUsername = function () {
        return this.username;
    };

    Account.prototype.getAccountURI = function () {
        return this.accountURI;
    };

    Account.prototype.getEmail = function () {
        return this.email;
    };

    Account.prototype.getSettingsGraph = function() {
        return this.settingsGraph;
    };

    Account.prototype.getRole = function() {
        return this.role;
    };

    Account.prototype.setRole = function(role) {
        this.role = role;
        
        this.role.uri = this.role.uri.replace(ConfigurationService.getFrameworkOntologyNS(), "gkg:");
        var roleServices = [];
        for (var ind in this.role.services) 
            roleServices.push(this.role.services[ind].replace(ConfigurationService.getUriBase(), ":"));
        this.role.services = roleServices;

        
    };

    Account.prototype.isAdmin = function () {
        return this.role != undefined && this.role.uri == "gkg:Administrator";
    };

    Account.prototype.isAuthenticatedUser = function () {
        return this.username != undefined;
    };

    /**
    * Static methods
    * Instance ('this') is not available in static context
    w*/
    Account.create = function(username, accountURI, email, role, settingsGraph) {
    	
        return new Account(username, accountURI, email, role, settingsGraph);
    };

    Account.clearAccount = function () {
        $cookieStore.remove('user');
        $cookieStore.remove('token');
        return new Account(undefined, undefined, undefined, undefined, undefined);
    };

    Account.getAccount = function () {
        if($cookieStore.get('user') != undefined){
            var s = $cookieStore.get('user');
            // 
            return new Account(s.username, s.accountURI, s.email, s.role, s.settingsGraph); 
        }
        else
            return Account.clearAccount();
    };

    return (Account);
});