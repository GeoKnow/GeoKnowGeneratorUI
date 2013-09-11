
'use strict';

var module = angular.module('app.services', []);

module.factory('SettingsServiceStatic', function($http) {
  var SettingsService = {

    getComponentCategories: function() {
      return { categories:
        [ { name: "Extraction and Loading", id:"extraction-and-loading" },
          { name: "Querying and Exploration", id:"querying-and-exploration" },
          { name: "Authoring", id:"authoring" },
          { name: "Linking", id:"linking" },
          { name: "Enriching and Data Cleaning", id:"enriching-and-cleaning" }]
      }
    },
    getComponents: function() {
      return { components:
        [ { uri: "<http://geoknow.eu/resource/Virtuoso>", label: "Virtuoso", version:"6", category:"storage-querying", 
            url: "http://192.168.43.209:8890/conductor", route:"/authoring/ontowiki"},
          { uri: "<http://geoknow.eu/resource/ontowiki>", label: "OntoWiki", version:"0.9.7", category:"authoring", 
            url: "http://10.0.0.90/ontowiki", route:"/authoring/ontowiki"},
          { uri: "<http://geoknow.eu/resource/Facete>", label: "Facete", version:"0.1-SNAPSHOT", category:"querying-and-exploration", 
            url: "http://10.0.0.90/facete", route:"/querying-and-exploration/facete"},
          { uri: "<http://geoknow.eu/resource/geoknow-workbench>", label: "GeoKnow Workbench", version:"0.1.0", 
            url: "http://localhost/geoknow-workbench" } ] 
      };      
    }}
    return SettingsService;
});
