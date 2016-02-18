// Function to get the words in common between two strings
module.exports.intersect = intersect = function() {
	if (arguments.length != 2 || arguments[0]=='' || arguments[1]=='')
		return [];
	
	var set = {};
	[].forEach.call(arguments, function(a,i){
		var tokens = a.match(/\w+/g);
		if (!i) {
			tokens.forEach(function(t){ set[t]=1; });
		} else {
			for (var k in set){
				if (tokens.indexOf(k)<0) delete set[k];
			}
		}
	});
	
	return Object.keys(set);
};

// Very simple function to remove prepositions and articles from a set of words
var articles = ["the","a","an"];
var preps = ["a","abaft","aboard","about","above","absent","across","afore","after","against","along","alongside","amid","amidst","among","amongst","an","anenst","apropos","apud","around","as","aside","astride","at","athwart","atop","barring","before","behind","below","beneath","beside","besides","between","beyond","but","by","circa","concerning","despite","down","during","except","excluding","failing","following","for","forenenst","from","given","in","including","inside","into","like","mid","midst","minus","modulo","near","next","notwithstanding","o'","of","off","on","onto","opposite","out","outside","over","pace","past","per","plus","pro","qua","regarding","round","sans","save","since","than","through","throughout","till","times","to","toward","towards","under","underneath","unlike","until","unto","up","upon","versus","via","vice","vis-à-vis","with","within","without","worth"];
module.exports.removePrepositionsAndArticles = removePrepositionsAndArticles = function (set) {
	var i=0;
	while(i<set.length) {
		if (preps.indexOf(set[i])>=0 || articles.indexOf(set[i])>=0)
			set.splice(i,1);
		else
			i++;
	}
	return set;
};

/*
 * Function to get the permutations of n elements. The result is an array containing
 * an array for every permutation.
 * Explodes on n>9
 *
 * Example for n=3 returns:
 * [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
 */
module.exports.permutations = permutations = function (n){
	var numArray = [];
	for (var i=0; i<n; i++) {
		numArray.push(i+1);
	}
	
	function recursivePerm(rim) {
		if (rim.length>1) {
			var myArr = [];
			for (var i=0; i<rim.length; i++) {
				var rimCopy = rim.slice();
				rimCopy.splice(i,1);
				var rimPermArr = recursivePerm( rimCopy );
				for (var j=0; j<rimPermArr.length; j++) {
					var myArrRow = [rim[i]];
					myArr.push(
						myArrRow.concat( rimPermArr[j] ) );
				}
			}
			return myArr;
		}
		else
			return [rim[0]];
	}
	
	return recursivePerm(numArray);
};

// Function to get the minimum in an array of numbers
// Returns an object containing the value and the position of the element in the array
module.exports.getMin = getMin = function (arr){
	var value = arr[0];
	var index = 0;
	for (var i=0; i<arr.length; i++) {
		if (arr[i] < value) {
			value = arr[i];
			index = i;
		}
	}
	return {value:value, index:index};
};

//Function to get the maximum in an array of numbers
//Returns an object containing the value and the position of the element in the array
module.exports.getMax = getMax = function (arr){
	var value = arr[0];
	var index = 0;
	for (var i=0; i<arr.length; i++) {
		if (arr[i] > value) {
			value = arr[i];
			index = i;
		}
	}
	return {value:value, index:index};
};

// Function to get the minima in an array of numbers
// Returns an object containing the value and the array of the positions of the elements in the array
module.exports.getMinMulti = getMinMulti = function (a){
	var newMin;
	var positions = [];
	for (var i in a) {
		if (i!=0) {
			if (a[i] < newMin) {
				newMin = a[i];
				positions = [i];
			}
			else if (a[i] == newMin)
				positions.push(i);
		}
		else {
			newMin = a[0];
			positions.push(0);
		}
	}
	return {value:newMin, pos:positions};
};

module.exports.getMaxMulti = getMaxMulti = function (a) {
	var newMax;
	var positions = [];
	for (var i in a) {
		if (i!=0) {
			if (a[i] > newMax) {
				newMax = a[i];
				positions = [i];
			}
			else if (a[i] == newMax)
				positions.push(i);
		}
		else {
			newMax = a[0];
			positions.push(0);
		}
	}
	return {value: newMax, pos: positions};
};

// Function to get the minimum in an array of objects with a structure like {value:2.5, col:0, row:1}
// Returns an object containing the position of the element in the array and the corresponding object
module.exports.getMinObject = getMinObject = function (arr){
	var obj = arr[0];
	var index = 0;
	for (var i=0; i<arr.length; i++) {
		if (arr[i].value < obj.value) {
			obj = arr[i];
			index = i;
		}
	}
	return {obj:obj, index:index};
};

module.exports.hasZeroes = hasZeroes = function (m){
	var hasZeroes = false;
	for (var i=0; i<m.length; i++) {
		for (var j=0; j<m[i].length; j++) {
			if (m[i][j]==0)
				hasZeroes = true;
		}
	}
	
	return hasZeroes;
};

module.exports.matrixClone = matrixClone = function matrixClone(m){
	m_dummy = [];
	for (var i in m){
		m_dummy.push(m[i].slice(0));
	}
	return m_dummy;
};

module.exports.printMatrix = printMatrix = function (m) {
	var table = '<table border="1" style="width:200px; text-align:center;">';
	for (var i in m) {
		table+='<tr>';
		for (var j in m[i]) {
			table+='<td>'+m[i][j]+'</td>';
		}
		table+='</tr>';
	}
	table+='</table>';
	
	document.write(table);
};

//Si potrebbe rendere piu' veloce per matrici quadrate
module.exports.transpose = transpose = function (m) {
	var m_dummy = [];
	for (var i in m) {
		for (var j in m[i]) {
			if (typeof m_dummy[j] == 'undefined')
				m_dummy.push([]);
			m_dummy[j].push(m[i][j]);
		}
	}
	return m_dummy;
};

module.exports.removeDuplicates = removeDuplicates = function (a) {
	var aSet = [];
	for (var i in a) {
		if (aSet.indexOf(a[i])<0)
			aSet.push(a[i]);
		else
			aSet.push(null);
	}
	return aSet;
};