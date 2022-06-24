var str = JSON.parse(localStorage.getItem("str-array"));
var str_hyphens = JSON.parse(localStorage.getItem("str-hyphens-array"));
var arr = JSON.parse(localStorage.getItem("arr-array"));
// The key is an id (a single line number starting from 0)
var key = JSON.parse(localStorage.getItem("search_result"));
var ifSubtree = JSON.parse(localStorage.getItem("ifSubtree"));

// ifSearch will become yes only after the user first search the node 
// This can prevent the tree.html from auto-selecting the answers even though the user just left the index page. 
var ifSearch = JSON.parse(localStorage.getItem("ifSearch"));

var error = JSON.parse(localStorage.getItem("error"));
var Diagram = MindFusion.Diagramming.Diagram;
var DiagramLink = MindFusion.Diagramming.DiagramLink;
var ControlNode = MindFusion.Diagramming.ControlNode;

var Rect = MindFusion.Drawing.Rect;
var Point = MindFusion.Drawing.Point;

var Animation = MindFusion.Animations.Animation;
var AnimationType = MindFusion.Animations.AnimationType;
var EasingType = MindFusion.Animations.EasingType;
var AnimationEvents = MindFusion.Animations.Events;
// The bx and by control the size of the box.
// var bx = 65, by = 25;
var bx = 85, by = 20;

//console.log("check arr[0]: " + arr[0]);
if(error != "") {
    alert("INPUT ERROR: " + error);
}

let root_key_id = [];
var prev_line = 1;
let path_subtree = []; 
var index = 2; // for auto selecting the answers according to path, it is used in the next option function
myFunction();
function myFunction() {
    diagram = Diagram.create(document.getElementById("diagram"));
    var Behavior = MindFusion.Diagramming.Behavior;
    diagram.setBehavior(Behavior.SelectOnly);
    // diagram.setBounds(new Rect(0, 0, 500, 500));
    diagram.setVirtualScroll(true);
    // create an Overview component that wraps the "overview" canvas
    // var overview = MindFusion.Diagramming.Overview.create(document.getElementById("overview"));
    // overview.setDiagram(diagram);

    // create an ZoomControl component that wraps the "zoomer" canvas
    var zoomer = MindFusion.Controls.ZoomControl.create(document.getElementById("zoomer"));
    zoomer.setTarget(diagram);

    var defaultTemplate = `
		<p>Choose a state:<p>
		<div><select data-interactive="true" data-event-change="selectClick" name="states" id="states">
		<option value="none" selected></option>
		<option value="Ohio">India</option>
		<option value="South Dakota">South Dakota</option>
		<option value="Washington">Washington</option>
		<option value="Texas">Texas</option>
		</select>
		</div>`;

    // diagram.setDefaultControlTemplate(defaultTemplate);

    var id = 0;
    var node = new MindFusion.Diagramming.ControlNode(diagram);
    var len = str[id].search(',');
    s = str[0].substring(len + 1, str[0].length);

    // detect if the text contains link and add hypertext reference to the link
    if(s.includes("https")) {
        let s_len = s.search("https");
        let link = s.substring(s_len, s.length);
        let link_ref = '<a href="' + link + '" target="_blank">' + link + '</a>';
        s = s.substring(0, s_len) + link_ref;

    }

    var val = `<div id="d1"><p>` + s + `</p></div>` + `<div><select data-interactive="true" data-event-change="selectClick" name= "${id}" class="select" id= "${id}"><option value="none" selected></option>`;

    if (arr[id].length > 0) {
        for (var i = 0; i < arr[id].length; i++) {

            len1 = str[arr[id][i]].search(',');
            s1 = str[arr[id][i]].substring(3, len1);
            val += `<option value=` + arr[id][i] + `>` + s1 + `</option>`;
        }
    }
    val += `<option value="NotSure">NotSure</option>`;
    val += `</select></div>`;
    
    
    node.setTemplate(val);
    node.setBounds(new Rect(40, 10, bx, by + (s.length/45) * 4.5));
    //console.log("y size: " + (s.length%33) * 3)
    //console.log("s: " + s.length)
    node.setId(id);
    diagram.addItem(node);
    diagram.resizeToFitItems(10);

    // printing and saving the path from root to keyword node
    if(ifSearch == 'yes') {
        findPath(0, root_key_id, key);
        let root_key = [];
        for(let i = 0; i < root_key_id.length; i++) {
            root_key.push(str_hyphens[root_key_id[i]]);
        }

        console.log("search path (from root to keyword with or without subtree): ");
        for(let i = 0; i < root_key.length; i++) {
            console.log(root_key[i] + '\n');
        }
        
        // for passing values to python
        let root_key_dic = Object.assign({}, root_key);
        const s_test = JSON.stringify(root_key_dic);
        $.ajax({
            url:"/root_to_keyword",
            type:"POST",
            contentType:"application/json",
            data: JSON.stringify(s_test),
        });
        // get subtree
        subtree(ifSubtree, key); // this function will fill up the path_subtree
    }
        

    let path_subtree_dic = Object.assign({}, path_subtree );
    const s2 = JSON.stringify(path_subtree_dic);
    $.ajax({
        url:"/get_subtree",
        type:"POST",
        contentType:"application/json",
        data: JSON.stringify(s2),
    });

    console.log("check root_key_id: " + root_key_id);
    // auto select by root_key_id
    if(ifSearch == 'yes') {
        $('.select').val(root_key_id[1]);
        selectClick(0, node);
    } 

}


// set root
let root_id = 0;
let path_search = [];

function selectClick(e, sender) {
    
    var selectControl = sender.getContent().getElementsByTagName("select")[0];
    console.log(selectControl.value);
    deleteNode(sender.id);
    //console.log("parent number: " + sender.id);
    //console.log("children number: " + selectControl.value);
    if (selectControl.value != "none" && selectControl.value != "NotSure") {
        // console.log("children number: " + selectControl.value);
        if(str[selectControl.value] != undefined) {
            nextoption(selectControl.value, sender); 
        }

        //print path from root to current node
        parent = str[sender.id];
        parent_id = sender.id;
        child = str[selectControl.value];
        child_id = selectControl.value;
        if(ifSearch == 'no') {
            printPath(parent, parent_id, child, child_id, true);
        }


    }


    else if (selectControl.value == "NotSure") {
        notSure(sender.id, sender);

        //print path
        parent = str[sender.id];
        parent_id = sender.id;
        printPath(parent, parent_id, "all", -1, false);
    }

}

function notSure(id, originNode) {
    var node = new MindFusion.Diagramming.ControlNode(diagram);
    var layout = new MindFusion.Graphs.TreeLayout();
    layout.root = node;
    layout.direction = MindFusion.Graphs.LayoutDirection.TopToBottom;
    console.log("check layout.direction: " + layout.direction);
    // layout.keepRootPosition = true;
    layout.levelDistance = 10;
    linkType = MindFusion.Graphs.TreeLayoutLinkType.Cascading;
    if (arr[id].length > 0) {
        // console.log(arr[id].length);
        for (var i = 0; i < arr[id].length; i++) {


            node = new MindFusion.Diagramming.ControlNode(diagram);
            var ids = arr[id][i];
            // console.log(ids);
            len = str[ids].search(',');
            s = str[ids].substring(len + 1, str[ids].length);
            
            // detect if the text contains link and add hypertext reference to the link
            if(s.includes("https")) {
                let s_len = s.search("https");
                let link = s.substring(s_len, s.length);
                let link_ref = '<a href="' + link + '" target="_blank">' + link + '</a>';
                str[ids] = str[ids].substring(0, len + 1) + s.substring(0, s_len) + link_ref;

            }

            var val = `<div id="d1"><p>` + str[ids] + `</p></div>`;
            if (arr[ids].length > 0) {
                val += `<div><select data-interactive="true" data-event-change="selectClick" name= "${ids}" id= "${ids}"><option value="none" selected></option>`;
                for (var j = 0; j < arr[ids].length; j++) {

                    len1 = str[arr[ids][j]].search(',');
                    s1 = str[arr[ids][j]].substring(3, len1);
                    val += `<option value=` + arr[ids][j] + `>` + s1 + `</option>`;
                }
                val += `<option value="NotSure">NotSure</option>`;
                val += `</select></div>`;
            }
            node.setTemplate(val);

            // previously, the second parameter is ... + 60 
            // 45 and 4.5 are two parameters we can tune. 45 is around the length of a line
            node.setBounds(new Rect(originNode.getBounds().x, originNode.getBounds().y + 60 + 5 * prev_line, bx, by + (s.length/45) * 4.5));
            prev_line = s.length/45
            // node.setLocked(true);
            // node.setVisible(false);
            node.setStroke('#003466');
            node.setId(ids);
            diagram.addItem(node);
            var link = new DiagramLink(diagram, originNode, node);
            link.setHeadShape('Triangle');
            link.setHeadBrush('#003466');
            link.setStroke('#003466');
            link.setLocked(true);
            diagram.addItem(link);
            // createAnimatedLink(originNode, node);
        }
        diagram.arrange(layout);
        diagram.resizeToFitItems(10);
    }
}

function nextoption(id, originNode) {

    var node = new MindFusion.Diagramming.ControlNode(diagram);
    len = str[id].search(',');
    s = str[id].substring(len + 1, str[id].length);

    // detect if the text contains link and add hypertext reference to the link
    if(s.includes("https")) {
        let s_len = s.search("https");
        let link = s.substring(s_len, s.length);
        let link_ref = '<a href="' + link + '" target="_blank">' + link + '</a>';
        s = s.substring(0, s_len) + link_ref;

    }

    var val = `<div id="d1"><p>` + s + `</p></div>`;
    if (arr[id].length > 0) {
        val += `<div><select data-interactive="true" data-event-change="selectClick" name= "${id}" class="select" id= "${id}"><option value="none" selected></option>`;
        for (var i = 0; i < arr[id].length; i++) {

            len1 = str[arr[id][i]].search(',');
            s1 = str[arr[id][i]].substring(3, len1);
            val += `<option value=` + arr[id][i] + `>` + s1 + `</option>`;
        }
        val += `<option value="NotSure">NotSure</option>`;
        val += `</select></div>`;
    }

    
    node.setTemplate(val);
    // ay += 50;
    // the numbers below are all the parameters for us to tune
    node.setBounds(new Rect(originNode.getBounds().x, originNode.getBounds().y + 60 + 5 * prev_line, bx, by + (s.length/45) * 4.5));
    prev_line = s.length/45
    node.setId(id);


    
    node.setLocked(true);
    node.setVisible(true); // I changed it from false to true for auto selecting the answers according to path
    diagram.addItem(node);
    
    
    createAnimatedLink(originNode, node);
    diagram.resizeToFitItems(10);

    //auto select along the path
    if(arr[id].length !=  0 && ifSearch == 'yes' && index < root_key_id.length) {
        console.log("reach");
        id_str = id.toString();
        $('#' + id_str).val(root_key_id[index]);
        index = index + 1;
        selectClick(0, node);
    }
}

function createAnimatedLink(originNode, node) {
    var link = new DiagramLink(diagram, originNode, node);
    link.setHeadShape('Triangle');
    link.setHeadBrush('#003466');
    link.setStroke('#003466');
    link.setLocked(true);
    diagram.addItem(link);
    
    // console.log(originNode.id);
    // console.log(node.id);
    var ep = link.getEndPoint();
    link.setEndPoint(link.getStartPoint());
    var animation = new Animation(link, { fromValue: link.getStartPoint(), toValue: ep, animationType: AnimationType.Bounce, easingType: EasingType.EaseOut, duration: 1000 }, onUpdateLink);
    
    animation.addEventListener(AnimationEvents.animationComplete, function (sender, args) {
        
        node.setVisible(true);
        
        
    });
    
    animation.start();
}

function deleteNode(id) {

    var nodes = diagram.nodes.filter(function (p) {
        return p.id === id;
    });

    if (nodes.length > 0) {
        deleteRecursively(nodes[0].getOutgoingLinks());
    }
}

function deleteRecursively(links) {
    for (var i = links.length - 1; i >= 0; i--) {
        var node = links[i].getDestination();
        var nlinks = node.getOutgoingLinks();
        deleteRecursively(nlinks);
        diagram.removeItem(node);


    }
}

// a custom update callback for link animations
function onUpdateLink(animation, animationProgress) {
    var link = animation.item;
    var pointA = animation.getFromValue(),
        pointB = animation.getToValue();

    link.setEndPoint(
        new Point(
            pointA.x + (pointB.x - pointA.x) * animationProgress,
            pointA.y + (pointB.y - pointA.y) * animationProgress));
    link.invalidate();
}


function printPath(parent, parent_id, child, child_id, ifsure) {
    let save_path = []
    console.log("Path(from root to curr): " + str_hyphens[parent_id] + "\n");
    save_path.push(str_hyphens[parent_id]);

    if(ifsure == true) {
        // we only print the child when the child is the leaf
        if(arr[child_id].length == 0) {
            console.log("Path(from root to curr): " + str_hyphens[child_id] + "\n");
            save_path.push(str_hyphens[child_id]);
        }
    }
    else if(ifsure == false) {
        if(arr[parent_id].length != 0) {
            for(let i = 0; i < arr[parent_id].length; i++) {
                console.log("Path(from root to curr): " + str_hyphens[arr[parent_id][i]] + "\n");
                save_path.push(str_hyphens[child_id]);
            }
        }
    }

    // for passing values to python
    let save_path_dic = Object.assign({}, save_path);
    const s_test = JSON.stringify(save_path_dic);
    $.ajax({
        url:"/root_to_curr",
        type:"POST",
        contentType:"application/json",
        data: JSON.stringify(s_test)
    });


}


function findPath(root_id, path, k) {
    // base case
    if(root_id == undefined) {
        return false;
    }

    
    path.push(root_id);

    if(root_id == k) {
        return true;
    }

    for(let j = 0; j < arr[root_id].length; j++) {
        if(arr[root_id].length != 0 && findPath(arr[root_id][j], path, k)) {
            return true;
        }
    }

    //pop out because the key is not in the subtree of the node
    path.pop();
    return false;

}

function subtree(ifSubtree, node_id) {
    if(ifSubtree == 'no') {
        return;
    }
    else if(arr[node_id].length == 0) {
        return;
    }
    else if(ifSubtree == 'yes') {
        for(let j = 0; j < arr[node_id].length; j++) {
            console.log(str_hyphens[arr[node_id][j]]);
            path_subtree.push(str_hyphens[arr[node_id][j]]);
            subtree('yes', arr[node_id][j]);
        }
    }
}



function input_search() {
    keyword = $('#input').val()
    result = keywordSearch(keyword);

    if(result.length == 0) {
        alert("The node containing this keyword doesn't exist.");
    }
    else if(keyword == '') {
        alert("You did not input any keyword");
    }
    else if(result.length == 1) {
        // localStorage.setItem("search_result", JSON.stringify(result[0]));
        let text = document.getElementById('result');
        
        text.innerHTML = 'Only one node containing the keyword: <br>';
        // for checking the first option
        text.innerHTML += str[result[0]] + '<input name="search_result" type="radio" value="'+ result[0] +'" checked> <br>';

        text.innerHTML += 'Do you want to print out the subtree of the keyword node? <br>';
        text.innerHTML += 'Yes<input name="ifSubtree" type="radio" value="yes" checked> <br>';
        text.innerHTML += 'No<input name="ifSubtree" type="radio" value="no"> <br>';
        text.innerHTML += '<button class="btn btn-primary" onclick="submit()">submit</button>';
        // window.location.href = "tree.html";        
    }
    else {
        let text = document.getElementById('result');
        text.innerHTML = 'All nodes containing the keyword (please choose the node you want and click submit): <br>' ;
        // for checking the first option
        text.innerHTML += '<p>' + str[result[0]] + '</p>' + '<input name="search_result" type="radio" value="'+ result[0] +'" checked> <br> ';
        for(let i = 1; i < result.length; i++) {
            text.innerHTML += '<p>' + str[result[i]] + '</p>' + '<input name="search_result" type="radio" value="'+ result[i] +'"> <br> ';
        }

        text.innerHTML += 'Do you want to print out the subtree of the keyword node? <br>';
        text.innerHTML += 'Yes<input name="ifSubtree" type="radio" value="yes" checked> <br>';
        text.innerHTML += 'No<input name="ifSubtree" type="radio" value="no"> <br>';
        text.innerHTML += '<button class="btn btn-primary" onclick="submit()">submit</button>';
    }
}
    
function keywordSearch(key) {
    let loc = [];
    for(let i = 0; i < str_hyphens.length; i++) {
        result = str_hyphens[i].search(key);
        if(result != -1) {
            loc.push(i);
        }
    }

    return loc;
}

function submit(){
    let result = document.getElementsByName('search_result');
    for(let i = 0; i < result.length; i++) {
        if(result[i].checked) {
            localStorage.setItem("search_result", JSON.stringify(result[i].value));
        }
    }

    let ifSubtree = document.getElementsByName('ifSubtree');
    for(let i = 0; i < ifSubtree.length; i++) {
        if(ifSubtree[i].checked) {
            localStorage.setItem("ifSubtree", JSON.stringify(ifSubtree[i].value));

        }
    }
    localStorage.setItem("ifSearch", JSON.stringify('yes'));
    window.location.href = "tree.html"; 
}








