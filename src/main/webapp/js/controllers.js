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
	   //    {name: 'Geospatial Exploration', route:'#/home/querying-and-exploration/geospatial', url:'/home/querying-and-exploration/geospatial' },
	   //    {name: 'Google Maps', route:'#/home/querying-and-exploration/googlemap', url:'/home/querying-and-exploration/googlemap' },
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


app.controller('ModalWindow', function ($scope) {

  $scope.OpenFullWindow = function (id) {
    $("#" + id).modal({
    	height : $(window).height() - 165,
    	width : "100%",
        show: true
    });
  };

  $scope.OpenWindow = function (id) {
    $("#" + id).modal({
       show: true
    });
  }; 

  $scope.OpenTemplateWindow = function (template, id) {
    $("#" + id).modal({
       remote : template,
       show: true
    });
  };
  
  $scope.close = function (id) {
	  $("#" + id).modal('hide');
	  $('body').removeClass('modal-open');
	  $('.modal-backdrop').slideUp();
	  $('.modal-scrollable').slideUp();
  };

  // for the parent controller to be able to close the modal window
  $scope.$on('closeModal', function(event, args) {
  	$scope.close(args.id);
  })        
  
});

/*
var ModalWindow = function ($scope) {

  $scope.OpenFullWindow = function (id) {
    $("#" + id).modal({
    	height : $(window).height() - 165,
    	width : "100%",
        show: true
    });
  };

  $scope.OpenWindow = function (id) {
    $("#" + id).modal({
       show: true
    });
  }; 

  $scope.OpenTemplateWindow = function (template, id) {
    $("#" + id).modal({
       remote : template,
       show: true
    });
  };
  
  $scope.close = function (id) {
	  $("#" + id).modal('hide');
	  $('body').removeClass('modal-open');
	  $('.modal-backdrop').slideUp();
	  $('.modal-scrollable').slideUp();
  };

  // for the parent controller to be able to close the modal window
  $scope.$on('closeModal', function(event, args) {
  	close(args.id);
  });        
  
};*/

app.controller('FaceteFormCtrl', function($scope, ConfigurationService) {
	  //Settings for Facete
	  $scope.namedGraphs = ConfigurationService.getNamedGraphs();
	  
	  $scope.facete = { service : "http://10.0.0.75:8890/sparql",
	  					dataset :  $scope.namedGraphs[0].name
					  }
	  
				}).directive("ngPortlet", function ($compile) {
					return {
					    template: '<iframe  id="mod-frame" '+
					    	'src="http://[2001:638:902:2010:0:168:35:114]:8080/facete/?service-uri={{facete.service}}'+
					    	'&default-graph-uri={{facete.dataset}}"></iframe>',
					    	restrict: 'E',
					    link: function (scope, elm) {
					        scope.OpenFullWindow = function(){
					           elm.after($compile('<ng-portlet></ng-portlet>')(scope));
					        }
					    }
					};
				});

var LimesCtrl = function($scope, $http){
	
	$scope.examples = [
	                { name : "Duplicate Dbpedia country entries for the CET time zone" },
	                { name : "Geo Data" }
	];
	
	$scope.options = [{ 	output: [
			                { output : "N3" },
			                { output : "TAB" }]
							},
					  { 	execType: [
			                { execType : "SIMPLE" },
			                { execType : "FILTER" }]
						  },
				     ];
	
	$scope.limes = { OutputFormat :    $scope.options[0].output[0],
					 ExecType :        $scope.options[1].execType[0]
	}
	
	$scope.FillForm = function(example){
		
		var params = {};
		
		if(example === "Duplicate Dbpedia country entries for the CET time zone"){
			
		$scope.limes = { SourceServiceURI : "http://dbpedia.org/sparql",
						 TargetServiceURI  : "http://dbpedia.org/sparql",
						 SourceVar: "?x",
						 TargetVar: "?y",
						 SourceSize: "1000",
						 TargetSize: "1000",
						 SourceRestr: "?x dbpedia:timeZone dbresource:Central_European_Time. " +
						 		"?x dbpedia2:country ?z",
						 TargetRestr: "?y dbpedia:timeZone dbresource:Central_European_Time. " +
						 		"?y dbpedia2:country ?z",
						 SourceProp: "rdfs:label",
						 TargetProp: "rdfs:label",
						 Metric: "levenshtein(y.rdfs:label, x.rdfs:label)",
						 OutputFormat: $scope.options[0].output[0],
						 ExecType: $scope.options[1].execType[0],
						 AcceptThresh: "1",
						 ReviewThresh: "0.95",
						 AcceptRelation: "owl:sameAs",
						 ReviewRelation: "owl:sameAs" 
				};
		}
		
		if(example === "Geo Data"){
			
			$scope.limes = { SourceServiceURI : "http://linkedgeodata.org/sparql",
							 TargetServiceURI  : "http://linkedgeodata.org/sparql",
							 SourceVar: "?x",
							 TargetVar: "?y",
							 SourceSize: "2000",
							 TargetSize: "2000",
							 SourceRestr: "?x a lgdo:RelayBox",
							 TargetRestr: "?y a lgdo:RelayBox",
							 SourceProp: "geom:geometry/geos:asWKT RENAME polygon",
							 TargetProp: "geom:geometry/geos:asWKT RENAME polygon",
							 Metric: "hausdorff(x.polygon, y.polygon)",
							 OutputFormat: $scope.options[0].output[0],
							 ExecType: $scope.options[1].execType[0],
							 AcceptThresh: "0.9",
							 ReviewThresh: "0.5",
							 AcceptRelation: "lgdo:near",
							 ReviewRelation: "lgdo:near" 
					};
			}
		
	}
		
	$scope.StartLimes = function(){
		
		var params = { 
					 SourceServiceURI: $scope.limes.SourceServiceURI,
					 TargetServiceURI: $scope.limes.TargetServiceURI,
					 SourceVar: $scope.limes.SourceVar,
					 TargetVar: $scope.limes.TargetVar,
					 SourceSize: $scope.limes.SourceSize,
					 TargetSize: $scope.limes.TargetSize,
					 SourceRestr: $scope.limes.SourceRestr,
					 TargetRestr: $scope.limes.TargetRestr,
					 SourceProp: $scope.limes.SourceProp,
					 TargetProp: $scope.limes.TargetProp,
					 Metric: $scope.limes.Metric,
					 OutputFormat: $scope.limes.OutputFormat.output,
					 ExecType: $scope.limes.ExecType.execType,
					 AcceptThresh: $scope.limes.AcceptThresh,
					 ReviewThresh: $scope.limes.ReviewThresh,
					 AcceptRelation: $scope.limes.AcceptRelation,
					 ReviewRelation: $scope.limes.ReviewRelation
					 };
		
		$http({
			url: "http://localhost:8080/LimeServlet/LimesRun",
	        method: "POST",
	        params: params,
	        dataType: "json",
	        contentType: "application/json; charset=utf-8"
	      }).then(function() {
	    	$("#startLimes").toggle();
	  		$("#reviewLimes").toggle();
	      });
	}
	
	$scope.ReviewLimes = function(){
		$http({
			url: "http://localhost:8080/LimeServlet/LimesReview",
	        method: "POST",
	        dataType: "json",
	        contentType: "application/json; charset=utf-8"
	      });
	}
}

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

var ImportFormCtrl = function($scope, $http, ConfigurationService, flash) {

		  $scope.namedGraphs = ConfigurationService.getNamedGraphs();
		  $scope.uploadMessage = '';
		  
		  var uploadError = false;
		  var importing = false;
		  var uploadedFiles = null;
		
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
  $scope.namedGraphs = ConfigurationService.getNamedGraphs();
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
		    
  		$scope.queryElements = false;
    }
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
        endpoint: ConfigurationService.getEndpoint(), 
        graph: $scope.importFile.graph, 
        uriBase : ConfigurationService.getUriBase()
      };
      
    }
    else if(type == 'url'){
      parameters ={
        rdfUrl: $scope.importUrl.inputUrl, 
        endpoint: ConfigurationService.getEndpoint(), 
        graph: $scope.importUrl.graph, 
        uriBase : ConfigurationService.getUriBase() 
      };

    }
    else if(type == 'query'){
      parameters ={
        rdfQuery: $scope.importSparql.sparqlQuery,
        rdfQueryEndpoint: $scope.importSparql.endPoint, 
        endpoint: ConfigurationService.getEndpoint(), 
        graph: $scope.importSparql.graph, 
        uriBase : ConfigurationService.getUriBase() 
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
