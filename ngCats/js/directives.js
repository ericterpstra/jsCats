'use strict';

/**
 * myDirectives Module
 *
 * This module contains custom directives (only one, really)
 */

angular.module('myDirectives', [])
.directive('catcarousel', function(){
  return {
    templateUrl: 'partials/catCarousel.html',
    restrict: 'EAC',
    link: function (scope,element,attr) {
      scope.$watch('cat', function () {
        scope.pics = scope.$eval(attr.pics);
        $(element).carousel({
          interval: 0
        });
      });
    }
  } 
});
