'use strict';

var module = angular.module('app.documents-service', []);

module.factory("DocumentsService", function($http, $q, Config, Helpers, ConfigurationService) {
    var documentTypes = [
        {value:"customer specification", label:"customer specification"},
        {value:"Generic Specification", label:"Generic Specification"},
        {value:"Project-specific Specification", label:"Project-specific Specification"},
        {value:"other", label:"Other"}
    ];

    var GRAPH = Config.getDocumentsGraph();

    var documents = {};
    var documentsLoaded = false;

    var projects = {};
    var projectsLoaded = false;

    var owners = {};
    var ownersLoaded = false;

    var getDocumentTypes = function() {
        return documentTypes;
    };

    var readDocuments = function() {
        var requestData = {
            format: "application/sparql-results+json",
            query: "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>"
                    + " prefix acc: <" + Config.getDocumentsNS() + ">"
                    + " SELECT ?s ?p ?o FROM <" + GRAPH + "> "
                    + " WHERE {?s ?p ?o . ?s rdf:type acc:AccDocument . FILTER(NOT EXISTS {?s acc:pageNumber ?pn}) } "
                    + " ORDER BY ?s ?p ?o",
            mode: "settings"
        };
        return $http.post("RdfStoreProxy", $.param(requestData)).then(function(response) {
            documents = Config.parseSparqlResults(response.data);
            documentsLoaded = true;
            return documents;
        });
    };

    var reloadDocuments = function() {
        var documentsPromise = readDocuments();
        var projectsPromise = readProjects();
        var ownersPromise = readOwners();
        return $q.all([documentsPromise, projectsPromise, ownersPromise]).then(function(data) {
            return getAllDocuments();
        });
    };

    var getAllDocuments = function() {
        var results = [];
        for (var resource in documents) {
            var res = getDocument(resource);
            results.push(res);
        }
        return results;
    };

    var getDocument = function(uri) {
        var doc = documents[uri];
        var res = {
            uri: uri,
            uuid: doc["acc:uuid"][0],
            accDocumentNumber: doc["acc:accDocumentNumber"][0],
            accDocumentIteration: doc["acc:accDocumentIteration"][0],
            hasProject: [],
            owner: doc["dc:creator"][0],
            documentType: doc["acc:documentType"][0],
            ownerDocumentNumber: doc["acc:ownerDocumentNumber"]==undefined ? null : doc["acc:ownerDocumentNumber"][0],
            ownerDocumentName: doc["acc:ownerDocumentName"]==undefined ? null : doc["acc:ownerDocumentName"][0],
            ownerDocumentRevision: doc["acc:ownerDocumentRevision"]==undefined ? null : doc["acc:ownerDocumentRevision"][0],
            ownerDocumentRevisionData: null,
            isApplicable: doc["acc:isApplicable"][0],
            accDescription: doc["acc:accDescription"]==undefined ? null : doc["acc:accDescription"][0],
            accNote: doc["acc:accNote"]==undefined ? null : doc["acc:accNote"][0],
            uploader: doc["acc:uploader"][0],
            dateUploaded: doc["acc:dateUploaded"][0]
        };
        //dateReceived
        var dr = new Date();
        dr.setTime(Date.parse(doc["acc:dateReceived"][0]));
        res.dateReceived = Helpers.formatDateXsd(dr);
        //ownerDocumentRevisionData
        if (doc["acc:ownerDocumentRevisionData"]!=undefined) {
            var date = new Date();
            date.setTime(Date.parse(doc["acc:ownerDocumentRevisionData"][0]));
            res.ownerDocumentRevisionData = Helpers.formatDateXsd(date);
        }
        //isApplicable
        if (res.isApplicable=="1" || res.isApplicable=="true") res.isApplicable = true;
        else if (res.isApplicable=="0" || res.isApplicable=="false") res.isApplicable = false;
        //hasProject
        for (var ind in doc["acc:hasProject"]) {
            var projUri = doc["acc:hasProject"][ind];
            var proj = {
                uri: projUri,
                number: projects[projUri]["acc:number"][0],
                name: projects[projUri]["acc:name"][0]
            };
            res.hasProject.push(proj);
        }
        return res;
    };

    var deleteDocument = function(id) {
        var services = ConfigurationService.getComponentServices(":DocumentComponent", "lds:AuthoringService");
    	var serviceUrl = services[0].serviceUrl;

        return $http.post(serviceUrl+"/update/deleteDocument?uuid="+id);

//        var query = "prefix acc: <" + Config.getDocumentsNS() + "> WITH <" + GRAPH + "> DELETE {?s ?p ?o} WHERE {?s acc:uuid \"" + id + "\" . ?s ?p ?o .}";
//        var requestData = {
//            format: "application/sparql-results+json",
//            query: query,
//            mode: "settings"
//        };
//        return $http.post("RdfStoreProxy", $.param(requestData));
    };

    var updateDocument = function(document) {
        var hasProjectTriples = "";
        var newProjectTriples = "";
        for (var ind in document.hasProject) {
            var fullProjectUri = document.hasProject[ind].uri.replace("acc:", Config.getDocumentsNS());
            hasProjectTriples += " ?s acc:hasProject <" + fullProjectUri + "> . ";
            if (document.hasProject[ind].created) {
                newProjectTriples += "<" + fullProjectUri + "> rdf:type acc:AccProject . "
                                    + "<" + fullProjectUri + "> acc:number \"" + document.hasProject[ind].number + "\" . "
                                    + "<" + fullProjectUri + "> acc:name \"" + document.hasProject[ind].name + "\" . ";
            }
        }
        var fullOwnerUri = document.owner.uri.replace("acc:", Config.getDocumentsNS());
        var newOwnerTriples = "";
        if (document.owner.created) {
            newOwnerTriples += "<" + fullOwnerUri + "> rdf:type acc:Owner . "
                                + "<" + fullOwnerUri + "> acc:name \"" + document.owner.name + "\" . ";
        }
        var query = "prefix acc: <" + Config.getDocumentsNS() + "> "
                    + " prefix xsd: <http://www.w3.org/2001/XMLSchema#> "
                    + " prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
                    + " WITH <" + GRAPH + "> "
                    + " DELETE {?s acc:accDocumentNumber ?adn . "
                            + " ?s acc:accDocumentIteration ?adi . "
                            + " ?s acc:hasProject ?proj . "
                            + " ?s dc:creator ?owner . "
                            + " ?s acc:documentType ?dt . "
                            + " ?s acc:ownerDocumentNumber ?num . "
                            + " ?s acc:ownerDocumentName ?odn . "
                            + " ?s acc:ownerDocumentRevision ?odr . "
                            + " ?s acc:ownerDocumentRevisionData ?odrd . "
                            + " ?s acc:isApplicable ?a . "
                            + " ?s acc:accDescription ?descr . "
                            + " ?s acc:accNote ?note . "
                            + " ?s acc:dateReceived ?dr .} "
                    + " INSERT {?s acc:accDocumentNumber \"" + document.accDocumentNumber + "\" . "
                            + " ?s acc:accDocumentIteration \"" + document.accDocumentIteration + "\" . "
                            + hasProjectTriples
                            + newProjectTriples
                            + " ?s dc:creator <" + fullOwnerUri + "> . "
                            + newOwnerTriples
                            + " ?s acc:documentType \"" + document.documentType + "\" . "
                            + (!document.ownerDocumentNumber ? "" : " ?s acc:ownerDocumentNumber \"" + document.ownerDocumentNumber + "\" . ")
                            + (!document.ownerDocumentName ? "" : " ?s acc:ownerDocumentName \"" + document.ownerDocumentName + "\" . ")
                            + (!document.ownerDocumentRevision ? "" : " ?s acc:ownerDocumentRevision \"" + document.ownerDocumentRevision + "\" . ")
                            + (!document.ownerDocumentRevisionData ? "" : " ?s acc:ownerDocumentRevisionData \"" + document.ownerDocumentRevisionData + "\"^^xsd:date . ")
                            + " ?s acc:isApplicable \"" + document.isApplicable + "\" . "
                            + (!document.accDescription ? "" : " ?s acc:accDescription \"" + document.accDescription + "\" . ")
                            + (!document.accNote ? "" : " ?s acc:accNote \"" + document.accNote + "\" . ")
                            + " ?s acc:dateReceived \"" + document.dateReceived + "\"^^xsd:date .} "
                    + " WHERE {?s acc:uuid \"" + document.uuid + "\" . "
                            + " ?s acc:accDocumentNumber ?adn . "
                            + " ?s acc:accDocumentIteration ?adi . "
                            + " optional {?s acc:hasProject ?proj .} "
                            + " optional {?s dc:creator ?owner .} "
                            + " ?s acc:documentType ?dt . "
                            + " optional {?s acc:ownerDocumentNumber ?num .} "
                            + " optional {?s acc:ownerDocumentName ?odn .} "
                            + " optional {?s acc:ownerDocumentRevision ?odr .} "
                            + " optional {?s acc:ownerDocumentRevisionData ?odrd .} "
                            + " ?s acc:isApplicable ?a . "
                            + " optional {?s acc:accDescription ?descr .} "
                            + " optional {?s acc:accNote ?note .} "
                            + " ?s acc:dateReceived ?dr .} ";
        var requestData = {
            format: "application/sparql-results+json",
            query: query,
            mode: "settings"
        };
        return $http.post("RdfStoreProxy", $.param(requestData));
    };

    var readProjects = function() {
        var requestData = {
            format: "application/sparql-results+json",
            query: "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"
                    + "prefix acc: <" + Config.getDocumentsNS() + ">\n"
                    + "SELECT ?s ?p ?o FROM <" + GRAPH + "> "
                    + " WHERE { ?s ?p ?o . ?s rdf:type acc:AccProject } "
                    + " ORDER BY ?s ?p ?o",
            mode: "settings"
        };
        return $http.post("RdfStoreProxy", $.param(requestData)).then(function(response) {
            projects = Config.parseSparqlResults(response.data);
            projectsLoaded = true;
            return projects;
        });
    };

    var getAllProjects = function() {
        var results = [];
        for (var resource in projects) {
            var proj = projects[resource];
            var res = {
                    uri: resource,
                    number: proj["acc:number"][0],
                    name: proj["acc:name"][0]
            };
            results.push(res);
        }
        return results;
    };

    var readOwners = function() {
        var requestData = {
            format: "application/sparql-results+json",
            query: "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"
                    + "prefix acc: <" + Config.getDocumentsNS() + ">\n"
                    + "SELECT ?s ?p ?o FROM <" + GRAPH + "> "
                    + " WHERE { ?s ?p ?o . ?s rdf:type acc:Owner } "
                    + " ORDER BY ?s ?p ?o",
            mode: "settings"
        };
        return $http.post("RdfStoreProxy", $.param(requestData)).then(function(response) {
            owners = Config.parseSparqlResults(response.data);
            ownersLoaded = true;
            return owners;
        });
    };

    var getAllOwners = function() {
        var results = [];
        for (var resource in owners) {
            var o = owners[resource];
            var res = {
                uri: resource,
                name: o["acc:name"][0]
            };
            results.push(res);
        }
        return results;
    };

    var isReindexing = function() {
        var services = ConfigurationService.getComponentServices(":DocumentComponent", "lds:AuthoringService");
    	var serviceUrl = services[0].serviceUrl;

        return $http.get(serviceUrl+"/update/isReindexing").then(function(response) {
            return response.data == "true";
        });
    };

    return {
        getDocumentTypes: getDocumentTypes,
        readDocuments   : readDocuments,
        reloadDocuments : reloadDocuments,
        getAllDocuments : getAllDocuments,
        getDocument     : getDocument,
        deleteDocument  : deleteDocument,
        updateDocument  : updateDocument,
        readProjects    : readProjects,
        getAllProjects  : getAllProjects,
        readOwners      : readOwners,
        getAllOwners    : getAllOwners,
        isReindexing    : isReindexing
    };
});
