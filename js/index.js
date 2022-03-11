var map = L.map('map', {
	center: [68.88207, -150.96],
	crs: L.CRS.EPSG3857, //default: L.CRS.EPSG3857
	zoom: 16,
	zoomControl: false,
	worldCopyJump: true
});

var Esri_WorldImagery = L.tileLayer(
	'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
	}).addTo(map);


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

showHillShade(hillshade_name='hillshade_HWline_sub1')
showYolov4(yolov4_name='yolov4_output_epsg3413')

//--------------------------------------------------------------------------------------------------------------------------

function submitAndNext(){
	alert('submitAndNext')
}
//--------------------------------------------------------------------------------------------------------------------------

// https://github.com/kartena/Proj4Leaflet
proj4.defs('EPSG:3413',
"+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs");

function showYolov4(yolov4_name='yolov4_output_epsg3413'){
	fetch('./layers/'+yolov4_name+'.geojson').then(function(response) {
		return response.json()
	}).then(function(data) {
		// update center coordinates
		updateInput(updateID='coordinates', updateText=calCenterCoordinates(data))
		// add geoJson to map
		L.Proj.geoJson(data, {
			style: function() {
				return {
					color: 'green'
				}
			}
		}).addTo(map);;
	});
}

function showHillShade(hillshade_name='hillshade_HWline_sub1'){
	// From EPSG3413 to EPSG3857 for visualization
	fetch('./layers/'+hillshade_name+'_xy.geojson').then(function(response) {
		return response.json()
	}).then(function(data) {
		
		var imageUrl = './layers/'+hillshade_name+'.png';
		// get bounding coordinate
		var topLeft = data.features[0].geometry.coordinates[0][0],
			bottomLeft = data.features[0].geometry.coordinates[0][3],
			upperRight = data.features[0].geometry.coordinates[0][1],
			lowerRight = data.features[0].geometry.coordinates[0][2];
		
		// add image to map
		// https://github.com/IvanSanchez/Leaflet.ImageOverlay.Rotated
		L.imageOverlay.arrugator(
			imageUrl, {
				controlPoints: [topLeft, bottomLeft, upperRight, lowerRight],
				projector: proj4('EPSG:3413', 'EPSG:3857').forward,
				epsilon: 1000000,
				fragmentShader: "void main() { gl_FragColor = texture2D(uRaster, vUV); }",
				padding: 0.1,
			}
		).addTo(map);
		
		// add bouding box to map
		L.Proj.geoJson(data, {
			style: function() {
				return {
					color: 'red'
				}
			}
		}).addTo(map);
	})
	
};

function calCenterCoordinates(geoJson){
	var lng1 = geoJson.features[0].geometry.coordinates[0][0][0][0]
	var lng2 = geoJson.features[0].geometry.coordinates[0][0][1][0]
	var lat1 = geoJson.features[0].geometry.coordinates[0][0][0][1]
	var lat2 = geoJson.features[0].geometry.coordinates[0][0][2][1]
	var center_lng = (lng1 + lng2) / 2
	var center_lat = (lat1 + lat2) / 2
	return [center_lat, center_lng]
}

function updateInput(updateID='coordinates', updateText=''){
	var updateID = document.getElementById(updateID);
	updateID.value = updateText;
}
//--------------------------------------------------------------------------------------------------------------------------

// Zoom Control
var zoomControl = L.control.zoom({
	position: "bottomright"
});
zoomControl.addTo(map);

//--------------------------------------------------------------------------------------------------------------------------

// Leaflet Draw
var drawnItems = new L.FeatureGroup();
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
	let nodata = '{"type":"FeatureCollection","features":[]}';
	let jsonData = (JSON.stringify(drawnItems.toGeoJSON()));
	let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonData);
	let datenow = new Date();
	let datenowstr = datenow.toLocaleDateString('en-GB');
	let exportFileDefaultName = 'export_draw_' + datenowstr + '.geojson';
	let linkElement = document.createElement('a');
	linkElement.setAttribute('href', dataUri);
	linkElement.setAttribute('download', exportFileDefaultName);
	if (jsonData == nodata) {
		alert('No features are drawn');
	} else {
		linkElement.click();
	}
}
