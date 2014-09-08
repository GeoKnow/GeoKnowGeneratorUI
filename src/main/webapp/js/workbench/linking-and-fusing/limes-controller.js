'use strict';

/****************************************************************************************************
*
* LIMES Controller
*
***************************************************************************************************/
var LimesCtrl = function($scope, $http, ConfigurationService, flash, ServerErrorResponse, $window, GraphService, AccountService){
	
	$scope.component = ConfigurationService.getComponent(":Limes");
	var services = ConfigurationService.getComponentServices(":Limes");
	var serviceUrl = services[0].serviceUrl;
	
	// parameters for saving results
	$scope.namedGraphs = [];
    GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
	    $scope.namedGraphs = graphs;
    });
	$scope.defaultEndpoint = ConfigurationService.getSPARQLEndpoint();
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.uriBase = ConfigurationService.getUriBase();
	$scope.importServiceUrl = serviceUrl+"/ImportRDF";

	$scope.configOptions = true;
	$scope.inputForm = true;
	$scope.deleteProp = false;
	var importing = false;
	var uploadError = false;
	var uploadedFiles = null;
	var params = {};
	var idx = 0;
	var numberOfProps = 1;
	
	$scope.examples = [
						{ name : "Duplicate Dbpedia country entries for the CET time zone" },
						{ name : "Geo Data" }
					];
	
	$scope.options = { 	output: [
			                "N3" ,
			                "TAB" ,
			                "TURTLE" 
			                ],
						execType: [
			                "Simple" ,
			                "FILTER" ,
			                "OneToOne" 
			                ],
					    granularity: [
							"1" ,
							"2" ,
							"3" ,
							"4" ]
					};
	
	$scope.limes = { OutputFormat :    $scope.options.output[0],
					 ExecType :        $scope.options.execType[0],
					 Granularity : 	   $scope.options.granularity[0]
	};
	
	$scope.props = [{
		inputs : [{
		          idx : idx,
		          source: "",
				  target: ""
				}]
	}];

	$scope.component.offline = false;
	
  $http.get(serviceUrl).then( function ( response ) {
  }, function ( response ) {
   	$scope.component.offline = true;
  });

	$scope.appendInput = function(source, target){
		idx++;
		$scope.props[0].inputs.push({ 
								idx : idx,
								source: source,
								target: target
								});
		numberOfProps++;
		$scope.deleteProp = true;
	};
	
	$scope.removeInput = function () {
		
		  $scope.props[0].inputs.splice( (numberOfProps-1) , 1 );
		  numberOfProps--;
		  
		  if(numberOfProps === 1){
			  $scope.deleteProp = false;
		  }
		  
	};
	
	$scope.FillForm = function(example){
		
		params = {};
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
						 Metric: "levenshtein(y.rdfs:label, x.rdfs:label)",
						 OutputFormat: $scope.options.output[0],
						 ExecType: $scope.options.execType[0],
						 Granularity : 	   $scope.options.granularity[0],
						 AcceptThresh: "1",
						 ReviewThresh: "0.95",
						 AcceptRelation: "owl:sameAs",
						 ReviewRelation: "owl:sameAs" 
				};
		
		$scope.props = [{
						inputs : [{
						          idx : 0,
						          source: "rdfs:label",
						          target: "rdfs:label"
								}]
						}];
			idx++;
		}
		
		if(example === "Geo Data"){

			$scope.limes = { 	SourceServiceURI : "http://linkedgeodata.org/sparql",
								TargetServiceURI : "http://linkedgeodata.org/sparql",
								SourceVar: "?x",
								TargetVar: "?y",
								SourceSize: "2000",
								TargetSize: "2000",
								SourceRestr: "?x a lgdo:RelayBox",
								TargetRestr: "?y a lgdo:RelayBox",
								Metric: "hausdorff(x.polygon, y.polygon)",
								OutputFormat: $scope.options.output[0],
								ExecType: $scope.options.execType[0],
								Granularity : $scope.options.granularity[0],
								AcceptThresh: "0.9",
								ReviewThresh: "0.5",
								AcceptRelation: "lgdo:near",
								ReviewRelation: "lgdo:near"
									};
		
			$scope.props = [{
							inputs : [{
							          idx : 0,
							          source: "geom:geometry/geos:asWKT RENAME polygon",
							          target: "geom:geometry/geos:asWKT RENAME polygon"
									}
							/*
									{
								          idx : 1,
								          source: "geom:geometry/geos:asWKT RENAME polygon",
								          target: "geom:geometry/geos:asWKT RENAME polygon"
										}*/]
							}];
				//idx++;
				//numberOfProps++;
				
			}
		};
	
$scope.LaunchLimes = function(){
		
		var SourceGraph = null;
		var TargetGraph = null;
		var SourceRestr = null;
		var TargetRestr = null;
		
		
		if($scope.limes.SourceGraph != null){
			SourceGraph = $scope.limes.SourceGraph.replace(':', ConfigurationService.getUriBase());
		}
		if($scope.limes.TargetGraph != null){
			TargetGraph = $scope.limes.TargetGraph.replace(':', ConfigurationService.getUriBase());
		}

		if($scope.limes.SourceRestr.length != 0){
			SourceRestr = $scope.limes.SourceRestr;
		}
		
		if($scope.limes.TargetRestr.length != 0){
			TargetRestr = $scope.limes.TargetRestr;
		}
		
		$scope.propsCopy = [{
			inputs : []
		}];
		
		for(var i=0; i<numberOfProps; i++){
			if($("#SourceProp"+i).val().length != 0 || $("#TargetProp"+i).val().length != 0){
				$scope.propsCopy[0].inputs.push({ 
					idx : i,
					source: $("#SourceProp"+i).val(),
					target: $("#TargetProp"+i).val()
					});
				}
		}
		
		numberOfProps = $scope.propsCopy[0].inputs.length;
		
		var params = {};
		
		for(var i=0; i<numberOfProps; i++){
			var SourceProp = "SourceProp"+i;
			var TargetProp = "TargetProp"+i;
			params[SourceProp] = $scope.propsCopy[0].inputs[i].source;
			params[TargetProp] = $scope.propsCopy[0].inputs[i].target;
		};
		
		params.SourceServiceURI = $scope.limes.SourceServiceURI;
		params.TargetServiceURI = $scope.limes.TargetServiceURI;
		params.SourceGraph = SourceGraph;
		params.TargetGraph = TargetGraph;
		params.SourceVar = $scope.limes.SourceVar;
		params.TargetVar = $scope.limes.TargetVar;
		params.SourceSize = $scope.limes.SourceSize;
		params.TargetSize = $scope.limes.TargetSize;
		params.SourceRestr = SourceRestr;
		params.TargetRestr = TargetRestr;
		params.Metric = $scope.limes.Metric;
		params.Granularity = $scope.limes.Granularity;
		params.OutputFormat = $scope.limes.OutputFormat;
		params.ExecType = $scope.limes.ExecType;
		params.AcceptThresh = $scope.limes.AcceptThresh;
		params.ReviewThresh = $scope.limes.ReviewThresh;
		params.AcceptRelation = $scope.limes.AcceptRelation;
		params.ReviewRelation = $scope.limes.ReviewRelation;
		params.numberOfProps = numberOfProps;
		
		window.$windowScope = $scope;
 		var newWindow = $window.open('popup.html#/popup-limes', 'frame', 'resizeable,height=600,width=800');
 		console.log(params);
		newWindow.params = params;
	};
		
	$scope.StartLimes = function(){
		
			var params = $window.params;
			$scope.showProgress = true;
			$http({
					url: serviceUrl+"/LimesRun",
			        method: "POST",
			        params: params,
			        dataType: "json",
			        contentType: "application/json; charset=utf-8"})
		  .success(function (data, status, headers, config){
	    	// to get the file list of results instead of review 
	    	// $scope.ReviewLimes();
	      // }, function (response){ // in the case of an error      	
	
	      if(data.status=="SUCCESS"){
	        
	       	$scope.startLimes = false;
		    	$scope.showProgress = false;
		    	$scope.inputForm = true;
		    	flash.success = data.message;
		    	// get the files inside data.results, and these are to be proposed to be downloaded
		    	// in this case probably LimesReview is not required anymore...
				$scope.ReviewLimes();   
	      }
	      else {
			        flash.error = data.message;
			        $scope.startLimes = false;
		    	    $scope.showProgress = false;
	      	}}).error(function(data, status, headers, config) {
			        flash.error = ServerErrorResponse.getMessage(data.message);
			        $scope.startLimes = false;
				    $scope.showProgress = false;});

	};
	
	$scope.ReviewLimes = function(){

		$scope.configOptions = false;
		$scope.reviewForm = false;

	  $http({
			url: serviceUrl+"/LimesReview",
	        method: "POST",
	        dataType: "json",
	        contentType: "application/json; charset=utf-8"
	      }).then(function(data){
	    	    console.log(data);
	    	  	var result = data.data[0];
	  	  		if (result.length<3){
	  	  			$scope.limes.reviewResults = "No results to review";
	  		  	}else{
	  		  		$scope.limes.reviewResults = result;
	  		  	}
	  	  		
	  	  		result = data.data[1];
	  	  		if (result.length<3){
	  	  			$scope.limes.acceptedResults = "No results meet the acceptance threshold";
	  	  		}else{
	  	  			$scope.limes.acceptedResults = result;
	  	  		}
	  	  		
	  		  	$scope.enterConfig = false;
	  		  	$scope.showProgress = false;
	    			$scope.inputForm = false;
		    		$scope.reviewForm = true;
	  		 }, function (response){ // in the case of an error 
	  			console.log(response);
	  			$scope.startLimes = false;
		    	$scope.showProgress = false;
		    	$scope.inputForm = true;
		    	$scope.reviewForm = false;
		    	flash.error = ServerErrorResponse.getMessage(response.status);
	    });
	      
	};
	
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
						url: serviceUrl+"/LoadFile",
						params: {file : filename}})

					.then(function(data) {
						
						$scope.limes = { 
							SourceServiceURI : data.data[0][0],
							TargetServiceURI  : data.data[1][0],
							SourceVar: data.data[0][1],
							TargetVar: data.data[1][1],
							SourceSize: data.data[0][2],
							TargetSize: data.data[1][2],
							SourceRestr: data.data[0][3],
							TargetRestr: data.data[1][3],
							Metric: data.data[2],
							OutputFormat: data.data[5],
							ExecType: data.data[7],
							Granularity: data.data[6],
							AcceptThresh: data.data[3][0],
							ReviewThresh: data.data[4][0],
							AcceptRelation: data.data[3][1],
							ReviewRelation: data.data[4][1] 
						};
						
						idx=0;
						
						$scope.props = [{
							inputs : []
						}];
						
						for(var i=0; i<data.data[8].length; i++){
							
							$scope.props[0].inputs.push({ 
								idx : idx,
								source: data.data[8][i],
								target: data.data[9][i]
								});
							
							idx++;
							
						};
						
						numberOfProps = data.data[8].length;
						
						$scope.enterConfig = true;
						$scope.startLimes = true;
						
					}, function (response){ // in the case of an error
						flash.error = "Invalid LIMES Configuration file: " +response.data;
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
	
	$scope.save = function(){
			
		var parameters = { 
        endpoint: AccountService.getUsername() == null ? ConfigurationService.getPublicSPARQLEndpoint() : ConfigurationService.getSPARQLEndpoint(),
   		uriBase : ConfigurationService.getUriBase()
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
		      console.log(data);
		      // add the graph metadata to settingsGraph
		      var now = Helpers.getCurrentDate();
		      var newGraph = {  name:"" ,  graph: {
					  	created : now, endpoint: ConfigurationService.getSPARQLEndpoint(), 
					  	description: "", 
					  	modified: now, label:"" 
						}};
					var sucess;
			    for (var res in data.result){
			     	var graphName = data.result[res].replace(ConfigurationService.getUriBase() ,":");
			     	if (graphName.indexOf("accepted") >= 0){
			     		newGraph.name = graphName;
			     		newGraph.graph.description = "Accepted results from LIMES";
			     		newGraph.graph.label = "LIMES Accepted";
			     		sucess  = GraphService.addGraph(newGraph);
			     		// TODO: handle succes/error
			     	}
						if (graphName.indexOf("review") >= 0){
			     		newGraph.name = graphName;
			     		newGraph.graph.description = "Results to review from LIMES";
			     		newGraph.graph.label = "LIMES review";
				   		sucess = GraphService.addGraph(newGraph);
				   		console.log(newGraph);
			     		// TODO: handle succes/error
			     	}
			    }
			  }
			})
			.error(function(data, status, headers, config) {
			  flash.error = data;
		});
	};
};
