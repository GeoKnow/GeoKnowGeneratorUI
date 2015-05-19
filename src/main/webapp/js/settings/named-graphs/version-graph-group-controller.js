'use strict';

function VersionGGCtrl($scope, CoevolutionService, ServerErrorResponse, flash) {

	// parent has this variable available
	console.log($scope.$parent.vgroup);
	$scope.vgroup = $scope.$parent.vgroup;

 	var refreshGroup = function(){
    CoevolutionService.getGroup($scope.vgroup.identifier).then(
    //success
    function(response){
      console.log(response);
      $scope.vgroup = response;   
    },
    //fail
    function (response){
      flash.error = ServerErrorResponse.getMessage(response);
    });
  };


	$scope.deleteVersionGroup = function(){
    CoevolutionService.deleteGroup($scope.vgroup.identifier).then(
      function(response){
        $scope.refreshVersionGroups();
      },
      function(response){
          flash.error = ServerErrorResponse.getMessage(response);
      });
  };  
  
  $scope.addVersionedGraph = function(){
    // add a graph from the select box
    // console.log($scope.vgraphSelected);
    // if($scope.vgraphSelected != undefined)
    //   $scope.saveVersionedGraph($scope.vgraphSelected, $scope.vgroup);
    // // add a new grpah
    // else
      $scope.new($scope.vgroup);

    // $scope.vgraphSelected = undefined;
  };

  $scope.graphInGroup = function(){
    return function(namedgraph) {
      if ($scope.vgroup.graphs == undefined) 
        return true;
      return ($scope.vgroup.graphs.indexOf(namedgraph.name) == -1);
    };
    
  };
}

 