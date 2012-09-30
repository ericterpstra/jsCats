'use strict';

/**
 *  ### List View Controller
 *  This controller fetches the cat data and controls the logic for the list of cats.
 */
function CatListController($scope,$rootScope,$routeParams,CatsService,$location) {

  // When a user clicks a cat thumbnail, construct a new URL using the catId and current page number
  // Then go to that URL with the $location.path() function.
  $scope.getDetail = function (catId) {
    $location.path('/cat/' + catId + "/" + $routeParams.page);
  };

  // Display cats based on the specified page.
  $scope.goToPage = function(page) {
    var first = (parseInt(page) * catsPerPage) - catsPerPage;
    var last = first + catsPerPage;
    $scope.cats = CatsService.getCatCollection().slice(first,last);
  };

  // Cycle pages when the user clicks Prev/Next
  // The 'page' param in the URL is used to keep track of the current page.
  $scope.changePage = function(pagingAction) {
    var page = 1;
    if(pagingAction === 'prev') {
      page = parseInt($routeParams.page) - 1 || 1;
    } else {
      page = parseInt($routeParams.page) < (CatsService.getCatCollection().length / catsPerPage) ? parseInt($routeParams.page) + 1 : 1;
    }
    $location.path('/cats/' + page);
  };

  // Set the max number of cats per page
  var catsPerPage = 18;

  // If the cat collection does not exist, retrieve it with CatsService. Otherwise go to the requested page.
  if( !CatsService.getCatCollection() || !CatsService.getCatCollection().length ) {
    $scope.stillLoading = true;
    CatsService.getCats(function (data) {
      // The page number can be found in the URL. Get it via $routeParams, or set page to 1 if undefined.
      var page = $routeParams.page || 1;
      $scope.goToPage(page);
      $scope.stillLoading = false;
    });
  } else {
    // The cat collection exists, so just go to whatever page is specified in the url. 
    // This scenario occurs when the 'Back' button is clicked on the catDetail page.
    $scope.goToPage($routeParams.page || 1);
  }

}
CatListController.$inject = ['$scope','$rootScope', '$routeParams', 'CatsService', '$location'];


/**
 * ### CAT DETAIL CONTROLLER
 * When a Cat Thumbnail is clicked, a detail page appears for the clicked cat.
 * This controller handles the logic for the detail page.
 */
function CatDetailController($scope,$rootScope, $routeParams, $filter, $location, CatsService) {

  // This handles the Next/Prev button clicks.
  $scope.newCat = function(idx) {
    // Cycle through the cats in the collection
    if( idx >= CatsService.getCatCollection().length ){
      CatsService.setActiveCatIndex( 0 );
    } else if ( idx < 0 ) {
      CatsService.setActiveCatIndex( CatsService.getCatCollection().length - 1 );
    } else {
      CatsService.setActiveCatIndex( idx );
    }
    // Reset $scope vars based on the currently viewed cat
    $scope.cat = CatsService.getCatCollection()[CatsService.getActiveCatIndex()];
    $scope.catIndex = CatsService.getActiveCatIndex();
  }
  
  // Handle the Back button click by setting a new URL location
  $scope.goBack = function () {
    var page = $routeParams.page || 1;
    $location.path('/cats/' + page);
  }

  // When the catDetail page loads, fetch the detail for a specific cat
  CatsService.getCat($routeParams.catId, function (result) {
    $scope.cat = result;
  });

  // Grab the index value for the currently selected cat.
  $scope.catIndex = CatsService.getActiveCatIndex();
}
CatDetailController.$inject = ['$scope','$rootScope', '$routeParams', '$filter', '$location', 'CatsService'];
