'use strict';

/****************************************************************************************************
*
* LIMES Controller
***************************************************************************************************/

var LimesCtrl = function($scope, $http, ConfigurationService, ComponentsService, JobService, AuthSessionService, flash, ServerErrorResponse, $window, GraphService, AccountService, Ns, $modal, $timeout){
	

	var componentUri ="http://generator.geoknow.eu/resource/Limes";
	var serviceUri = "http://generator.geoknow.eu/resource/LimesService";

	ComponentsService.getComponent(componentUri).then(
		//success
		function(response){
			$scope.component = response;
			$scope.sevice = ComponentsService.getComponentService(serviceUri, $scope.component);
			if($scope.sevice== null)
				flash.error="Service not configured: " +serviceUri;	
		}, 
		function(response){
			flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
		});

	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.uriBase = ConfigurationService.getUriBase();

	var workbench = ConfigurationService.getFrameworkHomepage();
	$scope.configOptions = true;
	$scope.inputForm = true;
	$scope.deleteProp = false;

	var configFilesDir="data/limes-config-files/";
	var services = "";
	var workbench = "";
	var importing = false;
	var uploadError = false;
	var uploadedFiles = null;
	

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
		execType: ["", "Simple", "FILTER", "OneToOne"],
		granularity: ["", "1", "2", "3", "4" ]
	};
	
	var limesParams =  {
    execution : $scope.options.execType[0],
    granularity : $scope.options.granularity[0],
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
  	console.log($scope.limes.target.endpoint + "==" + ConfigurationService.getSPARQLEndpoint());
  	// wait for model to update
  	$timeout(function () {
  		console.log($scope.limes.target.endpoint + "==" + ConfigurationService.getSPARQLEndpoint());
  		if( $scope.limes.source.endpoint == ConfigurationService.getSPARQLEndpoint()){
  			console.log("get gtraphs");
				GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
    			$scope.namedSourceGraphs = graphs;
    		});
			}
			else
				$scope.namedSourceGraphs = {};
    }, 500);

  	
  };

  $scope.updateTargetGraphs = function(){
  	console.log($scope.limes.target.endpoint + "==" + ConfigurationService.getSPARQLEndpoint());
  	if( $scope.limes.target.endpoint == ConfigurationService.getSPARQLEndpoint()){
  		console.log("get gtraphs");
			GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
    		$scope.namedTargetGraphs = graphs;
    	});
		}
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
  		for(var index in conf.LIMES.SOURCE.PROPERTY){
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
    	templateUrl: 'modal-forms/workbench/modal-limes-job.html',
    	controller: 'ModalLimesJobCtrl',
    	size: 'lg'
    });

    // reads user's answer
    modalInstance.result.then(function (jobDesc) {
    	// if got Job info, create the graphs to store data
    	// jobDesc contains name and description
     	// bulild parameters
    	var params = validateLimesParams();
			var now = new Date(); // we need a unique temp graph
			params.acceptgraph = ConfigurationService.getUriBase() + jobDesc.name+"_accepted";
			params.reviewgraph = ConfigurationService.getUriBase() + jobDesc.name+"_review";

      var  createAuthEndpoint = function(){
				/** 
				* retrieve an authenpoint as proxy for accessing private graphs (if present)
				* and for storing results in private graphs
				*/
      	return AuthSessionService.createSession().then(function(response){
      		var workbench = ConfigurationService.getComponent(ConfigurationService.getFrameworkUri());
			var workbenchHP = workbench.homepage;
			if (workbenchHP.substr(-1) != '/') workbenchHP += '/';
      		var atuhEndpoint = workbenchHP + response.data.endpoint;
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
      		//the accepted graph is therefore the target graph
			createAuthEndpoint()
				.then(function(){
					
					  //first two steps: create temp graphs
		            var pubService = ConfigurationService.getComponentServices(":DataPublisher");         
		            var pubServiceUrl = pubService[0].serviceUrl;
		            var createAcceptGraphBody = "endpointUri="+params.saveendpoint
		            + "&tempGraphUri="+params.acceptgraph + "&userName="+AccountService.getAccount().getUsername();
		            var createReviewGraphBody = "endpointUri="+params.saveendpoint
		            + "&tempGraphUri="+params.reviewgraph + "&userName="+AccountService.getAccount().getUsername();
		            
					params.uribase = ConfigurationService.getUriBase();
					params.uuid = jobDesc.name;
					
					
					//create information for publishing step
		          	//create body from params
		          	var publishDataBody = "endpointUri="+params.saveendpoint
		          		+ "&targetGraphUri="+jobDesc.namedgraph.replace(':', ConfigurationService.getUriBase())
		          		+ "&inputGraphArray="+'[{"graph":"'+params.acceptgraph+'", "delete":"true"}';
		          	
		          	if(jobDesc.additionalSources){
		          		
		          		publishDataBody+=', {"graph":"'+jobDesc.namedgraph.replace(':', ConfigurationService.getUriBase())+'", "delete":"false"}';
		          		
		          	} 
		          	
		          	publishDataBody+=']'
		          		+ "&backupExistingData="+jobDesc.newRevision
		          		//todo: think of metadata in limes jobs
		          		+ "&metaRdf="
		          		+ "&userName="+AccountService.getAccount().getUsername();
		          	
		          	if(params.output=="TAB") {params.saveendpoint="";}
		          	
					var steps = '['
						+ '{"service":"'+pubServiceUrl+'/createTempGraph","contenttype":"application/x-www-form-urlencoded", "method":"POST", "body":"'+encodeURI(createAcceptGraphBody)+'", "numberOfOrder":1},'
						+ '{"service":"'+pubServiceUrl+'/createTempGraph","contenttype":"application/x-www-form-urlencoded", "method":"POST", "body":"'+encodeURI(createReviewGraphBody)+'", "numberOfOrder":2},'
		                + '{"service":"'+ $scope.service.serviceUrl+'","contenttype":"application/json", "method":"POST", "body": "'+encodeURI(JSON.stringify(params))+'" , "numberOfOrder":3}'
		                + '{"service":"'+pubServiceUrl+'","contenttype":"application/x-www-form-urlencoded", "method":"POST", "body":"'+encodeURI(publishDataBody)+'", "numberOfOrder":4}'
		                +']';
					console.log(steps);
					JobService.addMultiServiceJob(jobDesc.name, jobDesc.label, jobDesc.description, eval(steps), jobDesc.namedgraph.replace(':', ConfigurationService.getUriBase()))
					.then(function(response){
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

};
