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
.factory("Config", function($rootScope, $q, $http, flash, AccountService, ServerErrorResponse, Helpers){
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";

    var FRAMEWORK_URI;
    var FLAG_PATH;
    var NS;
    var DEFAULT_SETTINGS_GRAPH_URI;
    var GROUPS_GRAPH_URI;
    var FRAMEWORK_ONTOLOGY_NS;
    var ACCOUNTS_GRAPH;

    var AUTH_ENDPOINT;
    var PUBLIC_ENDPOINT;
    var SETTINGS_GRAPH_URI;
    var GRAPH;

    // a variable to lookup by prefix
    var prefixes;
    var EOL      = "\n";
    var PREFIXES = "";   
    var settings = {};

    var namespaces =
    {
        "http://dbpedia.org/resource/"                     : "dbpedia:",
        "http://purl.org/dc/elements/1.1/"                 : "dc:",
        "http://purl.org/dc/terms/"                        : "dcterms:",
        "http://xmlns.com/foaf/0.1/"                       : "foaf:",
        "http://stack.linkeddata.org/ldis-schema/"   	   : "lds:",
        "http://ldiw.ontos.com/ontology/"                  : "gkg:",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#"      : "rdf:",
        "http://www.w3.org/2000/01/rdf-schema#"            : "rdfs:",
        "http://www.w3.org/ns/sparql-service-description#" : "sd:",
        "http://rdfs.org/ns/void#"                         : "void:",
        "http://www.w3.org/ns/auth/acl#"                   : "acl:"
    };
    
    var buildPrefixesString = function(){
        for (var namespace in namespaces)
            PREFIXES += "PREFIX " + namespaces[namespace] + " <" + namespace + ">" + EOL;
        prefixes = Helpers.invertMap(namespaces);
    };

    var request = function(url, data, callbackSuccess){
        var deferred = $q.defer();

        $http.post(url, $.param(data))
        .success(function(data)
        {
            try{
                deferred.resolve(callbackSuccess ? callbackSuccess(data) : data.results.bindings[0]["callret-0"].value);
            }
            catch (e){
                // a problem with the callback
                console.log(e);
                flash.error = e.message;
                deferred.reject(e);
            }
        })
        .error(function(data, status){
            var message = ServerErrorResponse.getMessage(status);
            flash.error = message;
            deferred.reject(message);
        });

        return deferred.promise;
    };

    // Replaces the long name space by the prefix
    var ns = function(v){
        var value = v.value==undefined ? v : v.value;

        if (!v.type || v.type == "uri")
        {
            var namespace = /.*[#\/]/.exec(value);
            if (namespace)
            {
                var prefix = namespaces[namespace = namespace[0]];
                if (prefix)
                   return prefix + value.slice(namespace.length);
            }
        }

        return value;
    };

    var isUri = function (v){
        if (/^:/.test(v))
            return true;
        else if(/^\w*:/.test(v)){
            if( prefixes[v.substr(0, v.indexOf(':')+1)] != undefined )
                return true;
        }
        return false;
    }

    var getFrameworkUri = function()
    {
        return ns(FRAMEWORK_URI);
    };

    var setFrameworkUri = function(framework_uri)
    {
        FRAMEWORK_URI = framework_uri;
        console.log(FRAMEWORK_URI);

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
        return DEFAULT_SETTINGS_GRAPH_URI;
    };

    var setDefaultSettingsGraph = function(default_settings_graph_uri)
    {
        DEFAULT_SETTINGS_GRAPH_URI = default_settings_graph_uri;
    };

    var getGraph = function()
    {
        return SETTINGS_GRAPH_URI;
    };

    var setGraph = function(uri) {
        SETTINGS_GRAPH_URI = uri;
        GRAPH = "<" + SETTINGS_GRAPH_URI + ">";
    };

    var restoreDefault = function() {
        return setGraph(DEFAULT_SETTINGS_GRAPH_URI);
    };

    var getSettings = function()
    {
        return settings;
    };

    var select = function(property, value)
    {
        property = ns(property);
        value    = ns(value);

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
            triples.push([ ns(binding.s), ns(binding.p), ns(binding.o) ]);
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


    var read = function(graph)
    {
        var deferred = $q.defer();
        var requestData = {
            format: "application/sparql-results+json",
            query: "SELECT * FROM <" + graph + ">"+ EOL
                    + "WHERE { ?s ?p ?o }" + EOL
                    + "ORDER BY ?s ?p ?o",
            mode: "settings"
        };

        console.log("readSettings from " + graph);

        $http.post("RdfStoreProxy", $.param(requestData)).then(function (response) {
            settings = parseSparqlResults(response.data);
            deferred.resolve(settings);
        });

        return deferred.promise;
    };

    var write = function()
    {
        var wrap = function(s)
        {
            // TODO: we have also to validate the datatype!
            return /^https?:\/\//.test(s) ? "<" + s + ">" : isUri(s) || /^_:b/.test(s) ? s : '"' + s + '"';
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
            query: PREFIXES
                    + "DROP SILENT GRAPH "   + GRAPH + EOL
                    + "CREATE SILENT GRAPH " + GRAPH + EOL
                    + "INSERT INTO " + GRAPH + EOL
                    + "{" + EOL
                    +        data
                    + "}",
            mode: "settings"
        };
        return request("RdfStoreProxy", requestData);
    };

    var dropGraph = function(name)
    {
        var requestData = {
            format: "application/sparql-results+json",
            mode: "drop",
            graph: name,
            username: AccountService.getUsername()
        }
        return request("GraphManagerServlet", requestData);
    };

    var getGroupsGraph = function() {
        return GROUPS_GRAPH_URI;
    };

    var setGroupsGraph = function(groups_graph_uri) {
        GROUPS_GRAPH_URI = groups_graph_uri;
    };

    var setGroupsGraph = function(groups_graph_uri) {
        GROUPS_GRAPH_URI = groups_graph_uri;
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
        PREFIXES                : PREFIXES,
        namespaces              : namespaces,
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
        getGraph                : getGraph,
        setGraph                : setGraph,
        getGroupsGraph          : getGroupsGraph,
        setGroupsGraph          : setGroupsGraph,
        getFrameworkUri         : getFrameworkUri,
        setFrameworkUri         : setFrameworkUri,
        getFrameworkOntologyNS  : getFrameworkOntologyNS,
        setFrameworkOntologyNS  : setFrameworkOntologyNS,
        getAccountsGraph        : getAccountsGraph,
        setAccountsGraph        : setAccountsGraph,
        restoreDefault          : restoreDefault,
        getSettings             : getSettings,
        select                  : select,
        write                   : write,
        read                    : read,
        request                 : request,
        dropGraph               : dropGraph,
        parseSparqlResults      : parseSparqlResults,
        buildPrefixesString     : buildPrefixesString
    };
});