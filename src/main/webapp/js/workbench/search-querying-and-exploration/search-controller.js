'use strict';

var SearchCtrl = function($scope, ConfigurationService) {
    var services = ConfigurationService.getComponentServices(":Solr");
	var solrServiceUrl = services[0].serviceUrl;

    $scope.url = "";
	$scope.setUrl = function(){
	    $scope.url= solrServiceUrl + "/collection1/custom";
	};

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };
};