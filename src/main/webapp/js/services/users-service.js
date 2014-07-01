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
                users[ind].profile.accountURI = users[ind].profile.accountURI.replace(Config.getNS(), ":");
                users[ind].profile.role.uri = users[ind].profile.role.uri.replace(ns, "gkg:");
                for (var sind in users[ind].profile.role.services) {
                    users[ind].profile.role.services[sind] = users[ind].profile.role.services[sind].replace(Config.getNS(), ":");
                }
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
            var res = getRole(resource);
            results.push(res);
        }
        return results;
    };

    var getRole = function(uri) {
        var r = roles[uri];
        var result = {
            uri: uri,
            name: r["foaf:name"][0],
            services: r["gkg:isAllowedToUseService"] ? r["gkg:isAllowedToUseService"] : [],
            isDefault: r["gkg:isDefault"] ? (r["gkg:isDefault"][0]=="true" || r["gkg:isDefault"][0]=="1" ? true : false) : false,
            isNotLoggedIn: r["gkg:isNotLoggedIn"] ? (r["gkg:isNotLoggedIn"][0]=="true" || r["gkg:isNotLoggedIn"][0]=="1" ? true : false) : false
        };
        return result;
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

    var setDefaultRole = function(roleURI) {
        var requestData = {
            format: "application/sparql-results+json",
            query: "prefix gkg: <" + Config.getFrameworkOntologyNS() + "> "
                    + "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
                    + " WITH <" + Config.getAccountsGraph() + "> "
                    + " DELETE { ?role gkg:isDefault ?o .} "
                    + " INSERT {" + roleURI + " gkg:isDefault true .} "
                    + " WHERE { optional {?role gkg:isDefault ?o .} } ",
            mode: "settings"
        };
        return $http.post("RdfStoreProxy", $.param(requestData));
    };

    var setNotLoggedInRole = function(roleURI) {
        var requestData = {
            format: "application/sparql-results+json",
            query: "prefix gkg: <" + Config.getFrameworkOntologyNS() + "> "
                    + "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
                    + " WITH <" + Config.getAccountsGraph() + "> "
                    + " DELETE { ?role gkg:isNotLoggedIn ?o .} "
                    + " INSERT {" + roleURI + " gkg:isNotLoggedIn true .} "
                    + " WHERE { optional {?role gkg:isNotLoggedIn ?o .} } ",
            mode: "settings"
        };
        return $http.post("RdfStoreProxy", $.param(requestData));
    };

    var readNotLoggedInRole = function() {
        return readRoles().then(function(response) {
            var allRoles = getAllRoles();
            for (var ind in allRoles) {
                if (allRoles[ind].isNotLoggedIn) return allRoles[ind];
            }
            return getRole("gkg:BasicUser");
        });
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

    var createUser = function(user) {
        user.profile.role = user.profile.role.replace("gkg:", Config.getFrameworkOntologyNS());
	    var parameters = {
	        mode: "create",
	        user: JSON.stringify(user),
	        curuser: AccountService.getUsername()
        };
        return $http({
            url: "UserManagerServlet",
            method: "POST",
            dataType: "json",
            params: parameters,
            contentType: "application/json; charset=utf-8"
            });
    };

    return {
        readUsers           : readUsers,
        getAllUsers         : getAllUsers,
        reloadUsers         : reloadUsers,
        setUserRole         : setUserRole,
        readRoles           : readRoles,
        getAllRoles         : getAllRoles,
        getRole             : getRole,
        reloadRoles         : reloadRoles,
        createRole          : createRole,
        setDefaultRole      : setDefaultRole,
        setNotLoggedInRole  : setNotLoggedInRole,
        readNotLoggedInRole : readNotLoggedInRole,
        updateRoleServices  : updateRoleServices,
        createUser          : createUser
    };
});