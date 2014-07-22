'use strict';


function AccountMenuCtrl($scope) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
    { name: "_user-pref_",   route:'#/account/preferences', url:'/account/preferences' }];
}

function WorkbenchCtrl($scope, StackMenuService) {
    $scope.showStackMenu = StackMenuService.isShownStackMenu();

    $scope.$watch(function () {
        return StackMenuService.isShownStackMenu();
    }, function () {
        $scope.showStackMenu = StackMenuService.isShownStackMenu();
        if ($scope.showStackMenu) {
            $('#segment1').removeClass('col-xs-12');
            $('#segment1').addClass('col-xs-10');
        } else {
            $('#segment1').removeClass('col-xs-10');
            $('#segment1').addClass('col-xs-12');
        }
    });
}

function StackMenuCtrl($scope, ConfigurationService, localize, AccountService, $window, flash, DocumentsService) {
    var services = ConfigurationService.getComponentServices(":Solr");
	var searchServiceUrl = services[0].serviceUrl;

	var miniDixServices = ConfigurationService.getComponentServices(":MiniDix");
    var miniDixServiceUrl = miniDixServices[0].serviceUrl;
    var ontology = "http://acc.ontos.com/thesaurus/concept/v2/";

	  $scope.oneAtATime = true;
	  // these data can be replaced later with the configuration
	  $scope.groups = [
	    {
	      title: "_extraction-loading_",
	      id:"extraction-loading",
	      items: [
//	        {name: '_import-rdf_', route:'#/home/extraction-and-loading/import-rdf',  url:'/home/extraction-and-loading/import-rdf' },
//	        {name: 'Sparqlify Extraction', route:'#/home/extraction-and-loading/sparqlify', url:'/home/extraction-and-loading/sparqlify' },
//	        {name: 'TripleGeo Extraction', route:'#/home/extraction-and-loading/triplegeo', url:'/home/extraction-and-loading/triplegeo' },
//	        {name: 'D2RQ Extraction', route:'#/home/extraction-and-loading/d2rq', url:'/home/extraction-and-loading/d2rq' },
            {name: '_upload-files_', route:'#/home/extraction-and-loading/upload-file', url:'/home/extraction-and-loading/upload-file', requiredServices:[":DocumentUploadService"] },
            {name: '_reindex-docs_', route:null, url:null, modalId:'#reindexDocuments', requiredServices:[":ReindexService"] }]
	    },
	    {
		      title: "_search-querying-exploration_",
		      id:"search-querying-and-exploration",
		      items: [
//		       {name: 'Virtuoso', route:'#/home/search-querying-and-exploration/virtuoso', url:'/home/search-querying-and-exploration/virtuoso' },
//		       {name: 'Facete', route:'#/home/search-querying-and-exploration/facete', url:'/home/search-querying-and-exploration/facete' },
//		       {name: 'Mappify', route:'#/home/search-querying-and-exploration/mappify', url:'/home/search-querying-and-exploration/mappify' },
//		       {name: '_search_', route:null, url:searchServiceUrl, modaltitle:'_faceted-search_', requiredServices:[":SearchService"] },
		       {name: '_search_', route:'#/home/search-querying-and-exploration/search', url:'/home/search-querying-and-exploration/search', requiredServices:[":SearchService"] }]
		    },
	    {
	      title: "_man-revision-authoring_",
	      id:"manual-revision-and-authoring",
	      items: [
//	       {name: 'OntoWiki', route:'#/home/manual-revision-and-authoring/ontowiki', url:'/home/manual-revision-and-authoring/ontowiki' },
//	       {name: "_ontologies_", route:'#/home/manual-revision-and-authoring/ontology', url:'/home/manual-revision-and-authoring/ontology' },
//	       {name: "_thesaurus-management_", route:null, url:miniDixServiceUrl + "/?ontology=" + ontology + "&newConceptsOntology=" + ontology + "&writableOntologies=" + ontology, modaltitle:'MiniDix', requiredServices:[":MiniDixService"] },
           {name: "_thesaurus-management_", route:'#/home/manual-revision-and-authoring/thesaurus', url:'/home/manual-revision-and-authoring/thesaurus', requiredServices:[":MiniDixService"] },
	       {name: "_edit-uploads_", route:'#/home/manual-revision-and-authoring/edit-uploads', url:'/home/manual-revision-and-authoring/edit-uploads', requiredServices:[":DocumentService"] }]
	    },
	    /*
	    {
		    title: "_linking-fusing_",
		    id:"linking-and-fusing",
		    items: [
		     {name: 'LIMES', route:'#/home/linking-and-fusing/limes', url:'/home/linking-and-fusing/limes' }]
		  },
		{
			 title: "_classification-enrichment_",
			 id:"classification-and-enrichment",
			 items: [
			   {name: 'GeoLift', route:'#/home/classification-and-enrichment/geolift', url:'/home/classification-and-enrichment/geolift' }]
		  }
		  */
	  ];

	  $scope.url=null;
	  $scope.setDirectUrl = function(url) {
	    $scope.url = url;
	    //add locale for MiniDix
	    if (url.indexOf(miniDixServiceUrl)==0)
	        $scope.url += ("&locale=" + localize.language);
	    else if (url.indexOf(searchServiceUrl)==0) {
	        $scope.url += ("?lang=" + localize.language);
	        $scope.setCheckReindexPoll();
	    }
	  };

	  $scope.close = function(modalID) {
	    if ($scope.reindexPoll != null) {
	        $scope.closeCheckReindexPoll();
	    }
	    $(modalID).modal('hide');
        $('body').removeClass('modal-open');
      	$('.modal-backdrop').slideUp();
      	$('.modal-scrollable').slideUp();
      };

      $scope.setModalTitle = function(title) {
        $scope.modaltitle = title;
      };

      $scope.showItem = function(item) {
        if (AccountService.isAdmin()) return true; //show all items to admin
        var role = AccountService.getRole();
        if (role==null) return false; //hide all
        var allowedServices = role.services;
        for (var ind in item.requiredServices) {
            if (allowedServices.indexOf(item.requiredServices[ind]) == -1) //hide item if one of required services is not allowed for current user
                return false;
        }
        return true;
      };

      $scope.showGroup = function(group) {
        if (AccountService.isAdmin()) return true;
        //hide group if all items are hidden
        for (var ind in group.items) {
            if ($scope.showItem(group.items[ind])) return true;
        }
        return false;
      };

      $scope.reindexPoll = null;

      $scope.setCheckReindexPoll = function() {
        console.log("start checking reindexing");
        $scope.reindexPoll = $window.setInterval(function() {
            console.log("check reindexing tick");
            DocumentsService.isReindexing().then(function(reindexing) {
                if (reindexing) {
                    $scope.close("#fullModalDirect");
                    flash.error = localize.getLocalizedString("_doc-reindex-running-error_");
                    $scope.closeCheckReindexPoll();
                }
            });
        }, 20000);
      };

      $scope.closeCheckReindexPoll = function() {
        $window.clearInterval($scope.reindexPoll);
        $scope.reindexPoll = null;
        console.log("check reindexing closed");
      };

    $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        $scope.closeCheckReindexPoll();
    });

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

