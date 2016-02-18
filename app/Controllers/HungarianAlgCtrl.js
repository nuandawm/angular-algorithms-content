var utils = require('../Utils/utils');
var Step = require('../Models/Step');

var controller = function(){};
/**
 * Main method
 */
controller.prototype.findAssignments = function (inputMatrix) {
  var dummyMatrix = utils.matrixClone(inputMatrix);
	var steps = [];
	// Step 0
	steps.push(new Step(0, 'Original matrix', {matrix:inputMatrix}));
	// Step 1 - Rows reduction
	console.log('Step 1');
	dummyMatrix = this.rowReduction(dummyMatrix);
	steps.push(new Step(1, 'Step 1 - Rows reduction', {matrix:dummyMatrix}));
	// Step 2 - Cols reduction
	console.log('Step 2');
	dummyMatrix = this.colReduction(dummyMatrix);
	steps.push(new Step(2, 'Step 2 - Cols reduction', {matrix:dummyMatrix}));
	
	var resolvable = false;
	var assignedTasks = [];
	var finalMatrix = [];
	while(!resolvable){
		// Step 3 - Searching covering segments
		console.log('Step 3');
		var coveringSegmentsResult = this.coveringSegmentsFinder(dummyMatrix);
		steps.push(
				new Step(3, 'Step 3 - Searching covering segments', {
						matrix: coveringSegmentsResult.matrix,
						covRows: coveringSegmentsResult.covRows,
						covCols: coveringSegmentsResult.covCols,
						resolvable: coveringSegmentsResult.resolvable
					}));
		resolvable = coveringSegmentsResult.resolvable;
		
		if (resolvable) {
			assignedTasks = coveringSegmentsResult.maxAssignedTasks;
			finalMatrix = coveringSegmentsResult.matrix;
		}
		else {
			console.log('Step 4');
			var dummyMatrix = this.shaker(coveringSegmentsResult.matrix, coveringSegmentsResult.covRows, coveringSegmentsResult.covCols);
			steps.push(new Step(4, 'Step 4 - Shaking', {matrix:dummyMatrix}));
		}
	}
	
	// Step 5 - Solution
	console.log('Step 5');
	steps.push(new Step(5, 'Step 5 - Solution', {
		finalMatrix: finalMatrix,
		originalMatrix: inputMatrix,
		assignedTasks: assignedTasks}));

	return steps;
};
/**
 * step1 - subtract row minima
 */
controller.prototype.rowReduction = function (m){
		for (var i in m) {
			var rowMin = utils.getMin(m[i]);
			for (var j in m[i])
				m[i][j] -= rowMin.value;
		}
		return m;
	};
/**
 * step2 - subtract column minima
 */
controller.prototype.colReduction = function (m){
		var m_t = utils.transpose(m);
		for (var i in m_t) {
			var rowMin = utils.getMin(m_t[i]);
			for (var j in m_t[i])
				m_t[i][j] -= rowMin.value;
		}
		return utils.transpose(m_t);
	};

controller.prototype.maximizeAssignedTasks = function(m) {
		var zeros = [];
		for (var i in m) {
			zeros.push([]);
			for (var j in m[i]) {
				if (m[i][j]==0)
					zeros[i].push(j);
			}
		}
		
		var maxRedundance = 1;
		var maxAssignedTasksFound = false;
		var sol = [];
		while(!maxAssignedTasksFound) {
			var assignedTasks = [];
			for (var i in m[0])
				assignedTasks.push(0);
			
			var redundance = 0;
			function recursiveSolution(row,sol) {
				//document.write(sol+'<br/>');
				for (var i in zeros[row]) {
					if (assignedTasks[zeros[row][i]]==0) {
						assignedTasks[zeros[row][i]]+=1;
						sol.push(zeros[row][i]);
						if (row>=zeros.length-1 || recursiveSolution(row+1,sol))
							return true;
						else {
							sol.pop();
							assignedTasks[zeros[row][i]]-=1;
						}
					}
					else if (redundance<maxRedundance-1) {
						redundance+=1;
						assignedTasks[zeros[row][i]]+=1;
						sol.push(zeros[row][i]);
						if (row>=zeros.length-1 || recursiveSolution(row+1,sol))
							return true;
						else {
							sol.pop();
							assignedTasks[zeros[row][i]]-=1;
							redundance-=1;
						}
					}
				}
				
				return false;
			}
			
			maxAssignedTasksFound = recursiveSolution(0,sol);
			if (!maxAssignedTasksFound)
				maxRedundance+=1;
		}
		
		return {sol:sol,ri:maxRedundance};
	};

/**
 * Covering segment finder
 */
controller.prototype.coveringSegmentsFinder = function(m) {
		var markedRows = [];
		for (var i in m)
			markedRows.push(0);
		var markedCols = [];
		for (var i in m[0])
			markedCols.push(0);
		
		var result = this.maximizeAssignedTasks(m);
		
		var assignedTasks = [];
		for (var i in m[0])
			assignedTasks.push(null);
		
		var maxAssignedTasks = removeDuplicates(result.sol);
		for (var i in maxAssignedTasks) {
			if (maxAssignedTasks[i]!==null)
				assignedTasks[maxAssignedTasks[i]]=i;
			else
				markedRows[i]=1;
		}
		
		var goOn = true;
		while(goOn) {
			goOn = false;
			for (var i in markedRows) {
				if (markedRows[i]!=0) {
					for (var j=0; j<m[i].length; j++) {
						if (m[i][j]==0 && markedCols[j]==0) {
							markedCols[j]=1;
							goOn = true;
						}
					}
				}
			}
			
			if (goOn) {
				goOn = false;
				for (var i in maxAssignedTasks) {
					if (markedCols[maxAssignedTasks[i]]!=0 && markedRows[i]==0) {
						markedRows[i]=1;
						goOn = true;
					}
				}
			}
		}
		
		for (var i in markedRows) {
			if (markedRows[i]==0)
				markedRows[i]=1;
			else
				markedRows[i]=0;
		}
		
		// Resolvability test
		var segments = 0;
		for (var i in markedRows) {
			if (markedRows[i]!=0)
				segments+=1;
		}
		for (var i in markedCols) {
			if (markedCols[i]!=0)
				segments+=1;
		}
		
		var resolvable;
		if (segments<m[0].length)
			resolvable = false;
		else
			resolvable = true;
		
		return {
				matrix:m,
				covRows:markedRows,
				covCols:markedCols,
				resolvable:resolvable,
				maxAssignedTasks:maxAssignedTasks
			};
	};

controller.prototype.shaker = function(m,covRows,covCols){
		var mDummy = matrixClone(m);
		
		var minUncovered;
		for (var i in mDummy) {
			for (var j in mDummy[i]) {
				if (covRows[i]+covCols[j] == 0) {
					if (minUncovered) {
						if (mDummy[i][j]<minUncovered)
							minUncovered = mDummy[i][j];
					}
					else
						minUncovered = mDummy[i][j];
				}
			}
		}
		
		for (var i in mDummy) {
			for (var j in mDummy[i]) {
				if (covRows[i]+covCols[j] == 0)
					mDummy[i][j] -= minUncovered;
				else if (covRows[i]*covCols[j]!=0)
					mDummy[i][j] += 2*minUncovered;
			}
		}
		
		return mDummy;
	};


module.exports = new controller();