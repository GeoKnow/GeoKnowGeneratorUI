/**
 * GeoKnow Generator
 *    Configuration management
 *
 * @author Vadim Zaslawski
 *
 * enable SPARQL Update
 * ISQL:
 *   GRANT SPARQL_UPDATE TO "SPARQL"
 *   GRANT EXECUTE ON DB.DBA.L_O_LOOK TO "SPARQL"
 *
 * enable CORS
 *
 * usage:
 *   setEndpoint(url)          - set SPARQL endpoint, should be called initially
 *   getEndpoint()             - get SPARQL endpoint
 *   getNS()                   - get base namespace
 *   getGraph()                - get graph name
 *   read()                    - load settings
 *   getSettings()             - get loaded settings
 *   write()                   - save settings after editing getSettings() result
 *   select(property, value)   - select settings, e.g.: select("rdf:type", "lds:StackComponent")
 *   createGraph(name)         - create graph
 *   dropGraph(name)           - delete graph
 */

// TODO handle shared blank nodes

"use strict";

angular.module("app.configuration", [])
.factory("Config", function($rootScope, $q, $http, flash, ServerErrorResponse, Helpers, Ns){
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";

    var FRAMEWORK_URI;
    var FLAG_PATH;
    var NS;
    var DEFAULT_SETTINGS_GRAPH;
    var GROUPS_GRAPH;
    var FRAMEWORK_ONTOLOGY_NS;
    var ACCOUNTS_GRAPH;

    var AUTH_ENDPOINT;
    var PUBLIC_ENDPOINT;
    var SETTINGS_GRAPH;

    var EOL      = "\n";
    var settings = {};

    var request = function(url, data, callbackSuccess){
        var deferred = $q.defer();
        $http.post(url, $.param(data))
        .then(
            // success
            function(response){
                try{
                    deferred.resolve(callbackSuccess ? callbackSuccess(response.data) : response.data.results.bindings[0]["callret-0"].value);
                }
                catch (e){
                    // a problem with the callback
                    console.log(e);
                    flash.error = e.message;
                    deferred.reject(e);
                }
            }, 
            // error
            function(response){
                var message = ServerErrorResponse.getMessage(response);
                flash.error = message;
                deferred.reject(message);
            });
        return deferred.promise;
    };

    var getFrameworkUri = function()
    {
        return Ns.shorten(FRAMEWORK_URI);
    };

    var setFrameworkUri = function(framework_uri)
    {
        FRAMEWORK_URI = framework_uri;
    };

    var getFlagPath = function()
    {
        return FLAG_PATH;
    };

    var setFlagPath = function(flag_path)
    {
        FLAG_PATH = flag_path;
    };

    var setNS = function(ns)
    {
        NS = ns;
    };

    var getNS = function()
    {
        return NS;
    };

    var getEndpoint = function()
    {
        return PUBLIC_ENDPOINT;
    };

    var setEndpoint = function(public_endpoint)
    {
        PUBLIC_ENDPOINT = public_endpoint;
    };

    var getAuthEndpoint = function()
    {
        return AUTH_ENDPOINT;
    };

    var setAuthEndpoint = function(auth_endpoint)
    {
        AUTH_ENDPOINT =auth_endpoint;
    };

    var getDefaultSettingsGraph = function()
    {
        return DEFAULT_SETTINGS_GRAPH;
    };

    var setDefaultSettingsGraph = function(default_settings_graph)
    {
        DEFAULT_SETTINGS_GRAPH = default_settings_graph;
    };

    var getSettingsGraph = function()
    {
        return SETTINGS_GRAPH;
    };

    var setSettingsGraph = function(uri) {
        SETTINGS_GRAPH = uri;
        // update settings with new graph
        read();
    };

    var restoreDefault = function() {
        return setSettingsGraph(DEFAULT_SETTINGS_GRAPH);
    };

    var getSettings = function()
    {
        return settings;
    };

    var select = function(property, value)
    {
        property = Ns.shorten(property);
        value    = Ns.shorten(value);

        var elements = {};
        var resource;

        var walk = function(element)
        {
            for (var key in element)
            {
                var prop = element[key];
                if (prop)
                    if (key == property)
                        for (var i in prop)
                        {
                            var val = prop[i];
                            if (val == value)
                            {
                                elements[resource] = element;
                                break;
                            }
                        }
                    else
                        for (var i in prop)
                        {
                            var val = prop[i];
                            if (typeof val === "object")
                                walk(val);
                        }
            }
        };

        for (resource in settings)
            walk(settings[resource]);

        return elements;
    };

    var parseSparqlResults = function(data) {
        var bindings = data.results.bindings;
        var triples  = [];

        for (var i in bindings)
        {
            var binding = bindings[i];
            triples.push([ Ns.shorten(binding.s), Ns.shorten(binding.p), Ns.shorten(binding.o) ]);
        }

        var result = {};

        var bnodes = {};

        for (var i in triples)
        {
            var triple = triples[i],
                s = triple[0],
                p = triple[1],
                o = triple[2];

            if (/^nodeID:\/\//.test(s))
            {
                var id  = s.slice(9),
                map = bnodes[id] = bnodes[id] || {};
            }
            else
            {
                var map = result[s] || (result[s] = {});
            }

            if (/^nodeID:\/\//.test(o))
            {
                var id = o.slice(9);
                o = bnodes[id] = bnodes[id] || {};
            }

            (map[p] || (map[p] = [])).push(o);
        }

        return result;
    };


    var read = function()
    {
        var requestData = {
            format: "application/sparql-results+json",
            query: "SELECT * FROM <" + SETTINGS_GRAPH + ">"+ EOL
                    + "WHERE { ?s ?p ?o }" + EOL
                    + "ORDER BY ?s ?p ?o",
            mode: "settings"
        };

        return $http.post("RdfStoreProxy", $.param(requestData)).then(function (response) {
            settings = parseSparqlResults(response.data);
            console.log(settings);
            return settings;
        });

    };

    var write = function()
    {
        var PREFIXES = [];   
    
        var wrap = function(s)
        {
            if(/^https?:\/\//.test(s))
                return "<" + s + ">";
            else if(/^_:b/.test(s))
                return s;
            else if(Ns.isUri(s)){
                // get the prefix for the query
                var p = s.substr(0, s.indexOf(':'));
                p = (p == "" ? ":" : p);
                if(PREFIXES.indexOf(p) == -1) 
                    PREFIXES.push(p);
                return s;
            }
            else
            // TODO: we have also to validate the datatype!
                return '"' + s + '"';
        };

        var data = "",
            bnodeIndex = 0;

        var walk = function(s, map)
        {
            for (var p in map)
            {
                var arr = map[p];
                for (var i in arr)
                {
                    var o = arr[i];
                    if (typeof o === "string")
                        data += wrap(s) + " " + wrap(p) + " " + wrap(o) + " ." + EOL;
                    else
                    {
                        var bnode = "_:b" + ++bnodeIndex;
                        data += wrap(s) + " " + wrap(p) + " " + bnode + " ." + EOL;
                        walk(bnode, o);
                    }
                }
            }
        };

        for (var s in settings)
            walk(s, settings[s]);

        var requestData = {
            format: "application/sparql-results+json",
            query: Ns.getQueryPrefixes(PREFIXES) + EOL
                    + "DROP SILENT GRAPH <"   + SETTINGS_GRAPH + ">" + EOL
                    + "CREATE SILENT GRAPH <" + SETTINGS_GRAPH + ">" + EOL
                    + "INSERT INTO <" + SETTINGS_GRAPH + ">" + EOL
                    + "{" + EOL
                    +        data
                    + "}",
            mode: "settings"
        };

        return $http.post("RdfStoreProxy", $.param(requestData)).then(function (response) {
            return response;
        });

    };

    var getGroupsGraph = function() {
        return GROUPS_GRAPH;
    };

    var setGroupsGraph = function(groups_graph) {
        GROUPS_GRAPH = groups_graph;
    };

    var setGroupsGraph = function(groups_graph) {
        GROUPS_GRAPH = groups_graph;
    };

    var getFrameworkOntologyNS = function() {
        return FRAMEWORK_ONTOLOGY_NS;
    };

    var setFrameworkOntologyNS = function(framework_ontology_ns) {
        FRAMEWORK_ONTOLOGY_NS = framework_ontology_ns;
    };

    var getAccountsGraph = function() {
        return ACCOUNTS_GRAPH;
    };

    var setAccountsGraph = function(accounts_graph) {
        ACCOUNTS_GRAPH = accounts_graph;
    };
    
    return {
        getNS                   : getNS,
        setNS                   : setNS,
        getFlagPath             : getFlagPath,
        setFlagPath             : setFlagPath,
        getEndpoint             : getEndpoint,
        setEndpoint             : setEndpoint,
        getAuthEndpoint         : getAuthEndpoint,
        setAuthEndpoint         : setAuthEndpoint,
        getDefaultSettingsGraph : getDefaultSettingsGraph,
        setDefaultSettingsGraph : setDefaultSettingsGraph,
        getGroupsGraph          : getGroupsGraph,
        setGroupsGraph          : setGroupsGraph,
        getFrameworkUri         : getFrameworkUri,
        setFrameworkUri         : setFrameworkUri,
        getFrameworkOntologyNS  : getFrameworkOntologyNS,
        setFrameworkOntologyNS  : setFrameworkOntologyNS,
        getAccountsGraph        : getAccountsGraph,
        setAccountsGraph        : setAccountsGraph,
        restoreDefault          : restoreDefault,
        setSettingsGraph        : setSettingsGraph,
        getSettingsGraph        : getSettingsGraph,
        getSettings             : getSettings,
        select                  : select,
        write                   : write,
        read                    : read,
        request                 : request,
        parseSparqlResults      : parseSparqlResults
    };
});