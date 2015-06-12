'use strict';

var module = angular.module('app.configuration-service', []);

module.factory('ConfigurationService', function ($q, Config, $http, $location, flash, Helpers, ServerErrorResponse, Ns) {
    
    var FRAMEWORK_HOMEPAGE;
    var SettingsService = {
        getConfiguration : function(){
            return $http.get("rest/config");
        },
        getSettings : function(userAccount){
            var defer = $q.defer();
            if(Config.getSettingsGraph() == undefined){
                $http.get("rest/config").then(
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
                        Config.setSpringBatchUri(response.data.springBatchUri);
                        FRAMEWORK_HOMEPAGE = response.data.homepage;
                        Ns.getAllNamespaces                        
                        Ns.add(":", Config.getNS());
                        Config.read().then(function(settings){
                            defer.resolve(settings);
                        }, function(response){
                            flash.error = ServerErrorResponse.getMessage(response);
                        });

                    }, function(response){
                        flash.error = ServerErrorResponse.getMessage(response);
                    	})
                }else{
                	
                	Config.read().then(function(response){
                        defer.resolve(response);    
                    });
                }
             return defer.promise;
        },
        
        setup: function(reset){
            console.log("setup reset: " + reset);
            if(reset)
                return $http.post('rest/config').success(function(data){
                    flash.success = data;   
                });
            else
                return $http.put('rest/config').success(function(data){
                    flash.success = data;
                });
        },

        getMeta : function(){
            return { 
                uri : Config.getFrameworkUri(), 
                label : "GeoKnow Generator Workbench",
                homepage : FRAMEWORK_HOMEPAGE,
                version : "1.5.0"};
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

        getFrameworkHomepage: function () {
            return FRAMEWORK_HOMEPAGE;
        },
        
        getFlagPath: function () {
            return Config.getFlagPath();
        },
        
        getSpringBatchUri: function () {
            return Config.getSpringBatchUri();
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

        getWorkbenchServices : function(){
            return $http.get("rest/config/services").then( 
                // success
                function (response){
                    return response.data.services;
            }); 
        },
        getWorkbenchService : function(uri){
            return $http.get("rest/config/services/"+uri).then( 
                // success
                function (response){
                    return response.data.service;
            }); 
        },

        getIntegratedComponents :function(){
            return $http.get("rest/config/components").then( 
                // success
                function (response){
                    return response.data;
            }); 
        },

        integrateComponent :function(uri){
            return $http.post("rest/config/components/"+uri); 
        },

        removeComponent :function(uri){
            return $http.delete("rest/config/components/"+uri); 
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

        // This is for validating unique identifiers directive, 
        // it can still be imporved when REST best practices are implemented
        resourceExists : function(uri){
            return $http.get("rest/config/exists/"+uri).then( 
                // success
                function (response){
                    return response.data.response;
            }); 
        },

        getIdentifiers: function () {
            return Object.keys(Config.getSettings());  
        },

        getDatabaseTypes: function () {
            var results = [];
            var elements = Config.select("rdf:type", "ontos:DatabaseType");
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
            var elements = Config.select("rdf:type", "ontos:SPARQLEndpoint");
            
            for (var resource in elements) {
                var element = elements[resource];
                if(element["rdfs:label"]== undefined) continue;

                var lendpoint = element["void:sparqlEndpoint"][0]
                if(resource==":VirtuosoAuthSPARQLEndpoint")
                    lendpoint = Config.getAuthEndpoint();
                else if(resource==":VirtuosoEndpoint")
                    lendpoint = Config.getEndpoint();
                results.push({
                    uri: resource,
                    label: element["rdfs:label"][0],
                    endpoint: lendpoint,
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
                "rdf:type": ["void:Dataset", "ontos:SPARQLEndpoint", "ontos:DataSource"],
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
            var elements = Config.select("rdf:type", "ontos:Database");
            for (var resource in elements) {
                var element = elements[resource];
                // var typeLabel = Config.getSettings()[element["ontos:dbType"][0]]["rdfs:label"];
                var type = Config.getSettings()[element["ontos:dbType"][0]];

                if (type != undefined)
                    type = type["rdfs:label"][0];
                results.push({
                    uri: resource,
                    label: element["rdfs:label"][0],
                    dbHost: element["ontos:dbHost"][0],
                    dbName: element["ontos:dbName"][0],
                    dbUser: element["ontos:dbUser"][0],
                    dbPort: element["ontos:dbPort"][0],
                    dbType: type,
                    dbPassword: element["ontos:dbPassword"][0]
                });
            }
            return results;
        },

        getDatabase: function (uri) {
            var settings = Config.getSettings();
            var results = {
                uri: uri,
                label: settings[uri]["rdfs:label"][0],
                dbHost: settings[uri]["ontos:dbHost"][0],
                dbName: settings[uri]["ontos:dbName"][0],
                dbPort: settings[uri]["ontos:dbPort"][0],
                dbType: settings[uri]["ontos:dbType"][0],
                dbUser: settings[uri]["ontos:dbUser"][0],
                dbPassword: settings[uri]["ontos:dbPassword"][0]
            };
            return results;
        },

        addDatabase: function (database) {
            var settings = Config.getSettings();
            settings[database.uri] = {
                "rdfs:label": [database.label],
                "ontos:dbHost": [database.dbHost],
                "rdf:type": ["void:Dataset", "ontos:Database", "ontos:DataSource"],
                "ontos:dbPort": [database.dbPort],
                "ontos:dbName": [database.dbName],
                "ontos:dbType": [database.dbType],
                "ontos:dbUser": [database.dbUser],
                "ontos:dbPassword": [database.dbPassword]
            };
            Config.write();
            return true;
        },

        updateDatabase: function (pDatabase) {
            var database = Config.getSettings()[pDatabase.uri];
            database["rdfs:label"][0] = pDatabase.label;
            database["ontos:dbHost"][0] = pDatabase.dbHost;
            database["ontos:dbType"][0] = pDatabase.dbType;
            database["ontos:dbPort"][0] = pDatabase.dbPort;
            database["ontos:dbName"][0] = pDatabase.dbName;
            database["ontos:dbUser"][0] = pDatabase.dbUser;
            database["ontos:dbPassword"][0] = pDatabase.dbPassword;
            Config.write();
            return true;
        },

        /**
         * functions for managing csv data sources
         */
        getAllCsvSources: function () {
            var results = [];
            var elements = Config.select("rdf:type", "ontos:CsvFile");
            for (var resource in elements) {
                var element = elements[resource];
               
                results.push({
                    uri: resource,
                    label: element["rdfs:label"][0],
                    url: element["ontos:csvUrl"][0]
                });
            }
            return results;
        },
        getCsvSource: function (uri) {
            var settings = Config.getSettings();
            var results = {
                uri: uri,
                label: settings[uri]["rdfs:label"][0],
                url: settings[uri]["ontos:csvUrl"][0]
            };
            return results;
        },
        addCsvSource: function(csv){
        	
        	var settings = Config.getSettings();
        	settings[csv.uri]={
        			"rdfs:label": [csv.label],
        			"rdf:type": ["ontos:CsvFile", "ontos:DataSource"],
        			"ontos:csvUrl": [csv.url]
        			
        	},
        	Config.write();
            return true;
        	
        },
        
        updateCsvSource: function(csv){
        	
        	var csvsource = Config.getSettings()[csv.uri];
        	csvsource["rdfs:label"][0]=csv.label;
        	csvsource["ontos:csvUrl"][0]=csv.url;
        	 Config.write();
             return true;
        },
        
        
        /**
         * functions for managing license sources
         */
        getAllLicenseSources: function () {
            var results = [];
            var elements = Config.select("rdf:type", "dcterms:LicenseDocument");
            for (var resource in elements) {
                var element = elements[resource];
               
                results.push({
                    uri: resource,
                    label: element["rdfs:label"][0],
                    url: element["ontos:licenseUrl"][0]
                });
            }
            return results;
        },
        getLicenseSource: function (uri) {
            var settings = Config.getSettings();
            var results = {
                uri: uri,
                label: settings[uri]["rdfs:label"][0],
                url: settings[uri]["ontos:licenseUrl"][0]
            };
            return results;
        },
        addLicenseSource: function(license){
        	
        	var settings = Config.getSettings();
        	settings[license.uri]={
        			"rdfs:label": [license.label],
        			"rdf:type": ["dcterms:LicenseDocument"],
        			"ontos:licenseUrl": [license.url]
        			
        	},
        	Config.write();
            return true;
        	
        },
        
        updateLicenseSource: function(license){
        	
        	var licenseSource = Config.getSettings()[license.uri];
        	licenseSource["rdfs:label"][0]=license.label;
        	licenseSource["ontos:licenseUrl"][0]=license.url;
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

        getRequiredServices: function(url) {
            var routeRestrictions = Config.select("rdf:type", "ontos:RouteRestriction");
            for (var ind in routeRestrictions) {
                if (routeRestrictions[ind]["ontos:route"] == url) {
                    return routeRestrictions[ind]["ontos:requiredService"];
                }
            }
            return null;
        }

    };
    return SettingsService;
});