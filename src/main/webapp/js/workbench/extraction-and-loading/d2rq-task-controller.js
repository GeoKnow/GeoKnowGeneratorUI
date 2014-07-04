'use strict';

var D2RQTaskCtrl = function($scope, $http, $q, flash, ServerErrorResponse, AccountService, GraphService, ConfigurationService, D2RQService) {
    var services = ConfigurationService.getComponentServices(":D2RQ");
	var d2rqServiceUrl = services[0].serviceUrl;

    $scope.tasks = D2RQService.getAllTasks();

    $scope.refreshTasks = function() {
        return D2RQService.refreshTasks().then(function(response) {
            $scope.tasks = D2RQService.getAllTasks();
        });
    };

    $scope.mappings = [];
    $scope.datasets = [];

    $scope.namedgraphs = [];

    var readDatasets = function() {
        return $http.get(d2rqServiceUrl+"/datasets/metadata/get")
            .then(function(response) {
                $scope.datasets = response.data;
            });
    };

    var adding = false;

    $scope.isAdding = function() {
        return adding;
    };

    var emptyTask = {name:"", mapping:null, dataset:null, namedgraph:null};

    $scope.task = angular.copy(emptyTask);

    $scope.new = function() {
        $scope.taskForm.$setPristine();
        $scope.task = angular.copy(emptyTask);
        adding = false;
        $http.get(d2rqServiceUrl+"/mappings/groups/metadata/get")
            .then(function(response) {
                $scope.mappings = response.data;
            });
        readDatasets();
        GraphService.getAccessibleGraphs(true, false, true).then(function(result) {
            $scope.namedgraphs = result;
        });
    };

    var createDataset = function() {
        var data = {name: $scope.task.namedgraph.graph.label
                    , graph: $scope.task.namedgraph.name.replace(':',ConfigurationService.getUriBase())
                    , httpEndpoint: $scope.task.namedgraph.graph.endpoint
                    , ontology: $scope.task.mapping.ontology
                    , readonly: false
                    , owner: AccountService.getUsername()}; //todo unauthorized user
        return $http({
            url: d2rqServiceUrl+"/datasets/add",
            method: "POST",
            data: data,
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        });
    };

    var findDataset = function(ontology, endpoint, graph) {
        for (var ind in $scope.datasets) {
            var ds = $scope.datasets[ind];
            if (ds.graph==graph && ds.httpEndpoint==endpoint && ds.ontology==ontology)
                return ds;
        }
        return null;
    };

    var findOrCreateDataset = function(ontology, endpoint, graph) {
        var ds = findDataset(ontology, endpoint, graph);
        if (ds!=null) {
            var deferred = $q.defer();
            deferred.resolve(ds);
            return deferred.promise;
        } else {
            return createDataset().then(function(response) {
                return readDatasets().then(function(response) {
                    return findDataset(ontology, endpoint, graph);
                });
            });
        }
    };

    $scope.add = function() {
        adding = true;
        findOrCreateDataset($scope.task.mapping.ontology, $scope.task.namedgraph.graph.endpoint, $scope.task.namedgraph.name.replace(':',ConfigurationService.getUriBase()))
            .then(function(ds) {
                $scope.task.dataset = ds;
                var data = {name: $scope.task.name
                            , compositeMapping: $scope.task.mapping.id
                            , dataset: $scope.task.dataset.id
                            , user: AccountService.getUsername()}; //todo unauthorized user
                $http({
                    url: d2rqServiceUrl+"/tasks/add",
                    method: "POST",
                    data: data,
                    dataType: "json",
                    headers: {"Content-Type":"application/json; charset=utf-8"}
                }).then(function(response) {
                    $scope.refreshTasks().then(function(response) {
                        $scope.close('#modalTask');
                        adding = false;
                    });
                }, function(response) {
                    flash.error = ServerErrorResponse.getMessage(response.status);
                    $scope.close('#modalTask');
                });
            });
    };

    $scope.delete = function(id) {
        $http({
            url: d2rqServiceUrl+"/tasks/" + id + "/delete",
            method: "POST",
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            $scope.refreshTasks();
        }, function(response) {
            flash.error = ServerErrorResponse.getMessage(response.status);
            $scope.refreshTasks();
        });
    };

    $scope.execute = function(id) {
        var data = {
            targetUrl: d2rqServiceUrl+"/tasks/" + id + "/execute",
            user: AccountService.getUsername()
        };
        $http({
            url: "ExecuteD2RQTaskServlet",
            method: "POST",
            dataType: "json",
            params: data,
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            $scope.refreshTasks();
        }, function(response) {
            flash.error = ServerErrorResponse.getMessage(response.status);
            $scope.refreshTasks();
        });
    };

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };
};