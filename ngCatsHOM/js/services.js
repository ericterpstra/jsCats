'use strict';

/**
 * ### CatService
 * 
 * This module contains the service that gets the remote data from the PetFinder API.
 * It grabs all the adoptable cats from the House of Mews (HoM) shelter in Memphis, TN.
 * Because the HoM updates their info on PetFinder once per week, I've created a small PHP script
 * that hits the API and writes the returned json to a local file (cats.json).  This makes things
 * a lot faster, and will avoid using the Petfinder API on every page load.  The cats.json file is raw
 * data exactly as it appears when hitting the Petfinder API, so the Petfinder API URL could be 
 * substituted for cats.json at any time, if needed.
 */
angular.module('catService', ['ngResource','CatServiceHelper'])
.factory('CatsService', function($resource,$filter,CatServiceHelper){

    // Define the remote service using Angular's $resource module.
    var service = $resource('cats.json',{});

    // CatsService is the object created by the CatsService factory. 
    // This is a bit long-winded and could easily be shortened, 
    // but I plan on adding some additional methods to CatService in the future.
    var CatsService = {
      // The getCats function calls $resource.query() to retrieve the remote data.
      // The data is then lightly validated and scrubbed using the translateCat() 
      // function in the CatServiceHelper module
      getCats : function getCats(callback){
        service.query(function (data) {
          var cats = [];
          var catCollection = [];
          if ( data && data.length > 1 && data[2].pets.pet && data[2].pets.pet.length > 0 ) {
            cats = data[2].pets.pet;
          }
          angular.forEach(cats,function(item){
            catCollection.push( CatServiceHelper.translateCat(item) );
          });
          callback(catCollection);
        });
      }
    };
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
})

