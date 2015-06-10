'use strict';

var CoevolutionCtrl = function($scope, $http, Ns, CoevolutionService, flash, ServerErrorResponse, GraphService){
	
	CoevolutionService.getComponent().then(
		//success
		function(response){
			$scope.component = response;
			$scope.sevice = CoevolutionService.serviceUrl;
			$scope.refreshGraphs();
			$scope.conflictResolutionStrategies = CoevolutionService.getConflictResolutionStrategies();			
			init();
		}, 
		function(response){
			flash.error= ServerErrorResponse.getMessage(response);
		});


	var init = function(){
		$scope.change = {
			correctionContext : "",
			resultContext : "",
			conflictResolution :  CoevolutionService.getConflictResolutionDefaultStrategy(),
			filter : ""
		}
		$scope.filters = [];
		$scope.contextGraph = "";
		$scope.targetGraph =  "";
	};

  var getFilters= function(){
		var res=[];
		for (var i=0; i<$scope.filters.length; i++) 
			res.push($scope.filters[i].exp);
		return res.join(" . ");
	};

	$scope.graphLabel=function (id, label) {
    return "<" + id + "> - " + label;
  }

  $scope.addFilter = function(){
  	$scope.filters.push({exp:""});
  };

  $scope.removeFilter = function(filter){
  	console.log(filter);
   	for (var i=0; i<$scope.filters.length; i++) {
      if ($scope.filters[i].exp == filter.exp) {
        $scope.filters.splice(i, 1);
        break;
      }
    }
    
  };

	$scope.refreshGraphs = function() {
    GraphService.getAccessibleGraphs(true, false, true).then(function(graphs) {
      $scope.namedGraphs = graphs;
      console.log($scope.namedGraphs);
    });
  };

  $scope.apply = function(){

  	$scope.change.correctionContext = Ns.lengthen($scope.contextGraph.name);
  	$scope.change.resultContext = Ns.lengthen($scope.targetGraph.name);
		$scope.change.filter = getFilters();

 		CoevolutionService.applyChanges($scope.change).then(
 			// success
 			function(response){
 				console.log(response);
 				flash.success= "Changes applyed successfully";
 				init();
 			}, 
 			// error
 			function(response){
 				flash.error= ServerErrorResponse.getMessage(response);
 			});


  }


  
}