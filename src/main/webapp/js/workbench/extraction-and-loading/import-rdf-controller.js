'use strict';

/****************************************************************************************************
*
* IMPORT Controller
*
***************************************************************************************************/

var ImportFormCtrl = function($scope, $http, ConfigurationService, flash, AccountService, GraphService) {

  var currentAccount = AccountService.getAccount();
	$scope.namedGraphs = [];
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
		{value:'query', label:'SPARQL Query'}
	];
	var type = '';

  $scope.fileElements = false;
  $scope.urlElements = false;
  $scope.queryElements = false;
		
  $scope.updateForm = function() {
    if($scope.sourceType.value == 'file'){
    	$scope.fileElements = true;	
		  $scope.urlElements = false;
  		$scope.queryElements = false;
    }
    else if($scope.sourceType.value == 'url'){
    	$scope.fileElements = false;	
		  $scope.urlElements = true;
  		$scope.queryElements = false;
    }
    else if($scope.sourceType.value == 'query'){
    	$scope.fileElements = false;	
		  $scope.urlElements = false;
  		$scope.queryElements = true;
    }
    type = $scope.sourceType.value;
  };
	
	$scope.onFileSelect = function($files) {
  	uploading = true;
    //$files: an array of files selected, each file has name, size, and type.
    for (var i = 0; i < $files.length; i++) {
      var $file = $files[i];
      $http.uploadFile({
        url: 'UploadServlet', //upload.php script, node.js route, or servlet uplaod url)
        file: $file
      }).then(function(response, status, headers, config) {
        // file is uploaded successfully
        if(response.data.status=="FAIL"){
          uploadError = true;
          $scope.uploadMessage=response.data.message;
        }
        else {
          uploadError = false;
          uploadedFiles = $file.name;
          //Use response.data.results to get the file location;
        }
  			uploading = false;
      }); 
    }
  };

  $scope.uploadedError =  function(){
    return uploadError;
  };

  $scope.isUploading =  function(){
    return uploading;
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
    if(type == 'file'){
      parameters ={
        rdfFiles: uploadedFiles, 
        endpoint: ConfigurationService.getSPARQLEndpoint(), 
        graph: $scope.importFile.graph.replace(':',ConfigurationService.getUriBase()), 
        uriBase : ConfigurationService.getUriBase(),
        username : currentAccount.getUsername()
      };
      
    }
    else if(type == 'url'){
      parameters ={
        rdfUrl: $scope.importUrl.inputUrl, 
        endpoint: ConfigurationService.getSPARQLEndpoint(), 
        graph: $scope.importUrl.graph.replace(':',ConfigurationService.getUriBase()), 
        uriBase : ConfigurationService.getUriBase(),
        username : currentAccount.getUsername()
      };

    }
    else if(type == 'query'){
      parameters ={
        rdfQuery: $scope.importSparql.sparqlQuery,
        rdfQueryEndpoint: $scope.importSparql.endPoint, 
        endpoint: currentAccount.getUsername()==null ? ConfigurationService.getPublicSPARQLEndpoint() : ConfigurationService.getSPARQLEndpoint(),
        graph: $scope.importSparql.graph.replace(':',ConfigurationService.getUriBase()), 
        uriBase : ConfigurationService.getUriBase(),
        username : currentAccount.getUsername()
      };
    }
    $http({
        url: 'ImportRDF', 
        method: "POST",
        params: parameters,
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      })
      .success(function (data, status, headers, config){
        if(data.status=="FAIL"){
          flash.error = data.message;
          importing = false;
        }
        else{
          flash.success = data.message;
          $scope.resetValues();
        }
      })
      .error(function(data, status, headers, config) {
          flash.error = data;
          $scope.resetValues();
      });
  };

  $scope.resetValues = function(){
    uploadError = false;
    uploadedFiles = null;
    importing = false;

    $scope.urlForm.$setPristine();
    $scope.fileForm.$setPristine();
    $scope.sparqlForm.$setPristine();

    $scope.fileForm.fileName.value = null;

    $scope.importFile = {file:"", graph:"?"};
    $scope.importUrl = {url:"", graph:"?"};
    $scope.importSparql = {endpoint:"", sparqlQuery:"", graph:"?"};
  };

  $scope.$watch( function () { return currentAccount.getUsername(); }, function () {
    $scope.refreshGraphList();
  });

};
