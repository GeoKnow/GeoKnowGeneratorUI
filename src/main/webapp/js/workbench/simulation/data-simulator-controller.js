'use strict';

/****************************************************************************************************
*
* News extractor Controller
*
***************************************************************************************************/
app.controller('DataSimulatorCtrl', function($scope, ComponentsService, $http, ServerErrorResponse, flash, Ns, DataSimulatorService) {
	

	var componentId ="data-simulator";
	var serviceId = "data-simulator-service";
	var service2Id = "news-extraction-service";

	
	ComponentsService.getComponent(componentId).then(
		//success
		function(response){
			$scope.component = response;
			$scope.service = ComponentsService.getComponentService(serviceId, $scope.component);
			if($scope.service== null)
				flash.error="Service not configured: " +serviceId;	
		}, 
		function(response){
			flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
		});

	// the source graph where products will be queried
	$scope.source = {
		products : {
			label: "Products graph",
			graph : "" 
		},
		suppliers : {
			label: "Suppliers graph",
			graph : "" 
		}
	};

	$scope.target = {
		label: "",
		graph : "" 
	};

	$scope.newTarget ={
	  	prefix : "DataSimulator" ,
	  	label : "",
	  	description : ""
	  };
	$scope.manufacturer =[];


	$scope.dateRange = {startDate: moment().toDate(), endDate: moment().toDate()};
	$scope.simulation ={ startDate: "", endDate:"", interval:"0.0", productUri:"", status:"NOT RUNNING"};

	$scope.newsExtraction = {status:"NOT RUNNING"};

	$scope.simulationStatus = function(){

		return "Not running";
			// DataSimulatorService.metrics().then(
			// 	function(response){
			// 		return "Not running";
			// 	},
			// 	// fail
			// 	function(response){
			// 		// if 503 simmulation is not finished
			// 		console.log(response);
			// 		return "running";
			// 	});
	}

	$scope.newsExtractorStatus = function(){
		return "Not running";
	}

	// $scope.$watch($scope.source.products.graph, function (newValue) {
 //    console.log('products graph: ' + newValue);
 //    updateProductsList();
	// });

	// $scope.$watch($scope.source.suppliers.graph, function (newValue) {
 //    console.log('suppliers graph: ' + newValue);
 //    updateManufacturerList();
	// });

	$scope.updateProductsList = function(){
		
		var requestData = {
            format: "application/ld+json",
            query :  "CONSTRUCT {"
										+ "?uri  <http://schema.org/name> ?label "
										+ "}"
										+ "WHERE { "
										+ "GRAPH <" + Ns.lengthen($scope.source.products.graph) + ">"
										+ "{?uri <http://schema.org/name> ?label }}"
        };
    
    $http.post("rest/RdfStoreProxy", $.param(requestData)).then(
    	// success
    	function (response) {
    		var graph = response.data["@graph"];
    		$scope.products =[];
    		for(var i in graph){
    			$scope.products.push({
    				uri: graph[i]["@id"], 
    				label : graph[i]["http://schema.org/name"][0]["@value"]});
    		}
    	},
    	// error
			function (response) {
      	flash.error = ServerErrorResponse.getMessage(status);
    	}
    );
	};


	$scope.updateManufacturerList = function(){
		$scope.manufacturer =[];
		console.log($scope.simulation.productUri.uri);
		if($scope.simulation.productUri==="") return;

		var requestData = {
            format: "application/ld+json",
						query: "CONSTRUCT { "
										+ " ?manu a <http://schema.org/Organization> . "
										+ " ?manu <http://schema.org/name> ?name ."
										+ " ?man a <http://schema.org/Organization> . "
										+ " ?man <http://schema.org/name> ?name ."
										+ "}"
										+ "WHERE {"
										+ "{ GRAPH <"+Ns.lengthen($scope.source.products.graph) +"> "
										+ " { ?manu <http://schema.org/manufacturer> <"+ $scope.simulation.productUri.uri +">} ."
										+ "OPTIONAL{"
										+ " GRAPH <"+Ns.lengthen($scope.source.suppliers.graph) +">"
										+ " { ?manu <http://schema.org/name> ?name}}"
										+ "} "
										+ "UNION{ "
										+ "GRAPH <"+Ns.lengthen($scope.source.products.graph) +"> { "
										+ "<"+ $scope.simulation.productUri.uri +"> <http://www.xybermotive.com/ontology/productPart> ?part . "
										+ "?part <http://www.xybermotive.com/ontology/product> ?product . "
										+ "?man <http://schema.org/manufacturer> ?product } "
										+ "OPTIONAL{"
										+ " GRAPH <"+Ns.lengthen($scope.source.suppliers.graph) +">"
										+ " { ?man <http://schema.org/name> ?name}}"
										+ "} }"	
        };
    console.log(requestData);

    $http.post("rest/RdfStoreProxy", $.param(requestData)).then(
    	// success
    	function (response) {
    		console.log(response.data);
    		var graph = response.data["@graph"];
    		for(var i in graph){
    			var n = "Not Available";
    			if(graph[i]["http://schema.org/name"] != undefined ) {
    				n = "";
    				arr = graph[i]["http://schema.org/name"];
    				// n is an array [{"@value":"Volkswagen AG"}]
    				for(var na  in arr ){
    					if (n="") n = na["@value"]
    					else n += n +  ", " + na["@value"]
    				}
    			}
    			$scope.manufacturer.push({uri: graph[i]["@id"] , name: n});
    		}
    	},
    	// error
			function (response) {
      	flash.error = ServerErrorResponse.getMessage(response);
    	}
    );
	};

	$scope.updateDate = function(source, dest){
		console.log(source);
		var newd = moment(source);
		console.log(newd);
		console.log(newd.format('YYYY-MM-DD'));
		dest = newd.format('YYYY-MM-DD');
		console.log(dest);
		
	}

	$scope.startDataSimulator = function(){

    DataSimulatorService.run(
    		$scope.simulation.startDate, 
    		$scope.simulation.endDate, 
    		$scope.simulation.productUri.uri, 
    		$scope.target.graph,
    		$scope.simulation.interval).then(
    	// success
    	function(response){
    		console.log(response);
    	},
    	//error
    	function(response){
    		flash.error = ServerErrorResponse.getMessage(response);
    	});
  };

  
  $scope.$watch('dateRange.endDate', function (newValue, oldValue) {
    var newd = moment(newValue);
		$scope.simulation.endDate = newd.format('YYYY-MM-DD');
		$scope.newTarget.description = "Data simulation from "+  $scope.simulation.startDate + " to  " + $scope.simulation.endDate;
		$scope.newTarget.label = "simulation-"+  $scope.simulation.startDate + "to" + $scope.simulation.endDate;
  });

  $scope.$watch('dateRange.startDate', function (newValue, oldValue) {
    var newd = moment(newValue);
		$scope.simulation.startDate = newd.format('YYYY-MM-DD');
		$scope.newTarget.label = "simulation-"+  $scope.simulation.startDate + "to" + $scope.simulation.endDate;

  });


});
