'use strict';

var module = angular.module('app.directives', []);

app.directive("ngPortlet", function ($compile) {
  return {
    template: '<iframe  id="mod-frame" src="{{url}}"></iframe>',
    restrict: 'E',
    link: function (scope, elm, attr) {
        scope.OpenFullWindow = function(){
            elm.append($compile('<ng-portlet></ng-portlet>')(scope));
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

