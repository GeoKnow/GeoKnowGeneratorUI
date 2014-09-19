'use strict';

/****************************************************************************************************
*
* LIMES Controller
*
***************************************************************************************************/

var LimesCtrl = function($scope, $http, ConfigurationService, flash, ServerErrorResponse, $window, GraphService, AccountService, $timeout, Ns){
	
	$scope.component = ConfigurationService.getComponent(":Limes");
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.uriBase = ConfigurationService.getUriBase();
	$scope.configOptions = true;
	$scope.inputForm = true;
	$scope.deleteProp = false;
	
	var services = ConfigurationService.getComponentServices(":Limes");
	var workbench = ConfigurationService.getComponent(ConfigurationService.getFrameworkUri());
	var serviceUrl = services[0].serviceUrl;
	console.log(workbench.homepage);

	var importing = false;
	var uploadError = false;
	var uploadedFiles = null;

	var idx = 0;
	var numberOfProps = 1;
	
	// Arrays for comparisons
	$scope.allItems = [];
	$scope.storeArray = [];
	
	var SourceServiceURI = null;
	var TargetServiceURI = null;

	$scope.examples = [
						{ name : "Authorization Demo" },
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

	$scope.component.offline = false;
	
  $http.get(serviceUrl).then( function(response) {
  	$scope.component.offline = false;
  }, function(response) {
   	$scope.component.offline = true;
  });

  $scope.updateSourceGraphs = function(){
  	if( $scope.limes.SourceServiceURI == ConfigurationService.getSPARQLEndpoint())
				GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
    			$scope.namedSourceGraphs = graphs;
    		});
		else
			$scope.namedSourceGraphs = {};
  };

  $scope.updateTargetGraphs = function(){
  	if( $scope.limes.TargetServiceURI == ConfigurationService.getSPARQLEndpoint())
			GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
    		$scope.namedTargetGraphs = graphs;
    	});
		else
			$scope.namedTargetGraphs = {};
  };

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

		$scope.enterConfig = true;
		$scope.startLimes = true;
		
		if(example === "Authorization Demo"){
			alert("this demo requires of a private graph :cantons loaded with cantons-data.admin.ch.rdf ");
			$scope.limes.SourceServiceURI = ConfigurationService.getSPARQLEndpoint();
			$scope.updateSourceGraphs();
			
			$scope.limes = { SourceServiceURI : ConfigurationService.getSPARQLEndpoint(),
							 TargetServiceURI  : "http://data.admin.ch/sparql",
							 SourceGraph : ":cantons",
							 SourceVar: "?x",
							 TargetVar: "?y",
							 SourceSize: "1000",
							 TargetSize: "5000",
							 SourceRestr: "?x a ch:Canton",
							 TargetRestr: "?y a gz:Canton",
							 Metric: "trigrams(x.rdfs:label, y.gz:cantonLongName)",
							 OutputFormat: $scope.options.output[0],
							 ExecType: $scope.options.execType[0],
							 Granularity : 	   $scope.options.granularity[0],
							 AcceptThresh: "0.1",
							 ReviewThresh: "0.1",
							 AcceptRelation: "owl:sameAs",
							 ReviewRelation: "owl:sameAs",
							 prefixes: Ns.getMap(["rdfs","gz","owl","ch"])
					};
			
			$scope.props = [{
				inputs : [{
				          idx : 0,
				          source: "rdfs:label",
				          target: "gz:cantonLongName"
						}]
				}];
			idx++;
		}
		
		if(example === "Duplicate Dbpedia country entries for the CET time zone"){
			
			$scope.limes = { SourceServiceURI : "http://dbpedia.org/sparql",
						 TargetServiceURI  : "http://dbpedia.org/sparql",
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
						 ReviewRelation: "owl:sameAs",
						 prefixes: Ns.getMap(["foaf","skos","owl"])
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
								ReviewRelation: "lgdo:near",
								prefixes: Ns.getMap(["lgdo","geom","geos"])
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
	
		SourceServiceURI = $scope.limes.SourceServiceURI;
		TargetServiceURI = $scope.limes.TargetServiceURI;

		if($scope.limes.SourceServiceURI == ConfigurationService.getSPARQLEndpoint() ||
			 $scope.limes.TargetServiceURI == ConfigurationService.getSPARQLEndpoint()) {
				AccountService.createSession().then(function(response){
					if($scope.limes.SourceServiceURI == ConfigurationService.getSPARQLEndpoint())
						SourceServiceURI = workbench.homepage + response.data.endpoint;
					if($scope.limes.TargetServiceURI == ConfigurationService.getSPARQLEndpoint())
						TargetServiceURI = workbench.homepage + response.data.endpoint;
					$scope.setParams();
				});
		}
		else $scope.setParams();
	};
	
	$scope.setParams = function(){
		
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
		
		var params = {
      "sourceserviceuri" : SourceServiceURI,
      "targetserviceuri" : TargetServiceURI,
      "sourcegraph" : SourceGraph,
      "targetgraph" : TargetGraph,
      "sourcevar" : $scope.limes.SourceVar,
      "targetvar" : $scope.limes.TargetVar,
      "sourcesize" : $scope.limes.SourceSize,
      "targetsize" : $scope.limes.TargetSize,
      "sourcerestr" : SourceRestr,
      "targetrestr" : TargetRestr,
      "metric" : $scope.limes.Metric,
      "granularity" : $scope.limes.Granularity,
      "outputformat" : $scope.limes.OutputFormat,
      "exectype" : $scope.limes.ExecType,
      "acceptthresh" : $scope.limes.AcceptThresh,
      "reviewthresh" : $scope.limes.ReviewThresh,
      "acceptrelation" : $scope.limes.AcceptRelation,
      "reviewrelation" : $scope.limes.AcceptRelation
		};
		
		params["prefixes"] = $scope.limes.prefixes;
		params["sourceprop"] = [];
		params["targetprop"] = [];

		for(var i=0; i<numberOfProps; i++){
			params["sourceprop"][i]=$scope.propsCopy[0].inputs[i].source;
			params["targetprop"][i]=$scope.propsCopy[0].inputs[i].target;
		};		

		$timeout(function() {
			window.$windowScope = $scope;
	 		var newWindow = $window.open('popup.html#/popup-limes', 'frame', 'resizeable,height=600,width=800');
			newWindow.params = params;
			});
	};
		
	$scope.StartLimes = function(){
		
			var params = $window.params;
			$scope.showProgress = true;

			$http({
					method: 'PUT',
    			url: serviceUrl+"/run",
    			headers: { 'Content-type': 'application/json'},
    			data : params })
		  	.success(function(data, status, headers, config){
	       	$scope.startLimes = false;
		    	$scope.showProgress = false;
		    	$scope.inputForm = true;
		    	flash.success = "Limes finished";
		    	// get the files inside data.results, and these are to be proposed to be downloaded
		    	// in this case probably LimesReview is not required anymore...
					$scope.ReviewLimes(data);   
	      })
		  	.error(function(response) {
			    flash.error = ServerErrorResponse.getMessage(response);
			    $scope.startLimes = false;
				  $scope.showProgress = false;
				});
	};
	
	$scope.ReviewLimes = function(config){

		console.log(config);

		$scope.configOptions = false;
		$scope.reviewForm = false;
		$scope.differing = false;

	  $http({
			url: serviceUrl+"/review/"+config.uuid,
	        method: "GET",
	        dataType: "json",
	        contentType: "application/json; charset=utf-8"
	      }).then(function(response){
	      		console.log(response);
	    	  	var reviewResult = response.data.review;
	    	  	var count = 0;
	  	  		// if (reviewResult.length<3){
	  	  		if (reviewResult.length == 0 ){
	  	  			flash.info="No results to review";
	  		  	}else{
	  		  		for(var i = count; i < reviewResult.length; i++){
		  		  		var cleanedUris = reviewResult[i].replace(/<|>/g,"");
	  	  				var parts = cleanedUris.split("	");
	  	  				$scope.allItems.push([]);
	  	  				$scope.allItems[count].push({"entity1" : decodeURIComponent(parts[0]),
								 					 "entity2" : decodeURIComponent(parts[1]),
								 					 "match" : 100*parts[2],
								 					 "relation" : config.acceptrelation});
	  	  				count++;
	  		  		}
	  		  	}
	  	  		var acceptedResult = response.data.accepted;
	  	  		
	  	  		// if (acceptedResult.length<3){
	  	  		if (acceptedResult.length == 0){
	  	  			flash.info= flash.info + "<br/>No accepted results ";
	  	  		}else{
	  	  			for(var i = 0; i < acceptedResult.length; i++){
	  	  				var cleanedUris = acceptedResult[i].replace(/<|>/g,"");
	  	  				var parts = cleanedUris.split("	");
	  	  				$scope.allItems.push([]);
	  	  				$scope.allItems[count].push({"entity1" : decodeURIComponent(parts[0]),
	  	  											 "entity2" : decodeURIComponent(parts[1]),
	  	  											 "match" : 100*parts[2],
								 					 "relation" : config.acceptrelation});
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
		    	flash.error = ServerErrorResponse.getMessage(response);
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
		        endpoint: ConfigurationService.getPublicSPARQLEndpoint(),
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
	};
};
