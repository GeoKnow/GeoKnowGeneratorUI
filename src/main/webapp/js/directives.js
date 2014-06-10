'use strict';

var module = angular.module('app.directives', []);

app.directive("modalIframe", function ($compile) {
  return {
    template: '<iframe  id="mod-frame" src="{{url}}"></iframe>',
    restrict: 'E',
    link: function (scope, elm, attr) {
        
        scope.openModal = function(modalId){
            // $('#modal').modal({
            //     width:'100%',
            //     height : $(window).height() - 165
            // });
            //console.log("URL:" + scope.url);

            if (modalId==null) modalId = 'fullModal';

            $('#'+modalId).css({
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

            $('#'+modalId).find('.modal-body').css({
                width:'auto',
                padding:'0px', 
                height: function(){ 
                    return $(window).height() - 60; 
                }, 
            });

            $('#'+modalId).modal('show');
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

/****************************************************************************************************/

app.directive('regexValidate', function() {
    var expressions = [];
    expressions['url']            =  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    expressions['uri']            =  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    expressions['identifier']     =  /^[a-zA-Z0-9_]*$/ ;
    expressions['sparqlEndpoint'] =  /^https?:\/\/.+\/sparql\/?$/; // /^https?:\/\/[^\/]+\/sparql\/?$/
    expressions['docNumber']        =  /^D([0-9]{3})$/;
    expressions['docIteration']   =  /^IT([0-9]+)$/;
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