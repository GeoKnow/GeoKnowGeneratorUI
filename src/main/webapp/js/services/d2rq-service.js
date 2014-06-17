'use strict';

var module = angular.module('app.d2rq-service', []);

module.factory("D2RQService", function($http, $q, ConfigurationService) {
    var d2rqServices = ConfigurationService.getComponentServices(":D2RQ");
    var d2rqServiceUrl = d2rqServices[0].serviceUrl;

    var mappingGroups = [];
    var tasks = [];

    var mappingGroupsLoaded = false;
    var tasksLoaded = false;

    var readMappingGroups = function() {
        if (mappingGroupsLoaded) {
            var deferred = $q.defer();
            deferred.resolve(mappingGroups);
            return deferred.promise;
        } else {
            return $http.get(d2rqServiceUrl + "/mappings/groups/metadata/get")
                .then(function(response) {
                    mappingGroups = response.data;
                    mappingGroupsLoaded = true;
                });
        }
    };

    var refreshMappingGroups = function() {
        mappingGroupsLoaded = false;
        return readMappingGroups();
    };

    var getAllMappingGroups = function() {
        return mappingGroups;
    };

    var readTasks = function() {
        if (tasksLoaded) {
            var deferred = $q.defer();
            deferred.resolve(tasks);
            return deferred.promise;
        } else {
            return $http.get(d2rqServiceUrl + "/tasks/metadata/get")
                .then(function(response) {
                    tasks = response.data;
                    tasksLoaded = true;
                });
        }
    };

    var refreshTasks = function() {
        tasksLoaded = false;
        return readTasks();
    };

    var getAllTasks = function() {
        return tasks;
    };

    return {
        readMappingGroups   : readMappingGroups,
        refreshMappingGroups: refreshMappingGroups,
        getAllMappingGroups : getAllMappingGroups,
        readTasks           : readTasks,
        refreshTasks        : refreshTasks,
        getAllTasks         : getAllTasks
    };
});