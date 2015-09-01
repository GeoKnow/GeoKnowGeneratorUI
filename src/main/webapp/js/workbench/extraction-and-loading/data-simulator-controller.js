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
		label: "Products graph",
		graph : "" 
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

	$scope.dateRange = {startDate: moment().toDate(), endDate: moment().toDate()};
	$scope.simulation ={ startDate: "", endDate:"", interval:"1.0", productUri:""};

	$scope.updateProductsList = function(){
		
		var requestData = {
            format: "application/ld+json",
            query :  "CONSTRUCT {"
										+ "?uri  <http://schema.org/name> ?label "
										+ "}"
										+ "WHERE { "
										+ "GRAPH <" + Ns.lengthen($scope.source.graph) + ">"
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
    		console.log(response);
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
