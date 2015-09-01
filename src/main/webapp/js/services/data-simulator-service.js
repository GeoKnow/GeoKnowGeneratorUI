'use strict';

var module = angular.module('app.data-simulator-service', []);

module.factory("DataSimulatorService", function ($http, ComponentsService, Ns) {

  var componentId ="data-simulator";
  var serviceId = "data-simulator-service";
  var serviceUrl = "";

  var promise = ComponentsService.getService(serviceId).then(
    //success
    function(service){
      serviceUrl = service.serviceUrl;
      console.log(serviceUrl);
      return service;
    });

	var service = {

		run : function(start, end, productUri, graphUri, interval) {
      var params="start=" + encodeURI(start)
        + "&end=" + encodeURI(end)
        + "&graphUri=" + encodeURI(Ns.lengthen(graphUri))
        + "&interval=" + encodeURI(interval)
        + "&productUri=" + encodeURI(productUri);
      console.log(params);
      return $http({
        url: serviceUrl + "run?"+params,
        method: "POST"
      });
		},

		step : function(start, productUri, graphUri) {
      var params="start=" + encodeURI(start)
        + "&graphUri=" + encodeURI(Ns.lengthen(graphUri))
        + "&productUri=" + encodeURI(productUri);
        console.log(params);
      return $http({
        url: serviceUrl + "step?"+params,
        method: "POST"
      });
		},
    
    pause : function() {
      return $http({
        url: serviceUrl + "pause",
        method: "POST"
      });
    },

    calculateMetrics : function(productUri, graphUri) {
      var params ="graphUri=" + encodeURI(Ns.lengthen(graphUri))
        + "&productUri=" + encodeURI(productUri);
      console.log(params);
      return $http({
        url: serviceUrl + "calculateMetrics?"+params,
        method: "POST"
      });
    }
	};

	return service;

});