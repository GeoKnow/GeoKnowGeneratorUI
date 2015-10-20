'use strict';

/****************************************************************************************************
*
* IMPORT Controller
*
***************************************************************************************************/

var ImportFormCtrl = function($scope, $http, $q, $timeout, ConfigurationService, flash, AccountService, GraphService, Ns, Upload, ImportRdfService, ServerErrorResponse, Helpers) {

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

  // initialise some required fields
  var initialise = function(){

    uploadError = false;
    uploading = false;
    importing = false;
    uploadedFiles = null;

    
    $scope.endpoints = ConfigurationService.getAllEndpoints();
    $scope.uploadMessage = "";
    $scope.sourceType = "";

    // source can be : file, url, endpoint or graph
    $scope.importRdf = { 
      source : "" };
   
    //scope variables used in the target-graph direcitve
    $scope.target = { 
      label : "Target Graph",
      graph : "" };
    $scope.newTarget ={
      prefix : "RdfImport" ,
      label : "",
      description : ""
    };
    //scope variable is for the source-graph direcitve
    $scope.source = { 
      label : "Source Graph",
      graph : "" };

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
      $scope.importLocal.sparqlQuery = "INSERT { GRAPH <" + Ns.lengthen($scope.target.graph) + "> {?s ?p ?o}} " 
                      + "WHERE {GRAPH <" + Ns.lengthen($scope.importRdf.source) + "> {?s ?p ?o}}";
      return true;
    }
    else 
      $scope.importLocal.sparqlQuery  = $scope.importLocal.action;
    return false;
  };

  $scope.updateNewTargetInfo = function(){
    if($scope.sourceType.value == 'file'){
      $scope.newTarget ={
        prefix : "RdfImport" ,
        label : "Import form " + $scope.importRdf.source.length +" files",
        description : "Import from file "+$scope.importRdf.source,
      };
    }
    else if($scope.sourceType.value == 'url'){
      $scope.newTarget ={
        prefix : "RdfImport" ,
        label : "Import from url",
        description : "Import from url "+$scope.importRdf.source,
      };
    }
    else if($scope.sourceType.value == 'externalQuery'){
      $scope.newTarget ={
        prefix : "RdfImport" ,
        label : "Import from endpoint",
        description : "Import from endpoint "+$scope.importRdf.source,
      };
    }
    else if($scope.sourceType.value == 'localQuery'){
      $scope.importRdf.source = $scope.source.graph;
       $scope.newTarget ={
        prefix : "RdfImport" ,
        label : "Import from graph",
        description : "Import from graph "+$scope.importRdf.source,
      };
    }
   
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
	
  /**
   For File Import
  **/
  $scope.uploadSuceed = function(){

    return ($scope.sourceType.value == 'file' && $scope.importRdf.source!=null)
  }

  $scope.uploadFiles = function(files, errFiles) {
    
    $scope.errFiles = errFiles;
    var promises = [];
    
    angular.forEach(files, function(file) {
      
       var deferred = $q.defer();
        file.upload = Upload.upload({
            url:  'UploadServlet',
            data: {file: file}
        });

        file.upload.then(function (response) {
            $timeout(function () {
              deferred.resolve(file.name);
            });
        }, function (response) {
            if (response.status > 0)
              flash.error = response.status + ': ' + response.data;
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);  
            flash.success='progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :'+ file.name;
            // file.progress = Math.min(100, parseInt(100.0 * 
            //                          evt.loaded / evt.total));
        });

        promises.push(deferred.promise);
      }); // foreach
 
    $q.all(promises).then(
      // results: an array of data objects from each deferred.resolve(data) call
        function(results) {
          flash.success='Uploaded: ' + results  ;
          $scope.importRdf.source = results;
          $scope.updateNewTargetInfo();
        },
        // error
        function(response) {
          console.log(response);
        }
    );
  }



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

  /** Main importing function **/
  $scope.import = function(){
    // validate the input fields accoding to the import type
    var parameters;
    importing = true;
    var importPromise;
    var source;

    if($scope.sourceType.value == 'file')
      importPromise = ImportRdfService.importFromFile($scope.importRdf.source, $scope.target.graph);
    else if($scope.sourceType.value == 'url')
      importPromise = ImportRdfService.importFromUrl($scope.importRdf.source, $scope.target.graph);
    else if($scope.sourceType.value == 'externalQuery')
      importPromise =  ImportRdfService.importFromEndpoint(scope.importEndpoint.sparqlQuery, $scope.importRdf.source, $scope.target.graph);
    else if($scope.sourceType.value == 'localQuery')
      importPromise =  ImportRdfService.importFromLocal($scope.importRdf.source, $scope.target.graph, $scope.importLocal.sparqlQuery);
    
    importPromise.then(
      //success
      function (response){
        
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


};
