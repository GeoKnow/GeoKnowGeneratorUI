'use strict';

function AccountMenuCtrl($scope) {
  $scope.oneAtATime = true;
  // these data can be replaced later with the configuration
  $scope.items = [
    { name: "User Preferences",   route:'#/account/preferences', url:'/account/preferences' }];
}

function StackMenuCtrl($scope, AccountService) {
    
	  $scope.oneAtATime = true;
	  // these data can be replaced later with the configuration
	  $scope.groups = [
	    {
	      title: "Extraction and Loading",
	      id:"extraction-loading",
	      items: [
	        {name: 'Import RDF data', route:'#/workbench/extraction-and-loading/import-rdf',  url:'/workbench/extraction-and-loading/import-rdf', requiredServices:[] },
	        {name: 'Sparqlify Extraction', route:'#/workbench/extraction-and-loading/sparqlify', url:'/workbench/extraction-and-loading/sparqlify', requiredServices:[] },
	        {name: 'TripleGeo Extraction', route:'#/workbench/extraction-and-loading/triplegeo', url:'/workbench/extraction-and-loading/triplegeo', requiredServices:[] }]
	    },
	    {
		      title: "Search Querying and Exploration",
		      id:"search-querying-and-exploration",
		      items: [
		       {name: 'Virtuoso', route:'#/workbench/search-querying-and-exploration/virtuoso', url:'/workbench/search-querying-and-exploration/virtuoso', requiredServices:[] },
		       {name: 'Facete', route:'#/workbench/search-querying-and-exploration/facete', url:'/workbench/search-querying-and-exploration/facete', requiredServices:[] },
		       {name: 'Mappify', route:'#/workbench/search-querying-and-exploration/mappify', url:'/workbench/search-querying-and-exploration/mappify', requiredServices:[] }]
		    },
	    {
	      title: "Manual revision and Authoring",
	      id:"manual-revision-and-authoring",
	      items: [
	       {name: 'OntoWiki', route:'#/workbench/manual-revision-and-authoring/ontowiki', url:'/workbench/manual-revision-and-authoring/ontowiki', requiredServices:[] }]
	    },
	    {
		    title: "Linking and Fusing",
		    id:"linking-and-fusing",
		    items: [
		     {name: 'LIMES', route:'#/workbench/linking-and-fusing/limes', url:'/workbench/linking-and-fusing/limes', requiredServices:[] }, 
         {name: 'FAGI-gis', route:'#/workbench/linking-and-fusing/fagi-gis', url:'/workbench/linking-and-fusing/fagi-gis', requiredServices:[] }
         ]
		  },
		{
			 title: "Classification and Enrichment",
			 id:"classification-and-enrichment",
			 items: [
			   {name: 'Deer', route:'#/workbench/classification-and-enrichment/deer', url:'/workbench/classification-and-enrichment/deer', requiredServices:[] }]
		  }
	  ];

    $scope.showItem = function(item) {
      if (AccountService.getAccount().isAdmin()) return true; //show all items to admin
      var role = AccountService.getAccount().getRole();
        if (role==null) return false; //hide all
      var allowedServices = role.services;
      for (var ind in item.requiredServices) {
          if (allowedServices.indexOf(item.requiredServices[ind]) == -1) //hide item if one of required services is not allowed for current user
              return false;
      }
      return true;
    };

    $scope.showGroup = function(group) {
      if (AccountService.getAccount().isAdmin()) return true;
      //hide group if all items are hidden
      for (var ind in group.items) {
          if ($scope.showItem(group.items[ind])) return true;
      }
      return false;
    };

	}

app.controller('NavbarCtrl', function($scope, $location) {
		$scope.getClass = function(path) {
			if ($location.path().substr(0, path.length) === path) {
			      return "active";
			    } else {
			      return "";
			    }
			};
	});

app.controller('SidebarCtrl', function($scope, $location) {
	    $scope.isSelected = function(route) {
	        return route === $location.path();
	    }
});
/*
app.controller('ModalNewJobCtrl', function ($scope, $modalInstance, sname) {
  $scope.job = {
    name : sname,
    description : ""
  };

  $scope.ok = function () {
    var input= angular.copy($scope.job)
    $modalInstance.close(input);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
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
*/


