'use strict';

/****************************************************************************************************
*
* LIMES Controller
***************************************************************************************************/

var LimesCtrl = function($scope, $http, ConfigurationService, JobService, AuthSessionService, flash, ServerErrorResponse, $window, GraphService, AccountService, Ns, $modal){
	
	$scope.configOptions = true;
	$scope.inputForm = true;
	$scope.deleteProp = false;

	var configFilesDir="data/limes-config-files/";
	var services = "";
	var serviceUrl = "";
	var workbench = "";
	var importing = false;
	var uploadError = false;
	var uploadedFiles = null;
		
	$scope.component = ConfigurationService.getComponent(":Limes");
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.uriBase = ConfigurationService.getUriBase();

	var services = ConfigurationService.getComponentServices(":Limes");
	var serviceUrl = services[0].serviceUrl;
	var workbench = ConfigurationService.getComponent(ConfigurationService.getFrameworkUri());

	// check if the limes service is available
	$scope.component.offline = false;
	 
	$http.get(serviceUrl).then( function(response) {
	  	$scope.component.offline = false;
	  }, function(response) {
	   	$scope.component.offline = true;
	  });

	

	// Arrays for comparisons
	$scope.allItems = [];
	$scope.storeArray = [];

	$scope.examples = [
		{ description : "dblp-semanticwebresearcher", file : "dblp-semanticwebresearcher.xml"},
		{ description : "dbpedia-actors", file : "dbpedia-actors.xml"},
		{ description : "dbpedia-dbpedia", file : "dbpedia-dbpedia.xml"},
		{ description : "dbpedia-drugbank-complex", file : "dbpedia-drugbank-complex.xml"},
		{ description : "dbpedia-drugbank", file : "dbpedia-drugbank.xml"},
		{ description : "europeana-deduplication", file : "europeana-deduplication.xml"},
		{ description : "lgd-lgd-surjection", file : "lgd-lgd-surjection.xml"},
		{ description : "lgd-lgd-symmetric", file : "lgd-lgd-symmetric.xml"},
		{ description : "lgd-lgd", file : "lgd-lgd.xml"},
	];
	
	$scope.options = { 	
		output: 	["N3", "TAB", "TTL"],
		execType: ["Simple", "FILTER", "OneToOne"],
		granularity: ["1", "2", "3", "4" ]
	};
	
	var limesParams =  {
    execution : "",
    granularity : "",
    output : $scope.options.output[0],
    metric : "",
    saveendpoint : "",
    reviewgraph : "",
    acceptgraph : "",
    uribase : "",
    prefix : [],
    source : {
	    id : "Source",
	    endpoint : "",
	    graph : "",
	    var : "",
	    pagesize : "",
	    restriction : "",
	    type : "",
	    property : [""]
		},
		target : {
	    id : "Target",
	    endpoint : "",
	    graph : "",
	    var : "",
	    pagesize : "",
	    restriction : "",
	    type : "",
	    property : [""]
		},
		acceptance : {
	    threshold : "1",
	    relation : "owl:sameAs",
	    file : ""
		},
		review : {
	    threshold : "0.2",
	    relation : "owl:sameAs",
	    file : ""
		}
	};
	// initialise clean params
	$scope.limes = angular.copy(limesParams);

	$scope.clearForm = function(){
		$scope.limes = angular.copy(limesParams);	
		$scope.examples = null;
	};

  $scope.updateSourceGraphs = function(){
  	if( $scope.limes.source.endpoint == ConfigurationService.getSPARQLEndpoint())
				GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
    			$scope.namedSourceGraphs = graphs;
    		});
		else
			$scope.namedSourceGraphs = {};
  };

  $scope.updateTargetGraphs = function(){
  	if( $scope.llimes.target.endpoint == ConfigurationService.getSPARQLEndpoint())
			GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
    		$scope.namedTargetGraphs = graphs;
    	});
		else
			$scope.namedTargetGraphs = {};
  };
	
	$scope.fillForm = function(file){
		
		if(file == null) return;
		$scope.enterConfig = true;
		$scope.startLimes = true;
		
		$http.get(configFilesDir + file).success(function(data) { 
      fillForm(data);
    });
	};

	var fillForm = function(content){

 		var x2js = new X2JS();				
		var conf = x2js.xml_str2json(content);
	  $scope.limes.execution = conf.LIMES.EXECUTION;
	  $scope.limes.granularity = conf.LIMES.GRANULARITY;
	  $scope.limes.output = conf.LIMES.OUTPUT;
	  $scope.limes.metric = conf.LIMES.METRIC;			
  	$scope.limes.source.id = conf.LIMES.SOURCE.ID;
  	$scope.limes.source.endpoint = conf.LIMES.SOURCE.ENDPOINT;
  	$scope.limes.source.graph = conf.LIMES.SOURCE.GRAPH;
  	$scope.limes.source.var = conf.LIMES.SOURCE.VAR;
  	$scope.limes.source.pagesize = conf.LIMES.SOURCE.PAGESIZE;
  	$scope.limes.source.restriction = conf.LIMES.SOURCE.RESTRICTION;
  	$scope.limes.source.type = conf.LIMES.SOURCE.TYPE;
  	$scope.limes.source.property = [];
		if(typeof conf.LIMES.SOURCE.PROPERTY === 'string' ) 
    	$scope.limes.source.property.push(conf.LIMES.SOURCE.PROPERTY);
  	else {
  		for(var index in conf.SOURCE.TARGET.PROPERTY){
  			console.log(index);
  			$scope.limes.source.property.push(conf.LIMES.SOURCE.PROPERTY[index]);
  		}
  	}
  	$scope.limes.target.id = conf.LIMES.TARGET.ID;
  	$scope.limes.target.endpoint = conf.LIMES.TARGET.ENDPOINT;
  	$scope.limes.target.graph = conf.LIMES.TARGET.GRAPH;
  	$scope.limes.target.var = conf.LIMES.TARGET.VAR;
  	$scope.limes.target.pagesize = conf.LIMES.TARGET.PAGESIZE;
  	$scope.limes.target.restriction = conf.LIMES.TARGET.RESTRICTION;
  	$scope.limes.target.type = conf.LIMES.TARGET.TYPE;
  	$scope.limes.target.property = [];
  	if(typeof conf.LIMES.TARGET.PROPERTY === 'string' ) 
  		$scope.limes.target.property.push(conf.LIMES.TARGET.PROPERTY);
  	else {
  		for(var index in conf.LIMES.TARGET.PROPERTY)
  			$scope.limes.target.property.push(conf.LIMES.TARGET.PROPERTY[index]);
  	}
  	$scope.limes.acceptance.threshold = conf.LIMES.ACCEPTANCE.THRESHOLD;
  	$scope.limes.acceptance.relation = conf.LIMES.ACCEPTANCE.RELATION;
  	$scope.limes.acceptance.file = conf.LIMES.ACCEPTANCE.FILE;
  	$scope.limes.review.threshold = conf.LIMES.REVIEW.THRESHOLD;
  	$scope.limes.review.relation = conf.LIMES.REVIEW.RELATION;
  	$scope.limes.review.file = conf.LIMES.REVIEW.FILE;
  	$scope.limes.prefix = [];
  	for(var index in conf.LIMES.PREFIX){
  		var p = {
  			label : conf.LIMES.PREFIX[index].LABEL,
  			namespace : conf.LIMES.PREFIX[index].NAMESPACE
  		};
  		$scope.limes.prefix.push(p);
  	}
	}
	
	$scope.loadLimesXML = function($files){
		for (var i = 0; i < $files.length; i++) {
		  var $file = $files[i];
	  	var reader = new FileReader();
			reader.onloadstart = function(e) {
	    	console.log('loading');
	  	};
		  reader.onloadend = function(evt) {
	    	if (evt.target.readyState == FileReader.DONE) { 
	     		fillForm(evt.target.result);
	     	}
	  	};
	  	reader.readAsText($file, "utf-8");

		}
	};

	$scope.registerJob = function(){

    var now = new Date();

		// ask the user for a job name and description
    var modalInstance = $modal.open({
    	templateUrl: 'modal-job.html',
    	controller: 'ModalNewJobCtrl',
    	size: 'lg',
    	resolve: {
        sname: function () {
        	// proposes a unique name for the job
	        return "LimesJob_" +now.getTime();
  	    }
  		}
    });

    // reads user's answer
    modalInstance.result.then(function (jobDesc) {
    	// if got Job info, create the graphs to store data
    	// jobDesc contains name and description
     	// bulild parameters
    	var params = validateLimesParams();

      var createAcceptedGraph = function(name, label, description){
      	console.log("create " + name);
      	return GraphService.addSimpleGraph(name, label, description).then(function(response){
      		params.acceptgraph = ConfigurationService.getUriBase() + name;
      	});
      	
      }, createReviewGraph = function(name, label, description){
      	console.log("create " + name);
      	return GraphService.addSimpleGraph(name, label, description).then(function(response){
      		params.reviewgraph = ConfigurationService.getUriBase() + name;
      	})
      }, createAuthEndpoint = function(){
				/** 
				* retrieve an authenpoint as proxy for accessing private graphs (if present)
				* and for storing results in private graphs
				*/
      	return AuthSessionService.createSession().then(function(response){
      		var atuhEndpoint = workbench.homepage + response.data.endpoint
      		params.saveendpoint = atuhEndpoint;
      		// overwrite endpoints if source or target uses the private endpoint
					if($scope.limes.source.endpoint == ConfigurationService.getSPARQLEndpoint() ||
							$scope.limes.target.endpoint == ConfigurationService.getSPARQLEndpoint()) {
						if($scope.limes.source.endpoint == ConfigurationService.getSPARQLEndpoint()){
							params.source.endpoint = atuhEndpoint;
							if($scope.limes.source.graph != null)
								params.source.graph = $scope.limes.source.graph.replace(':', ConfigurationService.getUriBase());
						}
						if($scope.limes.target.endpoint == ConfigurationService.getSPARQLEndpoint()){
							params.target.endpoint = atuhEndpoint;								
							if($scope.limes.TargetGraph != null)
								params.target.graph = $scope.limes.target.graph.replace(':', ConfigurationService.getUriBase());
						}
					};
				});
      };

			createAcceptedGraph(jobDesc.name+"_accepted", "accepted", "Accepted links of "+jobDesc.name)
				.then(createReviewGraph(jobDesc.name+"_review", "review", "Links to reviiew of "+jobDesc.name))
				.then(createAuthEndpoint())
				.then(function(){
					params.uribase = ConfigurationService.getUriBase();
					JobService.addServiceJob(jobDesc.name, jobDesc.description, serviceUrl, "application/json", "POST", JSON.stringify(params)).then(function(response){
						$scope.$parent.updateJobs();
						flash.success = "Job successfully added can be executed from the dashboard";
					}, function(response){
						flash.error = ServerErrorResponse.getMessage(response);
					});

				});

    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

	};

	var validateLimesParams = function(){
		var params = angular.copy($scope.limes);
		// generate required prefixes for limes
		var requredlabel = [];
		var re = new RegExp('[a-z]+(?=:)','gi');
		var v;
		// add prefixes to the labels
		while (v = re.exec(params.metric))
  		if (requredlabel.indexOf(v[0]) == -1) requredlabel.push(v[0]);
  	while (v = re.exec(params.source.property))
  		if (requredlabel.indexOf(v[0]) == -1) requredlabel.push(v[0]);
  	while (v = re.exec(params.source.property))
  		if (requredlabel.indexOf(v[0]) == -1) requredlabel.push(v[0]);
  	while (v = re.exec(params.source.restriction))
  		if (requredlabel.indexOf(v[0]) == -1) requredlabel.push(v[0]);
  	while (v = re.exec(params.source.restriction))
  		if (requredlabel.indexOf(v[0]) == -1) requredlabel.push(v[0]);
  	while (v = re.exec(params.acceptance.relation))
  		if (requredlabel.indexOf(v[0]) == -1) requredlabel.push(v[0]);
  	while (v = re.exec(params.review.relation))
  		if (requredlabel.indexOf(v[0]) == -1) requredlabel.push(v[0]);

		// check that limes.prefix has all prequired prefixes
		var labels = [];
		for(var i in params.prefix)
			labels.push(params.prefix[i].label);
		
		for(var i in requredlabel)
			// if not found try to add it from the namespaces
			if(labels.indexOf(requredlabel[i]) == -1){
				var ns = Ns.getNamespace(requredlabel[i]);
				if(ns != undefined)
					params.prefix.push({label:requredlabel[i] , namespace: ns});
				else
					console.error("NOT FOUND "+ requredlabel[i]);
			}
			return params;
	};

	/*
	$scope.LaunchLimes = function(){
	
		var params = angular.copy($scope.limes);

		// check if graphs are private, and if its the case provide the session URL
		if($scope.limes.source.endpoint == ConfigurationService.getSPARQLEndpoint() ||
			 $scope.limes.target.endpoint == ConfigurationService.getSPARQLEndpoint()) {
				// retrives a URL for a autnenticated session
				AccountService.getAccount().createSession().then(function(response){
					if($scope.limes.source.endpoint == ConfigurationService.getSPARQLEndpoint())
						params.source.endpoint = workbench.homepage + response.data.endpoint;
					if($scope.limes.target.endpoint == ConfigurationService.getSPARQLEndpoint())
						params.target.endpoint = workbench.homepage + response.data.endpoint;
					
				});
		}
		// TODO: create the graphs ?
		if($scope.limes.source.graph != null)
			params.source.graph = $scope.limes.source.graph.replace(':', ConfigurationService.getUriBase());
		if($scope.limes.TargetGraph != null)
			params.target.graph = $scope.limes.target.graph.replace(':', ConfigurationService.getUriBase());
		
		// check prefixes?
		// create a list of the required prefixes 
		// (those inside source|target.restriction, source|target.property, acceptance|result.relation and metric)
		var requredlabel = [];
		var re = new RegExp('[a-z]+(?=:)','gi');
		var v;
		while (v = re.exec(params.metric))
  		if (requredlabel.indexOf(v[0]) == -1) requredlabel.push(v[0]);
  	while (v = re.exec(params.source.property))
  		if (requredlabel.indexOf(v[0]) == -1) requredlabel.push(v[0]);
  	while (v = re.exec(params.source.property))
  		if (requredlabel.indexOf(v[0]) == -1) requredlabel.push(v[0]);
  	while (v = re.exec(params.source.restriction))
  		if (requredlabel.indexOf(v[0]) == -1) requredlabel.push(v[0]);
  	while (v = re.exec(params.source.restriction))
  		if (requredlabel.indexOf(v[0]) == -1) requredlabel.push(v[0]);
  	while (v = re.exec(params.acceptance.relation))
  		if (requredlabel.indexOf(v[0]) == -1) requredlabel.push(v[0]);
  	while (v = re.exec(params.review.relation))
  		if (requredlabel.indexOf(v[0]) == -1) requredlabel.push(v[0]);

  	// check that limes.prefix has all prequired prefixes
		var labels = [];
		for(var i in params.prefix)
			labels.push(params.prefix[i].label);
		
		for(var i in requredlabel)
			// if not found try to add it from the namespaces
			if(labels.indexOf(requredlabel[i]) == -1){
				var ns = Ns.getNamespace[requredlabel];
				if(ns != undefined)
					params.prefix.push({label:requredlabel , namespace: ns});
				else
					console.error("NOT FOUND "+ requredlabel[i]);
			}

		console.log(params);

		$http({
					method: 'POST',
    			url: serviceUrl,
    			headers: { 'Content-type': 'application/json'},
    			data : params })
		  	.success(function(data, status, headers, config){
	       	$scope.startLimes = false;
		    	$scope.showProgress = false;
		    	$scope.inputForm = true;
		    	flash.success = "Limes finished";
		    	// get the files inside data.results, and these are to be proposed to be downloaded
		    	// in this case probably LimesReview is not required anymore... 
					console.log(data);
					// $scope.ReviewLimes(data); 
	      })
		  	.error(function(response) {
			    flash.error = ServerErrorResponse.getMessage(response);
			    $scope.startLimes = false;
				  $scope.showProgress = false;
				});
				
		// no more new window. TODO: create a service in the generator to create batch job and 
		// launch it
		/(function() {
		// 	window.$windowScope = $scope;
	 // 		var newWindow = $window.open('popup.html#/popup-limes', 'frame', 'resizeable,height=600,width=800');
		// 	newWindow.params = params;
		// 	});
	};
	
	// this is to be REMOVED with the new batch processing
	$scope.StartLimes = function(){
		
			var params = $window.params;
			$scope.showProgress = true;

			$http({
					method: 'POST',
    			url: serviceUrl,
    			headers: { 'Content-type': 'application/json'},
    			data : params })
		  	.success(function(data, status, headers, config){
	       	$scope.startLimes = false;
		    	$scope.showProgress = false;
		    	$scope.inputForm = true;
		    	flash.success = "Limes finished";
		    	// get the files inside data.results, and these are to be proposed to be downloaded
		    	// in this case probably LimesReview is not required anymore... 
					console.log(data);
					$scope.ReviewLimes(data); 
	      })
		  	.error(function(response) {
			    flash.error = ServerErrorResponse.getMessage(response);
			    $scope.startLimes = false;
				  $scope.showProgress = false;
				});
	};
	
	// this is to be REMOVED and added in an new page /manual-revision-and-authoring/limes-review
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

	
	// this is also to be REMOVED and replaced by the RDFImport on the generator
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
	};*/
};
