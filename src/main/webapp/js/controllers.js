'use strict';

function SettingsMenuCtrl($scope, AccountService) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
  	{ name: "Data Sources", route:'#/settings/data-sources', url:'/settings/data-sources', admin: false },
  	{ name: "Datasets", route:'#/settings/datasets', url:'/settings/datasets', admin: false },
    // { name: "Namespaces", route:'#/settings/namespaces', url:'/settings/namespaces' },
  	{ name: "Components", route:'#/settings/components', url:'/settings/components', admin: false },
    { name: "Users", route:'#/settings/users', url:'/settings/users', admin: true },
    { name: "Thesaurus Management", route:'#/settings/ontology', url:'/settings/ontology', admin: false }
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

function StackMenuCtrl($scope, ConfigurationService) {
    var services = ConfigurationService.getComponentServices(":Solr");
	var solrServiceUrl = services[0].serviceUrl;

	var miniDixServices = ConfigurationService.getComponentServices(":MiniDix");
    var miniDixServiceUrl = miniDixServices[0].serviceUrl;
    var ontology = "http://acc.ontos.com/thesaurus/concept/v2/";

	  $scope.oneAtATime = true;
	  // these data can be replaced later with the configuration
	  $scope.groups = [
	    {
	      title: "Extraction and Loading",
	      id:"extraction-loading",
	      items: [
//	        {name: 'Import RDF data', route:'#/home/extraction-and-loading/import-rdf',  url:'/home/extraction-and-loading/import-rdf' },
//	        {name: 'Sparqlify Extraction', route:'#/home/extraction-and-loading/sparqlify', url:'/home/extraction-and-loading/sparqlify' },
//	        {name: 'TripleGeo Extraction', route:'#/home/extraction-and-loading/triplegeo', url:'/home/extraction-and-loading/triplegeo' },
//	        {name: 'D2RQ Extraction', route:'#/home/extraction-and-loading/d2rq', url:'/home/extraction-and-loading/d2rq' },
            {name: 'Upload new Files', route:'#/home/extraction-and-loading/upload-file', url:'/home/extraction-and-loading/upload-file' }]
	    },
	    /*
	    {
		      title: "Storage and Querying",
		      id:"storage-querying",
		      items: [
		       {name: 'Virtuoso', route:'#/home/querying-and-exploration/virtuoso', url:'/home/querying-and-exploration/virtuoso' }]
		    },
		    */
	    {
	      title: "Authoring",
	      id:"authoring",
	      items: [
//	       {name: 'OntoWiki', route:'#/home/authoring/ontowiki', url:'/home/authoring/ontowiki' },
//	       {name: "Thesaurus Management", route:'#/home/authoring/ontology', url:'/home/authoring/ontology' },
	       {name: "Thesaurus Management", route:null, url:miniDixServiceUrl + "/?ontology=" + ontology + "&newConceptsOntology=" + ontology + "&writableOntologies=" + ontology + "&locale=en", modaltitle:'MiniDix' },
	       {name: "Edit Uploads", route:'#/home/authoring/edit-uploads', url:'/home/authoring/edit-uploads' }]
	    },
	    /*
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
		  */
		{
		      title: "Exploration",
		      id:"querying-exploration",
		      items: [
//		       {name: 'Facete', route:'#/home/querying-and-exploration/facete', url:'/home/querying-and-exploration/facete' },
//		       {name: 'Mappify', route:'#/home/querying-and-exploration/mappify', url:'/home/querying-and-exploration/mappify' },
//               {name: 'Search', route:'#/home/querying-and-exploration/search', url:'/home/querying-and-exploration/search' },
               {name: 'Search', route:null, url:solrServiceUrl+'/collection1/custom', modaltitle:'Faceted Search' }]
		    }
	  ];

	  $scope.url=null;
	  $scope.setDirectUrl = function(url) {
	    $scope.url = url;
	  };

	  $scope.close = function(modalID) {
	    $(modalID).modal('hide');
        $('body').removeClass('modal-open');
      	$('.modal-backdrop').slideUp();
      	$('.modal-scrollable').slideUp();
      };

      $scope.setModalTitle = function(title) {
        $scope.modaltitle = title;
      };

	}

function D2RQMenuCtrl($scope, $routeSegment) {
    $scope.items = [
  	    { name: "Mappings", route:'#/home/extraction-and-loading/d2rq/mapping', id:'mapping' },
        { name: "Tasks", route:'#/home/extraction-and-loading/d2rq/task', id:'task' }
    ];

    $scope.isActive = function(id) {
        return $routeSegment.contains(id);
    };
}

function LoginCtrl($scope, flash, AccountService, LoginService, ServerErrorResponse, Base64) {
    $scope.currentAccount = angular.copy(AccountService.getAccount());
    $scope.loggedIn = false;
    if($scope.currentAccount.user != null){
    	LoginService.login($scope.currentAccount.user, $scope.currentAccount.pass)
        .then(function(data) {
            $scope.currentAccount = angular.copy(AccountService.getAccount());
            $scope.close('#modalLogin');
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
                $scope.close('#modalLogin');
                $scope.login.username = null;
                $scope.login.password = null;
                if($scope.currentAccount.user != null){
                	$scope.loggedIn = true;
                }
            }, function(response) {
                flash.error = ServerErrorResponse.getMessage(response.status);
                $scope.login.username = null;
                $scope.login.password = null;
                $scope.loggedIn = false;
            });
    };
    
    $scope.close = function(modalID) {
    	$(modalID).modal('hide');
        $('body').removeClass('modal-open');
      	$('.modal-backdrop').slideUp();
      	$('.modal-scrollable').slideUp();
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
            	$scope.close('#modalSignUp');
                flash.success = response.data.message;
            }, function(response) {
            	$scope.close('#modalSignUp');
                flash.error = ServerErrorResponse.getMessage(response.status);
            });
    };

    $scope.restorePassword = function() {
        LoginService.restorePassword($scope.restorePassword.username)
            .then(function(response) {
            	$scope.close('#modalRestorePassword');
                flash.success = response.data.message;
            }, function(response) {
            	$scope.close('#modalRestorePassword');
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
                $scope.close('#modalChangePassword');
                flash.success = response.data.message;
            }, function(response) {
                $scope.close('#modalChangePassword');
                flash.error = ServerErrorResponse.getMessage(response.status);
            });
    };

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
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

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };
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

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
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

app.controller('FaceteFormCtrl', function($scope, ConfigurationService, GraphService, AccountService) {
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

/****************************************************************************************************
*
* Ontologies Controller
*
***************************************************************************************************/
var OntologyCtrl = function($scope, $http, flash, ServerErrorResponse, AccountService, OntologyService, ConfigurationService) {
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
        {value:'file', label:'File'},
    	{value:'url', label:'URL'},
    ];
    var type = '';

    $scope.fileElements = false;
    $scope.urlElements = false;

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
                $('#modalOntology').modal('hide');
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
                $('#modalOntology').modal('hide');
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
	    $scope.url= miniDixServiceUrl + "/?ontology=" + ontology + "&newConceptsOntology=" + ontology + "&writableOntologies=" + ontology + "&locale=en";
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

/****************************************************************************************************
*
* D2RQ Controllers
*
***************************************************************************************************/
var D2RQTaskCtrl = function($scope, $http, $q, flash, ServerErrorResponse, AccountService, GraphService, ConfigurationService, D2RQService) {
    var services = ConfigurationService.getComponentServices(":D2RQ");
	var d2rqServiceUrl = services[0].serviceUrl;

    $scope.tasks = D2RQService.getAllTasks();

    $scope.refreshTasks = function() {
        return D2RQService.refreshTasks().then(function(response) {
            $scope.tasks = D2RQService.getAllTasks();
        });
    };

    $scope.mappings = [];
    $scope.datasets = [];

    $scope.namedgraphs = [];

    var readDatasets = function() {
        return $http.get(d2rqServiceUrl+"/datasets/metadata/get")
            .then(function(response) {
                $scope.datasets = response.data;
            });
    };

    var adding = false;

    $scope.isAdding = function() {
        return adding;
    };

    var emptyTask = {name:"", mapping:null, dataset:null, namedgraph:null};

    $scope.task = angular.copy(emptyTask);

    $scope.new = function() {
        $scope.taskForm.$setPristine();
        $scope.task = angular.copy(emptyTask);
        adding = false;
        $http.get(d2rqServiceUrl+"/mappings/groups/metadata/get")
            .then(function(response) {
                $scope.mappings = response.data;
            });
        readDatasets();
        GraphService.getAccessibleGraphs(true, false, true).then(function(result) {
            $scope.namedgraphs = result;
        });
    };

    var createDataset = function() {
        var data = {name: $scope.task.namedgraph.graph.label
                    , graph: $scope.task.namedgraph.name.replace(':',ConfigurationService.getUriBase())
                    , httpEndpoint: $scope.task.namedgraph.graph.endpoint
                    , ontology: $scope.task.mapping.ontology
                    , readonly: false
                    , owner: AccountService.getUsername()}; //todo unauthorized user
        return $http({
            url: d2rqServiceUrl+"/datasets/add",
            method: "POST",
            data: data,
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        });
    };

    var findDataset = function(ontology, endpoint, graph) {
        for (var ind in $scope.datasets) {
            var ds = $scope.datasets[ind];
            if (ds.graph==graph && ds.httpEndpoint==endpoint && ds.ontology==ontology)
                return ds;
        }
        return null;
    };

    var findOrCreateDataset = function(ontology, endpoint, graph) {
        var ds = findDataset(ontology, endpoint, graph);
        if (ds!=null) {
            var deferred = $q.defer();
            deferred.resolve(ds);
            return deferred.promise;
        } else {
            return createDataset().then(function(response) {
                return readDatasets().then(function(response) {
                    return findDataset(ontology, endpoint, graph);
                });
            });
        }
    };

    $scope.add = function() {
        adding = true;
        findOrCreateDataset($scope.task.mapping.ontology, $scope.task.namedgraph.graph.endpoint, $scope.task.namedgraph.name.replace(':',ConfigurationService.getUriBase()))
            .then(function(ds) {
                $scope.task.dataset = ds;
                var data = {name: $scope.task.name
                            , compositeMapping: $scope.task.mapping.id
                            , dataset: $scope.task.dataset.id
                            , user: AccountService.getUsername()}; //todo unauthorized user
                $http({
                    url: d2rqServiceUrl+"/tasks/add",
                    method: "POST",
                    data: data,
                    dataType: "json",
                    headers: {"Content-Type":"application/json; charset=utf-8"}
                }).then(function(response) {
                    $scope.refreshTasks().then(function(response) {
                        $('#modalTask').modal('hide');
                        adding = false;
                    });
                }, function(response) {
                    flash.error = ServerErrorResponse.getMessage(response.status);
                    $('#modalTask').modal('hide');
                });
            });
    };

    $scope.delete = function(id) {
        $http({
            url: d2rqServiceUrl+"/tasks/" + id + "/delete",
            method: "POST",
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            $scope.refreshTasks();
        }, function(response) {
            flash.error = ServerErrorResponse.getMessage(response.status);
            $scope.refreshTasks();
        });
    };

    $scope.execute = function(id) {
        var data = {
            targetUrl: d2rqServiceUrl+"/tasks/" + id + "/execute",
            user: AccountService.getUsername()
        };
        $http({
            url: "ExecuteD2RQTaskServlet",
            method: "POST",
            dataType: "json",
            params: data,
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            $scope.refreshTasks();
        }, function(response) {
            flash.error = ServerErrorResponse.getMessage(response.status);
            $scope.refreshTasks();
        });
    };

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };
};

var D2RQMappingCtrl = function($scope, $http, $q, flash, ServerErrorResponse, AccountService, ConfigurationService, D2RQService) {
    var services = ConfigurationService.getComponentServices(":D2RQ");
	var d2rqServiceUrl = services[0].serviceUrl;

    var supportedDatabases = ["MySQL", "PostgreSQL", "HSQL", "Oracle", "MicrosoftSQLServer"];

    //mapping groups

    $scope.mgroups = D2RQService.getAllMappingGroups();

    $scope.refreshMappingGroups = function() {
        return D2RQService.refreshMappingGroups().then(function(response) {
            $scope.mgroups = D2RQService.getAllMappingGroups();
        });
    };

    var adding = false;

    $scope.isAdding = function() {
        return adding;
    };

    $scope.databases = ConfigurationService.getAllDatabases();

    $scope.dbFilter = function(database) {
        return supportedDatabases.indexOf(database.dbType) > -1;
    };

    $scope.datasources = []; //data groups
    $scope.ontologies = [];

    $scope.updateConnection = function() {
        if ($scope.mgroup.database.dbType=="MySQL") {
            $scope.mgroup.connection = "jdbc:mysql://" + $scope.mgroup.database.dbUser + ":" + $scope.mgroup.database.dbPassword
                                            + "@" + $scope.mgroup.database.dbHost + ":" + $scope.mgroup.database.dbPort
                                            + "/" + $scope.mgroup.database.dbName;
        } else if ($scope.mgroup.database.dbType=="PostgreSQL") {
            $scope.mgroup.connection = "jdbc:postgresql://" + $scope.mgroup.database.dbUser + ":" + $scope.mgroup.database.dbPassword
                                            + "@" + $scope.mgroup.database.dbHost + ":" + $scope.mgroup.database.dbPort
                                            + "/" + $scope.mgroup.database.dbName;
        } else if ($scope.mgroup.database.dbType=="HSQL") {
            $scope.mgroup.connection = "jdbc:hsqldb:hsql://" + $scope.mgroup.database.dbUser + ":" + $scope.mgroup.database.dbPassword
                                            + "@" + $scope.mgroup.database.dbHost + ":" + $scope.mgroup.database.dbPort
                                            + "/" + $scope.mgroup.database.dbName;
        } else if ($scope.mgroup.database.dbType=="Oracle") {
            $scope.mgroup.connection = "jdbc:oracle:thin://" + $scope.mgroup.database.dbUser + ":" + $scope.mgroup.database.dbPassword
                                            + "@" + $scope.mgroup.database.dbHost + ":" + $scope.mgroup.database.dbPort
                                            + "/" + $scope.mgroup.database.dbName;
        } else if ($scope.mgroup.database.dbType=="MicrosoftSQLServer") {
            $scope.mgroup.connection = "jdbc:jtds:sqlserver://" + $scope.mgroup.database.dbUser + ":" + $scope.mgroup.database.dbPassword
                                            + "@" + $scope.mgroup.database.dbHost + ":" + $scope.mgroup.database.dbPort
                                            + ";" + $scope.mgroup.database.dbName;
        }
    };

    var readDatasources = function() {
        return $http.get(d2rqServiceUrl+"/data/groups/metadata/get")
            .then(function(response) {
                $scope.datasources = response.data;
            });
    };

    var emptyMappingGroup = {name:"", ontology:null, source:null, connection:"", database:null};

    $scope.mgroup = angular.copy(emptyMappingGroup);

    $scope.newMappingGroup = function() {
        $scope.mappingGroupForm.$setPristine();
        $scope.mgroup = angular.copy(emptyMappingGroup);
        $scope.ontologies = [];
        $scope.datasources = [];
        adding = false;
        $http.get(d2rqServiceUrl+"/ontologies/metadata/get")
            .then(function(response) {
                $scope.ontologies = response.data;
            });
        readDatasources();
    };

    var findDatasource = function(conn) {
        for (var ind in $scope.datasources) {
            var ds = $scope.datasources[ind];
            if (ds.dbConnection==conn)
                return ds;
        }
        return null;
    };

    var createDatasource = function() {
        var data = {name: $scope.mgroup.database.label
                    , connection: $scope.mgroup.connection
                    , tables: []
                    , user: AccountService.getUsername()}; //todo unauthorized user
        return $http({
            url: d2rqServiceUrl+"/data/groups/add",
            method: "POST",
            data: data,
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        });
    };

    var findOrCreateDatasource = function(conn) {
        var ds = findDatasource(conn);
        if (ds==null) {
            return createDatasource().then(function(response) {
                return readDatasources().then(function(response) {
                    return findDatasource(conn);
                });
            });
        } else {
            var deferred = $q.defer();
            deferred.resolve(ds);
            return deferred.promise;
        }
    };

    $scope.addMappingGroup = function() {
        adding = true;
        findOrCreateDatasource($scope.mgroup.connection).then(function(ds) {
            $scope.mgroup.source = ds;
            var data = {name: $scope.mgroup.name
                        , ontology: $scope.mgroup.ontology.uri
                        , compositeData: $scope.mgroup.source.id
                        , user: AccountService.getUsername()}; //todo unauthorized user
            $http({
                url: d2rqServiceUrl+"/mappings/groups/add",
                method: "POST",
                data: data,
                dataType: "json",
                headers: {"Content-Type":"application/json; charset=utf-8"}
            }).then(function(response) {
                $scope.refreshMappingGroups().then(function(response) {
                    $('#modalMappingGroup').modal('hide');
                    adding = false;
                });
            }, function(response) {
                $('#modalMappingGroup').modal('hide');
                flash.error = ServerErrorResponse.getMessage(response.status);
            });
        });
    };

    $scope.deleteMappingGroup = function(id) {
        $http({
            url: d2rqServiceUrl+"/mappings/groups/" + id + "/delete",
            method: "POST",
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            $scope.refreshMappingGroups();
        }, function(response) {
            flash.error = ServerErrorResponse.getMessage(response.status);
            $scope.refreshMappingGroups();
        });
    };

    $scope.actualizeMappingGroup = function(id) {
        $http({
            url: d2rqServiceUrl+"/mappings/groups/" + id + "/actualize",
            method: "POST",
            data: {user: AccountService.getUsername()},
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            $scope.refreshMappingGroups();
        }, function(response) {
            flash.error = ServerErrorResponse.getMessage(response.status);
            $scope.refreshMappingGroups();
        });
    };

    //mappings

    $scope.modaltitle = "";

    $scope.datasource = null; //data source group object
    $scope.ontologyClasses = []; //array of objects

    $scope.patternTypes = [
        {value:'uriColumn', label:'URI Column'},
    	{value:'patternColumns', label:'Pattern Columns'},
    ];

    $scope.joinConditionTypes = [
        {value:'fk', label:'Foreign Key'},
        {value:'linkingTable', label:'Linking Table'},
    ];

    var table2columns = {}; //property - table name, value - columns list

    $scope.tables = [];

    $scope.tableColumns = []; // array of string

    var updatePropertiesColumns = function() {
        for (var ind in $scope.mapping.dataProperties) {
            var dp = $scope.mapping.dataProperties[ind];
            if ($scope.tableColumns.indexOf(dp.column)==-1) dp.column = null;
        }
        for (var ind in $scope.mapping.objectProperties) {
            var op = $scope.mapping.objectProperties[ind];
            if ($scope.tableColumns.indexOf(op.column)==-1) op.column = null;
            op.join.table1 = $scope.mapping.table;
            if ($scope.tableColumns.indexOf(op.join.table1column)==-1) op.join.table1column = null;
        }
    };

    $scope.updateColumns = function() {
        if ($scope.tableColumns[$scope.mapping.table] != undefined) {
            $scope.tableColumns = $scope.tableColumns[$scope.mapping.table];
            updatePropertiesColumns();
            return;
        }
        $http({
            url: d2rqServiceUrl+"/database/columns/get",
            method: "GET",
            params: {connection: $scope.datasource.dbConnection, table: $scope.mapping.table},
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            var result = response.data;
            var columns = []
            for (var ind in result) {
                columns.push(result[ind].column);
            }
            $scope.tableColumns = columns;
            $scope.tableColumns[$scope.mapping.table] = columns;
            updatePropertiesColumns();
        }, function(response) {
        //todo
        });
    };

    $scope.updateLinkingTable = function(property) {
        if ($scope.tableColumns[property.join.linkingTable] != undefined) {
            property.join.linkingTableStructure = $scope.tableColumns[property.join.linkingTable];
            if (property.join.linkingTableStructure.indexOf(property.join.linkingTableColumn1)==-1) property.join.linkingTableColumn1 = null;
            if (property.join.linkingTableStructure.indexOf(property.join.linkingTableColumn2)==-1) property.join.linkingTableColumn2 = null;
            return;
        }
        $http({
            url: d2rqServiceUrl+"/database/columns/get",
            method: "GET",
            params: {connection: $scope.datasource.dbConnection, table: property.join.linkingTable},
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            var result = response.data;
            var columns = [];
            for (var ind in result) {
                columns.push(result[ind].column);
            }
            $scope.tableColumns[$scope.mapping.table] = columns;
            property.join.linkingTableStructure = columns;
            if (property.join.linkingTableStructure.indexOf(property.join.linkingTableColumn1)==-1) property.join.linkingTableColumn1 = null;
            if (property.join.linkingTableStructure.indexOf(property.join.linkingTableColumn2)==-1) property.join.linkingTableColumn2 = null;
        }, function(response) {
        //todo
        });
    };

    $scope.updateRefTable = function(property) {
        property.join.table2 = property.ref.classMappingTable.table;
    };

    $scope.togglePatternColumn = function(column) {
        var index = $scope.mapping.patternColumns.indexOf(column);
        if (index > -1) { // is currently selected
            $scope.mapping.patternColumns.splice(index, 1);
        } else { // is newly selected
            $scope.mapping.patternColumns.push(column);
        }
    };

    $scope.objectPropMappingTypes = [
        {value:"column", label:"URI Column"},
        {value:"ref", label:"Mapping Reference"}
    ];

    var emptyDataProperty = {id: 0
                             , property: null //ontology class property object
                             , column: null //column name (string)
    };
    var emptyJoinConditions = {type:"", table1:"", table2:"", linkingTable:"", table1column:"", table2column:"", linkingTableColumn1:"", linkingTableColumn2:""};
    var emptyObjectProperty = {id: 0
                                , property: null //ontology class property object
                                , mappingType:"" //string ($scope.objectPropMappingTypes)
                                , column: null //string
                                , ref:null //mapping object
                                , join:angular.copy(emptyJoinConditions)
    };
    var emptyMapping = {name:""
                        , group: null //mapping group object
                        , source: null //data source object
                        , class: null //ontology class object
                        , ptype:"" //pattern type ($scope.patternTypes)
                        , uriColumn:"" //column name (string)
                        , patternColumns:[] //array of column names (strings)
                        , dataProperties: []
                        , objectProperties: []
    };
    emptyMapping.dataProperties.push(angular.copy(emptyDataProperty));
    emptyMapping.objectProperties.push(angular.copy(emptyObjectProperty));

    $scope.mapping = angular.copy(emptyMapping);

    $scope.isNew = false;

    $scope.newMapping = function(mappingGroup) {
        $scope.modaltitle = "New mapping";

        $scope.isNew = true;

        adding = false;

        $scope.mappingForm.$setPristine();
        $scope.mapping = angular.copy(emptyMapping);

        $scope.ontologyClasses = [];
        $scope.tables = [];
        $scope.tableColumns = [];

        $scope.mapping.group = mappingGroup;

        $http.get(d2rqServiceUrl+"/data/groups/" + mappingGroup.compositeData + "/metadata/get")
            .then(function(response) {
                $scope.datasource = response.data;

                //get tables
                $http({
                    url: d2rqServiceUrl+"/database/tables/get",
                    method: "GET",
                    params: {connection: $scope.datasource.dbConnection},
                    dataType: "json",
                    headers: {"Content-Type":"application/json; charset=utf-8"}
                }).then(function(response) {
                    var result = response.data;
                    $scope.tables = [];
                    for (var ind in result) {
                        $scope.tables.push(result[ind].table);
                    }
                });

                //get tables structure
                for (var ind in $scope.mapping.group.mappings) {
                    setTableStructure($scope.mapping.group.mappings[ind], $scope.datasource.dbConnection);
                }
            }, function(response) {
                $scope.datasource = {data:[]};
            });

        $http.get(d2rqServiceUrl+"/ontologies/" + mappingGroup.ontology + "/classes/mappingscheme/get")
            .then(function(response) {
                $scope.ontologyClasses = response.data;
            }, function(response) {
                //todo
            });
    };

    var setTableStructure = function(mapping, dbConnection) {
        $http({
            url: d2rqServiceUrl+"/database/columns/get",
            method: "GET",
            params: {connection: dbConnection, table: mapping.classMappingTable.table},
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            var result = response.data;
            mapping.dataStructure = [];
            for (var ci in result)
                mapping.dataStructure.push(result[ci].column);
        }, function(response) {
            mapping.dataStructure = [];
        });
    };

    $scope.editMapping = function(mapping, mappingGroup) {
        $scope.modaltitle = "Edit mapping";

        $scope.isNew = false;

        $scope.mappingForm.$setPristine();

        $scope.mapping = angular.copy(emptyMapping);

        $scope.mapping.id = mapping.id;
        $scope.mapping.name = mapping.name;
        $scope.mapping.group = mappingGroup;

        var dataRequest = $http.get(d2rqServiceUrl+"/data/groups/" + mappingGroup.compositeData + "/metadata/get")
            .then(function(response) {
                $scope.datasource = response.data;

                //get tables
                $http({
                    url: d2rqServiceUrl+"/database/tables/get",
                    method: "GET",
                    params: {connection: $scope.datasource.dbConnection},
                    dataType: "json",
                    headers: {"Content-Type":"application/json; charset=utf-8"}
                }).then(function(response) {
                    var result = response.data;
                    $scope.tables = [];
                    for (var ind in result) {
                        $scope.tables.push(result[ind].table);
                    }
                });

                //get table structure
                for (var ind in $scope.mapping.group.mappings) {
                    setTableStructure($scope.mapping.group.mappings[ind], $scope.datasource.dbConnection);
                }

                //set mapping data source
                for (var ind in $scope.datasource.data) {
                    if ($scope.datasource.data[ind].id==mapping.data) {
                        $scope.mapping.source = $scope.datasource.data[ind];
                        $scope.mapping.table = $scope.mapping.source.table;
                        $scope.updateColumns();
                        break;
                    }
                }
            }, function(response) {
                $scope.datasource = {data:[]};
            });

        var ontoRequest = $http.get(d2rqServiceUrl+"/ontologies/" + mappingGroup.ontology + "/classes/mappingscheme/get")
            .then(function(response) {
                $scope.ontologyClasses = response.data;
                //set mapping class
                for (var ind in $scope.ontologyClasses) {
                    if ($scope.ontologyClasses[ind].uri==mapping.classMappingTable.uri) {
                        $scope.mapping.class = $scope.ontologyClasses[ind];
                        break;
                    }
                }
                //data properties
                var id = 0;
                $scope.mapping.dataProperties = [];
                for (var ind in mapping.classMappingTable.dataProperties) {
                    var dp = mapping.classMappingTable.dataProperties[ind];
                    for (var pi in $scope.mapping.class.properties) {
                        if ($scope.mapping.class.properties[pi].uri == dp.uri) {
                            $scope.mapping.dataProperties.push({id: id, property: $scope.mapping.class.properties[pi], column: dp.tableColumn.second});
                            break;
                        }
                    }
                    id = id+1;
                }
                if ($scope.mapping.dataProperties.length==0) $scope.mapping.dataProperties.push(angular.copy(emptyDataProperty));
                //object properties
                id = 0;
                $scope.mapping.objectProperties = [];
                for (var ind in mapping.classMappingTable.objectProperties) {
                    var op = mapping.classMappingTable.objectProperties[ind];
                    var property = null;
                    for (var pi in $scope.mapping.class.properties) {
                        if ($scope.mapping.class.properties[pi].uri == op.uri) {
                            property = $scope.mapping.class.properties[pi];
                            break;
                        }
                    }
                    var ref = null;
                    if (op.refersMappingId!=null) {
                        for (var mi in $scope.mapping.group.mappings) {
                            if ($scope.mapping.group.mappings[mi].id==op.refersMappingId) {
                                ref = $scope.mapping.group.mappings[mi];
                                break;
                            }
                        }
                    }
                    var joinConditions = angular.copy(emptyJoinConditions);
                    joinConditions.table1 = mapping.classMappingTable.table;
                    joinConditions.table2 = ref==null ? null : ref.classMappingTable.table;
                    if (op.tableJoinConditions!=null) {
                        if (op.tableJoinConditions.length==1) {
                            joinConditions.type = "fk";
                            joinConditions.table1column = op.tableJoinConditions[0].columns[0].first;
                            joinConditions.table2column = op.tableJoinConditions[0].columns[0].second;
                        } else if (op.tableJoinConditions.length==2) {
                            joinConditions.type = "linkingTable";
                            if (op.tableJoinConditions[0].table1==joinConditions.table1) {
                                joinConditions.linkingTable = op.tableJoinConditions[0].table2;
                                joinConditions.table1column = op.tableJoinConditions[0].columns[0].first;
                                joinConditions.linkingTableColumn1 = op.tableJoinConditions[0].columns[0].second;
                                joinConditions.linkingTableColumn2 = op.tableJoinConditions[1].columns[0].first;
                                joinConditions.table2column = op.tableJoinConditions[1].columns[0].second;
                            } else if (op.tableJoinConditions[1].table1==joinConditions.table1) {
                                joinConditions.linkingTable = op.tableJoinConditions[1].table2;
                                joinConditions.table1column = op.tableJoinConditions[1].columns[0].first;
                                joinConditions.linkingTableColumn1 = op.tableJoinConditions[1].columns[0].second;
                                joinConditions.linkingTableColumn2 = op.tableJoinConditions[0].columns[0].first;
                                joinConditions.table2column = op.tableJoinConditions[0].columns[0].second;
                            }
                        }
                    }
                    var mappingObjectProp = {id: id, property: property, mappingType: op.uriColumn==null ? "ref" : "column",
                                                column: op.uriColumn==null ? null : op.uriColumn.second, ref: ref, join: joinConditions};
                    $scope.mapping.objectProperties.push(mappingObjectProp);
                    id = id+1;
                }
                if ($scope.mapping.objectProperties.length==0) {
                    $scope.mapping.objectProperties.push(angular.copy(emptyObjectProperty));
                    $scope.mapping.objectProperties[0].join.table1 = mapping.classMappingTable.table;
                }
            }, function(response) {
                //todo
            });

        $q.all([dataRequest, ontoRequest]).then(function(values) {
            for (var ind in $scope.mapping.objectProperties) {
                if ($scope.mapping.objectProperties[ind].join.type=="linkingTable") {
                    $scope.updateLinkingTable($scope.mapping.objectProperties[ind]);
                }
            }
        });

        $scope.mapping.ptype = mapping.classMappingTable.uriColumn==null ? "patternColumns" : "uriColumn";
        $scope.mapping.uriColumn = mapping.classMappingTable.uriColumn;
        $scope.mapping.patternColumns = mapping.classMappingTable.patternColumns==null ? [] : mapping.classMappingTable.patternColumns;
    };

    $scope.updateProperties = function() { //todo compare by uri
        var classProps = $scope.mapping.class.properties;
        for (var ind in $scope.mapping.dataProperties) {
            var dp = $scope.mapping.dataProperties[ind];
            if (classProps.indexOf(dp.property)==-1)
                dp.property = null;
        }
        for (var ind in $scope.mapping.objectProperties) {
            var op = $scope.mapping.objectProperties[ind];
            if (classProps.indexOf(op.property)==-1)
                op.property = null;
        }
    };

    $scope.isDataProperty = function(property) {
        return property.propertyType=="ANNOTATION_PROPERTY" || property.propertyType=="DATA_PROPERTY";
    };

    $scope.isObjectProperty = function(property) {
        return property.propertyType=="OBJECT_PROPERTY";
    };

    $scope.showAddDataProp = function(prop) {
        return prop.id===$scope.mapping.dataProperties[$scope.mapping.dataProperties.length-1].id;
    };

    $scope.showAddObjectProp = function(prop) {
        return prop.id===$scope.mapping.objectProperties[$scope.mapping.objectProperties.length-1].id;
    };

    $scope.addNewDataProperty = function() {
        var id = $scope.mapping.dataProperties[$scope.mapping.dataProperties.length-1].id+1;
        $scope.mapping.dataProperties.push({id: id, property: null, column: null});
    };

    $scope.addNewObjectProperty = function() {
        var id = $scope.mapping.objectProperties[$scope.mapping.objectProperties.length-1].id+1;
        $scope.mapping.objectProperties.push({id: id, property: null, mappingType:"", column: null, ref:null});
    };

    $scope.removeDataProperty = function(prop) {
        var index = $scope.mapping.dataProperties.indexOf(prop);
        $scope.mapping.dataProperties.splice(index, 1);
        if ($scope.mapping.dataProperties.length==0) $scope.mapping.dataProperties.push(angular.copy(emptyDataProperty));
    };

    $scope.removeObjectProperty = function(prop) {
        var index = $scope.mapping.objectProperties.indexOf(prop);
        $scope.mapping.objectProperties.splice(index, 1);
        if ($scope.mapping.objectProperties.length==0) {
            var emptyProp = angular.copy(emptyObjectProperty);
            emptyProp.join.table1 = $scope.mapping.table;
            $scope.mapping.objectProperties.push(emptyProp);
        }
    };

    var findData = function(table) {
        for (var ind in $scope.datasource.data) {
            var d = $scope.datasource.data[ind];
            if (d.table==table)
                return d;
        }
        return null;
    };

    var createData = function(table) {
        var data = {
            tables: [table],
            groupId: $scope.datasource.id,
            user: AccountService.getUsername()
        };
        return $http({
                url: d2rqServiceUrl+"/data/add",
                method: "POST",
                dataType: "json",
                data: data,
                headers: {"Content-Type":"application/json; charset=utf-8"}
            });
    };

    var findOrCreateData = function(table) {
        var d = findData(table);
        if (d==null) {
            return createData(table).then(function(response) {
                return $http.get(d2rqServiceUrl+"/data/groups/" + $scope.datasource.id + "/metadata/get").then(function(response) {
                    $scope.datasource = response.data;
                    return findData(table);
                });
            });
        } else {
            var deferred = $q.defer();
            deferred.resolve(d);
            return deferred.promise;
        }
    };

    $scope.save = function() {
        adding = true;
        var mappingTable = {
            table: $scope.mapping.table
            , uri: $scope.mapping.class.uri
            , patternColumns: null
            , uriColumn: null
            , dataProperties: []
            , objectProperties: []
            , blankNode: false
        };
        if ($scope.mapping.ptype=="uriColumn")
            mappingTable.uriColumn = $scope.mapping.uriColumn;
        else if ($scope.mapping.ptype=="patternColumns")
            mappingTable.patternColumns = $scope.mapping.patternColumns;
        for (var ind in $scope.mapping.dataProperties) {
            var dp = $scope.mapping.dataProperties[ind];
            if (dp.property!=null && dp.column!=null) {
                mappingTable.dataProperties.push({
                    uri: dp.property.uri,
                    tableColumn: {first: $scope.mapping.table, second: dp.column}
                });
            }
        }
        for (var ind in $scope.mapping.objectProperties) {
            var op = $scope.mapping.objectProperties[ind];
            if (op.property!=null) {
                if (op.mappingType=="column" && op.column!=null) {
                    mappingTable.objectProperties.push({
                        uri: op.property.uri
                        , uriColumn: {first: $scope.mapping.table, second: op.column}
                    });
                } else if (op.mappingType=="ref" && op.ref!=null) {
                    var p = {uri: op.property.uri
                                , refersMappingId: op.ref.id
                                , range: "http://www.w3.org/2002/07/owl#Thing" //range is not really used in d2rq mapping generation (in case of mapping reference) byt must be not null
                                , tableJoinConditions: []
                    };
                    if (op.join.table1column!=null && op.join.table1column!="" && op.join.table2column!=null && op.join.table2column!="") {
                        if (op.join.linkingTable==null || op.join.linkingTable=="") {
                            var joinCondRes = {table1:op.join.table1, table2:op.join.table2, columns:[{first:op.join.table1column, second:op.join.table2column}], type:"EQ"};
                            p.tableJoinConditions.push(joinCondRes);
                        } else {
                            if (op.join.linkingTableColumn1!=null && op.join.linkingTableColumn1!="" && op.join.linkingTableColumn2!=null && op.join.linkingTableColumn2!="") {
                                var joinCondRes1 = {table1:op.join.table1, table2:op.join.linkingTable, columns:[{first:op.join.table1column, second:op.join.linkingTableColumn1}], type:"EQ"};
                                var joinCondRes2 = {table1:op.join.linkingTable, table2:op.join.table2, columns:[{first:op.join.linkingTableColumn2, second:op.join.table2column}], type:"EQ"};
                                p.tableJoinConditions.push(joinCondRes1);
                                p.tableJoinConditions.push(joinCondRes2);
                            }
                        }
                    }
                    mappingTable.objectProperties.push(p);
                }
            }
        }

        if ($scope.isNew) {
            findOrCreateData(mappingTable.table).then(function(sd) {
                $scope.mapping.source = sd;
                var data = {
                    name: $scope.mapping.name
                    , mappingTable: mappingTable
                    , data: $scope.mapping.source.id
                    , user: AccountService.getUsername()
                    , compositeMapping: $scope.mapping.group.id
                };

                $http({
                    url: d2rqServiceUrl+"/mappings/add",
                    method: "POST",
                    dataType: "json",
                    data: data,
                    headers: {"Content-Type":"application/json; charset=utf-8"}
                }).then(function(response) {
                    $scope.refreshMappingGroups().then(function(response) {
                        $('#modalMapping').modal('hide');
                        adding = false;
                    });
                }, function(response) {
                    $('#modalMapping').modal('hide');
                    flash.error = ServerErrorResponse.getMessage(response.status);
                });
            });
        } else {
            $http({
                url: d2rqServiceUrl+"/mappings/" + $scope.mapping.id + "/update",
                method: "POST",
                dataType: "json",
                data: {name: $scope.mapping.name, mappingTable: mappingTable},
                headers: {"Content-Type":"application/json; charset=utf-8"}
            }).then(function(response) {
                $scope.refreshMappingGroups().then(function(response) {
                    $('#modalMapping').modal('hide');
                    adding = false;
                });
            }, function(response) {
                $('#modalMapping').modal('hide');
                flash.error = ServerErrorResponse.getMessage(response.status);
            });
        }
    };

    $scope.deleteMapping = function(id) {
        $http.post(d2rqServiceUrl+"/mappings/" + id + "/delete")
            .then(function(response) {
                $scope.refreshMappingGroups();
            }, function(response) {
                flash.error = ServerErrorResponse.getMessage(response.status);
                $scope.refreshMappingGroups();
            });
    };

    $scope.notCurrent = function(mapping) {
        return $scope.isNew || mapping.id != $scope.mapping.id;
    };

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };
};

var UploadedDocsCtrl = function($scope, $http, flash, filterFilter, orderByFilter, DocumentsService, ServerErrorResponse, ConfigurationService) {
    $scope.documentTypes = DocumentsService.getDocumentTypes();
    $scope.documents = DocumentsService.getAllDocuments();
    $scope.projects = DocumentsService.getAllProjects();
    $scope.owners = DocumentsService.getAllOwners();

    $scope.showCreateProject = false;
    $scope.showCreateOwner = false;

    $scope.filteredDocuments = angular.copy($scope.documents);
    $scope.sortedDocuments = angular.copy($scope.documents);

    $scope.curPageNum = 1;
    $scope.itemsPerPage = 10;
    $scope.curPageDocs = [];
    $scope.totalDocs = $scope.filteredDocuments.length;

    var fillPage = function() {
        $scope.curPageDocs = [];
        for (var i = ($scope.curPageNum-1)*$scope.itemsPerPage; i < Math.min($scope.curPageNum*$scope.itemsPerPage, $scope.filteredDocuments.length); i++) {
            $scope.curPageDocs.push($scope.filteredDocuments[i]);
        }
    };

    fillPage();

    $scope.$watch('curPageNum', function() {
        fillPage();
    }, true);

    var documentsFilter = function(document) {
        if ($scope.searchText==undefined || $scope.searchText==null || $scope.searchText=="") return true;
        if ($scope.getDocumentId(document).indexOf($scope.searchText) > -1) return true;
        for (var ind in document.hasProject) {
            if (document.hasProject[ind].name.indexOf($scope.searchText) > -1) return true;
        }
        if (document.dateUploaded.indexOf($scope.searchText) > -1) return true;
        return false;
    };

    $scope.filter = function() {
        $scope.filteredDocuments = filterFilter($scope.sortedDocuments, documentsFilter);
        $scope.totalDocs = $scope.filteredDocuments.length;
        fillPage();
    };

    $scope.sort = function() {
        $scope.sortedDocuments = orderByFilter($scope.documents, $scope.sortPredicate, $scope.sortReverse);
        $scope.filter();
    };

    $scope.refreshDocuments = function() {
        DocumentsService.reloadDocuments().then(function(result) {
            $scope.documents = result;
            $scope.filteredDocuments = angular.copy($scope.documents);
            $scope.totalDocs = $scope.filteredDocuments.length;
            fillPage();
            $scope.projects = DocumentsService.getAllProjects();
            $scope.owners = DocumentsService.getAllOwners();
        });
    };

    $scope.edit = function(uri) {
        $scope.document = angular.copy(DocumentsService.getDocument(uri));
        for (var ind in $scope.owners) {
            if ($scope.owners[ind].uri==$scope.document.owner) {
                $scope.document.owner = $scope.owners[ind];
                break;
            }
        }
        $scope.newAssignedProject = null;
        $scope.newProjectName = null;
        $scope.newProjectNumber = null;
        $scope.newOwnerName = null;
        $scope.showCreateProject = false;
        $scope.showCreateOwner = false;
    };

    $scope.save = function() {
        DocumentsService.updateDocument($scope.document).then(function(response) {
            $scope.refreshDocuments();
            $('#modalDocument').modal('hide');
            flash.success = "Saved";
            //reindex document
            var services = ConfigurationService.getComponentServices(":SolrUploadProxy");
            var solrUploadServiceUrl = services[0].serviceUrl;
            $http.post(solrUploadServiceUrl+"/update/reindexDocument?uuid="+$scope.document.uuid)
                .then(function(response) {
                    console.log("Document " + $scope.document.uuid + " reindex completed");
                    console.log(response.data);
                }, function(response) {
                    console.log("Document " + $scope.document.uuid + " reindex failed");
                    console.log(response);
                });
        }, function(response) {
            $('#modalDocument').modal('hide');
            flash.error = ServerErrorResponse.getMessage(response.status);
        });
    };

    $scope.delete = function(id) {
        DocumentsService.deleteDocument(id).then(function(response) {
            $scope.refreshDocuments();
            console.log("Document " + id + " was deleted")
        }, function(response) {
            flash.error = ServerErrorResponse.getMessage(response.status);
        });
    };

    $scope.createOwner = function(name) {
        return {
            uri: "acc:owner_" + name.split(" ").join("_"),
            name: name,
            created: true
        };
    };

    $scope.ownerExists = function(ownerName) {
        for (var ind in $scope.owners) {
            if ($scope.owners[ind].name==ownerName) return true;
        }
        return false;
    };

    $scope.addNewOwner = function() {
        if ($scope.newOwnerName!=null && $scope.newOwnerName!="" && !$scope.ownerExists($scope.newOwnerName)) {
            var o = $scope.createOwner($scope.newOwnerName);
            //add to owners list
            $scope.owners.push(o);
            //change current document owner
            $scope.document.owner = o;
        };
        $scope.newOwnerName = null;
        $scope.showCreateOwner = false;
    };

    $scope.createProject = function(name, number) {
        return {
            uri: "acc:project_" + name.split(" ").join("_"),
            name: name,
            number: number,
            created: true
        };
    };

    $scope.projectExists = function(projectNumber) {
        for (var ind in $scope.projects) {
            if ($scope.projects[ind].number==projectNumber) return true;
        }
        return false;
    };

    $scope.addNewProject = function() {
        if ($scope.newProjectNumber && $scope.newProjectName && !$scope.projectExists($scope.newProjectNumber)) {
            var p = $scope.createProject($scope.newProjectName, $scope.newProjectNumber);
            //add to projects list
            $scope.projects.push(p);
            //assign to current document
            $scope.newAssignedProject = p;
            $scope.assignProject();
        }
        $scope.newProjectName = null;
        $scope.newProjectNumber = null;
        $scope.showCreateProject = false;
    };

    $scope.removeProject = function(project) {
        var index = $scope.document.hasProject.indexOf(project);
        if (index > -1) $scope.document.hasProject.splice(index, 1);
    };

    $scope.assignProject = function() {
        var project = $scope.newAssignedProject;
        if (project != null && $scope.document.hasProject.indexOf(project) == -1) {
            $scope.document.hasProject.push(project);
        }
        $scope.newAssignedProject = null;
    };

    $scope.notAssigned = function(project) {
        if ($scope.document==undefined) return true;
        for (var ind in $scope.document.hasProject) {
            if ($scope.document.hasProject[ind].uri==project.uri)
                return false;
        }
        return true;
    };

    $scope.getDocumentId = function(document) {
        return document.accDocumentNumber + "-" + document.accDocumentIteration;
    };

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };

    $scope.formatDateTime = function(dateStr) {
        //YYYY-MM-DD HH:MM
        var date = new Date();
        date.setTime(Date.parse(dateStr));
        var month = date.getMonth() + 1; // getMonth returns values from 0 to 11
        var s_date = date.getFullYear() + "-"
                        + (month.toString().length==1 ? "0"+ month : month) + "-"
                        + (date.getDate().toString().length==1 ? "0"+date.getDate() : date.getDate()) + " "
                        + date.getHours() + ":" + date.getMinutes();
        return s_date;
    };
};

var UploadDocCtrl = function($scope, $http, flash, ServerErrorResponse, ConfigurationService, DocumentsService, AccountService) {
    var services = ConfigurationService.getComponentServices(":SolrUploadProxy");
	var solrUploadServiceUrl = services[0].serviceUrl;

    $scope.projects = DocumentsService.getAllProjects();

    $scope.owners = [];
    var allOwners = DocumentsService.getAllOwners();
    for (var ind in allOwners) {
        $scope.owners.push(allOwners[ind].name);
    }

	$scope.documentTypes = DocumentsService.getDocumentTypes();

    $scope.uploading = false;

    $scope.onFileSelect = function($files) {
        $scope.fileList = $files;
    };

    $scope.upload = function() {
        $scope.uploading = true;
        for (var i = 0; i < $scope.fileList.length; i++) {
            var f = $scope.fileList[i];
            $http.uploadFile({
                    url: solrUploadServiceUrl + "/upload/files",
                    file: f,
                    data: $scope.document
                }).then(function(response) {
                    $scope.uploading = false;
                    flash.success = "Uploaded";
                }, function(response) {
                    $scope.uploading = false;
                    flash.error = ServerErrorResponse.getMessage(response.status);
                });
        }
    };

    $scope.isUploading = function() {
        return $scope.uploading;
    };

    $scope.addNewOwner = function() {
        if ($scope.newOwnerName!=null && $scope.newOwnerName!="" && $scope.owners.indexOf($scope.newOwnerName) == -1) {
            $scope.owners.push($scope.newOwnerName);
            $scope.document.ownerName = $scope.newOwnerName;
        }
        $scope.newOwnerName = null;
        $scope.showOwnerTextField = false;
    };

    $scope.projectExists = function(projectNumber) {
        for (var ind in $scope.projects) {
            if ($scope.projects[ind].number==projectNumber) return true;
        }
        return false;
    };

    $scope.addNewProject = function() {
        if ($scope.newProjectName && $scope.newProjectNumber && !$scope.projectExists($scope.newProjectNumber)) {
            $scope.projects.push({number: $scope.newProjectNumber, name: $scope.newProjectName});
            $scope.document.projectNumber = $scope.newProjectNumber;
            $scope.document.projectName = $scope.newProjectName;
        }
        $scope.newProjectName = null;
        $scope.newProjectNumber = null;
        $scope.showProjectTextField = false;
    };

    $scope.projectChanged = function() {
        for (var ind in $scope.projects) {
            if ($scope.projects[ind].number==$scope.document.projectNumber) {
                $scope.document.projectName = $scope.projects[ind].name;
                break;
            }
        }
    };

    $scope.clearForm = function() {
        $scope.fileList = null;
        $scope.document = {
            accDocumentNumber : "",
            accDocumentIteration : "",
            dateReceived : "",
            documentType : "customer specification",
            isApplicable : true,
            projectNumber : "",
            projectName : "",
            ownerName : "",
            ownerDocumentNumber: "",
            ownerDocumentName : "",
            ownerDocumentRevision : "",
            ownerDocumentRevisionData : "",
            accDescription : "",
            accNote : "",
            uploader : AccountService.getUsername()
        };
        $scope.showOwnerTextField = false;
        $scope.showProjectTextField = false;
        $scope.newOwnerName = null;
        $scope.newProjectNumber = null;
        $scope.newProjectName = null;
    };

    $scope.clearForm();

    $scope.filesSelected = function() {
        return $scope.fileList!=null && $scope.fileList.length > 0;
    };
};

var SearchCtrl = function($scope, ConfigurationService) {
    var services = ConfigurationService.getComponentServices(":Solr");
	var solrServiceUrl = services[0].serviceUrl;

    $scope.url = "";
	$scope.setUrl = function(){
	    $scope.url= solrServiceUrl + "/collection1/custom";
	};

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };
};
