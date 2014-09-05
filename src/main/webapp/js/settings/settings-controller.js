'use strict';

function SettingsMenuCtrl($scope, AccountService) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
  	{ name: "_data-sources_", route:'#/settings/data-sources', url:'/settings/data-sources', requiredServices:[] },
  	{ name: "_datasets_", route:'#/settings/datasets', url:'/settings/datasets', requiredServices:[] },
    // { name: "_namespaces-title_", route:'#/settings/namespaces', url:'/settings/namespaces' },
  	{ name: "_components_", route:'#/settings/components', url:'/settings/components', requiredServices:[] },
    { name: "_users_", route:'#/settings/users', url:'/settings/users', requiredServices:[":UserManagerService"] },
    { name: "_roles-management_", route:'#/settings/roles', url:'/settings/roles', requiredServices:[":UserManagerService"] }
  ];

  $scope.showItem = function(item) {
    if (AccountService.isAdmin()) return true; //show all items to admin
    var role = AccountService.getRole();
    if (role==null) return false; //hide all
    var allowedServices = role.services;
    for (var ind in item.requiredServices) {
        if (allowedServices.indexOf(item.requiredServices[ind]) == -1) //hide item if one of required services is not allowed for current user
            return false;
    }
    return true;
  };
}


function GeneralSettingsCtrl($rootScope, $scope, $location, ConfigurationService, flash, $timeout) {

    $scope.endpointServices = ConfigurationService.getResourcesType("lds:SPARQLEndPointService");

    $scope.settings = {
        uriBase: ConfigurationService.getUriBase(),
        endpointService: ConfigurationService.getSPARQLEndpoint(),
        settingsGraph: ConfigurationService.getSettingsGraph(),
        publicEndpointService : ConfigurationService.getPublicSPARQLEndpoint(),
        defaultSettingsGraphUri : ConfigurationService.getDefaultSettingsGraph(),
        frameworkUri : ConfigurationService.getFrameworkUri()
    };
    // checkbox to initialize or reset the system
    $scope.reset=true;
    
    $scope.setup = function(){
      ConfigurationService.setup($scope.reset).then(function(response) {        
        $rootScope.isSystemSetUp =true;
        $timeout(function(){ 
          $scope.$apply(function() {
            $location.path("/home").replace();
          });
        }, 3000);
      }, function(response){
        flash.error = response.data;
      });
    };

    $scope.$watch(function () {
        return ConfigurationService.getSettingsGraph();
    }, function () {
        $scope.settings.settingsGraph = ConfigurationService.getSettingsGraph();
    });

 
    // $scope.update = function(){
    // 	ConfigurationService.setUriBase($scope.settings.);
    // 	ConfigurationService.getSPARQLEndpoint($scope.settings);
    // }
}