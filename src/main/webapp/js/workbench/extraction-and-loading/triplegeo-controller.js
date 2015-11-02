'use strict';

/****************************************************************************************************
*
* TRIPLEGEO Controller
*
***************************************************************************************************/

var TripleGeoCtrl = function($scope, $http, $q, ConfigurationService, ComponentsService, flash, ServerErrorResponse, AccountService, GraphService, Ns, $modal, JobService, AuthSessionService, Upload, $timeout){
	
	var componentId ="TripleGeo";
	var serviceId = "TripleGeoService";
	var workbenchHP="";

	ComponentsService.getComponent(componentId).then(
		//success
		function(response){
			$scope.component = response;
			$scope.service = ComponentsService.getComponentService(serviceId, $scope.component);
			if($scope.service== null)
				flash.error="Service not configured: " +serviceId;	
			workbenchHP = ConfigurationService.getFrameworkHomepage();
			if (workbenchHP.substr(-1) != '/') 
				workbenchHP += '/';
		}, 
		function(response){
			flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
		});

	
	$scope.inputForm = true;
	$scope.dbLogin = true;
	$scope.actionButtons = false;	
	
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.namedGraphs = [];
    GraphService.getAccessibleGraphs(true, false, true).then(function(graphs) {
	    $scope.namedGraphs = graphs;
    });
	$scope.databases = ConfigurationService.getAllDatabases();

	$scope.example = "";
	$scope.datasource="";

	var uploadError = false;
	var uploadedFiles = null;
	var inputFileName = null;
	var uploading = false;
	var fileType = null;
	var params = {};
	$scope.tripleGeoConfig = null;

	$('i').tooltip();
	
	$scope.tooltips = { files: "For ESRI shapes upload 3 files the .shp, .shx, and .dbf" +
								"you wish to upload and process. Only these 3 files are necessary.",
						data: "Change parameters to reflect the shapefile contents that will be extracted - case sensitive!",
						ns: "Optional parameters. Change these parameters if you want to use different"+
							" values for the namespaces and prefixes nsPrefix=georesource",
						spatial: "Optional parameters. These fields should be filled in if a transformation between EPSG reference systems is needed. "+
								 "If not specified, geometries are assumed to be WGS84 reference system (EPSG:4326).",
						other: "Optional parameter. Default languages for the labels created in the output RDF. By default, the value is English - en."
	};
	
	$scope.options = {
	    database: false,
	    file: false,
	    configExample: null,
	    dataParams: false,
	    dbParams: false,
	    job: null,
	    inputFile: null,
	    format: [
	        "RDF/XML",
	        "RDF/XML-ABBREV",
	        "N-TRIPLES",
	        "TURTLE",
	        "N3"
	    ],
	    targetStore: [
	        "GeoSPARQL",
	        "Virtuoso",
	        "wgs84_pos"
	    ],
	    datasource: [
	        "ESRI shape File",
	        "GML File",
	        "KML File",
	        "Database"
	    ],
	    esriExamples: [
	        "POIs example"
	    ],
	    gmlExamples: [
	        "Airports example"
	    ],
	    kmlExamples: [
	        "Kml sample"
	    ],
	    dbExamples: [
	        "Wikimapia Extraction"
	    ],
	    dbtype: [
	        "MySQL",
	        "Oracle",
	        "PostGIS",
	        "DB2"
	    ],
	    ex: [
	        ""
	    ],
	    esriFeature : [
					"points",
					"polyline",
					"polygon",
					"multipoint",
					"pointz",
					"polylinez",
					"polygonz",
					"multipointz",
					"pointm",
					"polylinem",
					"polygonm",
					"multipointm",
					"multipatch"
	    ]
	};
	
	$scope.updateExamples = function(){
		
		$scope.example = "";
		$scope.tripleGeoConfig = null;
		
		$scope.files=null;
		$scope.options.dataParams = false;
		$scope.options.dbParams = false;
		$scope.actionButtons = false;

		if($scope.datasource == "ESRI shape File"){
			$scope.options.configExample = $scope.options.esriExamples;
			$scope.options.dataParams = true;
			$scope.options.job = "esri";
		}
		if($scope.datasource == "GML File"){
			$scope.options.configExample = $scope.options.gmlExamples;
			$scope.options.job = "gml";
		}
		if($scope.datasource == "KML File"){
			$scope.options.configExample = $scope.options.kmlExamples;
			$scope.options.job = "kml";
		}
		if($scope.datasource == "Database"){
			$scope.options.configExample = $scope.options.dbExamples;
			$scope.options.dbParams = true;
			$scope.options.job = "db";
			$scope.tripleGeoConfig = {
					format : $scope.options.format[0],
					targetStore : $scope.options.targetStore[0],
					dbtype: $scope.options.dbtype[0],
								
			};
		}
	};
	
	$scope.isFileJob = function(){
		return ($scope.datasource!='' &&  $scope.datasource!='Database' )
	};

	$scope.commonParams =function(){
		if($scope.options.job==null) return false;
		return (($scope.options.job.indexOf("esri") === 0) || ($scope.options.job.indexOf("db") === 0));
	}

	$scope.FillForm = function(){
		
		var params = {};
		$scope.options.dataParams = false;
		$scope.options.dbParams = false;
		$scope.actionButtons=false;

		if($scope.example==null){
		 $scope.example = "";
		 $scope.tripleGeoConfig = null;
		 return;
		}
		
		if($scope.example === "POIs example"){
			$scope.options.dataParams = true;
			$scope.tripleGeoConfig = {
					job : "esri-example",
					inputFile :   "points.shp",
					inputFileName :  "points.shp",
					format :      $scope.options.format[0],
					targetStore : $scope.options.targetStore[0],
				
					featureString: "points",
					attribute: "osm_id",
					ignore: "UNK",
					type: "points",
					name: "name",
					uclass: "type",
				 
				 nsPrefix: "gkg",
					nsURI: ConfigurationService.getUriBase(), 
					
					ontologyNSPrefix: "geo",
					ontologyNS: "http://www.opengis.net/ont/geosparql#"
			};
		}
		else if($scope.example === "Airports example"){
			$scope.tripleGeoConfig = {
				job : "gml-example",
				inputFile :   "airports.gml",
				inputFileName :  "airports.gml"
			}
		}
		else if($scope.example === "Kml sample"){
			$scope.tripleGeoConfig = {
					job : "kml-example",
					inputFile :   "sample.kml",
					inputFileName:   "sample.kml"
				}
		}
		else if($scope.example === "Wikimapia Extraction"){
			$scope.options.dbParams = true;
			$scope.tripleGeoConfig = {
					
					job : "db-example",

					format :      $scope.options.format[2],
					targetStore : $scope.options.targetStore[0],
					 
					 
					dbtype: $scope.options.dbtype[2],
					 dbName: "wikimapia",
					 dbUserName: "gisuser",
					 dbPassword: "admin",
					 dbHost: "localhost",
					 dbPort: "5432",
					 resourceName: "points",
					 tableName: "venue_london_buildings",
					 condition: "",
					 labelColumnName: "id",
					 nameColumnName: "name",
					 classColumnName: "type",
					 geometryColumnName: "point",
					 ignore: "",
					 
					 nsPrefix: "gkg",
					nsURI: ConfigurationService.getUriBase(), 

					 ontologyNSPrefix: "geo",
					 ontologyNS: "http://www.opengis.net/ont/geosparql#",
						 
					 sourceRS: "EPSG:4326",
					 targetRS: "EPSG:4326"
			};
		}
		$scope.actionButtons = true;	
	}

	$scope.setDatabase = function(id){
		console.log(id);
		if(id === "GeospatialDB"){
			for(var i=0; i<$scope.databases.length; i++){
				if($scope.databases[i].label === name){
				
					$scope.tripleGeoConfig = {
							job : "db",
							 inputDisplay: $scope.databases[i].dbName,
							 
							 format :      $scope.options.format[2],
							 targetStore : $scope.options.targetStore[0],
							 
							 dbtype: $scope.databases[i].dbType,
							 dbName: $scope.databases[i].dbName,
							 dbUserName: $scope.databases[i].dbUser,
							 dbPassword: $scope.databases[i].dbPassword,
							 dbHost: $scope.databases[i].dbHost,
							 dbPort: $scope.databases[i].dbPort,
							 resourceName: "",
							 tableName: "",
							 condition: "",
							 labelColumnName: "",
							 nameColumnName: "",
							 classColumnName: "",
							 geometryColumnName: "",
							 ignore: "",

							nsPrefix: "gkg",
							nsURI: ConfigurationService.getUriBase(), 
							 
							 ontologyNSPrefix: "geo",
							 ontologyNS: "http://www.opengis.net/ont/geosparql#"
					};
				}
			}
		}
			
	};

	$scope.isUploading = function(){
		return uploading;
	}
	

	$scope.uploadFiles = function(files, errFiles) {
    
    $scope.errFiles = errFiles;
    $scope.errorMsg = "";
    uploading=true;

    var promises = [];

    console.log(errFiles);

    angular.forEach(files, function(file) {
    	
			 var deferred = $q.defer();
    		file.upload = Upload.upload({
            url:  $scope.service.serviceUrl +'/upload',
            data: {file: file}
        });

        file.upload.then(function (response) {
            $timeout(function () {
            	var uploaded = new Array();
            	uploaded[file.name] = response.data[0] ;
            	deferred.resolve(uploaded);
            });
        }, function (response) {
            if (response.status > 0)
                $scope.errorMsg = response.status + ': ' + response.data;
        }, function (evt) {
            file.progress = Math.min(100, parseInt(100.0 * 
                                     evt.loaded / evt.total));
        });

        promises.push(deferred.promise);
   		}); // foreach
 
 		$q.all(promises).then(
 			// results: an array of data objects from each deferred.resolve(data) call
 			
        function(results) {

        	console.log(results);
        	
        	var normalized = new Array();
        	for(var i in results){
        		var r = results[i];
        		for(var k in r)
        			normalized[k] =r[k];
        		
        	}
        	console.log(files);
        	console.log(normalized);
          validateFiles(files, normalized);
          uploading=false;
        },
        // error
        function(response) {

        	uploading=false;
        }
    );
	}
  
	var validateFiles = function(files, responseMap){
    if(files==null) return;
    var fileName = "";

		$scope.files=files;
		// validate esri
    if ($scope.options.job === "esri"){
    	var exts=["shp", "shx" , "dbf"];
    	
     	if (files.length != 3){
    		$scope.errorMsg = "You chose either too few or too many files. Please select the .shp, .shx and .dbf " +
				"shape files (1 of each) which you wish to convert. The files must share the same base name.";
				files = [];
				$scope.files=null;
				return;
			}
			else{
		 	// validate extensions	
		 		var prefix="";
		 		angular.forEach(files, function(file) {
		 			var name =file.name.substring(0,file.name.length-4).toLowerCase();
		 			var ext =file.name.substring(file.name.length-3,file.name.length).toLowerCase();
		 			
		 			if(prefix === "") prefix = name;
		 			if(prefix!=name){
		 				$scope.errorMsg = "The files must share the same base name.";
		 				files = [];
		 				$scope.files=null;
		 				return;
		 			} 
		 			var index = $.inArray(ext, exts);
		 			if(index == -1 ){
		 				$scope.errorMsg = "Please select the .shp, .shx and .dbf,  not valid: ." + ext;
		 				files = [];
		 				$scope.files=null;
		 				return;
		 			}
		 			
		 			if(ext === "shp"){
		 				fileName = file.name;
		 			}
		 		});
		 		console.log(fileName);


		 		$scope.tripleGeoConfig = {
		 				job :"esri",
		 				inputFileName :  fileName,
						inputFile :    responseMap[fileName],
						format :      $scope.options.format[0],
						targetStore : $scope.options.targetStore[0],
					
						featureString: fileName.substring(0,fileName.length-4).toLowerCase(),
						attribute: "name",
						ignore: "UNK",
						type: "",
						name: "id",
						uclass: "type",

					nsPrefix: "gkg",
					nsURI: ConfigurationService.getUriBase(), 

						ontologyNSPrefix: "geo",
						ontologyNS: "http://www.opengis.net/ont/geosparql#"
				};
				$scope.options.dataParams = true;
		 	}
		}
		else{

			if (files.length != 1){
				$scope.errorMsg = "Please select only one file";
			 	files = [];
			 	$scope.files=null;
				return;
			}
			if ($scope.options.job === "gml"){
				var file = files[0];
				if(file.name.substring(file.name.length-3,file.name.length).toLowerCase() != "gml"){
					$scope.errorMsg = "Please select the .gml ";
			 		files = [];
			 		$scope.files=null;
			 		return;
				}
			}
			else if ($scope.options.job === "kml"){
				var file = files[0];
				if(file.name.substring(file.name.length-3,file.name.length).toLowerCase() != "kml"){
					$scope.errorMsg = "Please select the .kml ";
			 		files = [];
			 		$scope.files=null;
			 		return;
				}
			}

			$scope.tripleGeoConfig = {
				job : $scope.options.job,
				inputFileName :  $scope.files[0].name,
				inputFile :    responseMap[fileName]
			}
		}
		
		$scope.actionButtons=true;
		
   };

	
	var validate = function(param, defval){
		if (typeof param === "undefined")
			return defval;
		else
			return param;
	}
	

	$scope.CreateJob = function(){
			
		console.log($scope.options.job);
		if($scope.options.job == "esri"){
			params = {
					 job: $scope.tripleGeoConfig.job,
					
					 format: $scope.tripleGeoConfig.format,
					 targetStore: $scope.tripleGeoConfig.targetStore,
					 inputFile : $scope.tripleGeoConfig.inputFile,
					 
					 featureString: $scope.tripleGeoConfig.featureString,
					 attribute: $scope.tripleGeoConfig.attribute,
					 ignore: $scope.tripleGeoConfig.ignore,
					 type: $scope.tripleGeoConfig.type,
					 name: $scope.tripleGeoConfig.name,
					 uclass: $scope.tripleGeoConfig.uclass,
					 
					nsPrefix: "gkg",
						nsURI: ConfigurationService.getUriBase(), 

					 ontologyNSPrefix: $scope.tripleGeoConfig.ontologyNSPrefix,
					 ontologyNS: $scope.tripleGeoConfig.ontologyNS,
					 
					 sourceRS: validate($scope.tripleGeoConfig.sourceRS,""),
					 targetRS: validate($scope.tripleGeoConfig.targetRS,""),
					 
					 defaultLang: validate($scope.tripleGeoConfig.defaultLang, "en"),
				   };
		}
		if($scope.options.job == "gml"){
			params = {
				job: $scope.tripleGeoConfig.job,
				inputFile : $scope.tripleGeoConfig.inputFile,
			}
		}
		if($scope.options.job == "kml"){
			params = {
				job: $scope.tripleGeoConfig.job,
				inputFile : $scope.tripleGeoConfig.inputFile,
			}
		}
		else if($scope.options.job == "db"){
			params = {
					 job: $scope.options.job,
					
					 format: $scope.tripleGeoConfig.format,
					 targetStore: $scope.tripleGeoConfig.targetStore,
					 
					 dbType: ($('#dbtype').prop("selectedIndex")+1),
					 dbName: $scope.tripleGeoConfig.dbName,
					 dbUserName: $scope.tripleGeoConfig.dbUserName,
					 dbPassword: $scope.tripleGeoConfig.dbPassword,
					 dbHost: $scope.tripleGeoConfig.dbHost,
					 dbPort: $scope.tripleGeoConfig.dbPort,
					 resourceName: $scope.tripleGeoConfig.resourceName,
					 tableName: $scope.tripleGeoConfig.tableName,
					 condition: $scope.tripleGeoConfig.condition,
					 labelColumnName: $scope.tripleGeoConfig.labelColumnName,
					 nameColumnName: $scope.tripleGeoConfig.nameColumnName,
					 classColumnName: $scope.tripleGeoConfig.classColumnName,
					 geometryColumnName: $scope.tripleGeoConfig.geometryColumnName,
					 ignore: $scope.tripleGeoConfig.ignore,
					 
				nsPrefix: "gkg",
				nsURI: ConfigurationService.getUriBase(), 

					 ontologyNSPrefix: $scope.tripleGeoConfig.ontologyNSPrefix,
					 ontologyNS: $scope.tripleGeoConfig.ontologyNS,
					 
					 sourceRS: $scope.tripleGeoConfig.sourceRS,
					 targetRS: $scope.tripleGeoConfig.targetRS,
					 
					 defaultLang: $scope.tripleGeoConfig.defaultLang,
				   };
		}
		
    var now = new Date();

		// ask the user for a job name and description
    var modalInstance = $modal.open({
    	templateUrl: 'modal-forms/workbench/modal-job.html',
    	controller: 'ModalJobCtrl',
    	size: 'lg',
    	resolve : {
    		modalConfiguration  : function(){
    			var p = {
    				title: "Triple-Geo Job",
    				service: "tripleGeo"
    			};
    			return p;
    		} 
    	}
    });

    // reads user's answer
    modalInstance.result.then(function (jobDesc) {
    	console.log(jobDesc);

    	AuthSessionService.createSession().then(function(response){

      	var atuhEndpoint = workbenchHP + response.data.endpoint;
				params["targetEndpoint"] = atuhEndpoint;      	
				params["targetGraph"] = jobDesc.namedgraph;  

      	console.log(params);

      	var contributionUpdateBody = {
		      	namedGraph   : Ns.lengthen(jobDesc.namedgraph),
    				source       : [jobDesc.description +" (job - " + jobDesc.name + ")"],
    				contributor  : componentId
		      };
				
				var steps = '['
						+ '{"service":"'+ $scope.service.serviceUrl +'","contenttype":"application/json", "method":"POST", "body":"'+encodeURI(JSON.stringify(params))+'", "numberOfOrder":1},'
						+ '{"service":"'+ atuhEndpoint + '","contenttype":"application/json", "method":"PUT", "body":"'+encodeURI(JSON.stringify(contributionUpdateBody))+'", "numberOfOrder":2}'
            +']';
				
        console.log(steps);
				JobService.addMultiServiceJob(
							jobDesc.name, 
							jobDesc.label, 
							jobDesc.description, 
							eval(steps), 
							Ns.lengthen(jobDesc.namedgraph))
					.then(function(response){
						$scope.$parent.updateJobs();
						flash.success = "Job successfully added can be executed from the dashboard";
					}, function(response){
						flash.error = ServerErrorResponse.getMessage(response);
				});

			});

    });

	};
	

	
};

