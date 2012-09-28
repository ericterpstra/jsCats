// 'use strict';


// Declare app level module which depends on filters, and services
angular.module('catApp', ['catService','myDirectives'])
/**
 * Below is where the URL routes are defined.  Each route is defined with the $routeProvider.when() function.
 * If no route is specified, the app will default to the first page of cats.
 */
// 
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/cats/:page', {templateUrl: 'partials/catList.html', controller: CatListController});
    $routeProvider.when('/cat/:catId/:page', {templateUrl: 'partials/catDetail.html', controller: CatDetailController});
    $routeProvider.otherwise({redirectTo: '/cats/1'});
}])
/**
 * Setting the ENDPOINT constant to LOCAL or REMOTE will
 * determine if the the application uses a static json file 
 * on the local server, or hits the Petfinder API.
 */
.constant('ENDPOINT','LOCAL')
