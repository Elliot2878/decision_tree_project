var str = JSON.parse(localStorage.getItem("str-array"));
var str_hyphens = JSON.parse(localStorage.getItem("str-hyphens-array"));
var arr = JSON.parse(localStorage.getItem("arr-array"));
// The key is an id (a single line number starting from 0)
var key = JSON.parse(localStorage.getItem("search_result"));
var ifSubtree = JSON.parse(localStorage.getItem("ifSubtree"));


// ifSearch will become yes only after the user first search the node 
// This can prevent the tree.html from auto-selecting the answers even though the user just left the index page. 
var ifSearch = JSON.parse(localStorage.getItem("ifSearch"));

// var error = JSON.parse(localStorage.getItem("error"));
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
var bx = 85, by = 30;
var currId = 0;
var currOriginNode = null;

let ifNewInput = '';
if(ifSearch == 'yes' ) {
    ifNewInput = 'no';
}
else if(ifSearch = 'no') {
    ifNewInput = 'yes';
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
    let s = str[0].substring(len + 1, str[0].length);

    // detect if the text contains link and add hypertext reference to the link
    let s_len = s.search("https");
    let link = s.substring(s_len, s.length);
    if(s.includes("DOCUMENT")) {
        let link_ref = '<a href="' + link + '" target="_blank">' + link + '</a>';
        s = s.substring(0, s_len) + link_ref;
    }
    // else if(s.includes("DECISIONTREE")) {

    // }

    if (arr[id].length > 0 && arr[id].length <= 5) {
        var val = `<div id="d1"><p>` + s + `</p></div>` + `<div><select data-interactive="true" data-event-change="selectClick" name= "${id}" class="select" id= "${id}"><option value="none" selected></option>`;
        
        for (var i = 0; i < arr[id].length; i++) {

            len1 = str[arr[id][i]].search(',');
            s1 = str[arr[id][i]].substring(3, len1);
            val += `<option value=` + arr[id][i] + `>` + s1 + `</option>`;
        }
        val += `<option value="NotSure">NotSure</option>`;
        val += `</select></div>`;
    }
    else if(arr[id].length > 5) {
        var val = `<div id="d1"><p>` + s + `</p></div>`;
        
        for (var i = 0; i < arr[id].length; i++) {
            len1 = str[arr[id][i]].search(',');
            s1 = str[arr[id][i]].substring(3, len1);
            val += '<input type="checkbox" name="topics" value="' + arr[id][i] + '" />' + s1 + '<br />';                    
        }

        val += '<button class="btn btn-primary" onclick="selectClick()">Submit</button>';
    }

    // console.log("check val: " + val);
    node.setTemplate(val);
    node.setBounds(new Rect(40, 10, bx, by));
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

    // console.log("check root_key_id: " + root_key_id);
    // auto select by root_key_id
    if(ifSearch == 'yes') {
        $('.select').val(root_key_id[1]);
        selectClick(0, node);
    }
    
    // create new node for the new input file
    // console.log("check s: " + s);
    if(s.includes("DECISIONTREE") && ifNewInput == 'yes') {
        newInput(link, id);
        // console.log("reach new input");
        // myFunction();
        // ifNewInput = JSON.parse(localStorage.getItem("ifNewInput"));
    }

}


// set root
let root_id = 0;
let path_search = [];

function selectClick(e, sender) {
    // console.log("reach");
    
    var selectControl = sender.getContent().getElementsByTagName("select")[0];
    //console.log("check id in selectClick: " + selectControl.value);
    
    // console.log("check str_hypthens in selectClick: " + str_hyphens);
    // console.log(selectControl.value);
    
    // I updated the code below so that the nodes will not be deleted after the tree receive new input
    // Find parent node of sender.id

    // let senderParent = 0;
    // for(let i = 0; i < arr.length; i++) {
    //     // console.log("check arr: " + arr[i]);
    //     // console.log("check sender.id: " + sender.id);
    //     let id = parseInt(sender.id);
    //     if(arr[i].includes(id) == true) {
    //         senderParent = i;
    //         console.log("check senderParent: " + senderParent);
    //     }
    // }

    // if(str[selectControl.value].includes("DECISIONTREE") == false) {
    //     console.log("check haha: " + str[selectControl.value]);
    //     console.log("reach deleteNode");
    deleteNode(sender.id);
    // }
    
    //console.log("parent number: " + sender.id);
    //console.log("children number: " + selectControl.value);
    if (selectControl.value != "none" && selectControl.value != "NotSure") {
        // console.log("children number: " + selectControl.value);
        if(str[selectControl.value] != undefined) {
            nextoption(selectControl.value, sender); 
            // console.log("check arr[0] combine after nextoption: " + arr[0]);
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
    // console.log("check layout.direction: " + layout.direction);
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

            node.setBounds(new Rect(originNode.getBounds().x, originNode.getBounds().y + 60, bx, by));
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

            // create a larger decision tree for the new input file
            if(s.includes("DECISIONTREE") && ifNewInput == 'yes') {
                // console.log("check link: " + link);
                console.log("check str_hyphens combine before the newinput: " + str_hyphens);
                console.log("check ifNewInput: " + ifNewInput);
                newInput(link, id);
                ifNewInput = JSON.parse(localStorage.getItem("ifNewInput"));
                console.log("check str_hyphens combine after the newInput: " + str_hyphens);
                // console.log("reach new input");

                // str = JSON.parse(localStorage.getItem("str-array2"));
                // str_hyphens = JSON.parse(localStorage.getItem("str-hyphens-array2"));
                // arr = JSON.parse(localStorage.getItem("arr-array2"));
                // ifSearch = JSON.parse(localStorage.getItem("ifSearch2"));
                
                // error = JSON.parse(localStorage.getItem("error2"));
                
                // console.log("check id in nextoption: " + id);

                int_id = parseInt(id);
                nextoption(int_id + 1, node);
            }
        }
        diagram.arrange(layout);
        diagram.resizeToFitItems(10);
    }
}

function showCheckbox(id, originNode, results) {
    var node = new MindFusion.Diagramming.ControlNode(diagram);
    var layout = new MindFusion.Graphs.TreeLayout();
    layout.root = node;
    layout.direction = MindFusion.Graphs.LayoutDirection.TopToBottom;
    // console.log("check layout.direction: " + layout.direction);
    // layout.keepRootPosition = true;
    layout.levelDistance = 10;
    linkType = MindFusion.Graphs.TreeLayoutLinkType.Cascading;
    if (arr[id].length > 0) {
        // console.log(arr[id].length);
        for (var i = 0; i < arr[id].length; i++) {

            if(results.includes(i)) {
                node = new MindFusion.Diagramming.ControlNode(diagram);
                var ids = arr[id][i];
                // console.log(ids);
                len = str[ids].search(',');
                s = str[ids].substring(len + 1, str[ids].length);
                
                // detect if the text contains link and add hypertext reference to the link
                // rename link to dtlink(decision tree link) here because we use the name 'link' later for another purpose
                let s_len = s.search("https");
                let dtlink = s.substring(s_len, s.length);
                if(s.includes("DOCUMENT") || s.includes("DECISIONTREE")) {
                    let link_ref = '<a href="' + dtlink + '" target="_blank">' + dtlink + '</a>';
                    s = s.substring(0, s_len) + link_ref;
                }

                // str[ids]
                var val = `<div id="d1"><p>` + s + `</p></div>`;
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

                node.setBounds(new Rect(originNode.getBounds().x, originNode.getBounds().y + 60, bx, by));
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
                diagram.arrange(layout);
                diagram.resizeToFitItems(10);


                // create a larger decision tree for the new input file
                if(s.includes("DECISIONTREE") && ifNewInput == 'yes') {
                    console.log("reach decisiontree");
                    newInput(dtlink, id, true, i);
                    ifNewInput = JSON.parse(localStorage.getItem("ifNewInput"));
                }

            }
        }
    }
}

function nextoption(id, originNode) {
    let ifCheckbox = false;

    // console.log("check id in nextoption: " + id);
    var node = new MindFusion.Diagramming.ControlNode(diagram);
    let len = str[id].search(',');
    let s = str[id].substring(len + 1, str[id].length);

    // detect if the text contains link and add hypertext reference to the link
    let s_len = s.search("https");
    let link = s.substring(s_len, s.length);
    if(s.includes("DOCUMENT") || s.includes("DECISIONTREE")) {
        let link_ref = '<a href="' + link + '" target="_blank">' + link + '</a>';
        s = s.substring(0, s_len) + link_ref;
    }
    // else if(s.includes("DECISIONTREE")) {

    // }

    var val = `<div id="d1"><p>` + s + `</p></div>`;
    if (arr[id].length > 0 && arr[id].length <= 5) {
        val += `<div><select data-interactive="true" data-event-change="selectClick" name= "${id}" class="select" id= "${id}"><option value="none" selected></option>`;
        for (var i = 0; i < arr[id].length; i++) {

            len1 = str[arr[id][i]].search(',');
            s1 = str[arr[id][i]].substring(3, len1);
            val += `<option value=` + arr[id][i] + `>` + s1 + `</option>`;
        }
        val += `<option value="NotSure">NotSure</option>`;
        val += `</select></div>`;
    }
    else if(arr[id].length > 5) {
        ifCheckbox = true;
        // ifNewInput = 'yes';
        val += '<form action="#" method="post" id="checkbox_form"">';
        for (var i = 0; i < arr[id].length; i++) {
            len1 = str[arr[id][i]].search(',');
            s1 = str[arr[id][i]].substring(3, len1);
            val += `<input type="checkbox" name="option" class="checkbox" value="` + arr[id][i] + `" />` + s1 + `<br />`;                    
        }
        // ${id}, ${originNode}
        // onclick="checkboxAnswers(' + id + ',' + originNode + ');
        val += '<button type="button" id = cb-button class="btn btn-primary" >Submit</button>';
    
        
        val += '</form>';
    }
    
    
    
    node.setTemplate(val);
    node.setBounds(new Rect(originNode.getBounds().x, originNode.getBounds().y + 60 + 5 * prev_line, bx, by));
    node.setId(id);
    
    node.setLocked(true);
    node.setVisible(true); // I changed it from false to true for auto selecting the answers according to path
    
    diagram.addItem(node);
    createAnimatedLink(originNode, node);
    diagram.resizeToFitItems(10);
    
    // submit the checkbox answers
    if(arr[id].length > 5) {
        var o = document.getElementById("cb-button");
        console.log("check o: " + o);
        currId = id;
        currOriginNode = node;
        o.onclick = checkboxAnswers;
    }

    //auto select along the path
    if(arr[id].length !=  0 && ifSearch == 'yes' && index < root_key_id.length) {
        id_str = id.toString();
        $('#' + id_str).val(root_key_id[index]);
        index = index + 1;
        if(ifCheckbox == false) {
            // 0 has no meaning. It is just the 'e' standing for everything
            selectClick(0, node);
        }
        else if(ifCheckbox == true) {
            let results = [];
            results.push(root_key_id[index - 1] - parseInt(id) - 1);
            showCheckbox(id, node, results);
        }
    }

    // create a larger decision tree for the new input file
    if(s.includes("DECISIONTREE") && ifNewInput == 'yes') {
        newInput(link, id, false, 0);
        ifNewInput = JSON.parse(localStorage.getItem("ifNewInput"));
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
        if(arr[child_id] != undefined && arr[child_id].length == 0) {
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


function newInput(link, id, ifCheckbox, addIdForCheckbox) {
	// document.getElementById("undo").style.display = "inline-block";
    // add new input into str, str-hyphens, obj, vec, and arr. 
    // The code inside the "get" seems run in a wierd order. The str and str_hyphens will belong to new input as long as you are in the "get". 
    // That is why I store str anfd str_hyphens in new variable first.    
    // let str_old = str;
    let str_hyphens_old = str_hyphens;
    // sender.id is not an interger, you must parse it to int. 
    id = parseInt(id);
    $.get( link, function( data) {

        // console.log("check str combine in newInput: " + str);
        let str_old = [];
        let arr_get = [];
        var str2 = [];
        var n;
        var obj;
        let stack = [];
        // var arr = [];
        var zero = [];
        var vec;
        var text = data;
        if(ifCheckbox == true) {
            id = id + addIdForCheckbox + 1; // plus one because addIdForCheckbox started from zero
        }
        
        let str_hyphens2 = text.split("\n"); 
        str_hyphens2 = str_hyphens2.filter(n => n);

        str_hyphens2[0] = "if show next, " + str_hyphens2[0]; 
        // Add more hyphens to the new input: str_hyphens2
        let more_hyphens = '--';
        for (let j = 0; j < str_hyphens_old[id].length; j++) {
            if (str_hyphens_old[id][j] != '-') break;
            else more_hyphens += '-';
        }

        for(let i = 0; i < str_hyphens2.length; i++) {
            str_hyphens2[i] = more_hyphens.concat(str_hyphens2[i]);
        }



        str_hyphens_old = str_hyphens_old.filter(n => n);
        
        // for(let i = 0; i < str_hyphens_old.length; i++) {
        //     console.log(i + ": " + str_hyphens_old[i]);
        // }



        let left = [];
        let right = [];
        for(let i = 0; i < id + 1; i++) {
            left.push(str_hyphens_old[i]);
        }

        for(let i = id + 1; i < str_hyphens_old.length; i++) {
            right.push(str_hyphens_old[i]);
        }

        // left = str_hyphens_old.slice(0, id + 1);
        // right = str_hyphens_old.slice(id + 1, str2.length);
        
        // console.log("check id: " + id);
        // console.log("check left: " + left);
        // console.log("check right: " + right);
        
        str_hyphens = left.concat(str_hyphens2);
        str_hyphens = str_hyphens.concat(right);    
        
        
        n = str_hyphens.length;

        vec = new Array(n);
        obj = new Array(n);
        for (var i = 0; i < obj.length; i++) {
            obj[i] = new Array(4);
            arr_get[i] = new Array(0);
        }
    
        // console.log("check n in newInput: " + n);
    
        let error = "";
        // console.log(str[1]);
        for (var i = 0; i < n; i++) {
            let size = 0;
    
            // count the number of hyphens of this line
            for (var j = 0; j < str_hyphens[i].length; j++) {
                if (str_hyphens[i][j] != '-') break;
                else size++;
            }
    
            // count the number of hyphens of the next line
            let next_size = 0;
            if (i != n - 1) {
                for (var j = 0; j < str_hyphens[i + 1].length; j++) {
                    if (str_hyphens[i + 1][j] != '-') break;
                    else next_size++;
                }
            }
    
            vec[size / 2] = i;
            if (size == 0) {
                // arr_get[0].push(i);
                zero.push(i);
            }
            else {
                arr_get[vec[(size / 2) - 1]].push(i);
            }
    
            // get rid of the hyphens in str array
            str_old[i] = str_hyphens[i].substring(size);
    
            //ZL: I don't know what the obj is used for as it is never used again thereafter. However, the system will crash if I commented this line 
            obj[size / 2].push(str_old[i]);
        }
        
        
        
        // console.log("check arr in newInput: " + arr[0]);
       
        // console.log("check str_old combine in newInput: " + str_old);
        // console.log("check str_hyphens combine in newInput: " + str_hyphens);
        
        localStorage.setItem("str-array", JSON.stringify(str_old));
        localStorage.setItem("str-hyphens-array", JSON.stringify(str_hyphens));
        localStorage.setItem("arr-array", JSON.stringify(arr_get));
        localStorage.setItem("ifSearch", JSON.stringify('yes'));
        localStorage.setItem("ifNewInput", JSON.stringify('no'));
        localStorage.setItem("search_result", JSON.stringify(id));
        window.location.href = "tree.html";
        
    });
    
    // console.log("check str_hyphens combine in newInput2 out of get: " + str_hyphens);
}


function checkboxAnswers() {
    // save the answers of checkbox
    results = [];
    let checkbox = document.getElementsByClassName('checkbox');
    for(let i = 0; i < checkbox.length; i++) {
        if(checkbox[i].checked == true) {
            // checkBox[i].value 
            //console.log(i + " is checked");
            results.push(i);
        }
        else{
            //console.log(i + " is not checked");
        }
    }

    //console.log(results);
    showCheckbox(currId, currOriginNode, results);

}


// Make the Search Window draggable
dragElement(document.getElementById("mydiv"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}



