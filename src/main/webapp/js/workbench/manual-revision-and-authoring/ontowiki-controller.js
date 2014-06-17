'use strict';
/****************************************************************************************************
*
* ONTOWIKI Controller
*
***************************************************************************************************/

app.controller('OntoWikiCtrl', function($scope, ConfigurationService) {
	$scope.component = ConfigurationService.getComponent(":OntoWiki");
	var services = ConfigurationService.getComponentServices(":OntoWiki");
	$scope.url = services[0].serviceUrl;
});

