'use strict';

function LoginCtrl() {}
LoginCtrl.$inject = [];

function SettingsCtrl(scope, service) {
	scope.settings = "";
	service.getSettings().then(
		function(promise) {
    		scope.settings = angular.fromJson(promise);		
  		},
  		function(reason) {console.log("Error SettingsCtrl"); throw reason });
}

SettingsCtrl.$inject = ['$scope', 'SettingsService'];

// app.controller('MainCtrl', function( myService,$scope) {
//   // Call the async method and then do stuff with what is returned inside our own then function
//   myService.async().then(function(d) {
//     $scope.data = d;
//   });
// });

// DELETE //
function googlemap($scope, $timeout, $log){

	// Enable the new Google Maps visuals until it gets enabled by default.
    // See http://googlegeodevelopers.blogspot.ca/2013/05/a-fresh-new-look-for-maps-api-for-all.html
    google.maps.visualRefresh = true;

	angular.extend($scope, {

	    position: {
	      coords: {
	        latitude: 45,
	        longitude: -73
	      }
	    },

		/** the initial center of the map */
		centerProperty: {
			latitude: 45,
			longitude: -73
		},

		/** the initial zoom level of the map */
		zoomProperty: 4,

		/** list of markers to put in the map */
		markersProperty: [ {
				latitude: 45,
				longitude: -74
			}],

		// These 2 properties will be set when clicking on the map
		clickedLatitudeProperty: null,	
		clickedLongitudeProperty: null,

		eventsProperty: {
		  click: function (mapModel, eventName, originalEventArgs) {	
		    // 'this' is the directive's scope
		    $log.log("user defined event on map directive with scope", this);
		    $log.log("user defined event: " + eventName, mapModel, originalEventArgs);
		  }
		}
	});

}
//DELETE //

function openmap($scope, $timeout, $log){

	 var map = new OpenLayers.Map( 'map', {controls:[
	                                             new OpenLayers.Control.Navigation(),
	                                             new OpenLayers.Control.PanZoomBar(),
	                                             //new OpenLayers.Control.LayerSwitcher(),
	                                             new OpenLayers.Control.Attribution()],
	                                             units: 'm',
	                                         });
	                                      var layer = new OpenLayers.Layer.OSM( "Biel/Bienne Map");
	                                      map.addLayer(layer);
	                                      map.setCenter(
	                                          new OpenLayers.LonLat(7.25 , 47.133333).transform(
	                                              new OpenLayers.Projection("EPSG:4326"),
	                                              map.getProjectionObject()
	                                          ), 13 
	                                      );

}
