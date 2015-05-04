'use strict';

/****************************************************************************************************
*
* GEOLIFT Controller
*
***************************************************************************************************/

var DeerCtrl = function($scope, $http, ConfigurationService, ComponentsService, flash, ServerErrorResponse, $window, AccountService, GraphService){
	
	var componentUri ="http://generator.geoknow.eu/resource/DEER";
	var serviceUri = "http://generator.geoknow.eu/resource/DEERService";

	ComponentsService.getComponent(componentUri).then(
		//success
		function(response){
			$scope.component = response;
			$scope.sevice = ComponentsService.getComponentService(serviceUri, $scope.component);
			if($scope.sevice== null)
				flash.error="Service not configured: " +serviceUrl;	
		}, 
		function(response){
			flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
		});

	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.namedGraphs = [];
    GraphService.getAccessibleGraphs(true, false, true).then(function(graphs) {
	    $scope.namedGraphs = graphs;
    });
	
	$scope.inputForm = true;
	$scope.configOptions = true;
	$scope.startButton = false;
	$scope.directiveParams = {};
	$scope.useDirective = 0;
	$scope.resultURL = "";
	var importing = false;
	var sourceInput = null;
	var dataFile = null;
	var uploadError = false;
	var uploadedFiles = null;
	var count = 1;
	var idx = 0;
	var isCompletePath = 0;
	
	$scope.modOptions = [
    { label: "Choose a module"},
    { label: "nlp"},
		{ label: "dereferencing"}
   ],
	
	
	$scope.options = {
			inputFile: false,
			configFile: false,
			endpoints: false,
			datasource: [
		                 	"File",
		                 	"URI",
							//"SPARQL Endpoint"
  			                ]
	};
	
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
			$scope.options.URIExamples = false;
			$scope.options.endpoints = false;
			$scope.options.inputFile = true;
			$scope.options.configFile = false;
			$scope.inputDisplayRow = false;
		}
		if($name == "URI"){
			isCompletePath = 1;
			$scope.configOptions = true;
			$scope.addParamButton = true;
			$scope.options.URIExamples = true;
			$scope.inputDisplayRow = true;
			$scope.options.fileExamples = false;
			$scope.options.endpoints = false;
			$scope.options.inputFile = false;
			$scope.options.configFile = false;
		}
		if($name == "SPARQL Endpoint"){
			isCompletePath = 1;
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
	};
	
	$scope.URIExamples = [
							{ 	label : "http://dbpedia.org/data/Nidau", 
								params: [
											{
											index: "1",
											module: "nlp",
											parameter: "useFoxLight",
											value: "true"
												},
											{
											index: "2",
											module: "nlp",
											parameter: "useFoxLight",
											value: "true"
												},
												
											{
											index: "2",
											module: "dereferencing",
											parameter: "predicate",
											value: "http://www.w3.org/2003/01/geo/wgs84_pos#geometry"
												},
												
									]
							},
							{ 	label : "http://dbpedia.org/data/Athens", 
								params: [
											{
											index: "1",
											module: "nlp",
											parameter: "useFoxLight",
											value: "true"
												},
											{
											index: "2",
											module: "nlp",
											parameter: "useFoxLight",
											value: "true"
												},
												
											{
											index: "2",
											module: "dereferencing",
											parameter: "predicate",
											value: "http://www.w3.org/2003/01/geo/wgs84_pos#lon"
												},
												
									]
							}
					],
	
	$scope.epExamples = [
							{ 	label : "Dbpedia endpoint enrichment", 
								params: [
											{
											index: "1",
											module: "nlp",
											parameter: "useFoxLight",
											value: "true"
												},
											{
											index: "1",
											module: "nlp",
											parameter: "askEndPoint",
											value: "false"
												},
											{
											index: "2",
											module: "dereferencing",
											parameter: "predicate1",
											value: "http://www.w3.org/2003/01/geo/wgs84_pos#geometry"
												},
											{
											index: "3",
											module: "nlp",
											parameter: "LiteralProperty",
											value: "http://www.w3.org/2000/01/rdf-schema#comment"
												},
											{
											index: "3",
											module: "nlp",
											parameter: "useFoxLight",
											value: "false"
												},
											{
											index: "4",
											module: "nlp",
											parameter: "useFoxLight",
											value: "true"
												},
									]
							}
					],
					
	$scope.fileExamples = [
							{ 	label : "Berlin Turtle File", 
								params: [
															{
															index: "1",
															module: "nlp",
															parameter: "useFoxLight",
															value: "true"
																},
															{
															index: "1",
															module: "nlp",
															parameter: "askEndPoint",
															value: "false"
																},
															{
															index: "2",
															module: "dereferencing",
															parameter: "predicate1",
															value: "http://www.w3.org/2003/01/geo/wgs84_pos#geometry"
																},
															{
															index: "3",
															module: "nlp",
															parameter: "LiteralProperty",
															value: "http://www.w3.org/2000/01/rdf-schema#comment"
																},
															{
															index: "3",
															module: "nlp",
															parameter: "useFoxLight",
															value: "false"
																},
															{
															index: "4",
															module: "nlp",
															parameter: "useFoxLight",
															value: "true"
																},
													]
											},
											
											{ 	label : "Berlin N Triples File", 
												params: [
																			{
																			index: "1",
																			module: "nlp",
																			parameter: "useFoxLight",
																			value: "true"
																				},
																			{
																			index: "2",
																			module: "dereferencing",
																			parameter: "predicate1",
																			value: "http://www.w3.org/2003/01/geo/wgs84_pos#geometry"
																				},
																	]
															},
											{ 	label : "Denmark RDF File", 
													params: [
																			{
																			index: "1",
																			module: "nlp",
																			parameter: "useFoxLight",
																			value: "true"
																				},
																			{
																			index: "2",
																			module: "dereferencing",
																			parameter: "predicate1",
																			value: "http://www.w3.org/2003/01/geo/wgs84_pos#geometry"
																				},
																		]
															}
									],
									
	$scope.params = [{
						inputs : [],
						visible: false 
					}];
	
	$scope.appendInput = function(){
		
			$scope.options.URIExamples = false;
			$scope.options.fileExamples = false;
			$scope.options.configFile = false;
			$scope.addButton = true;
			$scope.params[0].inputs.push( { 
										idx : idx++, 
										index : count++
										} );

			$scope.params[0].visible = true;
			$scope.startButton = true;
		};
		
	$scope.setParams = function(modOption, index){
		
		if(modOption.label === "nlp"){
			$('#parameter'+index).empty();
			$('#paramVal'+index).empty();
			$('#parameter'+index).append('<option selected="selected" value="">Choose a parameter</option>');
			$('#parameter'+index).append('<option value="LiteralProperty">LiteralProperty</option>');
			$('#parameter'+index).append('<option value="useFoxLight">useFoxLight</option>');
			$('#parameter'+index).append('<option value="askEndPoint">askEndPoint</option>');
		}
		
		if(modOption.label === "dereferencing"){ 
			$('#parameter'+index).empty();
			$('#parameter'+index).append('<option selected="selected" value="LiteralProperty">predicate</option>');
			$('#paramVal'+index).empty();
			$('#paramVal'+index).append('<option selected="selected" value="">Choose a value</option>');
			$('#paramVal'+index).append('<option value="http://www.w3.org/2003/01/geo/wgs84_pos#lat">http://www.w3.org/2003/01/geo/wgs84_pos#lat</option>');
			$('#paramVal'+index).append('<option value="http://www.w3.org/2003/01/geo/wgs84_pos#lon">http://www.w3.org/2003/01/geo/wgs84_pos#lon</option>');
			$('#paramVal'+index).append('<option value="http://www.w3.org/2003/01/geo/wgs84_pos#geometry">http://www.w3.org/2003/01/geo/wgs84_pos#geometry</option>');
			$('#paramVal'+index).append('<option value="http://www.w3.org/2000/01/rdf-schema#label">http://www.w3.org/2000/01/rdf-schema#label</option>');
			$('#paramVal'+index).append('<option value="http://dbpedia.org/ontology/abstract">http://dbpedia.org/ontology/abstract</option>');
			$('#paramVal'+index).append('<option value="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">http://www.w3.org/1999/02/22-rdf-syntax-ns#type</option>');
		}
		
	};
	
	$scope.setValue = function(paramOption, index){
		if(paramOption === "LiteralProperty"){
			$('#paramVal'+index).empty();
			$('#paramVal'+index).append('<option selected="selected" value="">Choose a value</option>');
			$('#paramVal'+index).append('<option value="http://www.w3.org/2000/01/rdf-schema#comment">http://www.w3.org/2000/01/rdf-schema#comment</option>');
			$('#paramVal'+index).append('<option value="http://dbpedia.org/ontology/abstract">http://dbpedia.org/ontology/abstract</option>');
		}
		
		if(paramOption === "useFoxLight" || paramOption === "askEndPoint"){
			$('#paramVal'+index).empty();
			$('#paramVal'+index).append('<option selected="selected" value="">Choose a value</option>');
			$('#paramVal'+index).append('<option value="true">true</option>');
			$('#paramVal'+index).append('<option value="true">false</option>');
		}
	};
	
	$scope.addParams = function(paramOption, index){
		for(var i=0; i<$scope.params[0].inputs.length; i++){
			$scope.params[0].inputs[i].index = $('#indexid'+i).val();
			count = parseInt($('#indexid'+i).val());
		}
		count++;
	};
	
	$scope.removeInput = function ( index ) {
	  $scope.params[0].inputs.splice( index, 1 );
	  if($scope.params[0].inputs.length === 0){
	  	$scope.params[0].visible = false;
	  }
	  if($scope.params[0].inputs.length === 0)
	  	$scope.startButton = false;
	};
	
	$scope.FillForm = function(example){
		
		//$scope.directiveParams = {};
		$scope.params[0].inputs = [];
		$scope.startButton = false;
		count = 0;
		$scope.useDirective = 1;
		$scope.addParamButton = false;
		$scope.addButton = false;
		
		if(example === "Dbpedia endpoint enrichment"){
			
			isCompletePath = 1;
			$scope.endpointSelect = $scope.endpoints[0];
			sourceInput = $scope.endpointSelect.endpoint;
			$scope.inputDisplay = sourceInput;
			$scope.options.endpoints = false;
			$scope.endpointSelect = false;
			$scope.inputDisplayRow = false;
			
			for(var i=0; i<$scope.epExamples[0].params.length; i++){
				
				$scope.params[0].inputs.push({
					idx: i,
					index: $scope.epExamples[0].params[i].index,
					module: $scope.epExamples[0].params[i].module,
					parameter: "",
					value: ""
				});

				$scope.params[0].visible = true;
				$scope.startButton = true;
				count = $scope.epExamples[0].params[i].index;
			}
		}
		
		if(example === "http://dbpedia.org/data/Nidau"){
			
			isCompletePath = 1;
			$scope.inputDisplay = example;
			$scope.options.endpoints = false;
			$scope.endpointSelect = false;
			$scope.inputDisplayRow = false;
			$scope.exampleName = example;
			$scope.directiveParams = $scope.URIExamples[0].params;
			
			for(var i=0; i<$scope.URIExamples[0].params.length; i++){
				
				$scope.params[0].inputs.push({
					idx: i,
					index: $scope.URIExamples[0].params[i].index
				});
				
				$scope.params[0].visible = true;
				$scope.startButton = true;
				count = $scope.epExamples[0].params[i].index;
			}
			count = 3;
		}
		
		if(example === "http://dbpedia.org/data/Athens"){
					
					isCompletePath = 1;
					$scope.inputDisplay = example;
					$scope.options.endpoints = false;
					$scope.endpointSelect = false;
					$scope.inputDisplayRow = false;
					$scope.exampleName = example;
					$scope.directiveParams = $scope.URIExamples[0].params;
					
					for(var i=0; i<$scope.URIExamples[0].params.length; i++){
						
						$scope.params[0].inputs.push({
							idx: i,
							index: $scope.URIExamples[0].params[i].index
						});
						
						$scope.params[0].visible = true;
						$scope.startButton = true;
						count = $scope.epExamples[0].params[i].index;
					}
					count = 3;
				}
		
		if(example === "http://dbpedia.org/data/Greece"){
			
			isCompletePath = 1;
			$scope.inputDisplay = example;
			$scope.options.endpoints = false;
			$scope.endpointSelect = false;
			$scope.inputDisplayRow = false;
			$scope.exampleName = example;
			$scope.directiveParams = $scope.URIExamples[0].params;
			
			for(var i=0; i<$scope.URIExamples[0].params.length; i++){
				
				$scope.params[0].inputs.push({
					idx: i,
					index: $scope.URIExamples[0].params[i].index
				});
				
				$scope.params[0].visible = true;
				$scope.startButton = true;
				count = $scope.epExamples[0].params[i].index;
			}
			count = 3;
		}
		
		if(example === "Berlin Turtle File"){
			
			isCompletePath = 0;
			$scope.options.inputFile = false;
			sourceInput = "berlin.ttl";
			$scope.inputDisplay = sourceInput;
			$scope.directiveParams = $scope.fileExamples[0].params;
					
			for(var i=0; i<$scope.fileExamples[0].params.length; i++){
						
				$scope.params[0].inputs.push({
					idx: i,
					index: $scope.fileExamples[0].params[i].index,
					module: $scope.fileExamples[0].params[i].module
				});
		
				$scope.params[0].visible = true;
				$scope.startButton = true;
			}
			count = 5;
		}
		
		if(example === "Berlin N Triples File"){
			
			isCompletePath = 0;
			$scope.options.inputFile = false;
			sourceInput = "berlin.n3";
			$scope.inputDisplay = sourceInput;
			$scope.directiveParams = $scope.fileExamples[1].params;
					
			for(var i=0; i<$scope.fileExamples[1].params.length; i++){
						
				$scope.params[0].inputs.push({
					idx: i,
					index: $scope.fileExamples[1].params[i].index,
					module: $scope.fileExamples[1].params[i].module
				});
		
				$scope.params[0].visible = true;
				$scope.startButton = true;
				count = $scope.epExamples[0].params[i].length;
			}
			count = 3;
		}
		
		if(example === "Denmark RDF File"){
			
			isCompletePath = 0;
			$scope.options.inputFile = false;
			sourceInput = "denmark.rdf";
			$scope.inputDisplay = sourceInput;
			$scope.directiveParams = $scope.fileExamples[2].params;
					
			for(var i=0; i<$scope.fileExamples[2].params.length; i++){
						
				$scope.params[0].inputs.push({
					idx: i,
					index: $scope.fileExamples[2].params[i].index,
					module: $scope.fileExamples[2].params[i].module
				});
		
				$scope.params[0].visible = true;
				$scope.startButton = true;
				count = $scope.epExamples[0].params[i].index;
			}
			count = 3;
		}
	};
	
	$scope.loadDataFile = function($files){
		$scope.options.fileExamples = false;
		$scope.options.configFile = true;
		dataFile = $files[0].name;
		$scope.inputDisplay = dataFile;
		isCompletePath = 2;
		$('#dummyGeoLiftInput').val(dataFile);
		};
	
	$scope.loadConfigFile = function($files){
		
		$scope.params[0].inputs = [];
		
		$scope.addParamButton = false;
		$scope.useDirective = 1;
	
		for (var i = 0; i < $files.length; i++) {
	    var $file = $files[i];
	    $http.uploadFile({
	      url: 'UploadServlet', //upload.php script, node.js route, or servlet uplaod url)
	      file: $file
	    	})
	    .then(function(response, status, headers, config) {
			  // file is uploaded successfully
			  var configFile = $files[0].name;
			  $('#dummyConfigInput').val(configFile);
			  		
				$http({
					method: "POST",
					url: serviceUrl+"/LoadFile",
					params: {
						configFile : configFile,
						dataFile: dataFile}
				 	})
				.then(function(data) {
					$scope.inputDisplay = data.data[0][0];
					isCompletePath = 1;
					for(var i=1; i<data.data.length; i++){
						$scope.params[0].inputs.push({
							idx: i-1,
						  	index: data.data[i][0],
					 	  	module: data.data[i][1],
					 	  	parameter: data.data[i][2],
					 	  	value: data.data[i][3],
						});
					}
					
					$scope.directiveParams = $scope.params[0].inputs;
					$scope.params[0].visible = true;
					$scope.startButton = true;
					      		
				}, function (response){ // in the case of an error      	
				 	flash.error = ServerErrorResponse.getMessage(response);
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
	};
	
	$scope.LaunchGeoLift = function(){
		
		if(isCompletePath == 1 || isCompletePath == 2){
			sourceInput = $scope.inputDisplay;
		}
		
		var params = {};
		params[0] = $scope.params[0].inputs.length;
		params[1] = sourceInput;
		params[2] = isCompletePath;
		
		for(var i=0; i<$scope.params[0].inputs.length; i++){
			$scope.params[0].inputs[i].index = parseInt($('#indexid'+i).val());
		}
		
		var predicateCounter = 1;
		var parameterText = null;
		
		for(var i=0; i<$scope.params[0].inputs.length; i++){
		  if($('#parameter'+i+' option:selected').text() == "predicate"){
			  parameterText = $('#parameter'+i+' option:selected').text()+predicateCounter++;
		  }
		  if($('#parameter'+i+' option:selected').text() != "predicate"){
			  parameterText = $('#parameter'+i+' option:selected').text();
		  }
		  params[i+3] = $scope.params[0].inputs[i].index + " " + $('#module'+i+' option:selected').text() +
		  " " + parameterText + " " + $('#paramVal'+i+' option:selected').text();
		  console.log(params[i+3]);
		}
			
		window.$windowScope = $scope;
	 	var newWindow = $window.open('popup.html#/popup-deer', 'frame', 'resizeable,height=600,width=800');
		newWindow.params = params;
		
	};
	
	$scope.StartGeoLift = function(){
		
		var params = $window.params;
		$scope.showProgress = true;
		$scope.reviewForm = false;
		
		$http({
			url: serviceUrl+"/GeoLiftRun",
	        method: "POST",
	        params: params,
	        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
      })
		.then(function() {
		  $scope.reviewGeoLiftResult();
	  	},  function (response){ // in the case of an error      	
			flash.error = ServerErrorResponse.getMessage(response);
	  });		
	};
	
	$scope.reviewGeoLiftResult = function(){
		
	  $scope.showProgress = true;
	  	
		$http({
			url: serviceUrl+"/GeoLiftReview",
	        method: "POST",
	        dataType: "json",
	        contentType: "application/json; charset=utf-8"
	      }).then(function(data){
	    	  console.log(data);
	    	  		var results = data.data[0];
	    	  		$scope.resultURL = data.data[1];
	    	  		//results = results.substring(13,results.length-3);
	    	  		$scope.results = results;
	    	  		
	    		  	$scope.showProgress = false;
	    		  	$scope.inputForm = false;
	  	    		$scope.reviewForm = true;
	  	    		//$scope.showDownload();
	  	    		
	      				}, function (response){ // in the case of an error      	
						 	flash.error = ServerErrorResponse.getMessage(response);
	  });
	};
	
	$scope.save = function(){
		
		var parameters = {
	    rdfFile: "result.ttl", 
	    endpoint: AccountService.getAccount().getUsername()== null ? ConfigurationService.getPublicSPARQLEndpoint() : ConfigurationService.getSPARQLEndpoint(),
	    graph: $scope.saveDataset.replace(':', ConfigurationService.getUriBase()), 
	    uriBase : ConfigurationService.getUriBase(),
        username: AccountService.getAccount().getUsername()
	 	};
		
		$http({
			url: serviceUrl+"/ImportRDF",
	    method: "POST",
	    dataType: "json",
	    params: parameters,
	    contentType: "application/json; charset=utf-8"
		})
	  .success(function (data, status, headers, config){
	    if(data.status=="FAIL"){
	      flash.error = data.message;
	      importing = false;
	    }
	    else{
	      flash.success = data.message;
	    }
	  })
	  .error(function(data, status, headers, config) {
	    flash.error = data;
	  });
	};
};
