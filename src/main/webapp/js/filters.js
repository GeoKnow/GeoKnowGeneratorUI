'use strict';

var module = angular.module('app.filters', []);

/*
* This filter returns the shorten version of a URI using the prefixes
*/
module.filter('shortenURI', function(Ns) {
  return function(uri) {
    return Ns.shorten(uri); 
  };
}); 

/**
* When the user selects a source graph, and the target graph should be a 
* not the same as the source, then use this filter to exclude them
*  ... ng-options="thing in things | excludeFrom:fields.option2" ...
**/

module.filter('excludeFrom',[function(){
  return function(array,expression,comparator){
    if(array==undefined) return false;
    return array.filter(function(item){
      return !expression || !angular.equals(item,expression);
    });
  };
}]);