'use strict';

/**
 * ### CatService
 * 
 * This module contains the service that gets the data used by the application.
 * Depending on how the ENPOINT constant is set, the service will either use
 * the Petfinder API to dynamically retrieve data, or it will read a file (cats.json)
 * stored locally on disk. 
 */
angular.module('catService', ['ngResource','CatServiceHelper'])
.factory('CatsService', function($resource,$filter,$routeParams,CatServiceHelper,ENDPOINT){
    /**
     * Private vars
     */
    // Set the max number of cats to retrieve from the Petfinder API
    var numberOfCatsToGet = 200;

    // Set up the $resource injectable to use the Petfinder API. Some custom options are used in the $resource.query method
    var remoteSvc = $resource('/jsCats/ngCats/proxy.php', {count:numberOfCatsToGet,offset:0},
                { query: {
                      method:'GET',
                      params:{action:'shelter.getPets',count:numberOfCatsToGet, offset:0},
                      isArray:true
                     }
                });

    // Use the cats.json file as the $resource, if necessary
    var localSvc = $resource('cats.json',{});

    // Decide which $resource to use as the actual service
    var service = (ENDPOINT === "LOCAL") ? localSvc : remoteSvc;

    // Private properties & methods used to store data shared between controllers
    var _cats = [];
    var _activeCatIndex = -1;
    var _setActiveCat = function _setActiveCat(catId,callback) {
                          var cat = CatsService.findCatInCollection(catId);
                          if (cat) {
                            _activeCatIndex = _cats.indexOf(cat);
                            callback(cat);
                          }
                        };

    /**
     * CatService Object returned by the factory function.
     * Contains instance methods that can be used by the controllers.
     */
    var CatsService = {
      
      /**
       * ### Accessor Methods
       */       
      
      // Controllers can read the cat collection, but cannot change it without calling a service method.
      getCatCollection : function getCatCollection() {
        return _cats;
      },

      getActiveCatIndex : function getActiveCatIndex() {
        return _activeCatIndex;
      },

      setActiveCatIndex : function setActiveCatIndex(idx) {
        if (angular.isNumber(idx) && idx <= _cats.length) {
          _activeCatIndex = idx;
        } else {
          _activeCatIndex = -1;
          throw("activeCatIndex must be a number, and cannot exceed the length of the cat collection.");
        }
      },

      /**
       * ### Service Methods
       */

      // This method retrieves all cat data from the service and stores it in _cats 
      getCats : function getCats(callback){
        var self = this;
        service.query(function (data) {
          var rawCatData = [];
          if ( data && data.length > 0 && data[1].petfinder.pets.pet && data[1].petfinder.pets.pet.length > 0 ) {
            rawCatData = data[1].petfinder.pets.pet;
          }
          angular.forEach(rawCatData,function(item){
            _cats.push( CatServiceHelper.translateCat(item) );
          });
          if (angular.isFunction(callback)) callback(_cats);
        });
      },

      // This method retrieves data for one cat.  It will also call getCats if the user 
      // navigates directly to a catDetail page. This is necessary for the Back and 
      // Next/Prev buttons to work correctly.
      getCat : function(catId, callback) {
        var self = this;
        if( _cats.length ) {
          _setActiveCat(catId,callback);
        } else {
          this.getCats(function (results) {
              _setActiveCat(catId,callback);
          });
        }
      },

      // This uses an AngularJS filter function to extract a cat from the cat collection by the cat's id
      findCatInCollection : function findCatInCollection(catId) {
        var cat = $filter('filter')(_cats, function (item) {
                return item.id.toString() === catId;
              });
        return cat[0] || 0;
      },

      // Use the default $resource.query method
      query : service.query,
      
      // Use the default $resource.get method
      get : service.get
    
    };

    // The factory function returns CatsService, which is injected into controllers.
    return CatsService;
});


/**
 * ### CatServiceHelper
 * 
 * This module is basically a translator for data retrieved by CatService.
 * The Petfinder API was originally set up to communicate via XML, and they added
 * JSON as an option later.  As such, the JSON data returned is a bunch of ugly nested objects.
 * There is also a bunch of data that is not needed. The translateCat method takes the data
 * for each cat retrieved from the Petfinder API, and creates a nicely organized object that
 * can be easily used by the rest of the application.
 */
angular.module('CatServiceHelper',[])
.factory('CatServiceHelper',function($filter) {
  var CatServiceHelper = {
    // This is the only function exposed in CatServiceHelper. 
    // It takes a raw 'pet' object returned from the PetFinder API
    // and converts it into a Cat object.
    translateCat : function translateCat(catObj) {
      var cat = {};
      cat.pics = [];
      cat.id = catObj.id.$t;
      cat.name = catObj.name.$t;
      cat.description = catObj.description.$t;
      cat.sex = catObj.sex.$t === "M" ? "Male" : "Female";
      cat.age = catObj.age.$t;
      cat.size = getSize(catObj.size.$t);
      cat.breed = getBreeds(catObj.breeds);
      cat.thumbnail = getThumb(catObj.media.photos.photo);
      cat.pics = getPics(catObj.media.photos.photo);
      cat.options = getOptions(catObj.options.option);
      return cat;
    }
  };

  // Concats the breeds into a single string.
  var getBreeds = function getBreeds(breeds) {
    var breedName = "";
    if(angular.isArray(breeds.breed)) {
      angular.forEach(breeds.breed,function (item) {
        breedName += item['$t'] + " ";
      });
    } else {
      breedName = breeds.breed['$t'] || " ";
    }
    return breedName;
  };

  // Gets a single thumbnail from the list of available pictures.
  var getThumb = function getThumb(photoArray){ 
    var thumbs = $filter('filter')(photoArray, {"@size":"fpm","@id":"1"}); 
    return thumbs.length >= 1 ? thumbs[0].$t : '';
  };

  // Gets one of each available picture (the x-large version)
  var getPics = function getPics(photoArray){ 
    var picUrls = [];
    var thumbs = $filter('filter')(photoArray, {"@size":"x"}); 
    if(thumbs.length) {
      angular.forEach(thumbs,function(item){picUrls.push(item.$t || '');});
    }
    return picUrls;
  };
  
  // Converts size data into readable strings.
  var getSize = function getSize(size){ 
    var sizes = {S: "Small",L: "Large",M: "Medium"}; 
    return sizes[size] || "";
  };

  // Gets 'options' from the pet data and concats them
  var getOptions = function getOptions(option) {
    var options = [];
    var optionTable = {
      altered: "Spayed/Neutered",
      noDogs: "No Dogs",
      noKids: "No Kids",
      specialNeeds: "Special Needs",
      noClaws: "Declawed"
    }
    
    angular.forEach(option, function (item) {
      if(optionTable[item.$t]) 
        options.push(optionTable[item.$t]);
    });

    if (options.length) 
      options = options.join(", ");
    else
      options = "";

    return options;
  }

  return CatServiceHelper;
});