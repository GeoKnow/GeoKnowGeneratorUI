'use strict';

function SettingsMenuCtrl($scope) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
  	{ name: "Data Sources", route:'#/settings/data-sources', url:'/settings/data-sources' },
  	{ name: "Datasets", route:'#/settings/datasets', url:'/settings/datasets' },
    { name: "Namespaces", route:'#/settings/namespaces', url:'/settings/namespaces' },
  	{ name: "Components", route:'#/settings/components', url:'/settings/components' },
    { name: "User Preferences",   route:'#/settings/preferences', url:'/settings/preferences' }];
}

function StackMenuCtrl($scope) {
	  $scope.oneAtATime = true;
	  // these data can be replaced later with the configuration
	  $scope.groups = [
	    {
	      title: "Extraction and Loading",
	      id:"extraction-loading",
	      items: [
	        {name: 'Import RDF data', route:'#/home/extraction-and-loading/import-rdf',  url:'/home/extraction-and-loading/import-rdf' },
	        {name: 'Extract with Sparqlify', route:'#/home/extraction-and-loading/sparqlify',  url:'/home/extraction-and-loading/sparqlify' }]
	    },
	    {
	      title: "Querying and Exploration",
	      id:"querying-exploration",
	      items: [
	       {name: 'Geospatial Exploration', route:'#/home/querying-and-exploration/geospatial', url:'/home/querying-and-exploration/geospatial' },
	       {name: 'Google Maps', route:'#/home/querying-and-exploration/googlemap', url:'/home/querying-and-exploration/googlemap' },
	       {name: 'Facete', route:'#/home/querying-and-exploration/facete', url:'/home/querying-and-exploration/facete' }]
	    },
	    {
	      title: "Authoring",
	      id:"authoring",
	      items: [
	       {name: 'OntoWiki', route:'#/home/authoring/ontowiki', url:'/home/authoring/ontowiki' }]
	    },
	    {
	      title: "Linking",
	      id:"linking",
	      items: [
	       {name: 'LIMES', route:'#/home/linking/limes', url:'/home/linking/limes' }]
	    },
	    {
	     title: "Enriching and Data Cleaning",
	     id:"enriching-cleansing",
	     items: [
	       {name: 'GeoLift', route:'#/home/enriching-and-cleaning/geolift', url:'/home/enriching-and-cleaning/geolift' }]
	    }

	  ];

	}


function LoginCtrl() {}
LoginCtrl.$inject = [];


var ModalWindow = function ($scope) {

  $scope.OpenFullWindow = function () {
    $("#modalWindow").modal({
    	height : $(window).height() - 165,
    	width : "100%",
        show: true
    });
  };

  $scope.OpenWindow = function () {
    $("#modalWindow").modal({
       show: true
    });
  }; 

  $scope.OpenTemplateWindow = function (template) {
    $("#modalWindow").modal({
       remote : template,
       show: true
    });
  };
  
  $scope.close = function () {
	  $("#modalWindow").modal('hide');
	  $('body').removeClass('modal-open');
	  $('.modal-backdrop').slideUp();
	  $('.modal-scrollable').slideUp();
  };
  
};

app.controller('FaceteFormCtrl', function($scope, ConfiurationService) {
	//Settings for Facete
	  $scope.namedGraphs = ConfiurationService.getNamedGraphs().namedgraphs;
	  $scope.service = 'http://localhost:8890/sparql';
	  $scope.dataset = $scope.namedGraphs[0].name;
	  
});
	
app.controller('NavbarCtrl', function($scope, $location) {
		//if($location.path === "/"){
		//	$location.path('/home')
		//}
		$scope.getClass = function(path) {
			if ($location.path().substr(0, path.length) === path) {
			      return "active"
			    } else {
			      return ""
			    }
			}
	});

app.controller('SidebarCtrl', function($scope, $location) {
	    $scope.isSelected = function(route) {
	        return route === $location.path();
	    }
});

app.controller('OpenMap', function OpenMap($scope, $timeout, $log){

  var map = new OpenLayers.Map( 'map', {controls:[
         new OpenLayers.Control.Navigation(),
         new OpenLayers.Control.PanZoomBar(),
         //new OpenLayers.Control.LayerSwitcher(),
         new OpenLayers.Control.Attribution()],
         units: 'm',
     });
  var layer = new OpenLayers.Layer.OSM( "Biel/Bienne Map");
  map.addLayer(layer);
  map.setCenter(
      new OpenLayers.LonLat(7.25 , 47.133333).transform(
          new OpenLayers.Projection("EPSG:4326"),
          map.getProjectionObject()
      ), 13 
  );
});

var OpenMapWindow = function ($scope, $timeout, $log) {
	
	var map = new OpenLayers.Map( 'map', {controls:[
         new OpenLayers.Control.Navigation(),
         new OpenLayers.Control.PanZoomBar(),
         //new OpenLayers.Control.LayerSwitcher(),
         new OpenLayers.Control.Attribution()],
         units: 'm',
     });
  var layer = new OpenLayers.Layer.OSM( "Biel/Bienne Map");
  map.addLayer(layer);
  map.setCenter(
      new OpenLayers.LonLat(7.25 , 47.133333).transform(
          new OpenLayers.Projection("EPSG:4326"),
          map.getProjectionObject()
      ), 13 
  );
};
	
var GoogleMapWindow = function ($scope, $timeout, $log) {
	var map;

  var mapOptions = {
    zoom: 14,
    center: new google.maps.LatLng(47.126776, 7.24),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  
  map = new google.maps.Map(document.getElementById('map'),
      mapOptions);

};

var ImportFormCtrl = function($scope, $http, ConfiurationService, flash) {

  $scope.namedGraphs = ConfiurationService.getNamedGraphs();
  $scope.uploadMessage = '';
  
  var uploadError = false;
  var importing = false;
  var uploadedFiles = null;
  $scope.importSparql = { sparqlQuery : "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o } LIMIT 10"};

  $scope.sourceTypes = [
    {value:'file', label:'File'},
    {value:'url', label:'URL'},
    {value:'query', label:'SPARQL Query'}
  ];
  var type = '';

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
  $scope.fileElements = false;
  $scope.urlElements = false;
  $scope.queryElements = false;
  
  $scope.onFileSelect = function($files) {
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
      }); 
    }
  };

  $scope.uploadedError =  function(){
    return uploadError;
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
        endpoint: ConfiurationService.getEndpoint(), 
        graph: $scope.importFile.graph, 
        uriBase : ConfiurationService.getUriBase()
      };
      
    }
    else if(type == 'url'){
      parameters ={
        rdfUrl: $scope.importUrl.inputUrl, 
        endpoint: ConfiurationService.getEndpoint(), 
        graph: $scope.importUrl.graph, 
        uriBase : ConfiurationService.getUriBase() 
      };

    }
    else if(type == 'query'){
      parameters ={
        rdfQuery: $scope.importSparql.sparqlQuery,
        rdfQueryEndpoint: $scope.importSparql.endPoint, 
        endpoint: ConfiurationService.getEndpoint(), 
        graph: $scope.importSparql.graph, 
        uriBase : ConfiurationService.getUriBase() 
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

    $scope.importFile = {file:"", graph:"?"};
    $scope.importUrl = {url:"", graph:"?"};
    $scope.importSparql = {endpoint:"", sparqlQuery:"", graph:"?"};
  }
};


var DataSourceTabCtrl = function($scope, $window, $location) {

  // The tab directive will use this data
  $scope.tabs = ['SPARQL Endpoint', 'Relational Database'];
  $scope.tabs.index = 0;
  $scope.tabs.active = function() { 
    return $scope.tabs[$scope.tabs.index]; 
    }
  
};

var OpenModalCtrl = function($scope, $modal) {

  $scope.viaService = function() {
    // do something	
    var modal = $modal({
      template: "=bsModal",
      show: true,
      backdrop: 'static',
      scope: $scope
    });
  }
  $scope.parentController = function(dismiss) {
    console.warn(arguments);
    // do something
    dismiss();
  }
};

var LimesCtrl = function($scope){
	function StartLimes($scope){
	var params = {
			 SourceServiceURI: $scope.SourceServiceURI,
			 TargetServiceURI: $scope.TargetServiceURI
	}
	console.log(params);
	};
}
