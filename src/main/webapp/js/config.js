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
 *   CONFIG_SPARQL_ENDPOINT           - must be set to your server
 *   CONFIG.read([success(settings)]) - load settings
 *   CONFIG.write()                   - save settings
 *   CONFIG.select(property, value)   - select settings
 */

"use strict";

var CONFIG = CONFIG || (function()
{
	var CONFIG_SPARQL_ENDPOINT = "http://localhost:8890/sparql"
	,	GRAPH_URI              = "http://generator.geoknow.eu"
	,	NS                     = GRAPH_URI + "#";

	var namespaces =
	{
		"http://dbpedia.org/resource/"                     : "dbpedia:"
	,	"http://purl.org/dc/elements/1.1/"                 : "dc:"
	,	"http://xmlns.com/foaf/0.1/"                       : "foaf:"
	,	"http://www.w3.org/1999/02/22-rdf-syntax-ns#"      : "rdf:"
	,	"http://www.w3.org/2000/01/rdf-schema#"            : "rdfs:"
	,	"http://www.w3.org/ns/sparql-service-description#" : "sd:"
	};

	namespaces[NS] = ":";

	var NAMESPACES = "PREFIX : <" + NS + ">"
	,	GRAPH      = "<" + GRAPH_URI + ">"
	,	FORMAT     = "application/sparql-results+json"
	,	EOL        = "\r\n";

	var triples =
	[	// defaults
		[ "http://dbpedia.org/sparql", "rdf:type", ":endpoint" ]
	,	[ "http://dbpedia.org/sparql", "rdfs:label", "DBpedia" ]

	,	[ "http://www.openstreetmap.org", "rdf:type", ":mapService" ]
	,	[ "http://www.openstreetmap.org", "rdfs:label", "OpenStreetMap" ]

	,	[ "http://maps.google.com", "rdf:type", ":mapService" ]
	,	[ "http://maps.google.com", "rdfs:label", "Google Maps" ]

	,	[ "http://192.168.43.209:8890", "rdf:type", ":component" ]
	,	[ "http://192.168.43.209:8890", "rdfs:label", "Virtuoso" ]
	,	[ "http://192.168.43.209:8890", ":version", "7" ]
	,	[ "http://192.168.43.209:8890", ":category", "storage-querying" ]
	,	[ "http://192.168.43.209:8890", ":route", "/authoring/ontowiki" ]

	,	[ "http://10.0.0.90/ontowiki", "rdf:type", ":component" ]
	,	[ "http://10.0.0.90/ontowiki", "rdfs:label", "OntoWiki" ]
	,	[ "http://10.0.0.90/ontowiki", ":version", "0.9.7" ]
	,	[ "http://10.0.0.90/ontowiki", ":category", "authoring" ]
	,	[ "http://10.0.0.90/ontowiki", ":route", "/authoring/ontowiki" ]

	,	[ "http://10.0.0.90/facete", "rdf:type", ":component" ]
	,	[ "http://10.0.0.90/facete", "rdfs:label", "Facete" ]
	,	[ "http://10.0.0.90/facete", ":version", "0.1" ]
	,	[ "http://10.0.0.90/facete", ":category", "querying-and-exploration" ]
	,	[ "http://10.0.0.90/facete", ":route", "/querying-and-exploration/facete" ]
	];

	var settings = {};

	var isLoaded = false;

	return {
		select: function(property, value)
		{
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

			$.getJSON(CONFIG_SPARQL_ENDPOINT + "?callback=?",
				{
					format: FORMAT
				,	query: "SELECT * FROM " + GRAPH + EOL
				+	"WHERE { ?s ?p ?o }" + EOL
				+	"ORDER BY ?s ?p ?o"
				}
			,	function(data)
				{
					function ns(v)
					{
						var value = v.value;

						if (v.type == "uri")
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

					try
					{
						var bindings = data.results.bindings;

						triples  = [];
						settings = {};

						for (var i in bindings)
						{
							var binding = bindings[i];
							triples.push([ ns(binding.s), ns(binding.p), ns(binding.o) ]);
						}

						for (var i in triples)
						{
							var triple = triples[i]
							,	s = triple[0]
							,	p = triple[1]
							,	o = triple[2];

							var map = settings[s] || (settings[s] = {});
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
			function uri(s)
			{
				return s.slice(0, 7) == "http://" ? "<" + s + ">" : s;
			}

			function str(s)
			{
				return '"' + s + '"';
			}

			var data = "";

			for (var i in triples)
			{
				var triple = triples[i]
				,	s = triple[0]
				,	p = triple[1]
				,	o = triple[2];
				data += uri(s) + " " + uri(p) + " " + (p == "rdf:type" ? uri(o) : str(o)) + " ." + EOL;
			}

			$.getJSON(CONFIG_SPARQL_ENDPOINT + "?callback=?",
				{
					format: FORMAT
				,	query: NAMESPACES + EOL
					+	"DROP SILENT GRAPH "   + GRAPH + EOL
					+	"CREATE SILENT GRAPH " + GRAPH + EOL
					+	"INSERT DATA INTO "    + GRAPH + EOL
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
	};
})();
