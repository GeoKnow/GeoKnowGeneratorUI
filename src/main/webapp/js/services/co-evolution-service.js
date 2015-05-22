'use strict';

var module = angular.module('app.co-evolution-service', []);

module.factory("CoevolutionService", function ($http, ComponentsService) {

  var componentUri = "http://generator.geoknow.eu/resource/Coevolution";
  var serviceUri = "http://generator.geoknow.eu/resource/CoevolutionService";
  var serviceUrl = "";

  var promise = ComponentsService.getService(serviceUri).then(
    //success
    function(service){
      serviceUrl = service.serviceUrl;
      console.log(serviceUrl);
      return serviceUrl;
    });

	var service = {

    promise: promise,

    getComponent : function(){
      return ComponentsService.getComponent(componentUri).then(
        function(response){
          return response;
        });
    },

    serviceUrl : function(){
      return serviceUrl;
    },
    //returns a list of identifiers 
    getGroups : function() {
      return $http({
        url: serviceUrl+"rest/api/graphs/graphset",
        method: "GET"
      }).then(
        function(response){
          return response.data;
        }
      );
    },

    getGroup : function(id) {
      return $http({
        url: serviceUrl+"rest/api/graphs/graphset/"+id,
        method: "GET",
        }).then( 
          function(response){
            return response.data;
          });
    },

    createGroup : function(group) {
      return $http({
        url: serviceUrl+"rest/api/graphs/graphset",
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        data : group
      });
		},

		getGroupVersions : function(id){
      return $http({
        url: serviceUrl+"rest/api/graphs/graphset/" + id + "/versions",
        method: "GET"
      });
    }
	};

	return service;

});