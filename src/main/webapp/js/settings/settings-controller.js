'use strict';

function SettingsMenuCtrl($scope) {
  
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
  	{ name: "Data Sources", route:'#/settings/data-sources', url:'/settings/data-sources', requiredServices:[] },
  	{ name: "Datasets", route:'#/settings/datasets', url:'/settings/datasets', requiredServices:[] },
    // { name: "Namespaces", route:'#/settings/namespaces', url:'/settings/namespaces', requiredServices:[] },
  	{ name: "Components", route:'#/settings/components', url:'/settings/components', requiredServices:[] },
    //{ name: "Users", route:'#/settings/users', url:'/settings/users', requiredServices:[":UserManagerService"] },
    { name: "Roles Management", route:'#/settings/roles', url:'/settings/roles', requiredServices:[":UserManagerService"] }
  ];

  $scope.showItem = function(item) {
    if ($scope.$parent.currentAccount.isAdmin()) return true; //show all items to admin
    var role = $scope.$parent.currentAccount.getRole();
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

    ConfigurationService.getSettings().then(function(){

      $scope.endpointServices = ConfigurationService.getResourcesType("lds:SPARQLEndPointService");

      $scope.settings = {
          uriBase: ConfigurationService.getUriBase(),
          endpointService: ConfigurationService.getSPARQLEndpoint(),
          settingsGraph: ConfigurationService.getSettingsGraph(),
          publicEndpointService : ConfigurationService.getPublicSPARQLEndpoint(),
          defaultSettingsGraphUri : ConfigurationService.getDefaultSettingsGraph(),
          frameworkUri : ConfigurationService.getFrameworkUri(),
          flagPath : ConfigurationService.getFlagPath()

      };  

      // $scope.$watch(function () {
      //   return ConfigurationService.getSettingsGraph();
      // }, function () {
      //   $scope.settings.settingsGraph = ConfigurationService.getSettingsGraph();
      // });

    });
    
    // checkbox to initialize or reset the system
    $scope.reset=true;
    
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