angular.module('controllers', [])
  .controller('MainCtrl', function ($scope) {
    
  })
  .controller('TryItCtrl', function ($scope) {
    // Constants
    angular.extend($scope, {
      JSON_METHOD: 'json',
      CSV_METHOD: 'csv'
    });
    
    angular.extend($scope, {
      inputMatrix: [],
      inputMatrixStr: '[]',
      inputType: $scope.JSON_METHOD
    });

    $scope.$watch('inputMatrix', function(value){
      if (value) {
        try { $scope.inputMatrixStr = JSON.stringify(value); }
        catch(e){ $scope.inputMatrixStr = null; }
      }
    });

    $scope.$watch('inputMatrixStr', function(value){
      if (value) {
        try { $scope.inputMatrix = JSON.parse(value); }
        catch(e){ $scope.inputMatrix = null; }  
      }
    });

    // Example matrix
    var randomMatrix = [];
    // Generate random matrix
    var dim = 7;
    for (var i=0; i<dim; i++) {
      randomMatrix.push([]);
      for (var j=0; j<dim; j++) {
        randomMatrix[i].push(Math.floor(Math.random()*50)+1);
      }
    }

    $scope.inputMatrix = randomMatrix;

    $scope.launch = function(){
      console.log($scope.inputMatrix);
      console.log($scope.inputMatrixStr);
      console.log($scope.inputType);
    };
  });