'use strict';

/****************************************************************************************************
*
* IMPORT Controller
*
***************************************************************************************************/

var ImportFormCtrl = function($scope, $http, ConfigurationService, flash, AccountService, GraphService, Ns, Upload, ImportRdfService, ServerErrorResponse) {

  var currentAccount = AccountService.getAccount();
	

  $scope.refreshGraphList = function() {
    GraphService.getAccessibleGraphs(true, false, true).then(function(graphs) {
      $scope.namedGraphs = graphs;
    });
  };
  
  $scope.refreshGraphList();
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.uploadMessage = '';
		  
	var uploadError = false;
  var uploading = false;
	var importing = false;
	var uploadedFiles = null;
		
  $scope.importSparql = { sparqlQuery : "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o } LIMIT 10"};

	$scope.sourceTypes = [
		{value:'file', label:'File'},
		{value:'url', label:'URL'},
		{value:'externalQuery', label:'Endpoint'},
    {value:'localQuery', label:'Local'}
	];

  $scope.fileElements = false;
  $scope.urlElements = false;
  $scope.externalQueryElements = false;
  $scope.localQueryElements = false;

  $scope.graphLabel=function (id, label) {
    return label+ " <" + id + ">";
  }
		
  $scope.updateForm = function() {
    if($scope.sourceType.value == 'file'){
    	$scope.fileElements = true;	
		  $scope.urlElements = false;
  		$scope.externalQueryElements = false;
      $scope.localQueryElements = false;
    }
    else if($scope.sourceType.value == 'url'){
    	$scope.fileElements = false;	
		  $scope.urlElements = true;
  		$scope.externalQueryElements = false;
      $scope.localQueryElements = false;
    }
    else if($scope.sourceType.value == 'externalQuery'){
    	$scope.fileElements = false;	
		  $scope.urlElements = false;
  		$scope.externalQueryElements = true;
      $scope.localQueryElements = false;
    }
    else if($scope.sourceType.value == 'localQuery'){
      $scope.fileElements = false;  
      $scope.urlElements = false;
      $scope.externalQueryElements = false;
      $scope.localQueryElements = true;
    }
  };
	

  $scope.$watch('importFile.files', function () {
    if($scope.importFile != undefined )
      $scope.upload($scope.importFile.files);
  });

  $scope.upload = function (files) {
    if (files && files.length) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        Upload.upload({
            url: 'UploadServlet',
            file: file
        }).progress(function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            flash.success='progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :'+ evt.config.file.name;
            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
        }).success(function (data, status, headers, config) {
            console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
            uploadedFiles=config.file.name;
        });
      }
    }
  };

  $scope.isImporting =  function(){
    return importing;
  };

  $scope.isInvalid = function(){
    var invalid =true;
    if(!$scope.fileForm.$invalid){
        if(uploadedFiles!= null){
          invalid = false;
        }
    }
    return invalid;
  };

  $scope.import = function(){
    // validate the input fields accoding to the import type
    var parameters;
    importing = true;
    var response;
    if($scope.sourceType.value == 'file')
      response = ImportRdfService.importFromFile(uploadedFiles, $scope.importFile.targetGraph);
    else if($scope.sourceType.value == 'url')
      response = ImportRdfService.importFromUrl($scope.importUrl.inputUrl, $scope.importUrl.targetGraph);
    else if($scope.sourceType.value == 'externalQuery')
      response =  ImportRdfService.importFromEndpoint(scope.importEndpoint.sparqlQuery, $scope.importEndpoint.endPoint, $scope.importEndpoint.targetGraph);
    else if($scope.sourceType.value == 'localQuery')
      response =  ImportRdfService.importFromEndpoint($scope.importLocal.sourceGraph, $scope.importLocal.targetGraph, $scope.importLocal.sparqlQuery);
    
    response.then(
      //success
      function (response){
        flash.success = "successfully imported " + response.data.tiples + " triples";
        // TODO: add metadata 
      }, 
      function(response) {
        flash.error = ServerErrorResponse.getMessage(response);
      });

    $scope.resetValues();
  };

  $scope.resetValues = function(){
    uploadError = false;
    uploadedFiles = null;
    importing = false;

    $scope.urlForm.$setPristine();
    $scope.fileForm.$setPristine();
    $scope.endpointForm.$setPristine();
    $scope.localForm.$setPristine();

    // $scope.fileForm.fileName.value = null;

    $scope.importFile = {files:"", targetGraph:"?"};
    $scope.importUrl = {url:"", targetGraph:"?"};
    $scope.importEndpoint = {endpoint:"", sparqlQuery:"", targetGraph:"?"};
    $scope.importLocal = {endpoint:"", sparqlQuery:"", targetGraph:"?"};
  };

  $scope.$watch( function () { return currentAccount.getUsername(); }, function () {
    $scope.refreshGraphList();
  });

};
