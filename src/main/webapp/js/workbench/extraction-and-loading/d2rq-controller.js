'use strict';

function D2RQMenuCtrl($scope, $routeSegment) {
    $scope.items = [
  	    { name: "Mappings", route:'#/home/extraction-and-loading/d2rq/mapping', id:'mapping' },
        { name: "Tasks", route:'#/home/extraction-and-loading/d2rq/task', id:'task' }
    ];

    $scope.isActive = function(id) {
        return $routeSegment.contains(id);
    };
}