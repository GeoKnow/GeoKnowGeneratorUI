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
		"ontos"  	: "http://ldiw.ontos.com/ontology/",
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
		"wktrm"		: "http://wiktionary.dbpedia.org/terms/",
		"drugbank": "http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/",
		"sider"		: "http://www4.wiwiss.fu-berlin.de/sider/resource/sider/",
		"diseasome" : "http://www4.wiwiss.fu-berlin.de/diseasome/resource/diseasome/",
		"gv"			: "http://geoknow.eu/coevolution/graphversioning/", 
		"gvg"			: "http://geoknow.eu/coevolution/graphversioning/graphset/",
		"cec"			: "http://geoknow.eu/coevolution/change/"

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

    getParts : function(v){
			var value = v.split(":");
			// v is not a uri
			if(value.length!=2)
				return null;
    	var uri = value[0];
    	if(value[0]=="")
    		uri = prefixes[":"];
    	else if(prefixes[value[0]] != undefined)
    		uri = prefixes[value[0]];
    	return [uri,value[1]];
    },

		// Replaces the long name space by the prefix
    shorten : function(v){
        var value = v.value == undefined ? v : v.value;

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

    // replaces the prefix with the namespace retuns a uri
    lengthen : function(v){
    	var value = v.split(":");
    	var uri = "";
    	if(value[0]=="")
    		uri = prefixes[":"] + value[1];
    	else if(prefixes[value[0]] != undefined)
    		uri = prefixes[value[0]] + value[1];
    	else
    		uri = v;
    	return uri;
    },

		add : function(prefix, namespace){
			if(prefixes[prefix]==undefined){
				prefixes[prefix] = namespace;
				buildNamespaces();
				console.log(prefix + " added to " + namespace);
			}
			else if(prefixes[prefix] != namespace)
				console.log("WARNING: prefix " + prefix + " already exist for " + prefixes[prefix] + ", couldn't asign " + namespace );
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