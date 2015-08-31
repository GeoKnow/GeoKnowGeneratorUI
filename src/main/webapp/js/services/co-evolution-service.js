'use strict';

var module = angular.module('app.co-evolution-service', []);

module.factory("CoevolutionService", function ($http, ComponentsService, Ns, Config) {

  var componentId = "Coevolution";
  var serviceId = "CoevolutionService";
  var serviceUrl = "";

  var promise = ComponentsService.getService(serviceId).then(
    //success
    function(service){
      serviceUrl = service.serviceUrl;
      return service;
    });

  var getGroup = function(id){
    return $http({
        url: serviceUrl+"rest/api/graphs/graphset/"+id,
        method: "GET",
        }).then( 
          function(response){
            return response.data;
          });
  };

	var service = {

    promise: promise,

    applyChanges : function(parameters){
      console.log(parameters);
      return $http({
        url: serviceUrl+"rest/api/application/graph",
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        params : parameters
      });

    },


    getComponent : function(){
      return ComponentsService.getComponent(componentId).then(
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
          var identifiers = response.data;
          var vgroups=[];
          for(var i in identifiers){
            var namespace = identifiers[i] + "/";
            // var id = identifiers[i].replace(Ns.getNamespace("gvg"),"");
            var id = identifiers[i].substring(identifiers[i].lastIndexOf('/')+1, identifiers[i].length);
            Ns.add(id, namespace);
            getGroup(id).then(
              function(vgroup){
                vgroup["uri"] = Ns.getNamespace(vgroup.identifier);
                vgroup["graphs"] = [];
                vgroups.push(vgroup);

              });
          }
          return Config.read().then(
            function(){
              return vgroups; 
            });
          
        });
    },

    getGroup : function(id) {
      return getGroup(id);
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
    },

    getConflictResolutionStrategies : function(){
      return ["IgnoreConflict", "IgnoreEntireChange", "IgnoreChangeForConflictingPredicate", "ForceChange", "MergeChange"];
    },
    
    getConflictResolutionDefaultStrategy :function(){
      return "IgnoreConflict";
    }
	};

	return service;

});