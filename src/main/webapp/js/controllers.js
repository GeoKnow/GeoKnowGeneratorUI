'use strict';

function AccountMenuCtrl($scope) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
    { name: "User Preferences",   route:'#/account/preferences', url:'/account/preferences' }];
}

function StackMenuCtrl($scope, AccountService, ConfigurationService, Ns) {
    
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

};

app.controller('NavbarCtrl', function($scope, $location) {
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

var DataSourceTabCtrl = function($scope, $window, $location) {

  // The tab directive will use this data
  $scope.tabs = ['SPARQL Endpoint', 'Relational Database'];
  $scope.tabs.index = 0;
  $scope.tabs.active = function() { 
    return $scope.tabs[$scope.tabs.index]; 
    };
  
};



