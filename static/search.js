var str = JSON.parse(localStorage.getItem("str-array"));
var str_hyphens = JSON.parse(localStorage.getItem("str-hyphens-array"));

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
        text.innerHTML += str[result[0]] + '<input name="search_result" type="radio" value="'+ result[0] +'" checked> <br> ';
        for(let i = 1; i < result.length; i++) {
            text.innerHTML += str[result[i]] + '<input name="search_result" type="radio" value="'+ result[i] +'"> <br> ';
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

    window.location.href = "tree.html"; 
}






