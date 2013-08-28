'use strict';

function SettingsMenuCtrl($scope) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
		{ name: "Data Sources", route:'#/settings/data-sources' },
  	{ name: "Datasets", route:'#/settings/datasets' },
  	{ name: "Graphs", route:'#/settings/graphs' },
  	{ name: "Components", route:'#/settings/components' },
    { name: "User Preferences",   route:'#/settings/preferences' }];
}

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



function LoginCtrl() {}
LoginCtrl.$inject = [];

function SettingsComponentCtrl(scope, service){
	scope.components = service.getComponents().components;
}
SettingsComponentCtrl.$inject = ['$scope', 'SettingsServiceDoomy'];


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
