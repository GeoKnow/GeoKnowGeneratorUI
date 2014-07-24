'use strict';

/****************************************************************************************************
*
* Ontologies Controller
*
***************************************************************************************************/
var OntologyCtrl = function($scope, $http, flash, ServerErrorResponse, AccountService, OntologyService, ConfigurationService, localize) {
    var miniDixServices = ConfigurationService.getComponentServices(":MiniDix");
	var miniDixServiceUrl = miniDixServices[0].serviceUrl;

	var d2rqServices = ConfigurationService.getComponentServices(":D2RQ");
	var d2rqServiceUrl = d2rqServices[0].serviceUrl;

    $scope.ontologies = OntologyService.getAllOntologies();

    $scope.refreshOntologies = function() {
        OntologyService.refreshOntologies().then(function(response) {
            $scope.ontologies = OntologyService.getAllOntologies();
        });
    };

    $scope.sourceTypes = [
        {value:'file', label:'_file_'},
    	{value:'url', label:'URL'},
    ];
    var type = '';

    $scope.fileElements = false;
    $scope.urlElements = false;

    $scope.localize = function(str) {
        return localize.getLocalizedString(str);
    };

    $scope.updateForm = function() {
        if ($scope.sourceType.value == 'file') {
            $scope.fileElements = true;
    		$scope.urlElements = false;
        } else if($scope.sourceType.value == 'url') {
        	$scope.fileElements = false;
    		$scope.urlElements = true;
        }
        type = $scope.sourceType.value;
    };

    $scope.ontology = {uri: "", file:""};

    $scope.add = function() {
        if (type=="url") {
            var data = {uri: $scope.ontology.uri, user: AccountService.getUsername()}; //todo unauthorized user
            $http({
                url: d2rqServiceUrl+ "/ontologies/add",
                method: "POST",
                dataType: "json",
                data: data,
                headers: {"Content-Type":"application/json; charset=utf-8"}
            }).then(function(response) {
                $scope.refreshOntologies();
                $scope.close('#modalOntology');
            }, function(response) {
                flash.error = ServerErrorResponse.getMessage(response.status);
                $scope.refreshOntologies();
            });
        } else if (type=="file") {
            $http.uploadFile({
                url: d2rqServiceUrl + "/ontologies/upload",
                file: $scope.ontology.file,
                data: {user: AccountService.getUsername()} //todo unauthorized user
            }).then(function(response) {
                $scope.refreshOntologies();
                $scope.close('#modalOntology');
            }, function(response) {
                flash.error = ServerErrorResponse.getMessage(response.status);
                $scope.refreshOntologies();
            });
        }
    };

    $scope.delete = function(ontology) {
        var data = {uri: ontology, user: AccountService.getUsername()}; //todo unauthorized user
        $http({
            url: d2rqServiceUrl + "/ontologies/delete",
            method: "POST",
            dataType: "json",
            data: data,
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            $scope.refreshOntologies();
        }, function(response) {
            flash.error = ServerErrorResponse.getMessage(response.status);
            $scope.refreshOntologies();
        });
    };

    $scope.clearHistory = function() {
        var ontology = "http://acc.ontos.com/thesaurus/concept/v2/";
        var data = {uri: ontology, user: AccountService.getUsername()};
            $http({
                url: d2rqServiceUrl+ "/ontologies/history/clear",
                method: "POST",
                dataType: "json",
                data: data,
                headers: {"Content-Type":"application/json; charset=utf-8"}
            }).then(function(response) {
                $scope.refreshOntologies();
                flash.success = localize.getLocalizedString("_clear-history-success-message_");
            }, function(response) {
                flash.error = ServerErrorResponse.getMessage(response.status);
                $scope.refreshOntologies();
            });
    };

    $scope.new = function(){
        $scope.urlForm.$setPristine();
        $scope.fileForm.$setPristine();
        $scope.typeForm.$setPristine();
        $scope.ontology = {uri: "", file:""};
        type = '';
        $scope.sourceType = null;
        $scope.fileElements = false;
        $scope.urlElements = false;
    };

    $scope.url = "";
	$scope.setUrl = function(ontology){
	    $scope.url= miniDixServiceUrl + "/?ontology=" + ontology + "&newConceptsOntology=" + ontology + "&writableOntologies=" + ontology + "&locale=" + localize.language;
	};

	$scope.onFileSelect = function($files) {
	    if ($files.length==0)
	        $scope.ontology.file = null;
        else
            $scope.ontology.file = $files[0];
    };

    $scope.isLoggedIn = function() {
        return AccountService.isLogged();
    };

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };
};