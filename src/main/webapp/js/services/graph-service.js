'use strict';

var module = angular.module('app.graph-service', []);

module.factory("GraphService", function ($http, $q, Config, AccountService, Helpers) {

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
        console.log("get accesible graphs for "+AccountService.getAccount().getAccountURI());
        return readNamedGraphs(reload).then(function (data) {
            var results = [];
            for (var resource in data) {
                var namedGraph = data[resource];
                // be sure that is named one
                if(namedGraph["sd:name"] == undefined) continue;
                //skip own graphs (if needs)
                if (skipOwn && namedGraph["acl:owner"] == AccountService.getAccount().getAccountURI())
                    continue;

                //get access mode
                var accessMode = null;
                if (namedGraph["acl:owner"] == AccountService.getAccount().getAccountURI()) {
                    accessMode = "acl:Write";
                } else {
                    var publicAccessMode = null;
                    var userAccessMode = null;
                    var access = namedGraph["gkg:access"];
                    for (var acc in access) {
                        var agentClass = access[acc]["acl:agentClass"];
                        var agent = access[acc]["acl:agent"];
                        var mode = access[acc]["acl:mode"][0];
                        if (agentClass != undefined && agentClass[0] == "foaf:Agent" || agent != undefined && agent[0] == AccountService.getAccount().getAccountURI()) {
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
                    name  : namedGraph["sd:name"][0]
                    , graph : {
                        label : data[namedGraph["sd:graph"]]["rdfs:label"][0]
                        , description : data[namedGraph["sd:graph"]]["dcterms:description"][0]
                        , modified : data[namedGraph["sd:graph"]]["dcterms:modified"][0]
                        , created : data[namedGraph["sd:graph"]]["dcterms:created"][0]
                        , endpoint : data[namedGraph["sd:graph"]]["void:sparqlEndpoint"][0]
                    }
                    , access : accessMode
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
                var graph = data[resource];
                // filter named graphs
                if (graph["rdf:type"] == "sd:NamedGraph") {
                    var res = {
                        name: graph["sd:name"][0],
                        graph: {
                            label: data[graph["sd:graph"]]["rdfs:label"][0],
                            description: data[graph["sd:graph"]]["dcterms:description"][0],
                            modified: data[graph["sd:graph"]]["dcterms:modified"][0],
                            created: data[graph["sd:graph"]]["dcterms:created"][0],
                            endpoint: data[graph["sd:graph"]]["void:sparqlEndpoint"][0]
                        },
                        owner: null,
                        publicAccess: getNoAccessMode(),
                        usersWrite: [],
                        usersRead: []
                    };

                    var access = graph["gkg:access"];
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
                    if (graph["acl:owner"] != undefined)
                        res.owner = graph["acl:owner"][0];
                    results.push(res);
                }
            }
            return results;
        });
    };

    var getNamedGraph = function (parName) {
        var settings = Config.getSettings();
        var results = {
            name: namedGraphs[parName]["sd:name"][0] // name is the URI
            ,
            graph: {
                label: settings[namedGraph["sd:graph"]]["rdfs:label"][0],
                description: settings[namedGraph["sd:graph"]]["dcterms:description"][0],
                modified: settings[namedGraph["sd:graph"]]["dcterms:modified"][0],
                created: settings[namedGraph["sd:graph"]]["dcterms:created"][0],
                endpoint: settings[namedGraph["sd:graph"]]["void:sparqlEndpoint"][0]
            },
            owner: null,
            publicAccess: getNoAccessMode(),
            usersWrite: [],
            usersRead: []
        };
        var access = namedGraphs[parName]["gkg:access"];
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
        if (namedGraphs[parName]["acl:owner"] != undefined)
            results.owner = namedGraphs[parName]["acl:owner"][0];
        return results;
    };

    var updateForeignGraph = function (parNamedGraph) {
        parNamedGraph.name = Config.getNS() + parNamedGraph.name.replace(':', '')
        var requestData = {
            format: "application/sparql-results+json",
            mode: "updateForeign",
            graph: JSON.stringify(parNamedGraph)
        };
        return $http.post("GraphManagerServlet", $.param(requestData));
    };

    var deleteForeignGraph = function (parGraphName) {
        var requestData = {
            format: "application/sparql-results+json",
            mode: "dropForeign",
            graph: parGraphName.replace(':', Config.getNS())
        };
        return $http.post("GraphManagerServlet", $.param(requestData));
    };

    /**
     * From ConfigurationServices
     */

    var getAccessModes = function () {
        return accessModes;
    };

    // this fuincrtion reads from client settins the graphs
    var getUserGraphs = function (userUri, reload) {
        return readNamedGraphs(reload).then(function (data) {
            var results = [];
            for (var resource in data) {
                var graph = data[resource];
                // filter named graphs
                if (graph["rdf:type"] == "sd:NamedGraph") {

                    if (graph["acl:owner"] == undefined ||
                        graph["acl:owner"][0] != userUri )
                        continue;

                    var res = {
                        name: graph["sd:name"][0],
                        graph: {
                            label: data[graph["sd:graph"]]["rdfs:label"][0],
                            description: data[graph["sd:graph"]]["dcterms:description"][0],
                            modified: data[graph["sd:graph"]]["dcterms:modified"][0],
                            created: data[graph["sd:graph"]]["dcterms:created"][0],
                            endpoint: data[graph["sd:graph"]]["void:sparqlEndpoint"][0]
                        },
                        owner: graph["acl:owner"][0],
                        publicAccess: getNoAccessMode(),
                        usersWrite: [],
                        usersRead: []
                    };

                    var access = graph["gkg:access"];
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

                    results.push(res);
                }
            }
            return results;
        });
    };

    var getNamedGraphCS = function (parName) {
        var settings = Config.getSettings();
        var namedGraph = settings[parName];
        var results = {
            name: settings[parName]["sd:name"][0] // name is the URI
            ,
            graph: {
                label: settings[namedGraph["sd:graph"]]["rdfs:label"][0],
                description: settings[namedGraph["sd:graph"]]["dcterms:description"][0],
                modified: settings[namedGraph["sd:graph"]]["dcterms:modified"][0],
                created: settings[namedGraph["sd:graph"]]["dcterms:created"][0],
                endpoint: settings[namedGraph["sd:graph"]]["void:sparqlEndpoint"][0]
            },
            publicAccess: getNoAccessMode(),
            usersWrite: [],
            usersRead: []
        };

        var access = settings[parName]["gkg:access"];
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

        return results;
    };


    var addSimpleGraph = function(name, label, description){
        var s_now = Helpers.getCurrentDate();
        var baseGraph = {
            name:  ":" + name,
            graph: {
              created: s_now,
              endpoint: Config.getAuthEndpoint(),
              description: description,
              modified: s_now,
              label: label
              },
              owner: AccountService.getAccount().getAccountURI(),
              publicAccess: getNoAccessMode(),
              usersWrite: [],
              usersRead: []
        };
        return addGraph(baseGraph);
    };

    // add a named graph in the store
    var addGraph = function (parNamedGraph) {
        // create the metadata for the graph
        var namedgraph = {
            "rdf:type": ["sd:NamedGraph"],
            "sd:name": [parNamedGraph.name],
            "sd:graph": [parNamedGraph.name + "Graph"]
        };
        var graph = {
            "rdfs:label": [parNamedGraph.graph.label],
            "rdf:type": ["void:Dataset", "sd:Graph"],
            "dcterms:description": [parNamedGraph.graph.description],
            "dcterms:modified": [parNamedGraph.graph.modified],
            "dcterms:created": [parNamedGraph.graph.created],
            "void:sparqlEndpoint": [parNamedGraph.graph.endpoint]
        };

        var permissions = [];
        // graphs can only be created by authenticated users
        if (AccountService.getAccount().getUsername()!= null) {
            // TODO: to update 
            if (parNamedGraph.publicAccess == "acl:Read") {
                namedgraph["gkg:access"] = [{
                    "acl:mode": ["acl:Read"],
                    "acl:agentClass": ["foaf:Agent"]
                }];
                permissions.push({
                    username: null,
                    permissions: "r"
                });
            } else if (parNamedGraph.publicAccess == "acl:Write") {
                namedgraph["gkg:access"] = [{
                    "acl:mode": ["acl:Write"],
                    "acl:agentClass": ["foaf:Agent"]
                }];
                permissions.push({
                    username: null,
                    permissions: "w"
                });
            } else if (parNamedGraph.publicAccess == getNoAccessMode()) {
                permissions.push({
                    username: null,
                    permissions: "n"
                });
            }
            for (var user in parNamedGraph.usersRead) {
                if (parNamedGraph.usersWrite.indexOf(parNamedGraph.usersRead[user]) == -1) {
                    if (namedgraph["gkg:access"] == undefined) {
                        namedgraph["gkg:access"] = [];
                    }
                    namedgraph["gkg:access"].push({
                        "acl:mode": ["acl:Read"],
                        "acl:agent": [parNamedGraph.usersRead[user]]
                    });
                    permissions.push({
                        username: parNamedGraph.usersRead[user],
                        permissions: "r"
                    });
                }
            }
            for (var user in parNamedGraph.usersWrite) {
                if (namedgraph["gkg:access"] == undefined) {
                    namedgraph["gkg:access"] = [];
                }
                namedgraph["gkg:access"].push({
                    "acl:mode": ["acl:Write"],
                    "acl:agent": [parNamedGraph.usersWrite[user]]
                });
                permissions.push({
                    username: parNamedGraph.usersWrite[user],
                    permissions: "w"
                });
            }
            namedgraph["acl:owner"] = [AccountService.getAccount().getAccountURI()];
        }
        // create the graph
        
        var requestData = {
            format: "application/sparql-results+json",
            mode: "create",
            graph: Config.getNS() + parNamedGraph.name.replace(':', ''),
            permissions: JSON.stringify(permissions),
            username: AccountService.getAccount().getUsername()
        }

        var deferred = $q.defer();
        $http.post("GraphManagerServlet", $.param(requestData)).then(
            // success
            function(response) {
                var settings = Config.getSettings();
                settings[parNamedGraph.name] = namedgraph;
                settings[parNamedGraph.name + "Graph"] = graph;
                settings[":default-dataset"]["sd:namedGraph"].push(parNamedGraph.name);
                Config.write().then(function(){
                    deferred.resolve(response);    
                });
            },
            // error
            function(response) {
                deferred.reject(response)
            });
        return deferred.promise;

    };

    // saves a named graph in the store
    var updateGraph = function (parNamedGraph) {
        var namedgraph = Config.getSettings()[parNamedGraph.name];
        var graph = Config.getSettings()[parNamedGraph.name + "Graph"];
        graph["rdfs:label"][0] = parNamedGraph.graph.label;
        graph["dcterms:description"][0] = parNamedGraph.graph.description;
        graph["dcterms:modified"][0] = parNamedGraph.graph.modified;
        graph["dcterms:created"][0] = parNamedGraph.graph.created;
        graph["void:sparqlEndpoint"][0] = parNamedGraph.graph.endpoint;

        var permissions = null;
        if (AccountService.getAccount().getUsername()!= null) {
            if (parNamedGraph.publicAccess == "acl:Read") {
                namedgraph["gkg:access"] = [{
                    "acl:mode": ["acl:Read"],
                    "acl:agentClass": ["foaf:Agent"]
                }];
                permissions = [{
                    username: null,
                    permissions: "r"
                }];
            } else if (parNamedGraph.publicAccess == "acl:Write") {
                namedgraph["gkg:access"] = [{
                    "acl:mode": ["acl:Write"],
                    "acl:agentClass": ["foaf:Agent"]
                }];
                permissions = [{
                    username: null,
                    permissions: "w"
                }];
            } else if (parNamedGraph.publicAccess == getNoAccessMode()) {
                namedgraph["gkg:access"] = undefined;
                permissions = [{
                    username: null,
                    permissions: "n"
                }];
            }
            for (var user in parNamedGraph.usersRead) {
                if (parNamedGraph.usersWrite.indexOf(parNamedGraph.usersRead[user]) == -1) {
                    if (namedgraph["gkg:access"] == undefined) {
                        namedgraph["gkg:access"] = [];
                    }
                    namedgraph["gkg:access"].push({
                        "acl:mode": ["acl:Read"],
                        "acl:agent": [parNamedGraph.usersRead[user]]
                    });
                    permissions.push({
                        username: parNamedGraph.usersRead[user],
                        permissions: "r"
                    });
                }
            }
            for (var user in parNamedGraph.usersWrite) {
                if (namedgraph["gkg:access"] == undefined) {
                    namedgraph["gkg:access"] = [];
                }
                namedgraph["gkg:access"].push({
                    "acl:mode": ["acl:Write"],
                    "acl:agent": [parNamedGraph.usersWrite[user]]
                });
                permissions.push({
                    username: parNamedGraph.usersWrite[user],
                    permissions: "w"
                });
            }
        }
        
        var requestData = {
            format: "application/sparql-results+json",
            graph: Config.getNS() + parNamedGraph.name.replace(':', ''),
            mode: "update",
            permissions: JSON.stringify(permissions),
            username: AccountService.getAccount().getUsername()
        };

        var deferred = $q.defer();
        
        $http.post("GraphManagerServlet", $.param(requestData)).then(
            // success
            function(response) {
                Config.write().then(function(){
                    deferred.resolve(response);    
                });
            },
            // error
            function(response) {
                // reset
                Config.read();
                deferred.reject(response);
            });

        return deferred.promise;
    };

    // saves a named graph in the store
    var deleteGraph = function (parGraphName) {

        var requestData = {
            format: "application/sparql-results+json",
            mode: "drop",
            graph: parGraphName.replace(':', Config.getNS()),
            // username: AccountService.getAccount().getUsername()
        }
        var deferred = $q.defer();
        $http.post("GraphManagerServlet", $.param(requestData)).then(
            // success
            function(response) {
                var settings = Config.getSettings();
                settings[":default-dataset"]["sd:namedGraph"].pop(parGraphName);
                delete settings[parGraphName];
                Config.write().then(function(){
                    deferred.resolve(response);    
                });
                
            },
            // error
            function(response) {
                deferred.reject(response);
                // flash.error = ServerErrorResponse.getMessage(response);
            });
        return deferred.promise;

    };
            

    return {
        readNamedGraphs: readNamedGraphs,
        getUserGraphs : getUserGraphs,
        getAccessibleGraphs: getAccessibleGraphs,
        getAllNamedGraphs: getAllNamedGraphs,
        getNamedGraph: getNamedGraph,
        updateForeignGraph: updateForeignGraph,
        deleteForeignGraph: deleteForeignGraph,
        // these are new moved here
        deleteGraph: deleteGraph,
        updateGraph: updateGraph,
        addGraph: addGraph,
        addSimpleGraph :addSimpleGraph,
        getAccessModes: getAccessModes,
        getNoAccessMode: getNoAccessMode,
        // these are new duplicated
        getNamedGraphCS: getNamedGraphCS,
        // getAllNamedGraphsSettings: getAllNamedGraphsSettings
    };

});