'use strict';

//TODO: this async call has to be called aspromise and resolve
CONFIG.read();
//http://stackoverflow.com/questions/17623591/angular-app-resolve-not-controller-for-async-pre-loaded-data


var app = angular.module('app', ['app.services', 
                                 'app.directives', 
                                 'ui.bootstrap',
                                 'route-segment',
                                 'view-segment', 
                                 'angularFileUpload',
                                 'angular-flash.service', 
                                 'angular-flash.flash-alert-directive']);


app.config(function($routeSegmentProvider, $routeProvider) {

    $routeSegmentProvider.options.autoLoadTemplates = true;
    $routeSegmentProvider
        // TODO: these routes may have to be loaded from the configuration
        .when('/home', 'default')
        .when('/account','account')
        .when('/account/preferences', 'account.preferences')
        .when('/settings', 'settings')
        .when('/settings/data-sources', 'settings.data-sources')
        .when('/settings/datasets', 'settings.datasets')
        .when('/settings/namespaces', 'settings.namespaces')
        .when('/settings/components', 'settings.components')
        .when('/home/extraction-and-loading/import-rdf', 'default.import-rdf')
        .when('/home/extraction-and-loading/sparqlify', 'default.sparqlify')
        .when('/home/extraction-and-loading/triplegeo', 'default.triplegeo')
        .when('/home/querying-and-exploration/geospatial', 'default.geospatial')
        .when('/home/querying-and-exploration/googlemap', 'default.googlemap')
        .when('/home/querying-and-exploration/facete', 'default.facete')
        .when('/home/authoring/ontowiki', 'default.ontowiki')
        .when('/home/linking/limes', 'default.limes')
        .when('/home/enriching-and-cleaning/geolift', 'default.geolift')

        .segment('default', {
                templateUrl :'partials/default.html'})
            .within()
                .segment('import-rdf', {
                    templateUrl: 'partials/extraction-and-loading/import-rdf.html' })
                .segment('sparqlify', {
                    templateUrl: 'partials/extraction-and-loading/sparqlify.html' })
                .segment('triplegeo', {
                    templateUrl: 'partials/extraction-and-loading/triplegeo.html' })
                .segment('geospatial', {
                    templateUrl: 'partials/querying-and-exploration/geospatial.html'})
                .segment('googlemap', {
                    templateUrl: 'partials/querying-and-exploration/googlemap.html'})
                .segment('facete', {
                    templateUrl: 'partials/querying-and-exploration/facete.html'})
                .segment('ontowiki', {
                    templateUrl: 'partials/authoring/ontowiki.html' })
                .segment('geolift', {
                    templateUrl: 'partials/enriching-and-cleaning/geolift.html' })
                .segment('limes', {
                    templateUrl: 'partials/linking/limes.html' })
            .up()

        .segment('settings', {
                templateUrl:'partials/settings.html'})
                // we could implement here the resolve here for each route
                // the disadantage is that is the same for all routes,
                // the advantage is that in theory if the resolve do not succeed the
                // route is not followed. I couldn make it work 
                // resolve : function (){
                //     var deferred = $q.defer();
                //     console.log("LoadConfig");
                //      if (CONFIG.read()) {
                //         deferred.resolve('Configuration loaded!');
                //       } else {
                //         deferred.reject('Configuration is not available');
                //       }
                //       return deferred.promise;
                // } })
            .within()
                .segment('datasets', {
                    templateUrl: 'partials/settings/datasets.html'})
                .segment('data-sources', {
                    templateUrl: 'partials/settings/data-sources.html'})
                .segment('namespaces', {
                    templateUrl: 'partials/settings/namespaces.html'})
                .segment('components', {
                    templateUrl: 'partials/settings/components.html'})
            .up()

        .segment('account', {
            templateUrl:'partials/account.html' })
            .within()
                .segment('preferences', {
                    templateUrl: 'partials/settings/preferences.html' })
            .up()

        .segment('about', {
            templateUrl:'partials/about.html' })
        .segment('under-construction', {
            templateUrl:'partials/under-construction.html' });

    // TODO: replace with a not found page or something like that
    $routeProvider.otherwise({redirectTo: '/home'}); 

}).config(function (flashProvider) {
    // Support bootstrap 3.0 "alert-danger" class with error flash types
    flashProvider.errorClassnames.push('alert-danger');
    flashProvider.warnClassnames.push('alert-warning');
    flashProvider.infoClassnames.push('alert-info');
    flashProvider.successClassnames.push('alert-sucess');  
});

