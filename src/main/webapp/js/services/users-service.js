'use strict';

var module = angular.module('app.users-service', []);

module.factory("UsersService", function($http, Config, AccountService) {
    var users = [];
    var roles = {};

    var readUsers = function() {
        var requestData = {
            mode: "getProfiles",
            curuser: AccountService.getUsername()
        };
        return $http.post("UserManagerServlet", $.param(requestData)).then(function(response) {
            users = response.data;
            var ns = Config.getFrameworkOntologyNS();
            for (var ind in users) {
                users[ind].profile.role = users[ind].profile.role.replace(ns, "gkg:");
            }
            return users;
        });
    };

    var getAllUsers = function() {
        return angular.copy(users);
    };

    var reloadUsers = function() {
        return readUsers().then(function(data) {
            return getAllUsers();
        });
    };

    var setUserRole = function(accountURI, role) {
        var requestData = {
            format: "application/sparql-results+json",
            query: "prefix gkg: <" + Config.getFrameworkOntologyNS() + "> "
                    + " prefix : <" + Config.getNS() + "> "
                    + " WITH <" + Config.getAccountsGraph() + "> "
                    + " DELETE {" + accountURI + " gkg:role ?r .} "
                    + " INSERT {" + accountURI + " gkg:role " + role + " .} "
                    + " WHERE {" + accountURI + " gkg:role ?r . } ",
            mode: "settings"
        };
        return $http.post("RdfStoreProxy", $.param(requestData));
    };

    var readRoles = function() {
        var requestData = {
            format: "application/sparql-results+json",
            query: "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
                    + " prefix gkg: <" + Config.getFrameworkOntologyNS() + "> "
                    + " SELECT ?s ?p ?o FROM <" + Config.getAccountsGraph() + "> "
                    + " WHERE {?s ?p ?o . ?s rdf:type gkg:Role . } "
                    + " ORDER BY ?s ?p ?o",
            mode: "settings"
        };
        return $http.post("RdfStoreProxy", $.param(requestData)).then(function(response) {
            roles = Config.parseSparqlResults(response.data);
            return roles;
        });
    };

    var getAllRoles = function() {
        var results = [];
        for (var resource in roles) {
            var r = roles[resource];
            var res = {
                uri: resource,
                name: r["foaf:name"][0],
                services: r["gkg:isAllowedToUseService"] ? r["gkg:isAllowedToUseService"] : []
            };
            results.push(res);
        }
        return results;
    };

    var reloadRoles = function() {
        return readRoles().then(function(data) {
            return getAllRoles();
        });
    };

    var createRole = function(id, name) {
        var roleURI = "gkg:" + id;
        var requestData = {
            format: "application/sparql-results+json",
            query: "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
                    + " prefix foaf: <http://xmlns.com/foaf/0.1/> "
                    + " prefix gkg: <" + Config.getFrameworkOntologyNS() + "> "
                    + " INSERT DATA { GRAPH <" + Config.getAccountsGraph() + "> {"
                    + roleURI + " rdf:type gkg:Role; foaf:name \"" + name + "\". "
                    + "}}",
            mode: "settings"
        };
        return $http.post("RdfStoreProxy", $.param(requestData));
    };

    var updateRoleServices = function(roleURI, services) {
        var serviceTriples = "";
        for (var ind in services) {
            serviceTriples += (roleURI + " gkg:isAllowedToUseService " + services[ind] + ". ");
        }
        var requestData = {
            format: "application/sparql-results+json",
            query: "prefix gkg: <" + Config.getFrameworkOntologyNS() + "> "
                    + " prefix : <" + Config.getNS() + "> "
                    + " WITH <" + Config.getAccountsGraph() + "> "
                    + " DELETE {" + roleURI + " gkg:isAllowedToUseService ?service .} "
                    + " INSERT {" + serviceTriples + "} "
                    + " WHERE { optional {" + roleURI + " gkg:isAllowedToUseService ?service . } }",
            mode: "settings"
        };
        return $http.post("RdfStoreProxy", $.param(requestData));
    };

    return {
        readUsers           : readUsers,
        getAllUsers         : getAllUsers,
        reloadUsers         : reloadUsers,
        setUserRole         : setUserRole,
        readRoles           : readRoles,
        getAllRoles         : getAllRoles,
        reloadRoles         : reloadRoles,
        createRole          : createRole,
        updateRoleServices  : updateRoleServices
    };
});