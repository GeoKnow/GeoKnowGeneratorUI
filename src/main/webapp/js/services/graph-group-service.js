'use strict';

var module = angular.module('app.graph-group-service', []);

module.factory("GraphGroupService", function ($http, $q, Config, AccountService) {
    var GRAPH_URI = Config.getGroupsGraph();
    var GRAPH = "<" + GRAPH_URI + ">";

    var graphGroups = {};
    var graphGroupsLoaded = false;

    var readGraphGroups = function (reload) {
        if (graphGroupsLoaded && !reload) {
            var deferred = $q.defer();
            deferred.resolve(graphGroups);
            return deferred.promise;
        } else {
            var requestData = {
                format: "application/sparql-results+json",
                query: "SELECT * FROM " + GRAPH + " WHERE { ?s ?p ?o } ORDER BY ?s ?p ?o",
                mode: "settings"
            };
            return $http.post("rest/RdfStoreProxy", $.param(requestData)).then(function (response) {
                graphGroups = Config.parseSparqlResults(response.data);
                graphGroupsLoaded = true;
                return graphGroups;
            });
        }
    };

    var getAllGraphGroups = function (reload) {
        return readGraphGroups(reload).then(function (data) {
            var results = [];
            for (var resource in data) {
                var graphGroup = data[resource];
                var res = {
                    name: resource,
                    label: graphGroup["rdfs:label"][0],
                    description: graphGroup["dcterms:description"][0],
                    modified: graphGroup["dcterms:modified"][0],
                    created: graphGroup["dcterms:created"][0],
                    namedGraphs: graphGroup["sd:namedGraph"] != undefined ? graphGroup["sd:namedGraph"] : []
                };
                results.push(res);
            }
            return results;
        });
    };

    var getGraphGroup = function (name) {
        var result = {
            name: name,
            label: graphGroups[name]["rdfs:label"][0],
            description: graphGroups[name]["dcterms:description"][0],
            modified: graphGroups[name]["dcterms:modified"][0],
            created: graphGroups[name]["dcterms:created"][0],
            namedGraphs: graphGroups[name]["sd:namedGraph"] != undefined ? graphGroups[name]["sd:namedGraph"] : []
        };
        return result;
    };

    var addGraphGroup = function (graphGroup) {
        var uri = Config.getNS() + graphGroup.name.replace(':', '');
        var request = {
            group: uri,
            graphs: [],
            username: AccountService.getAccount().getUsername()
        };
        for (var ind in graphGroup.namedGraphs) {
            request.graphs.push(Config.getNS() + graphGroup.namedGraphs[ind].replace(':', ''));
        }
        return $http.post("rest/GraphManagerServlet/createGroup", $.param(request, true))
            .then(function (response) {
                var data = " <" + uri + "> rdf:type sd:GraphCollection ; "
                                       + " rdfs:label \"" + graphGroup.label + "\" ; "
                                       + " dcterms:description \"" + graphGroup.description + "\" ; "
                                       + " dcterms:modified \"" + graphGroup.modified + "\" ; "
                                       + " dcterms:created \"" + graphGroup.created + "\" . "
                for (var ind in graphGroup.namedGraphs) {
                    data = data + " <" + uri + "> sd:namedGraph <" + Config.getNS() + graphGroup.namedGraphs[ind].replace(':', '') + "> . ";
                }
                var query = "PREFIX dcterms: <http://purl.org/dc/terms/> "
                            + " PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "
                            + " PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
                            + " PREFIX sd: <http://www.w3.org/ns/sparql-service-description#> "
                            + "INSERT DATA {GRAPH " + GRAPH + " { " + data + " } } ";
                var requestData = {
                    format: "application/sparql-results+json",
                    query: query,
                    mode: "settings"
                };
                return $http.post("rest/RdfStoreProxy", $.param(requestData));
            });
    };

    var updateGraphGroup = function (graphGroup) {
        var uri = Config.getNS() + graphGroup.name.replace(':', '');
        var request = {
            group: uri,
            graphs: [],
            username: AccountService.getAccount().getUsername()
        };
        for (var ind in graphGroup.namedGraphs) {
            request.graphs.push(Config.getNS() + graphGroup.namedGraphs[ind].replace(':', ''));
        }
        return $http.post("rest/GraphManagerServlet/updateGroup", $.param(request, true))
            .then(function (response) {
                var ngs = "";
                for (var ind in graphGroup.namedGraphs)
                    ngs = ngs + " ?s sd:namedGraph <" + Config.getNS() + graphGroup.namedGraphs[ind].replace(':', '') + "> . ";
                var query = "PREFIX dcterms: <http://purl.org/dc/terms/> " + " PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " + " PREFIX sd: <http://www.w3.org/ns/sparql-service-description#> " + " WITH " + GRAPH + " DELETE { ?s rdfs:label ?label . ?s dcterms:description ?descr . ?s dcterms:modified ?modif . ?s sd:namedGraph ?ng . } " + " INSERT { ?s rdfs:label \"" + graphGroup.label + "\" . ?s dcterms:description \"" + graphGroup.description + "\" . ?s dcterms:modified \"" + graphGroup.modified + "\" . " + ngs + " } " + " WHERE { ?s rdfs:label ?label . ?s dcterms:description ?descr . ?s dcterms:modified ?modif . optional {?s sd:namedGraph ?ng .} FILTER (?s = <" + uri + ">) } "
                var requestData = {
                    format: "application/sparql-results+json",
                    query: query,
                    mode: "settings"
                };
                return $http.post("rest/RdfStoreProxy", $.param(requestData));
            });
    };

    var deleteGraphGroup = function (name) {
        var uri = name.replace(':', Config.getNS());
        var request = {
            group: uri,
            username: AccountService.getAccount().getUsername()
        };
        return $http.post("rest/GraphManagerServlet/dropGroup", $.param(request))
            .then(function (response) {
                var query = "WITH " + GRAPH + " DELETE {?s ?p ?o} WHERE {?s ?p ?o . FILTER (?s = <" + uri + ">) }";
                var requestData = {
                    format: "application/sparql-results+json",
                    query: query,
                    mode: "settings"
                };
                return $http.post("rest/RdfStoreProxy", $.param(requestData));
            });
    };

    return {
        readGraphGroups: readGraphGroups,
        getAllGraphGroups: getAllGraphGroups,
        getGraphGroup: getGraphGroup,
        addGraphGroup: addGraphGroup,
        updateGraphGroup: updateGraphGroup,
        deleteGraphGroup: deleteGraphGroup
    };
});