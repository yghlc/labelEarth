

const serUrl = 'http://127.0.0.1:8000/imageObjects';

// need user to login first, so we can get the username
let username = 'huanglingcao'

function getNowstr(){
    let timeElapsed = Date.now();
    let now = new Date(timeElapsed);
    return now;
}

function meters_to_degrees_onEarth(distance){
    return (distance/6371000.0)*180.0/Math.PI;
}

async function get_available_image(username){
    // wait and get image info: {image name, center lat, lon}
    let item_url = serUrl + '/' + username + '/' + 'getitem';
    let response = await fetch(item_url);
    if (response.ok){
        let data = await response.json();
        return data;
    }
}

async function getOne_imageItem(){
    let img_info = await get_available_image(username);
    // console.log(img_info)
    return img_info
}

function get_GoogleMap_url(lat, lon){
    // let lat = 68.88106998594964;
    // let lon = -150.96427868325944;
    let goo_urlLeft = "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1950.428084417938!2d";
    let goo_urlRight = "!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sus!4v1646793974452!5m2!1sen!2sus";
    let googleMap_url;
    googleMap_url = goo_urlLeft + String(lon) + "!3d" + String(lat) + goo_urlRight;
    return googleMap_url;
}

function reload_GoogleMap_Frame(center_lat,center_lon){
    parent.document.getElementById('div1GoogleMap').src = get_GoogleMap_url(center_lat,center_lon);
}

function get_esriWayBackMap_url(lat, lon){
    let ext_half_degree = meters_to_degrees_onEarth(500);
    let min_lon = lon - ext_half_degree;
    let max_lon = lon + ext_half_degree;
    let min_lat = lat - ext_half_degree;
    let max_lat = lat + ext_half_degree;

    let esriWayBack_urlLeft = "https://livingatlas.arcgis.com/wayback/#active=26120&ext=";
    let map_url;
    map_url = esriWayBack_urlLeft + `${min_lon},${min_lat},${max_lon},${max_lat}`;
    return map_url;
}
function reload_esriWayBackMap_Frame(center_lat,center_lon){
    parent.document.getElementById('div2WayBackMap').src = get_esriWayBackMap_url(center_lat,center_lon);
}

// load the data and shows the first images after login
// each time refresh this website page, will re-run this.
getOne_imageItem().then(img_info => {
        console.log(getNowstr(),img_info);
        let image_name = document.getElementById('image_name');
        // image_name.value  = `Name: ${img_info.image_name}, Center Lat: ${img_info.image_center_lat}, Center Lon: ${img_info.image_center_lon}`;
        image_name.value  = img_info.image_name;
        reload_GoogleMap_Frame(img_info.image_center_lat,img_info.image_center_lon);
        reload_esriWayBackMap_Frame(img_info.image_center_lat,img_info.image_center_lon);
    }
).catch(error =>{ console.log(error)})

// if submitAndNext is for button type="submit", it will refresh the entire page
// if submitAndNext is for button type="button", it will not refresh the entire page

function submitAndNext(){
    // alert("submitAndNext in infoFormEdit");
    console.log("submitAndNext in infoFormEdit")
    // reload_otherFrame();
}

function previousItem(){
    alert("previous in infoFormEdit");
}

function NextItem(){
    alert("NextItem in infoFormEdit");
}