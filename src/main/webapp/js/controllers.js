'use strict';

function SettingsMenuCtrl($scope, AccountService) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
  	{ name: "Data Sources", route:'#/settings/data-sources', url:'/settings/data-sources', admin: false },
  	{ name: "Datasets", route:'#/settings/datasets', url:'/settings/datasets', admin: false },
    // { name: "Namespaces", route:'#/settings/namespaces', url:'/settings/namespaces' },
  	{ name: "Components", route:'#/settings/components', url:'/settings/components', admin: false },
    { name: "Users", route:'#/settings/users', url:'/settings/users', admin: true }
  ];

  $scope.showAdmin = AccountService.isAdmin();

  $scope.$watch( function() { return AccountService.isAdmin(); }, function() {
    $scope.showAdmin = AccountService.isAdmin();
  }, true);
}

function AccountMenuCtrl($scope) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
    { name: "User Preferences",   route:'#/account/preferences', url:'/account/preferences' }];
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
	        {name: 'Sparqlify Extraction', route:'#/home/extraction-and-loading/sparqlify', url:'/home/extraction-and-loading/sparqlify' },
	        {name: 'TripleGeo Extraction', route:'#/home/extraction-and-loading/triplegeo', url:'/home/extraction-and-loading/triplegeo' }]
	    },
	    {
		      title: "Storage and Querying",
		      id:"storage-querying",
		      items: [
		       {name: 'Virtuoso', route:'#/home/querying-and-exploration/virtuoso', url:'/home/querying-and-exploration/virtuoso' }]
		    },
	    {
	      title: "Authoring",
	      id:"authoring",
	      items: [
	       {name: 'OntoWiki', route:'#/home/authoring/ontowiki', url:'/home/authoring/ontowiki' }]
	    },
	    {
		    title: "Linking and Fusion",
		    id:"linking",
		    items: [
		     {name: 'LIMES', route:'#/home/linking/limes', url:'/home/linking/limes' }]
		  },
		{
			 title: "Enrichment",
			 id:"enriching-cleansing",
			 items: [
			   {name: 'GeoLift', route:'#/home/enriching-and-cleaning/geolift', url:'/home/enriching-and-cleaning/geolift' }]
		  },
		{
		      title: "Exploration",
		      id:"querying-exploration",
		      items: [
		       {name: 'Facete', route:'#/home/querying-and-exploration/facete', url:'/home/querying-and-exploration/facete' },
		       {name: 'Mappify', route:'#/home/querying-and-exploration/mappify', url:'/home/querying-and-exploration/mappify' }]
		    }
	  ];

	}


function LoginCtrl($scope, flash, AccountService, LoginService, ServerErrorResponse, Base64) {
	$scope.loggedIn = false;
    $scope.currentAccount = angular.copy(AccountService.getAccount());
    if($scope.currentAccount.user != null){
    	LoginService.login($scope.currentAccount.user, $scope.currentAccount.pass)
        .then(function(data) {
            $scope.currentAccount = angular.copy(AccountService.getAccount());
            $scope.login.username = null;
            $scope.login.password = null;
            $scope.loggedIn = true;
        }, function(response) {
            flash.error = ServerErrorResponse.getMessage(response.status);
            $scope.login.username = null;
            $scope.login.password = null;
        });
    }

    $scope.login = {
        username : null,
        password : null //$scope.currentAccount.user, $scope.currentAccount.pass
    }; 

    $scope.login = function() {
        LoginService.login(Base64.encode($scope.login.username), Base64.encode($scope.login.password))
            .then(function(data) {
                $scope.currentAccount = angular.copy(AccountService.getAccount());
                $scope.login.username = null;
                $scope.login.password = null;
                $scope.loggedIn = true;
                $('#modalLogin').modal('hide');
              	$('body').removeClass('modal-open');
              	$('.modal-backdrop').slideUp();
              	$('.modal-scrollable').slideUp();
            }, function(response) {
                flash.error = ServerErrorResponse.getMessage(response.status);
                $scope.login.username = null;
                $scope.login.password = null;
            });
    };

    $scope.logout = function() {
        LoginService.logout()
            .then(function(data) {
                $scope.currentAccount = angular.copy(AccountService.getAccount());
                $scope.loggedIn = false;
            });
    };

    $scope.createAccount = function() {
        LoginService.createAccount($scope.signUp.username, $scope.signUp.email)
            .then(function(response) {
                $('#modalSignUp').modal('hide');
                $('body').removeClass('modal-open');
              	$('.modal-backdrop').slideUp();
              	$('.modal-scrollable').slideUp();
                flash.success = response.data.message;
            }, function(response) {
                $('#modalSignUp').modal('hide');
                $('body').removeClass('modal-open');
              	$('.modal-backdrop').slideUp();
              	$('.modal-scrollable').slideUp();
                flash.error = ServerErrorResponse.getMessage(response.status);
            });
    };

    $scope.restorePassword = function() {
        LoginService.restorePassword($scope.restorePassword.username)
            .then(function(response) {
                $('#modalRestorePassword').modal('hide');
                $('body').removeClass('modal-open');
              	$('.modal-backdrop').slideUp();
              	$('.modal-scrollable').slideUp();
                flash.success = response.data.message;
            }, function(response) {
                $('#modalRestorePassword').modal('hide');
                $('body').removeClass('modal-open');
              	$('.modal-backdrop').slideUp();
              	$('.modal-scrollable').slideUp();
                flash.error = ServerErrorResponse.getMessage(response.status);
            });
    };

    $scope.new = function(){
        $scope.signUpForm.$setPristine();
  	};
}

function AccountCtrl($scope, flash, AccountService, LoginService, ServerErrorResponse) {
    $scope.currentAccount = angular.copy(AccountService.getAccount());

    $scope.changePassword = function() {
        LoginService.changePassword($scope.password.oldPassword, $scope.password.newPassword)
            .then(function(response) {
                $('#modalChangePassword').modal('hide');
                $('body').removeClass('modal-open');
              	$('.modal-backdrop').slideUp();
              	$('.modal-scrollable').slideUp();
                flash.success = response.data.message;
            }, function(response) {
                $('#modalChangePassword').modal('hide');
                $('body').removeClass('modal-open');
              	$('.modal-backdrop').slideUp();
              	$('.modal-scrollable').slideUp();
                flash.error = ServerErrorResponse.getMessage(response.status);
            });
    };

    $scope.$watch( function() { return AccountService.getAccount(); }, function() {
        $scope.currentAccount = angular.copy(AccountService.getAccount());
    }, true);
}

app.controller('NavbarCtrl', function($scope, $location) {
		//if($location.path === "/"){
		//	$location.path('/home')
		//}
		$scope.getClass = function(path) {
			if ($location.path().substr(0, path.length) === path) {
			      return "active";
			    } else {
			      return "";
			    }
			};
	});

app.controller('SidebarCtrl', function($scope, $location) {
	    $scope.isSelected = function(route) {
	        return route === $location.path();
	    }
});

// this ModalWindow may be replaced witht the modalIframe directive
app.controller('ModalWindow', function ($scope) {

  $scope.OpenFullWindow = function (id) {
  	console.log("open");
    $("#" + id).modal({
    	height : $(window).height() - 165,
    	width  : "100%", 
    	show   : true
    });
  };

  $scope.OpenWindow = function (id) {
    $("#" + id).modal({
       show: true
    });
  }; 
 
  $scope.close = function (id) {
	  $("#" + id).modal('hide');
	  $('body').removeClass('modal-open');
	  $('.modal-backdrop').slideUp();
	  $('.modal-scrollable').slideUp();
  };
  
  $scope.del = function (index) {
	  
	  var person_to_delete = $scope.persons[index];

	  API.DeletePerson({ id: person_to_delete.id }, function (success) {
	    $scope.persons.splice(idx, 1);
	  });
	  
  };

  // for the child($scope.$emit)/parent($scope.$broadcast) controller to be able to close the modal window
  $scope.$on('closeModal', function(event, args) {
  	$scope.close(args.id);
  });        
  
});

var DataSourceTabCtrl = function($scope, $window, $location) {

  // The tab directive will use this data
  $scope.tabs = ['SPARQL Endpoint', 'Relational Database'];
  $scope.tabs.index = 0;
  $scope.tabs.active = function() { 
    return $scope.tabs[$scope.tabs.index]; 
    };
  
};

/****************************************************************************************************
*
* ONTOWIKI Controller
*
***************************************************************************************************/

app.controller('OntoWikiCtrl', function($scope, ConfigurationService) {
	$scope.component = ConfigurationService.getComponent(":OntoWiki");
	var services = ConfigurationService.getComponentServices(":OntoWiki");
	$scope.url = services[0].serviceUrl;
});



/****************************************************************************************************
*
* Virtuoso Controller
*
***************************************************************************************************/
app.controller('VirtuosoCtrl', function($scope, ConfigurationService, AccountService, GraphService, GraphGroupService) {

	$scope.namedGraphs = [];
	$scope.component = ConfigurationService.getComponent(":Virtuoso");
	// $scope.services = ConfigurationService.getComponentServices(":Virtuoso", "lds:SPARQLEndPointService");
	$scope.virtuoso = {
		service   : AccountService.getUsername()==null ? ConfigurationService.getPublicSPARQLEndpoint() : ConfigurationService.getSPARQLEndpoint(),
	 	dataset   : "",
	}

    $scope.refreshGraphList = function() {
	    GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
       	    var ngraphs = graphs;
       	    GraphGroupService.getAllGraphGroups(true).then(function(groups) {
       	        ngraphs = ngraphs.concat(groups);
       	        $scope.namedGraphs = ngraphs;
       	        $scope.virtuoso.dataset = $scope.namedGraphs[0];
       	    });
       	});
	};

	$scope.refreshGraphList();

	$scope.url = "";
	$scope.setUrl = function(){
	    if (AccountService.getUsername()==null) { //user is not authorized
	        $scope.url= $scope.virtuoso.service +
	            '?default-graph-uri=' + $scope.virtuoso.dataset.replace(':',ConfigurationService.getUriBase()) +
	            '&qtxt=select+distinct+%3FConcept+where+%7B%5B%5D+a+%3FConcept%7D+LIMIT+100'
	            '&format=text%2Fhtml' +
	            '&timeout=30000';
	    } else {
            $scope.url= "VirtuosoProxy" +
                    '?default-graph-uri=' + $scope.virtuoso.dataset.replace(':',ConfigurationService.getUriBase()) +
                                    '&qtxt=select+distinct+%3FConcept+where+%7B%5B%5D+a+%3FConcept%7D+LIMIT+100' +
                                    '&format=text%2Fhtml' +
                                    '&timeout=30000' +
                                    '&username=' + AccountService.getUsername();
        }
	};

	$scope.$watch( function () { return AccountService.getUsername(); }, function () {
	    $scope.refreshGraphList();
    });

});

/****************************************************************************************************
*
* Facete Controller
*
***************************************************************************************************/

app.controller('FaceteFormCtrl', function($scope, ConfigurationService, GraphService) {
	//Settings for Facete

	$scope.namedGraphs = [];
	$scope.component = ConfigurationService.getComponent(":Facete");
	var services = ConfigurationService.getComponentServices(":Facete");
	$scope.facete = {
		service   : ConfigurationService.getSPARQLEndpoint(),
	 	dataset   : "",
	};

	$scope.refreshGraphList = function() {
        GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
            $scope.namedGraphs = graphs;
            $scope.facete.dataset = $scope.namedGraphs[0];
        });
    };

    $scope.refreshGraphList();
	
	$scope.url = "";

	$scope.setUrl = function(){
		$scope.url= services[0].serviceUrl + 
								'?service-uri='+ $scope.facete.service+
                '&default-graph-uri=' + $scope.facete.dataset.replace(':',ConfigurationService.getUriBase());


	};

	$scope.$watch( function () { return AccountService.getUsername(); }, function () {
	    $scope.refreshGraphList();
	});
});

/****************************************************************************************************
*
* Mappify Controller
*
***************************************************************************************************/

app.controller('MappifyFormCtrl', function($scope, ConfigurationService, GraphService) {
	//Settings for Facete

	$scope.namedGraphs = [];
	$scope.component = ConfigurationService.getComponent(":Mappify");
	var services = ConfigurationService.getComponentServices(":Mappify");
	$scope.facete = {
		service   : ConfigurationService.getSPARQLEndpoint(),
	 	dataset   : "",
	};

	GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
	    $scope.namedGraphs = graphs;
        $scope.facete.dataset = $scope.namedGraphs[0];
    });
	
	$scope.url = "";

	$scope.setUrl = function(){
		$scope.url= services[0].serviceUrl;
   

	};
});

/****************************************************************************************************
*
* SPARQLIFY Controller
*
***************************************************************************************************/
app.controller('SparqlifyCtrl', function($scope, ConfigurationService, GraphService) {
	//Settings for Sparqlilfy

	$scope.namedGraphs = [];
	$scope.component = ConfigurationService.getComponent(":Sparqlify");
	var services = ConfigurationService.getComponentServices(":Sparqlify");
	
	$scope.sparqlify = {
	 	service   : ConfigurationService.getSPARQLEndpoint(),
	 	dataset   : "",
	}

    GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
	    $scope.namedGraphs = graphs;
    	$scope.sparqlify.dataset = $scope.namedGraphs[0];
    });

	$scope.url = "";

	$scope.setUrl = function(){
		$scope.url= services[0].serviceUrl;
    
	};
});

/****************************************************************************************************
*
* LIMES Controller
*
***************************************************************************************************/
var LimesCtrl = function($scope, $http, ConfigurationService, flash, ServerErrorResponse, $window, DateService, GraphService){
	
	var services = ConfigurationService.getComponentServices(":Limes");
	var serviceUrl = services[0].serviceUrl;
	
	// parameters for saving results
	$scope.namedGraphs = [];
    GraphService.getAccessibleGraphs(false, false, true).then(function(graphs) {
	    $scope.namedGraphs = graphs;
    });
	$scope.defaultEndpoint = ConfigurationService.getSPARQLEndpoint();
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.uriBase = ConfigurationService.getUriBase();
	$scope.importServiceUrl = serviceUrl+"/ImportRDF";

	$scope.configOptions = true;
	$scope.inputForm = true;
	$scope.deleteProp = false;
	var importing = false;
	var uploadError = false;
	var uploadedFiles = null;
	var params = {};
	var idx = 0;
	var numberOfProps = 1;
	
	$scope.examples = [
						{ name : "Duplicate Dbpedia country entries for the CET time zone" },
						{ name : "Geo Data" }
					];
	
	$scope.options = { 	output: [
			                "N3" ,
			                "TAB" ,
			                "TURTLE" 
			                ],
						execType: [
			                "Simple" ,
			                "FILTER" ,
			                "OneToOne" 
			                ],
					    granularity: [
							"1" ,
							"2" ,
							"3" ,
							"4" ]
					};
	
	$scope.limes = { OutputFormat :    $scope.options.output[0],
					 ExecType :        $scope.options.execType[0],
					 Granularity : 	   $scope.options.granularity[0]
	};
	
	$scope.props = [{
		inputs : [{
		          idx : idx,
		          source: "",
				  target: ""
				}]
	}];

	$scope.appendInput = function(source, target){
		idx++;
		$scope.props[0].inputs.push({ 
								idx : idx,
								source: source,
								target: target
								});
		numberOfProps++;
		$scope.deleteProp = true;
	};
	
	$scope.removeInput = function () {
		
		  $scope.props[0].inputs.splice( (numberOfProps-1) , 1 );
		  numberOfProps--;
		  
		  if(numberOfProps === 1){
			  $scope.deleteProp = false;
		  }
		  
	};
	
	$scope.FillForm = function(example){
		
		params = {};
		$scope.enterConfig = true;
		$scope.startLimes = true;
		
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
						 Metric: "levenshtein(y.rdfs:label, x.rdfs:label)",
						 OutputFormat: $scope.options.output[0],
						 ExecType: $scope.options.execType[0],
						 Granularity : 	   $scope.options.granularity[0],
						 AcceptThresh: "1",
						 ReviewThresh: "0.95",
						 AcceptRelation: "owl:sameAs",
						 ReviewRelation: "owl:sameAs" 
				};
		
		$scope.props = [{
						inputs : [{
						          idx : 0,
						          source: "rdfs:label",
						          target: "rdfs:label"
								}]
						}];
			idx++;
		}
		
		if(example === "Geo Data"){

			$scope.limes = { 	SourceServiceURI : "http://linkedgeodata.org/sparql",
								TargetServiceURI : "http://linkedgeodata.org/sparql",
								SourceVar: "?x",
								TargetVar: "?y",
								SourceSize: "2000",
								TargetSize: "2000",
								SourceRestr: "?x a lgdo:RelayBox",
								TargetRestr: "?y a lgdo:RelayBox",
								Metric: "hausdorff(x.polygon, y.polygon)",
								OutputFormat: $scope.options.output[0],
								ExecType: $scope.options.execType[0],
								Granularity : $scope.options.granularity[0],
								AcceptThresh: "0.9",
								ReviewThresh: "0.5",
								AcceptRelation: "lgdo:near",
								ReviewRelation: "lgdo:near"
									};
		
			$scope.props = [{
							inputs : [{
							          idx : 0,
							          source: "geom:geometry/geos:asWKT RENAME polygon",
							          target: "geom:geometry/geos:asWKT RENAME polygon"
									}
							/*
									{
								          idx : 1,
								          source: "geom:geometry/geos:asWKT RENAME polygon",
								          target: "geom:geometry/geos:asWKT RENAME polygon"
										}*/]
							}];
				//idx++;
				//numberOfProps++;
				
			}
		};
	
$scope.LaunchLimes = function(){
		
		var SourceGraph = null;
		var TargetGraph = null;
		var SourceRestr = null;
		var TargetRestr = null;
		
		
		if($scope.limes.SourceGraph != null){
			SourceGraph = $scope.limes.SourceGraph.replace(':', ConfigurationService.getUriBase());
		}
		if($scope.limes.TargetGraph != null){
			TargetGraph = $scope.limes.TargetGraph.replace(':', ConfigurationService.getUriBase());
		}

		if($scope.limes.SourceRestr.length != 0){
			SourceRestr = $scope.limes.SourceRestr;
		}
		
		if($scope.limes.TargetRestr.length != 0){
			TargetRestr = $scope.limes.TargetRestr;
		}
		
		$scope.propsCopy = [{
			inputs : []
		}];
		
		for(var i=0; i<numberOfProps; i++){
			if($("#SourceProp"+i).val().length != 0 || $("#TargetProp"+i).val().length != 0){
				$scope.propsCopy[0].inputs.push({ 
					idx : i,
					source: $("#SourceProp"+i).val(),
					target: $("#TargetProp"+i).val()
					});
				}
		}
		
		numberOfProps = $scope.propsCopy[0].inputs.length;
		
		var params = {};
		
		for(var i=0; i<numberOfProps; i++){
			var SourceProp = "SourceProp"+i;
			var TargetProp = "TargetProp"+i;
			params[SourceProp] = $scope.propsCopy[0].inputs[i].source;
			params[TargetProp] = $scope.propsCopy[0].inputs[i].target;
		};
		
		params.SourceServiceURI = $scope.limes.SourceServiceURI;
		params.TargetServiceURI = $scope.limes.TargetServiceURI;
		params.SourceGraph = SourceGraph;
		params.TargetGraph = TargetGraph;
		params.SourceVar = $scope.limes.SourceVar;
		params.TargetVar = $scope.limes.TargetVar;
		params.SourceSize = $scope.limes.SourceSize;
		params.TargetSize = $scope.limes.TargetSize;
		params.SourceRestr = SourceRestr;
		params.TargetRestr = TargetRestr;
		params.Metric = $scope.limes.Metric;
		params.Granularity = $scope.limes.Granularity;
		params.OutputFormat = $scope.limes.OutputFormat;
		params.ExecType = $scope.limes.ExecType;
		params.AcceptThresh = $scope.limes.AcceptThresh;
		params.ReviewThresh = $scope.limes.ReviewThresh;
		params.AcceptRelation = $scope.limes.AcceptRelation;
		params.ReviewRelation = $scope.limes.ReviewRelation;
		params.numberOfProps = numberOfProps;
		
		$window.$windowScope = $scope;
 		var newWindow = $window.open('popup.html#/popup-limes', 'frame', 'resizeable,height=600,width=800');
		$window.open('popup.html#/popup-limes', 'frame', 'resizeable,top=100,left=100,height=400,width=400');
		newWindow.params = params;
	};
		
	$scope.StartLimes = function(){
		
			var params = $window.params;
			$scope.showProgress = true;
			$http({
					url: serviceUrl+"/LimesRun",
			        method: "POST",
			        params: params,
			        dataType: "json",
			        contentType: "application/json; charset=utf-8"})
		  .success(function (data, status, headers, config){
	    	// to get the file list of results instead of review 
	    	// $scope.ReviewLimes();
	      // }, function (response){ // in the case of an error      	
	
	      if(data.status=="SUCCESS"){
	        
	       	$scope.startLimes = false;
		    	$scope.showProgress = false;
		    	$scope.inputForm = true;
		    	flash.success = data.message;
		    	// get the files inside data.results, and these are to be proposed to be downloaded
		    	// in this case probably LimesReview is not required anymore...
				$scope.ReviewLimes();   
	      }
	      else {
			        flash.error = data.message;
			        $scope.startLimes = false;
		    	    $scope.showProgress = false;
	      	}}).error(function(data, status, headers, config) {
			        flash.error = ServerErrorResponse.getMessage(data.message);
			        $scope.startLimes = false;
				    $scope.showProgress = false;});

	};
	
	$scope.ReviewLimes = function(){

		$scope.configOptions = false;
		$scope.reviewForm = false;

	  $http({
			url: serviceUrl+"/LimesReview",
	        method: "POST",
	        dataType: "json",
	        contentType: "application/json; charset=utf-8"
	      }).then(function(data){
	    	    console.log(data);
	    	  	var result = data.data[0];
	  	  		if (result.length<3){
	  	  			$scope.limes.reviewResults = "No results to review";
	  		  	}else{
	  		  		$scope.limes.reviewResults = result;
	  		  	}
	  	  		
	  	  		result = data.data[1];
	  	  		if (result.length<3){
	  	  			$scope.limes.acceptedResults = "No results meet the acceptance threshold";
	  	  		}else{
	  	  			$scope.limes.acceptedResults = result;
	  	  		}
	  	  		
	  		  	$scope.enterConfig = false;
	  		  	$scope.showProgress = false;
	    			$scope.inputForm = false;
		    		$scope.reviewForm = true;
	  		 }, function (response){ // in the case of an error 
	  			console.log(response);
	  			$scope.startLimes = false;
		    	$scope.showProgress = false;
		    	$scope.inputForm = true;
		    	$scope.reviewForm = false;
		    	flash.error = ServerErrorResponse.getMessage(response.status);
	    });
	      
	};
	
	$scope.loadLimesXML = function($files){
		
		for (var i = 0; i < $files.length; i++) {
		  var $file = $files[i];
		  $http.uploadFile({
		    url: 'UploadServlet', //upload.php script, node.js route, or servlet uplaod url)
		    file: $file
		  }).then(function(response, status, headers, config) {
		        // file is uploaded successfully
			  var filename = $files[0].name;
			  $('#dummyInput').val(filename);
			  		
				$http({
						method: "POST",
						url: serviceUrl+"/LoadFile",
						params: {file : filename}})

					.then(function(data) {
						
						$scope.limes = { 
							SourceServiceURI : data.data[0][0],
							TargetServiceURI  : data.data[1][0],
							SourceVar: data.data[0][1],
							TargetVar: data.data[1][1],
							SourceSize: data.data[0][2],
							TargetSize: data.data[1][2],
							SourceRestr: data.data[0][3],
							TargetRestr: data.data[1][3],
							Metric: data.data[2],
							OutputFormat: data.data[5],
							ExecType: data.data[7],
							Granularity: data.data[6],
							AcceptThresh: data.data[3][0],
							ReviewThresh: data.data[4][0],
							AcceptRelation: data.data[3][1],
							ReviewRelation: data.data[4][1] 
						};
						
						idx=0;
						
						$scope.props = [{
							inputs : []
						}];
						
						for(var i=0; i<data.data[8].length; i++){
							
							$scope.props[0].inputs.push({ 
								idx : idx,
								source: data.data[8][i],
								target: data.data[9][i]
								});
							
							idx++;
							
						};
						
						numberOfProps = data.data[8].length;
						
						$scope.enterConfig = true;
						$scope.startLimes = true;
						
					}, function (response){ // in the case of an error
						flash.error = "Invalid LIMES Configuration file: " +response.data;
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
	
	$scope.save = function(){
			
		var parameters = { 
        endpoint: ConfigurationService.getSPARQLEndpoint() , 
   		uriBase : ConfigurationService.getUriBase()
		};
				
		$http({
			url: serviceUrl+"/ImportRDF",
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
		      console.log(data);
		      // add the graph metadata to settingsGraph
		      var now = DateService.getCurrentDate();
		      var newGraph = {  name:"" ,  graph: {
					  	created : now, endpoint: ConfigurationService.getSPARQLEndpoint(), 
					  	description: "", 
					  	modified: now, label:"" 
						}};
					var sucess;
			    for (var res in data.result){
			     	var graphName = data.result[res].replace(ConfigurationService.getUriBase() ,":");
			     	if (graphName.indexOf("accepted") >= 0){
			     		newGraph.name = graphName;
			     		newGraph.graph.description = "Accepted results from LIMES";
			     		newGraph.graph.label = "LIMES Accepted";
			     		sucess  = ConfigurationService.addGraph(newGraph);
			     		// TODO: handle succes/error
			     	}
						if (graphName.indexOf("review") >= 0){
			     		newGraph.name = graphName;
			     		newGraph.graph.description = "Results to review from LIMES";
			     		newGraph.graph.label = "LIMES review";
				   		sucess = ConfigurationService.addGraph(newGraph);
				   		console.log(newGraph);
			     		// TODO: handle succes/error
			     	}
			    }
			  }
			})
			.error(function(data, status, headers, config) {
			  flash.error = data;
		});
	};
};

/****************************************************************************************************
*
* GEOLIFT Controller
*
***************************************************************************************************/

var GeoliftCtrl = function($scope, $http, ConfigurationService, flash, ServerErrorResponse, $window, AccountService, GraphService){
	
	var services = ConfigurationService.getComponentServices(":GeoLift");
	var serviceUrl = services[0].serviceUrl;
	
	$scope.endpoints = ConfigurationService.getAllEndpoints();
	$scope.namedGraphs = [];
    GraphService.getAccessibleGraphs(true, false, true).then(function(graphs) {
	    $scope.namedGraphs = graphs;
    });
	
	$scope.inputForm = true;
	$scope.configOptions = true;
	$scope.startButton = false;
	$scope.directiveParams = {};
	$scope.useDirective = 0;
	$scope.resultURL = "";
	var importing = false;
	var sourceInput = null;
	var dataFile = null;
	var uploadError = false;
	var uploadedFiles = null;
	var count = 1;
	var idx = 0;
	var isCompletePath = 0;
	
	$scope.modOptions = [
	                      { label: "Choose a module"},
	                      { label: "nlp"},
	 			          { label: "dereferencing"}
	                     ],
	
	
	
	$scope.options = {
			inputFile: false,
			configFile: false,
			endpoints: false,
			datasource: [
		                 	"File",
		                 	"URI",
							//"SPARQL Endpoint"
  			                ]
	};
	
	$scope.choice = function($name){
		
		$scope.configForm = false;
		$scope.inputDisplay = "";
		$scope.inputDisplayRow = false;
		$scope.params[0].visible = false;
		
		if($name == "File"){
			$scope.configOptions = true;
			$scope.addParamButton = true;
			$scope.options.epExamples = false;
			$scope.options.fileExamples = true;
			$scope.options.URIExamples = false;
			$scope.options.endpoints = false;
			$scope.options.inputFile = true;
			$scope.options.configFile = false;
			$scope.inputDisplayRow = false;
		}
		if($name == "URI"){
			isCompletePath = 1;
			$scope.configOptions = true;
			$scope.addParamButton = true;
			$scope.options.URIExamples = true;
			$scope.inputDisplayRow = true;
			$scope.options.fileExamples = false;
			$scope.options.endpoints = false;
			$scope.options.inputFile = false;
			$scope.options.configFile = false;
		}
		if($name == "SPARQL Endpoint"){
			isCompletePath = 1;
			$scope.configOptions = true;
			$scope.addParamButton = true;
			$scope.options.epExamples = true;
			$scope.options.fileExamples = false;
			$scope.options.endpoints = true;
			$scope.options.inputFile = false;
			$scope.options.configFile = false;
		}
		$scope.startButton = true;
		$scope.params[0].inputs.length = 0;
	};
	
	$scope.URIExamples = [
							{ 	label : "http://dbpedia.org/data/Nidau", 
								params: [
											{
											index: "1",
											module: "nlp",
											parameter: "useFoxLight",
											value: "true"
												},
											{
											index: "2",
											module: "nlp",
											parameter: "useFoxLight",
											value: "true"
												},
												
											{
											index: "2",
											module: "dereferencing",
											parameter: "predicate",
											value: "http://www.w3.org/2003/01/geo/wgs84_pos#geometry"
												},
												
									]
							},
							{ 	label : "http://dbpedia.org/data/Athens", 
								params: [
											{
											index: "1",
											module: "nlp",
											parameter: "useFoxLight",
											value: "true"
												},
											{
											index: "2",
											module: "nlp",
											parameter: "useFoxLight",
											value: "true"
												},
												
											{
											index: "2",
											module: "dereferencing",
											parameter: "predicate",
											value: "http://www.w3.org/2003/01/geo/wgs84_pos#lon"
												},
												
									]
							}
					],
	
	$scope.epExamples = [
							{ 	label : "Dbpedia endpoint enrichment", 
								params: [
											{
											index: "1",
											module: "nlp",
											parameter: "useFoxLight",
											value: "true"
												},
											{
											index: "1",
											module: "nlp",
											parameter: "askEndPoint",
											value: "false"
												},
											{
											index: "2",
											module: "dereferencing",
											parameter: "predicate1",
											value: "http://www.w3.org/2003/01/geo/wgs84_pos#geometry"
												},
											{
											index: "3",
											module: "nlp",
											parameter: "LiteralProperty",
											value: "http://www.w3.org/2000/01/rdf-schema#comment"
												},
											{
											index: "3",
											module: "nlp",
											parameter: "useFoxLight",
											value: "false"
												},
											{
											index: "4",
											module: "nlp",
											parameter: "useFoxLight",
											value: "true"
												},
									]
							}
					],
					
	$scope.fileExamples = [
							{ 	label : "Berlin Turtle File", 
								params: [
															{
															index: "1",
															module: "nlp",
															parameter: "useFoxLight",
															value: "true"
																},
															{
															index: "1",
															module: "nlp",
															parameter: "askEndPoint",
															value: "false"
																},
															{
															index: "2",
															module: "dereferencing",
															parameter: "predicate1",
															value: "http://www.w3.org/2003/01/geo/wgs84_pos#geometry"
																},
															{
															index: "3",
															module: "nlp",
															parameter: "LiteralProperty",
															value: "http://www.w3.org/2000/01/rdf-schema#comment"
																},
															{
															index: "3",
															module: "nlp",
															parameter: "useFoxLight",
															value: "false"
																},
															{
															index: "4",
															module: "nlp",
															parameter: "useFoxLight",
															value: "true"
																},
													]
											},
											
											{ 	label : "Berlin N Triples File", 
												params: [
																			{
																			index: "1",
																			module: "nlp",
																			parameter: "useFoxLight",
																			value: "true"
																				},
																			{
																			index: "2",
																			module: "dereferencing",
																			parameter: "predicate1",
																			value: "http://www.w3.org/2003/01/geo/wgs84_pos#geometry"
																				},
																	]
															},
											{ 	label : "Denmark RDF File", 
													params: [
																			{
																			index: "1",
																			module: "nlp",
																			parameter: "useFoxLight",
																			value: "true"
																				},
																			{
																			index: "2",
																			module: "dereferencing",
																			parameter: "predicate1",
																			value: "http://www.w3.org/2003/01/geo/wgs84_pos#geometry"
																				},
																		]
															}
									],
									
	$scope.params = [{
						inputs : [],
						visible: false 
					}];
	
	$scope.appendInput = function(){
		
			$scope.options.URIExamples = false;
			$scope.options.fileExamples = false;
			$scope.options.configFile = false;
			$scope.addButton = true;
			$scope.params[0].inputs.push( { 
										idx : idx++, 
										index : count++
										} );

			$scope.params[0].visible = true;
			$scope.startButton = true;
		};
		
	$scope.setParams = function(modOption, index){
		
		if(modOption.label === "nlp"){
			$('#parameter'+index).empty();
			$('#paramVal'+index).empty();
			$('#parameter'+index).append('<option selected="selected" value="">Choose a parameter</option>');
			$('#parameter'+index).append('<option value="LiteralProperty">LiteralProperty</option>');
			$('#parameter'+index).append('<option value="useFoxLight">useFoxLight</option>');
			$('#parameter'+index).append('<option value="askEndPoint">askEndPoint</option>');
		}
		
		if(modOption.label === "dereferencing"){ 
			$('#parameter'+index).empty();
			$('#parameter'+index).append('<option selected="selected" value="LiteralProperty">predicate</option>');
			$('#paramVal'+index).empty();
			$('#paramVal'+index).append('<option selected="selected" value="">Choose a value</option>');
			$('#paramVal'+index).append('<option value="http://www.w3.org/2003/01/geo/wgs84_pos#lat">http://www.w3.org/2003/01/geo/wgs84_pos#lat</option>');
			$('#paramVal'+index).append('<option value="http://www.w3.org/2003/01/geo/wgs84_pos#lon">http://www.w3.org/2003/01/geo/wgs84_pos#lon</option>');
			$('#paramVal'+index).append('<option value="http://www.w3.org/2003/01/geo/wgs84_pos#geometry">http://www.w3.org/2003/01/geo/wgs84_pos#geometry</option>');
			$('#paramVal'+index).append('<option value="http://www.w3.org/2000/01/rdf-schema#label">http://www.w3.org/2000/01/rdf-schema#label</option>');
			$('#paramVal'+index).append('<option value="http://dbpedia.org/ontology/abstract">http://dbpedia.org/ontology/abstract</option>');
			$('#paramVal'+index).append('<option value="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">http://www.w3.org/1999/02/22-rdf-syntax-ns#type</option>');
		}
		
	};
	
	$scope.setValue = function(paramOption, index){
		if(paramOption === "LiteralProperty"){
			$('#paramVal'+index).empty();
			$('#paramVal'+index).append('<option selected="selected" value="">Choose a value</option>');
			$('#paramVal'+index).append('<option value="http://www.w3.org/2000/01/rdf-schema#comment">http://www.w3.org/2000/01/rdf-schema#comment</option>');
			$('#paramVal'+index).append('<option value="http://dbpedia.org/ontology/abstract">http://dbpedia.org/ontology/abstract</option>');
		}
		
		if(paramOption === "useFoxLight" || paramOption === "askEndPoint"){
			$('#paramVal'+index).empty();
			$('#paramVal'+index).append('<option selected="selected" value="">Choose a value</option>');
			$('#paramVal'+index).append('<option value="true">true</option>');
			$('#paramVal'+index).append('<option value="true">false</option>');
		}
	};
	
	$scope.addParams = function(paramOption, index){
		for(var i=0; i<$scope.params[0].inputs.length; i++){
			$scope.params[0].inputs[i].index = $('#indexid'+i).val();
			count = parseInt($('#indexid'+i).val());
		}
		count++;
	};
	
	$scope.removeInput = function ( index ) {
	  $scope.params[0].inputs.splice( index, 1 );
	  if($scope.params[0].inputs.length === 0){
	  	$scope.params[0].visible = false;
	  }
	  if($scope.params[0].inputs.length === 0)
	  	$scope.startButton = false;
	};
	
	$scope.FillForm = function(example){
		
		//$scope.directiveParams = {};
		$scope.params[0].inputs = [];
		$scope.startButton = false;
		count = 0;
		$scope.useDirective = 1;
		$scope.addParamButton = false;
		$scope.addButton = false;
		
		if(example === "Dbpedia endpoint enrichment"){
			
			isCompletePath = 1;
			$scope.endpointSelect = $scope.endpoints[0];
			sourceInput = $scope.endpointSelect.endpoint;
			$scope.inputDisplay = sourceInput;
			$scope.options.endpoints = false;
			$scope.endpointSelect = false;
			$scope.inputDisplayRow = false;
			
			for(var i=0; i<$scope.epExamples[0].params.length; i++){
				
				$scope.params[0].inputs.push({
					idx: i,
					index: $scope.epExamples[0].params[i].index,
					module: $scope.epExamples[0].params[i].module,
					parameter: "",
					value: ""
				});

				$scope.params[0].visible = true;
				$scope.startButton = true;
				count = $scope.epExamples[0].params[i].index;
			}
		}
		
		if(example === "http://dbpedia.org/data/Nidau"){
			
			isCompletePath = 1;
			$scope.inputDisplay = example;
			$scope.options.endpoints = false;
			$scope.endpointSelect = false;
			$scope.inputDisplayRow = false;
			$scope.exampleName = example;
			$scope.directiveParams = $scope.URIExamples[0].params;
			
			for(var i=0; i<$scope.URIExamples[0].params.length; i++){
				
				$scope.params[0].inputs.push({
					idx: i,
					index: $scope.URIExamples[0].params[i].index
				});
				
				$scope.params[0].visible = true;
				$scope.startButton = true;
				count = $scope.epExamples[0].params[i].index;
			}
			count = 3;
		}
		
		if(example === "http://dbpedia.org/data/Athens"){
					
					isCompletePath = 1;
					$scope.inputDisplay = example;
					$scope.options.endpoints = false;
					$scope.endpointSelect = false;
					$scope.inputDisplayRow = false;
					$scope.exampleName = example;
					$scope.directiveParams = $scope.URIExamples[0].params;
					
					for(var i=0; i<$scope.URIExamples[0].params.length; i++){
						
						$scope.params[0].inputs.push({
							idx: i,
							index: $scope.URIExamples[0].params[i].index
						});
						
						$scope.params[0].visible = true;
						$scope.startButton = true;
						count = $scope.epExamples[0].params[i].index;
					}
					count = 3;
				}
		
		if(example === "http://dbpedia.org/data/Greece"){
			
			isCompletePath = 1;
			$scope.inputDisplay = example;
			$scope.options.endpoints = false;
			$scope.endpointSelect = false;
			$scope.inputDisplayRow = false;
			$scope.exampleName = example;
			$scope.directiveParams = $scope.URIExamples[0].params;
			
			for(var i=0; i<$scope.URIExamples[0].params.length; i++){
				
				$scope.params[0].inputs.push({
					idx: i,
					index: $scope.URIExamples[0].params[i].index
				});
				
				$scope.params[0].visible = true;
				$scope.startButton = true;
				count = $scope.epExamples[0].params[i].index;
			}
			count = 3;
		}
		
		if(example === "Berlin Turtle File"){
			
			isCompletePath = 0;
			$scope.options.inputFile = false;
			sourceInput = "berlin.ttl";
			$scope.inputDisplay = sourceInput;
			$scope.directiveParams = $scope.fileExamples[0].params;
					
			for(var i=0; i<$scope.fileExamples[0].params.length; i++){
						
				$scope.params[0].inputs.push({
					idx: i,
					index: $scope.fileExamples[0].params[i].index,
					module: $scope.fileExamples[0].params[i].module
				});
		
				$scope.params[0].visible = true;
				$scope.startButton = true;
			}
			count = 5;
		}
		
		if(example === "Berlin N Triples File"){
			
			isCompletePath = 0;
			$scope.options.inputFile = false;
			sourceInput = "berlin.n3";
			$scope.inputDisplay = sourceInput;
			$scope.directiveParams = $scope.fileExamples[1].params;
					
			for(var i=0; i<$scope.fileExamples[1].params.length; i++){
						
				$scope.params[0].inputs.push({
					idx: i,
					index: $scope.fileExamples[1].params[i].index,
					module: $scope.fileExamples[1].params[i].module
				});
		
				$scope.params[0].visible = true;
				$scope.startButton = true;
				count = $scope.epExamples[0].params[i].length;
			}
			count = 3;
		}
		
		if(example === "Denmark RDF File"){
			
			isCompletePath = 0;
			$scope.options.inputFile = false;
			sourceInput = "denmark.rdf";
			$scope.inputDisplay = sourceInput;
			$scope.directiveParams = $scope.fileExamples[2].params;
					
			for(var i=0; i<$scope.fileExamples[2].params.length; i++){
						
				$scope.params[0].inputs.push({
					idx: i,
					index: $scope.fileExamples[2].params[i].index,
					module: $scope.fileExamples[2].params[i].module
				});
		
				$scope.params[0].visible = true;
				$scope.startButton = true;
				count = $scope.epExamples[0].params[i].index;
			}
			count = 3;
		}
	};
	
	$scope.loadDataFile = function($files){
		$scope.options.fileExamples = false;
		$scope.options.configFile = true;
		dataFile = $files[0].name;
		$scope.inputDisplay = dataFile;
		isCompletePath = 2;
		$('#dummyGeoLiftInput').val(dataFile);
		};
	
	$scope.loadConfigFile = function($files){
		
		$scope.params[0].inputs = [];
		
		$scope.addParamButton = false;
		$scope.useDirective = 1;
	
		for (var i = 0; i < $files.length; i++) {
	    var $file = $files[i];
	    $http.uploadFile({
	      url: 'UploadServlet', //upload.php script, node.js route, or servlet uplaod url)
	      file: $file
	    	})
	    .then(function(response, status, headers, config) {
			  // file is uploaded successfully
			  var configFile = $files[0].name;
			  $('#dummyConfigInput').val(configFile);
			  		
				$http({
					method: "POST",
					url: serviceUrl+"/LoadFile",
					params: {
						configFile : configFile,
						dataFile: dataFile}
				 	})
				.then(function(data) {
					$scope.inputDisplay = data.data[0][0];
					isCompletePath = 1;
					for(var i=1; i<data.data.length; i++){
						$scope.params[0].inputs.push({
							idx: i-1,
						  	index: data.data[i][0],
					 	  	module: data.data[i][1],
					 	  	parameter: data.data[i][2],
					 	  	value: data.data[i][3],
						});
					}
					
					$scope.directiveParams = $scope.params[0].inputs;
					$scope.params[0].visible = true;
					$scope.startButton = true;
					      		
				}, function (response){ // in the case of an error      	
				 	flash.error = ServerErrorResponse.getMessage(response.status);
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
	
	$scope.LaunchGeoLift = function(){
		
		if(isCompletePath == 1 || isCompletePath == 2){
			sourceInput = $scope.inputDisplay;
		}
		
		var params = {};
		params[0] = $scope.params[0].inputs.length;
		params[1] = sourceInput;
		params[2] = isCompletePath;
		
		for(var i=0; i<$scope.params[0].inputs.length; i++){
			$scope.params[0].inputs[i].index = parseInt($('#indexid'+i).val());
		}
		
		var predicateCounter = 1;
		var parameterText = null;
		
		for(var i=0; i<$scope.params[0].inputs.length; i++){
		  if($('#parameter'+i+' option:selected').text() == "predicate"){
			  parameterText = $('#parameter'+i+' option:selected').text()+predicateCounter++;
		  }
		  if($('#parameter'+i+' option:selected').text() != "predicate"){
			  parameterText = $('#parameter'+i+' option:selected').text();
		  }
		  params[i+3] = $scope.params[0].inputs[i].index + " " + $('#module'+i+' option:selected').text() +
		  " " + parameterText + " " + $('#paramVal'+i+' option:selected').text();
		  console.log(params[i+3]);
		}
			
		window.$windowScope = $scope;
	 	var newWindow = $window.open('popup.html#/popup-geolift', 'frame', 'resizeable,height=600,width=800');
		newWindow.params = params;
		
	};
	
	$scope.StartGeoLift = function(){
		
		var params = $window.params;
		$scope.showProgress = true;
		$scope.reviewForm = false;
		
		$http({
			url: serviceUrl+"/GeoLiftRun",
	        method: "POST",
	        params: params,
	        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
      })
		.then(function() {
		  $scope.reviewGeoLiftResult();
	  	},  function (response){ // in the case of an error      	
			flash.error = ServerErrorResponse.getMessage(response.status);
	  });		
	};
	
	$scope.reviewGeoLiftResult = function(){
		
	  $scope.showProgress = true;
	  	
		$http({
			url: serviceUrl+"/GeoLiftReview",
	        method: "POST",
	        dataType: "json",
	        contentType: "application/json; charset=utf-8"
	      }).then(function(data){
	    	  console.log(data);
	    	  		var results = data.data[0];
	    	  		$scope.resultURL = data.data[1];
	    	  		//results = results.substring(13,results.length-3);
	    	  		$scope.results = results;
	    	  		
	    		  	$scope.showProgress = false;
	    		  	$scope.inputForm = false;
	  	    		$scope.reviewForm = true;
	  	    		//$scope.showDownload();
	  	    		
	      				}, function (response){ // in the case of an error      	
						 	flash.error = ServerErrorResponse.getMessage(response.status);
	  });
	};
	
	$scope.save = function(){
		
		var parameters = {
	    rdfFile: "result.ttl", 
	    endpoint: ConfigurationService.getSPARQLEndpoint(), 
	    graph: $scope.saveDataset.replace(':', ConfigurationService.getUriBase()), 
	    uriBase : ConfigurationService.getUriBase(),
        username: AccountService.getUsername()
	 	};
		
		$http({
			url: serviceUrl+"/ImportRDF",
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

/****************************************************************************************************
*
* TRIPLEGEO Controller
*
***************************************************************************************************/

var TripleGeoCtrl = function($scope, $http, ConfigurationService, flash, ServerErrorResponse, $window, AccountService, GraphService){
	
	var services = ConfigurationService.getComponentServices(":TripleGeo");
	var serviceUrl = services[0].serviceUrl;
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
							url: serviceUrl+"/LoadFile",
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
						    	flash.error = ServerErrorResponse.getMessage(response.status);
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
		//$window.open('popup.html#/popup-limes', 'frame', 'resizeable,top=100,left=100,height=400,width=400');
		newWindow.params = params;
		};
	
	$scope.startTripleGeo= function(){
	  
		params = $window.params;
		$scope.showProgress = true;
			
			$http({
				url: serviceUrl+"/TripleGeoRun",
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
						flash.error = ServerErrorResponse.getMessage(response.status);
	    		});
			
		};
	
	$scope.reviewTripleGeoResult = function(filetype){
			
	  	$scope.showProgress = true;
	  	
	  	params = { filetype : filetype };
	  	
		$http({
			url: serviceUrl+"/TripleGeoReview",
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
				flash.error = ServerErrorResponse.getMessage(response.status);
	    	});
		};
	
	$scope.save = function(){
		
		var parameters = {
		        rdfFile: "result."+fileType,
		        fileType: fileType,
		        endpoint: ConfigurationService.getSPARQLEndpoint() , 
		        graph: $scope.saveDataset.replace(':', ConfigurationService.getUriBase()), 
		        uriBase : ConfigurationService.getUriBase(),
		        username: AccountService.getUsername()
		      	};
		console.log(parameters);
		console.log(serviceUrl+"/ImportRDF");
		$http({
			url: serviceUrl+"/ImportRDF",
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


/****************************************************************************************************
*
* IMPORT Controller
*
***************************************************************************************************/

var ImportFormCtrl = function($scope, $http, ConfigurationService, flash, AccountService, GraphService) {

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
        username : AccountService.getUsername()
      };
      
    }
    else if(type == 'url'){
      parameters ={
        rdfUrl: $scope.importUrl.inputUrl, 
        endpoint: ConfigurationService.getSPARQLEndpoint(), 
        graph: $scope.importUrl.graph.replace(':',ConfigurationService.getUriBase()), 
        uriBase : ConfigurationService.getUriBase(),
        username : AccountService.getUsername()
      };

    }
    else if(type == 'query'){
      parameters ={
        rdfQuery: $scope.importSparql.sparqlQuery,
        rdfQueryEndpoint: $scope.importSparql.endPoint, 
        endpoint: AccountService.getUsername()==null ? ConfigurationService.getPublicSPARQLEndpoint() : ConfigurationService.getSPARQLEndpoint(),
        graph: $scope.importSparql.graph.replace(':',ConfigurationService.getUriBase()), 
        uriBase : ConfigurationService.getUriBase(),
        username : AccountService.getUsername()
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

  $scope.$watch( function () { return AccountService.getUsername(); }, function () {
    $scope.refreshGraphList();
  });

};



/*
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
*/

