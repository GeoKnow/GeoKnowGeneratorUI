'use strict';

function SettingsMenuCtrl($scope, AccountService) {
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


function GeneralSettingsCtrl($scope, ConfigurationService) {

    $scope.endpointServices = ConfigurationService.getResourcesType("lds:SPARQLEndPointService");

    $scope.settings = {
        uriBase: ConfigurationService.getUriBase(),
        endpointService: ConfigurationService.getSPARQLEndpoint(),
        settingsGraph: ConfigurationService.getSettingsGraph()
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