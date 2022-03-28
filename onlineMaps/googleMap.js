
let goo_urlLeft = "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1950.428084417938!2d";
let goo_urlRight = "!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sus!4v1646793974452!5m2!1sen!2sus";


// an example:
// original test center point;
// src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1950.428084417938!2d-150.96427868325944!3d68.88106998594964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sus!4v1646793974452!5m2!1sen!2sus"


// function get_center_latlon(){
//     let lat = 68.88106998594964;
//     let lon = -150.96427868325944;
//     googleMap_url = urlLeft + String(lon) + "!3d" + String(lat) + urlRight;
//     return googleMap_url;
// }

function get_GoogleMap_url(){
    let lat = 68.88106998594964;
    let lon = -150.96427868325944;
    let googleMap_url;
    googleMap_url = goo_urlLeft + String(lon) + "!3d" + String(lat) + goo_urlRight;
    return googleMap_url;
}


document.getElementById('div1GoogleMap').src = get_GoogleMap_url();
