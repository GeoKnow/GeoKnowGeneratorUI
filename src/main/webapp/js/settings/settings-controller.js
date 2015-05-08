'use strict';

function SettingsMenuCtrl($scope, AccountService) {
  
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
  	{ name: "Data Sources", route:'#/settings/data-sources', url:'/settings/data-sources', requiredServices:[] },
  	{ name: "Named Graphs  ", route:'#/settings/named-graphs', url:'/settings/named-graphs', requiredServices:[] },
    // { name: "Namespaces", route:'#/settings/namespaces', url:'/settings/namespaces', requiredServices:[] },
  	{ name: "Components", route:'#/settings/components', url:'/settings/components', requiredServices:[] },
    //{ name: "Users", route:'#/settings/users', url:'/settings/users', requiredServices:[":UserManagerService"] },
    { name: "Roles Management", route:'#/settings/roles', url:'/settings/roles', requiredServices:[":UserManagerService"] }
  ];

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
}

function GeneralSettingsCtrl($scope, ConfigurationService, flash) {

    ConfigurationService.getSettings().then(
      //success
      function(response){
        
        $scope.settings = {
          uriBase: ConfigurationService.getUriBase() ,
          endpointService: ConfigurationService.getSPARQLEndpoint(),
          settingsGraph : ConfigurationService.getSettingsGraph()
        }; 

      },
      // error 
      function(response){
        var message = ServerErrorResponse.getMessage(response);
        flash.error = message;
    });

}

function SystemSetupCtrl($rootScope, $scope, $location, ConfigurationService, flash, $timeout) {

    ConfigurationService.getConfiguration().then(
      //success
      function(response){
        $scope.settings = {
          uriBase: response.data.ns,
          endpointService: response.data.authSparqlEndpoint,
          publicEndpointService : response.data.sparqlEndpoint,
          authSparqlEndpoint : response.data.authSparqlEndpoint,
          defaultSettingsGraphUri : response.data.defaultSettingsGraphUri,
          frameworkUri : response.data.frameworkUri,
          flagPath : response.data.flagPath
        }; 
         // checkbox to initialize or reset the system
        $scope.reset=false;
      },
      // error 
      function(response){
        var message = ServerErrorResponse.getMessage(response);
        flash.error = message;
    });

    $scope.setup = function(){
      return ConfigurationService.setup($scope.reset).then(function(response) {        
        $rootScope.isSystemSetUp =true;
        $timeout(function(){ 
          $scope.$apply(function() {
            $location.path("/").replace();
          });
        }, 3000);
      }, function(response){
        flash.error = response.data;
      });
    };

}