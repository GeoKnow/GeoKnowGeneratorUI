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

"use strict";

angular.module("app.services", [])
.factory("configService", function($q, $http)
{
	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";

	var endpoint  = "http://144.76.166.111:8890/sparql";
	
	var NS        = "http://generator.geoknow.eu/";

	var GRAPH_URI = NS + "settingsGraph";

	var namespaces =
	{
		"http://dbpedia.org/resource/"                     : "dbpedia:",
		"http://purl.org/dc/elements/1.1/"                 : "dc:",
		"http://purl.org/dc/terms/"                        : "dcterms:",
		"http://xmlns.com/foaf/0.1/"                       : "foaf:",
		"http://linkeddata.org/integrated-stack-schema/"   : "lds:",
		"http://www.w3.org/1999/02/22-rdf-syntax-ns#"      : "rdf:",
		"http://www.w3.org/2000/01/rdf-schema#"            : "rdfs:",
		"http://www.w3.org/ns/sparql-service-description#" : "sd:",
		"http://rdfs.org/ns/void#"                         : "void:"
	};
	namespaces[NS] = ":";

	var GRAPH = "<" + GRAPH_URI + ">";
	var EOL   = "\r\n";

	var NAMESPACES = "";
	for (var namespace in namespaces)
		NAMESPACES += "PREFIX " + namespaces[namespace] + " <" + namespace + ">" + EOL;

	var settings = {};

	var isLoaded = false;

	var request = function(query, success)
	{
		var deferred = $q.defer();

		$http.post(endpoint, $.param(
		{
			format: "application/sparql-results+json",
			query:  query
		}))
		.success(function(data)
		{
			if (success)
				deferred.resolve(success(data));
			else
				try
				{
					deferred.resolve(data.results.bindings[0]["callret-0"].value);
				}
				catch (e)
				{
					deferred.reject(e);
				}
		})
		.error(function(data, status)
		{
			deferred.reject(data || "Not found");
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
		endpoint = url;
	};

	var getEndpoint = function()
	{
		return endpoint;
	};

	var getNS = function()
	{
		return NS;
	};

	var getGraph = function()
	{
		return GRAPH;
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

		for (var resource in settings)
		{
			var element = settings[resource];
			var prop = element[property];
			if (prop)
				for (var i in prop)
					if (prop[i] == value)
					{
						elements[resource] = element;
						break;
					}
		}

		return elements;
	};

	var read = function()
	{
		if (isLoaded)
			return settings;

		request.call(this, "SELECT * FROM " + GRAPH + EOL
			+	"WHERE { ?s ?p ?o }" + EOL
			+	"ORDER BY ?s ?p ?o",
			function(data)
			{
				try
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

							if (/^nodeID:\/\//.test(o))
							{
								var id = o.slice(9);
								o = bnodes[id] = bnodes[id] || {};
							}
						}

						(map[p] || (map[p] = [])).push(o);
					}

					isLoaded = true;
				}
				catch (e)
				{
					console.error(e);
				}
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

		request(NAMESPACES
			+	"DROP SILENT GRAPH "   + GRAPH + EOL
			+	"CREATE SILENT GRAPH " + GRAPH + EOL
			+	"INSERT INTO "         + GRAPH + EOL
			+	"{" + EOL
			+	data
			+	"}");
	};

	var createGraph = function(name)
	{
		request("CREATE SILENT GRAPH <" + name +">");
	};

	var dropGraph = function(name)
	{
		request("DROP SILENT GRAPH <" + name +">");
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
})
.controller("configControl", function($scope, configService)
{
	$scope.settings = configService.read();
});
