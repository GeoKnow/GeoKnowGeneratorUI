'use strict';

var module = angular.module('app.directives', []);

app.directive("modalIframe", function ($compile) {
  return {
    template: '<iframe  id="mod-frame" src="{{url}}"></iframe>',
    restrict: 'E',
    link: function (scope, elm, attr) {
        scope.openModal = function(){
            $('#modal').modal({
                width:'100%',
                height : $(window).height() - 165
            });
            $('#modal').modal('show');
        }
    }
  };
});

app.directive('regexValidate', function() {
    var expressions = [];
    expressions['url']            = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    expressions['identifier']     =  /^[a-zA-Z0-9_]*$/ ;
    expressions['sparqlEndpoint'] =  /^https?:\/\/[^\/]+\/sparql\/?$/;
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            var regex = expressions[attr.regexValidate];
            ctrl.$parsers.unshift(function(value) {
                var valid = regex.test(value);
                ctrl.$setValidity('regexValidate', valid);
                return valid ? value : undefined;
            });
            ctrl.$formatters.unshift(function(value) {
                ctrl.$setValidity('regexValidate', regex.test(value));
                return value;
            });
        }
    };
});


app.directive('uniqueIdentifier', ['$compile', 'ConfigurationService', function($compile, ConfigurationService){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ngModel) {
          var list = ConfigurationService.getIdentifiers();
          ngModel.$parsers.unshift(function (value) {
            ngModel.$setValidity('uniqueIdentifier', list.indexOf(':'+value) === -1);
            return value;
          });
        }
    }
 }]);

