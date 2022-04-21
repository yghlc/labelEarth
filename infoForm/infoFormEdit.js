

let image_list;  //
const serUrl = 'http://127.0.0.1:8000/imageObjects';
const Http = new XMLHttpRequest()


async function get_available_image(username){
    // wait and get image info: {image name, center lat, lon}
    let item_url = serUrl + '/' + username + '/' + 'getitem';
    let response = await fetch(item_url);
    if (response.ok){
        let data = await response.json();
        return data;
    }
}

async function InitialForm_FirstItem(){
    // need user to login first, so we can get the username
    let username = 'huanglingcao'
    let img_info = await get_available_image(username);
    // console.log(img_info)
    return img_info
}

// load the data and shows the first images after login
InitialForm_FirstItem().then(img_info => {
        console.log(img_info);
        let image_name = document.getElementById('image_name');
        image_name.value  = `Name: ${img_info.image_name}, Center Lat: ${img_info.image_center_lat}, Center Lon: ${img_info.image_center_lon}`;
    }
)

function submitAndNext(){
    alert("submitAndNext in infoFormEdit");
}

function previousItem(){
    alert("previous in infoFormEdit");
}

function NextItem(){
    alert("NextItem in infoFormEdit");
}