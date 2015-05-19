'use strict';

var module = angular.module('app.co-evolution-service', []);

module.factory("CoevolutionService", function ($http, ComponentsService) {

  var componentUri ="http://generator.geoknow.eu/resource/Coevolution";
  var serviceUri = "http://generator.geoknow.eu/resource/CoevolutionService";
  var serviceUrl = "";

  ComponentsService.getComponent(componentUri).then(
    //success
    function(response){
      serviceUrl = ComponentsService.getComponentService(serviceUri, $scope.component);
      if($scope.sevice== null)
        flash.error="Service not configured: " +serviceUri; 
    }, 
    function(response){
      flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
    });
  

  var service = {

    getGroups : function() {
      return $http({
        url: "graphs/group/",
        method: "GET"
      });
    },

    getGroup : function(id) {
      return $http({
        url: "graphs/group/"+id,
        method: "GET"
      });
    },

    createGroup : function(group) {
      console.log(group);
      return $http({
        url: "graphs/graphset",
        method: "POST",
        data : group
      });
    },

    getGroupVersions : function(id){
      return $http({
        url: "graphs/group/" + id + "/versions",
        method: "GET"
      });
    }, 

    getGroupLatestVersion : function(id){
      return $http({
        url: "graphs/latest/group/" + id ,
        method: "GET"
      });
    }, 


  };

  return service;

});