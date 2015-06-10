'use strict';

var app = angular.module('app', ['ngRoute',
                                 'ngCookies',
                                 'app.services', 
                                 'app.job-service',
                                 'app.ns-service',
                                 'app.configuration-service',
                                 'app.graph-service',
                                 'app.account-service',
                                 'app.graph-group-service',
                                 'app.authsession-service',
                                 'app.components-service',
                                 'app.roles-service',
                                 'app.datasources-service',
                                 'app.co-evolution-service',
                                 'app.import-rdf-service',
                                 'app.login-service',
                                 'app.users-service',
                                 'app.directives', 
                                 'app.filters', 
                                 'app.configuration',
                                 'ui.bootstrap',
                                 'route-segment',
                                 'view-segment', 
                                 'ngFileUpload',
                                 'angular-flash.service', 
                                 'angular-flash.flash-alert-directive',
                                 'angular-loading-bar']);


app.config(function($routeSegmentProvider, $routeProvider)
{

    $routeSegmentProvider.options.autoLoadTemplates = true;
    $routeSegmentProvider
        // TODO: these routes may have to be loaded from the configuration
        // main routes   
        .when('/', 'default')
        .when('/workbench', 'workbench')
        .when('/account','account')
        .when('/system-setup', 'system-setup')
        .when('/access-denied', 'access-denied')
        .when('/settings', 'settings')
        // secondary routes 
        .when('/settings/data-sources', 'settings.data-sources')
        .when('/settings/named-graphs', 'settings.named-graphs')
        //.when('/settings/namespaces', 'settings.namespaces')
        .when('/settings/components', 'settings.components')
        .when('/settings/roles', 'settings.roles')
        .when('/workbench/extraction-and-loading/import-rdf', 'workbench.import-rdf')
        .when('/workbench/extraction-and-loading/sparqlify', 'workbench.sparqlify')
        .when('/workbench/extraction-and-loading/triplegeo', 'workbench.triplegeo')
        .when('/workbench/extraction-and-loading/triplegeo-result', 'workbench.triplegeo-result')
        .when('/workbench/search-querying-and-exploration/virtuoso', 'workbench.virtuoso')
        .when('/workbench/search-querying-and-exploration/facete', 'workbench.facete')
        .when('/workbench/search-querying-and-exploration/mappify', 'workbench.mappify')
        .when('/workbench/manual-revision-and-authoring/ontowiki', 'workbench.ontowiki')
        .when('/workbench/linking-and-fusing/limes', 'workbench.limes')
        .when('/workbench/linking-and-fusing/fagi-gis', 'workbench.fagi-gis')
        .when('/workbench/classification-and-enrichment/deer', 'workbench.deer')
        .when('/workbench/evolution-and-repair/coevolution-create', 'workbench.coevolution-create')
        .when('/workbench/evolution-and-repair/coevolution-apply', 'workbench.coevolution-apply')

        .segment('default', {
            templateUrl: 'default.html',

                })
            
        .segment('popup-triplegeo', {
            templateUrl: 'js/workbench/extraction-and-loading/triplegeo-result.html',
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
                .segment('facete', {
                    templateUrl: 'js/workbench/search-querying-and-exploration/facete.html'})
                .segment('mappify', {
                    templateUrl: 'js/workbench/search-querying-and-exploration/mappify.html'})
                .segment('virtuoso', {
                    templateUrl: 'js/workbench/search-querying-and-exploration/virtuoso.html'})
                .segment('ontowiki', {
                    templateUrl: 'js/workbench/manual-revision-and-authoring/ontowiki.html' })
                .segment('deer', {
                    templateUrl: 'js/workbench/classification-and-enrichment/deer.html' })
                .segment('limes', {
                    templateUrl: 'js/workbench/linking-and-fusing/limes.html' })
                .segment('fagi-gis', {
                    templateUrl: 'js/workbench/linking-and-fusing/fagi-gis.html' })
                .segment('coevolution-create', {
                    templateUrl: 'js/workbench/evolution-and-repair/coevolution-create.html' })
                .segment('coevolution-apply', {
                    templateUrl: 'js/workbench/evolution-and-repair/coevolution-apply.html' })
            .up()

        .segment('settings',{
            templateUrl: 'js/settings/settings.html'})
            .within()
                .segment('named-graphs', {
                    templateUrl: 'js/settings/named-graphs/graphs.html', 
                    resolve: {
                        CoevolutionServiceInit : function(CoevolutionService){
                            return CoevolutionService.promise;
                        }
                    }
                })
                .segment('data-sources', {
                    templateUrl: 'js/settings/data-sources/data-sources.html'})
                .segment('namespaces', {
                    templateUrl: 'js/settings/namespaces/namespaces.html'})
                .segment('components', {
                    templateUrl: 'js/settings/components/components.html'})
                // .segment('users', {
                    //templateUrl: 'js/admin/users/users.html'})
                .segment('roles', {
                    templateUrl: 'js/admin/roles.html'
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
            templateUrl: 'system-setup.html',
        })
        .segment('access-denied', {
            templateUrl: 'access-denied.html'
        });

    // TODO: replace with a not found page or something like that
    $routeProvider.otherwise({redirectTo: '/'}); 

}).config(function($sceProvider) {
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

.config(function($httpProvider){
    
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};    
    }
    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache'; 
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    
    
})
.run(function($rootScope, $location, $http, AccountService, ConfigurationService, flash, ServerErrorResponse) {
    
    //redirect to system-setup page if system is not set up
    //redirect to access-denied page if user has no access to page
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        if ($rootScope.isSystemSetUp==undefined) {
            $http.get("rest/config/setup").then(function(response) {
                $rootScope.isSystemSetUp = response.data == "true";
                if (!$rootScope.isSystemSetUp) {
                    $location.path('/system-setup');
                }
            }, function(response) {
                flash.error = ServerErrorResponse.getMessage(response);
            });
        } else if (!$rootScope.isSystemSetUp) {
            $location.path('/system-setup');
        } else if (AccountService.getAccount().getAccountURI() != undefined && next.$$route) { //check route permissions
            var requiredServices = ConfigurationService.getRequiredServices(next.$$route.originalPath);
            if (requiredServices==null) return;
            if (AccountService.getAccount().isAdmin()) return;
            var role = AccountService.getAccount().getRole();
            if (role==undefined) {
                $location.path("/access-denied");
            } else {
                var allowedServices = role.services;
                console.log(allowedServices);
                console.log(requiredServices);
                for (var ind in requiredServices) {
                    if (allowedServices.indexOf(requiredServices[ind])==-1) {
                        $location.path("/access-denied");
                        return;
                    }
                }
            }
        }else {
            $location.path("/");
        }
    });
});

