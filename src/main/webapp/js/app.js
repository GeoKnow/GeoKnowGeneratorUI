'use strict';

var app = angular.module('app', ['ngRoute',
                                 'ngCookies',
                                 'app.job-service',
                                 'app.services', 
                                 'app.ns-service',
                                 'app.configuration-service',
                                 'app.graph-service',
                                 'app.account-service',
                                 'app.graph-group-service',
                                 'app.authsession-service',
                                 'app.login-service',
                                 'app.users-service',
                                 'app.directives', 
                                 'app.configuration',
                                 'ui.bootstrap',
                                 'route-segment',
                                 'view-segment', 
                                 'angularFileUpload',
                                 'angular-flash.service', 
                                 'angular-flash.flash-alert-directive']);


app.config(function($routeSegmentProvider, $routeProvider)
{
    $routeSegmentProvider.options.autoLoadTemplates = true;
    $routeSegmentProvider
        // TODO: these routes may have to be loaded from the configuration
        
        .when('/popup-limes','popup-limes')
        .when('/popup-triplegeo','popup-triplegeo')
        .when('/popup-geolift','popup-geolift')

        .when('/', 'default')
        .when('/workbench', 'workbench')
        .when('/account','account')
        .when('/system-setup', 'system-setup')
        .when('/access-denied', 'access-denied')
        // .when('/account/preferences', 'account.preferences')
        .when('/settings', 'settings')
        .when('/settings/data-sources', 'settings.data-sources')
        .when('/settings/datasets', 'settings.datasets')
        .when('/settings/namespaces', 'settings.namespaces')
        .when('/settings/components', 'settings.components')
        .when('/settings/roles', 'settings.roles')
        .when('/workbench/extraction-and-loading/import-rdf', 'workbench.import-rdf')
        .when('/workbench/extraction-and-loading/sparqlify', 'workbench.sparqlify')
        .when('/workbench/extraction-and-loading/triplegeo', 'workbench.triplegeo')
        .when('/workbench/extraction-and-loading/triplegeo-result', 'workbench.triplegeo-result')
        .when('/workbench/search-querying-and-exploration/virtuoso', 'workbench.virtuoso')
        .when('/workbench/search-querying-and-exploration/geospatial', 'workbench.geospatial')
     /*   .when('/workbench/search-querying-and-exploration/googlemap', 'workbench.googlemap') */
        .when('/workbench/search-querying-and-exploration/facete', 'workbench.facete')
        .when('/workbench/search-querying-and-exploration/mappify', 'workbench.mappify')
        .when('/workbench/manual-revision-and-authoring/ontowiki', 'workbench.ontowiki')
        .when('/workbench/linking-and-fusing/limes', 'workbench.limes')
        .when('/workbench/classification-and-enrichment/geolift', 'workbench.geolift')

        .segment('popup-limes', {
            templateUrl: 'js/workbench/linking-and-fusing/limes-result.html',
            resolve: {
                      settings: function (ConfigurationService) {
                        return ConfigurationService.getSettings();
                      }
                }
            })
            
        .segment('popup-triplegeo', {
            templateUrl: 'js/workbench/extraction-and-loading/triplegeo-result.html',
            resolve: {
                      settings: function (ConfigurationService) {
                        return ConfigurationService.getSettings();
                      }
                }
            })
            
        .segment('popup-geolift', {
            templateUrl: 'js/workbench/classification-and-enrichment/geolift-result.html',
            resolve: {
                      settings: function (ConfigurationService) {
                        return ConfigurationService.getSettings();
                      }
                }
            })
         
        .segment('workbench', {
            templateUrl :'js/workbench/dashboard.html',
            resolve: {
                        settings : function (ConfigurationService){
                             return ConfigurationService.getSettings();
                        }
                    // }
                    //     userInfo : function(UsersService) {
                    //     return UsersService.readUserNamesEmails();
                    // }
                }
            })
            .within()
                .segment('import-rdf', {
                    templateUrl: 'js/workbench/extraction-and-loading/import-rdf.html' })
                .segment('sparqlify', {
                    templateUrl: 'js/workbench/extraction-and-loading/sparqlify.html' })
                .segment('triplegeo', {
                    templateUrl: 'js/workbench/extraction-and-loading/triplegeo.html' })
                .segment('triplegeo-result', {
                    templateUrl: 'js/workbench/extraction-and-loading/triplegeo-result.html' })
                .segment('geospatial', {
                    templateUrl: 'js/workbench/search-querying-and-exploration/geospatial.html'})
     /*           .segment('googlemap', {
                    templateUrl: 'js/workbench/search-querying-and-exploration/googlemap.html'}) */
                .segment('facete', {
                    templateUrl: 'js/workbench/search-querying-and-exploration/facete.html'})
                .segment('mappify', {
                    templateUrl: 'js/workbench/search-querying-and-exploration/mappify.html'})
                .segment('virtuoso', {
                    templateUrl: 'js/workbench/search-querying-and-exploration/virtuoso.html'})
                .segment('ontowiki', {
                    templateUrl: 'js/workbench/manual-revision-and-authoring/ontowiki.html' })
                .segment('geolift', {
                    templateUrl: 'js/workbench/classification-and-enrichment/geolift.html' })
                .segment('limes', {
                    templateUrl: 'js/workbench/linking-and-fusing/limes.html' })
            .up()

		.segment('settings',{
			templateUrl: 'js/settings/settings.html'})
            .within()
                .segment('datasets', {
                    templateUrl: 'js/settings/datasets/graphs.html'})
                .segment('data-sources', {
                    templateUrl: 'js/settings/data-sources/data-sources.html'})
                .segment('namespaces', {
                    templateUrl: 'js/settings/namespaces/namespaces.html'})
                .segment('components', {
                    templateUrl: 'js/settings/components/components.html'})
                // .segment('users', {
                    //templateUrl: 'js/admin/users/users.html'})
                .segment('roles', {
                    templateUrl: 'js/admin/roles.html',
                    resolve: {
                            settings: function (ConfigurationService) {
                                return ConfigurationService.getSettings();
                            },
                            users: function(UsersService) {
                                return UsersService.readUsers();
                            },
                            roles: function(UsersService) {
                                return UsersService.readRoles();
                            }                        
                        }
                    })
            .up()
           
        .segment('account', {
            templateUrl:'js/account/account.html',
            resolve: {
                        settings: function (ConfigurationService) {
                        return ConfigurationService.getSettings();
                    }
            }})
            .within()
                .segment('preferences', {
                    templateUrl: 'js/account/preferences/preferences.html'
                })
            .up()
        .segment('system-setup', {
            templateUrl: 'system-setup.html'})
        .segment('default', {
            templateUrl: 'default.html',
            // resolve: {
            //         settings: function (ConfigurationService) {
            //             return ConfigurationService.getSettings();
            //         }
            // }
        })
        .segment('access-denied', {
            templateUrl: 'access-denied.html'})
        .segment('about', {
            templateUrl:'about.html' })
        .segment('under-construction', {
            templateUrl:'under-construction.html' });

    // TODO: replace with a not found page or something like that
    $routeProvider.otherwise({redirectTo: '/'}); 

})
.config(function($sceProvider) {
    // this may be has to be replaced by white list and black list for accessin resources
    $sceProvider.enabled(false);
})
// configuration of flashProvider module directive
.config(function (flashProvider) {
    // Support bootstrap 3.0 "alert-danger" class with error flash types
    flashProvider.errorClassnames.push('alert-danger');
    flashProvider.warnClassnames.push('alert-warning');
    flashProvider.infoClassnames.push('alert-info');
    flashProvider.successClassnames.push('alert-sucess');  
})
// TODO: we have to add here all the url from components in order that they are not
// blocked by angular 
// Error: [$sce:insecurl] Blocked loading resource from url not allowed by $sceDelegate policy.
.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['.*']);
})
.run(function($rootScope, $location, $http, AccountService, ConfigurationService) {
    //redirect to system-setup page if system is not set up
    //redirect to access-denied page if user has no access to page
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        var account = AccountService.getAccount();
        if ($rootScope.isSystemSetUp==undefined) {
            $http.get("rest/setup").then(function(response) {
                $rootScope.isSystemSetUp = response.data == "true";
                if (!$rootScope.isSystemSetUp) {
                    $location.path('/system-setup');
                }
            });
        } else if (!$rootScope.isSystemSetUp) {
            $location.path('/system-setup');
        } else if (account.getUsername() != undefined && next.$$route) { //check route permissions
            var requiredServices = ConfigurationService.getRequiredServices(next.$$route.originalPath);
            if (requiredServices == null) return;
            if (account.isAdmin()) return;
            var role = account.getRole();
            if (role==undefined) {
                $location.path("/access-denied");
                return;
            } else {
                var allowedServices = role.services;
                for (var ind in requiredServices) {
                    if (allowedServices.indexOf(requiredServices[ind]==-1)) {
                        $location.path("/access-denied");
                        return;
                    }
                }
            }
        }
        else {
            console.log("access denied? or home redirect?");
            // $location.path("/access-denied"); ?
            $location.path("/");
        }
    });
});

