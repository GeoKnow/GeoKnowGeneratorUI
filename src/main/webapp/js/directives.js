'use strict';

var module = angular.module('app.directives', []);


/* directives are actions to happens when an event is triggered
return attributes of a directive: 
restrict:'E' // A=Attribute, C=Class Name, E=Element, M=HTML
*/
/*
module.directive('navMenu', function($location) {
	return {
        restrict: 'A',
        link: function(scope, element) {
            var $ul = $(element);
            // $ul.addClass("nav nav-tabs");

            var $tabs = $ul.children();
            var tabMap = {};
            $tabs.each(function() {
              var $li = $(this);
              //Substring 1 to remove the # at the beginning (because location.path() below does not return the #)
              tabMap[$li.find('a').attr('href').substring(1)] = $li;
            });

            scope.location = location;
            scope.$watch('location.path()', function(newPath) {
                $tabs.removeClass("active");
                tabMap[newPath].addClass("active");
            });
        }

    };
});*/

/*
module.directive('autoComplete', 
	function($timeout) {
    	return function(scope, iElement, iAttrs) {
            iElement.autocomplete({
                source: scope[iAttrs.uiItems],
                select: function() {
                    $timeout(function() {
                      iElement.trigger('input');
                    }, 0);
                }
            });
    	};
	});

	module.directive('inlineEdit', 
		function(){
			var editTemplate = '<input type="text" ng-model="title" ng-show="editMode" rows="1" cols="10"/><input ng-show="editMode" type="button" value="OK" ng-click="switchToPreview()" />';
			var previewTemplate = '<h1 ng-hide="editMode" ng-click="switchToEdit()">preview</h1>';

			return{
				restrict:'E',
				compile:function(tElement, tAttrs, transclude){
					var title = tElement.text();
					tElement.html(editTemplate);


					var previewElement =  angular.element(previewTemplate);
					tElement.append(previewElement);

					return function(scope, element, attrs){
						scope.editMode = true;
						scope.title = title;

						scope.switchToPreview = function(){
							previewElement.html(scope.title);
							scope.editMode = false;
						}

						scope.switchToEdit = function(){
							scope.editMode = true;
						}
					}
				}
			}
	});*/