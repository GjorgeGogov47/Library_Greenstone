/** Javascript file for editing a single document's content - metadata and text */
/** uses other functions in documentedit_scripts_util.js */

/* some vars for document editing */
/* if true, will look through all the metadata for the document, and add each namespace into the list of metadata sets. If set to false, will only add in the ones defined in setStaticMetadataSets function (defined below) - override this function to make a custom list of sets */
var dynamic_metadata_set_list = true;
/* if false, will hide the metadata list selector. So the user will only get to see the default metadata set. */
var display_metadata_set_selector = true;
/* if true, will make the editing controls stay visible even on page scrolling */
var keep_editing_controls_visible = true;
/* Here you can choose which save buttons you like. Choose from 'save', 'rebuild', 'saveandrebuild' */
var save_and_rebuild_buttons = ["saveandrebuild"];
//var save_and_rebuild_buttons = ["save", "rebuild", "saveandrebuild"];

/* What kind of metadata element selection do we provide?
plain: just a text input box
fixedlist: a drop down menu with a fixed list of options (provided by the availableMetadataElements list)
autocomplete: a text input box with a list of suggestions to choose from (provided by the availableMetadataElements list). Allows additional input other than the fixed list
 */
var new_metadata_field_input_type = "plain";
/* add all metadata button? only valid with fixedlist or autocomplete metadata element selection */
var enable_add_all_metadata_button = true;

/* Metadata elements to be used in the fixedlist/autocomplete options above */
var availableMetadataElements = ["dc.Title", "dc.Subject"];
/* metadata elements that have a list of values/suggestions */
var autocompleteMetadata = new Array();
/* for each metadata element specified here, one should provide an array of values. The name is the meta_name + "_values", but you must strip . and _ from the name.
for example
var autocompleteMetadata = ["dc.Subject"];
var dcSubject_values = ["Kings", "Queens", "others"];
 */

/* The metadata specified in multiValuedMetadata array will be treated as a delimited list, using mvm_delimiter. On saving, the values will be separated and saved individually */

var multiValuedMetadata = new Array(); // eg ["xx.Person", "xx.Location"];
var mvm_delimiter = ";";

/************************
 * METADATA EDIT SCRIPTS *
 ************************/

function addEditMetadataLink(cell) {
	cell = $(cell);
	var id = cell.attr("id").substring(6);
	var metaTable = gs.jqGet("meta" + id);
	var row = cell.parent();
	var newCell = $("<td>", {
			"style": "font-size:0.7em; padding:0px 10px",
			"class": "editMetadataButton"
		});
	var linkSpan = $("<span>", {
			"class": "ui-state-default ui-corner-all",
			"style": "padding: 2px; float:left;"
		});

	var linkLabel = $("<span>" + gs.text.de.edit_metadata + "</span>");
	var linkIcon = $("<span>", {
			"class": "ui-icon ui-icon-folder-collapsed"
		});
	newCell.linkIcon = linkIcon;
	newCell.linkLabel = linkLabel;

	var uList = $("<ul>", {
			"style": "outline: 0 none; margin:0px; padding:0px;"
		});
	var labelItem = $("<li>", {
			"style": "float:left; list-style:none outside none;"
		});
	var iconItem = $("<li>", {
			"style": "float:left; list-style:none outside none;"
		});

	uList.append(iconItem);
	uList.append(labelItem);
	labelItem.append(linkLabel);
	iconItem.append(linkIcon);

	var newLink = $("<a>", {
			"href": "javascript:;"
		});
	newLink.click(function () {
		if (metaTable.css("display") == "none") {
			linkLabel.html(gs.text.de.hide_metadata);
			linkIcon.attr("class", "ui-icon ui-icon-folder-open");
			metaTable.css("display", "block");
			metaTable.metaNameField.css("display", "inline");
			metaTable.addRowButton.css("display", "inline");
			if (enable_add_all_metadata_button == true) {
				metaTable.addAllButton.css("display", "inline");
			}
		} else {
			linkLabel.html(gs.text.de.edit_metadata);
			linkIcon.attr("class", "ui-icon ui-icon-folder-collapsed");
			metaTable.css("display", "none");
			metaTable.metaNameField.css("display", "none");
			metaTable.addRowButton.css("display", "none");
			if (enable_add_all_metadata_button == true) {
				metaTable.addAllButton.css("display", "none");
			}
		}
	});

	newLink.append(uList);
	linkSpan.append(newLink);
	newCell.append(linkSpan);
	row.append(newCell);

	addFunctionalityToTable(metaTable);
	metaTable.metaNameField.css("display", "none");
	metaTable.addRowButton.css("display", "none");
	if (enable_add_all_metadata_button == true) {
		metaTable.addAllButton.css("display", "none");
	}
}

var gsmap_store = {};
var gps_metadata_name = "GPS.mapOverlay";

// Called by documentedit_scripts_util.js when saving and rebuilding.
// This function should return all the doc sections' map overlay data so that
// setArchivesMetadata can be called for each and the entire collection rebuilt with the changes
function getDocMapsEditDataForSaving(collName) {
	var map_editors_array = Object.values(gsmap_store);
	var modifiedMaps = []; // the array that is the return value: an array of only all the modified maps
	
	
	for(var i = 0; i < map_editors_array.length; i++) {
		var map_editor = map_editors_array[i];
		var oldMapData = map_editor.savedOverlays; // stringified JSON shape
		var newMapData = JSON.stringify(ShapesUtil.overlayToJSON(map_editor.overlays)); // stringified JSON shape too
		
		// We only consider a map editor's map data to have been modified in the following cases:
		// - if oldMapData is null, new mapData should not be empty array
		// - OR oldMapData had some value and it's not the same as newMapData
		if(!oldMapData && newMapData !== "[]" || oldMapData && oldMapData !== newMapData) {
			var nodeID = map_editors_array[i].id;
			//console.log("old vs new mapdata for nodeID " + nodeID);
			//console.log("OLD: " + oldMapData);
			//console.log("NEW: " + newMapData);
			
			modifiedMaps.push({
				collection: collName,
				docID: nodeID,
				name:gps_metadata_name,
				metapos: 0,
				value:newMapData				
			});
			
			//map_editor.savedOverlays = newMapData;
			// Saving the new overlay values as the old ones, for the state after saving and rebuilding is done,
			// now happens after all setArchivesMeta)_ calls have succeeded,
			// which is just at the start of sendBuildRequest() in documentedit_scripts_util.js::saveAndRebuild()			
		}
		
	}
	
	return modifiedMaps;
}


function addEditMapGPSLink(cell) {
	cell = $(cell);
	var id = cell.attr("id").substring(6);
	//console.log(id);
	var mapGPScontainer = gs.jqGet("map-and-controls-" + id);
	var row = cell.parent();
	var newCell = $("<td>", {
			"style": "font-size:0.7em; padding:0px 10px",
			"class": "editMapGPSButton"
		});
	var linkSpan = $("<span>", {
			"class": "ui-state-default ui-corner-all",
			"style": "padding: 2px; float:left;"
		});

	var linkLabel = $("<span>" + gs.text.de.edit_map_gps + "</span>");
	var linkIcon = $("<span>", {
			"class": "ui-icon ui-icon-folder-collapsed"
		});
	newCell.linkIcon = linkIcon;
	newCell.linkLabel = linkLabel;

	var uList = $("<ul>", {
			"style": "outline: 0 none; margin:0px; padding:0px;"
		});
	var labelItem = $("<li>", {
			"style": "float:left; list-style:none outside none;"
		});
	var iconItem = $("<li>", {
			"style": "float:left; list-style:none outside none;"
		});

	uList.append(iconItem);
	uList.append(labelItem);
	labelItem.append(linkLabel);
	iconItem.append(linkIcon);

	var mapEditor = new MapEditor(id);
	gsmap_store["map-" + id] = mapEditor;
	
	var newLink = $("<a>", {
			"href": "javascript:;"
		});
	newLink.click(function () {
		//console.log(" Show/Hide Map Editor ");
		var clicked_mapEditor = gsmap_store["map-" + id];
		
		if (clicked_mapEditor.map == null) {
			clicked_mapEditor.initMapEditorControls();
			clicked_mapEditor.initMapEditor();
		}
		if (mapGPScontainer.css("display") == "none") {
			linkLabel.html(gs.text.de.hide_map_gps);
			linkIcon.attr("class", "ui-icon ui-icon-folder-open");
			mapGPScontainer.css("display", "block");
		} else {
			linkLabel.html(gs.text.de.edit_map_gps);
			linkIcon.attr("class", "ui-icon ui-icon-folder-collapsed");
			mapGPScontainer.css("display", "none");

		}
	});

	newLink.append(uList);
	linkSpan.append(newLink);
	newCell.append(linkSpan);
	row.append(newCell);

	mapGPScontainer.css("display", "none");

}

function setEditingFeaturesVisible(visible) {
	if (visible) {
		$("#editContentButton").html(gs.text.de.hide_editor);
		$("#editContentButtonDiv").attr("class", "ui-state-default ui-corner-all");
	} else {
		$("#editContentButton").html(gs.text.de.edit_content);
		$("#editContentButtonDiv").attr("class", "");
	}

	var visibility = (visible ? "" : "none");
	if (display_metadata_set_selector == true) {
		$("#metadataListLabel, #metadataSetList").css("display", visibility);
	}

	$(".editMetadataButton").each(function () {
		$(this).css("display", visibility);
		$(this.linkLabel).html(gs.text.de.edit_metadata);
		$(this.linkIcon).attr("class", "ui-icon ui-icon-folder-collapsed");
	});
	/*
	$(".editMapGPS").each(function(){
	$(this).css("display", visibility);
	$(this.linkLabel).html(gs.text.de.edit_map_gps);
	$(this.linkIcon).attr("class", "ui-icon ui-icon-folder-collapsed");
	});
	 */

	$("table").each(function () {
		if ($(this).attr("id") && $(this).attr("id").search(/^meta/) != -1) {
			$(this).css("display", "none");
			$(this.metaNameField).css("display", "none");
			$(this.addRowButton).css("display", "none");
			if (enable_add_all_metadata_button == true) {
				$(this.addAllButton).css("display", "none");
			}
		}
	});
}

/* override this function in other interface/site/collection if you want
a different set of metadata sets
Use in conjunction with the dynamic_metadata_set_list variable. */
function setStaticMetadataSets(list) {
	addOptionToList(list, "All", gs.text.de.all_metadata);
}

function readyPageForEditing() {

	if ($("#metadataSetList").length) {
		var setList = $("#metadataSetList");
		if (!setList.css("display") || setList.css("display") == "") {
			setEditingFeaturesVisible(false);
		} else {
			setEditingFeaturesVisible(true);
		}
		return;
	}

	$("#editContentButton").html(gs.text.de.hide_editor);
	//wait for 0.5 sec to let ckeditor up
	
	// Initialising editableInitStates for CKEDITOR instances now happens in the CKEDITOR.on('instanceReady') handler, which is added upon docReady, see documentedit_scripts_util::$( document ).ready(...)
	// Attempting CKEDITOR.on('instanceReady') at the start of this method or anywhere in this method didn't work because it was probably too late in page load phase to add the event handler then
	// (the instanceReady() event would have been triggered before this method finally got called).

	var editBar = $("#editBarLeft");

	var visibleMetadataList = $("<select>", {
			"id": "metadataSetList",
			"class": "ui-state-default"
		});
	setStaticMetadataSets(visibleMetadataList);

	if (display_metadata_set_selector == true) {
		var metadataListLabel = $("<span>", {
				"id": "metadataListLabel",
				"style": "margin-left:20px;"
			});
		metadataListLabel.html(gs.text.de.visible_metadata);
		editBar.append(metadataListLabel);
	} else {
		visibleMetadataList.css("display", "none");
	}
	editBar.append(visibleMetadataList);
	visibleMetadataList.change(onVisibleMetadataSetChange);
	editBar.append("<br>");

	for (var i = 0; i < save_and_rebuild_buttons.length; i++) {
		var button_type = save_and_rebuild_buttons[i];
		if (button_type == "save") {
			var saveButton = $("<button>", {
					"id": "saveButton",
					"class": "ui-state-default ui-corner-all"
				});
			saveButton.click(save);
			saveButton.html(gs.text.de.save);
			editBar.append(saveButton);
		} else if (button_type == "rebuild") {
			var rebuildButton = $("<button>", {
					"id": "rebuildButton",
					"class": "ui-state-default ui-corner-all"
				});
			rebuildButton.click(rebuildCurrentCollection);
			rebuildButton.html(gs.text.de.rebuild);
			editBar.append(rebuildButton);
		} else if (button_type == "saveandrebuild") {
			var saveAndRebuildButton = $("<button>", {
					"id": "saveAndRebuildButton",
					"class": "ui-state-default ui-corner-all"
				});
			saveAndRebuildButton.click(saveAndRebuild);
			saveAndRebuildButton.html(gs.text.de.saverebuild);
			editBar.append(saveAndRebuildButton);

		}
	}
	var statusBarDiv = $("<div>");
	editBar.append(statusBarDiv);
	_statusBar = new StatusBar(statusBarDiv[0]);

	var titleDivs = $(".sectionTitle");
	for (var i = 0; i < titleDivs.length; i++) {
		addEditMetadataLink(titleDivs[i]);
		addEditMapGPSLink(titleDivs[i]);
	}
	
	// We need to keep track of editableElementsInitialisationProgress: the number of editable elements that need to be initialised/need to finish initialising
	// As CKEditors will be added, meaning more editable elements, must increment our counter editableElementsInitialisationProgress
	//var $num_editable_textareas = $(".sectionText"); // consider searching for 'contenteditable="true"' as this is what CKEDITOR is looking for (we think!)		
	// I think for us it's always a <div> that has contenteditable="true", but to get all elements with attr contenteditable set to true,
	// see https://stackoverflow.com/questions/4958081/find-all-elements-with-a-certain-attribute-value-in-jquery
	// which has inefficient and slightly more efficient ways of doing that
	var $num_editable_textareas = $('div[contenteditable="true"]'); 
	editableElementsInitialisationProgress += $num_editable_textareas.length;
	
	_baseURL = gs.xsltParams.library_name;
	onVisibleMetadataSetChange(); // make sure that the selected item in the list is active
	
	// If the user is attempting to leave the page, check if there are unsaved changes
	// and if so, display an "Are you sure you want to leave" message.
	// https://stackoverflow.com/questions/7080269/javascript-before-leaving-the-page
	// Newer versions of Firefox/Chrome don't display custom message (security feature):
	// https://stackoverflow.com/questions/22776544/why-is-jquery-onbeforeunload-not-working-in-chrome-and-firefox
	// and http://jsfiddle.net/XZAWS/
	// jquery bind() is deprecated: https://stackoverflow.com/questions/33654716/is-jquery-bind-deprecated	
	
	$(window).on("beforeunload", function(event) {
		
		if(gs.cgiParams.docEdit == "1") { // like document.xsl, which checks the same var upon onload
			// shouldn't check for whether changes are saved unless on Doc Editing page (DocEdit=1)
			// else the following pop up always ends up appearing when attempting
			// to leave a doc view page in Doc Editing Mode (when not yet actually Doc Editing)
			
			// Because we've done extra work now in maintaining "editableElementsInitialisationProgress", which is
			// the number of editable elements that still need to finish initialising, we can now be confident that
			// the call to changesToUpdate() below won't return the wrong answers if a page with docEdit turned on
			// is asked to unload (e.g. by pressing Reload) before the page has finished loading.
			var changes = changesToUpdate();
			
			//console.log("#### CHANGES before page reload: ", changes);
			
			if(changes.length > 0) {
				console.log("The collection hasn't yet been saved after editing. Are you sure you want to leave?");
				return "The collection hasn't yet been saved after editing. Are you sure you want to leave?";	
			}
		}
	});


}

// override the one in documentmaker_scripts_util
// currently not used if other one is present. need to get the js include order right
function enableSaveButtons(enabled) {
	if (enabled) {
		$("#saveButton, #rebuildButton, #saveAndRebuildButton").removeAttr("disabled");
	} else {
		$("#saveButton, #rebuildButton, #saveAndRebuildButton").attr("disabled", "disabled");
	}
}

/* this is a cut down version of save() from documentmaker_scripts_util.js
going back to using save, will delete this once everything working*/
function saveMetadataChangesOld() {

	console.log("Saving metadata changes");

	// get collection name
	var collection = gs.cgiParams.c;

	// get document id
	var docID = gs.cgiParams.d;

	var metadataChanges = new Array();
	if (_deletedMetadata.length > 0) {

		for (var i = 0; i < _deletedMetadata.length; i++) {

			var currentRow = _deletedMetadata[i];

			//Get metadata name
			var cells = currentRow.getElementsByTagName("TD");
			var nameCell = cells[0];
			var name = nameCell.innerHTML;
			var valueCell = cells[1];
			var value = valueCell.innerHTML;
			metadataChanges.push({
				type: 'delete',
				docID: docID,
				name: name,
				value: value
			});
			removeFromParent(currentRow);
		}
	}

	if (metadataChanges.length == 0) {
		console.log(gs.text.de.no_changes);
		return;
	}

	var processChangesLoop = function (index) {
		var change = metadataChanges[index];

		var callbackFunction;
		if (index + 1 == metadataChanges.length) {
			callbackFunction = function () {
				console.log("Completed saving metadata changes. You must rebuild the collection for the changes to take effect.");
			};
		} else {
			callbackFunction = function () {
				processChangesLoop(index + 1)
			};
		}
		if (change.type == "delete") {
			gs.functions.removeArchivesMetadata(collection, gs.xsltParams.site_name, change.docID, change.name, null, change.value, function () {
				callbackFunction();
			});
		} else {
			if (change.orig) {
				gs.functions.setArchivesMetadata(collection, gs.xsltParams.site_name, docID, change.name, null, change.value, change.orig, "override", function () {
					callbackFunction();
				});
			} else {
				gs.functions.setArchivesMetadata(collection, gs.xsltParams.site_name, docID, change.name, null, change.value, null, "accumulate", function () {
					callbackFunction();
				});
			}
		}
	}
	processChangesLoop(0);
	/* need to clear the changes from the page */
	while (_deletedMetadata.length > 0) {
		_deletedMetadata.pop();
	}

}