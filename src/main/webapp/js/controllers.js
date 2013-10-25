'use strict';

function SettingsMenuCtrl($scope) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
  	{ name: "Data Sources", route:'#/settings/data-sources', url:'/settings/data-sources' },
  	{ name: "Datasets", route:'#/settings/datasets', url:'/settings/datasets' },
    // { name: "Namespaces", route:'#/settings/namespaces', url:'/settings/namespaces' },
  	{ name: "Components", route:'#/settings/components', url:'/settings/components' }
  ];
}

function AccountMenuCtrl($scope) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
    { name: "User Preferences",   route:'#/account/preferences', url:'/account/preferences' }];
}

function StackMenuCtrl($scope) {
	  $scope.oneAtATime = true;
	  // these data can be replaced later with the configuration
	  $scope.groups = [
	    {
	      title: "Extraction and Loading",
	      id:"extraction-loading",
	      items: [
	        {name: 'Import RDF data', route:'#/home/extraction-and-loading/import-rdf',  url:'/home/extraction-and-loading/import-rdf' },
	        {name: 'Sparqlify Extraction', route:'#/home/extraction-and-loading/sparqlify',  url:'/home/extraction-and-loading/sparqlify' },
	        {name: 'TripleGeo Extraction', route:'#/home/extraction-and-loading/triplegeo', target:'_blank',  url:'/home/extraction-and-loading/triplegeo' }]
	    },
	    {
	      title: "Querying and Exploration",
	      id:"querying-exploration",
	      items: [
	   //    {name: 'Geospatial Exploration', route:'#/home/querying-and-exploration/geospatial', url:'/home/querying-and-exploration/geospatial' },
	   //    {name: 'Google Maps', route:'#/home/querying-and-exploration/googlemap', url:'/home/querying-and-exploration/googlemap' },
	       {name: 'Facete', route:'#/home/querying-and-exploration/facete', url:'/home/querying-and-exploration/facete' },
	       {name: 'Virtuoso', route:'#/home/querying-and-exploration/virtuoso', url:'/home/querying-and-exploration/virtuoso' }]
	    },
	    {
	      title: "Authoring",
	      id:"authoring",
	      items: [
	       {name: 'OntoWiki', route:'#/home/authoring/ontowiki', url:'/home/authoring/ontowiki' }]
	    },
	    {
	      title: "Linking",
	      id:"linking",
	      items: [
	       {name: 'LIMES', route:'#/home/linking/limes', target:'_blank', url:'/home/linking/limes' }]
	    },
	    {
	     title: "Enriching and Data Cleaning",
	     id:"enriching-cleansing",
	     items: [
	       {name: 'GeoLift', route:'#/home/enriching-and-cleaning/geolift', target:'_blank', url:'/home/enriching-and-cleaning/geolift' }]
	    }

	  ];

	}


function LoginCtrl() {}
LoginCtrl.$inject = [];

app.controller('NavbarCtrl', function($scope, $location) {
		//if($location.path === "/"){
		//	$location.path('/home')
		//}
		$scope.getClass = function(path) {
			if ($location.path().substr(0, path.length) === path) {
			      return "active"
			    } else {
			      return ""
			    }
			}
	});

app.controller('SidebarCtrl', function($scope, $location) {
	    $scope.isSelected = function(route) {
	        return route === $location.path();
	    }
});

// this ModalWindow may be replaced witht the modalIframe directive
app.controller('ModalWindow', function ($scope) {

  $scope.OpenFullWindow = function (id) {
  	console.log("open");
    $("#" + id).modal({
    	height : $(window).height() - 165,
    	width  : "100%", 
    	show   : true
    });
  };

  $scope.OpenWindow = function (id) {
    $("#" + id).modal({
       show: true
    });
  }; 
 
  $scope.close = function (id) {
	  $("#" + id).modal('hide');
	  $('body').removeClass('modal-open');
	  $('.modal-backdrop').slideUp();
	  $('.modal-scrollable').slideUp();
  };
  
  $scope.del = function (index) {
	  
	  var person_to_delete = $scope.persons[index];

	  API.DeletePerson({ id: person_to_delete.id }, function (success) {
	    $scope.persons.splice(idx, 1);
	  });
	  
  };

  // for the child($scope.$emit)/parent($scope.$broadcast) controller to be able to close the modal window
  $scope.$on('closeModal', function(event, args) {
  	$scope.close(args.id);
  })        
  
});

app.controller('VirtuosoCtrl', function($scope, ConfigurationService) {

	$scope.component = ConfigurationService.getComponent(":Virtuoso");
	$scope.services = ConfigurationService.getComponentServices(":Virtuoso", "lds:SPARQLEndPoint");
	$scope.url = ConfigurationService.getSPARQLEndpoint();

});

app.controller('FaceteFormCtrl', function($scope, ConfigurationService) {
	//Settings for Facete

	$scope.namedGraphs = ConfigurationService.getAllNamedGraphs();
	$scope.component = ConfigurationService.getComponent(":Facete");
	var services = ConfigurationService.getComponentServices(":Facete");
	$scope.facete = {
		service   : ConfigurationService.getSPARQLEndpoint(),
	 	dataset   : $scope.namedGraphs[0].name,
	}
	$scope.url = "";

	$scope.setUrl = function(){
		$scope.url= services[0].serviceUrl + 
								'?service-uri='+ $scope.facete.service+
                '&default-graph-uri=' + $scope.facete.dataset.replace(':',ConfigurationService.getUriBase());
   

	};
});


var LimesCtrl = function($scope, $http){
	
	$scope.configOptions = true;
	$scope.inputForm = true;
	var uploadError = false;
	var uploadedFiles = null;
	
	$scope.examples = [
	                { name : "Duplicate Dbpedia country entries for the CET time zone" },
	                { name : "Geo Data" }
	];
	
	$scope.options = [{ 	output: [
			                { output : "N3" },
			                { output : "TAB" }]
							},
					  { 	execType: [
			                { execType : "SIMPLE" },
			                { execType : "FILTER" }]
						  },
				     ];
	
	$scope.limes = { OutputFormat :    $scope.options[0].output[0],
					 ExecType :        $scope.options[1].execType[0]
	}
	
	$scope.FillForm = function(example){
		
		var params = {};
		
		$scope.enterConfig = true;
		$scope.startLimes = true;
		
		if(example === "Duplicate Dbpedia country entries for the CET time zone"){
			
		$scope.limes = { SourceServiceURI : "http://dbpedia.org/sparql",
						 TargetServiceURI  : "http://dbpedia.org/sparql",
						 SourceVar: "?x",
						 TargetVar: "?y",
						 SourceSize: "1000",
						 TargetSize: "1000",
						 SourceRestr: "?x dbpedia:timeZone dbresource:Central_European_Time. " +
						 		"?x dbpedia2:country ?z",
						 TargetRestr: "?y dbpedia:timeZone dbresource:Central_European_Time. " +
						 		"?y dbpedia2:country ?z",
						 SourceProp: "rdfs:label",
						 TargetProp: "rdfs:label",
						 Metric: "levenshtein(y.rdfs:label, x.rdfs:label)",
						 OutputFormat: $scope.options[0].output[0],
						 ExecType: $scope.options[1].execType[0],
						 AcceptThresh: "1",
						 ReviewThresh: "0.95",
						 AcceptRelation: "owl:sameAs",
						 ReviewRelation: "owl:sameAs" 
				};
		}
		
		if(example === "Geo Data"){
			
			$scope.limes = { SourceServiceURI : "http://linkedgeodata.org/sparql",
							 TargetServiceURI  : "http://linkedgeodata.org/sparql",
							 SourceVar: "?x",
							 TargetVar: "?y",
							 SourceSize: "2000",
							 TargetSize: "2000",
							 SourceRestr: "?x a lgdo:RelayBox",
							 TargetRestr: "?y a lgdo:RelayBox",
							 SourceProp: "geom:geometry/geos:asWKT RENAME polygon",
							 TargetProp: "geom:geometry/geos:asWKT RENAME polygon",
							 Metric: "hausdorff(x.polygon, y.polygon)",
							 OutputFormat: $scope.options[0].output[0],
							 ExecType: $scope.options[1].execType[0],
							 AcceptThresh: "0.9",
							 ReviewThresh: "0.5",
							 AcceptRelation: "lgdo:near",
							 ReviewRelation: "lgdo:near" 
					};
			}
		
	}
		
	$scope.StartLimes = function(){
		
		$scope.startLimes = false;
		$scope.enterConfig = false;
		$scope.configOptions = false;
		$scope.showProgress = true;
		
		var params = { 
					 SourceServiceURI: $scope.limes.SourceServiceURI,
					 TargetServiceURI: $scope.limes.TargetServiceURI,
					 SourceVar: $scope.limes.SourceVar,
					 TargetVar: $scope.limes.TargetVar,
					 SourceSize: $scope.limes.SourceSize,
					 TargetSize: $scope.limes.TargetSize,
					 SourceRestr: $scope.limes.SourceRestr,
					 TargetRestr: $scope.limes.TargetRestr,
					 SourceProp: $scope.limes.SourceProp,
					 TargetProp: $scope.limes.TargetProp,
					 Metric: $scope.limes.Metric,
					 OutputFormat: $scope.limes.OutputFormat.output,
					 ExecType: $scope.limes.ExecType.execType,
					 AcceptThresh: $scope.limes.AcceptThresh,
					 ReviewThresh: $scope.limes.ReviewThresh,
					 AcceptRelation: $scope.limes.AcceptRelation,
					 ReviewRelation: $scope.limes.ReviewRelation
					 };
		
		$http({
			url: "http://localhost:8080/LimeServlet/LimesRun",
	        method: "POST",
	        params: params,
	        dataType: "json",
	        contentType: "application/json; charset=utf-8"
	      }).then(function() {
	    	$scope.startLimes = false;
	    	$scope.showProgress = false;
	    	$scope.ReviewLimes();
	      });
	}
	
	$scope.ReviewLimes = function(){

		$scope.configOptions = false;
	  	$scope.showProgress = true;
	  	
	  	$http({
			url: "http://localhost:8080/LimeServlet/LimesReview",
	        method: "POST",
	        dataType: "json",
	        contentType: "application/json; charset=utf-8"
	      }).then(function(data){
	    	 
	    	  	var result = data.data[0];
	  	  		result = result.substring(13,result.length-5);
	  	  		if (result.length<3){
	  		  		$scope.limes.reviewResults = "No results to review";
	  		  	}else{
	  		  		$scope.limes.reviewResults = result;
	  		  	}
	  	  		
	  	  		result = data.data[1];
	  	  		result = result.substring(13,result.length-5);
	  	  		if (result.length<3){
	  	  			$scope.limes.acceptedResults = "No results meet the acceptance threshold";
	  	  		}else{
	  	  			$scope.limes.acceptedResults = result;
	  	  		}
	  	  		
	  		  	$scope.enterConfig = false;
	  		  	$scope.showProgress = false;
	    		$scope.inputForm = false;
	    		$scope.reviewForm = true;
	  	    		
	      		});
	      
	}
	
	$scope.loadLimesXML = function($files){
		
		for (var i = 0; i < $files.length; i++) {
		      var $file = $files[i];
		      $http.uploadFile({
		        url: 'UploadServlet', //upload.php script, node.js route, or servlet uplaod url)
		        file: $file
		      }).then(function(response, status, headers, config) {
		        // file is uploaded successfully
		    	  
		    	  var filename = $files[0].name;
		    	  $('#dummyInput').val(filename);
		  		
					$http({
							method: "POST",
							url: "http://localhost:8080/LimeServlet/LoadFile",
							params: {file : filename}
				      	}).then(function(data) {
						    	
						    	$scope.limes = { SourceServiceURI : data.data[0][0],
												 TargetServiceURI  : data.data[1][0],
												 SourceVar: data.data[0][1],
												 TargetVar: data.data[1][1],
												 SourceSize: data.data[0][2],
												 TargetSize: data.data[1][2],
												 SourceRestr: data.data[0][3],
												 TargetRestr: data.data[1][3],
												 SourceProp: data.data[0][4],
												 TargetProp: data.data[1][4],
												 Metric: data.data[2],
												 OutputFormat: $scope.options[0].output[0],
												 ExecType: $scope.options[1].execType[0],
												 AcceptThresh: data.data[3][0],
												 ReviewThresh: data.data[4][0],
												 AcceptRelation: data.data[3][1],
												 ReviewRelation: data.data[4][1] 
											};
						    	
						    	$scope.enterConfig = true;
						    	$scope.startLimes = true;
						    	
					      });
		    	  
		        if(response.data.status=="FAIL"){
		          uploadError = true;
		          $scope.uploadMessage=response.data.message;
		        }
		        else {
		          uploadError = false;
		          uploadedFiles = $file.name;
		        }
		      }); 
		    }

		}
	
		$scope.uploadedError =  function(){
		    return uploadError;
		};
	
}

var GeoliftCtrl = function($scope, $http, ConfigurationService){
	
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	
	$scope.inputForm = true;
	$scope.configOptions = true;
	$scope.startButton = false;
	var sourceInput = null;
	var dataFile = null;
	var uploadError = false;
	var uploadedFiles = null;
	var count = 0;
	
	$scope.options = {
			inputFile: false,
			configFile: false,
			endpoints: false,
			datasource: [
		                 	"File",
							"SPARQL Endpoint"
  			                ]
	}
	
	$scope.params = [		  
             		  { 	inputs : [], 
             			    visible: false		},

			  ];
	
	$scope.choice = function($name){
		
		$scope.configForm = false;
		$scope.inputDisplay = "";
		$scope.inputDisplayRow = false;
		$scope.params[0].visible = false;
		
		if($name == "File"){
			$scope.configOptions = true;
			$scope.addParamButton = true;
			$scope.options.epExamples = false;
			$scope.options.fileExamples = true;
			$scope.options.endpoints = false;
			$scope.options.inputFile = true;
			$scope.options.configFile = false;
		}
		if($name == "SPARQL Endpoint"){
			$scope.configOptions = true;
			$scope.addParamButton = true;
			$scope.options.epExamples = true;
			$scope.options.fileExamples = false;
			$scope.options.endpoints = true;
			$scope.options.inputFile = false;
			$scope.options.configFile = false;
		}
		$scope.startButton = true;
		$scope.params[0].inputs.length = 0;
	}
	
	$scope.epExamples = [
							{ 	label : "Dbpedia endpoint enrichment", 
								params: [
											{
											index: "1",
											module: "nlp useFoxLight true"
												},
											{
											index: "1",
											module: "nlp askEndPoint false"
												},
											{
											index: "2",
											module: "dereferencing predicate1 http://www.w3.org/2003/01/geo/wgs84_pos#geometry"
												},
											{
											index: "3",
											module: "nlp LiteralProperty http://www.w3.org/2000/01/rdf-schema#comment"
												},
											{
											index: "3",
											module: "nlp useFoxLight false"
												},
											{
											index: "4",
											module: "nlp useFoxLight true"
												},
									]
							}
					],
					
	$scope.fileExamples = [
							{ 	label : "Berlin Turtle File", 
								params: [
															{
															index: "1",
															module: "nlp useFoxLight true"
																},
															{
															index: "1",
															module: "nlp askEndPoint false"
																},
															{
															index: "2",
															module: "dereferencing predicate1 http://www.w3.org/2003/01/geo/wgs84_pos#geometry"
																},
															{
															index: "3",
															module: "nlp LiteralProperty http://www.w3.org/2000/01/rdf-schema#comment"
																},
															{
															index: "3",
															module: "nlp useFoxLight false"
																},
															{
															index: "4",
															module: "nlp useFoxLight true"
																},
													]
											}
									],
	
	$scope.appendInput = function(){
			$scope.params[0].inputs.push( { idx : count++ } );
			$scope.params[0].visible = true;
			$scope.startButton = true;
	}
	
	$scope.removeInput = function ( index ) {
	    	$scope.params[0].inputs.splice( index, 1 );
	    	if($scope.params[0].inputs.length === 0){
	    		$scope.params[0].visible = false;
	    	}
	    	if($scope.params[0].inputs.length === 0)
	    		$scope.startButton = false;
	}
	
	$scope.FillForm = function(example){
		
		$scope.params[0].inputs = [];
		
		if(example === "Dbpedia endpoint enrichment"){
			
			$scope.endpointSelect = $scope.endpoints[0];
			sourceInput = $scope.endpointSelect.endpoint;
			$scope.inputDisplay = sourceInput;
			$scope.options.endpoints = false;
			$scope.endpointSelect = false;
			$scope.inputDisplayRow = true;
			
			for(var i=0; i<$scope.epExamples[0].params.length; i++){
				
				$scope.params[0].inputs.push({
												 index: $scope.epExamples[0].params[i].index,
												 module: $scope.epExamples[0].params[i].module
								  					});

				$scope.params[0].visible = true;
				$scope.startButton = true;
				
				}
		 }
		
		 if(example === "Berlin Turtle File"){
			 
			 $scope.options.inputFile = false;
			 sourceInput = "berlin.ttl";
			 $scope.inputDisplay = sourceInput;
			 $scope.inputDisplayRow = true;
					
					for(var i=0; i<$scope.epExamples[0].params.length; i++){
						
						$scope.params[0].inputs.push({
														 index: $scope.fileExamples[0].params[i].index,
														 module: $scope.fileExamples[0].params[i].module
										  					});
		
						$scope.params[0].visible = true;
						$scope.startButton = true;
						
						}
				 }
		
	}
	
	$scope.loadDataFile = function($files){
		$scope.options.fileExamples = false;
		$scope.options.configFile = true;
		dataFile = $files[0].name;
		$('#dummyGeoLiftInput').val(dataFile);
		}
	
	$scope.loadConfigFile = function($files){
			
			for (var i = 0; i < $files.length; i++) {
			      var $file = $files[i];
			      $http.uploadFile({
			        url: 'UploadServlet', //upload.php script, node.js route, or servlet uplaod url)
			        file: $file
			      }).then(function(response, status, headers, config) {
			        // file is uploaded successfully
			    	  
			    	  var configFile = $files[0].name;
			    	  $('#dummyConfigInput').val(configFile);
			  		
						$http({
								method: "POST",
								url: "http://localhost:8080/GeoLiftServlet/LoadFile",
								params: {
										configFile : configFile,
										dataFile: dataFile}
					      	}).then(function(data) {
					      		$scope.addParamButton = true;
					      		console.log(data);
						      });
			    	  
			        if(response.data.status=="FAIL"){
			          uploadError = true;
			          $scope.uploadMessage=response.data.message;
			        }
			        else {
			          uploadError = false;
			          uploadedFiles = $file.name;
			        }
			      }); 
			    }
		}
	
	$scope.startGeoLift = function(){
		
		$scope.configOptions = false;
		$scope.showProgress = true;
		
		var params = {};
		params[0] = $scope.params[0].inputs.length;
		params[1] = sourceInput;
			
		for(var i=0; i<$scope.params[0].inputs.length; i++){
			
			 params[i+2] = $scope.params[0].inputs[i].index + " " + $scope.params[0].inputs[i].module;
			 
						 }
		
			$http({
				url: "http://localhost:8080/GeoLiftServlet/GeoLiftRun",
		        method: "POST",
		        params: params,
		        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
		      }).then(function() {
		    	  //$scope.reviewGeoLiftResult();
		      });
			
		}
	
	$scope.reviewGeoLiftResult = function(){
			
		$scope.configOptions = false;
	  	$scope.showProgress = true;
	  	
		$http({
			url: "http://localhost:8080/LimeServlet/LimesReview",
	        method: "POST",
	        dataType: "json",
	        contentType: "application/json; charset=utf-8"
	      }).then(function(data){
	    	 
	    	  		var result = data.data[0];
	    	  		result = result.substring(13,result.length-3);
	    	  		if (result.length<3){
	    		  		$scope.limes.reviewResults = "No results to review";
	    		  	}else{
	    		  		$scope.limes.reviewResults = result;
	    		  	}
	    	  		
	    	  		result = data.data[1];
	    	  		result = result.substring(13,result.length-3);
	    	  		if (result.length<3){
	    	  			$scope.limes.acceptedResults = "No results meet the acceptance threshold";
	    	  		}else{
	    	  			$scope.limes.acceptedResults = result;
	    	  		}
	    	  		
	    		  	$scope.enterConfig = false;
	    		  	$scope.showProgress = false;
	  	    		$scope.inputForm = false;
	  	    		$scope.reviewForm = true;
	  	    		
	      		});
		}
}

var TripleGeoCtrl = function($scope, $http, ConfigurationService){
	
	$scope.inputForm = true;
	$scope.configOptions = true;
	$scope.dbLogin = true;
	$scope.configForm = false;
	var configArray = new Array();
	$scope.databases = ConfigurationService.getAllDatabases();

	var uploadError = false;
	var uploadedFiles = null;
	var inputFileName = null;
	var params = {};
	$('i').tooltip();
	
	configArray[0]  = ['format', ''];
	configArray[1]  = ['targetStore', ''];
	configArray[2]  = ['featureString', ''];
	configArray[3]  = ['attribute', ''];
	configArray[4]  = ['ignore', ''];
	configArray[5]  = ['type', ''];
	configArray[6]  = ['name', ''];
	configArray[7]  = ['class', ''];
	configArray[8]  = ['nsPrefix', ''];
	configArray[9]  = ['nsURI', ''];
	configArray[10] = ['ontologyNSPrefix', ''];
	configArray[11] = ['ontologyNS', ''];
	configArray[12] = ['sourceRS', ''];
	configArray[13] = ['targetRS', ''];
	configArray[14] = ['defaultLang', ''];
	
	$scope.tooltips = { data: "Change parameters to reflect the shapefile contents that will be extracted - case sensitive!",
						ns: "Optional parameters. Change these parameters if you want to use different"+
							"values for the namespaces and prefixes nsPrefix=georesource",
						spatial: "Optional parameters. These fields should be filled in if a transformation between EPSG reference systems is needed"+
								 "If not specified, geometries are assumedto be WGS84 reference system (EPSG:4326).",
						other: "Optional parameter. Default languages for the labels created in the output RDF. By default, the value is English - en."
	}
	
	$scope.options = { 		
							database: false,
							file: false,
							fileExample: false,
							dbExample: false,
							dataParams: false,
							dbParams: false,
							job: null,
							inputFile: null,
							displayConfigUpload: false,
							format: [
	  		     			                "RDF/XML" ,
			     			                "RDF/XML-ABBREV",
			     			                "N-TRIPLES",
			     			                "TURTLE",
			     			                "N3"
			     			                	],
							targetStore: [
							              	"GeoSPARQL",
							              	"Virtuoso",
							              	"wgs84_pos"
							              		],
		     			    datasource: [
		     			                 	"Shape File",
											"Database"
				     			                ],
				     	    fileExamples: [
											"Points shape file extraction"
											],
							dbExamples: [
						  		     		"Hotles Dataset"
						  		     		],
				     		dbtype: [
				     		         "MySQL",
				     		         "Oracle",
				     		         "PostGIS",
				     		         "DB2"
				     		         ]
								};
	
	$scope.choice = function($name){
		
		$scope.configForm = false;
		$scope.stTripleGeo = true;
		
		if($name == "Shape File"){
			$scope.options.file = true;
			$scope.options.database = false;
			$scope.options.dbExample = false;
			$scope.options.fileExample = true;
			$scope.options.dataParams = true;
			$scope.options.dbParams = false;
			$scope.options.job = "file";
		}
		if($name == "Database"){
			$scope.options.file = false;
			$scope.options.database = true;
			$scope.options.fileExample = false;
			$scope.options.dbExample = true;
			$scope.options.dbParams = true;
			$scope.options.dataParams = false;
			$scope.configForm = true;
			$scope.options.job = "db";
			$scope.tripleGeoConfig = {
								format : $scope.options.format[0],
								targetStore : $scope.options.targetStore[0],
								dbtype: $scope.options.dbtype[0],
								
			};
		}
	}
	
	$scope.FillForm = function(example, name){
		
			var params = {};
			
			if(example === "fileExample" && name === "Points shape file extraction"){
				
				$scope.options.dataParams = true;
				$scope.options.dbParams = false;
				$scope.options.job = "example";
				$scope.options.displayConfigUpload = false;
				$scope.options.file = false;
				$scope.options.inputDisplay = true;
		
				$scope.tripleGeoConfig = {
						
						inputDisplay: "points.shp",
						
						 inputFile :   "./examples/points.shp",
						 format :      $scope.options.format[0],
						 targetStore : $scope.options.targetStore[0],
						
						 featureString: "points",
						 attribute: "osm_id",
						 ignore: "UNK",
						 type: "points",
						 name: "name",
						 dclass: "type",
						 
						 nsPrefix: "georesource",
						 nsURI: "http://geoknow.eu/geodata#",
						 ontologyNSPrefix: "geo",
						 ontologyNS: "http://www.opengis.net/ont/geosparql#"
						}
			}
			
			if(example === "dbExample"){
				for(var i=0; i<$scope.databases.length; i++){
					if($scope.databases[i].label === name){
						$scope.options.dataParams = false;
						$scope.options.dbParams = true;
						$scope.options.job = "db";
						$scope.options.database = false;
						$scope.options.inputDisplay = true;
						
						$scope.tripleGeoConfig = {
								
								 inputDisplay: $scope.databases[i].dbName,
								
								 format :      $scope.options.format[0],
								 targetStore : $scope.options.targetStore[0],
								 
								 dbtype: $scope.options.dbtype[0], //$scope.databases[i].dbtype.substring(3),
								 dbName: $scope.databases[i].dbName,
								 dbUserName: $scope.databases[i].dbUser,
								 dbPassword: $scope.databases[i].dbPassword,
								 dbHost: $scope.databases[i].dbHost,
								 dbPort: $scope.databases[i].dbPort,
								 resourceName: "",
								 tableName: "",
								 condition: "",
								 labelColumnName: "",
								 nameColumnName: "",
								 classColumnName: "",
								 geometryColumnName: "",
								 ignore: "",
								 
								 nsPrefix: "georesource",
								 nsURI: "http://geoknow.eu/geodata#",
								 ontologyNSPrefix: "geo",
								 ontologyNS: "http://www.opengis.net/ont/geosparql#"
						}
					}
				}
			}
	}
	
	$scope.loadShapeFile = function($files){
		$scope.options.fileExample = false;
		$scope.options.displayConfigUpload = true;
		inputFileName = $files[0].name;
		$('#dummyShapeInput').val(inputFileName);
		$scope.configForm = true;
		}

	$scope.loadConfigFile = function($files){
		
		for (var i = 0; i < $files.length; i++) {
		      var $file = $files[i];
		      $http.uploadFile({
		        url: 'UploadServlet', //upload.php script, node.js route, or servlet uplaod url)
		        file: $file
		      }).then(function(response, status, headers, config) {
		        // file is uploaded successfully
		    	  
		    	  var filename = $files[0].name;
		    	  $('#dummyConfigInput').val(filename);
		  		
					$http({
							method: "POST",
							url: "http://localhost:8080/TripleGeoServlet/LoadFile",
							params: {
									file : filename,
									shp: inputFileName
									}
				      	}).then(function(data) {
				      			for(var i=0; i<configArray.length; i++){
					      			for(var j=0; j<data.data.length; j++){
					      				if(configArray[i][0] === data.data[j][0]){
					      					configArray[i][1] = data.data[j][1];
					      				}
					      			}
				      			}
				      			
						    	$scope.tripleGeoConfig = {
										 inputFile :   data.data[0][0],
										 format:      configArray[0][1],
										 targetStore: configArray[1][1],
										
										 featureString: configArray[2][1],
										 attribute: configArray[3][1],
										 ignore: configArray[4][1],
										 type: configArray[5][1],
										 name: configArray[6][1],
										 dclass: configArray[7][1],
										 
										 nsPrefix: configArray[8][1],
										 nsURI: configArray[9][1],
										 ontologyNSPrefix: configArray[10][1],
										 ontologyNS: configArray[11][1],
										 
										 sourceRS: configArray[12][1],
										 targetRS: configArray[13][1],
											 
										 defaultLang: configArray[14][1],
										}
						    	
					      });
		    	  
		        if(response.data.status=="FAIL"){
		          uploadError = true;
		          $scope.uploadMessage=response.data.message;
		        }
		        else {
		          uploadError = false;
		          uploadedFiles = $file.name;
		        }
		      }); 
		    }
	}
	
	$scope.startTripleGeo= function(){
		
		$scope.configOptions = false;
	  	$scope.showProgress = true;
		
		if($scope.options.job == "file" || $scope.options.job == "example"){
			params = {
					 job: $scope.options.job,
					
					 format: $scope.tripleGeoConfig.format,
					 targetStore: $scope.tripleGeoConfig.targetStore,
					 inputFile : $scope.tripleGeoConfig.inputFile,
					 
					 featureString: $scope.tripleGeoConfig.featureString,
					 attribute: $scope.tripleGeoConfig.attribute,
					 ignore: $scope.tripleGeoConfig.ignore,
					 type: $scope.tripleGeoConfig.type,
					 name: $scope.tripleGeoConfig.name,
					 dclass: $scope.tripleGeoConfig.dclass,
					 
					 nsPrefix: $scope.tripleGeoConfig.nsPrefix,
					 nsURI: $scope.tripleGeoConfig.nsURI,
					 ontologyNSPrefix: $scope.tripleGeoConfig.ontologyNSPrefix,
					 ontologyNS: $scope.tripleGeoConfig.ontologyNS,
					 
					 sourceRS: $scope.tripleGeoConfig.sourceRS,
					 targetRS: $scope.tripleGeoConfig.targetRS,
					 
					 defaultLang: $scope.tripleGeoConfig.defaultLang,
				   };
		}
		
		if($scope.options.job == "db"){
			params = {
					 job: $scope.options.job,
					
					 format: $scope.tripleGeoConfig.format,
					 targetStore: $scope.tripleGeoConfig.targetStore,
					 
					 dbType: ($('#dbtype').prop("selectedIndex")+1),
					 dbName: $scope.tripleGeoConfig.dbName,
					 dbUserName: $scope.tripleGeoConfig.dbUserName,
					 dbPassword: $scope.tripleGeoConfig.dbPassword,
					 dbHost: $scope.tripleGeoConfig.dbHost,
					 dbPort: $scope.tripleGeoConfig.dbPort,
					 resourceName: $scope.tripleGeoConfig.resourceName,
					 tableName: $scope.tripleGeoConfig.tableName,
					 condition: $scope.tripleGeoConfig.condition,
					 labelColumnName: $scope.tripleGeoConfig.labelColumnName,
					 nameColumnName: $scope.tripleGeoConfig.nameColumnName,
					 classColumnName: $scope.tripleGeoConfig.classColumnName,
					 geometryColumnName: $scope.tripleGeoConfig.geometryColumnName,
					 ignore: $scope.tripleGeoConfig.ignore,
					 
					 nsPrefix: $scope.tripleGeoConfig.nsPrefix,
					 nsURI: $scope.tripleGeoConfig.nsURI,
					 ontologyNSPrefix: $scope.tripleGeoConfig.ontologyNSPrefix,
					 ontologyNS: $scope.tripleGeoConfig.ontologyNS,
					 
					 sourceRS: $scope.tripleGeoConfig.sourceRS,
					 targetRS: $scope.tripleGeoConfig.targetRS,
					 
					 defaultLang: $scope.tripleGeoConfig.defaultLang,
				   };
		}
			
			$http({
				url: "http://localhost:8080/TripleGeoServlet/TripleGeoRun",
		        method: "POST",
		        params: params,
		        dataType: "json",
		        contentType: "application/json; charset=utf-8"
		      }).then(function(data) {
		    	$scope.stTripleGeo = false;
		    	$scope.showProgress = false;
		    	$scope.reviewTripleGeoResult(data.data);
		      });
			
		}
	
	$scope.reviewTripleGeoResult = function(filetype){
			
		$scope.configOptions = false;
	  	$scope.showProgress = true;
	  	
	  	params = { filetype : filetype };
	  	
		$http({
			url: "http://localhost:8080/TripleGeoServlet/TripleGeoReview",
	        method: "POST",
	        params: params,
	        dataType: "json",
	        contentType: "application/json; charset=utf-8"
	      }).then(function(data){
	    	  		var results = data.data[0];
  	  				results = results.substring(13,results.length-3);
	    	  		$scope.results = results;
	    		  	$scope.enterConfig = false;
	    		  	$scope.showProgress = false;
	  	    		$scope.inputForm = false;
	  	    		$scope.reviewForm = true;
	  	    		
	      		});
		}
}

/*
app.controller('OpenMap', function OpenMap($scope, $timeout, $log){

  var map = new OpenLayers.Map( 'map', {controls:[
         new OpenLayers.Control.Navigation(),
         new OpenLayers.Control.PanZoomBar(),
         //new OpenLayers.Control.LayerSwitcher(),
         new OpenLayers.Control.Attribution()],
         units: 'm',
     });
  var layer = new OpenLayers.Layer.OSM( "Biel/Bienne Map");
  map.addLayer(layer);
  map.setCenter(
      new OpenLayers.LonLat(7.25 , 47.133333).transform(
          new OpenLayers.Projection("EPSG:4326"),
          map.getProjectionObject()
      ), 13 
  );
});

var OpenMapWindow = function ($scope, $timeout, $log) {
	
	var map = new OpenLayers.Map( 'map', {controls:[
         new OpenLayers.Control.Navigation(),
         new OpenLayers.Control.PanZoomBar(),
         //new OpenLayers.Control.LayerSwitcher(),
         new OpenLayers.Control.Attribution()],
         units: 'm',
     });
  var layer = new OpenLayers.Layer.OSM( "Biel/Bienne Map");
  map.addLayer(layer);
  map.setCenter(
      new OpenLayers.LonLat(7.25 , 47.133333).transform(
          new OpenLayers.Projection("EPSG:4326"),
          map.getProjectionObject()
      ), 13 
  );
};
	
var GoogleMapWindow = function ($scope, $timeout, $log) {
	var map;

  var mapOptions = {
    zoom: 14,
    center: new google.maps.LatLng(47.126776, 7.24),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  
  map = new google.maps.Map(document.getElementById('map'),
      mapOptions);

};
*/

var ImportFormCtrl = function($scope, $http, ConfigurationService, flash) {

	$scope.namedGraphs = ConfigurationService.getAllNamedGraphs();
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.uploadMessage = '';
		  
	var uploadError = false;
  var uploading = false;
	var importing = false;
	var uploadedFiles = null;
		
  $scope.importSparql = { sparqlQuery : "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o } LIMIT 10"};

	$scope.sourceTypes = [
		{value:'file', label:'File'},
		{value:'url', label:'URL'},
		{value:'query', label:'SPARQL Query'}
	];
	var type = '';

  $scope.fileElements = false;
  $scope.urlElements = false;
  $scope.queryElements = false;
		
  $scope.updateForm = function() {
    if($scope.sourceType.value == 'file'){
    	$scope.fileElements = true;	
		  $scope.urlElements = false;
  		$scope.queryElements = false;
    }
    else if($scope.sourceType.value == 'url'){
    	$scope.fileElements = false;	
		  $scope.urlElements = true;
  		$scope.queryElements = false;
    }
    else if($scope.sourceType.value == 'query'){
    	$scope.fileElements = false;	
		  $scope.urlElements = false;
  		$scope.queryElements = true;
    }
    type = $scope.sourceType.value;
  };
	
	$scope.onFileSelect = function($files) {
  	uploading = true;
    //$files: an array of files selected, each file has name, size, and type.
    for (var i = 0; i < $files.length; i++) {
      var $file = $files[i];
      $http.uploadFile({
        url: 'UploadServlet', //upload.php script, node.js route, or servlet uplaod url)
        file: $file
      }).then(function(response, status, headers, config) {
        // file is uploaded successfully
        if(response.data.status=="FAIL"){
          uploadError = true;
          $scope.uploadMessage=response.data.message;
        }
        else {
          uploadError = false;
          uploadedFiles = $file.name;
          //Use response.data.results to get the file location;
        }
  			uploading = false;
      }); 
    }
  };

  $scope.uploadedError =  function(){
    return uploadError;
  };

  $scope.isUploading =  function(){
    return uploading;
  };

  $scope.isImporting =  function(){
    return importing;
  };

  $scope.isInvalid = function(){
    var invalid =true;
    if(!$scope.fileForm.$invalid){
        if(uploadedFiles!= null){
          invalid = false;
        }
    }
    return invalid;
  };

  $scope.import = function(){
    // validate the input fields accoding to the import type
    var parameters;
    importing = true;
    if(type == 'file'){
      parameters ={
        rdfFiles: uploadedFiles, 
        endpoint: ConfigurationService.getSPARQLEndpoint(), 
        graph: $scope.importFile.graph.replace(':',ConfigurationService.getUriBase()), 
        uriBase : ConfigurationService.getUriBase()
      };
      
    }
    else if(type == 'url'){
      parameters ={
        rdfUrl: $scope.importUrl.inputUrl, 
        endpoint: ConfigurationService.getSPARQLEndpoint(), 
        graph: $scope.importUrl.graph.replace(':',ConfigurationService.getUriBase()), 
        uriBase : ConfigurationService.getUriBase() 
      };

    }
    else if(type == 'query'){
      parameters ={
        rdfQuery: $scope.importSparql.sparqlQuery,
        rdfQueryEndpoint: $scope.importSparql.endPoint, 
        endpoint: ConfigurationService.getSPARQLEndpoint(), 
        graph: $scope.importSparql.graph.replace(':',ConfigurationService.getUriBase()), 
        uriBase : ConfigurationService.getUriBase() 
      };
    }
    $http({
        url: 'ImportRDF', 
        method: "POST",
        params: parameters,
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      })
      .success(function (data, status, headers, config){
        if(data.status=="FAIL"){
          flash.error = data.message;
          importing = false;
        }
        else{
          flash.success = data.message;
          $scope.resetValues();
        }
      })
      .error(function(data, status, headers, config) {
          flash.error = data;
          $scope.resetValues();
      });
  };

  $scope.resetValues = function(){
    uploadError = false;
    uploadedFiles = null;
    importing = false;

    $scope.urlForm.$setPristine();
    $scope.fileForm.$setPristine();
    $scope.sparqlForm.$setPristine();

    $scope.fileForm.fileName.value = null;

    $scope.importFile = {file:"", graph:"?"};
    $scope.importUrl = {url:"", graph:"?"};
    $scope.importSparql = {endpoint:"", sparqlQuery:"", graph:"?"};
  }
};


var DataSourceTabCtrl = function($scope, $window, $location) {

  // The tab directive will use this data
  $scope.tabs = ['SPARQL Endpoint', 'Relational Database'];
  $scope.tabs.index = 0;
  $scope.tabs.active = function() { 
    return $scope.tabs[$scope.tabs.index]; 
    }
  
};

