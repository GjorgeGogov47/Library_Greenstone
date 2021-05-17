
function MapEditorHistory(mapEditor) {
	this.prevOverlays = [];
	this.presentOverlays = [];
	this.undoneOverlays = [];
	this.cycleCompvare = true;
	this.mapEditor = mapEditor;
}

MapEditorHistory.prototype.undo = function () {
	
	
	if (this.prevOverlays.length != 0) {
		for (var i = 0; i < this.mapEditor.overlays.length; i++) {
			this.mapEditor.overlays[i].setMap(null);
		}
		
		this.mapEditor.selectedShapes = [];
		this.mapEditor.overlays = [];
		this.undoneOverlaysPush();
		var prev_overlay = this.prevOverlays.pop();
		var draggableCB = document.getElementById("draggableCB" + "-" + this.mapEditor.id).checked = false;

		if (prev_overlay.length > 0) {
			for (var i = 0; i < prev_overlay.length; i++) {
				this.mapEditor.overlays[i] = prev_overlay[i];
				this.mapEditor.overlays[i].setMap(this.mapEditor.map);
				this.mapEditor.overlays[i].draggable = true;
			}
		}
	}
};

MapEditorHistory.prototype.redo = function () {

	if (this.undoneOverlays.length != 0) {
		if (this.undoneOverlays[this.undoneOverlays.length -1].length != 0) {
			this.mapEditor.selectedShapes = [];
			var draggableCB = document.getElementById("draggableCB" + "-" + this.mapEditor.id).checked = false;
			
			for (var i = 0; i < this.mapEditor.overlays.length; i++) {
				this.mapEditor.overlays[i].setMap(null);
			}

			this.mapEditor.overlays = [];
			var lastEntry = this.undoneOverlays[this.undoneOverlays.length - 1];
			for (var i = 0; i < lastEntry.length; i++) {
				this.mapEditor.overlays[i] = lastEntry[i];
				this.mapEditor.overlays[i].setMap(this.mapEditor.map);
				this.mapEditor.overlays[i].draggable = true;
			}

			var conditionPrevious = this.presentOverlays[0];
			if (conditionPrevious !== undefined) {
				if (conditionPrevious.length == 0) {
					this.prevOverlays.push(this.presentOverlays[0]);
				} else {
					var overlays_copy = [];
					for (var i = 0; i < this.presentOverlays[0].length; i++) {
						var clone_shape = ShapesUtil.cloneShape(this.presentOverlays[0][i]);
						if (ShapesUtil.overlayItemIsShape(clone_shape)) {
							this.mapEditor.addShapeListeners(clone_shape, null);
						} else {
							this.mapEditor.addMarkerListeners(clone_shape, null);
						}
						overlays_copy[i] = clone_shape;
					}
					this.prevOverlays.push(overlays_copy);
				}
			}
			this.presentOverlays = [];
			this.presentOverlays.push(this.undoneOverlays[this.undoneOverlays.length - 1]);
			this.undoneOverlays.pop();
		}
	}
}

MapEditorHistory.prototype.historyOverlayPush = function () {
	
	
	if (this.cycleCompvare) {
		
		var overlays_copy = [];
		for (var i = 0; i < this.mapEditor.overlays.length; i++) {
			var clone_shape = ShapesUtil.cloneShape(this.mapEditor.overlays[i]);
			if (ShapesUtil.overlayItemIsShape(clone_shape)) {
				this.mapEditor.addShapeListeners(clone_shape, null); // don't have an overlay event!
			} else {
				this.mapEditor.addMarkerListeners(clone_shape, null); // don't have an overlay event!
			}
			overlays_copy[i] = clone_shape;
		}
		this.undoneOverlays = [];
		this.prevOverlays.push(overlays_copy);
	}

	this.cycleCompvare = false;
}

MapEditorHistory.prototype.presentOverlayPush = function () {
//	console.log("presentOverlayPush");
	
	this.presentOverlays = [];
	var overlays_copy = [];
	for (var i = 0; i < this.mapEditor.overlays.length; i++) {
		var clone_shape = ShapesUtil.cloneShape(this.mapEditor.overlays[i]);
		if (ShapesUtil.overlayItemIsShape(clone_shape)) {
			this.mapEditor.addShapeListeners(clone_shape, null); // don't have an overlay event!
		} else {
			this.mapEditor.addMarkerListeners(clone_shape, null); // don't have an overlay event!
		}
		overlays_copy[i] = clone_shape;
	}
	this.presentOverlays.push(overlays_copy);
	this.cycleCompvare = true;

	
}

MapEditorHistory.prototype.undoneOverlaysPush = function () {
	
	var conditionUndone = this.presentOverlays[this.presentOverlays.length - 1] !== undefined;

	if (conditionUndone) {
		var overlays_copy = [];
		for (var i = 0; i < this.presentOverlays[0].length; i++) {
			var clone_shape = ShapesUtil.cloneShape(this.presentOverlays[0][i]);
			if (ShapesUtil.overlayItemIsShape(clone_shape)) {
				this.mapEditor.addShapeListeners(clone_shape, null); // don't have an overlay event!
			} else {
				this.mapEditor.addMarkerListeners(clone_shape, null); // don't have an overlay event!
			}
			overlays_copy[i] = clone_shape;
		}
		this.undoneOverlays.push(overlays_copy);
	}

	var conditionPresent = this.prevOverlays[this.prevOverlays.length - 1] !== undefined;

	if (conditionPresent) {
		this.presentOverlays = [];
		var overlays_copy = [];
		for (var i = 0; i < this.prevOverlays[this.prevOverlays.length - 1].length; i++) {
			var clone_shape = cloneShape(this.prevOverlays[this.prevOverlays.length - 1][i]);
			if (ShapesUtil.overlayItemIsShape(clone_shape)) {
				this.mapEditor.addShapeListeners(clone_shape, null); // don't have an overlay event!
			} else {
				this.mapEditor.addMarkerListeners(clone_shape, null); // don't have an overlay event!
			}
			overlays_copy[i] = clone_shape;
		}
		this.presentOverlays.push(overlays_copy);
	}
}

MapEditorHistory.prototype.undoneOverlaysPush = function () {

	var conditionUndone = this.presentOverlays[this.presentOverlays.length - 1] !== undefined;

	if (conditionUndone) {
		var overlays_copy = [];
		for (var i = 0; i < this.presentOverlays[0].length; i++) {
			var clone_shape = ShapesUtil.cloneShape(this.presentOverlays[0][i]);
			if (ShapesUtil.overlayItemIsShape(clone_shape)) {
				this.mapEditor.addShapeListeners(clone_shape, null); // don't have an overlay event!
			} else {
				this.mapEditor.addMarkerListeners(clone_shape, null); // don't have an overlay event!
			}
			overlays_copy[i] = clone_shape;
		}
		this.undoneOverlays.push(overlays_copy);
	}

	var conditionPresent = this.prevOverlays[this.prevOverlays.length - 1] !== undefined;

	if (conditionPresent) {
		this.presentOverlays = [];
		var overlays_copy = [];
		for (var i = 0; i < this.prevOverlays[this.prevOverlays.length - 1].length; i++) {
			var clone_shape = ShapesUtil.cloneShape(this.prevOverlays[this.prevOverlays.length - 1][i]);
			if (ShapesUtil.overlayItemIsShape(clone_shape)) {
				this.mapEditor.addShapeListeners(clone_shape, null); // don't have an overlay event!
			} else {
				this.mapEditor.addMarkerListeners(clone_shape, null); // don't have an overlay event!
			}
			overlays_copy[i] = clone_shape;
		}
		this.presentOverlays.push(overlays_copy);
	}
}