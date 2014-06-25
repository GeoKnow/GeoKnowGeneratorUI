'use strict';

function SettingsMenuCtrl($scope, AccountService) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
//  	{ name: "_data-sources_", route:'#/settings/data-sources', url:'/settings/data-sources', requiredServices:[] },
//  	{ name: "_datasets_", route:'#/settings/datasets', url:'/settings/datasets', requiredServices:[] },
    // { name: "_namespaces-title_", route:'#/settings/namespaces', url:'/settings/namespaces' },
  	{ name: "_components_", route:'#/settings/components', url:'/settings/components', requiredServices:[] },
    { name: "_thesaurus-management_", route:'#/settings/ontology', url:'/settings/ontology', requiredServices:[":D2RQService", ":MiniDixService"] },
//    { name: "_users_", route:'#/settings/users', url:'/settings/users', requiredServices:[":UserManagerService"] },
    { name: "_roles-management_", route:'#/settings/roles', url:'/settings/roles', requiredServices:[":UserManagerService"] }
  ];

  $scope.showItem = function(item) {
    if (!AccountService.isLogged()) return true; //todo unauthorized user
    if (AccountService.isAdmin()) return true; //show all items to admin
    var allowedServices = AccountService.getRole().services;
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