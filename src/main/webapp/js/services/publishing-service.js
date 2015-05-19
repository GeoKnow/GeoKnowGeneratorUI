ar module = angular.module('app.publishing-service', []);

module.factory("PublishingService", function ($http, ConfigurationService, AccountService) {

  var createMetaData = function(uriGraph, source, license){
      var meta = 
             "<"+uriGraph+"> <http://purl.org/dc/elements/1.1/creator> <"+ConfigurationService.getUriBase()+AccountService.getAccount().getUsername()+"> . "
          +  "<"+uriGraph+"> <http://purl.org/dc/terms/source> <"+source+"> ." 
          +  "<"+uriGraph+"> <http://purl.org/dc/terms/license> <"+license.replace(':', ConfigurationService.getUriBase())+"> .";
    return meta;
  }

  var service = {

    


  }
  return service;
}