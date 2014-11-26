'use strict';

var module = angular.module('app.configuration-service', []);

module.factory('ConfigurationService', function ($q, Config, $http, $location, flash, Helpers, ServerErrorResponse, Ns) {
    
    var SettingsService = {
        getConfiguration : function(){
            return $http.get("rest/config");
        },

        getSettings : function(){
            if(Config.getDefaultSettingsGraph() == undefined){
                return $http.get("rest/config").then(
                    function (response) {
                        Config.setFrameworkUri(response.data.frameworkUri);
                        Config.setNS(response.data.ns);
                        Config.setDefaultSettingsGraph(response.data.defaultSettingsGraphUri);
                        Config.setSettingsGraph(response.data.defaultSettingsGraphUri);
                        Config.setGroupsGraph(response.data.groupsGraphUri);
                        Config.setFrameworkOntologyNS(response.data.frameworkOntologyNs);
                        Config.setAccountsGraph(response.data.accountsGraph);
                        Config.setEndpoint(response.data.sparqlEndpoint);
                        Config.setAuthEndpoint(response.data.authSparqlEndpoint);
                        Config.setFlagPath(response.data.flagPath);
                        Ns.getAllNamespaces                        
                        Ns.add(":", Config.getNS());
                        return Config.read();
                    }, function(response){
                        var message = ServerErrorResponse.getMessage(response);
                        flash.error = message;
                    })
            } 
            else
                return Config.read();
        },
        
        setup: function(reset){
            console.log("setup reset: " + reset);
            if(reset)
                return $http.post('rest/setup').success(function(data){
                    flash.success = data;   
                });
            else
                return $http.put('rest/setup').success(function(data){
                    flash.success = data;
                });
        },

        setSPARQLEndpoint: function (endpoint) {
            Config.setEndpoint(endpoint);
        },

        getSPARQLEndpoint: function () {
            return Config.getAuthEndpoint();
        },

        getPublicSPARQLEndpoint: function () {
            return Config.getEndpoint();
        },

        getFrameworkUri: function () {
            return Config.getFrameworkUri();
        },
        
        getFlagPath: function () {
            return Config.getFlagPath();
        },

        setUriBase: function (uri) {
            Config.setNS(uri);
        },

        getUriBase: function () {
            return Config.getNS();
        },

        getFrameworkOntologyNS: function() {
            return Config.getFrameworkOntologyNS();
        },

        getDefaultSettingsGraph: function () {
            return Config.getDefaultSettingsGraph();
        },

        getSettingsGraph: function () {
            return Config.getSettingsGraph();
        },

        setSettingsGraph: function (uri) {
            Config.setSettingsGraph(uri);
        },

        restoreDefaultSettingsGraph: function () {
            Config.restoreDefault();
        },

        deleteResource: function (uri) {
            var settings = Config.getSettings();
            delete settings[uri];
            Config.write();
            return true;
        },

        getResourcesType: function (type) {
            var results = [];
            var elements = Config.select("rdf:type", type);
            for (var resource in elements) {
                var element = elements[resource];
                results.push(this.elementToJson(resource, element));
            }
            return results;
        },

        getIdentifiers: function () {
            return Object.keys(Config.getSettings());  
        },

        getDatabaseTypes: function () {
            var results = [];
            var elements = Config.select("rdf:type", "gkg:DatabaseType");
            for (var resource in elements) {
                var element = elements[resource];
                results.push({
                    uri: resource,
                    label: element["rdfs:label"][0]
                });
            }
            return results;
        },

        // TODO: improve the function the will replace all the json object building
        // but this may be easier to do on the config.js since there we know the propertyTypes
        elementToJson: function (resource, element) {
            //create the json string
            var jsonStr = '{ "uri" : "' + resource + '", ';
            if (typeof element == "object") { // do not consider arrays
                for (var prop in element)
                    if (element[prop].length == 1)
                        jsonStr += ' "' + prop.substring(prop.indexOf(':') + 1, prop.length) + '" : "' + element[prop][0] + '",';
                    //else make recursive
            }
            jsonStr += '}';
            // convert the json string into a object
            var results = eval("(" + jsonStr + ")");
            return results;
        },

        /**
         * Data Sources Endpoint functions
         */
        getAllEndpoints: function () {
            var results = [];
            var elements = Config.select("rdf:type", "gkg:SPARQLEndpoint");
            for (var resource in elements) {
                var element = elements[resource];
                if(element["rdfs:label"]== undefined) continue;
                results.push({
                    uri: resource,
                    label: element["rdfs:label"][0],
                    endpoint: element["void:sparqlEndpoint"][0],
                    homepage: element["foaf:homepage"] == undefined ? "" : element["foaf:homepage"][0]
                });
            }
            return results;
        },

        getEndpoint: function (uri) {
            var settings = Config.getSettings();
            var results = {
                uri: uri,
                label: settings[uri]["rdfs:label"][0],
                endpoint: settings[uri]["void:sparqlEndpoint"][0],
                homepage: settings[uri]["foaf:homepage"] == undefined ? "" : settings[uri]["foaf:homepage"][0]
            };
            return results;
        },

        addEndpoint: function (endpoint) {
            var settings = Config.getSettings();
            settings[endpoint.uri] = {
                "rdfs:label": [endpoint.label],
                "foaf:homepage": [endpoint.homepage],
                "rdf:type": ["void:Dataset", "gkg:SPARQLEndpoint", "gkg:DataSource"],
                "void:sparqlEndpoint": [endpoint.endpoint]
            };
            Config.write();
            return true;
        },

        updateEndpoint: function (pEndpoint) {
            var endpoint = Config.getSettings()[pEndpoint.uri];
            endpoint["rdfs:label"][0] = pEndpoint.label;
            endpoint["void:sparqlEndpoint"][0] = pEndpoint.endpoint;
            endpoint["foaf:homepage"][0] = pEndpoint.homepage;
            Config.write();
            return true;
        },

        /**
         * Data Sources Database functions
         */
        getAllDatabases: function () {
            var results = [];
            var elements = Config.select("rdf:type", "gkg:Database");
            for (var resource in elements) {
                var element = elements[resource];
                // var typeLabel = Config.getSettings()[element["gkg:dbType"][0]]["rdfs:label"];
                var type = Config.getSettings()[element["gkg:dbType"][0]];

                if (type != undefined)
                    type = type["rdfs:label"][0];
                results.push({
                    uri: resource,
                    label: element["rdfs:label"][0],
                    dbHost: element["gkg:dbHost"][0],
                    dbName: element["gkg:dbName"][0],
                    dbUser: element["gkg:dbUser"][0],
                    dbPort: element["gkg:dbPort"][0],
                    dbType: type,
                    dbPassword: element["gkg:dbPassword"][0]
                });
            }
            return results;
        },

        getDatabase: function (uri) {
            var settings = Config.getSettings();
            var results = {
                uri: uri,
                label: settings[uri]["rdfs:label"][0],
                dbHost: settings[uri]["gkg:dbHost"][0],
                dbName: settings[uri]["gkg:dbName"][0],
                dbPort: settings[uri]["gkg:dbPort"][0],
                dbType: settings[uri]["gkg:dbType"][0],
                dbUser: settings[uri]["gkg:dbUser"][0],
                dbPassword: settings[uri]["gkg:dbPassword"][0]
            };
            return results;
        },

        addDatabase: function (database) {
            var settings = Config.getSettings();
            settings[database.uri] = {
                "rdfs:label": [database.label],
                "gkg:dbHost": [database.dbHost],
                "rdf:type": ["void:Dataset", "gkg:Database", "gkg:DataSource"],
                "gkg:dbPort": [database.dbPort],
                "gkg:dbName": [database.dbName],
                "gkg:dbType": [database.dbType],
                "gkg:dbUser": [database.dbUser],
                "gkg:dbPassword": [database.dbPassword]
            };
            Config.write();
            return true;
        },

        updateDatabase: function (pDatabase) {
            var database = Config.getSettings()[pDatabase.uri];
            database["rdfs:label"][0] = pDatabase.label;
            database["gkg:dbHost"][0] = pDatabase.dbHost;
            database["gkg:dbType"][0] = pDatabase.dbType;
            database["gkg:dbPort"][0] = pDatabase.dbPort;
            database["gkg:dbName"][0] = pDatabase.dbName;
            database["gkg:dbUser"][0] = pDatabase.dbUser;
            database["gkg:dbPassword"][0] = pDatabase.dbPassword;
            Config.write();
            return true;
        },

        /**
         * COMPONENTS functions
         */
        // TODO: @Alejandra add categories to the ontology and get them with the config service
        getComponentCategories: function () {
            return {
                categories: [{
                    name: "Extraction and Loading",
                    id: "extraction-and-loading"
                }, {
                    name: "Querying and Exploration",
                    id: "querying-and-exploration"
                }, {
                    name: "Authoring",
                    id: "authoring"
                }, {
                    name: "Linking",
                    id: "linking"
                }, {
                    name: "Enriching and Data Cleaning",
                    id: "enriching-and-cleaning"
                }]
            };
        },

        getComponent: function (uri) {
            var component = Config.getSettings()[uri];
            var results = this.elementToJson(uri, component);
            return results;
        },

        getComponentServices: function (uri, serviceType) {
            var settings = Config.getSettings();
            var elements = settings[uri]["lds:providesService"];

            var results = [];
            for (var resource in elements) {
                var element = elements[resource];
                var res = resource;

                // TODO: get a new version of config.js to provide also blanc nodes as URIS
                // if element is an string is an URI, otherwise is a nested node (blanc)
                if (typeof element == "string") {
                    res = element;
                    element = settings[element];
                }

                if (typeof serviceType != "undefined" && element["rdf:type"].indexOf(serviceType) === -1)
                    continue; // not of the required type

                var service = this.elementToJson(res, element);
                // check if the serviice is online 
                // console.log(service);
                // $http.get(service.serviceUrl).then( function(response) {
                //     service.offline = false;
                //     results.push(service);
                // }, function(response) {
                //     service.offline = true;
                //     results.push(service);
                // });
                results.push(service);
                
            }
            return results;
        },

        getAllComponents: function () {
            var results = [];
            var elements = Config.select("rdf:type", "lds:StackComponent");
            for (var resource in elements) {
                var element = elements[resource];
                results.push(this.elementToJson(resource, element));
            }
            return results;
        },

        getAllServices: function() {
            var results = [];
            var components = this.getAllComponents();
            for (var ind in components) {
                var services = this.getComponentServices(components[ind].uri);
                for (var sind in services) {
                    results.push(services[sind]);
                }
            }
            return results;
        },

        getService: function (uri) {
            var service = Config.getSettings()[uri];
            var results = this.elementToJson(uri, service);
            return results;
        },

        getRequiredServices: function(url) {
            var routeRestrictions = Config.select("rdf:type", "gkg:RouteRestriction");
            for (var ind in routeRestrictions) {
                if (routeRestrictions[ind]["gkg:partialUrl"] == url) {
                    return routeRestrictions[ind]["gkg:requiredService"];
                }
            }
            return null;
        }

    };
    return SettingsService;
});