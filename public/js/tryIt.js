// TODO Elaboration in progress
// TODO Scroll up after open a "tab"

var hungarianContext = (function(){
  var contextVariables = {};
  var errors = '';
  
  return {
    set: function(varName,varObj){
      contextVariables[varName] = varObj;
    },
    get: function(varName){
      return contextVariables[varName];
    },
    getContextVariables: function(){
      return contextVariables;
    },
    getErrors: function(){
      return errors;
    },
    setErrors: function(value){
      errors = value;
    }
  };
})();

var MATRIX_CELL_PADDING = 2, MATRIX_CELL_BORDER = 1, MIN_CELL_WIDTH = 25,
  LIST_MIN_WIDTH=300, NUMBER_PRECISION=3, JSON_METHOD = 'json', CSV_METHOD = 'csv',
  TIMEOUT_ERROR_MSG='Server is temporary down: please, retry later or report it to the website administrator';

var PageView = (function(){
  // Private fields
  var inputMatrixFieldSelector = '#json-matrix-input';
  var inputTypeFieldSelector = '.input-type';
  var resultsAccordionSelector = '#results-accordion';
  var launchButtSelector = '#launch-butt';
  var launchButtBkContent;
  // Private methods
  var getMatrixCellWidth = function(m) {
    var $div = $('<div>').css({
        position: 'absolute',
        visibility: 'hidden',
        height: 'auto',
        width: 'auto',
        'white-space': 'nowrap',
        'font-family': 'monospace',
        'font-size': '14px'
      }).appendTo($('body'));
    var maxWidth = 0;
    for (var i in m) {
      for (var j in m[i]) {
        $div.html(parseFloat(m[i][j].toFixed(NUMBER_PRECISION)));
        if ($div.width()>maxWidth)
          maxWidth = $div.width();
      }
    }
    $div.remove();
    
    return maxWidth;
  }

  var matrixToTable = function(m) {
    var matrix = '<div class="matrixDiv">';
    for (var i in m) {
      matrix+='<div class="matrixRow">';
      for (var j in m[i]) {
        matrix+='<div class="matrixCell">'+parseFloat(m[i][j].toFixed(NUMBER_PRECISION))+'</div>';
      }
      matrix+='<br class="clear-both"/>';
      matrix+='</div>';
    }
    matrix+='</div>';
    
    return matrix;
  }

  var matrixCoveringToTable = function(m,zero_row,zero_col) {
    var matrix = '<div class="matrixDiv">';
    for (var i in m) {
      matrix+='<div class="matrixRow">';
      for (var j in m[i]) {
        var coverClass = '';
        if (zero_row[i]+zero_col[j]!=0)
          coverClass += 'covered';
        matrix+='<div class="matrixCell '+coverClass+'">'+parseFloat(m[i][j].toFixed(NUMBER_PRECISION))+'</div>';
      }
      matrix+='<br class="clear-both"/>';
      matrix+='</div>';
    }
    matrix+='</div>';
    
    return matrix;
  };

  var printMatrixAssignedTasks = function(m,assignedTasks) {
    var matrix = '<div class="matrixDiv">';
    for (var i in m) {
      matrix+='<div class="matrixRow">';
      for (var j in m[i]) {
        var coverClass = '';
        if (assignedTasks[i]==j)
          coverClass += 'covered';
        matrix+='<div class="matrixCell '+coverClass+'">'+parseFloat(m[i][j].toFixed(NUMBER_PRECISION))+'</div>';
      }
      matrix+='<br class="clear-both"/>';
      matrix+='</div>';
    }
    matrix+='</div>';
    
    return matrix;
  };
  // Renders a single step result in a table (default)
  var tableStepRenderer = function(step) {
    var stepHTML = '', cellWidth = 0, dim = 1;
    if (step.type==0 || step.type==1 || step.type==2 || step.type==4) {
      stepHTML = matrixToTable(step.result.matrix);
      cellWidth = getMatrixCellWidth(step.result.matrix);
      dim = step.result.matrix.length;
    }
    else if (step.type==3) {
      stepHTML = '<ul><li>Resolvable: ';
      stepHTML += step.result.resolvable+'</li>';
      stepHTML += '<li>Covering rows: ';
      stepHTML += step.result.covRows+'</li>';
      stepHTML += '<li>Covering cols: ';
      stepHTML += step.result.covCols+'</li></ul>';
      stepHTML += '<h3>Matrix</h3>';
      stepHTML += matrixCoveringToTable(step.result.matrix, step.result.covRows, step.result.covCols);
      cellWidth = getMatrixCellWidth(step.result.matrix);
      dim = step.result.matrix.length;
    }
    else if (step.type==5) {
      stepHTML = '<h3>Modified matrix</h3>';
      stepHTML += printMatrixAssignedTasks(step.result.finalMatrix, step.result.assignedTasks);
      stepHTML += '<h3>Original matrix</h3>';
      stepHTML += printMatrixAssignedTasks(step.result.originalMatrix, step.result.assignedTasks);
      finalMatrixCellWidth = getMatrixCellWidth(step.result.finalMatrix);
      originalMatrixCellWidth = getMatrixCellWidth(step.result.originalMatrix);
      cellWidth = (finalMatrixCellWidth>originalMatrixCellWidth) ? finalMatrixCellWidth : originalMatrixCellWidth;
      dim = step.result.originalMatrix.length;
    }
    var $renderedStep = $('<div>')
        .addClass('stepContainer')
        .html(stepHTML);
    var jqCellWidth = cellWidth+(2*(MATRIX_CELL_BORDER+MATRIX_CELL_PADDING)); // Don't know why...
    if (jqCellWidth<MIN_CELL_WIDTH)
      jqCellWidth=MIN_CELL_WIDTH;
    var matrixWidth = dim*jqCellWidth + 2*dim*MATRIX_CELL_BORDER;
    var $matrixTable = $renderedStep.find('.matrixDiv');
    $matrixTable.width(matrixWidth);
    $matrixTable.find('.matrixCell').width(jqCellWidth);
    if (matrixWidth>LIST_MIN_WIDTH)
      $renderedStep.find('ul').width(matrixWidth);
    else
      $renderedStep.find('ul').width(LIST_MIN_WIDTH);
    
    return $renderedStep;
  };

  // Public methods
  return {
    renderInputMatrixField: function(){
      $(inputMatrixFieldSelector).val(hungarianContext.get('inputMatrixStr'));
    },
    renderInputTypeField: function(){
      $(inputTypeFieldSelector).each(function(i,el){
          $(el).prop('checked',
              $(el).val()==hungarianContext.get('inputType'));
        });
    },
    renderSteps: function(steps, renderer) {
      var stepResultRenderer = (renderer) ? renderer : tableStepRenderer;

      var $resultsAccordion = $(resultsAccordionSelector);
      $resultsAccordion.hide();
      $resultsAccordion.empty();
      
      for (var i in steps) {
        $('<div>')
          .addClass('row')
          .append(
            $('<div>')
              .addClass('col-md-offset-4 col-md-4 col-xs-12')
              .append(
                $('<button>')
                  .addClass('btn btn-primary btn-lg btn-block')
                  .attr('data-toggle','collapse')
                  .attr('data-target','#collapse-'+i)
                  .html(steps[i].typeName) ) )
          .appendTo($resultsAccordion);
        
        $('<div>')
          .addClass('row')
          .append(
            $('<div>')
              .addClass('collapse '+(i==0?'in':'')+' col-md-12')
              .attr('id','collapse-'+i)
              .append(stepResultRenderer(steps[i])) )
          .appendTo($resultsAccordion);
      }
      
      $resultsAccordion.show();
    },
    renderElaborationInProgress: function(){
      var $launchButt = $(launchButtSelector);
      launchButtBkContent = $launchButt.html();
      $launchButt.html('Elaboration in progress...');
      $launchButt.addClass('disabled');
    },
    renderElaborationFinished: function(){
      var $launchButt = $(launchButtSelector);
      $launchButt.html(launchButtBkContent);
      $launchButt.removeClass('disabled');
    }
  };
})();

var MainController = function(host){
    // Private fields
    var serverHost = host;
    // Private methods
    var matrixParse = function(str,type){
      var matrix = [];
      if (type==JSON_METHOD)
        matrix = JSON.parse(str);
      else if (type==CSV_METHOD)
        matrix = Papa.parse(str,{dynamicTyping:true}).data;
      return matrix;
    };
    
    var matrixStringify = function(m,type){
      var matrixStr = '';
      if (type==JSON_METHOD)
        matrixStr = JSON.stringify(m);
      else if (type==CSV_METHOD)
        matrixStr = Papa.unparse(m);
      return matrixStr;
    };
    
    var validateMatrix = function(m){
      if (!$.isArray(m) || m.length<=1){
        console.log('rowArray');
        return false;
      }
      var mLength = m.length;
      for (var i in m) {
        if (!$.isArray(m[i])){
          console.log('colArray');
          return false;
        }
        // It has to be a square m
        if (m[i].length!=mLength){
          console.log('squareMatrix');
          return false;
        }
        for (var j in m[i]) {
          if (typeof m[i][j] != 'number'){
            console.log('number '+i+' '+j);
            return false;
          }
        }
      }
      
      return true;
    };
    
    var validateInputMatrix = this.validateInputMatrix = function(){
      if (hungarianContext.get('inputType')==JSON_METHOD) {
        try {
          var matrix = JSON.parse(hungarianContext.get('inputMatrixStr'));
          if (!validateMatrix(matrix)) {
            hungarianContext.setErrors('The matrix is not valid');
            return false;
          }
        }
        catch(e) {
          console.log(e.message);
          hungarianContext.setErrors('The format of the JSON is not valid!');
          return false;
        }
        
        return true;
      }
      else if (hungarianContext.get('inputType')==CSV_METHOD) {
        var csvResult = Papa.parse(hungarianContext.get('inputMatrixStr'),{dynamicTyping:true});
        if (csvResult.errors && csvResult.errors.length>0) {
          console.log(csvResult.errors[0]);
          hungarianContext.setErrors('The format of the CSV is not valid!');
          return false;
        }
        else {
          var matrix = csvResult.data;
          if (!validateMatrix(matrix)) {
            hungarianContext.setErrors('The matrix is not valid');
            return false;
          }
        }
        
        return true;
      }
    };
    
    this.sendMatrixToServer = function(){
        if (!validateInputMatrix()) {
          alert(hungarianContext.getErrors());
        }
        else {
          PageView.renderElaborationInProgress();
          if (hungarianContext.get('inputType')==JSON_METHOD)
            hungarianContext.set('inputMatrix',matrixParse(hungarianContext.get('inputMatrixStr'),JSON_METHOD));
          else if (hungarianContext.get('inputType')==CSV_METHOD)
            hungarianContext.set('inputMatrix',matrixParse(hungarianContext.get('inputMatrixStr'),CSV_METHOD));
          $.ajaxSetup({timeout:5000});
          $.getJSON(
            serverHost+'?callback=?',
            {inputMatrix:JSON.stringify(hungarianContext.get('inputMatrix'))},
            function(data){
              if (data.errors) {
                alert(data.errors.msg);
                PageView.renderElaborationFinished();
              }
              else {
                PageView.renderSteps(data);
                PageView.renderElaborationFinished();
              }
            })
            .fail(function(jqXHR, textStatus, errorThrown){
              alert(TIMEOUT_ERROR_MSG);
              PageView.renderElaborationFinished();
            });
        }
      };
    
    this.switchInputType = function(startType,endType){
      if (validateInputMatrix()) {
        var m = matrixParse(hungarianContext.get('inputMatrixStr'), startType);
        hungarianContext.set('inputMatrixStr',matrixStringify(m, endType));
        PageView.renderInputMatrixField();
      }
    };
  };

$(document).on('tryIt',function(){
  var mainCtrl = new MainController('http://localhost:8080/api/hungarian/findAssignments');
  
  // Change events
  /*$('#json-matrix-input').change(function(){
    hungarianContext.set('inputMatrixStr',$(this).val());
  });*/
  /*$('.input-type').change(function(){
    mainCtrl.switchInputType(hungarianContext.get('inputType'),$(this).val());
    hungarianContext.set('inputType',$(this).val());
  });*/
  
  /*$('#launch-butt').click(function(){
    mainCtrl.sendMatrixToServer();
  });*/
  
  // Example matrix
  /*var randomMatrix = [];
  // Generate random matrix
  var dim = 7;
  for (var i=0; i<dim; i++) {
    randomMatrix.push([]);
    for (var j=0; j<dim; j++) {
      randomMatrix[i].push(Math.floor(Math.random()*50)+1);
    }
  }*/
  //hungarianContext.set('inputMatrixStr',JSON.stringify(randomMatrix));
  //hungarianContext.set('inputType',JSON_METHOD);
  
  //PageView.renderInputMatrixField();
  //PageView.renderInputTypeField();
});