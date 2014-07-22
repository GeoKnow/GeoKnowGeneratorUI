'use strict';

var ThesaurusCtrl = function($scope, ConfigurationService, StackMenuService, localize) {
	var miniDixServices = ConfigurationService.getComponentServices(":MiniDix");
    var miniDixServiceUrl = miniDixServices[0].serviceUrl;
    var ontology = "http://acc.ontos.com/thesaurus/concept/v2/";

    $scope.url = miniDixServiceUrl + "/?ontology=" + ontology + "&newConceptsOntology=" + ontology + "&writableOntologies=" + ontology;

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

    $scope.$watch(function () {
        return localize.language;
    }, function () {
        $scope.url = miniDixServiceUrl + "/?ontology=" + ontology + "&newConceptsOntology=" + ontology + "&writableOntologies=" + ontology + "?lang=" + localize.language;
    });
};