'use strict';

var module = angular.module('app.graph-service', []);

module.factory("GraphService", function ($http, $q, Config, ConfigurationService, AccountService, Helpers, CoevolutionService, Ns) {
    var accessModes = {
        ":No": "No",
        "acl:Read": "Read",
        "acl:Write": "Write"
    };
    
    //graph cannot be public writable
    var publicAccessModes = {
        ":No": "No",
        "acl:Read": "Read"
    };

    var getNoAccessMode = function () {
        return ":No";
    };

    var namedGraphs = {};
    var namedGraphsLoaded = false;

    var getGraphJson = function(uri, source){
        var namedGraph  =  source[uri];
        var graph = source[namedGraph["sd:graph"]];
        // catch unrecognised namespaces
        var vgraphset= "";
        if( graph["gv:hasGraphSet"] != undefined &&
            graph["gv:hasGraphSet"][0] != ""){
            vgraphset = graph["gv:hasGraphSet"][0];
            if(Ns.getNamespace(vgraphset)== undefined)
                Ns.add(vgraphset, ConfigurationService.getUriBase()+vgraphset+"/"); 
        }

        var res = {
            name  : namedGraph["sd:name"][0]
            , graph : {
                label : graph["rdfs:label"][0]
                , description : graph["dcterms:description"][0]
                , created  : graph["dcterms:created"][0]
                , modified : ((graph["dcterms:modified"]==undefined)? '': graph["dcterms:modified"][0])
                , graphset : vgraphset
                , contributor   : ((graph["dcterms:contributor"]  == undefined)? [] : graph["dcterms:contributor"])
                , source   : ((graph["dcterms:source"] == undefined)? [] : graph["dcterms:source"])
                , triples  : ((graph["void:triples"] == undefined)? 0 : graph["void:triples"][0])
                , issued   : ((graph["dcterms:issued"] == undefined)? '' : graph["dcterms:issued"][0])
            }
        };
        return res;
    };
    var readNamedGraphs = function (reload) {
        return CoevolutionService.getGroups().then(
            // success
            function(response){
                var requestData = {
                    format: "application/sparql-results+json",
                    username: AccountService.getAccount().getUsername()
                };
                return $http.post("rest/graphs/getAllGraphsSparql", $.param(requestData)).then(function (result) {
                    namedGraphs = Config.parseSparqlResults(result.data);
                    namedGraphsLoaded = true;

                    return namedGraphs;
                });
            });
    };

    var getAccessibleGraphs = function (onlyWritable, skipOwn, reload) {
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
                    var access = namedGraph["ontos:access"];
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
                
                var graph = data[namedGraph["sd:graph"]];
                
                if (onlyWritable && graph["dcterms:issued"]!= undefined)
                    continue;
                if (accessMode == null || onlyWritable && accessMode == "acl:Read")
                    continue;

                //add result
                var res = getGraphJson(resource, data);
                res["access"] = accessMode;
                
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

                    var res = getGraphJson(resource, data);

                    var access = graph["ontos:access"];
                    if (access != undefined) {
                        for (var acc in access) {
                            var agentClass = access[acc]["acl:agentClass"];
                            var accessMode = access[acc]["acl:mode"][0];
                            if (agentClass != undefined && agentClass[0] == "foaf:Agent") { //public access
                                if (res.publicAccess == getNoAccessMode() || res.publicAccess == "acl:Read" && accessMode == "acl:Write")
                                    res.publicAccess = accessMode;
                            } else { //user access
                                if (accessMode == "acl:Write") {
                                    if(res.usersWrite == undefined) res["usersWrite"]=[];
                                    res.usersWrite.push(access[acc]["acl:agent"][0]);
                                } else {
                                    if(res.usersRead == undefined) res["usersRead"]=[];
                                    res.usersRead.push(access[acc]["acl:agent"][0]);
                                }
                            }
                        }
                    }
                    if (graph["acl:owner"] != undefined){
                        res.owner = graph["acl:owner"][0];
                    }
                    results.push(res);
                }
            }
            return results;
        });
    };

    var getNamedGraph = function (parName) {
        var settings = Config.getSettings();
        
        var results = getGraphJson(parName,settings);
        results["owner"] = null;
        results["publicAccess"]= getNoAccessMode();
        results["usersWrite"]= [];
        results["usersRead"]= [];

        var access = namedGraphs[parName]["ontos:access"];
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
            username: AccountService.getAccount().getUsername(),
            graph: JSON.stringify(parNamedGraph)
        };
        return $http.post("rest/graphs/updateForeign", $.param(requestData));
    };

    var deleteForeignGraph = function (parGraphName) {
        var requestData = {
            format: "application/sparql-results+json",
            username: AccountService.getAccount().getUsername(),
            graph: parGraphName.replace(':', Config.getNS())
        };
        return $http.post("rest/graphs/dropForeign", $.param(requestData));
    };

    /**
     * From ConfigurationServices
     */

    var getAccessModes = function () {
        return accessModes;
    };
    
    var getPublicAccessModes = function() {
        return publicAccessModes;
    };

    // this function reads from client settins the graphs
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

                    var res = getGraphJson(resource,data);
                    res["publicAccess"]= getNoAccessMode();
                    res["usersWrite"]= [];
                    res["usersRead"]= [];
                    res["owner"] = userUri;

                    var access = graph["ontos:access"];
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
        var results = getGraphJson(parName,settings);
        results["publicAccess"]= getNoAccessMode();
        results["usersWrite"]= [];
        results["usersRead"]= [];
        
        var access = settings[parName]["ontos:access"];
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


    var createTargetGraph = function(name, label, description){
            // create a new graph to save data
        var name  = name + new Date().getTime();
        var label = label;
        var description = description;
        GraphService.addSimpleGraph(name, label, description).then(function(response){
            $scope.refreshGraphList();
            $scope.fagi.targetGraph = ":"+name;
        });
        $scope.updateServiceParams();
    };

    /**
     * Simplyfied method to create a temporary private graph for the logged in user only
     */
    var addSimpleGraph = function(name, label, description){
        var s_now = Helpers.getCurrentDate();
        var baseGraph = {
            name:  ":" + name,
            graph: {
              created: s_now,
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
            "gv:hasGraphSet": (parNamedGraph.graph.graphset == undefined ? [""] : [parNamedGraph.graph.graphset])
        };


        var permissions = [];
        // graphs can only be created by authenticated users
        if (AccountService.getAccount().getUsername() != undefined) {
            // TODO: to update 
            if (parNamedGraph.publicAccess == "acl:Read") {
                namedgraph["ontos:access"] = [{
                    "acl:mode": ["acl:Read"],
                    "acl:agentClass": ["foaf:Agent"]
                }];
                permissions.push({
                    username: null,
                    permissions: "r"
                });
            } else if (parNamedGraph.publicAccess == "acl:Write") {
                namedgraph["ontos:access"] = [{
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
                if (parNamedGraph.usersWrite.indexOf(ConfigurationService.getUriBase()+parNamedGraph.usersRead[user]) == -1) {
                    if (namedgraph["ontos:access"] == undefined) {
                        namedgraph["ontos:access"] = [];
                    }
                    namedgraph["ontos:access"].push({
                        "acl:mode": ["acl:Read"],
                        "acl:agent": [ConfigurationService.getUriBase()+parNamedGraph.usersRead[user]]
                    });
                    permissions.push({
                        username: parNamedGraph.usersRead[user],
                        permissions: "r"
                    });
                }
            }
            for (var user in parNamedGraph.usersWrite) {
                if (namedgraph["ontos:access"] == undefined) {
                    namedgraph["ontos:access"] = [];
                }
                namedgraph["ontos:access"].push({
                    "acl:mode": ["acl:Write"],
                    "acl:agent": [ConfigurationService.getUriBase()+parNamedGraph.usersWrite[user]]
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
            graph: Ns.lengthen(parNamedGraph.name),
            permissions: JSON.stringify(permissions),
            username: AccountService.getAccount().getUsername(), 
        }
        
        var promise = $http.post("rest/graphs/createGraph", $.param(requestData)).then(
            // success
            function (response) {
                   // if the creation succeed, then add the metadata insert the metadata of the graph
                var settings = Config.getSettings();
                settings[parNamedGraph.name] = namedgraph;
                settings[parNamedGraph.name + "Graph"] = graph;
                if(settings[":default-dataset"]["sd:namedGraph"] == undefined)
                    settings[":default-dataset"]["sd:namedGraph"] = [];
                settings[":default-dataset"]["sd:namedGraph"].push(parNamedGraph.name);
                
                return Config.write();
            });
        return promise;

    };

    // saves a named graph in the store
    var updateGraph = function (parNamedGraph) {
        console.log(parNamedGraph);
        console.log(Config.getSettings());
        var namedgraph = Config.getSettings()[parNamedGraph.name];
        var graph = Config.getSettings()[parNamedGraph.name + "Graph"];

        graph["rdfs:label"][0] = parNamedGraph.graph.label;
        graph["dcterms:description"][0] = parNamedGraph.graph.description;
        graph["dcterms:modified"][0] = parNamedGraph.graph.modified;
        graph["dcterms:created"][0] = parNamedGraph.graph.created;
        graph["gv:hasGraphSet"][0] = (parNamedGraph.graph.graphset == undefined ? [] : parNamedGraph.graph.graphset)

        if(parNamedGraph.graph.issued != ""){
            if(graph["dcterms:issued"]== undefined)
                graph["dcterms:issued"]=[parNamedGraph.graph.issued];
        }

        console.log(Config.getSettings());

        var permissions = null;
        if (AccountService.getAccount().getUsername() != undefined) {
            if (parNamedGraph.publicAccess == "acl:Read") {
                namedgraph["ontos:access"] = [{
                    "acl:mode": ["acl:Read"],
                    "acl:agentClass": ["foaf:Agent"]
                }];
                permissions = [{
                    username: null,
                    permissions: "r"
                }];
            } else if (parNamedGraph.publicAccess == "acl:Write") {
                namedgraph["ontos:access"] = [{
                    "acl:mode": ["acl:Write"],
                    "acl:agentClass": ["foaf:Agent"]
                }];
                permissions = [{
                    username: null,
                    permissions: "w"
                }];
            } else if (parNamedGraph.publicAccess == getNoAccessMode()) {
                namedgraph["ontos:access"] = undefined;
                permissions = [{
                    username: null,
                    permissions: "n"
                }];
            }
            for (var user in parNamedGraph.usersRead) {
                if (parNamedGraph.usersWrite.indexOf(ConfigurationService.getUriBase()+parNamedGraph.usersRead[user]) == -1) {
                    if (namedgraph["ontos:access"] == undefined) {
                        namedgraph["ontos:access"] = [];
                    }
                    namedgraph["ontos:access"].push({
                        "acl:mode": ["acl:Read"],
                        "acl:agent": [ConfigurationService.getUriBase()+parNamedGraph.usersRead[user]]
                    });
                    permissions.push({
                        username: parNamedGraph.usersRead[user],
                        permissions: "r"
                    });
                }
            }
            for (var user in parNamedGraph.usersWrite) {
                if (namedgraph["ontos:access"] == undefined) {
                    namedgraph["ontos:access"] = [];
                }
                namedgraph["ontos:access"].push({
                    "acl:mode": ["acl:Write"],
                    "acl:agent": [ConfigurationService.getUriBase()+parNamedGraph.usersWrite[user]]
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
                graph: Ns.lengthen(parNamedGraph.name),
                permissions: JSON.stringify(permissions),
                username: AccountService.getAccount().getUsername()
            };
            return Config.request("rest/graphs/updateGraph", requestData, function () {
                return Config.write();
            });
            // Config.setGraphPermissions(Config.getNS() + parNamedGraph.name.replace(':', ''), JSON.stringify(permissions));
        }
    };

    // saves a named graph in the store
        // saves a named graph in the store
    var deleteGraph = function (parGraphName) {

        var requestData = {
            format: "application/sparql-results+json",
            graph: Ns.lengthen(parGraphName),
            username: AccountService.getAccount().getUsername()
        }

        return Config.request("rest/graphs/dropGraph", requestData, function () {
            var settings = Config.getSettings();
            settings[":default-dataset"]["sd:namedGraph"].pop(parGraphName);
            delete settings[parGraphName];
            delete settings[parGraphName + "Graph"]
            return Config.write();
        });
    };


    // after some data updated into the graph, its metadata needs to be updated
    var addContribution = function(contribution){
        
        return $http.put("rest/graphs", contribution).then(
            function(response){
                return response.data.namedgraph;
            });
    };


// after some data updated into the graph, its metadata needs to be updated
    var publish = function(graphName){
        console.log(graphName);
        var uri = Ns.lengthen(graphName);
        console.log(uri);
        return $http.get("rest/graphs/countTriples/"+uri).then(
            function(response){
                var triples = response.data.triples;
                var settings = Config.getSettings();
                var graph = settings[settings[graphName]["sd:graph"]];

                if(graph["dcterms:issued"]== undefined)
                    graph["dcterms:issued"] = [Helpers.getCurrentDate()];
                graph["void:triples"] = [triples];

                return Config.write();

            });
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
        addSimpleGraph :addSimpleGraph,
        getAccessModes: getAccessModes,
        getPublicAccessModes: getPublicAccessModes,
        getNoAccessMode: getNoAccessMode,
        // these are new duplicated
        getNamedGraphCS: getNamedGraphCS,
        getUserGraphs: getUserGraphs,
        publish:publish,
        addContribution:addContribution
    };

});