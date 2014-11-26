'use strict';

var module = angular.module('app.directives', []);

/**
* Modal iFrame directive is to show component tools in a
* modal window that is the size of the browser's window
*/
app.directive("modalIframe", function ($compile) {
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

app.directive('ngConfirmClick', [
  function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function() {
                var message = attrs.ngConfirmMessage;
                if (message && confirm(message)) {
                    scope.$apply(attrs.ngConfirmClick);
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
app.directive('autofillable', function ($timeout) {
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
app.directive('modalFocus', function ($timeout) {
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

app.directive("confirmField", function() {
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

app.directive("geoliftModule", function ($compile) {
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

app.directive("geoliftParam", function ($compile) {
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

app.directive("geoliftValue", function ($compile) {
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

app.directive("downloadResult", function ($compile) {
	  return {
		template: '<a class="btn btn-sm btn-success" target="_self" href="/GeoLift-Downloads/result.ttl" download="result.ttl">Download</a>',
		restrict: 'E'
	    };
	});

/**
* Form validation directives
*/
app.directive('regexValidate', function() {
    var expressions = [];
    expressions['url']            =  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    expressions['uri']            =  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    expressions['identifier']     =  /^[a-zA-Z0-9_]*$/ ;
    expressions['sparqlEndpoint'] =  /^https?:\/\/.+\/sparql\/?$/; // /^https?:\/\/[^\/]+\/sparql\/?$/
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
    };
 }]);

app.directive('uniqueUserName', ['$compile', 'UsersService', function($compile, UsersService){
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

app.directive('uniqueEmail', ['$compile', 'UsersService', function($compile, UsersService){
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