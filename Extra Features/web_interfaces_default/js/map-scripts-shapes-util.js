

function ShapesUtil() {
}

ShapesUtil.mvcClonePath = function (path) {
	var clone_path = new google.maps.MVCArray();

	for (var i = 0; i < path.length; i++) {
		var lat_lng = path.getAt(i);
		var lat = lat_lng.lat();
		var lng = lat_lng.lng();
		var clone_lat_lng = new google.maps.LatLng(lat,lng);
		
		clone_path.push(clone_lat_lng);
	}

	return clone_path;
}

ShapesUtil.arrayPathToMVCArrayPath = function (array_path) {
	
	var mvc_array_path = new google.maps.MVCArray();
	
	for (var i=0; i<array_path.length; i++) {
		var array_lat_lng = array_path[i];
		var array_lat = array_lat_lng.lat;
		var array_lng = array_lat_lng.lng;
		var lat_lng = new google.maps.LatLng(array_lat,array_lng);
		
		mvc_array_path.push(lat_lng);
	}
	
	return mvc_array_path;
}

ShapesUtil.mvcArrayPathToArrayPath = function (mvc_array_path) {
	
	var array_path = [];
	
	for (var i=0; i<mvc_array_path.length; i++) {
		var lat_lng = mvc_array_path.getAt(i);
		var lat = lat_lng.lat();
		var lng = lat_lng.lng();
		
		var rec_lat_lng = { lat: lat, lng: lng };		
		array_path.push(rec_lat_lng);
	}
	
	return array_path;
}
	
ShapesUtil._createPoly = function (type,poly,path) {
	var geodesic      = poly.geodesic;
	var strokeColor   = poly.strokeColor;
	var strokeOpacity = poly.strokeOpacity;
	var strokeWeight  = poly.strokeWeight;

	clone_path = ShapesUtil.mvcClonePath(path);	
	
	var clone_poly = null;
	
	if (type == google.maps.drawing.OverlayType.POLYLINE) {
		
		clone_poly = new google.maps.Polyline({
			suppressUndo: true,
			geodesic:      geodesic,
			strokeColor:   strokeColor,
			strokeOpacity: strokeOpacity,
			strokeWeight:  strokeWeight,
			path:          clone_path,
			draggable: true,
			editable: false,
			type: type
		});
	}
	else {
		// Polygon
		var fillColor   = poly.fillColor;
		var fillOpacity = poly.fillOpacity;
	
		clone_poly = new google.maps.Polygon({
			suppressUndo: true,
			geodesic:      geodesic,
			strokeColor:   strokeColor,
			strokeOpacity: strokeOpacity,
			strokeWeight:  strokeWeight,
			fillColor:     fillColor,
			fillOpacity:   fillOpacity,
			path:          clone_path,
			draggable: true,
			editable: false,
			type: type
		});
	}
	
	return clone_poly;
}


ShapesUtil._polyToJSON = function (type,poly) {
	
	var geodesic      = poly.geodesic;
	var strokeColor   = poly.strokeColor;
	var strokeOpacity = poly.strokeOpacity;
	var strokeWeight  = poly.strokeWeight;
	
	var type = poly.type;
	
	var mvc_path = poly.getPath();
	var array_path = ShapesUtil.mvcArrayPathToArrayPath(mvc_path); 
	
	var json_poly = 
	{
		geodesic:      geodesic,
		strokeColor:   strokeColor,
		strokeOpacity: strokeOpacity,
		strokeWeight:  strokeWeight,
		path:          array_path,
		type: type
	};
	
	if (type == google.maps.drawing.OverlayType.POLYGON) {
		var fillColor     = poly.fillColor;
		var fillOpacity   = poly.fillOpacity;
		
		json_poly.fillColor   = fillColor;
		json_poly.fillOpacity = fillOpacity;
	}
	
	return json_poly;
}


ShapesUtil.clonePolyline = function (polyline) {
	
	var path = polyline.getPath();
	var clone_polyline = ShapesUtil._createPoly(google.maps.drawing.OverlayType.POLYLINE,polyline,path);
	return clone_polyline;
}

ShapesUtil.JSONToPolyline = function (json_polyline) {
	
	var json_path = json_polyline.path;
	var mvc_path = ShapesUtil.arrayPathToMVCArrayPath(json_path);
	
	var polyline = ShapesUtil._createPoly(google.maps.drawing.OverlayType.POLYLINE, json_polyline, mvc_path);	
	return polyline;
}

ShapesUtil.PolylineToJSON = function (polyline) {
	
	var json_polyline_str = ShapesUtil._polyToJSON(google.maps.drawing.OverlayType.POLYLINE, polyline);
	return json_polyline_str;
	
}


ShapesUtil.clonePolygon = function (polygon) {
	var mvc_path = polygon.getPath();
	var clone_polygon = ShapesUtil._createPoly(google.maps.drawing.OverlayType.POLYGON,polygon,mvc_path);
	return clone_polygon;
}

ShapesUtil.JSONToPolygon = function (json_polygon) {
	
	var array_path = json_polygon.path;
	var mvc_path = ShapesUtil.arrayPathToMVCArrayPath(array_path);
	
	var polygon = ShapesUtil._createPoly(google.maps.drawing.OverlayType.POLYGON,json_polygon,mvc_path);
	return polygon;
}

ShapesUtil.PolygonToJSON = function (polygon) {
	
	var json_polygon = ShapesUtil._polyToJSON(google.maps.drawing.OverlayType.POLYGON, polygon);
	return json_polygon;
}


ShapesUtil._createRectangle = function (rect,bounds) {
	var strokeColor   = rect.strokeColor;
	var strokeOpacity = rect.strokeOpacity;
	var strokeWeight  = rect.strokeWeight;
	var fillColor     = rect.fillColor;
	var fillOpacity   = rect.fillOpacity;
	var type = rect.type;
	
	var clone_rect = new google.maps.Rectangle({
		suppressUndo: true,
		strokeColor: strokeColor,
		strokeOpacity: strokeOpacity,
		strokeWeight: strokeWeight,
		fillColor: fillColor,
		fillOpacity: fillOpacity,
		bounds: bounds,
		draggable: true,
		editable: false,
		type: type
	});
	return clone_rect;
}

ShapesUtil.cloneRectangle = function (rect) {
	
	var bounds = rect.getBounds();
	var clone_rect = ShapesUtil._createRectangle(rect,bounds);
	return clone_rect;
}

ShapesUtil.JSONToRectangle = function (json_rect) {

	var bounds = json_rect.bounds;
	var north = bounds.north;
	var south = bounds.south;
	var east  = bounds.east;
	var west  = bounds.west;

	var NE = new google.maps.LatLng(north, east);
	var SW = new google.maps.LatLng(south, west);
	bounds = new google.maps.LatLngBounds(SW, NE);
	
	var rect = ShapesUtil._createRectangle(json_rect,bounds);
	return rect;
}

ShapesUtil.RectangleToJSON = function (rect) {

	var strokeColor   = rect.strokeColor;
	var strokeOpacity = rect.strokeOpacity;
	var strokeWeight  = rect.strokeWeight;
	var fillColor     = rect.fillColor;
	var fillOpacity   = rect.fillOpacity;
	var type          = rect.type;
	
	var bounds = rect.getBounds();
	var north_east = bounds.getNorthEast();
	var south_west = bounds.getSouthWest();
	
	var north = north_east.lat();
	var east =  north_east.lng();
	var south = south_west.lat();
	var west =  south_west.lng();
	
	var json_rect =	
	{
		strokeColor:   strokeColor,
		strokeOpacity: strokeOpacity,
		strokeWeight:  strokeWeight,
		fillColor:     fillColor,
		fillOpacity:   fillOpacity,
		bounds:        { north: north, south: south, east: east, west: west },
		type: type
	}
		
	return json_rect;
}



ShapesUtil._createCircle = function (circ) {
	var strokeColor   = circ.strokeColor;
	var strokeOpacity = circ.strokeOpacity;
	var strokeWeight  = circ.strokeWeight;
	var fillColor     = circ.fillColor;
	var fillOpacity   = circ.fillOpacity;
	var center        = circ.center;
	var radius        = circ.radius;
	var type = circ.type;
	
	var clone_circ = new google.maps.Circle({
		suppressUndo: true,
		strokeColor: strokeColor,
		strokeOpacity: strokeOpacity,
		strokeWeight: strokeWeight,
		fillColor: fillColor,
		fillOpacity: fillOpacity,
		center: center,
		radius: radius,
		draggable: true,
		editable: false,
		type: type
	});
	return clone_circ;
}

ShapesUtil.cloneCircle = function (circ) {
	return ShapesUtil._createCircle(circ);
}

ShapesUtil.JSONToCircle = function (json_circ) {
	
	var circ = ShapesUtil._createCircle(json_circ);
	return circ;
}

ShapesUtil.CircleToJSON = function (circ) {
	var strokeColor   = circ.strokeColor;
	var strokeOpacity = circ.strokeOpacity;
	var strokeWeight  = circ.strokeWeight;
	var fillColor     = circ.fillColor;
	var fillOpacity   = circ.fillOpacity;
	var center        = circ.center;
	var radius        = circ.radius;
	var type = circ.type;
	
	
	var json_circ = 
	{
		strokeColor: strokeColor,
		strokeOpacity: strokeOpacity,
		strokeWeight: strokeWeight,
		fillColor: fillColor,
		fillOpacity: fillOpacity,
		center: center,
		radius: radius,
		type: type
	};

	return json_circ;
}

ShapesUtil._createMarker = function (position) {
	
	var clone_marker = new google.maps.Marker({
		suppressUndo: true,
		position: position,
		clickable: true,
		draggable: true,
		editable: true,
		type: google.maps.drawing.OverlayType.MARKER
	})
	return clone_marker;
}

ShapesUtil.cloneMarker = function (marker) {
	
	var position = marker.getPosition();
	var clone_marker = ShapesUtil._createMarker(position);
	return clone_marker;
}


ShapesUtil.JSONToMarker = function (json_marker) {
	
	var json_position = json_marker.position;
	var lat = json_position.lat;
	var lng = json_position.lng;
	var position = new google.maps.LatLng(lat, lng);

	var marker = ShapesUtil._createMarker(position);	
	return marker;
}

ShapesUtil.MarkerToJSON = function (marker) {
	
	var position = marker.getPosition();
	var lat = position.lat();
	var lng = position.lng();
	
	var json_marker = 
	{
		position: { lat: lat, lng: lng },
		type: google.maps.drawing.OverlayType.MARKER
	};

	return json_marker;
}


ShapesUtil.cloneShape = function (shape) {    
	if (shape.type === google.maps.drawing.OverlayType.POLYLINE) {
	    var clone_polyline = ShapesUtil.clonePolyline(shape);
	    clone_polyline.description = shape.description;
		return clone_polyline;
	} else if (shape.type === google.maps.drawing.OverlayType.POLYGON) {
	    var clone_polygon = ShapesUtil.clonePolygon(shape);
	    clone_polygon.description = shape.description;
		return clone_polygon;
	} else if (shape.type === google.maps.drawing.OverlayType.RECTANGLE) {
	    var clone_rect = ShapesUtil.cloneRectangle(shape);
	    clone_rect.description = shape.description;
		return clone_rect;		
	} else if (shape.type === google.maps.drawing.OverlayType.CIRCLE) {
	    var clone_circ = ShapesUtil.cloneCircle(shape);
	    clone_circ.description = shape.description;
		return clone_circ;

	} else {
	    var clone_marker = ShapesUtil.cloneMarker(shape);
	    clone_marker.description = shape.description;
		return clone_marker;
	}
}

ShapesUtil.overlayItemIsShape = function (overlay_item) {
	var type = overlay_item.type;

	is_shape = (type === google.maps.drawing.OverlayType.POLYLINE)
	 || (type === google.maps.drawing.OverlayType.POLYGON)
	 || (type === google.maps.drawing.OverlayType.RECTANGLE)
	 || (type === google.maps.drawing.OverlayType.CIRCLE);

	return is_shape;
}


ShapesUtil.shapeToJSON = function(shape) {
	
	var json_shape = null;
	
	if (shape.type === google.maps.drawing.OverlayType.POLYLINE) {
		json_shape = ShapesUtil.PolylineToJSON(shape);
	} else if (shape.type === google.maps.drawing.OverlayType.POLYGON) {
		json_shape = ShapesUtil.PolygonToJSON(shape);
	} else if (shape.type === google.maps.drawing.OverlayType.RECTANGLE) {
		json_shape = ShapesUtil.RectangleToJSON(shape);
	} else if (shape.type === google.maps.drawing.OverlayType.CIRCLE) {
		json_shape = ShapesUtil.CircleToJSON(shape);
	} else if (shape.type === google.maps.drawing.OverlayType.MARKER){
		json_shape = ShapesUtil.MarkerToJSON(shape);
	}
	else {
		console.error("*** shapeToJSON() Unrecognized shape type: " + shape.type);
	}
	
	json_shape.description = shape.description;
	return json_shape;
}

ShapesUtil.overlayToJSON = function (overlays) {
	
	var json_overlays = [];
	
	for (var i=0; i<overlays.length; i++) {
		
		var shape = overlays[i];
		var json_shape = ShapesUtil.shapeToJSON(shape);

		json_overlays.push(json_shape);
	}
	
	return json_overlays;
	
}

ShapesUtil.JSONToShape = function(json_shape) {
	
	var shape = null;
	
	if (json_shape.type === google.maps.drawing.OverlayType.POLYLINE) {
		shape = ShapesUtil.JSONToPolyline(json_shape);
	} else if (json_shape.type === google.maps.drawing.OverlayType.POLYGON) {
		shape = ShapesUtil.JSONToPolygon(json_shape);
	} else if (json_shape.type === google.maps.drawing.OverlayType.RECTANGLE) {
		shape = ShapesUtil.JSONToRectangle(json_shape);
	} else if (json_shape.type === google.maps.drawing.OverlayType.CIRCLE) {
		shape = ShapesUtil.JSONToCircle(json_shape);
	} else if (json_shape.type === google.maps.drawing.OverlayType.MARKER){
		shape = ShapesUtil.JSONToMarker(json_shape);
	}
	else {
		console.error("*** JSONToShape() Unrecognized shape type: " +json_shape.type);
	}
	
	shape.description = json_shape.description;
	return shape;
}

ShapesUtil.JSONToOverlays = function (json_shapes_str) {
	var json_shapes = JSON.parse(json_shapes_str);
	
	var overlays = [];
	
	for (var i=0; i<json_shapes.length; i++) {
		var json_shape = json_shapes[i];
		var shape = ShapesUtil.JSONToShape(json_shape);

		overlays.push(shape);
	}
	
	return overlays;
	
}


