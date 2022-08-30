var map = L.map('map', {
	center: [40.0076, -105.2659],  //[68.88207, -150.96]
	crs: L.CRS.EPSG3857, //default: L.CRS.EPSG3857
	zoom: 16,
	zoomControl: false,
	worldCopyJump: true
});

var Esri_WorldImagery = L.tileLayer(
	'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
	}).addTo(map);

let added_polygon = null;
let added_image = null;

let copied_polygon_json = null;
var drawnItems = new L.FeatureGroup();

// EPSG3413

// var map = L.map('map', {
//   center: [68.88107, -150.96209],
//   zoom: 11,
//   zoomControl: false,
//   crs: new L.Proj.CRS("EPSG:3413",
// 	'+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs',
// 	{
// 		resolutions: [8192, 4096, 2048] // 3 example zoom level resolutions
// 	}
//   ),
//   worldCopyJump: false
// });

// L.redrawImage = L.Handler.extend({
// 	addHooks:function() {L.DomEvent.on(window, 'newItem', this._drawFigure, this);},
// 	removeHooks:function(){L.DomEvent.off(window, 'newItem', this._drawFigure, this);},
// 	_drawFigure:function (ev) {
// 		console.log('get a event:',ev)
// 		// this.map.panTo();
// 	}
// })


function redraw_image_map(ev_data){
	// console.log('redraw_image_map',ev_data)
	// let send_data = {'image_name':img_info.image_name,
	// 	'center_lat':img_info.image_center_lat,
	// 	'center_lon':img_info.image_center_lon,
	// 	'user_name':username,
	// 	'serUrl':serUrl}
	let serUrl = ev_data.serUrl
	let imageUrl =  serUrl + '/' + ev_data.image_name + '/' + 'imagefile';
	let imageBound = serUrl + '/' + ev_data.image_name + '/' + 'imagebound';
	fetch(imageBound).then(function(response) {
		return response.json()
	}).then(function(data) {
		// get bounding coordinate
		let topLeft = data.features[0].geometry.coordinates[0][0],
			bottomLeft = data.features[0].geometry.coordinates[0][3],
			upperRight = data.features[0].geometry.coordinates[0][1],
			lowerRight = data.features[0].geometry.coordinates[0][2];

		if (added_image !== null){
			added_image.remove();
			console.log('remove the previous added image (a raster)');
		}
		// add image to map
		// https://github.com/IvanSanchez/Leaflet.ImageOverlay.Rotated
		added_image = L.imageOverlay.arrugator(
			imageUrl, {
				controlPoints: [topLeft, bottomLeft, upperRight, lowerRight],
				projector: proj4('EPSG:3413', 'EPSG:3857').forward,
				epsilon: 1000000,
				fragmentShader: "void main() { gl_FragColor = texture2D(uRaster, vUV); }",
				padding: 0.1,
			}
		).addTo(map);

	}).catch(error => {
		// alert(error)
		console.log('error in redraw_image_map', error);
	})
}

function remove_drawn_items(){
	if (map.hasLayer(drawnItems)) {
		// drawnItems.remove();   this is wrong.
		drawnItems.eachLayer(function(layer) {
			drawnItems.removeLayer(layer);
		})
	}
}

function redraw_objects(ev_data){
	let serUrl = ev_data.serUrl
	let imageObjects = serUrl + '/' + ev_data.image_name + '/' + 'imageobject';
	if (ev_data.edit_polygons !== undefined && ev_data.edit_polygons !== null) {
		imageObjects = serUrl + `/${ev_data.user_name}/imageobject/${ev_data.image_name}`;
	}
	remove_drawn_items();
	fetch(imageObjects).then(function(response) {
		return response.json()
	}).then(function(data) {
		if (added_polygon !== null) {
			added_polygon.remove();
			console.log('remove the previous added geoJson (a polygon)')
		}
		added_polygon = L.Proj.geoJson(data, {
			onEachFeature: function(feature, layer) {
				layer.setStyle({fill: false, color: 'red', weight: 1});
				drawnItems.addLayer(layer);
				copied_polygon_json = JSON.stringify(drawnItems.toGeoJSON());
				}

		}) //.addTo(map);
	}).catch(error => {
		// alert(error)
		console.log('error in redraw_objects', error);
	})

}

function pan_map(ev_data){
	let center_lat = ev_data.center_lat;
	let center_lon = ev_data.center_lon;
	map.panTo([center_lat,center_lon]);
}


document.addEventListener('newItem', function (e) {
	// console.log('index:','addEventListener: netItem',e);
	pan_map(e.detail);
	redraw_image_map(e.detail);
	redraw_objects(e.detail);

	// set hide image button as true
	document.getElementById("hide_image").checked = true;
}, false);


// https://github.com/kartena/Proj4Leaflet
proj4.defs('EPSG:3413',
"+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs");

// function showYolov4(yolov4_name='yolov4_output_epsg3413'){
// 	fetch('./layers/'+yolov4_name+'.geojson').then(function(response) {
// 		return response.json()
// 	}).then(function(data) {
// 		// update center coordinates
// 		// updateInput(updateID='coordinates', updateText=calCenterCoordinates(data))
// 		// add geoJson to map
// 		L.Proj.geoJson(data, {
// 			style: function() {
// 				return {
// 					color: 'green'
// 				}
// 			}
// 		}).addTo(map);;
// 	});
// }

// function showHillShade(hillshade_name='hillshade_HWline_sub1'){
// 	// From EPSG3413 to EPSG3857 for visualization
// 	fetch('./layers/'+hillshade_name+'_xy.geojson').then(function(response) {
// 		return response.json()
// 	}).then(function(data) {
//
// 		var imageUrl = './layers/'+hillshade_name+'.png';
// 		// get bounding coordinate
// 		var topLeft = data.features[0].geometry.coordinates[0][0],
// 			bottomLeft = data.features[0].geometry.coordinates[0][3],
// 			upperRight = data.features[0].geometry.coordinates[0][1],
// 			lowerRight = data.features[0].geometry.coordinates[0][2];
//
// 		// add image to map
// 		// https://github.com/IvanSanchez/Leaflet.ImageOverlay.Rotated
// 		L.imageOverlay.arrugator(
// 			imageUrl, {
// 				controlPoints: [topLeft, bottomLeft, upperRight, lowerRight],
// 				projector: proj4('EPSG:3413', 'EPSG:3857').forward,
// 				epsilon: 1000000,
// 				fragmentShader: "void main() { gl_FragColor = texture2D(uRaster, vUV); }",
// 				padding: 0.1,
// 			}
// 		).addTo(map);
//
// 		// add bouding box to map
// 		L.Proj.geoJson(data, {
// 			style: function() {
// 				return {
// 					color: 'red'
// 				}
// 			}
// 		}).addTo(map);
// 	})
//
// };

// function calCenterCoordinates(geoJson){
// 	var lng1 = geoJson.features[0].geometry.coordinates[0][0][0][0]
// 	var lng2 = geoJson.features[0].geometry.coordinates[0][0][1][0]
// 	var lat1 = geoJson.features[0].geometry.coordinates[0][0][0][1]
// 	var lat2 = geoJson.features[0].geometry.coordinates[0][0][2][1]
// 	var center_lng = (lng1 + lng2) / 2
// 	var center_lat = (lat1 + lat2) / 2
// 	return [center_lat, center_lng]
// }
//
// function updateInput(updateID='coordinates', updateText=''){
// 	var updateID = document.getElementById(updateID);
// 	updateID.value = updateText;
// }
//--------------------------------------------------------------------------------------------------------------------------

// Zoom Control
var zoomControl = L.control.zoom({
	position: "bottomright"
});
zoomControl.addTo(map);

//--------------------------------------------------------------------------------------------------------------------------

// Leaflet Draw

map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
	edit: {
		featureGroup: drawnItems,
		poly: {
			allowIntersection: false
		}
	},
	draw: {
		circle: false,
		circlemarker: false,
		polygon: {
			allowIntersection: false,
			showArea: true
		}
	}
});
map.addControl(drawControl);

// Truncate value based on number of decimals
var _round = function(num, len) {
	return Math.round(num * (Math.pow(10, len))) / (Math.pow(10, len));
};
// Helper method to format LatLng object (x.xxxxxx, y.yyyyyy)
var strLatLng = function(latlng) {
	return "(" + _round(latlng.lat, 6) + ", " + _round(latlng.lng, 6) + ")";
};

// Generate popup content based on layer type
// - Returns HTML string, or null if unknown object
var getPopupContent = function(layer) {
	// Marker - add lat/long
	if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
		return strLatLng(layer.getLatLng());
		// Circle - lat/long, radius
	} else if (layer instanceof L.Circle) {
		var center = layer.getLatLng(),
			radius = layer.getRadius();
		return "Center: " + strLatLng(center) + "<br />" +
			"Radius: " + _round(radius, 2) + " m";
		// Rectangle/Polygon - area
	} else if (layer instanceof L.Polygon) {
		var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
			area = L.GeometryUtil.geodesicArea(latlngs);
		return "Area: " + L.GeometryUtil.readableArea(area, true);
		// Polyline - distance
	} else if (layer instanceof L.Polyline) {
		var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
			distance = 0;
		if (latlngs.length < 2) {
			return "Distance: N/A";
		} else {
			for (var i = 0; i < latlngs.length - 1; i++) {
				distance += latlngs[i].distanceTo(latlngs[i + 1]);
			}
			if (_round(distance, 2) > 1000) {
				return "Distance: " + _round(distance, 2) / 1000 + " km"; // kilometers
			} else {
				return "Distance: " + _round(distance, 2) + " m"; // meters
			}
		}
	}
	return null;
};

// Object created - bind popup to layer, add to feature group
map.on(L.Draw.Event.CREATED, function(event) {
	var layer = event.layer;
	var content = getPopupContent(layer);
	if (content !== null) {
		layer.bindPopup(content);
	}

	// Add info to feature properties
	feature = layer.feature = layer.feature || {};
	feature.type = feature.type || "Feature";
	var props = feature.properties = feature.properties || {}; // Intialize feature.properties
	props.info = content;
	drawnItems.addLayer(layer);
	console.log(JSON.stringify(drawnItems.toGeoJSON()));
});

// Object(s) edited - update popups
map.on(L.Draw.Event.EDITED, function(event) {
	var layers = event.layers,
		content = null;
	layers.eachLayer(function(layer) {
		content = getPopupContent(layer);
		if (content !== null) {
			layer.setPopupContent(content);
		}

		// Update info to feature properties
		var layer = layer;
		feature = layer.feature = layer.feature || {};
		var props = feature.properties = feature.properties || {};
		props.info = content;
	});
	console.log(JSON.stringify(drawnItems.toGeoJSON()));
});

// Object(s) deleted - update console log
map.on(L.Draw.Event.DELETED, function(event) {
	console.log(JSON.stringify(drawnItems.toGeoJSON()));
});

//draw:toolbaropened
map.on('draw:toolbaropened', function(event) {
	// console.log('toolbaropened');
});

map.on('draw:toolbarclosed', function(event) {
	// console.log('toolbarclosed');
});

// Export Button
var showExport =
	'<a href="#" onclick="geojsonExport()" title="Export to GeoJSON File" type="button" class="btn btn-danger btn-sm text-light"><i class="fa fa-file-code-o" aria-hidden="true"></i> Export</a>';

var showExportButton = new L.Control({
	position: "topright"
});

showExportButton.onAdd = function(map) {
	this._div = L.DomUtil.create('div');
	this._div.innerHTML = showExport
	return this._div;
};
showExportButton.addTo(map);

// Export to GeoJSON File
function geojsonExport() {
	// let nodata = '{"type":"FeatureCollection","features":[]}';
	let jsonData = (JSON.stringify(drawnItems.toGeoJSON()));
	let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonData);
	let datenow = new Date();
	let datenowstr = datenow.toLocaleDateString('en-GB');
	let exportFileDefaultName = 'export_draw_' + datenowstr + '.geojson';
	let linkElement = document.createElement('a');
	linkElement.setAttribute('href', dataUri);
	linkElement.setAttribute('download', exportFileDefaultName);
	// if (jsonData == nodata) {
	if (jsonData === copied_polygon_json) {
			alert('No changes to vector features');
		} else {
			linkElement.click();
	}
}

function save_userinput_to_server(ev_data){

	let url = ev_data.post_url;

	let formdata = new FormData();
    formdata.append("image_name", ev_data.image_name);
    formdata.append("possibility", ev_data.possibility);
    formdata.append("user_note", ev_data.user_note);

    // form data to a json string
    let json_object={};
    formdata.forEach(function(value,key){
        json_object[key] = value;
    });
    let json_data = JSON.stringify(json_object);

    let headers = new Headers();
    headers.append("Content-Type", "application/json");

    let requestOptions = {
        method: 'POST',
        headers: headers,
        body: json_data,
        redirect: 'follow'
    };

     return fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('SubmitAndNext in infoFormEdit failed', error));
}

document.addEventListener('submitInput', function (e) {
	console.log('index:','submitInput: save_userinput_to_server',e);
	save_userinput_to_server(e.detail);
}, false);

function save_edited_polygons_to_server(ev_data){
	let post_url = ev_data.post_url;

	let jsonData = JSON.stringify(drawnItems.toGeoJSON());
	if (jsonData !== copied_polygon_json) {
		let headers = new Headers();
		headers.append("Content-Type", "application/json");

		let requestOptions = {
			method: 'POST',
			headers: headers,
			body: jsonData,
			redirect: 'follow'
		};

		fetch(post_url, requestOptions)
			.then(response => response.text())
			.then(result => console.log(result))
			.catch(error => console.log('error', error));
	}

}

document.addEventListener('uploadPolygons', function (e) {
	// console.log('index:','addEventListener: netItem',e);
	save_edited_polygons_to_server(e.detail);
}, false);


// change the style of the checkbox, making it easier to see and easier to use
// let hideImage = '<input type="checkbox" name="hideimage" id="hide_image" checked > <label>Image</label>';
let hideImage = '<label class="btn btn-primary btn-sm text-light"><input type="checkbox" name="hideimage" id="hide_image" checked style="vertical-align: middle"> Image</label>'
let hideImageButton = new L.Control({position: "topright"});  // position: "bottomleft"
hideImageButton.onAdd = function(map){
	this._div = L.DomUtil.create('div');
	this._div.innerHTML = hideImage
	return this._div;
}
hideImageButton.addTo(map);
const image_checkbox = $("#hide_image");
image_checkbox.change(function(event) {
	var checkbox = event.target;
	if (checkbox.checked) {
		//Checkbox has been checked
		map.addLayer(added_image);
	} else {
		//Checkbox has been unchecked
		map.removeLayer(added_image);
	}
});