angular.module('controllers', [])
  .controller('MainCtrl', function($scope) {
    
  })
  .controller('TryItCtrl', function($scope) {
    $scope.launch = function(){
      console.log('puppa');
    };
  });