'use strict';

function ModalGraphCtrl($scope, $http, $modalInstance, currentNamedGraph, versionedGroup, ConfigurationService, GraphService, AccountService, Helpers, cfpLoadingBar, Ns) {

  $scope.isNew = function() {
    if (currentNamedGraph == null) {
      return true;
    } else {
      console.log(currentNamedGraph)
      return false;
    }
  }
  console.log(versionedGroup);

  $scope.uriBase = ConfigurationService.getUriBase();
  if(versionedGroup!= undefined)
    $scope.uriBase = versionedGroup.uri;
  
  $scope.namedgraph = {
    name: "",
    graph: {
      created: "now",
      endpoint: "",
      description: "",
      modified: "",
      label: "",
      graphset:"",
    },
    owner: "",
    publicAccess: "",
    usersWrite: [],
    usersRead: []
  };
  $scope.isLoading = function() {
    var stat = cfpLoadingBar.status();
    if ((stat > 0.0) && (stat < 1.0)) {
      return true;
    } else {
      return false;
    }
  }
  $scope.accessModes = GraphService.getAccessModes();
  $scope.users = [];
  $scope.refreshUsersList = function() {
    var parameters = {
      mode: "getUsers"
    }
    $http({
        url: "AuthenticationServlet",
        method: "POST",
        dataType: "json",
        params: parameters,
        contentType: "application/json; charset=utf-8"
      })
      .success(function(data, status, headers, config) {
        $scope.users = [];
        var ns = ConfigurationService.getUriBase();
        for (var ind in data) {
          $scope.users.push(data[ind].replace(ns, ""));
        }
      })
      .error(function(data, status, headers, config) {
        flash.error = data;
      });
  }
  $scope.refreshUsersList();
  //if a new named graph gets created
  if ($scope.isNew()) {
    $scope.modaltitle = "New Graph";
    var s_now = Helpers.getCurrentDate();
    var defaultEndpoint = ConfigurationService.getSPARQLEndpoint();
    $scope.namedgraph.graph.created = s_now;
    $scope.namedgraph.graph.modified = s_now;
    $scope.namedgraph.graph.endpoint = defaultEndpoint;
    $scope.namedgraph.publicAccess = GraphService.getNoAccessMode();
    $scope.namedgraph.owner = AccountService.getAccount().getAccountURI();
    if(versionedGroup!= undefined)
      $scope.namedgraph.graph.graphset=versionedGroup.identifier;
  } else {
    //if and existing named graph gets modified	  	
    $scope.modaltitle = "Edit Graph";
    $scope.namedgraph = angular.copy(currentNamedGraph);
    $scope.namedgraph.name = $scope.namedgraph.name.replace(':', '');
    $scope.namedgraph.owner = AccountService.getAccount().getAccountURI();
    $scope.namedgraph.usersRead = [];
    $scope.namedgraph.usersWrite = [];
    var ns = ConfigurationService.getUriBase();
    for (var ind in currentNamedGraph.usersRead) {
      var read = currentNamedGraph.usersRead[ind];
      read = read.replace(ns, "");
      read = read.replace(":", "");
      $scope.namedgraph.usersRead.push(read);
    }
    for (var ind in currentNamedGraph.usersWrite) {
      var write = currentNamedGraph.usersWrite[ind];
      write = write.replace(ns, "");
      write = write.replace(":", "");
      $scope.namedgraph.usersWrite.push(write);
    }
  }
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
  $scope.ok = function() {
    // console.log($scope.$broadcast('validateUnique'));
    var input = angular.copy($scope.namedgraph)
    $modalInstance.close(input);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
}