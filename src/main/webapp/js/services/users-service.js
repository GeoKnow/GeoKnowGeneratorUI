'use strict';

var module = angular.module('app.users-service', []);

module.factory("UsersService", function($http, Config, flash, ServerErrorResponse, AccountService) {
    var users = [];
    var roles = {};

    var userNames = [];
    var emails = [];

    var readUsers = function() {
      var requestData = {
          mode: "getProfiles",
          curuser: AccountService.getAccount().getUsername()
      };
      return $http.post("UserManagerServlet", $.param(requestData)).then(
        //success
        function(response) {
          users = response.data;
          userNames = [];
          emails = [];
          var ns = Config.getFrameworkOntologyNS();
          for (var ind in users) {
              users[ind].profile.accountURI = users[ind].profile.accountURI.replace(Config.getNS(), ":");
              users[ind].profile.role.uri = users[ind].profile.role.uri.replace(ns, "ontos:");
              for (var sind in users[ind].profile.role.services) {
                  users[ind].profile.role.services[sind] = users[ind].profile.role.services[sind].replace(Config.getNS(), ":");
              }
              userNames.push(users[ind].profile.username);
              emails.push(users[ind].profile.email.replace("mailto:",""));
          }
          return users;
      },            
      // error
      function(response) {
          flash.error = ServerErrorResponse.getMessage(response);
          return;
      });
    };
    var service = {
        readUserNamesEmails : function() {
          var requestData = {
            format: "application/sparql-results+json",
            query: "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
                    + " prefix ontos: <" + Config.getFrameworkOntologyNS() + "> "
                    + " SELECT ?s ?p ?o FROM <" + Config.getAccountsGraph() + "> "
                    + " WHERE {?s ?p ?o . ?s rdf:type ontos:Account . filter(?p=foaf:accountName || ?p=foaf:mbox) } "
                    + " ORDER BY ?s ?p ?o",
            mode: "settings"
          };
          return $http.post("rest/RdfStoreProxy", $.param(requestData)).then(
            function(response) {
              console.log(response.data);
              var parsedResult = Config.parseSparqlResults(response.data);
              console.log(parsedResult);
              userNames = [];
              emails = [];
              for (var ind in parsedResult) {
                  userNames.push(parsedResult[ind]["foaf:accountName"][0]);
                  emails.push(parsedResult[ind]["foaf:mbox"][0].replace("mailto:",""));
              }
              return parsedResult; 
            },
            // error
            function(response) {
                flash.error = ServerErrorResponse.getMessage(response);
                return;
            });
        },

        getUserNames : function() {
            return userNames;
        },

        getEmails : function() {
        return emails;
        },

        reloadUsers : function() {
            return readUsers().then(function(data) {
                return angular.copy(users);
            });
        },

        setUserRole : function(accountURI, role) {
            var requestData = {
                format: "application/sparql-results+json",
                query: "prefix ontos: <" + Config.getFrameworkOntologyNS() + "> "
                        + " prefix : <" + Config.getNS() + "> "
                        + " WITH <" + Config.getAccountsGraph() + "> "
                        + " DELETE {" + accountURI + " ontos:role ?r .} "
                        + " INSERT {" + accountURI + " ontos:role <" + role + "> .} "
                        + " WHERE {" + accountURI + " ontos:role ?r . } ",
                mode: "settings"
            };
            return $http.post("rest/RdfStoreProxy", $.param(requestData));
        },

        createUser : function(user) {
            user.profile.role = user.profile.role.replace("ontos:", Config.getFrameworkOntologyNS());
            var parameters = {
                mode: "create",
                user: JSON.stringify(user),
                curuser: AccountService.getAccount().getUsername()
            };
            return $http({
                url: "UserManagerServlet",
                method: "POST",
                dataType: "json",
                params: parameters,
                contentType: "application/json; charset=utf-8"
                });
        },

        deleteUser : function(username) {
            var requestData = {
                mode: "delete",
                username: username,
                curuser: AccountService.getAccount().getUsername()
            };
            return $http.post("UserManagerServlet", $.param(requestData));
        }
    };
   
    return service;
});