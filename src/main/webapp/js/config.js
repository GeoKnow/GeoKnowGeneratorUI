/**
 * GeoKnow Generator
 *    Configuration management
 *
 * @author Vadim Zaslawski
 *
 * ISQL:
 *   GRANT SPARQL_UPDATE TO "SPARQL"
 *   GRANT EXECUTE ON DB.DBA.L_O_LOOK TO "SPARQL"
 *
 * usage:
 *   CONFIG.setEndpoint(url)          - set SPARQL endpoint, should be called initially
 *   CONFIG.getEndpoint()             - get SPARQL endpoint
 *   CONFIG.getNS()                   - get base namespace
 *   CONFIG.getGraph()                - get graph name
 *   CONFIG.read([success(settings)]) - load settings
 *   CONFIG.getSettings()             - get loaded settings
 *   CONFIG.write()                   - save settings after editing CONFIG.getSettings() result
 *   CONFIG.select(property, value)   - select settings, e.g.: CONFIG.select("rdf:type", "lds:StackComponent")
 *   CONFIG.createGraph(name)         - create graph
 *   CONFIG.dropGraph(name)           - delete graph
 */

"use strict";

var CONFIG = CONFIG || (function()
{
	var endpoint  = "http://10.0.0.80:8890/sparql"
	,	NS        = "http://generator.geoknow.eu/"
	,	GRAPH_URI = NS + "settingsGraph";

	var namespaces =
	{
		"http://dbpedia.org/resource/"                     : "dbpedia:"
	,	"http://purl.org/dc/elements/1.1/"                 : "dc:"
	,	"http://xmlns.com/foaf/0.1/"                       : "foaf:"
	,	"http://linkeddata.org/integrated-stack-schema/"   : "lds:"
	,	"http://www.w3.org/1999/02/22-rdf-syntax-ns#"      : "rdf:"
	,	"http://www.w3.org/2000/01/rdf-schema#"            : "rdfs:"
	,	"http://www.w3.org/ns/sparql-service-description#" : "sd:"
	};
	namespaces[NS] = ":";

	var NAMESPACES = "PREFIX : <" + NS + ">"
	,	GRAPH      = "<" + GRAPH_URI + ">"
	,	FORMAT     = "application/sparql-results+json"
	,	EOL        = "\r\n";

	var settings = {};

	var isLoaded = false;

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
	}

	return {
		setEndpoint: function(url)
		{
			endpoint = url;
		}
	,
		getEndpoint: function()
		{
			return endpoint;
		}

	,	getNS: function()
		{
			return NS;
		}

	,	getGraph: function()
		{
			return GRAPH;
		}

	,	getSettings: function()
		{
			return settings;
		}

	,	select: function(property, value)
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
		}

	,	read: function(success)
		{
			if (isLoaded)
			{
				if (success)
					try
					{
						success(settings);
					}
					catch (e)
					{
						console.error(e);
					}
				return;
			}

			$.getJSON(endpoint + "?callback=?",
				{
					format: FORMAT
				,	query: "SELECT * FROM " + GRAPH + EOL
				+	"WHERE { ?s ?p ?o }" + EOL
				+	"ORDER BY ?s ?p ?o"
				}
			,	function(data)
				{
					try
					{
						var bindings = data.results.bindings
						,	triples  = [];

						for (var i in bindings)
						{
							var binding = bindings[i];
							triples.push([ ns(binding.s), ns(binding.p), ns(binding.o) ]);
						}

						settings = {};

						var bnodes = {};

						for (var i in triples)
						{
							var triple = triples[i]
							,	s = triple[0]
							,	p = triple[1]
							,	o = triple[2];

							if (/^nodeID:\/\//.test(s))
							{
								var id = s.slice(9);
								var map = bnodes[id] = bnodes[id] || {};
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

						if (success)
							success(settings);
					}
					catch (e)
					{
						console.error(e);
					}
				}
			);
		}

	,	write: function()
		{
			var wrap = function(s)
			{
				return /^http:\/\//.test(s) ? "<" + s + ">" : !/^\w*:/.test(s) ? '"' + s + '"' : s;
			}

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
			}

			for (var s in settings)
				walk(s, settings[s]);

			$.getJSON(endpoint + "?callback=?",
				{
					format: FORMAT
				,	query: NAMESPACES + EOL
					+	"DROP SILENT GRAPH "   + GRAPH + EOL
					+	"CREATE SILENT GRAPH " + GRAPH + EOL
					+	"INSERT INTO "         + GRAPH + EOL
					+	"{" + EOL
					+	data
					+	"}"
				}
			,	function(data)
				{
					try
					{
						console.log(data.results.bindings[0]["callret-0"].value);
					}
					catch (e)
					{
						console.error(e);
					}
				}
			);
		}

	,	createGraph: function(name)
		{
			$.getJSON(endpoint + "?callback=?",
				{
					format: FORMAT
				,	query: "CREATE SILENT GRAPH " + name
				}
			,	function(data)
				{
					try
					{
						console.log(data.results.bindings[0]["callret-0"].value);
					}
					catch (e)
					{
						console.error(e);
					}
				}
			);
		}

	,	dropGraph: function(name)
		{
			$.getJSON(endpoint + "?callback=?",
				{
					format: FORMAT
				,	query: "DROP SILENT GRAPH " + name
				}
			,	function(data)
				{
					try
					{
						console.log(data.results.bindings[0]["callret-0"].value);
					}
					catch (e)
					{
						console.error(e);
					}
				}
			);
		}
	};
})();
