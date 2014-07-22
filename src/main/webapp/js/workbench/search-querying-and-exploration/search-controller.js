'use strict';

var SearchCtrl = function($scope, ConfigurationService, StackMenuService) {
    var services = ConfigurationService.getComponentServices(":Solr");
	var searchServiceUrl = services[0].serviceUrl;

    $scope.url = searchServiceUrl;

    $scope.toggleButtonName = "";

    $scope.refreshToggleButton = function() {
        if (StackMenuService.isShownStackMenu()) {
            $scope.toggleButtonName = "_hide-stack-menu_";
        } else {
            $scope.toggleButtonName = "_show-stack-menu_";
        }
    };

    $scope.refreshToggleButton();

    $scope.toggleStackMenu = function() {
        StackMenuService.toggleStackMenu();
        $scope.refreshToggleButton();
    };

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };
};