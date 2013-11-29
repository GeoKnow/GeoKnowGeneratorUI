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
.factory("Config", function($q, $http, flash)
{
	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";

	var ENDPOINT  = "http://192.168.0.18:8890/sparql";
	// if new resorces are created they will use this name space, and it can be changed
	var NS        = "http://generator.geoknow.eu/resource/";
  // this is the graph where settings are stored, it doesnt change, and independent on the Namespace
	var GRAPH_URI = "http://generator.geoknow.eu/resource/settingsGraph";

	var namespaces =
	{
		"http://dbpedia.org/resource/"                     : "dbpedia:",
		"http://purl.org/dc/elements/1.1/"                 : "dc:",
		"http://purl.org/dc/terms/"                        : "dcterms:",
		"http://xmlns.com/foaf/0.1/"                       : "foaf:",
		"http://linkeddata.org/integrated-stack-schema/"   : "lds:",
		"http://generator.geoknow.eu/ontology/"            : "gkg:",
		"http://www.w3.org/1999/02/22-rdf-syntax-ns#"      : "rdf:",
		"http://www.w3.org/2000/01/rdf-schema#"            : "rdfs:",
		"http://www.w3.org/ns/sparql-service-description#" : "sd:",
		"http://rdfs.org/ns/void#"                         : "void:"
	};
	namespaces[NS] = ":";

	var GRAPH    = "<" + GRAPH_URI + ">";
	var EOL      = "\n";
	var PREFIXES = "";
	for (var namespace in namespaces)
		PREFIXES += "PREFIX " + namespaces[namespace] + " <" + namespace + ">" + EOL;

	var settings = {};
	var isLoaded = false;

	var request = function(query, success)
	{
		var deferred = $q.defer();

		$http.post(ENDPOINT, $.param(
		{
			format: "application/sparql-results+json",
			query:  query
		}))
		.success(function(data)
		{
			try
			{
				deferred.resolve(success ? success(data) : data.results.bindings[0]["callret-0"].value);
			}
			catch (e)
			{
				deferred.reject(e);

			}
		})
		.error(function(data, status)
		{
			var message = data || ENDPOINT + " not found";
			deferred.reject(message);
			flash.error = message;
		});

		return deferred.promise;
	};

	var ns = function(v)
	{
		var value = v.value || v;

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

	var setEndpoint = function(url)
	{
		ENDPOINT = url;
	};

	var getEndpoint = function()
	{
		return ENDPOINT;
	};
	
	var setNS = function(ns)
	{
		NS = ns;
	};

	var getNS = function()
	{
		return NS;
	};

	var getGraph = function()
	{
		return GRAPH_URI;
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

	var read = function()
	{
		if (isLoaded)
		{
			var deferred = $q.defer();
			deferred.resolve(settings);
			return deferred.promise;
		}

		return request("SELECT * FROM " + GRAPH + EOL
		+	"WHERE { ?s ?p ?o }" + EOL
		+	"ORDER BY ?s ?p ?o",
			function(data)
			{
				var bindings = data.results.bindings;
				var triples  = [];

				for (var i in bindings)
				{
					var binding = bindings[i];
					triples.push([ ns(binding.s), ns(binding.p), ns(binding.o) ]);
				}

				settings = {};

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
						var map = settings[s] || (settings[s] = {});
					}

					if (/^nodeID:\/\//.test(o))
					{
						var id = o.slice(9);
						o = bnodes[id] = bnodes[id] || {};
					}

					(map[p] || (map[p] = [])).push(o);
				}

				isLoaded = true;

				return settings;
			}
		);
	};

	var write = function()
	{
		var wrap = function(s)
		{
			return /^https?:\/\//.test(s) ? "<" + s + ">" : !/^\w*:/.test(s) ? '"' + s + '"' : s;
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

		return request(PREFIXES
		+	"DROP SILENT GRAPH "   + GRAPH + EOL
		+	"CREATE SILENT GRAPH " + GRAPH + EOL
		+	"INSERT INTO "         + GRAPH + EOL
		+	"{" + EOL
		+	data
		+	"}");
	};

	var createGraph = function(name)
	{
		return request("CREATE SILENT GRAPH <" + name + ">");
	};

	var dropGraph = function(name)
	{
		return request("DROP SILENT GRAPH <" + name + ">");
	};

	return {
		setEndpoint : setEndpoint,
		getEndpoint : getEndpoint,
		getNS       : getNS,
		getGraph    : getGraph,
		getSettings : getSettings,
		select      : select,
		read        : read,
		write       : write,
		createGraph : createGraph,
		dropGraph   : dropGraph
	};
});

