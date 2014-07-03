'use strict';

var SearchCtrl = function($scope, ConfigurationService) {
    var services = ConfigurationService.getComponentServices(":Solr");
	var searchServiceUrl = services[0].serviceUrl;

    $scope.url = "";
	$scope.setUrl = function(){
	    $scope.url= searchServiceUrl;
	};

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };
};