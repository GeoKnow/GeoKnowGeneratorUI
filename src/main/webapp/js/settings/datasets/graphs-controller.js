'use strict';


function GraphCtrl($scope, $http, flash, ConfigurationService, Helpers, GraphService, GraphGroupService, ServerErrorResponse) {
    
    $scope.accessModes = GraphService.getAccessModes();

    $scope.users = [];

    var emptyGraph = {
        name: "",
        graph: {
            created: "now",
            endpoint: "",
            description: "",
            modified: "",
            label: ""
        },
        owner: "",
        publicAccess: "",
        usersWrite: [],
        usersRead: []
    };
    var newGraph = true;

    GraphService.getUserGraphs($scope.$parent.currentAccount.getAccountURI())
        .then(function (graphs){
        console.log(graphs);
        $scope.namedgraphs = graphs;
    })

    GraphService.getAccessibleGraphs(false, true, false) // onlyWritable, skipOwn, reload
        .then(function (graphs) {
        $scope.accnamedgraphs = graphs;
    });

    $scope.allgraphs = [];
    GraphService.getAllNamedGraphs(false) // reload
      .then(function (graphs) {
        $scope.allgraphs = graphs;
    });

    $scope.namedgraph = emptyGraph;
    $scope.modaltitle = "";

    $scope.refreshUsersList = function () {
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
            .success(function (data, status, headers, config) {
                $scope.users = [];
                var ns = ConfigurationService.getUriBase();
                for (var ind in data) {
                    $scope.users.push(data[ind].replace(ns, ":"));
                }
            })
            .error(function (data, status, headers, config) {
                flash.error = data;
            });
    }

    $scope.isNew = function () {
        return newGraph;
    };

    $scope.new = function () {
        // default values
        newGraph = true;
        $scope.graphForm.$setPristine();
        $scope.modaltitle = "New Named Graph";

        var s_now = Helpers.getCurrentDate();
        var defaultEndpoint = ConfigurationService.getSPARQLEndpoint();

        $scope.namedgraph = angular.copy(emptyGraph);
        $scope.namedgraph.graph.created = s_now;
        $scope.namedgraph.graph.modified = s_now;
        $scope.namedgraph.graph.endpoint = ConfigurationService.getSPARQLEndpoint();
        $scope.namedgraph.publicAccess = GraphService.getNoAccessMode();
        $scope.namedgraph.owner = $scope.$parent.currentAccount.getAccountURI();

        $scope.refreshUsersList();
    };

    $scope.edit = function (graphName) {
        $scope.namedgraph = angular.copy(GraphService.getNamedGraphCS(graphName));
        $scope.namedgraph.name = $scope.namedgraph.name.replace(':', '');
        $scope.namedgraph.owner = $scope.$parent.currentAccount.getAccountURI();
        newGraph = false;
        $scope.modaltitle = "Edit Named Graph";
        $scope.refreshUsersList();
    };

    $scope.editAdmin = function (graphName) {
        $scope.namedgraph = angular.copy(GraphService.getNamedGraph(graphName));
        $scope.namedgraph.name = $scope.namedgraph.name.replace(':', '');
        newGraph = false;
        $scope.modaltitle = "Edit Named Graph";
        $scope.refreshUsersList();
    };

    $scope.save = function () {
        var response;
        $scope.namedgraph.name = ":" + $scope.namedgraph.name;
        if (newGraph)
            response = GraphService.addGraph($scope.namedgraph);
        else {
            if ($scope.namedgraph.owner == $scope.$parent.currentAccount.getAccountURI())
                response = GraphService.updateGraph($scope.namedgraph);
            else 
                response = GraphService.updateForeignGraph($scope.namedgraph).then(function (response) {
                    $scope.refreshAllGraphs();
                });
        }
        response.then(
            function(){
            // success
                $scope.close('#modalGraph');
                $scope.refreshTable();
                $scope.refreshAllGraphs();
        }, function(response){
            //error
            var message = ServerErrorResponse.getMessage(response);
            flash.error = message;
        });

    };

    $scope.delete = function (graphName) {
        GraphService.deleteGraph(graphName);
        $scope.refreshTable();
        $scope.refreshAllGraphs();
        $scope.refreshGraphGroups();
    };

    $scope.deleteForeign = function (graphName) {
        GraphService.deleteForeignGraph(graphName).then(function (response) {
            $scope.refreshTable();
            $scope.refreshAllGraphs();
            $scope.refreshGraphGroups();
        });
    };

    $scope.toggleUserRead = function (user) {
        var index = $scope.namedgraph.usersRead.indexOf(user);
        if (index > -1) { // is currently selected
            $scope.namedgraph.usersRead.splice(index, 1);
        } else { // is newly selected
            $scope.namedgraph.usersRead.push(user);
        }
    };

    $scope.toggleUserWrite = function (user) {
        var index = $scope.namedgraph.usersWrite.indexOf(user);
        if (index > -1) { // is currently selected
            $scope.namedgraph.usersWrite.splice(index, 1);
        } else { // is newly selected
            $scope.namedgraph.usersWrite.push(user);
        }
    };

    $scope.refreshTable = function () {
        $scope.namedgraphs = GraphService.getUserGraphs($scope.$parent.currentAccount.getAccountURI());
    };

    $scope.refreshAccessibleGraphs = function () {
        GraphService.getAccessibleGraphs(false, true, true).then(function (graphs) {
            $scope.accnamedgraphs = graphs;
        });
    };

    $scope.refreshAllGraphs = function () {

        GraphService.getUserGraphs($scope.$parent.currentAccount.getAccountURI())
            .then(function (graphs){
            $scope.namedgraphs = graphs;
        })

        GraphService.getAllNamedGraphs(true).then(function (graphs) {
            $scope.allgraphs = graphs;
        });
    };

    $scope.userFilter = function (user) {
        return user != $scope.namedgraph.owner;
    };

    $scope.graphFilter = function (namedgraph) {
        return namedgraph.owner != $scope.$parent.currentAccount.getAccountURI();
    };

    $scope.graphgroups = [];
    GraphGroupService.getAllGraphGroups(false).then(function (result) {
        $scope.graphgroups = result;
    });
    var emptyGroup = {
        name: "",
        label: "",
        description: "",
        created: "",
        modified: "",
        namedGraphs: []
    };
    var newGroup = false;
    $scope.isNewGroup = function () {
        return newGroup;
    };

    $scope.graphgroup = emptyGroup;

    $scope.newGroup = function () {
        newGroup = true;
        $scope.groupForm.$setPristine();
        $scope.modaltitle = "New Graph Group";
        var s_now = Helpers.getCurrentDate();
        $scope.graphgroup = angular.copy(emptyGroup);
        $scope.graphgroup.created = s_now;
        $scope.graphgroup.modified = s_now;
        $scope.refreshAllGraphs();
    };

    $scope.editGroup = function (groupName) {
        $scope.graphgroup = angular.copy(GraphGroupService.getGraphGroup(groupName));
        $scope.graphgroup.name = $scope.graphgroup.name.replace(':', '');
        newGroup = false;
        $scope.modaltitle = "Edit Graph Group";
        $scope.refreshAllGraphs();
    };

    $scope.saveGroup = function () {
        $scope.graphgroup.name = ":" + $scope.graphgroup.name;
        if (newGroup) {
            GraphGroupService.addGraphGroup($scope.graphgroup).then(function (result) {
                $scope.close('#modalGroup');
                $scope.refreshGraphGroups();
            });
        } else {
            GraphGroupService.updateGraphGroup($scope.graphgroup).then(function (result) {
                $scope.close('#modalGroup');
                $scope.refreshGraphGroups();
            });
        }
    };

    $scope.deleteGroup = function (groupName) {
        GraphGroupService.deleteGraphGroup(groupName).then(function (result) {
            $scope.refreshGraphGroups();
        });
    };

    $scope.refreshGraphGroups = function () {
        GraphGroupService.getAllGraphGroups(true).then(function (result) {
            $scope.graphgroups = result;
        });
    };

    $scope.toggleGraph = function (graphName) {
        var index = $scope.graphgroup.namedGraphs.indexOf(graphName);
        if (index > -1) { // is currently selected
            $scope.graphgroup.namedGraphs.splice(index, 1);
        } else { // is newly selected
            $scope.graphgroup.namedGraphs.push(graphName);
        }
    };

    $scope.close = function(modalID) {
    	$(modalID).modal('hide');
        $('body').removeClass('modal-open');
      	$('.modal-backdrop').slideUp();
      	$('.modal-scrollable').slideUp();
    };

    // watch
    // $scope.$watch(function () {
    //     return GraphService.getUserGraphs($scope.$parent.currentAccount.getAccountURI());
    // }, function () {
    //     $scope.refreshTable();
    // }, true);

    $scope.$watch(function () {
        return $scope.$parent.currentAccount;
    }, function () {
        $scope.refreshAccessibleGraphs();
        $scope.refreshAllGraphs();
    });
}