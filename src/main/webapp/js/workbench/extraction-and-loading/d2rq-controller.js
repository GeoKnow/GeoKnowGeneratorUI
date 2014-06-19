'use strict';

function D2RQMenuCtrl($scope, $routeSegment) {
    $scope.items = [
  	    { name: "_mappings_", route:'#/home/extraction-and-loading/d2rq/mapping', id:'mapping' },
        { name: "_tasks_", route:'#/home/extraction-and-loading/d2rq/task', id:'task' }
    ];

    $scope.isActive = function(id) {
        return $routeSegment.contains(id);
    };
}