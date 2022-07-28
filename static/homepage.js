
var Diagram = MindFusion.Diagramming.Diagram;
var DiagramLink = MindFusion.Diagramming.DiagramLink;
var ControlNode = MindFusion.Diagramming.ControlNode;

var Rect = MindFusion.Drawing.Rect;
var Point = MindFusion.Drawing.Point;

var Animation = MindFusion.Animations.Animation;
var AnimationType = MindFusion.Animations.AnimationType;
var EasingType = MindFusion.Animations.EasingType;
var AnimationEvents = MindFusion.Animations.Events;
var str = [];
var n;
var obj;
let stack = [];
var arr = [];
var zero = [];
var vec;
var bx = 50, by = 40;
var diagram = null;

// $(document).ready(function () {
// 	diagram = Diagram.create(document.getElementById("diagram"));
// 	diagram.setBounds(new Rect(0, 0, 500, 500));
// });

// console.log(str);



var input1 = document.querySelector('input');
var textarea = document.querySelector('textarea');
let chooseTopic = document.getElementsByName('chooseTopic');

// This for loop gets the text input from the links provided by the radio choice button
for(let i = 0; i < chooseTopic.length; i++) {
	chooseTopic[i].addEventListener('change', () => {
		if(chooseTopic[i].checked) {
			$.get( chooseTopic[i].value, function( data ) {
			var text = data;
			textarea.value = text;
			});
		}
	});
}

// This function allows the user to upload the text input in txt format. 
input1.addEventListener('change', () => {
	let files = input1.files;
	if (files.length == 0) return;

	const file = files[0];
	let reader = new FileReader();
	reader.onload = (e) => {
		const file = e.target.result;
		const lines = file.split(/\r\n|\n/);
		textarea.value = lines.join('\n');
	};
	reader.onerror = (e) => alert(e.target.error.name);

	reader.readAsText(file);
});

// This function converts the text input to a general tree 
// It also has a debugger, and it will alert the user if any bugs exist
// Input: text input in the textarea
// Output: str is the list containing the the text input line by line without hyphens.
// str-hyphens is the list containing the text input line by line with hyphens.
// arr is the 2d array represents a general tree where index is parent id and values are children id
// set ifSearch to 'no' so that the next page will only show the root node
function input() {
	// document.getElementById("undo").style.display = "inline-block";
	str = $('#input').val().split("\n");
	n = str.length;
	str_hyphens = $('#input').val().split("\n");
	console.log("test str_hyphens in hos: " + str_hyphens);
	vec = new Array(n);
	obj = new Array(n);
	for (var i = 0; i < obj.length; i++) {
		obj[i] = new Array(4);
		arr[i] = new Array(0);
	}

	// console.log(n);

	let p = 3;
	let error = "";
	let error_loc = 0;
	// console.log(str[1]);
	for (var i = 0; i < n; i++) {
		let size = 0;

		// count the number of hyphens of this line
		for (var j = 0; j < str[i].length; j++) {
			if (str[i][j] != '-') break;
			else size++;
		}

		// count the number of hyphens of the next line
		let next_size = 0;
		if (i != n - 1) {
			for (var j = 0; j < str[i + 1].length; j++) {
				if (str[i + 1][j] != '-') break;
				else next_size++;
			}
		}

		// console.log(size);
		vec[size / 2] = i;
		if (size == 0) {
			p++;
			// arr[0].push(i);
			zero.push(i);
		}
		else {
			// debugger
			if(i == 0 && size != 0) {
				error = error + "The first line should not have hyphens. You might miss the first line or have extra hyphens for the first line. \n";
				error_loc = i + 1;
				error = error + "The error comes from the line " + error_loc + ". ";
				break;
			}

			if(str[0].indexOf('?') == -1) {
				error = error + "The first line miss a question mark. \n";
				error_loc = i;
				error = error + "The error comes from the line " + error_loc + ". ";
				break;
			}

			if(i == 1 && size != 2) {
				error = error + "The second line should have exact two hyphens. \n";
				error_loc = i + 1;
				error = error + "The error comes from the line " + error_loc + ". ";
				break;
			}

			// if(i + 1 < n && str[i + 1] == '') {
			// 	error = error + "There is an empty line. \n";
			// 	error_loc = i + 2;
			// 	error = error + "The error comes from the line " + error_loc + ". ";
			// 	break;
			// }

			if (size%2 != 0 ) {
				error = error + "There are odd numbers of hyphens. \n";
				error_loc = i + 1;
				error = error + "The error comes from the line " + error_loc + ". ";
				break;
			}

			// Check the number of hyphens in the next line so that this kind of error has higher priority than the "no answer". 
			if (next_size%2 != 0 ) {
				error = error + "There are odd numbers of hyphens. \n";
				error_loc = i + 2;
				error = error + "The error comes from the line " + error_loc + ". ";
				break;
			}
			
			//if(i + 1 < str.length && str[i + 1] != '') {
			if (str[i][str[i].length - 1] == '?' && size + 2 != next_size) {
				error = error + "Have a question but no answer or further question in the next line. \n";
				error_loc = i + 1;
				error = error + "The error comes from the line " + error_loc + ". ";
				break;
			}			
			else if (str[i][str[i].length - 1] != '?' && size < next_size) {
				error = error + "No question but has answers in this line (maybe a question mark is missing in the last line). \n";
				error_loc = i + 2;
				error = error + "The error comes from the line " + error_loc + ". ";
				break;
			}

			arr[vec[(size / 2) - 1]].push(i);
		}
		// console.log(size);
		let len = str[i].length;
		// let s = str[i].search(',');

		// get rid of the hyphens in str array
		str[i] = str[i].substring(size);

		//ZL: I don't know what the obj is used for as it is never used again thereafter. However, the system will crash if I commented this line 
		obj[size / 2].push(str[i]);
	}


	// debugger: check if there are same options/answers
	for(let i = 0; i < arr.length; i++) {
		let childList = [];
		if(arr[i].length != 0) {
			for(let j = 0; j < arr[i].length; j++) {
				childList.push(str[arr[i][j]]);
			}
		}

		if(childList.length !== new Set(childList).size) {
			error = error + "This question has multiple children with the same answers below. \n";
			error_loc = i + 1;
			error = error + "The error comes from the line " + error_loc + ". ";
			break;
		}
	}



	localStorage.setItem("str-array", JSON.stringify(str));
	localStorage.setItem("str-hyphens-array", JSON.stringify(str_hyphens));
	localStorage.setItem("arr-array", JSON.stringify(arr));
	//localStorage.setItem("error", JSON.stringify(error));
	localStorage.setItem("ifSearch", JSON.stringify('no'));
	//document.location.href = "tree.html";
	if(error == '') {
		window.location.href = "tree.html";
	}
	else {
		jump(error_loc);
		alert("INPUT ERROR: " + error);
	}

}

// This function can jump to the line with bug
// Input: the line number with bug
function jump(line) {
  var ta = document.getElementById("input");
  // For unknown reason, the calculation of lineHeight is not very accurate, so I added 0.9525 as a hyperparameter.
  var lineHeight = (ta.clientHeight / ta.rows) * 0.9525;
  var jump = (line - 1) * lineHeight;
  ta.scrollTop = jump;
}

