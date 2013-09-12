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
 */

"use strict";

// todo: geather triples by types

var CONFIG = CONFIG || (function()
{
	var CONFIG_SPARQL_ENDPOINT = "http://localhost:8890/sparql"

	,	GRAPH_URI              = "http://geoknow.eu/generator"
	,	GRAPH                  = "<" + GRAPH_URI + ">"

	,	RDF                    = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	,	RDFS                   = "http://www.w3.org/2000/01/rdf-schema#"
	,	GKG                    = GRAPH_URI + "#"

	,	NAMESPACES             = "PREFIX : <" + GKG + ">"

	,	FORMAT                 = "application/sparql-results+json"
	,	EOL                    = "\r\n";

	var triples =
	[	// defaults
		[ "http://dbpedia.org/sparql",		"rdf:type",		":sparqlEndpoint"	]
	,	[ "http://dbpedia.org/sparql",		"rdfs:label",	"DBpedia"			]
	,	[ "http://www.openstreetmap.org",	"rdf:type",		":mapService"		]
	,	[ "http://www.openstreetmap.org",	"rdfs:label",	"OpenStreetMap"		]
	,	[ "http://maps.google.com",			"rdf:type",		":mapService"		]
	,	[ "http://maps.google.com",			"rdfs:label",	"Google Maps"		]
	];

	var isLoaded = false;

	return {
		read: function(success)
		{
			if (isLoaded)
			{
				if (success)
					try
					{
						success(triples);
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
					function setPrefix(v)
					{
						var value = v.value;

						function replace(namespace, prefix)
						{
							var len = namespace.length;
							return namespace == value.slice(0, len ) ? prefix + ":"  + value.slice(len) : null;
						}

						return v.type == "uri" ?
							replace(RDF,  "rdf" )
						||	replace(RDFS, "rdfs")
						||	replace(GKG,  ""    )
						||	value
						:	value;
					}

					try
					{
						var bindings = data.results.bindings;

						triples = [];
						for (var i = 0, c = bindings.length; i < c; ++i)
						{
							var binding = bindings[i];
							triples.push([ setPrefix(binding.s), setPrefix(binding.p), setPrefix(binding.o) ]);
						}

						isLoaded = true;

						if (success)
							success(triples);
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

			for (var i = 0, c = triples.length; i < c; ++i)
			{
				var triple = triples[i]
				,	s = triple[0]
				,	p = triple[1]
				,	o = triple[2];
				data += uri(s) + " " + uri(p) + " " + (p == "rdfs:label" ? str(o) : uri(o)) + " ." + EOL;
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
