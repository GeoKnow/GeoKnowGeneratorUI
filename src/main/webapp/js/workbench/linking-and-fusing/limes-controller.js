'use strict';

/****************************************************************************************************
*
* LIMES Controller
*
***************************************************************************************************/
var LimesCtrl = function($scope, $http, ConfigurationService, flash, ServerErrorResponse, $window, GraphService, AccountService){
	
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
	var endpoint = ConfigurationService.getPublicSPARQLEndpoint(); // Only supporting saving

	$scope.configOptions = true;
	$scope.inputForm = true;
	$scope.deleteProp = false;
	var importing = false;
	var uploadError = false;
	var uploadedFiles = null;
	var params = {};
	var idx = 0;
	var numberOfProps = 1;
	
	// Arrays for comparisons
	$scope.allItems = [];
	$scope.storeArray = [];
	
	$scope.examples = [
						{ name : "Ontos CRM to DBPedia" },
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
					 Granularity : 	   $scope.options.granularity[0],
					 AcceptThresh : "1",
					 ReviewThresh : "0.2", // Default setting, input is hidden
					 AcceptRelation : "owl:sameAs",
					 ReviewRelation : "owl:sameAs" // Default setting input is hidden
	};
	
	$scope.props = [{
		inputs : [{
		          idx : idx,
		          source: "",
				  target: ""
				}]
	}];

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
		
		if(example === "Ontos CRM to DBPedia"){
			
		$scope.limes = { SourceServiceURI : "http://localhost:8890/sparql",
						 TargetServiceURI  : "http://localhost:8890/sparql",
						 SourceVar: "?x",
						 TargetVar: "?y",
						 SourceSize: "1000",
						 TargetSize: "1000",
						 SourceRestr: "?x foaf:name ?e",
						 TargetRestr: "?y skos:prefLabel ?z",
						 Metric: "levenshtein(y.foaf:name, x.skos:prefLabel)",
						 OutputFormat: $scope.options.output[1],
						 ExecType: $scope.options.execType[0],
						 Granularity : 	   $scope.options.granularity[0],
						 AcceptThresh: "1",
						 ReviewThresh: "0.35",
						 AcceptRelation: "owl:sameAs",
						 ReviewRelation: "owl:sameAs" 
				};
		
		$scope.props = [{
						inputs : [{
						          idx : 0,
						          source: "foaf:name",
						          target: "skos:prefLabel"
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
								OutputFormat: $scope.options.output[1],
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
		params.ReviewRelation = $scope.limes.AcceptRelation; // Set to the same as the accept relation, 
															// otherwise it makes no sense to mix the results in the comparison table
		params.numberOfProps = numberOfProps;
		
		window.$windowScope = $scope;
 		var newWindow = $window.open('popup.html#/popup-limes', 'frame', 'resizeable,height=800,width=1200');
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
				$scope.ReviewLimes(params);   
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
	
	$scope.ReviewLimes = function(params){

		$scope.configOptions = false;
		$scope.reviewForm = false;
		$scope.differing = false;

	  $http({
			url: "TabFileReader",
	        method: "POST",
	        dataType: "json",
	        contentType: "application/json; charset=utf-8"
	      }).then(function(data){
	    	  	var reviewResult = data.data[0];
	    	  	var count = 0;
	  	  		if (reviewResult.length<3){
	  	  			// Do nothing
	  		  	}else{
	  		  		for(var i = count; i < reviewResult.length; i++){
		  		  		var cleanedUris = reviewResult[i].replace(/<|>/g,"");
	  	  				var parts = cleanedUris.split("	");
	  	  				$scope.allItems.push([]);
	  	  				$scope.allItems[count].push({"entity1" : decodeURIComponent(parts[0]),
								 					 "entity2" : decodeURIComponent(parts[1]),
								 					 "match" : 100*parts[2],
								 					 "relation" : params.AcceptRelation});
	  	  				count++;
	  		  		}
	  		  	}
	  	  		var acceptedResult = data.data[1];
	  	  		
	  	  		if (acceptedResult.length<3){
	  	  			// Do nothing
	  	  		}else{
	  	  			for(var i = 0; i < acceptedResult.length; i++){
	  	  				var cleanedUris = acceptedResult[i].replace(/<|>/g,"");
	  	  				var parts = cleanedUris.split("	");
	  	  				$scope.allItems.push([]);
	  	  				$scope.allItems[count].push({"entity1" : decodeURIComponent(parts[0]),
	  	  											 "entity2" : decodeURIComponent(parts[1]),
	  	  											 "match" : 100*parts[2],
								 					 "relation" : params.AcceptRelation});
	  	  				count++;
	  		  		}
	  	  			
	  	  		}
	  	  		
		  	  	// Sort from highest to lowest
	  	  		$scope.allItems.sort(function(a, b){
		  	  		 return b[0].match-a[0].match
		  	  		});
	  	  		// If all match values are the same it makes no sense to display the slider, therefore the values are compared first
	  	  		if($scope.allItems[($scope.allItems.length-1)][0].match != $scope.allItems[0][0].match){
	  	  			// Display slider and set slider min and max values
	  	  			$scope.differing = true;
		  	  		$('#result').slider({
						min: $scope.allItems[($scope.allItems.length-1)][0].match,
						max: $scope.allItems[0][0].match
					});
		  	  		
		  	  	// Move items from allItems into store array according to slider value
			  	$('#result').bind('slideStop', function() {
			  		console.log($scope.storeArray);
			  	      //Remove items from allItems array and store them (slider increases)
			  	  	  for(var i=($scope.allItems.length-1); i>=0; i--){
			  	  			if($scope.allItems[i][0].match < $('#result').slider('getValue')){
			  	  				$scope.storeArray.push($scope.allItems.pop());
			  	  			};
				  	  	};
				  	  	
				  	  // Put items from store back into allItems array (slider decreases)	
				  	  if ($scope.storeArray.length >= 1){
					  	  for(var i=($scope.storeArray.length-1); i>=0; i--){
				  	  			if($scope.storeArray[i][0].match > $('#result').slider('getValue')){
				  	  				$scope.allItems.push($scope.storeArray.pop());
				  	  			};
					  	  	};
				  	  }
				  	  
				  	  // Refresh results table
				  	  $scope.$digest();
				  	  
			  	  	});
	  	  		}
	  	  		
	  		  	$scope.enterConfig = false;
	  		    $scope.inputForm = false;
	  		  	$scope.showProgress = false;
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
		
		var saveDataset = $scope.saveDataset.replace(":", ConfigurationService.getUriBase());
		var allTriples = "";
		
		for(var i = 0; i < $scope.allItems.length; i++){
			allTriples = allTriples +
						 "<" + $scope.allItems[i][0].entity1 + "> " + 
						 $scope.allItems[i][0].relation + 
						 " <" + $scope.allItems[i][0].entity2 + "> . ";	
	  		};
	  	
	  	var params = {
		        endpoint: endpoint,
		        graph: saveDataset, 
		        uriBase : ConfigurationService.getUriBase(),
		        username: AccountService.getUsername(),
		        saveString: allTriples
		      	};
	  	
	  	$.ajax({ type :"post", 
	         data : { 
	        	 url: "ImportRDFString",
	 	         method: "POST",
	 	         dataType: "json",
	 	         params: params,
	 	         processData: false,
	 	         contentType: "application/json; charset=utf-8"
	        	 },
	         url : "ImportRDFString"
	      }).success(function (data, status, headers, config){
		        if(data.status=="FAIL"){
			          flash.error = data.message;
			          importing = false;
			        }
			        else{
			        	console.log(data.message);
			          flash.success = data.message;
			        }
			      })
			      .error(function(data, status, headers, config) {
			          flash.error = data;
			      });
	  	/*
	  	$http({
			url: "ImportRDFString",
	        method: "POST",
	        dataType: "json",
	        params: params,
	        processData: false,
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
		/*
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
		*/
	};
};
