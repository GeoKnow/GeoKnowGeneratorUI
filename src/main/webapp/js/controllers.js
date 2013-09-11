'use strict';

function SettingsMenuCtrl($scope) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
	{ name: "Data Sources", route:'#/settings/data-sources', url:'/settings/data-sources' },
  	{ name: "Datasets", route:'#/settings/datasets', url:'/settings/datasets' },
  	{ name: "Graphs", route:'#/settings/graphs', url:'/settings/graphs' },
  	{ name: "Components", route:'#/settings/components', url:'/settings/components' },
    { name: "User Preferences",   route:'#/settings/preferences', url:'/settings/preferences' }];
}

function StackMenuCtrl($scope) {
	  $scope.oneAtATime = true;
	  // these data can be replaced later with the configuration
	  $scope.groups = [
	    {
	      title: "Extraction and Loading",
	      id:"extraction-loading",
	      items: [
	       {name: 'Upload RDF file or RDF from URL', route:'#/home/extraction-and-loading/rdf-local', url:'/home/extraction-and-loading/rdf-local' },
	        {name: 'Load RDF data from publicdata.eu', route:'#/home/extraction-and-loading/rdf-external', url:'/home/extraction-and-loading/rdf-external' },
	        {name: 'Extract RDF from XML', route:'#/home/extraction-and-loading/xml', url:'/home/extraction-and-loading/xml' },
	        {name: 'Extract RDF from SQL', route:'#/home/extraction-and-loading/sql', url:'/home/extraction-and-loading/sql' }]
	    },
	    {
	      title: "Querying and Exploration",
	      id:"querying-exploration",
	      items: [
	       {name: 'Geospatial Exploration', route:'#/home/querying-and-exploration/geospatial', url:'/home/querying-and-exploration/geospatial' },
	       {name: 'Google Maps', route:'#/home/querying-and-exploration/googlemap', url:'/home/querying-and-exploration/googlemap' },
	       {name: 'Facete', route:'#/home/querying-and-exploration/facete', url:'/home/querying-and-exploration/facete' }]
	    },
	    {
	      title: "Authoring",
	      id:"authoring",
	      items: [
	       {name: 'OntoWiki', route:'#/home/authoring/ontowiki', url:'/home/authoring/ontowiki' }]
	    },
	    {
	      title: "Linking",
	      id:"linking",
	      items: [
	       {name: 'LIMES', route:'#/home/linking/limes', url:'/home/linking/limes' }]
	    },
	    {
	     title: "Enriching and Data Cleaning",
	     id:"enriching-cleansing",
	     items: [
	       {name: 'GeoLift', route:'#/home/enriching-and-cleaning/geolift', url:'/home/enriching-and-cleaning/geolift' }]
	    }

	  ];

	}


function LoginCtrl() {}
LoginCtrl.$inject = [];

function SettingsComponentCtrl(scope, service){
	scope.components = service.getComponents().components;
}
SettingsComponentCtrl.$inject = ['$scope', 'SettingsServiceDoomy'];


function ModalWindow($scope) {

	  $scope.open = function () {
	    $("#modalWindow").modal({
	    	height : $(window).height() - 165,
	    	width : "100%",
	        show: true
	    });
	  };
	}; 
	
app.controller('NavbarCtrl', function($scope, $location) {
		//if($location.path === "/"){
		//	$location.path('/home')
		//}
		$scope.getClass = function(path) {
			if ($location.path().substr(0, path.length) === path) {
			      return "active"
			    } else {
			      return ""
			    }
			}
	});

app.controller('SidebarCtrl', function($scope, $location) {
	    $scope.isSelected = function(route) {
	        return route === $location.path();
	    }
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
