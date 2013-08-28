
'use strict';

var module = angular.module('app.services', []);

var api = "http://localhost:8080/geoknow-generator-core-0.0.1-SNAPSHOT/api/"


module.factory('SettingsServiceDoomy', function($http) {
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

module.factory('SettingsService', function($http) {
  var SettingsService = {
    getSettings: function() {

      // $http returns a promise, which has a then function, which also returns a promise
      // var promise = $http
      //     //.jsonp("http://public-api.wordpress.com/rest/v1/sites/wtmpeachtest.wordpress.com/posts?callback=JSON_CALLBACK")
      //     .jsonp( api + "settings?callback=JSON_CALLBACK")
      //     .success(function (data, status, headers, config) {
      //        alert(data.found);
      //     })
      //     .error(function (data, status, headers, config) {
      //       return {"status": false};
      //     });
      // // Return the promise to the controller
      // return promise;
    }
  };
  return SettingsService;
});

// var endpoint = 'http://dydra.com/dhladky/biel-bienne/sparql?',
//     prefixes = 'PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX schema: <http://schema.org/> ',
//     sparqlParams = '&format=json&timeout=0&debug=on&callback=JSON_CALLBACK';
  
// module.factory('myGlobals', function() {
//    return {
//      endpoint : 'http://dydra.com/dhladky/biel-bienne/sparql?',
//      prefixes : 'PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX schema: <http://schema.org/> ',
//      sparqlParams : '&format=json&timeout=0&debug=on'
//    };
// });


// module.factory('appData', function($http){
   
//     var url= endpoint+'query=SELECT * WHERE { ?s  a rdfs:Class. ?s rdfs:label ?l }'+sparqlParams;
    
//     return {
//       getTypes: function() {
       
//         // return a promise
//         $http.jsonp( url ).then( function(response) {
//            alert(response);
//           // parse data items and format post dates
//           // var data = response.data.results;
//           //          for (var i = 0; i < data.length; i++)
//           //          {
//           //            data[i].date = Date.parse(data[i].created_at);
//           //          }
//           // 
//           //          // Build special response
//           //          return {
//           //              items       : data,
//           //              refreshURL  : response.data.refresh_url,
//           //              query       : response.data.query
//           //          };

//         });
//       }
//    }
// });


// 
// .config(['$httpProvider', function($httpProvider) {
//         delete $httpProvider.defaults.headers.common["X-Requested-With"]
//     }])
//     