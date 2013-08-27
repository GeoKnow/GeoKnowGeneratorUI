'use strict';

var app = angular.module('app', ['app.services', 'app.directives', 'ui.bootstrap','route-segment', 'view-segment']);

app.config(function($routeSegmentProvider, $routeProvider) {

        $routeSegmentProvider.options.autoLoadTemplates = true;
        $routeSegmentProvider
            // TODO: these routes may have to be loaded from the configuration
            .when('/', 'default')
            .when('/account','account')
            .when('/settings', 'settings')
            .when('/settings/data-sources', 'settings.data-sources')
            .when('/settings/graphs', 'settings.graphs')
            .when('/settings/datasets', 'settings.datasets')
            .when('/settings/components', 'settings.components')
            .when('/settings/preferences', 'settings.preferences')
            .when('/extraction-and-loading/rdf-external', 'default.rdf-external')
            .when('/extraction-and-loading/rdf-local', 'default.rdf-local')
            .when('/extraction-and-loading/xml', 'default.xml')
            .when('/extraction-and-loading/sql', 'default.sql')
            .when('/querying-and-exploration/geospatial', 'default.geospatial')
            .when('/authoring/ontowiki', 'default.ontowiki')
            .when('/linking/limes', 'default.limes')
            .when('/enriching-and-cleaning/geolift', 'default.geolift')

            .segment('default', {
                templateUrl:'partials/default.html'})
                .within()
                    .segment('rdf-local', {
                        templateUrl: 'partials/extraction-and-loading/rdf-local.html'})
                    .segment('rdf-external', {
                        templateUrl: 'partials/extraction-and-loading/rdf-external.html' })
                    .segment('xml', {
                        templateUrl: 'partials/extraction-and-loading/xml.html' })
                    .segment('sql', {
                        templateUrl: 'partials/extraction-and-loading/sql.html' })
                    .segment('geospatial', {
                        templateUrl: 'partials/querying-and-exploration/geospatial.html' })
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
                    .segment('graphs', {
                        templateUrl: 'partials/settings/graphs.html'})
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

