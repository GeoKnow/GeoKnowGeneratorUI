'use strict';

function GraphCtrl($scope, $http, $modal, flash, Config, Ns, ConfigurationService, CoevolutionService, Helpers, AccountService, GraphService, GraphGroupService, ServerErrorResponse) {


  $scope.accessModes = GraphService.getAccessModes();
  $scope.uriBase = ConfigurationService.getUriBase();
  $scope.versionGroups = [];

  var refreshUserGraphs = function() {
    GraphService.getUserGraphs(AccountService.getAccount().getAccountURI(), true).then(
      function (graphs){
        $scope.namedgraphs = graphs;
      },
      function(response){
            flash.error = ServerErrorResponse.getMessage(response);
      });
  };

  var refreshAccessibleGraphs = function() {
    GraphService.getAccessibleGraphs(false, true, true).then(
      function(graphs) {
        $scope.accnamedgraphs = graphs;
      },
      function(response){
            flash.error = ServerErrorResponse.getMessage(response);
      });
  };

  var refreshAllGraphs = function() {
    GraphService.getAllNamedGraphs(true).then(
      function(graphs) {
        $scope.allgraphs = graphs;
      },
      function(response){
        flash.error = ServerErrorResponse.getMessage(response);
      });
  };

  var saveGraph = function(namedgraph, newGraph, group) {

    var response;
    // the identifier is the prefix of the namespace, and this prefix was added
    // to the ns-service at the creation/get of the groups
    if(group != null)
      namedgraph.name = group.identifier + ":" + namedgraph.name;
    else
      namedgraph.name = ":" + namedgraph.name;

    if (newGraph)
      response = GraphService.addGraph(namedgraph);
    else {
      if (namedgraph.owner == AccountService.getAccount().getAccountURI())
        response = GraphService.updateGraph(namedgraph);
      else {
        response = GraphService.updateForeignGraph(namedgraph).then(function(response) {
          refreshAllGraphs();
        });
      }
    }
    
    response.then(
      //success
      function() {
        // add the graph to a group if not null
        if(group!=null){
          $scope.saveVersionedGraph(namedgraph.name, group);
          $scope.refreshVersionGroups();
        }
        refreshUserGraphs();
        refreshAllGraphs();
      },
      //error
      function(response) {
        flash.error = ServerErrorResponse.getMessage(response);
      });
  };


  $scope.isNew = function() {
    return newGraph;
  };

  $scope.new = function(group) {
    console.log(group);
    var modalInstance = $modal.open({
      templateUrl: 'modal-forms/settings/named-graphs/modal-graph.html',
      controller: 'ModalGraphCtrl',
      size: 'lg',
      backdrop: 'static',
      resolve: {
        currentNamedGraph: function() {
          return null;
        },
        versionedGroup: function(){
          return group;
        }
      }
    });
    modalInstance.result.then(function(responseGraph) {
      saveGraph(responseGraph, true, group);
    });
  };

  $scope.edit = function(graphName) {

    var modalInstance = $modal.open({
      templateUrl: 'modal-forms/settings/named-graphs/modal-graph.html',
      controller: 'ModalGraphCtrl',
      backdrop: 'static',
      size: 'lg',
      resolve: {
        currentNamedGraph: function() {
          var ng = angular.copy(GraphService.getNamedGraphCS(graphName));
          return ng;
        },
        versionedGroup: function(){
          return undefined;
        }
      }
    });
    modalInstance.result.then(function(responseGraph) {
      saveGraph(responseGraph, false);
    });
  };

  $scope.editAdmin = function(graphName) {

    var modalInstance = $modal.open({
      templateUrl: 'modal-forms/settings/named-graphs/modal-graph.html',
      controller: 'ModalGraphCtrl',
      size: 'lg',
      backdrop: 'static',
      resolve: {
        currentNamedGraph: function() {
          var ng = angular.copy(GraphService.getNamedGraph(graphName));
          return ng;
        },
        versionedGroup: function(){
          return undefined;
        }
      }

    });

    modalInstance.result.then(function(responseGraph) {
      saveGraph(responseGraph, false);
    });

  };

  $scope.delete = function(graphName) {
    GraphService.deleteGraph(graphName).then(
      function(response) {
        refreshUserGraphs();
        refreshAllGraphs();
        refreshGraphGroups();
      }, 
      function(response){
            flash.error = ServerErrorResponse.getMessage(response);
      });
  };

  $scope.deleteForeign = function(graphName) {
    GraphService.deleteForeignGraph(graphName).then(
      function(response) {
        refreshUserGraphs();
        refreshAllGraphs();
        refreshGraphGroups();
      }, 
      function(response){
            flash.error = ServerErrorResponse.getMessage(response);
      });
  };

  $scope.toggleUserRead = function(user) {
    var index = $scope.namedgraph.usersRead.indexOf(user);
    if (index > -1) { // is currently selected
      $scope.namedgraph.usersRead.splice(index, 1);
    } else { // is newly selected
      $scope.namedgraph.usersRead.push(user);
    }
  };

  $scope.toggleUserWrite = function(user) {
    var index = $scope.namedgraph.usersWrite.indexOf(user);
    if (index > -1) { // is currently selected
      $scope.namedgraph.usersWrite.splice(index, 1);
    } else { // is newly selected
      $scope.namedgraph.usersWrite.push(user);
    }
  };

  $scope.userFilter = function(user) {
    return user != $scope.namedgraph.owner;
  };

  $scope.graphFilter = function(namedgraph) {
    return namedgraph.owner != AccountService.getAccount().getAccountURI();
  };

  /****
  GRAPH GROUPS
  ****/

  var refreshGraphGroups = function() {
    GraphGroupService.getAllGraphGroups(true).then(
      function(result) {
        $scope.graphgroups = result;
      },
      function(response){
            flash.error = ServerErrorResponse.getMessage(response);
      });
  };

  $scope.newGroup = function() {
    refreshAllGraphs();
    var modalInstance = $modal.open({
      templateUrl: 'modal-forms/settings/named-graphs/modal-graphgroup.html',
      controller: 'ModalGraphGroupCtrl',
      size: 'lg',
      backdrop: 'static',
      resolve: {
        currentGroup: function() {
          return null;
        },
        allGraphs: function() {
          return $scope.allgraphs;
        }
      }
    });

    modalInstance.result.then(function(graphgroup) {
      GraphGroupService.addGraphGroup(graphgroup).then(
        function(result) {
          refreshGraphGroups();
        },
        function(response){
            flash.error = ServerErrorResponse.getMessage(response);
        });
    });

  };

  $scope.editGroup = function(groupName) {
    refreshAllGraphs();
    var modalInstance = $modal.open({
      templateUrl: 'modal-forms/settings/named-graphs/modal-graphgroup.html',
      controller: 'ModalGraphGroupCtrl',
      size: 'lg',
      backdrop: 'static',
      resolve: {
        currentGroup: function() {
          return GraphGroupService.getGraphGroup(groupName);
        },
        allGraphs: function() {
          return $scope.allgraphs;
        }
      }
    });

    modalInstance.result.then(function(graphgroup) {
      GraphGroupService.updateGraphGroup(graphgroup).then(
        function(result) {
          refreshGraphGroups();
        },
        function(response){
            flash.error = ServerErrorResponse.getMessage(response);
        });
    });
  };

  $scope.deleteGroup = function(groupName) {
    GraphGroupService.deleteGraphGroup(groupName).then(
      function(result) {
        refreshGraphGroups();
      },
      function(response){
            flash.error = ServerErrorResponse.getMessage(response);
      });
  };

  
  /**
  *
  * For the co-evolution service
  *
  **/
  $scope.refreshVersionGroups = function(){
    return CoevolutionService.getGroups().then(
    //success
    function(identifiers){
      var vgroups=[];
      for(var i in identifiers){
        var namespace = identifiers[i] + "/";
        var id = identifiers[i].replace(Ns.getNamespace("gvg"),"");
        Ns.add(id, namespace);
        CoevolutionService.getGroup(id).then(
          function(vgroup){
            vgroup["uri"] = Ns.getNamespace(vgroup.identifier);
            vgroups.push(vgroup);
          });
      }
      $scope.versionGroups = vgroups;  
      return Config.read(); 
    },
    //fail
    function (response){
      flash.error = ServerErrorResponse.getMessage(response);
    });
  };

/*
{
  "label": "aaa",
  "created": "",
  "identifier": "aaa",
  "description": "aaa"
}
*/
  $scope.newVersionGroup = function(){
    var modalInstance = $modal.open({
      templateUrl: 'modal-forms/settings/named-graphs/modal-version-groups-form.html',
      controller: 'ModalVersionGroupsCtrl',
      size: 'lg',
      backdrop: 'static',
      resolve: {
        modaltitle : function(){
          return "New Version Group of Graphs";
        }, 
        resource : function (){
          return null;
        }, 
        uriBase : function(){
          return ConfigurationService.getUriBase();
        }
      }
    });

    modalInstance.result.then(function(response) {
      CoevolutionService.createGroup(response).then(
        function(response){
          $scope.refreshVersionGroups();
        },
        function(response){
          flash.error = ServerErrorResponse.getMessage(response);
        });
    });
  };

  $scope.deleteVersionGroup = function(vgroup){
    console.log(vgroup);
    CoevolutionService.deleteGroup(vgroup.identifier).then(
      function(response){
        $scope.refreshVersionGroups();
      },
      function(response){
          flash.error = ServerErrorResponse.getMessage(response);
      });
  };  
  

  $scope.saveVersionedGraph = function(graphName, group){
    
    // THis is not going to be done, because is already in the generator graph management
    // CoevolutionService.addVersion(group.identifier, graphName).then(
    //     function(response){
    //       $scope.refreshVersionGroups();
    //     },
    //     function(response){
    //         flash.error = ServerErrorResponse.getMessage(response);
    //     });
  };

  // Initialize all tables
  // need to refresh version groups before to have namespaces registered
  $scope.refreshVersionGroups().then(

    function(response){
      refreshAllGraphs();
      refreshUserGraphs();
      refreshGraphGroups();
      refreshAccessibleGraphs();  
    },
    function(response){
          flash.error = ServerErrorResponse.getMessage(response);
    });
  


}