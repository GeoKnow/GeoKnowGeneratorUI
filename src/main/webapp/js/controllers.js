'use strict';


function AccountMenuCtrl($scope) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
    { name: "User Preferences",   route:'#/account/preferences', url:'/account/preferences' }];
}

function StackMenuCtrl($scope) {
	  $scope.oneAtATime = true;
	  // these data can be replaced later with the configuration
	  $scope.groups = [
	    {
	      title: "_extraction-loading_",
	      id:"extraction-loading",
	      items: [
	        {name: 'Import RDF data', route:'#/home/extraction-and-loading/import-rdf',  url:'/home/extraction-and-loading/import-rdf' },
	        {name: 'Sparqlify Extraction', route:'#/home/extraction-and-loading/sparqlify', url:'/home/extraction-and-loading/sparqlify' },
	        {name: 'TripleGeo Extraction', route:'#/home/extraction-and-loading/triplegeo', url:'/home/extraction-and-loading/triplegeo' },
	        {name: 'D2RQ Extraction', route:'#/home/extraction-and-loading/d2rq', url:'/home/extraction-and-loading/d2rq' }]
	    },
	    {
		      title: "Search Querying and Exploration",
		      id:"search-querying-and-exploration",
		      items: [
		       {name: 'Virtuoso', route:'#/home/search-querying-and-exploration/virtuoso', url:'/home/search-querying-and-exploration/virtuoso' },
		       {name: 'Facete', route:'#/home/search-querying-and-exploration/facete', url:'/home/search-querying-and-exploration/facete' },
		       {name: 'Mappify', route:'#/home/search-querying-and-exploration/mappify', url:'/home/search-querying-and-exploration/mappify' }]
		    },
	    {
	      title: "Manual revision and Authoring",
	      id:"manual-revision-and-authoring",
	      items: [
	       {name: 'OntoWiki', route:'#/home/manual-revision-and-authoring/ontowiki', url:'/home/manual-revision-and-authoring/ontowiki' },
	       {name: "Ontologies", route:'#/home/manual-revision-and-authoring/ontology', url:'/home/manual-revision-and-authoring/ontology' }]
	    },
	    {
		    title: "Linking and Fusing",
		    id:"linking-and-fusing",
		    items: [
		     {name: 'LIMES', route:'#/home/linking-and-fusing/limes', url:'/home/linking-and-fusing/limes' }]
		  },
		{
			 title: "Classification and Enrichment",
			 id:"classification-and-enrichment",
			 items: [
			   {name: 'GeoLift', route:'#/home/classification-and-enrichment/geolift', url:'/home/classification-and-enrichment/geolift' }]
		  }
	  ];

	}

app.controller('NavbarCtrl', function($scope, $location, localize) {
		//if($location.path === "/"){
		//	$location.path('/home')
		//}
		$scope.getClass = function(path) {
			if ($location.path().substr(0, path.length) === path) {
			      return "active";
			    } else {
			      return "";
			    }
			};

        $scope.languages = localize.getLanguages();
        $scope.currentLanguage = localize.language;
        $scope.setLanguage = function() {
            localize.setLanguage($scope.currentLanguage);
        };
	});

app.controller('SidebarCtrl', function($scope, $location) {
	    $scope.isSelected = function(route) {
	        return route === $location.path();
	    }
});

// this ModalWindow may be replaced witht the modalIframe directive
app.controller('ModalWindow', function ($scope) {

  $scope.OpenFullWindow = function (id) {
  	console.log("open");
    $("#" + id).modal({
    	height : $(window).height() - 165,
    	width  : "100%", 
    	show   : true
    });
  };

  $scope.OpenWindow = function (id) {
    $("#" + id).modal({
       show: true
    });
  }; 
 
  $scope.close = function (id) {
	  $("#" + id).modal('hide');
	  $('body').removeClass('modal-open');
	  $('.modal-backdrop').slideUp();
	  $('.modal-scrollable').slideUp();
  };
  
  $scope.del = function (index) {
	  
	  var person_to_delete = $scope.persons[index];

	  API.DeletePerson({ id: person_to_delete.id }, function (success) {
	    $scope.persons.splice(idx, 1);
	  });
	  
  };

  // for the child($scope.$emit)/parent($scope.$broadcast) controller to be able to close the modal window
  $scope.$on('closeModal', function(event, args) {
  	$scope.close(args.id);
  });        
  
});

var DataSourceTabCtrl = function($scope, $window, $location) {

  // The tab directive will use this data
  $scope.tabs = ['SPARQL Endpoint', 'Relational Database'];
  $scope.tabs.index = 0;
  $scope.tabs.active = function() { 
    return $scope.tabs[$scope.tabs.index]; 
    };
  
};



/*
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

var OpenMapWindow = function ($scope, $timeout, $log) {
	
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
*/

