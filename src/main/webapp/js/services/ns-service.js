'use strict';

var module = angular.module('app.ns-service', []);

module.factory('Ns', function (Helpers) {

	var prefixes = {
		"acl"			: "http://www.w3.org/ns/auth/acl#",
		"cco"			: "http://purl.org/acco/ns#",
		"dbo"			: "http://dbpedia.org/ontology/",
		"dbp"			: "http://dbpedia.org/property/",
		"dbr"			: "http://dbpedia.org/resource/",
		"dcterms"	: "http://purl.org/dc/terms/",
		"dc"			: "http://purl.org/dc/elements/1.1/",
		"foaf"		: "http://xmlns.com/foaf/0.1/",
		"geo"			: "http://www.w3.org/2003/01/geo/wgs84_pos#",
		"geoknow"	: "http://geoknow.eu/geodata#",
		"geom"		: "http://geovocab.org/geometry#",
		"geos"		: "http://www.opengis.net/ont/geosparql#",
		"gkg"			: "http://ldiw.ontos.com/ontology/",
		"gz"			: "http://data.admin.ch/vocab/",
		"gzp"			: "http://data.admin.ch/bfs/class/1.0",
		"ld"			: "http://ld.geoknow.eu/flights/ontology/",
		"lds"			: "http://stack.linkeddata.org/ldis-schema/",
		"lexvo"		: "http://lexvo.org/ontology#",
		"lgdo"		: "http://linkedgeodata.org/ontology/",
		"ch"			: "http://opendata.ch/ontology#",
		"owl"			: "http://www.w3.org/2002/07/owl#",
		"rdf"			: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		"rdfs"		: "http://www.w3.org/2000/01/rdf-schema#",
		"sd"			: "http://www.w3.org/ns/sparql-service-description#",
		"skos"		: "http://www.w3.org/2004/02/skos/core#",
		"void"		: "http://rdfs.org/ns/void#",
		"wktrm"		: "http://wiktionary.dbpedia.org/terms/"                
	};
	
	var buildNamespaces = function(){
  	for (var prop in prefixes) {
      if(prefixes.hasOwnProperty(prop)) {
      	namespaces[prefixes[prop]] = (prop == ":"? prop : prop + ":");
      }
    }
  };

	var EOL      = "\n";
  // namespaces is used to replace the ns by the prefix 
  var namespaces = {};
	buildNamespaces();

	var NsService = {

		getPrefix : function(ns){
			return namespaces[ns];
		},

		getNamespace : function(prefix){
			return prefixes[prefix];
		},

		getPrefixes : function(){
			return prefixes;
		},

		isUri : function (v){
      if (/^:/.test(v))
          return true;
      else if(/^\w*:/.test(v)){
      		// lds:integrates
          if( prefixes[v.substr(0, v.indexOf(':'))] != undefined )
              return true;
      }
      return false;
    },

		// Replaces the long name space by the prefix
    shorten : function(v){
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
    },

		add : function(prefix, namespace){
			if(prefixes[prefix]==undefined){
				prefixes[prefix] = namespace;
				buildNamespaces();
			}
			else
				console.log("WARNING: prefix already exist for " + prefixes[prefix]);
		},

		// return an array of prefix, namespace of the provided arr prefixes list
		getMap : function(arr){
			var map = {};
			var notdefined = "";
			for (var p in arr)
					if(prefixes[arr[p]] != undefined)
						map[arr[p]] = prefixes[arr[p]];
					else
						notdefined += arr[p] + ", ";
			if(notdefined != "")
				console.log("WARNING: not all prefixes were found: " + notdefined);
			return map;
		},

		getQueryPrefixes : function(arr){
			var str = "";
			var notdefined = "";
			for (var p in arr)
				if(prefixes[arr[p]] != undefined)
						str += "PREFIX " + (arr[p]==":"? arr[p] : arr[p] + ":") + " <" + prefixes[arr[p]] + ">" + EOL;
					else
						notdefined += arr[p] + ", ";
			if(notdefined != "")
				console.log("WARNING: not all prefixes were found: " + notdefined);
			return str;
		}
	
	}
	return NsService;
});