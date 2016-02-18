angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider
    // home page
    .when('/', {
      templateUrl: 'views/home.html',
      controller: 'MainCtrl'
    })
    // try it
    .when('/tryIt', {
      templateUrl: 'views/tryIt.html',
      controller: 'TryItCtrl'
    });

  //$locationProvider.html5Mode(true);
}]);