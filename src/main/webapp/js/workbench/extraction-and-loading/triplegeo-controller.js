'use strict';

/****************************************************************************************************
*
* TRIPLEGEO Controller
*
***************************************************************************************************/

var TripleGeoCtrl = function($scope, $http, ConfigurationService, ComponentsService, flash, ServerErrorResponse, $window, AccountService, GraphService){
	
	var componentId ="TripleGeo";
	var serviceId = "TripleGeoService";

	ComponentsService.getComponent(componentId).then(
		//success
		function(response){
			$scope.component = response;
			$scope.service = ComponentsService.getComponentService(serviceId, $scope.component);
			if($scope.service== null)
				flash.error="Service not configured: " +serviceId;	
		}, 
		function(response){
			flash.error="Component not configured: " +ServerErrorResponse.getMessage(response);
		});

	var configArray = new Array();
	var dbConfigArray = new Array();

	$scope.inputForm = true;
	$scope.configOptions = true;
	$scope.dbLogin = true;
	$scope.configForm = false;	
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.namedGraphs = [];
    GraphService.getAccessibleGraphs(true, false, true).then(function(graphs) {
	    $scope.namedGraphs = graphs;
    });
	$scope.databases = ConfigurationService.getAllDatabases();

	var uploadError = false;
	var uploadedFiles = null;
	var inputFileName = null;
	var importing = false;
	var fileType = null;
	var params = {};
	$('i').tooltip();
	
	configArray[0]  = ['format', ''];
	configArray[1]  = ['targetStore', ''];
	configArray[2]  = ['featureString', ''];
	configArray[3]  = ['attribute', ''];
	configArray[4]  = ['ignore', ''];
	configArray[5]  = ['type', ''];
	configArray[6]  = ['name', ''];
	configArray[7]  = ['class', ''];
	configArray[8]  = ['nsPrefix', ''];
	configArray[9]  = ['nsURI', ''];
	configArray[10] = ['ontologyNSPrefix', ''];
	configArray[11] = ['ontologyNS', ''];
	configArray[12] = ['sourceRS', ''];
	configArray[13] = ['targetRS', ''];
	configArray[14] = ['defaultLang', ''];
	
	dbConfigArray[0]  = ['format', ''];
	dbConfigArray[1]  = ['targetStore', ''];
	dbConfigArray[2] = ['dbType', ''];
	dbConfigArray[3] = ['dbName', ''];
	dbConfigArray[4] = ['dbUserName', ''];
	dbConfigArray[5] = ['dbPassword', ''];
	dbConfigArray[6] = ['dbHost', ''];
	dbConfigArray[7] = ['dbPort', ''];
	dbConfigArray[8] = ['resourceName', ''];
	dbConfigArray[9] = ['tableName', ''];
	dbConfigArray[10] = ['condition', ''];
	dbConfigArray[11] = ['labelColumnName', ''];
	dbConfigArray[12] = ['nameColumnName', ''];
	dbConfigArray[13] = ['classColumnName', ''];
	dbConfigArray[14] = ['geometryColumnName', ''];
	dbConfigArray[15] = ['ignore', ''];
	dbConfigArray[16] = ['nsPrefix', ''];
	dbConfigArray[17] = ['nsURI', ''];
	dbConfigArray[18] = ['ontologyNSPrefix', ''];
	dbConfigArray[19] = ['ontologyNS', ''];
	dbConfigArray[20] = ['sourceRS', ''];
	dbConfigArray[21] = ['targetRS', ''];
	dbConfigArray[22] = ['defaultLang', ''];
	
	$scope.tooltips = { files: "When the file upload dialog opens, select the .shp, .shx, and .dbf files " +
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
							fileExample: false,
							dbExample: false,
							dataParams: false,
							dbParams: false,
							job: null,
							inputFile: null,
							displayConfigUpload: false,
							format: [
	  		     			                "RDF/XML" ,
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
		     			                 	"Shape File",
											"Database"
				     			                ],
				     	    fileExamples: [
											"Points shape file extraction"
											],
							dbExamples: [
							             	"Wikimapia Extraction",
						  		     		"GeospatialDB"
						  		     		],
						    dbtype: [
				     		         "MySQL",
				     		         "Oracle",
				     		         "PostGIS",
				     		         "DB2"
				     		         ],
				     	    ex: [
				     	         ""
				     	         ]
								};
	
	$scope.choice = function($name){
		
		$scope.configForm = false;
		$scope.stTripleGeo = true;
		
		if($name == "Shape File"){
			$scope.options.file = true;
			$scope.options.database = false;
			$scope.options.dbExample = false;
			$scope.options.fileExample = true;
			$scope.options.dataParams = true;
			$scope.options.dbParams = false;
			$scope.options.job = "file";
		}
		if($name == "Database"){
			$scope.options.file = false;
			$scope.options.database = true;
			$scope.options.fileExample = false;
			$scope.options.dbExample = true;
			$scope.options.dbParams = true;
			$scope.options.dataParams = false;
			$scope.configForm = true;
			$scope.options.job = "db";
			$scope.tripleGeoConfig = {
								format : $scope.options.format[0],
								targetStore : $scope.options.targetStore[0],
								dbtype: $scope.options.dbtype[0],
								
			};
		}
	};
	
	$scope.FillForm = function(example, name){
		
			var params = {};
			//console.log(example + ' ' + name);
			
			if(example === "fileExample" && name === "Points shape file extraction"){
				
				$scope.options.dataParams = true;
				$scope.options.dbParams = false;
				$scope.options.job = "example";
				$scope.options.displayConfigUpload = false;
				$scope.options.file = false;
				$scope.options.inputDisplay = true;
		
				$scope.tripleGeoConfig = {
						
						inputDisplay: "points.shp",
						
						 inputFile :   "points.shp",
						 format :      $scope.options.format[0],
						 targetStore : $scope.options.targetStore[0],
						
						 featureString: "points",
						 attribute: "osm_id",
						 ignore: "UNK",
						 type: "points",
						 name: "name",
						 dclass: "type",
						 
						 nsPrefix: "georesource",
						 nsURI: "http://geoknow.eu/geodata#",
						 ontologyNSPrefix: "geo",
						 ontologyNS: "http://www.opengis.net/ont/geosparql#"
						};
			}
			
			if(example === "database"){
				for(var i=0; i<$scope.databases.length; i++){
					if($scope.databases[i].label === name){
						$scope.options.dataParams = false;
						$scope.options.dbParams = true;
						$scope.options.job = "db";
						$scope.options.dbExample = false;
						$scope.options.inputDisplay = true;
						$scope.options.displayConfigUpload = true;
					
						$scope.tripleGeoConfig = {
								
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
								 
								 nsPrefix: "georesource",
								 nsURI: "http://geoknow.eu/geodata#",
								 ontologyNSPrefix: "geo",
								 ontologyNS: "http://www.opengis.net/ont/geosparql#"
						};
					}
				}
			}
			
			if(example === "dbExample"  && name === "Wikimapia Extraction"){
				
						$scope.options.database = false;
						$scope.options.dataParams = false;
						$scope.options.dbParams = true;
						$scope.options.job = "db";
						$scope.options.dbExample = false;
						$scope.options.inputDisplay = false;
						$scope.options.displayConfigUpload = false;
					
						$scope.tripleGeoConfig = {
								
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
								 
								 nsPrefix: "georesource",
								 nsURI: "http://geoknow.eu/geodata#",
								 ontologyNSPrefix: "geo",
								 ontologyNS: "http://www.opengis.net/ont/geosparql#",
									 
								 sourceRS: "EPSG:4326",
								 targetRS: "EPSG:4326"
						};

			}
			
	};
	
	$scope.loadShapeFile = function($files){
		if($files.length!=3){
			alert("You chose either too few or too many files. Please select the .shp, .shx and .dbf " +
					"shape files (1 of each) which you wish to convert. The files must share the same base name.");
		}else{
			$scope.options.fileExample = false;
			$scope.options.displayConfigUpload = true;
			inputFileName = $files[0].name;
			inputFileName = inputFileName.split(".");
			console.log(inputFileName[0]);
			inputFileName = inputFileName[0]+".shp";
			$('#dummyShapeInput').val(inputFileName);
			$scope.configForm = true;
			}
		};

	$scope.loadConfigFile = function($files){
		
		for (var i = 0; i < $files.length; i++) {
		  var $file = $files[i];
		  $http.uploadFile({
		        url: 'UploadServlet', //upload.php script, node.js route, or servlet uplaod url)
		        file: $file
		      }).then(function(response, status, headers, config) {
		        // file is uploaded successfully
		    	  
		    	  var filename = $files[0].name;
		    	  $('#dummyConfigInput').val(filename);
		  		
					$http({
							method: "POST",
							url: $scope.service.serviceUrl+"/LoadFile",
							params: {
									file : filename,
									shp: inputFileName
									}
				      	}).then(function(data) {
				      		if($scope.options.file == true){
				      			for(var i=0; i<configArray.length; i++){
					      			for(var j=0; j<data.data.length; j++){
					      				if(configArray[i][0] === data.data[j][0]){
					      					configArray[i][1] = data.data[j][1];
					      				}
					      			}
				      			}
				      			
						    	$scope.tripleGeoConfig = {
										 inputFile :   data.data[0][0],
										 format:      configArray[0][1],
										 targetStore: configArray[1][1],
										
										 featureString: configArray[2][1],
										 attribute: configArray[3][1],
										 ignore: configArray[4][1],
										 type: configArray[5][1],
										 name: configArray[6][1],
										 dclass: configArray[7][1],
										 
										 nsPrefix: configArray[8][1],
										 nsURI: configArray[9][1],
										 ontologyNSPrefix: configArray[10][1],
										 ontologyNS: configArray[11][1],
										 
										 sourceRS: configArray[12][1],
										 targetRS: configArray[13][1],
											 
										 defaultLang: configArray[14][1],
										};
				      		}
				      		
				      		if($scope.options.database == true){
				      			
				      			for(var i=0; i<dbConfigArray.length; i++){
					      			for(var j=0; j<data.data.length; j++){
					      				if(dbConfigArray[i][0] === data.data[j][0]){
					      					dbConfigArray[i][1] = data.data[j][1];
					      				}
					      			}
				      			}
				      			
				      			var inputDisplay = $scope.tripleGeoConfig.inputDisplay;
								
					      		dbConfigArray[2][1] = $scope.tripleGeoConfig.dbtype;
								dbConfigArray[3][1] = $scope.tripleGeoConfig.dbName;
								dbConfigArray[4][1] = $scope.tripleGeoConfig.dbUserName;
								dbConfigArray[5][1] = $scope.tripleGeoConfig.dbPassword;
								dbConfigArray[6][1] = $scope.tripleGeoConfig.dbHost;
								dbConfigArray[7][1] = $scope.tripleGeoConfig.dbPort;
				      			
						    	$scope.tripleGeoConfig = {
						    			
						    			 inputDisplay: inputDisplay,
						    			
										 format:      dbConfigArray[0][1],
										 targetStore: dbConfigArray[1][1],
										
										 dbtype: dbConfigArray[2][1],
										 dbName: dbConfigArray[3][1],
										 dbUserName: dbConfigArray[4][1],
										 dbPassword: dbConfigArray[5][1],
										 dbHost: dbConfigArray[6][1],
										 dbPort: dbConfigArray[7][1],
										 
										 resourceName: dbConfigArray[8][1],
										 tableName: dbConfigArray[9][1],
										 condition: dbConfigArray[10][1],
										 labelColumnName: dbConfigArray[11][1],
										 nameColumnName: dbConfigArray[12][1],
										 classColumnName: dbConfigArray[13][1],
										 geometryColumnName: dbConfigArray[14][1],
										 ignore: dbConfigArray[15][1],
										 
										 nsPrefix: dbConfigArray[16][1],
										 nsURI: dbConfigArray[17][1],
										 ontologyNSPrefix: dbConfigArray[18][1],
										 ontologyNS: dbConfigArray[19][1],
										 
										 sourceRS: dbConfigArray[20][1],
										 targetRS: dbConfigArray[21][1],
											 
										 defaultLang: dbConfigArray[22][1],
										};
				      		}
						    	
					      }, function (response){ // in the case of an error      	
						    	flash.error = ServerErrorResponse.getMessage(response);
	    					});
		    	  
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
	
	$scope.LaunchTripleGeo = function(){
			
		if($scope.options.job == "file" || $scope.options.job == "example"){
			params = {
					 job: $scope.options.job,
					
					 format: $scope.tripleGeoConfig.format,
					 targetStore: $scope.tripleGeoConfig.targetStore,
					 inputFile : $scope.tripleGeoConfig.inputFile,
					 
					 featureString: $scope.tripleGeoConfig.featureString,
					 attribute: $scope.tripleGeoConfig.attribute,
					 ignore: $scope.tripleGeoConfig.ignore,
					 type: $scope.tripleGeoConfig.type,
					 name: $scope.tripleGeoConfig.name,
					 dclass: $scope.tripleGeoConfig.dclass,
					 
					 nsPrefix: $scope.tripleGeoConfig.nsPrefix,
					 nsURI: $scope.tripleGeoConfig.nsURI,
					 ontologyNSPrefix: $scope.tripleGeoConfig.ontologyNSPrefix,
					 ontologyNS: $scope.tripleGeoConfig.ontologyNS,
					 
					 sourceRS: $scope.tripleGeoConfig.sourceRS,
					 targetRS: $scope.tripleGeoConfig.targetRS,
					 
					 defaultLang: $scope.tripleGeoConfig.defaultLang,
				   };
		}
		
		if($scope.options.job == "db"){
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
					 
					 nsPrefix: $scope.tripleGeoConfig.nsPrefix,
					 nsURI: $scope.tripleGeoConfig.nsURI,
					 ontologyNSPrefix: $scope.tripleGeoConfig.ontologyNSPrefix,
					 ontologyNS: $scope.tripleGeoConfig.ontologyNS,
					 
					 sourceRS: $scope.tripleGeoConfig.sourceRS,
					 targetRS: $scope.tripleGeoConfig.targetRS,
					 
					 defaultLang: $scope.tripleGeoConfig.defaultLang,
				   };
		}
			
		$window.$windowScope = $scope;
 		var newWindow = $window.open('popup.html#/popup-triplegeo', 'frame', 'resizeable,height=600,width=800');
		newWindow.params = params;
		};
	
	$scope.startTripleGeo= function(){
	  
		params = $window.params;
		$scope.showProgress = true;
			
			$http({
				url: $scope.service.serviceUrl+"/TripleGeoRun",
		        method: "POST",
		        params: params,
		        dataType: "json",
		        contentType: "application/json; charset=utf-8"
		      }).then(function(data) {
		    	$scope.stTripleGeo = false;
		    	$scope.showProgress = false;
		    	fileType = data.data;
		    	$scope.reviewTripleGeoResult(fileType);
		      }, function (response){ // in the case of an error      	
		      		$scope.stTripleGeo = false;
		    		$scope.showProgress = false;
						flash.error = ServerErrorResponse.getMessage(response);
	    		});
			
		};
	
	$scope.reviewTripleGeoResult = function(filetype){
			
	  	$scope.showProgress = true;
	  	
	  	params = { filetype : filetype };
	  	
		$http({
			url: $scope.service.serviceUrl+"/TripleGeoReview",
	        method: "POST",
	        params: params,
	        dataType: "json",
	        contentType: "application/json; charset=utf-8"
	      }).then(function(data){
	    	  		var results = data.data[0];
  	  				//results = results.substring(13,results.length-3);
	    	  		$scope.results = results;
	    		  	$scope.showProgress = false;
	  	    		$scope.reviewForm = true;
	      }, function (response){ // in the case of an error      	
	      		$scope.enterConfig = false;
	    		$scope.showProgress = false;
	    		$scope.inputForm = false;
	    		$scope.reviewForm = false;
				flash.error = ServerErrorResponse.getMessage(response);
	    	});
		};
	
	$scope.save = function(){
		
		var parameters = {
		        rdfFile: "result."+fileType,
		        fileType: fileType,
		        endpoint: AccountService.getAccount().getUsername()==null ? ConfigurationService.getPublicSPARQLEndpoint() : ConfigurationService.getSPARQLEndpoint(),
		        graph: $scope.saveDataset.replace(':', ConfigurationService.getUriBase()), 
		        uriBase : ConfigurationService.getUriBase(),
		        username: AccountService.getAccount().getUsername()
		      	};
		console.log(parameters);
		console.log($scope.service.serviceUrl+"/ImportRDF");
		$http({
			url: $scope.service.serviceUrl+"/ImportRDF",
	        method: "POST",
	        dataType: "json",
	        params: parameters,
	        contentType: "application/json; charset=utf-8"
		})
	      .success(function (data, status, headers, config){
	        if(data.status=="FAIL"){
	          flash.error = data.message;
	          importing = false;
	        }
	        else{
	          flash.success = data.message;
	        }
	      })
	      .error(function(data, status, headers, config) {
	          flash.error = data;
	      });
	  };
	
};

