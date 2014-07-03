'use strict';

var ReindexCtrl = function($scope, $http, flash, ConfigurationService, AccountService, ServerErrorResponse, DocumentErrorResponse) {
	var reindexService = ConfigurationService.getService(":ReindexService");
	var reindexServiceUrl = reindexService.serviceUrl;

	$scope.reindexing = false;

    $scope.beforeReindex = function() {
        $scope.reindexing = false;
    };

    $scope.reindex = function() {
        console.log("reindex with current thesaurus");
        $scope.reindexing = true;
        $http.post(reindexServiceUrl)
            .then(function(response) {
                $scope.close('#reindexDocuments');
                console.log("reindex completed");
                console.log(response.data);
                flash.success = "Reindex finished";
                $scope.reindexing = false;
            }, function(response) {
                $scope.close('#reindexDocuments');
                console.log("reindex failed");
                console.log(response);
                if (response.status==500) flash.error = ServerErrorResponse.getMessage(response.status) + ": " + DocumentErrorResponse.getMessage(parseInt(response.data));
                else flash.error = ServerErrorResponse.getMessage(response.status);
                $scope.reindexing = false;
            });
    };

    $scope.isLoggedIn = function() {
        return AccountService.isLogged();
    };
}