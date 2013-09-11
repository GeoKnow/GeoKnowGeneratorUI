'use strict';

var app = angular.module('app', ['app.services', 
                                 'app.directives', 
                                 'ui.bootstrap',
                                 'route-segment',
                                 'view-segment',
                                 '$strap.directives']);

app.config(function($routeSegmentProvider, $routeProvider) {

        $routeSegmentProvider.options.autoLoadTemplates = true;
        $routeSegmentProvider
            // TODO: these routes may have to be loaded from the configuration
            .when('/', 'default')
            .when('/account','account')
            .when('/settings', 'settings')
            .when('/settings/data-sources', 'settings.data-sources')
            .when('/settings/datasets', 'settings.datasets')
            .when('/settings/components', 'settings.components')
            .when('/settings/preferences', 'settings.preferences')
            .when('/extraction-and-loading/import-rdf', 'default.import-rdf')
            .when('/extraction-and-loading/sparqlify', 'default.sparqlify')
            .when('/querying-and-exploration/geospatial', 'default.geospatial')
            .when('/querying-and-exploration/googlemap', 'default.googlemap')
            .when('/querying-and-exploration/facete', 'default.facete')
            .when('/authoring/ontowiki', 'default.ontowiki')
            .when('/linking/limes', 'default.limes')
            .when('/enriching-and-cleaning/geolift', 'default.geolift')

            .segment('default', {
                templateUrl:'partials/default.html'})
                .within()
                    .segment('import-rdf', {
                        templateUrl: 'partials/extraction-and-loading/import-rdf.html' })
                    .segment('sparqlify', {
                        templateUrl: 'partials/extraction-and-loading/sparqlify.html' })
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
                templateUrl:'partials/settings.html' })
                .within()
                    .segment('datasets', {
                        templateUrl: 'partials/settings/datasets.html'})
                    .segment('data-sources', {
                        templateUrl: 'partials/settings/data-sources.html'})
                    .segment('components', {
                        templateUrl: 'partials/settings/components.html'})
                    .segment('preferences', {
                        templateUrl: 'partials/settings/preferences.html' })
                .up()

            .segment('account', {
                templateUrl:'partials/account.html', 
                controller:LoginCtrl })
            .segment('about', {
                templateUrl:'partials/about.html' })
            .segment('under-consrtuction', {
                templateUrl:'partials/under-consrtuction.html' });

        // TODO: replace with a not found page or something like that
        $routeProvider.otherwise({redirectTo: '/'}); 

});

