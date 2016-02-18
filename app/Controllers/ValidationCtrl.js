var controller = function () {}

var JSON_METHOD = 'json', CSV_METHOD = 'csv';

var validationError = '';

controller.prototype.getValidationError = function () {
  return validationError;
};

var validateMatrix = function(m){
  if (!Array.isArray(m) || m.length<=1){
    console.error('rowArray');
    return false;
  }
  var mLength = m.length;
  for (var i in m) {
    if (!Array.isArray(m[i])){
      console.error('colArray');
      return false;
    }
    // It has to be a square m
    if (m[i].length!=mLength){
      console.error('squareMatrix');
      return false;
    }
    for (var j in m[i]) {
      if (typeof m[i][j] != 'number'){
        console.error('number '+i+' '+j);
        return false;
      }
    }
  }
  
  return true;
};

var validateInputMatrix = function(mStr){
  try {
    var matrix = JSON.parse(mStr);
    if (!validateMatrix(matrix)) {
      console.error('The matrix is not valid\n'+mStr);
      validationError = 'The matrix is not valid';
      return false;
    }
  }
  catch(e) {
    console.error('The format of the JSON is not valid\n'+e.message);
    validationError = 'The format of the JSON is not valid';
    return false;
  }
  
  return true;
};

controller.prototype.validate = function (req) {
  return validateInputMatrix(req.query.inputMatrix);
};

module.exports = new controller();