

let image_list;  //
const serUrl = 'http://127.0.0.1:8000/imageObjects';

// load the data and shows the first images
InitialForm_FirstItem();


function InitialForm_FirstItem(){
    // need user login, so we can get the username
    let username = 'huanglingcao'
    let getitem_url = serUrl + '/' + username + '/' + 'getitem';

    fetch(getitem_url).
    then(response=>response.json()).
    then(data => console.log(data))
}


function submitAndNext(){
    alert("submitAndNext in infoFormEdit");
}

function previousItem(){
    alert("previous in infoFormEdit");
}

function NextItem(){
    alert("NextItem in infoFormEdit");
}