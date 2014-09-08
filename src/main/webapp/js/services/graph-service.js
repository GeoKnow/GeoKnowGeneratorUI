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

    // TODO: graphs may be read once when loading the app like the Config.read 
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
                // be sure that is named one
                if(namedGraph["sd:name"] == undefined) continue;
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
            username: AccountService.getUsername(),
            mode: "updateForeign",
            graph: JSON.stringify(parNamedGraph)
        };
        return $http.post("GraphManagerServlet", $.param(requestData));
    };

    var deleteForeignGraph = function (parGraphName) {
        var requestData = {
            format: "application/sparql-results+json",
            username: AccountService.getUsername(),
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
    var getAllNamedGraphsSettings = function () {
        var results = [];
        var settings = Config.getSettings();
        var elements = Config.select("rdf:type", "sd:NamedGraph");
        for (var resource in elements) {
            var namedGraph = elements[resource];
            var res = {
                name: namedGraph["sd:name"][0], // name is the URI
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
            results.push(res);
        }
        return results;
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
        if (AccountService.isLogged()) {
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
            namedgraph["acl:owner"] = [AccountService.getAccountURI()];
        }
        console.log(permissions);
        // create the graph
        var requestData = {
            format: "application/sparql-results+json",
            mode: "create",
            graph: Config.getNS() + parNamedGraph.name.replace(':', ''),
            permissions: JSON.stringify(permissions),
            username: AccountService.getUsername()
        }

        Config.request("GraphManagerServlet", requestData, function () {
            // if the creation succeed, then add the metadata insert the metadata of the graph
            var settings = Config.getSettings();
            console.log("write settings");
            settings[parNamedGraph.name] = namedgraph;
            settings[parNamedGraph.name + "Graph"] = graph;
            settings[":default-dataset"]["sd:namedGraph"].push(parNamedGraph.name);
            console.log(settings);
            Config.write();

        });

        // Config.createGraph(Config.getNS() + parNamedGraph.name.replace(':', ''), 
        //   JSON.stringify(permissions), 
        //   function(){ 
        //     // if the creation succeed, then add the metadata insert the metadata of the graph
        //     var settings = Config.getSettings();
        //     settings[parNamedGraph.name] = namedgraph;
        //     settings[parNamedGraph.name+"Graph"] = graph;
        //     settings[parNamedGraph.name+"GraphAccess"] = graphAccess;
        //     settings[":default-dataset"]["sd:namedGraph"].push(parNamedGraph.name);
        //     Config.write();
        //   });
        return true;
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
        if (AccountService.isLogged()) {
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
        if (permissions != null) {
            var requestData = {
                format: "application/sparql-results+json",
                graph: Config.getNS() + parNamedGraph.name.replace(':', ''),
                mode: "update",
                permissions: JSON.stringify(permissions),
                username: AccountService.getUsername()
            };
            return Config.request("GraphManagerServlet", requestData, function () {
                Config.write();
            });
            // Config.setGraphPermissions(Config.getNS() + parNamedGraph.name.replace(':', ''), JSON.stringify(permissions));
        }
    };

    // saves a named graph in the store
    var deleteGraph = function (parGraphName) {
        Config.dropGraph(parGraphName.replace(':', Config.getNS()));
        // if the creation succeed, then delete the metadata
        var settings = Config.getSettings();
        settings[":default-dataset"]["sd:namedGraph"].pop(parGraphName);
        delete settings[parGraphName];
        Config.write();
        return true;
    };

    return {
        readNamedGraphs: readNamedGraphs,
        getAccessibleGraphs: getAccessibleGraphs,
        getAllNamedGraphs: getAllNamedGraphs,
        getNamedGraph: getNamedGraph,
        updateForeignGraph: updateForeignGraph,
        deleteForeignGraph: deleteForeignGraph,
        // these are new moved here
        deleteGraph: deleteGraph,
        updateGraph: updateGraph,
        addGraph: addGraph,
        getAccessModes: getAccessModes,
        getNoAccessMode: getNoAccessMode,
        // these are new duplicated
        getNamedGraphCS: getNamedGraphCS,
        getAllNamedGraphsSettings: getAllNamedGraphsSettings
    };

});