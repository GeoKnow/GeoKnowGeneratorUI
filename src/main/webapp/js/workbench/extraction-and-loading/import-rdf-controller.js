'use strict';

/****************************************************************************************************
*
* IMPORT Controller
*
***************************************************************************************************/

var ImportFormCtrl = function($scope, $http, ConfigurationService, flash, AccountService, GraphService, Ns, Upload, ImportRdfService, ServerErrorResponse, Helpers) {

  var currentAccount = AccountService.getAccount();
	     
  var uploadError = false;
  var uploading = false;
  var importing = false;
  var uploadedFiles = null;

  $scope.sourceTypes = [
    {value:'file', label:'File'},
    {value:'url', label:'URL'},
    {value:'externalQuery', label:'Endpoint'},
    {value:'localQuery', label:'Local'}
  ];

  $scope.refreshGraphList = function() {
    GraphService.getAccessibleGraphs(true, false, true).then(function(graphs) {
      $scope.namedGraphs = graphs;
    });
  };	
  // initialise some required fields
  var initialise = function(){

    uploadError = false;
    uploading = false;
    importing = false;
    uploadedFiles = null;

    $scope.refreshGraphList();
    $scope.endpoints = ConfigurationService.getAllEndpoints();
    $scope.uploadMessage = '';

    $scope.sourceType = "";

    // source can be : file, url, endpoint or graph
    $scope.importRdf = { 
      targetGraph:"" , 
      source : "" };

    $scope.importEndpoint = {sparqlQuery : "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o } "};
    $scope.importLocal = { action : "ADD", sparqlQuery : "ADD"};

    $scope.fileElements = false;
    $scope.urlElements = false;
    $scope.externalQueryElements = false;
    $scope.localQueryElements = false;
  };
  
  initialise();

  $scope.updateSparqlCopyQuery = function(){
    if($scope.importLocal.action == 'QUERY'){
      $scope.importLocal.sparqlQuery = "INSERT { GRAPH <" + Ns.lengthen($scope.importRdf.targetGraph) + "> {?s ?p ?o}} " 
                      + "WHERE {GRAPH <" + Ns.lengthen($scope.importRdf.source) + "> {?s ?p ?o}}";
      return true;
    }
    else 
      $scope.importLocal.sparqlQuery  = $scope.importLocal.action;
    return false;
  };

  // $scope.$watch('importLocal.action', function () {
  //   $scope.updateSparqlCopyQuery();
  // });

  $scope.describeGraph=function (ngraph) {
    return ngraph.name + " - " + ngraph.graph.label ;
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
        }).success(function (data, status, headers, config) {
          $scope.importRdf.source = config.file.name;
          //uploadedFiles=config.file.name;
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
        if($scope.importRdf.source!= null){
          invalid = false;
        }
    }
    return invalid;
  };

  $scope.import = function(){
    // validate the input fields accoding to the import type
    var parameters;
    importing = true;
    var importPromise;
    var source;

    console.log($scope.importRdf);

    if($scope.sourceType.value == 'file')
      importPromise = ImportRdfService.importFromFile($scope.importRdf.source, $scope.importRdf.targetGraph);
    else if($scope.sourceType.value == 'url')
      importPromise = ImportRdfService.importFromUrl($scope.importRdf.source, $scope.importRdf.targetGraph);
    else if($scope.sourceType.value == 'externalQuery')
      importPromise =  ImportRdfService.importFromEndpoint(scope.importEndpoint.sparqlQuery, $scope.importRdf.source, $scope.importRdf.targetGraph);
    else if($scope.sourceType.value == 'localQuery')
      importPromise =  ImportRdfService.importFromLocal($scope.importRdf.source, $scope.importRdf.targetGraph, $scope.importLocal.sparqlQuery);
    
    importPromise.then(
      //success
      function (response){
        
        console.log(response);

        var imported = response.data.import;

        var meta = { 
          namedGraph :   imported.targetGraph, 
          source:   $scope.importRdf.source, 
          contributor :  Ns.lengthen(currentAccount.getAccountURI()),
          date: Helpers.getCurrentDate() 
        };
        // update the metadata of the graph
        GraphService.addContribution(meta).then(
          function(response){
            console.log(response);
            flash.success = "successfully imported " + imported.triples + " triples";
            $scope.resetValues();
          }, 
          function(response){
            flash.error = ServerErrorResponse.getMessage(response);
            importing = false;
          });

      }, 
      function(response) {
        flash.error = ServerErrorResponse.getMessage(response);
        importing = false;
      });

    
  };

  $scope.resetValues = function(){
    
    initialise();

    $scope.urlForm.$setPristine();
    $scope.fileForm.$setPristine();
    $scope.endpointForm.$setPristine();
    $scope.localForm.$setPristine();

  };

  $scope.$watch( function () { return currentAccount.getUsername(); }, function () {
    $scope.refreshGraphList();
  });

};
