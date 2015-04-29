'use strict';


function GraphCtrl($scope, $http, $modal, flash, Config, ConfigurationService, Helpers, AccountService, GraphService, GraphGroupService) {

  $scope.accessModes = GraphService.getAccessModes();

  $scope.isNew = function() {
    return newGraph;
  };

  $scope.new = function() {
    var modalInstance = $modal.open({
      templateUrl: 'modal-forms/settings/dataset/modal-graph.html',
      controller: 'ModalGraphCtrl',
      size: 'lg',
      backdrop: 'static',
      resolve: {
        currentNamedGraph: function() {
          return null;
        }
      }
    });
    modalInstance.result.then(function(responseGraph) {
      $scope.save(responseGraph, true);
    });
  };

  $scope.edit = function(graphName) {

    var modalInstance = $modal.open({
      templateUrl: 'modal-forms/settings/dataset/modal-graph.html',
      controller: 'ModalGraphCtrl',
      backdrop: 'static',
      size: 'lg',
      resolve: {
        currentNamedGraph: function() {
          var ng = angular.copy(GraphService.getNamedGraphCS(graphName));
          return ng;
        }
      }

    });
    modalInstance.result.then(function(responseGraph) {
      $scope.save(responseGraph, false);

    });
  };

  $scope.editAdmin = function(graphName) {

    var modalInstance = $modal.open({
      templateUrl: 'modal-forms/settings/dataset/modal-graph.html',
      controller: 'ModalGraphCtrl',
      size: 'lg',
      backdrop: 'static',
      resolve: {
        currentNamedGraph: function() {
          var ng = angular.copy(GraphService.getNamedGraph(graphName));
          return ng;
        }
      }

    });

    modalInstance.result.then(function(responseGraph) {
      $scope.save(responseGraph, false);
    });

  };

  $scope.save = function(namedgraph, newGraph) {

    var response;
    namedgraph.name = ":" + namedgraph.name;
    if (newGraph)
      response = GraphService.addGraph(namedgraph);
    else {
      if (namedgraph.owner == AccountService.getAccount().getAccountURI())
        response = GraphService.updateGraph(namedgraph);
      else {
        response = GraphService.updateForeignGraph(namedgraph).then(function(response) {
          $scope.refreshAllGraphs();
        });

      }
    }

    response.then(
      function() {
        //success
        $scope.refreshUserGraphs();
        $scope.refreshAllGraphs();
      },
      function(response) {
        //error
        flash.error(response.data);
      });
  };

  $scope.delete = function(graphName) {
    GraphService.deleteGraph(graphName).then(function(response) {
      $scope.refreshUserGraphs();
      $scope.refreshAllGraphs();
      $scope.refreshGraphGroups();
    });
  };

  $scope.deleteForeign = function(graphName) {
    GraphService.deleteForeignGraph(graphName).then(function(response) {
      $scope.refreshUserGraphs();
      $scope.refreshAllGraphs();
      $scope.refreshGraphGroups();
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

  $scope.refreshUserGraphs = function() {
    GraphService.getUserGraphs(AccountService.getAccount().getAccountURI(), true)
      .then(function (graphs){
        $scope.namedgraphs = graphs;
      });
  };

  $scope.refreshAccessibleGraphs = function() {
    GraphService.getAccessibleGraphs(false, true, true).then(function(graphs) {
      $scope.accnamedgraphs = graphs;
    });
  };

  $scope.refreshAllGraphs = function() {
    GraphService.getAllNamedGraphs(true).then(function(graphs) {
      $scope.allgraphs = graphs;
    });
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

  $scope.newGroup = function() {
    $scope.refreshAllGraphs();
    var modalInstance = $modal.open({
      templateUrl: 'modal-forms/settings/dataset/modal-graphgroup.html',
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
      GraphGroupService.addGraphGroup(graphgroup).then(function(result) {
        $scope.refreshGraphGroups();
      });
    });

  };

  $scope.editGroup = function(groupName) {
    $scope.refreshAllGraphs();
    var modalInstance = $modal.open({
      templateUrl: 'modal-forms/settings/dataset/modal-graphgroup.html',
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
      GraphGroupService.updateGraphGroup(graphgroup).then(function(result) {
        $scope.refreshGraphGroups();
      });
    });
  };

  $scope.deleteGroup = function(groupName) {
    GraphGroupService.deleteGraphGroup(groupName).then(function(result) {
      $scope.refreshGraphGroups();
    });
  };

  $scope.refreshGraphGroups = function() {
    GraphGroupService.getAllGraphGroups(true).then(function(result) {
      $scope.graphgroups = result;
    });
  };

  // Initialize all tables
  $scope.refreshAllGraphs();
  $scope.refreshUserGraphs();
  $scope.refreshGraphGroups();
  $scope.refreshAccessibleGraphs();


}