'use strict';

var module = angular.module('app.directives', []);

/*
This directive will render a header for a component integration page
*/
module.directive("componentHeader", function(){
  return {
    restrict: 'E', 
    templateUrl: 'js/workbench/partials/component-header.html'
  };
});

/**
* Modal iFrame directive is to show component tools in a
* modal window that is the size of the browser's window
*/
module.directive("modalIframe", function ($compile) {
  return {
    template: '<iframe  id="mod-frame" src="{{url}}"></iframe>',
    restrict: 'E',
    link: function (scope, elm, attr) {
        
        scope.closeModal = function(){
          $('#fullModal').modal('hide');
        };
        
        scope.openModal = function(){
            // $('#modal').modal({
            //     width:'100%',
            //     height : $(window).height() - 165
            // });
            console.log("URL:" + scope.url);

            $('#fullModal').css({
                width: $(window).width() ,
                height : $(window).height(),
                position: 'fixed',
                'margin-left': function () {
                     return -($(this).width() / 2);
                 },
                // 'margin-top': function () {
                //     return -($(this).height() / 2)
                // }
            });

            $('#fullModal').find('.modal-body').css({
                width:'auto',
                padding:'0px', 
                height: function(){ 
                    return $(window).height() - 60; 
                }, 
            });

            $('#fullModal').modal('show');
        };
    }
  };
});

module.directive('ngConfirmClick', [
  function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function() {
                var message = attrs.ngConfirmMessage;
                if (message && confirm(message)) {
                    scope.$modulely(attrs.ngConfirmClick);
                }
            });
            scope.$on('$destroy', function() {
                element.off('click');
            });
        }
    }
  }
]);

//directive to fix angularjs autofill issue (update form model on autofill)
module.directive('autofillable', function ($timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            scope.check = function(){
                var val = elem[0].value;
                if(ctrl.$viewValue !== val){
                    ctrl.$setViewValue(val)
                }
                $timeout(scope.check, 300);
            };
            scope.check();
        }
    }
});

//directive to set focus in modal dialogs
module.directive('modalFocus', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var focusElementId = attrs.modalFocus;
            scope.$watch(function() {
                return $('#'+element[0].id).is(':visible');
            }, function(value) {
                if (value) {
                    $timeout(function () {
                        $(focusElementId).focus();
                    }, 400);
                }
            });

            scope.$watch(attrs.focusInput, function() {
                $timeout(function () {
                    element[0].focus();
                })
            });
        }
    };
});

module.directive("confirmField", function() {
    return {
        require: "ngModel",
        link: function(scope, elem, attrs, ctrl) {
            var otherInput = elem.inheritedData("$formController")[attrs.confirmField];

            ctrl.$parsers.unshift(function(value) {
                if(value === otherInput.$viewValue) {
                    ctrl.$setValidity("confirmField", true);
                    return value;
                }
                ctrl.$setValidity("confirmField", false);
            });

            otherInput.$parsers.unshift(function(value) {
                ctrl.$setValidity("confirmField", value === ctrl.$viewValue);
                return value;
            });
        }
    };
});


/****************************************************************************************************
*
* GEOLIFT Directives
*
***************************************************************************************************/

module.directive("geoliftModule", function ($compile) {
	  var count=0;
	  return {
	    link: function (scope, elm, attr) {
	    	var useDirective = scope.useDirective;
	    	if(useDirective == 1){
	    			var params = scope.directiveParams;
	        		elm.replaceWith( '<select class="form-control input-sm" ng-options="o.label for o in modOptions"'+ 
	        				'id="module'+count+'" ng-model="modOption"><option>'+params[count].module+'</option></select>' );
	        		if(count == (params.length-1)){
	        			count = 0;
	        		}else{
	        			count++;
	        		}
	    		}
	    	}
	  	};
	});

module.directive("geoliftParam", function ($compile) {
	  var count=0;
	  return {
	    link: function (scope, elm, attr) {
	    	var useDirective = scope.useDirective;
	    	if(useDirective == 1){
	    			var params = scope.directiveParams;
	        		elm.replaceWith( '<select class="form-control input-sm" ng-options="o.label for o in modOptions"'+ 
	        				'id="parameter'+count+'" ng-model="paramOption"><option>'+params[count].parameter+'</option></select>' );
	        		if(count == (params.length-1)){
	        			count = 0;
	        		}else{
	        			count++;
	        		}
	    		}
	    	}
	  	}; 
	});

module.directive("geoliftValue", function ($compile) {
	  var count=0;
	  return {
	    link: function (scope, elm, attr) {
	    	var useDirective = scope.useDirective;
	    	if(useDirective == 1){
	    			var params = scope.directiveParams;
	        		elm.replaceWith( '<select class="form-control input-sm" ng-options="o.label for o in modOptions"'+ 
	        				'id="paramVal'+count+'" ng-model="paramVal"><option>'+params[count].value+'</option></select>' );
	        		if(count == (params.length-1)){
	        			count = 0;
	        		}else{
	        			count++;
	        		}
	    		}
	    	}
	  	};
	});

module.directive("downloadResult", function ($compile) {
	  return {
		template: '<a class="btn btn-sm btn-success" target="_self" href="/GeoLift-Downloads/result.ttl" download="result.ttl">Download</a>',
		restrict: 'E'
	    };
	});

/**
* Form validation directives
*/
module.directive('regexValidate', function() {
    var expressions = [];
    expressions['url']            =  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    expressions['partialUrl']     =  /^([\w-]+)+([\w-]+\/?)*\/$/ ;
    expressions['identifier']     =  /^[a-zA-Z0-9_]*$/ ;
    expressions['sparqlEndpoint'] =  /^https?:\/\/.*\/?$/; // /^https?:\/\/[^\/]+\/sparql\/?$/
    expressions['basicPassword']  = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
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


module.directive('uniqueIdentifier', ['$compile', 'ConfigurationService', function($compile, ConfigurationService){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attr, ctrl) {
          // get the uriBase to be used with the value
          var uriBase= (scope.uriBase==undefined? (scope.$parent.uriBase==undefined? ConfigurationService.getUriBase() : scope.$parent.uriBase) : scope.uriBase);
          // executes only when 
          elm.unbind('input').unbind('keydown').unbind('change');
          elm.bind('blur', function () {
            scope.$apply(dovalidation);
          });

          // this was a test to execute the validation using $scope.$broadcast('validateUnique')
          //scope.$on('validateUnique', dovalidation)
          
          function dovalidation() {
            var uri= uriBase + elm.val();
            console.log("validateUnique :" + uri);
            ConfigurationService.resourceExists(uri).then(
              //success
              function(response){
                ctrl.$setValidity('uniqueIdentifier', !response);
              },
              //fail
              function(response){
                ctrl.$setValidity('uniqueIdentifier', false);
              });
          }
        }
    };
 }]);

module.directive('uniqueUserName', ['$compile', 'UsersService', function($compile, UsersService){
     return {
         restrict: 'A',
         require: 'ngModel',
         link: function(scope, elem, attr, ngModel) {
           ngModel.$parsers.unshift(function (value) {
             var list = UsersService.getUserNames();
             ngModel.$setValidity('uniqueUserName', list.indexOf(value) === -1);
             return value;
           });
         }
     };
 }]);

module.directive('uniqueEmail', ['$compile', 'UsersService', function($compile, UsersService){
     return {
         restrict: 'A',
         require: 'ngModel',
         link: function(scope, elem, attr, ngModel) {
           ngModel.$parsers.unshift(function (value) {
             var list = UsersService.getEmails();
             ngModel.$setValidity('uniqueEmail', list.indexOf(value) === -1);
             return value;
           });
         }
     };
 }]);