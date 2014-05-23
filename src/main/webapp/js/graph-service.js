'use strict';

var module = angular.module('app.graph-service', []);

module.factory("GraphService", function ($http, $q, Config, AccountService) {
    var accessModes = {
        ":No": "No",
        "acl:Read": "Read",
        "acl:Write": "Write"
    };

    var getNoAccessMode = function () {
        return ":No";
    };

    var namedGraphs = {};
    var namedGraphsLoaded = false;

    var readNamedGraphs = function (reload) {
        if (namedGraphsLoaded && !reload) {
            var deferred = $q.defer();
            deferred.resolve(namedGraphs);
            return deferred.promise;
        } else {
            var requestData = {
                format: "application/sparql-results+json",
                username: AccountService.getUsername(),
                mode: "getAllSparql"
            };
            return $http.post("GraphManagerServlet", $.param(requestData)).then(function (result) {
                namedGraphs = Config.parseSparqlResults(result.data);
                namedGraphsLoaded = true;
                return namedGraphs;
            });
        }
    };

    var getAccessibleGraphs = function (onlyWritable, skipOwn, reload) {
        return readNamedGraphs(reload).then(function (data) {
            var results = [];
            for (var resource in data) {
                var namedGraph = data[resource];

                //skip own graphs (if needs)
                if (skipOwn && namedGraph["acl:owner"] == AccountService.getAccountURI())
                    continue;

                //get access mode
                var accessMode = null;
                if (namedGraph["acl:owner"] == AccountService.getAccountURI()) {
                    accessMode = "acl:Write";
                } else {
                    var publicAccessMode = null;
                    var userAccessMode = null;
                    var access = namedGraph["gkg:access"];
                    for (var acc in access) {
                        var agentClass = access[acc]["acl:agentClass"];
                        var agent = access[acc]["acl:agent"];
                        var mode = access[acc]["acl:mode"][0];
                        if (agentClass != undefined && agentClass[0] == "foaf:Agent" || agent != undefined && agent[0] == AccountService.getAccountURI()) {
                            if (accessMode == null || accessMode == "acl:Read" && mode == "acl:Write")
                                accessMode = mode;
                        }
                        if (accessMode == "acl:Write")
                            break;
                    }
                }
                if (accessMode == null || onlyWritable && accessMode == "acl:Read")
                    continue;

                //add result
                var res = {
                    name: namedGraph["sd:name"][0],
                    graph: {
                        label: namedGraph["sd:graph"][0]["rdfs:label"][0],
                        description: namedGraph["sd:graph"][0]["dcterms:description"][0],
                        modified: namedGraph["sd:graph"][0]["dcterms:modified"][0],
                        created: namedGraph["sd:graph"][0]["dcterms:created"][0],
                        endpoint: namedGraph["sd:graph"][0]["void:sparqlEndpoint"][0]
                    },
                    access: accessMode
                };
                results.push(res);
            }
            return results;
        });
    };

    var getAllNamedGraphs = function (reload) {
        return readNamedGraphs(reload).then(function (data) {
            var results = [];
            for (var resource in data) {
                var namedGraph = data[resource];
                var res = {
                    name: namedGraph["sd:name"][0],
                    graph: {
                        label: namedGraph["sd:graph"][0]["rdfs:label"][0],
                        description: namedGraph["sd:graph"][0]["dcterms:description"][0],
                        modified: namedGraph["sd:graph"][0]["dcterms:modified"][0],
                        created: namedGraph["sd:graph"][0]["dcterms:created"][0],
                        endpoint: namedGraph["sd:graph"][0]["void:sparqlEndpoint"][0]
                    },
                    owner: null,
                    publicAccess: getNoAccessMode(),
                    usersWrite: [],
                    usersRead: []
                };
                var access = namedGraph["gkg:access"];
                if (access != undefined) {
                    for (var acc in access) {
                        var agentClass = access[acc]["acl:agentClass"];
                        var accessMode = access[acc]["acl:mode"][0];
                        if (agentClass != undefined && agentClass[0] == "foaf:Agent") { //public access
                            if (res.publicAccess == getNoAccessMode() || res.publicAccess == "acl:Read" && accessMode == "acl:Write")
                                res.publicAccess = accessMode;
                        } else { //user access
                            if (accessMode == "acl:Write") {
                                res.usersWrite.push(access[acc]["acl:agent"][0]);
                            } else {
                                res.usersRead.push(access[acc]["acl:agent"][0]);
                            }
                        }
                    }
                }
                if (namedGraph["acl:owner"] != undefined)
                    res.owner = namedGraph["acl:owner"][0];
                results.push(res);
            }
            return results;
        });
    };

    var getNamedGraph = function (name) {
        var results = {
            name: namedGraphs[name]["sd:name"][0] // name is the URI
            ,
            graph: {
                label: namedGraphs[name]["sd:graph"][0]["rdfs:label"][0],
                description: namedGraphs[name]["sd:graph"][0]["dcterms:description"][0],
                modified: namedGraphs[name]["sd:graph"][0]["dcterms:modified"][0],
                created: namedGraphs[name]["sd:graph"][0]["dcterms:created"][0],
                endpoint: namedGraphs[name]["sd:graph"][0]["void:sparqlEndpoint"][0]
            },
            owner: null,
            publicAccess: getNoAccessMode(),
            usersWrite: [],
            usersRead: []
        };
        var access = namedGraphs[name]["gkg:access"];
        if (access != undefined) {
            for (var acc in access) {
                var agentClass = access[acc]["acl:agentClass"];
                var accessMode = access[acc]["acl:mode"][0];
                if (agentClass != undefined && agentClass[0] == "foaf:Agent") {
                    results.publicAccess = accessMode;
                } else {
                    if (accessMode == "acl:Write") {
                        results.usersWrite.push(access[acc]["acl:agent"][0]);
                    } else {
                        results.usersRead.push(access[acc]["acl:agent"][0]);
                    }
                }
            }
        }
        if (namedGraphs[name]["acl:owner"] != undefined)
            results.owner = namedGraphs[name]["acl:owner"][0];
        return results;
    };

    var updateForeignGraph = function (namedGraph) {
        namedGraph.name = Config.getNS() + namedGraph.name.replace(':', '')
        var requestData = {
            format: "application/sparql-results+json",
            username: AccountService.getUsername(),
            mode: "updateForeign",
            graph: JSON.stringify(namedGraph)
        };
        return $http.post("GraphManagerServlet", $.param(requestData));
    };

    var deleteForeignGraph = function (graphName) {
        var requestData = {
            format: "application/sparql-results+json",
            username: AccountService.getUsername(),
            mode: "dropForeign",
            graph: graphName.replace(':', Config.getNS())
        };
        return $http.post("GraphManagerServlet", $.param(requestData));
    };

    return {
        readNamedGraphs: readNamedGraphs,
        getAccessibleGraphs: getAccessibleGraphs,
        getAllNamedGraphs: getAllNamedGraphs,
        getNamedGraph: getNamedGraph,
        updateForeignGraph: updateForeignGraph,
        deleteForeignGraph: deleteForeignGraph
    };
});