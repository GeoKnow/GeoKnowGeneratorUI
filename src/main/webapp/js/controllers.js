'use strict';

function AccountMenuCtrl($scope) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
    { name: "User Preferences",   route:'#/account/preferences', url:'/account/preferences' }];
}

function StackMenuCtrl($scope, AccountService, ConfigurationService, $location, Ns) {
    
  var categoryToMenu = {
    "ExtractionService" :   { title: "Extraction and Loading", id:"extraction-loading", items:[] },
    "ExplorationService" :  { title: "Search Querying and Exploration", id:"search-querying-and-exploration", 
            items:[ { name: 'Virtuoso', 
                      route:'#/workbench/search-querying-and-exploration/virtuoso', 
                      url:'/workbench/search-querying-and-exploration/virtuoso', 
                      requiredServices:[] }] },
    "AuthoringService" :    { title: "Manual revision and Authoring", id:"manual-revision-and-authoring", items:[] },
    "InterlinkingService" : { title: "Linking and Fusing", id:"linking-and-fusing", items:[] },
    "EnrichmentService" :   { title: "Classification and Enrichment", id:"classification-and-enrichment", items:[] },
    "PublicationService" :  { title: "Evolution and Repair", id:"evolution-and-repair", items:[] }};
  
  ConfigurationService.getIntegratedComponents().then(
    function(resp){
      var tools = resp.integrated;
      for(var i in tools){
        var category = tools[i].type.replace("http://stack.linkeddata.org/ldis-schema/",'');
        var item = {
          name: tools[i].label, 
          route:'#' + tools[i].route ,  
          url: tools[i].route, 
          requiredServices: tools[i].requires };
        categoryToMenu[category].items.push(item);
      }

      $scope.groups = [];
      for(var i in categoryToMenu)
        if(categoryToMenu[i].items.length > 0)
          $scope.groups.push(categoryToMenu[i]);
    },
    function(response){
      flash.error = ServerErrorResponse.getMessage(response);
    });

  $scope.oneAtATime = true;

  /// this is sie admin filtering...
  $scope.showItem = function(item) {
    if (AccountService.getAccount().isAdmin()) return true; //show all items to admin
    var role = AccountService.getAccount().getRole();
      if (role==null) return false; //hide all
    var allowedServices = role.services;
    for (var ind in item.requiredServices) {
        if (allowedServices.indexOf(item.requiredServices[ind]) == -1) //hide item if one of required services is not allowed for current user
            return false;
    }
    return true;
  };

  $scope.showGroup = function(group) {
    if (AccountService.getAccount().isAdmin()) return true;
    //hide group if all items are hidden
    for (var ind in group.items) {
        if ($scope.showItem(group.items[ind])) return true;
    }
    return false;
  };

  /**
   * some click event fixes because simple href-routing and toggle-collapse is not working with ng-joyride
   *
   */
  $scope.collapse = function(id){
    $(id).collapse('toggle');
  };
  $scope.routeTo = function(route){
    $location.path(route);
  };


};

app.controller('NavbarCtrl', function($scope, $location) {
		$scope.getClass = function(path) {
			if ($location.path().substr(0, path.length) === path) {
			      return "active";
			    } else {
			      return "";
			    }
			};



    $scope.ngJoyride = false;
    $scope.joyrideConf =[];
    $scope.createJoyrideConfig = function(key){

        var config ={
            start: [{
                type: "title",
                heading: "Welcome to the Geoknow Generator demo",
                text: '<div class="row"><div id="title-text" class="col-md-12"><span class="main-text">Welcome to <strong>GeoKnow Generator</strong>.</span><br><span> This demo will walk you through the features of the generator on each page.</span></div></div>'
            },
                {
                    type: "element",
                    selector: "#navbarWorkbench",
                    heading: "Navigation",
                    text: "The <strong>Workbench</strong> provides a collection of tools to work with the Linked Data lifecycle.",
                    placement: "bottom",
                    scroll: true,
                    curtainClass: 'nothing'
                },
                {
                    type: "element",
                    selector: "#navbarSettings",
                    heading: "Navigation",
                    text: "In <strong>Settings</strong> you can manage data sources, like SPARQL endpoints and databases, graphs, components, roles and users.",
                    placement: "bottom",
                    scroll: true
                },
                {
                    type: "element",
                    selector: "#navbarAccount",
                    heading: "Navigation",
                    text: "In <strong>Account</strong> your will find your account information, and you can change your password.",
                    placement: "bottom",
                    scroll: true
                },
                {
                    type: "element",
                    selector: "#navbarLogout",
                    heading: "Navigation",
                    text: "Simply click logout to leave the workbench.",
                    placement: "bottom",
                    scroll: true
                }],
            workbench:[{
                type: "location_change",
                path: "/workbench"
            },
                {
                    type: "element",
                    selector: "#accordion",
                    heading: "Workbench",
                    text: "The Workbench menu contains all integrated software tools grouped into the Linked Data lifecycle stages.",
                    placement: "right",
                    scroll: true
                },
                {
                    type: "function",
                    fn: function(){ $('#extraction-loading').collapse('show');}
                },
                {
                    type: "element",
                    selector: "#extraction-loading",
                    heading: "Extraction and Loading",
                    text: '<p>Get data into the workbench with: </p><p><ul style="list-style-type: none;padding: 0px;margin: 0px;">'
                    + '<li><strong>Sparqlify</strong><br/>SPARQL-to-SQL rewriter, enables to query RDBMS with SPARQL</li>'
                    + '<li><strong>Triple-Geo</strong><br/>Geo-spatial feature extraction of ESRI shapefiles, GML, KML, INSPIRE-aligned, and several geospatially-enabled DBMSs</li>'
                    + '<li><strong>RDF Import</strong><br/>Load RDF data from files or endpoints.</li>'
                    + '</ul></p>',
                    placement: "right",
                    scroll: true
                },
                {
                    type: "function",
                    fn: function(){ $('#extraction-loading').collapse('hide'); $('#search-querying-and-exploration').collapse('show')}
                },
                {
                    type: "element",
                    selector: "#search-querying-and-exploration",
                    heading: "Search Querying and Exploration",
                    text: '<p>Explore or search data with: </p><p><ul style="list-style-type: none;padding: 0px;margin: 0px;">' 
                    + '<li><strong>Virtuoso</strong><br/>Provides an Interface to the SPARQL endpoint of the virtuoso database used in the backend.</li>' 
                    + '<li><strong>Facete</strong><br/>A web-based faceted browsing of RDF geospatial data.</li>'
                    + '<li><strong>Mappify</strong><br/>Map view generator into in HTML/JavaScript snippets.</li>'
                    + '<li><strong>ESTA-LD</strong><br/>A Exploratory Spatio-Temporal Analysis of Linked Data using data cubes.</li>'
                    + '</ul></p>',
                    placement: "right",
                    scroll: true
                },
                {
                    type: "function",
                    fn: function(){ $('#search-querying-and-exploration').collapse('hide'); $('#manual-revision-and-authoring').collapse('show')}
                },
                {
                    type: "element",
                    selector: "#manual-revision-and-authoring",
                    heading: "Manual revision and Authoring",
                    text: '<p>Edit and review data manually:</p><p><ul style="list-style-type: none;padding: 0px;margin: 0px;">'
                    + '<li><strong>OntoWiki</strong><br/>OntoWiki enables intuitive authoring of semantic content, with an inline editing mode for editing RDF content, similar to WYSIWIG for text documents.</li></ul></p>',
                    placement: "right",
                    scroll: true
                },
                {
                    type: "function",
                    fn: function(){ $('#manual-revision-and-authoring').collapse('hide'); $('#linking-and-fusing').collapse('show')}
                },
                {
                    type: "element",
                    selector: "#linking-and-fusing",
                    heading: "Linking and Fusion",
                    text: '<p>Tools in here can be handy to link and combine data of different sources. </p><p><ul style="list-style-type: none;padding: 0px;margin: 0px;">'
                    + '<li><strong>LIMES</strong><br/>Is a link discovery framework for linking datasets, it supports 13 similarity measures of which six are geo-spatial distance measures.</li>'
                    + '<li><strong>Fagi-gis</strong><br/>Supports fusing geospatial RDF data and metadata from two datasets.</li>'
                    + '</ul></p>',
                    placement: "right",
                    scroll: true
                },
                {
                    type: "function",
                    fn: function(){ $('#linking-and-fusing').collapse('hide'); $('#classification-and-enrichment').collapse('show')}
                },
                {
                    type: "element",
                    selector: "#classification-and-enrichment",
                    heading: "Classification and Enrichment",
                    text: '<p>Add more semantics to the data with: </p><p><ul style="list-style-type: none;padding: 0px;margin: 0px;">'
                    + '<li><strong>DEER</strong><br/>Data enrichment with implicit geospatial information through dereferencing, interlinking and NLP.</li>'
                    + '</ul></p>',
                    placement: "right",
                    scroll: true
                },
                {
                    type: "function",
                    fn: function(){ $('#classification-and-enrichment').collapse('hide'); $('#evolution-and-repair').collapse('show')}
                },
                {
                    type: "element",
                    selector: "#evolution-and-repair",
                    heading: "Evolution and Repair",
                    text: '<p>Fix the data with: </p><p><ul style="list-style-type: none;padding: 0px;margin: 0px;">'
                    + '<li><strong>Data Coevolution</strong><br/>A service for managing dataset provenance and modifications.</li>'
                    + '</ul></p>',
                    placement: "right",
                    scroll: true
                }],
            settings: [{
                type: "location_change",
                path: "/settings"
            },
                {
                    type: "element",
                    selector: "#accordion",
                    heading: "Settings",
                    text: 'In the settings you can manage different configurable aspects of the workbench.',
                    placement: "right",
                    scroll: true
                },
                {
                    type: "element",
                    selector: "#sidebardatasources",
                    heading: "Settings",
                    text: '<p><strong>Data Sources</strong> can be shared among the workbench users and used by the integrated software components.</p>',
                    placement: "right",
                    scroll: true
                },
                {
                    type: "location_change",
                    path: "/settings/data-sources"
                },
                {
                    type: "element",
                    selector: "#datasource-endpoint",
                    heading: "Data Sources",
                    text: 'Add Endpoints and describe them.',
                    placement: "bottom",
                    scroll: true
                },
                {
                    type: "element",
                    selector: "#datasource-rdb",
                    heading: "Data Sources",
                    text: 'Add and manage RDBs connections.',
                    placement: "top",
                    scroll: true
                },
                {
                    type: "element",
                    selector: "#datasource-license",
                    heading: "Data Sources",
                    text: 'Manage Data Licenses for publishing your datasets.',
                    placement: "top",
                    scroll: true
                },
                {
                    type: "element",
                    selector: "#sidebarnamedgraphs",
                    heading: "Settings",
                    text: '<p><strong>Named Graphs</strong> contains a set of triples that can be descrbed with a context, provenance information or other such metadata.</p>',
                    placement: "right",
                    scroll: true
                },
                {
                    type: "location_change",
                    path: "/settings/named-graphs"
                },
                {
                    type: "element",
                    selector: "#graph-sets",
                    heading: "Named Graphs",
                    text: '<strong>Graph Sets</strong> provide a naming convention for for versioning graphs.',
                    placement: "bottom",
                    scroll: true
                },
                {
                    type: "element",
                    selector: "#user-graphs",
                    heading: "Named Graphs",
                    text: '<strong>Named Graphs</strong> hold the data, and can be described with a context or provenance information. You can have public or private graphs, and even provide specific access to some users.',
                    placement: "top",
                    scroll: true
                },
                {
                    type: "element",
                    selector: "#graph-groups",
                    heading: "Named Graphs",
                    text: '<strong>Graph groups</strong> are especially nice for searching and querying or managing (setting access..) multiple graphs at once.',
                    placement: "top",
                    scroll: true
                },
                {
                    type: "element",
                    selector: "#sidebarcomponents",
                    heading: "Settings",
                    text: '<strong>Components</strong><br/>Shows the integrated components in the Workbench.',
                    placement: "right",
                    scroll: true
                },
                {
                    type: "location_change",
                    path: "/settings/components"
                },
                {
                    type: "element",
                    selector: "#components",
                    heading: "Components",
                    text: 'You can see the integrated components into the workbench. And if you were an Administrator you could enable/disable them.',
                    placement: "left",
                    scroll: true
                }
            /**ONLY ADMINS
                {
                    type: "element",
                    selector: "#sidebarroles",
                    heading: "Settings",
                    text: 'You can also set up the roles and user..',
                    placement: "right",
                    scroll: true
                },
                {
                    type: "location_change",
                    path: "/settings/roles"
                },
                {
                    type: "element",
                    selector: "#setroles",
                    heading: "Roles",
                    text: 'Here you can set the role, that registered user get by default or the role, that is related to not logged in users.',
                    placement: "bottom",
                    scroll: true
                },
                {
                    type: "element",
                    selector: "#roles",
                    heading: "Roles",
                    text: 'The main configuration can be set here, where you manage privileges to roles for using specific services.',
                    placement: "top",
                    scroll: true
                },
                {
                    type: "element",
                    selector: "#users",
                    heading: "Roles",
                    text: 'The user Management is also done in here. But just by Admins. Not sure, if visible in demo user page.',
                    placement: "top",
                    scroll: true
                }**/],
            account: [{
                type: "location_change",
                path: "/account"
            },
                {
                    type: "element",
                    selector: "#accountdata",
                    heading: "Account",
                    text: 'The current user data is here. You can change your password.',
                    placement: "bottom",
                    scroll: true
                }],
            end: [{
                type: "location_change",
                path: "/workbench"
            },
                {
                    type: "title",
                    heading: "So that's it",
                    text: 'Feel free to play around with the GeoKnow Generator!'
                }]
        };

        var result = [];
        if(!key || !config[key]){

            result = result.concat(config.start, config.workbench, config.settings, config.account, config.end);

        }else{
            result = config[key];
        }

        $scope.joyrideConf = angular.copy(result);
    };


    $scope.createJoyrideConfig(null);

  $scope.routeTo = function(route){
    $location.path(route);
  };

	});

app.controller('SidebarCtrl', function($scope, $location) {
    $scope.isSelected = function(route) {
        return route === $location.path();
    }
});

var DataSourceTabCtrl = function($scope, $window, $location) {

  // The tab directive will use this data
  $scope.tabs = ['SPARQL Endpoint', 'Relational Database'];
  $scope.tabs.index = 0;
  $scope.tabs.active = function() { 
    return $scope.tabs[$scope.tabs.index]; 
    };
  
};



