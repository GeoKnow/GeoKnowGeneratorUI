'use strict';

function StackMenuCtrl($scope) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.groups = [
    {
      title: "Extraction and Loading",
      items: [ 
      	{name: 'Upload RDF file or RDF from URL', route:'#/extraction-and-loading/rdf-local' }, 
       	{name: 'Load RDF data from publicdata.eu', route:'#/extraction-and-loading/rdf-external' }, 
        {name: 'Extract RDF from XML', route:'#/extraction-and-loading/xml' }, 
        {name: 'Extract RDF from SQL', route:'#/extraction-and-loading/sql' }]
    },
    {
      title: "Querying and Exploration",
      items: [ 
      	{name: 'Geospatial Exploration', route:'#/querying-and-exploration/geospatial' },
      	{name: 'Google Maps', route:'#/querying-and-exploration/googlemap' },
      	{name: 'Facete', route:'#/querying-and-exploration/facete' }]
    },
    {
      title: "Authoring",
      items: [ 
      	{name: 'OntoWiki', route:'#/authoring/ontowiki' }]
    },
    {
      title: "Linking",
      items: [ 
      	{name: 'LIMES', route:'#/linking/limes' }]
    }, 
    {
    	title: "Enriching and Data Cleaning", 
    	items: [ 
      	{name: 'GeoLift', route:'#/enriching-and-cleaning/geolift' }]
    }

  ];

}

var ModalWindow = function ($scope) {

	  $scope.open = function () {
	    $scope.shouldBeOpen = true;
	  };

	  $scope.close = function () {
	    $scope.closeMsg = 'I was closed at: ' + new Date();
	    $scope.shouldBeOpen = false;
	  };

	  $scope.opts = {
	    backdropFade: true,
	    dialogFade:true
	  };

	};

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


app.controller('GoogleMap', function GoogleMap($scope, $timeout, $log){

	// Enable the new Google Maps visuals until it gets enabled by default.
    // See http://googlegeodevelopers.blogspot.ca/2013/05/a-fresh-new-look-for-maps-api-for-all.html
    google.maps.visualRefresh = true;

	angular.extend($scope, {

	    position: {
	      coords: {
	        latitude: 47.1267762,
	        longitude: 7.2424403
	      }
	    },

		/** the initial center of the map */
		centerProperty: {
			latitude: 47.1267762,
	        longitude: 7.2424403
		},

		/** the initial zoom level of the map */
		zoomProperty: 4,

		/** list of markers to put in the map */
		markersProperty: [ {
				latitude: 47.1267762,
		        longitude: 7.2424403
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

});

app.controller('OpenMap', function OpenMap($scope, $timeout, $log){

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
});

var OpenMapWindow = function OpenMapWindow($scope, $timeout, $log) {
	
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
	};
	
var GoogleMapWindow = function ($scope, $timeout, $log) {
		
			var map;
			
			  var mapOptions = {
			    zoom: 14,
			    center: new google.maps.LatLng(47.126776, 7.24),
			    mapTypeId: google.maps.MapTypeId.ROADMAP
			  };
			  
			  map = new google.maps.Map(document.getElementById('map'),
			      mapOptions);
			
		};
		
		function CollapseDemoCtrl($scope) {
			  $scope.isCollapsed = false;
			}

