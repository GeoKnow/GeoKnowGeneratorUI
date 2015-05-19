'use strict';

var module = angular.module('app.co-evolution-service', []);

module.factory("CoevolutionService", function ($http, $q, ComponentsService, Ns, ConfigurationService) {


  var groups = [];
  
  var service = {

    getGroups : function() {
      var d = $q.defer();
      d.resolve(groups);
      return d.promise;
    },

    getGroup : function(identifier) {
      var d = $q.defer();
      var g = null;
      for(var i in groups)
        if (groups[i].identifier == identifier)
          g = groups[i]
      
      d.resolve(g);
      return d.promise;
    },

    createGroup : function(group) {
      var d = $q.defer();
      groups.push(group);
      d.resolve(groups[groups.length-1]);
      Ns.add(group.identifier,ConfigurationService.getUriBase() + group.identifier+"/")
      return d.promise;
    },

    deleteGroup : function(identifier) {
      var d = $q.defer();
      d.resolve();
      for(var i in groups){
        if (groups[i].identifier == identifier){
          groups.slice(i);
          break;  
        }
      }
      return d.promise;
    },

    addVersion : function(identifier, graph){

      var d = $q.defer();
      d.resolve(graph);
      for(var i in groups)
        if (groups[i].identifier == identifier){
          if(groups[i].graphs== undefined){
            groups[i].graphs=[];
            groups[i].graphs.push(graph);
            groups[i].latest = graph;
          }
          else if(groups[i].graphs.indexOf(graph)==-1){
            groups[i].graphs.push(graph);
            groups[i].latest = graph;
          }
          break;
        }
      return d.promise;
    },

    getGroupVersions : function(identifier){
      var d = $q.defer();
      var g = null;
      for(var i in groups)
        if (groups[i].identifier == identifier)
            if (groups[i].graphs != undefined){
              g = groups[i].graphs;
              break;
            }
      d.resolve(g);
      return d.promise;
    }, 

    getGroupLatestVersion : function(identifier){
      var d = $q.defer();
      g= null;      
      for(var i in groups)
        if (groups[i].identifier == identifier)
          if (groups[i].latest != undefined){
            g = groups[i].latest;
            break;
          }
      d.resolve(g);
      return d.promise;
    }, 


  };

  return service;

});