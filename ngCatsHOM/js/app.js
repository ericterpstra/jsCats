'use strict';

/**
 * This is the 'main' module at the root of the application.
 * See the ng-app directive of the <html> tag in index.html.
 */
angular.module('catApp', ['catService'])
/**
 * The 'eventBroadcast' service allows the controllers to 
 * send messages to each other via the $rootScope.  
 * This is a quick and dirty way to implement an Event Bus, 
 * but will not scale well for large applications.
 */
.factory('eventBroadcast', function($rootScope) {
    // eventBroadcaster is the object created by the factory method.
    var eventBroadcaster = {};

    // The message is a string or object to carry data with the event.
    eventBroadcaster.message = '';

    // The event name is a string used to define event types.
    eventBroadcaster.eventName = '';

    // This method is called from within a controller to define an event and attach data to the eventBroadcaster object.
    eventBroadcaster.broadcast = function(evName, msg) {
        this.message = msg;
        this.eventName = evName;
        this.broadcastItem();
    };

    // This method broadcasts an event with the specified name.
    eventBroadcaster.broadcastItem = function() {
        $rootScope.$broadcast(this.eventName);
    };

    return eventBroadcaster; })
/**
 * Below is a custom directive used to create (and re-create)
 * the carousel component from Twitter Bootstrap.  Whenever the 'cat' object
 * changes in the directive's scope, the carousel is reinitialized and paused.
 *
 * This directive was created because the carousel would stop working at random times.
 */
.directive('ngCarousel', function() {
  return function (scope, elm, attr) {
        scope.$watch('cat', function() {
          $(elm).carousel('pause');
        }); 
    }
});