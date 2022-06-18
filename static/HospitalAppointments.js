
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

			if (size%2 != 0) {
				error = "There are odd numbers of hyphens. ";
			}

			if (str[i][str[i].length - 1] == '?' && size == next_size) {
				error = error + "Have a question but no answer in the next line. ";
			}
			else if (str[i][str[i].length - 1] != '?' && size < next_size) {
				error = error + "No question but has answers in the next line (maybe a question mark is missing). ";
			}

			if (error != "") {
				error = error + "The error comes from the line " + (i + 1) + ". ";
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

	localStorage.setItem("str-array", JSON.stringify(str));
	localStorage.setItem("str-hyphens-array", JSON.stringify(str_hyphens));
	localStorage.setItem("arr-array", JSON.stringify(arr));
	localStorage.setItem("error", JSON.stringify(error));

	//document.location.href = "tree.html";

	let ifBackup = document.getElementsByName('ifBackup');
    if(ifBackup[0].checked) {
		window.location.href = "index.html";
	}
	else {
		let ifSearch = document.getElementsByName('ifSearch');
		if(ifSearch[0].checked) {
			window.location.href = "search.html";
		}
		else {
			window.location.href = "tree.html";
		}
	
		for(let i = 0; i < ifSearch.length; i++) {
			if(ifSearch[i].checked) {
				localStorage.setItem("ifSearch", JSON.stringify(ifSearch[i].value));
			}
		}
	}

}