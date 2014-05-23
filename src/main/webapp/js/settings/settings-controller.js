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