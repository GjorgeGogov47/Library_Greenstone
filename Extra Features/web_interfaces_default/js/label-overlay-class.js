LabelOverlay.prototype = new google.maps.OverlayView();

/** @constructor */
function LabelOverlay(map) {

	// Initialize all properties.
	//this.centre_ = map.center;
	this.map_ = map;

	// Define a property to hold the image's div. We'll
	// actually create this div upon receipt of the onAdd()
	// method so we'll leave it null for now.
	this.div_ = null;

	// Explicitly call setMap on this overlay.
	this.setMap(map);
}

// https://stackoverflow.com/questions/16205734/draw-text-on-google-maps talks about using custom overlays
// Custom Overlays: https://developers.google.com/maps/documentation/javascript/customoverlays
// General: https://developers.google.com/maps/documentation/javascript/drawinglayer
// https://webapps.stackexchange.com/questions/72849/is-it-possible-to-attach-a-label-to-a-line-in-the-google-drawings-app
// https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
// https://developers.google.com/maps/documentation/javascript/examples/marker-labels
// ! https://stackoverflow.com/questions/20138882/text-labels-on-google-maps-v3
// https://medium.com/@barvysta/google-marker-api-lets-play-level-1-dynamic-label-on-marker-f9b94f2e3585	

// Draggable text/label custom overlays
// https://www.gmapgis.com/
// http://jsfiddle.net/doktormolle/QRuW8/
// https://stackoverflow.com/questions/14865550/google-maps-canvas-custom-overlay-zoom																													  
// https://ephesoft.com/docs/2019-1/review-validation/zoom-overlay-for-extracted-content/
LabelOverlay.prototype.onAdd = function () {
	
    console.log("label onAdd called!");
    
 
    var div = document.createElement('div');
    div.style.borderStyle = 'solid';
    div.style.borderWidth = '1px';
    div.style.backgroundColor = 'white';
    div.style.position = 'absolute';
    div.style.padding = '4px';
    div.style.zIndex = 1000;
    div.innerHTML = "PINKY WAS HERE!";

    this.div_ = div;

    // Add the element to the "overlayLayer" pane.
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(div);
 
};

LabelOverlay.prototype.draw = function() {
	console.log("label draw called!");

	// We use the south-west and north-east
	// coordinates of the overlay to peg it to the correct position and size.
	// To do this, we need to retrieve the projection from the overlay.
	var overlayProjection = this.getProjection();

	// Retrieve the south-west and north-east coordinates of this overlay
	// in LatLngs and convert them to pixel coordinates.
	// We'll use these coordinates to resize the div.
	
	var bounds_ =  this.map.getBounds();
	var sw = overlayProjection.fromLatLngToDivPixel(bounds_.getSouthWest());
	var ne = overlayProjection.fromLatLngToDivPixel(bounds_.getNorthEast());

	// Resize the image's div to fit the indicated dimensions.
	var div = this.div_;
	div.style.left = sw.x/2 + 'px';
	div.style.top = ne.y/2 + 'px';
	div.style.width = (ne.x - sw.x)/2 + 'px';
	div.style.height = (sw.y - ne.y)/2 + 'px';
};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
LabelOverlay.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
	
};


// TODO: Might be useful, but we would need to get the bounds for the shape rather than for the map as is done here
/*
// https://aiocollective.com/blog/getbounds-in-google-maps-api-v3/
google.maps.event.addListener(this.map, 'bounds_changed', function() {
	  var bounds =  map.getBounds();
	  var ne = bounds.getNorthEast();
	  var sw = bounds.getSouthWest();
	  
});
*/