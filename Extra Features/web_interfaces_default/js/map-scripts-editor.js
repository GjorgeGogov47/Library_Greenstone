// Global autocomplete labels list: one list for all the map editors' shape labels in a page
// We use the global labels hashmap to more efficiently ensure uniqueness of labels in our autocomplete list
var global_autocompleteLabelsList = [];
var global_labels_hashmap = {};

function MapEditor(id) {
	// TODO: investigate const, see https://www.w3schools.com/js/js_const.asp and check it will work on older browsers,
	// https://stackoverflow.com/questions/4271566/how-do-i-know-which-version-of-javascript-im-using
	this.MAX_THICKNESS = 5.0; 
	this.MIN_THICKNESS = 0.0;	
	this.MAX_OPACITY = 100.00; 
	this.MIN_OPACITY = 0.00;

	// WORK-IN-PROGRESS FEATURE: label on Map (to be changed to a label associated with each shape later)
	// Also uncomment import of label-overlay-class.js in document.xsl
	//this.labelOverlay = null;
	
	
	this.id = id;
	this.shiftKeyPressed = false;
	this.beingDragged = false;
	this.allowDeselect = true;
	this.colors = ['#1E90FF', '#FF1493', '#4B0082', '#32CD32', '#FF8C00', '#000000'];
	this.selectedColor;
	this.colorButtons = {};
	this.thicknessValue = 1;
	this.opacityValue = 40;
	this.overlays = [];
	this.selectedShapes = [];
	this.listenersArray = [];
	this.mapsArray = [];
	this.drawingManager;
	this.selectedShape;
	this.savedOverlays = null;
	this.map = null;
	this.counter = 0;
	this.branchNum = 1;
	this.mouseState = "up";
	this.thicknessRangeListener = this.thicknessValue; // ????
	this.resizable = false;
	this.dontResize = false;

	this.shapeOptions = {
		suppressUndo: true,
		fillColor: '#CA4A2F',
		strokeWeight: this.thicknessValue,
		fillOpacity: this.opacityValue / 100,
		editable: true,
		geodesic: false,
		draggable: true,
		description: ""
	};
	this.mapEditorHistory = new MapEditorHistory(this);
}

//draggable checkbox control
MapEditor.prototype.initMapEditorControls = function () {
	var that = this;

	var draggableCB = document.getElementById("draggableCB-"+ this.id);
	draggableCB.addEventListener('change', function () {
		if (this.checked) {
			for (var i = 0; i < that.overlays.length; i++) {
				that.overlays[i].draggable = false;
				that.shapeOptions.draggable = false;
			}
		} else {
			for (var i = 0; i < that.overlays.length; i++) {
				that.overlays[i].draggable = true;
				that.shapeOptions.draggable = true;
			}
		}
	});
	
	
	//Update thickness
	var thicknessSliderOutput = document.getElementById("thicknessRangeVal" + "-" + this.id);
	var thicknessSlider = document.getElementById("thicknessRange" + "-" + this.id);
	var thicknessValue = ((thicknessSlider.value / 20) * 100) / 100;
	thicknessSliderOutput.value = thicknessValue.toFixed(2);

	thicknessSlider.oninput = function () {
		that.shapeSpecsChangeMD();
		var thicknessVal = ((this.value / 20) * 100) / 100;
		thicknessSliderOutput.value = thicknessVal.toFixed(2);
		that.thicknessValue = this.value / 20;
		that.shapeOptions.strokeWeight = that.thicknessValue;
		that.setSelectedThickness(that.thicknessValue);
	}
		
	thicknessSliderOutput.oninput = function () {
	    that.shapeSpecsChangeMD(); // TODO: DO WE NEED THIS LINE? (LINE COPIED & PASTED FROM ABOVE)
		if(this.value > that.MAX_THICKNESS) this.value = that.MAX_THICKNESS;
		if(this.value < that.MIN_THICKNESS) this.value = that.MIN_THICKNESS;
		var thicknessVal = this.value * 20;
		thicknessSlider.value = thicknessVal.toFixed(2);
		that.thicknessValue = this.value;
		that.shapeOptions.strokeWeight = that.thicknessValue;
		that.setSelectedThickness(that.thicknessValue);
	}
	//Update opacity
	// TODO: https://stackoverflow.com/questions/469357/html-text-input-allow-only-numeric-input?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
	var opacitySlider = document.getElementById("colourOpacity" + "-" + this.id);
	var opacitySliderOutput = document.getElementById("opacityRangeVal" + "-" + this.id);
	
	opacitySlider.oninput = function () {
		that.shapeSpecsChangeMD();
		opacitySliderOutput.value = this.value;
		that.opacityValue = this.value / 100;
		that.shapeOptions.fillOpacity = that.opacityValue;
		that.setSelectedOpacity(that.opacityValue);
	}
	opacitySliderOutput.oninput = function () {
		that.shapeSpecsChangeOnInput();
		if(this.value > that.MAX_OPACITY) this.value = that.MAX_OPACITY;
		if(this.value < that.MIN_OPACITY) this.value = that.MIN_OPACITY;
		opacitySlider.value = this.value;
		that.opacityValue = this.value / 100;
		that.shapeOptions.fillOpacity = that.opacityValue;
		that.setSelectedOpacity(that.opacityValue);
	}
	
	var descriptionInput = document.getElementById("description" + "-" + this.id);
    // don't use oninput, use onchange, because with autocomplete a newly entered or pasted value
	// doesn't always get stored properly when using oninput.
	descriptionInput.onchange = function () {	    
	    that.shapeSpecsChangeOnInput(); // takes care of history (undo/redo)		
		var description = this.value;
	    that.shapeOptions.description = description;        
	    that.setSelectedDescription(that.shapeOptions.description);        
	}

    // Also add a COMPLETED description (i.e. when description input box loses focus)
	// to the autocomplete list of descriptions/labels
	descriptionInput.onblur = function () {
	    var description = this.value;
	    that.addToAutocompleteLabelsList(description);
	}
	
    // TODO: Do we need these listeners, when we already have onInput methods above? Test.
	document.getElementById("color-palette1" + "-" + this.id).addEventListener("mousedown", function() { that.shapeSpecsChangeMD() });
	document.getElementById("thicknessRange" + "-" + this.id).addEventListener("mouseup", function () { that.shapeSpecsChangeMU() });
	document.getElementById("colourOpacity" + "-" + this.id).addEventListener("mouseup", function () { that.shapeSpecsChangeMU() });
	//document.getElementById("description" + "-" + this.id).addEventListener("keypress", function () { that.shapeSpecsChangeOnInput() });

	document.onmousedown = function (ev) {
		that.mouseState = "down";
		//    console.log('Down State you can now start dragging');
		//do not write any code here in this function
	}

	document.onmouseup = function (ev) {
		that.mouseState = "up";
		//    console.log('up state you cannot drag now because you are not holding your mouse')
		//do not write any code here in this function
	}
	
	
	//prompts the user to save the changes before reloading/leaving the page
	window.onbeforeunload = function (e) {
		var currentOverlays = JSON.stringify(ShapesUtil.overlayToJSON(that.overlays));
		var enableMessage = currentOverlays !== that.savedOverlays;
		var message = "Changes are not saved. Are you sure you want to leave?";

		
		// Comment out following section in entirety -- from "e = e || window.event" to end of "if(e)" -- if
		// you don't want to see the popup about changes that haven't been saved yet
		e = e || window.event;
		// For IE and Firefox
		if (e) {
			
			if(enableMessage){
				if(currentOverlays !== "[]") {
					alert(message);
					e.returnValue = message;
					
					// For Safari
					return message;	
				}
			}
		}
	}
}

// Ensure only unique labels are added to our autocomplete list
MapEditor.prototype.addToAutocompleteLabelsList = function (newLabel) {

    // We use a hashmap to more efficiently ensure uniqueness of labels in our array
    // https://stackoverflow.com/questions/11040472/how-to-check-if-object-property-exists-with-a-variable-holding-the-property-name
    if (newLabel !== "" && !global_labels_hashmap.hasOwnProperty(newLabel)) { // label is not empty and unique, so
        // add to hashmap now
        global_labels_hashmap[newLabel] = 1;
        // add to autocomplete list and sort alphabetically
        global_autocompleteLabelsList.push(newLabel);
        global_autocompleteLabelsList.sort();
    }
}

MapEditor.prototype.settingThePath = function () {
	var that = this;
	this.listenersArray = []
	this.counter = 0;
	this.branchNum = 1;
	
	for (var i = 0; i < this.selectedShapes.length * 2; i++) {
		for (var j = 1; j < 6; j++) {
			var path = "//*[@id='map-" + this.id + "']/div/div/div[1]/div[3]/div/div[3]/div[" + this.branchNum + "]/div[" + j + "]/div";
			this.listenersArray[this.counter] = this.getElementByXpath(path);
			if (this.listenersArray[this.counter] !== (undefined || null)) {
				this.listenersArray[this.counter].addEventListener("mousemove", function () {
					that.resizable = true;
					that.shapeResize();
				});
				this.listenersArray[this.counter].addEventListener("mouseout", function () {
					if (this.mouseDown) {
						that.resizable = true;
						that.shapeResize();
						
					}
				});
			}
			this.counter++;
		}
		this.branchNum++;
	}
}

MapEditor.prototype.shapeResize = function () {
	if (this.mouseState == "down") {
		if (this.selectedShapes.length > 0) {
			if (this.resizable) {
				if (this.dontResize == false) {
					this.mapEditorHistory.historyOverlayPush();
				}

			}
		}
	}
}

MapEditor.prototype.shapeSpecsChangeMD = function () {
	if (this.selectedShapes.length > 0) {
		this.mapEditorHistory.historyOverlayPush();
	}
}

MapEditor.prototype.shapeSpecsChangeMU = function () {
	if (this.selectedShapes.length > 0) {
		this.mapEditorHistory.presentOverlayPush();
	}
}

MapEditor.prototype.shapeSpecsChangeOnInput = function () {
    if (this.selectedShapes.length > 0) {
        this.mapEditorHistory.presentOverlayPush();
    }
}

MapEditor.prototype.makeColorButton = function (color) {
	var that = this;

	var button = document.createElement('span');
	button.className = 'color-buttons1';
	button.style.backgroundColor = color;
	google.maps.event.addDomListener(button, 'click', function () {
		that.selectColor(color);
		that.setSelectedShapeColor(color);
		that.shapeSpecsChangeMU();
	});
	return button;
}

MapEditor.prototype.buildColorPalette = function () {
	var colorPalette = document.getElementById("color-palette1" + "-" + this.id);
	for (var i = 0; i < this.colors.length; ++i) {
		var currColor = this.colors[i];
		var colorButton = this.makeColorButton(currColor);
		colorPalette.appendChild(colorButton);
		this.colorButtons[currColor] = colorButton;
	}
	this.selectColor(this.colors[0]);
};

MapEditor.prototype.selectColor = function (color) {
	this.selectedColor = color;
	for (var i = 0; i < this.colors.length; ++i) {
		var currColor = this.colors[i];
		this.colorButtons[currColor].style.border = currColor == color ? '2px solid #789' : '2px solid #fff';
	}

	// Retrieves the current options from the drawing manager and replaces the
	// stroke or fill color as appropriate.
	var polylineOptions = this.drawingManager.get('polylineOptions');
	polylineOptions.strokeColor = color;
	this.drawingManager.set('polylineOptions', polylineOptions);

	var rectangleOptions = this.drawingManager.get('rectangleOptions');
	rectangleOptions.fillColor = color;
	this.drawingManager.set('rectangleOptions', rectangleOptions);

	var circleOptions = this.drawingManager.get('circleOptions');
	circleOptions.fillColor = color;
	this.drawingManager.set('circleOptions', circleOptions);

	var polygonOptions = this.drawingManager.get('polygonOptions');
	polygonOptions.fillColor = color;
	this.drawingManager.set('polygonOptions', polygonOptions);
}

MapEditor.prototype.initMapEditor = function () {
	var that = this;

	this.map = new google.maps.Map(document.getElementById("map-" + this.id), {
			center: {
				lat: -37.7891,
				lng: 175.3180
			},
			zoom: 14,
			mapId: this.id,
		});
	
	// WORK-IN-PROGRESS FEATURE: label on Map (to be changed to a label associated with each shape later)
	// let's associate a label with the map (for now, later associate labels for each shape)
	//this.labelOverlay = new LabelOverlay(this.map);		
		
	this.mapsArray.push(this.map);
	// Add a style-selector control to the map.
	var styleControl = document.getElementById('style-selector-control' + "-" + this.id);
	this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(styleControl);

	/* 
	// Set the map's style to the initial value of the selector.
	var styleSelector = document.getElementById('style-selector' + "-" + this.id);
	//console.log(styleSelector);
	//map = google.maps.Map(document.getElementById('map' +"-"+ this.id));
	this.map.setOptions({
		styles: styles[styleSelector.value]

	});

	// Apply new JSON when the user selects a different style.
	styleSelector.addEventListener('change', function () {
		that.map.setOptions({
			styles: styles[styleSelector.value]
		});
	});
	*/

	this.drawingManager = new google.maps.drawing.DrawingManager({
			//drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
			drawingControl: true,
			drawingControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER,
				drawingModes: ['marker', 'circle', 'polygon', 'polyline', 'rectangle']
			},
			markerOptions: {
				draggable: true
			},
			circleOptions: this.shapeOptions,
			polylineOptions: this.shapeOptions,
			polygonOptions: this.shapeOptions,
			rectangleOptions: this.shapeOptions,
		});

	this.drawingManager.setMap(this.map);

	google.maps.event.addListener(this.drawingManager, "drawingmode_changed", function () {
		if (that.shiftKeyPressed != true && that.drawingManager.drawingMode !== null) {
			that.deselectAll();
		}
		that.settingThePath();

	})

	// store reference to added overlay
	google.maps.event.addListener(this.drawingManager, 'overlaycomplete', function (e) {
		that.allowDeselect = true;
		that.mapEditorHistory.historyOverlayPush();
		that.overlays.push(e.overlay); // store reference to added overlay
		var newShape = e.overlay;
		newShape.type = e.type;		
		that.mapEditorHistory.presentOverlayPush();
		
		if (e.type !== google.maps.drawing.OverlayType.MARKER) {
			that.addShapeListeners(newShape, e);
			that.setSelection(newShape, e);
		} else {
			that.addMarkerListeners(newShape, e);
			that.setSelection(newShape, e);
		}	
	});

	//Clears selection if clicked on the map when shift is not presseed
	google.maps.event.addListener(this.map, 'click', function (e) {
		var c = document.body.childNodes;
		if (e.target && e.target.matches("a.classA")) {
			console.log("Anchor element clicked!");
		}
		if (that.shiftKeyPressed == false) {
			that.clearSelection();
			that.selectedShape = null;
		}
	});

	google.maps.event.addListener(this.map, 'mousedown', function (e) {
		that.dontResize = true;
	});

	google.maps.event.addListener(this.map, 'mouseup', function (e) {
		that.dontResize = false;
	});

	//Keyboard shortcuts			
	var mapAndControls = document.getElementById("map-and-controls-" + this.id);
	var thicknessField = document.getElementById ("thicknessRangeVal-" + this.id);
	var opacityField = document.getElementById ("opacityRangeVal-" + this.id);
	var openMapFunction = function() {
		//Sets shift as unpressed
		mapAndControls.addEventListener('keyup', function (event) { 	
			if (event.keyCode == '16') {
				that.shiftKeyPressed = false;
			}
		});
		
		mapAndControls.addEventListener('keydown', function (event) { 

			// https://stackoverflow.com/questions/2220196/how-to-decode-character-pressed-from-jquerys-keydowns-event-handler	
			var keyCode = String.fromCharCode(event.which);
			//console.log("Key pressed: " + keyCode);
	
			//disable keyboard shortcut within the number input field
			var activeElement = $(document.activeElement);
			if(activeElement.attr('type') == 'number' || activeElement.attr('type') == 'text'){
				//console.log('number detected')
				return;
			}
			//Sets shift as pressed
			if (event.keyCode == '16') {
				that.shiftKeyPressed = true;
			}
			else if (keyCode == 'Y' && (event.ctrlKey || event.metaKey)) {
				that.mapEditorHistory.redo();
			}
			else if (keyCode == 'Z' && (event.ctrlKey || event.metaKey) ) {
				if (that.shiftKeyPressed == false) {
				that.mapEditorHistory.undo();
				}	
			}
			else if (keyCode == 'A' && (event.ctrlKey || event.metaKey)) {
				event.preventDefault();
				that.drawingManager.setDrawingMode(null);
				that.selectAll();		
			}
			else if (keyCode == 'D' && (event.ctrlKey || event.metaKey)) {
				event.preventDefault();
				that.deselectAll();
			}
			
			else if (keyCode == '0' || keyCode == 'À' || (keyCode == 'G'&& (event.ctrlKey || event.metaKey))) {
				event.preventDefault();	
				that.drawingManager.setDrawingMode(null);
			} else if (keyCode == '1') {
				that.drawingManager.setDrawingMode('marker');
			} else if (keyCode == '2') {
				that.drawingManager.setDrawingMode('circle');
			} else if (keyCode == '3') {
				that.drawingManager.setDrawingMode('polygon');
			} else if (keyCode == '4') {
				that.drawingManager.setDrawingMode('polyline');
			} else if (keyCode == '5') {
				that.drawingManager.setDrawingMode('rectangle');
			} 
			
			//else if (keyCode == 'S') {
			//	that.saveToArchives();	
			//} 
			else if (keyCode == 'Q') { // for debugging information, press Q (easy to hit key)
				that.printHistory();
			}
			else if (keyCode == '.') {
				that.deleteSelectedShapes();
			}
	//									console.log(keyCode);
		});
	};
	
	openMapFunction();

	this.buildColorPalette();
	
	
	var collection = gs.cgiParams.c;
	var site_name = gs.xsltParams.site_name;
	var nodeID = this.id; // documentID, hopefully contains section ID too
	var metaname = gps_metadata_name;
		
	// collection, site, documentID, metadataName, metadataPosition, responseFunction
	gs.functions.getArchivesMetadata(collection, site_name, nodeID, metaname, 0, function(responseText){
			// responseText is of type GSMetadata
			
			// called when data has been retrieved from archives
			var JSONString = responseText.getValue();
			if(JSONString !== "")
			{
				that.LOAD(JSONString, nodeID);
				that.savedOverlays = JSONString;
			}
		}
	); // responseFunctions are now in the setMeta calls
}

//Deletes a vertex if clicked on it
MapEditor.prototype.vertexAndPolyDel = function (e, newShape) {
	var vertex = e.vertex;
	if (e.vertex !== undefined) {
		if (newShape.type === google.maps.drawing.OverlayType.POLYGON) {
			var path = newShape.getPaths().getAt(e.path);
			path.removeAt(e.vertex);
			if (path.length < 3) {
				newShape.setMap(null);
			}
		}
		if (newShape.type === google.maps.drawing.OverlayType.POLYLINE) {
			var path = newShape.getPath();
			path.removeAt(e.vertex);
			if (path.length < 2) {
				newShape.setMap(null);
			}
		}
	}
}

MapEditor.prototype.addMarkerListeners = function (newShape, e) {
	var that = this;
	//Click event if a marker is created
	google.maps.event.addListener(newShape, 'click', function (e) {
		if(that.shiftKeyPressed){
			
		} else {
			that.mapEditorHistory.historyOverlayPush();
			newShape.setMap(null);
			that.mapEditorHistory.presentOverlayPush();			
		}

	});

	google.maps.event.addListener(newShape, 'dragstart', function (e) {
		that.beingDragged = true;
		that.mapEditorHistory.historyOverlayPush();

	});

	google.maps.event.addListener(newShape, 'dragend', function () {
		that.beingDragged = false;
		that.mapEditorHistory.presentOverlayPush();
		that.allowDeselect = false;
	});
}

MapEditor.prototype.addShapeListeners = function (newShape, e) {
    var that = this;
	// Add an event listener that selects the newly-drawn shape when the user
	// mouses down on it.
	google.maps.event.addListener(newShape, 'click', function (e) {
		that.vertexAndPolyDel(e, newShape);
	});

	google.maps.event.addListener(newShape, 'dragstart', function (e) {
		that.allowDeselect = false;
		that.mapEditorHistory.historyOverlayPush();
	});

	google.maps.event.addListener(newShape, 'dragend', function () {
		that.beingDragged = false;
		that.mapEditorHistory.presentOverlayPush();
		that.settingThePath();

		that.allowDeselect = false;
		that.setSelection(newShape, e);
	});

	//Store information after the event ends
	google.maps.event.addListener(newShape, 'bounds_changed', function (e) {
		if (that.beingDragged == false) {
			that.mapEditorHistory.presentOverlayPush();
		}
	});

	//Add an event listener to select a shape if the mouse hovers over it
	google.maps.event.addListener(newShape, 'mousedown', function (e) {
		if (e.target && e.target.matches("a.classA")) {
			console.log("Anchor element clicked!");
		}
		if (e.vertex !== undefined || e.edge !== undefined) {
			that.mapEditorHistory.historyOverlayPush()
		}
		if (that.drawingManager.drawingMode == null) {
			that.setSelection(newShape, e);
		}
	});

	google.maps.event.addListener(newShape, 'mouseup', function (e) {
		if (e.vertex !== undefined || e.edge !== undefined) {
			that.mapEditorHistory.presentOverlayPush()
		} else {
			//that.setSelection(newShape, e);
		}

	});
}
MapEditor.prototype.clearSelection = function () {
	if (this.selectedShape) {
		if (this.shiftKeyPressed == false) {
			for (var i = 0; i < this.selectedShapes.length; i++) {
				if(this.selectedShapes[i].type !== 'marker') {
					this.selectedShapes[i].setEditable(false);						
				}
			}
			this.selectedShapes = [];
		}
		this.selectedShape = null;
	}
}

//Set selection for the selected overlay
MapEditor.prototype.setSelection = function (shape, e) {
	//var that = this;
	if (shape.type !== 'marker') {
		if (this.shiftKeyPressed == false) {
			if (e !== null) {
				if (e.vertex == undefined) {
					if (e.edge == undefined) {
						this.clearSelection();
						shape.setEditable(true);
					}
				}
			}
		}
		if (this.selectedShapes.includes(shape)) {
			if (e !== null) {
				if (e.vertex == undefined) {
					if (e.edge == undefined) {
						this.allowDeselect = true;
						this.removeFromSelectedShapes(shape);
					}
				}
			}
		} else {
			this.allowDeselect = false;
			shape.setEditable(true);
			this.selectedShapes.push(shape);
		}

		//Send the values to be updated
		var thi = shape.strokeWeight;
		var opa = shape.fillOpacity;		
		var fCol = shape.fillColor;
		var sCol = shape.strokeColor;
		var description = shape.description;
		this.updateMenuValues(thi, opa, fCol, sCol, description);

	} else if (shape.type == 'marker') {
		this.allowDeselect = false;
		this.selectedShapes.push(shape);
	}
	this.selectedShape = shape;
	this.settingThePath();
}

MapEditor.prototype.removeFromSelectedShapes = function (shape) {
	if (this.selectedShapes.includes(shape)) {
		if (this.allowDeselect) {
			const index = this.selectedShapes.indexOf(shape);
			this.selectedShapes.splice(index, 1);
			shape.setEditable(false);
		}
		this.allowDeselect = true;
	}
}

//Set selected label
MapEditor.prototype.setSelectedDescription = function (label) {
    if (this.selectedShapes.length > 0) {
        for (var i = 0; i < this.selectedShapes.length; i++) {
            this.selectedShapes[i].set('description', label); //SAME: this.selectedShapes[i].description = label;            
        }
    }
}

//Set selected thickness
MapEditor.prototype.setSelectedThickness = function (sWeight) {
	if (this.selectedShapes.length > 0) {
		for (var i = 0; i < this.selectedShapes.length; i++) {
			this.selectedShapes[i].set('strokeWeight', sWeight);
		}
	}
}

//Set selected opacity
MapEditor.prototype.setSelectedOpacity = function (fOpacity) {

	if (this.selectedShapes.length > 0) {
		for (var i = 0; i < this.selectedShapes.length; i++) {
			this.selectedShapes[i].set('fillOpacity', fOpacity);
		}
	}
}

//set selected fill colour
MapEditor.prototype.setSelectedShapeColor = function (color) {
	if (this.selectedShapes.length > 0) {
		for (var i = 0; i < this.selectedShapes.length; i++) {
			this.selectedShapes[i].set('fillColor', color);
			this.selectedShapes[i].set('strokeColor', color);
		}
	}
}

MapEditor.prototype.getElementByXpath = function (path) {
	return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

MapEditor.prototype.updateMenuValues = function (thi, opa, fCol, sCol, description) {	
	//Update thickness slider and value on the settings menu
	var thicknessSliderOutput = document.getElementById("thicknessRangeVal" + "-" + this.id);
	// update the thickness innerHTML's value to always have 2 decimal places, https://www.w3schools.com/js/js_number_methods.asp	
	thi = parseFloat(thi); //Ensure the thi is a number
	thicknessSliderOutput.value = thi.toFixed(2); 
	document.getElementById("thicknessRange" + "-" + this.id).value = Math.round((thi * 20) * 100) / 100;

	//Update the opacity slider and value on the settings menu
	var opacitySliderOutput = document.getElementById("opacityRangeVal" + "-" + this.id);
	opacitySliderOutput.value = opa * 100;
	document.getElementById("colourOpacity" + "-" + this.id).value = opa * 100;

    // Show the description in the description field
	var descriptionInput = document.getElementById("description" + "-" + this.id);
	descriptionInput.value = description;

	if (this.drawingManager.drawingMode == null) {
		this.selectColor(fCol);
	}
}
MapEditor.prototype.selectAll = function () {
	this.shiftKeyPressed = true;
	var e = new Object();
	e.vertex = undefined;
	this.selectedShapes = [];
	for (var i = 0; i < this.overlays.length; i++) {
		this.setSelection(this.overlays[i], e);
	}
	this.shiftKeyPressed = false;
}
MapEditor.prototype.deselectAll = function () {
	for (var i = 0; i < this.selectedShapes.length; i++) {
		if (this.selectedShapes[i].type !== google.maps.drawing.OverlayType.MARKER) {
			this.selectedShapes[i].setEditable(false);
		}
		
	}
	this.selectedShapes = [];
}

// event handler for s being pressed *when map editor has the focus*
// For saving and rebuilding, see map_scripts
MapEditor.prototype.saveToArchives = function () {
	var that = this;
	console.log("Save pressed");
	
	var json_overlays = JSON.stringify(ShapesUtil.overlayToJSON(this.overlays));	
	that.savedOverlays = json_overlays; // save the old version to compare with future changes
	var collection = gs.cgiParams.c;
	var site_name = gs.xsltParams.site_name;
	var nodeID = this.id; // documentID, hopefully contains section ID too
	var metaname = "GPS.mapOverlay";
	
	// collection, site, documentID, metadataName, metadataPosition, metadataValue, prevMetadataValue, metamode, responseFunction	
	gs.functions.setArchivesMetadata(collection, site_name, nodeID, metaname, 0, json_overlays, null, "override", function(){
			console.log("SAVED");
		}
	);	
}

// TODO: When finished testing, can remove this debug function that just prints to console
MapEditor.prototype.printHistory = function () {
	console.log("prev", this.mapEditorHistory.prevOverlays);
	console.log("present ", this.mapEditorHistory.presentOverlays);
	console.log("undone ", this.mapEditorHistory.undoneOverlays);
	console.log("@@@@ allShapes: ", this.overlays);
	console.log("@@@@ selectedShapes: ", this.selectedShapes);
}

// to be called after reading back in stored JSON from archives meta
MapEditor.prototype.LOAD = function (json_str, nodeID) {
	this.mapEditorHistory.historyOverlayPush();

	// This seems to convert the map_store object into an array and forces array index access, instead of convenient property access using nodeID	
	//Object.values(gsmap_store)[0]; // Always gets top level section's map-editor, not what we want.
	
	// Get the map editor for the nodeID, as we're asked to load that editor
    var map_editor = gsmap_store["map-"+nodeID];
	
	var new_overlays = ShapesUtil.JSONToOverlays(json_str);
	for (var i=0; i<map_editor.overlays.length; i++) {
		map_editor.overlays[i].setMap(null);
	}
	
	map_editor.overlays = new_overlays;

	for (var i=0; i<map_editor.overlays.length; i++) {
	    var shape = map_editor.overlays[i];

	    // set up the autocomplete list using saved labels/descriptions
	    map_editor.addToAutocompleteLabelsList(shape.description); // now efficiently ensures uniqueness of values using (hash)map
        
		// make the shapes selectable on load:
		if (ShapesUtil.overlayItemIsShape(shape)) {
			map_editor.addShapeListeners(shape, null); // don't have an overlay event!
		} else {
			map_editor.addMarkerListeners(shape, null); // don't have an overlay event!
		}
		shape.setMap(map_editor.map);
	}

	this.mapEditorHistory.presentOverlayPush();
}

MapEditor.prototype.deleteSelectedShapes = function () {
	if(this.selectedShapes.length !== 0) {
		this.mapEditorHistory.historyOverlayPush();
		for (var i = 0; i < this.selectedShapes.length; i++) {
			this.selectedShapes[i].setMap(null);

			if (this.overlays.includes(this.selectedShapes[i])) {
				const index = this.overlays.indexOf(this.selectedShapes[i]);
				this.overlays.splice(index, 1);
//				this.selectedShapes[i].setEditable(false);
			}
		}
		this.selectedShapes = [];
		this.mapEditorHistory.presentOverlayPush();		
	}
}

MapEditor.prototype.draggableState = function () {
	
	var draggableCB = document.querySelector("input[name=draggableCB]");
	draggableCB.addEventListener('change', function () {
		if (this.checked) {
			this.overlays.draggable = false;
		} else {
			this.overlays.draggable = false;
		}
	});
}

MapEditor.prototype.deleteAllShapes = function () {
	if(this.overlays.length !== 0) {
		//console.log("deleteAllShape() this.id = " + this.id);
		this.mapEditorHistory.historyOverlayPush();
		for (var i = 0; i < this.overlays.length; i++) {
			this.overlays[i].setMap(null);
		}
		this.overlays = [];
		this.mapEditorHistory.presentOverlayPush();
	}
}

// Global function that uses jquery to set the autocomplete list's data source to whatever's in our global autocomplete labels array
$(function setupAutocompleteLabelsList() {
    // Overrides the default autocomplete filter function to
    // search only from the beginning of the string
    //resource: https://miroslavpopovic.com/posts/2012/06/jqueryui-autocomplete-filter-words-starting-with-term
    $.ui.autocomplete.filter = function (array, term) {
        var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(term), "i");
        return $.grep(array, function (value) {
            return matcher.test(value.label || value.value || value);
        });
    };

    $(".description").autocomplete({
        source: global_autocompleteLabelsList
    });
});
