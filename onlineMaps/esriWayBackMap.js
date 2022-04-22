
// example
// src="https://livingatlas.arcgis.com/wayback/#active=26120&ext=-150.96849,68.87931,-150.95027,68.88334"

let esriWayBack_urlLeft = "https://livingatlas.arcgis.com/wayback/#active=26120&ext=";

function get_esriWayBackMap_url(){
    // let lat = 68.88106998594964;
    // let lon = -150.96427868325944;
    let map_url;
    map_url = esriWayBack_urlLeft + "-150.96849,68.87931,-150.95027,68.88334"
    return map_url;
}

// document.getElementById('div2WayBackMap').src = get_esriWayBackMap_url();
document.getElementById('div2WayBackMap').src = '';
