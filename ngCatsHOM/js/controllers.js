'use strict';

/**
 *  Main Controller
 *  The main purpose of this controller is to determine 
 *  which view is active (list or detail).
 */
function MainController($scope, $rootScope, eventBroadcast) {
  // An event handler for clicking on a cat thumbnail in the list view
  $scope.$on('catClicked',function() {
    switchView();
  });
  
  // An event handler for clicking the 'Back' button in the detail view
  $scope.$on('backClicked',function() {
    switchView();
  });

  // This method switches the boolean values of 
  // 'viewList' and 'viewDetail' in order to swap the current view.
  function switchView() {
    $scope.viewList = !$scope.viewList;
    $scope.viewDetail = !$scope.viewDetail;
  }

  // Starting values for the view booleans. These are used by the 
  // ngShow directives to determine whether or not to hide or show the divs
  $scope.viewList = true;
  $scope.viewDetail = false;
}
// Explicitly inject stuff. This is optional unless you plan on minifying the code.
MainController.$inject = ['$scope','$rootScope','eventBroadcast'];

/**
 *  List View Controller
 *  This controller fetches the cat data and controls the logic for the list of cats.
 */
function CatListController($scope,$rootScope,$routeParams,CatsService,$location,eventBroadcast) {

  // This is the click handler for each thumbnail
  $scope.getDetail = function() {
    // When a thumbnail is clicked, a 'catClicked' event is broadcast, 
    // and the data for the clicked cat is attached to eventBroadcaster
    eventBroadcast.broadcast('catClicked',{cat:this.cat});
  };

  // If there are more cats than can fit in the grid, more pages are needed.  
  // This function will switch to a new page in the grid.
  $scope.goToPage = function(page) {
    // Figure out the first and last cats that should appear on the page
    var first = (parseInt(page) * catsPerPage) - catsPerPage;
    var last = first + catsPerPage;
    
    // Get a subset of the catCollection based on the first and last cats defined above.
    $scope.cats = $rootScope.catCollection.slice(first,last);
    
    // Store the current page for later reference.
    $scope.page = page;
  };

  // This handles the Next/Prev buttons to switch pages. 
  $scope.changePage = function(pagingAction) {
    var page = 1;
    if(pagingAction === 'prev') {
      page = $scope.page === 1 ? Math.ceil($rootScope.catCollection.length / catsPerPage) : $scope.page - 1;
    } else {
      page = $scope.page < ($rootScope.catCollection.length / catsPerPage) ? $scope.page + 1 : 1;
    }
    $scope.goToPage(page);
  };

  // This method is called via ngMouseover. 
  // When a user hovers over a cat, it's name is displayed below the grid.
  $scope.showName = function(catName) {
    $scope.name = catName;
  }

  // Define the maximum number of cats that will appear in the list/grid
  var catsPerPage = 75;

  // If the catCollection is not yet defined, fetch the data, otherwise go to page one.
  if( !$rootScope.catCollection ) {
    // This uses the CatService defined in services.js to retrieve the list of cats. 
    CatsService.getCats(function (data) {
      // The cat list returned from the getCats method is loaded onto $rootScope 
      // so it can be easily shared between controllers.
      $rootScope.catCollection = data
      $scope.goToPage(1);
    });
  } else {
    // If catsCollection is defined, go to page 1.
    $scope.cats = $rootScope.catCollection.slice(0,catsPerPage);
    $scope.goToPage(1);
  }
}
CatListController.$inject = ['$scope','$rootScope', '$routeParams', 'CatsService', '$location','eventBroadcast'];


/**
 * CAT DETAIL CONTROLLER
 * When a Cat Thumbnail is clicked, a detail page appears for the clicked cat.
 * This controller handles the logic for the detail page.
 */
function CatDetailController($scope,$rootScope,eventBroadcast) {

  // This is an event handler for a click on a cat thumbnail.
  // When 'catClicked' is broadcast, we know that new cat data needs to be loaded from eventBroadcast
  $scope.$on('catClicked',function() {
    showCat(eventBroadcast.message.cat);
  });

  // When a user clicks 'Back' fire a 'backClicked' event (MainController is listening for this)
	$scope.goBack = function () {
		eventBroadcast.broadcast('backClicked',{});
	};

  // This method is called when 'Next Cat' or 'Prev Cat' is clicked.  
  // It will cycle through each cat in catCollection.
  $scope.newCat = function(idx) {
    if( idx >= $rootScope.catCollection.length ){
      $scope.catIndex = 0;
    } else if ( idx < 0 ) {
      $scope.catIndex = $rootScope.catCollection.length - 1;
    } else {
      $scope.catIndex = idx;
    }
    $scope.cat = $rootScope.catCollection[$scope.catIndex];
  }

  // This method takes a cat object as a parameter and sets it as the active cat.
  // It also finds the index of the cat object in catCollection.
  var showCat = function(cat) {
    $scope.cat = cat;
    $scope.catIndex = $rootScope.catCollection.indexOf(cat);
  }

}
CatDetailController.$inject = ['$scope','$rootScope','eventBroadcast'];
