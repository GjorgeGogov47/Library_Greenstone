/** Javascript file containing useful functions used by both documentedit_scripts.js and documentmaker_scripts.js */


//Some "constants" to match the server constants
var SUCCESS = 1;
var ACCEPTED = 2;
var ERROR = 3;
var CONTINUING = 10;
var COMPLETED = 11;
var HALTED = 12;

var _transactions = new Array();
var _collectionsToBuild = new Array();
var _allContents = new Array();
var _deletedSections = new Array();
var _deletedMetadata = new Array();
var _undoOperations = new Array();
var _baseURL;
var _statusBar;
var _metadataSetList = new Array();


// We need to wait for all editable elements (metadataTable and sectionText) to be finished with initialising
// before we try to store their current states in the editableInitStates array
// To do this, we need to keep track of how many elements still require initialising.
var editableElementsInitialisationProgress = 0;

	

function encodeDelimiters(meta_value) {

    var new_value = meta_value.replace(/;/g, "%253B");
    return new_value.replace(/&/g, "%2526");
}    

function getElementsByClassName(cl, parent) 
{
	var elemArray = [];
	var classRegEx = new RegExp("\\b" + cl + "\\b");
	var elems;
	if(parent)
	{	
		elems = parent.getElementsByTagName("*");
	}
	else
	{
		elems = document.getElementsByTagName("*");
	}
	
	for (var i = 0; i < elems.length; i++) 
	{
		var classeName = elems[i].className;
		if (classRegEx.test(classeName)) elemArray.push(elems[i]);
	}
	
	return elemArray;
};

function getNextSiblingOfType(elem, type)
{
	if(elem == null)
	{
		return null;
	}
	
	var current = elem.nextSibling;
	while(current != null)
	{
		if(current.nodeName.toLowerCase() == type)
		{
			return current;
		}
		
		current = current.nextSibling;
	}
	return null;
}

function getPrevSiblingOfType(elem, type)
{
	if(elem == null)
	{
		return null;
	}
	
	var current = elem.previousSibling;
	while(current != null)
	{
		if(current.nodeName.toLowerCase() == type)
		{
			return current;
		}
		
		current = current.previousSibling;
	}
	return null;
}

function saveTransaction(transaction)
{
	console.log(transaction);
	_transactions.push(transaction);
}

function undo()
{
	if(_undoOperations.length == 0)
	{
		return;
	}
	
	var undoOp = _undoOperations.pop();

	//Create/Duplicate undo
	if(undoOp.op == "del")
	{
		if(undoOp.srcElem.childList)
		{
			removeFromParent(undoOp.srcElem.childList);
		}
		if(undoOp.srcElem.parentItem)
		{
			undoOp.srcElem.parentItem.menu.newSectionLink.style.display = "inline";
			undoOp.srcElem.parentItem.childList = null;
		}
		removeFromParent(undoOp.srcElem);
	}
	
	if(undoOp.op == "delMeta")
	{
		if(undoOp.srcElem.childList)
		{
			removeFromParent(undoOp.srcElem.childList);
		}
		if(undoOp.srcElem.parentItem)
		{
			undoOp.srcElem.parentItem.menu.newSectionLink.style.display = "inline";
			undoOp.srcElem.parentItem.childList = null;
		}
		de.doc.unregisterEditSection(undoOp.srcElem);
		removeFromParent(undoOp.srcElem);
	}
	
	//Move undo (mva is move after, mvb is move before, mvi is move into)
	else if(undoOp.op == "mva" || undoOp.op == "mvb" || undoOp.op == "mvi")
	{
		if(undoOp.op == "mvb")
		{
			undoOp.refElem.parentNode.insertBefore(undoOp.srcElem, undoOp.refElem);
		}
		else if(undoOp.op == "mva")
		{
			insertAfter(undoOp.srcElem, undoOp.refElem);
		}
		else
		{
			undoOp.refElem.removeChild(undoOp.refElem.firstChild);
			undoOp.refElem.appendChild(undoOp.srcElem);
		}

		if(undoOp.srcElem.textDiv)
		{
			insertAfter(undoOp.srcElem.textDiv, undoOp.srcElem);
		}
		if(undoOp.srcElem.childList)
		{
			insertAfter(undoOp.srcElem.childList, undoOp.srcElem.textDiv);
		}

		if(undoOp.srcElem.onmouseout)
		{
			//Uncolour the section if it coloured
			undoOp.srcElem.onmouseout();
		}
		updateFromTop();
	}
	else if(undoOp.op == "display")
	{
		undoOp.srcElem.style.display = undoOp.subOp;
	}
	
	if(undoOp.removeDeletedMetadata)
	{
		_deletedMetadata.pop();
	}

	if(undoOp.removeTransaction)
	{
		_transactions.pop();
	}
}

function enableSaveButtons(enabled) {
  if (enabled) {
    $("#saveButton, #quickSaveButton").html(gs.text.de.save_changes);
    $("#saveButton, #quickSaveButton").removeAttr("disabled");

  } else {
    $("#saveButton, #quickSaveButton").html(gs.text.de.saving + "...");
    $("#saveButton, #quickSaveButton").attr("disabled", "disabled");
   
  }
}
function addCollectionToBuild(collection)
{
	for(var i = 0; i < _collectionsToBuild.length; i++)
	{
		if(collection == _collectionsToBuild[i])
		{
			return;
		}
	}
	_collectionsToBuild.push(collection);
}

function save() {
  saveAndRebuild(false);
}

function rebuildCurrentCollection() {

  console.log(gs.text.de.rebuilding_collection);
  enableSaveButtons(false);
  var collection = gs.cgiParams.c;

  var collectionsArray = new Array();
  collectionsArray.push(collection);
  buildCollections(collectionsArray, null, reloadUponRebuild); // passing in callback to reload the page after build, as requested by Kathy
}


function reloadUponRebuild() {
   // finished rebuilding - reload the page after rebuild, but first
   // clear transactions array of saved changes, now that we're done processing these changes during rebuild,
   // since we don't want the "are you sure to leave page" popup which appears on _transactions array being non-empty
    _transactions = null;    
    location.reload(true); // force reload, not from cache, https://www.w3schools.com/jsref/met_loc_reload.asp 
}

/************************************
*    TEXT EDIT (CKEDITOR) SCRIPTS    *
**************************************/

//  not using this anymore as the instanceready never seems to get called 
function addCKEEditableState(evt,stateArray) 
{
    // Event->Editor->CKE DOM Inline Element that editor was for->underlying jquery element 
    element = evt.editor.element.$;
    nodeText = element.innerHTML;
         stateArray.push({
             editableNode : element,
             initHTML : nodeText
         });
}

function addEditableState(editable,stateArray)
{

	if(editable.tagName == 'TEXTAREA')
	{
		nodeText = editable.value;
	}
	else 
	{
	 	nodeText = editable.innerHTML;
	}

        stateArray.push({
                editableNode : editable,
                initHTML : nodeText
        });

}

function getLastEditableStates()
{	
	editableLastStates = [];
        $(".sectionText").each(function(){addEditableState(this,editableLastStates);});
        $(".metaTableCellArea").each(function(){addEditableState(this,editableLastStates);});

}

function changesToUpdate() 
{
	var resultArray = new Array();
	
	//console.log("**** changesToUpdate::editableElementsInitialisationProgress = " + editableElementsInitialisationProgress);
	
	// Only want to check for valid edited states if the editableInitStates has been fully set up:
	// We don't bother if editableInitStates is not ready:
	// if editableInitStates array has nothing in it (which means CKEditor is not ready)
	// OR if some of the editable elements (metadataTable OR ckeditor editable values) still need to be initialised/initialising is only partway through 
	if ((editableInitStates.length > 0) && (editableElementsInitialisationProgress == 0)) {
		getLastEditableStates();
		for (var j in editableLastStates) 
		{	
			if (isNodeChanged(editableLastStates[j])) 
			{
				resultArray.push(editableLastStates[j].editableNode);
			}
		}
	}
	return resultArray;
}


function isNodeChanged(StateToCheck){
	for (var i in editableInitStates) 
	{
	    if ((StateToCheck.editableNode === editableInitStates[i].editableNode)) {
		if ( StateToCheck.initHTML === editableInitStates[i].initHTML ) 
		{
			return false;
		}
		    //console.log("current="+StateToCheck.initHTML);
		    //console.log("init="+editableInitStates[i].initHTML);
		return true;
	    }
	
	}
    // if get here, this must be a new node, as wasn't in init states
    // make sure its not empty - we won't add empty nodes.
    if (StateToCheck.initHTML == "") {
	return false;
    }

	console.log("**** isNodeChanged() editableInitStates = ", editableInitStates);
    return true;
    
}

function changesSaved() {
	console.log("Replacing init states with current states");
	// Clean changes. We're here because setting meta for all meta changes was successful, so
	// - update doc's metadata initial states to current:
	editableInitStates = editableLastStates;		
	// - update doc's map editors' initial states to current:
	var map_editors_array = Object.values(gsmap_store);
	for(var i = 0; i < map_editors_array.length; i++) {
		var map_editor = map_editors_array[i];
		map_editor.savedOverlays = JSON.stringify(ShapesUtil.overlayToJSON(map_editor.overlays));
	}
}


function saveAndRebuild(rebuild) 
{
//This works in most cases but will not work when taking a doc from one collection to another, will need to be fixed at some point
  var collection;
  if(gs.cgiParams.c && gs.cgiParams.c != "") {
    
    collection = gs.cgiParams.c;
  }
  else {
    collection = gs.cgiParams.p_c;
  }
  
	var sendBuildRequest = function()
	{
		var request = "[";
		for(var i = 0; i < _transactions.length; i++)
		{
			request += _transactions[i];
			if(i != _transactions.length - 1)
			{
				request += ",";
			}
		}
		request += "]";

		var statusID;
		var ajax = new gs.functions.ajaxRequest();
		ajax.open("POST", gs.xsltParams.library_name, true);
		ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		ajax.onreadystatechange = function()
		{
			if(ajax.readyState == 4 && ajax.status == 200)
			{
				var text = ajax.responseText;
				var xml = validateXML(text);
				
				var errorElems;
				if(!xml || checkForErrors(xml))
				{
					alert(gs.text.dse.error_saving);
				
					enableSaveButtons(true);
					
					if(_statusBar)
					{
						_statusBar.removeStatus(statusID);
					}
					return;
				}

				if(_statusBar)
				{
					_statusBar.removeStatus(statusID);
				}
				if (rebuild) {
				    buildCollections(_collectionsToBuild, null, reloadUponRebuild);
				} else { // no rebuilding
					// We're past possible errors at this point. So changes have by now been definitely saved to archives.
					// and as there is no rebuilding of the collection, we're now ready to set init states to current states					
					changesSaved();
					
				  // reset the save button here
				    enableSaveButtons(true);
				    // saving to archives is now done, clear the transactions
				    // that were keeping track of the full text changes that have now
				    // been performed to archives (no member var keeps track of meta changes, only a local var)
				    _transactions = new Array();
				}
			}
		}

		if(_collectionsToBuild.length > 0)
		{
		  enableSaveButtons(false);

			if(_statusBar)
			{
				statusID = _statusBar.addStatus(gs.text.dse.modifying_archives + "...");
			}
			ajax.send("a=g&rt=r&s=DocumentExecuteTransaction&s1.transactions=" + request);
		}
	} // end sendBuildRequest definition

  var metadataChanges = new Array();
  if (_deletedMetadata.length > 0) {
    //addCollectionToBuild(collection);

    for(var i = 0; i < _deletedMetadata.length; i++) {
      
      var currentRow = _deletedMetadata[i];
      
      //Get document ID
      var currentElem = currentRow;
      while((currentElem = currentElem.parentNode).tagName != "TABLE");
      var docID = currentElem.getAttribute("id").substring(4);
      
      //Get metadata name
      var cells = currentRow.getElementsByTagName("TD");
	var nameCell = cells[0];
	// metadata name cell might have the multivalue indicator in it, so just want the first word
	var name = nameCell.innerHTML.split(" ")[0];
      var valueCell = cells[1];
	var value = valueCell.getElementsByTagName("TEXTAREA")[0].value;
	if (value.length) {
	    // check for non empty value, in case all they have done is add a field then deleted it.
	    metadataChanges.push({type:'delete', docID:docID, name:name, value:value});
	    addCollectionToBuild(collection);
	}
      removeFromParent(currentRow);
    }
  }

  var changes = changesToUpdate();
  
  //Clean changes
  ////editableInitStates = editableLastStates; // moved into processChangesLoop(): when all changes have successfully been processed.
		// Alternative is to set initState per metadata in changes array: after each setArchiveMetadata call for each individual meta change.
		// But since our setMeta calls are always synchronous, happening in sequence, if one setArchivesMeta() call fails
		// we'll not attempt subsequent ones or coll building at the end.
  
	for(var i = 0; i < changes.length; i++)
	{
		var changedElem = changes[i];
		//Save metadata
		
		if(gs.functions.hasClass(changedElem, "metaTableCellArea")) 
		{
			//Get document ID
			var currentElem = changedElem;
			while((currentElem = currentElem.parentNode).tagName != "TABLE");
			var docID = currentElem.getAttribute("id").substring(4);
		    
			//Get metadata name
			var row = changedElem.parentNode.parentNode;
			var cells = row.getElementsByTagName("TD");
		    var nameCell = cells[0];
		    // metadata name cell might have the multivalue indicator in it, so just want the first word
		    var name = nameCell.innerHTML.split(" ")[0];
			var value = changedElem.value;
			value = value.replace(/&nbsp;/g, " ");

			var orig = changedElem.originalValue;
			if (orig) {
			  orig = orig.replace(/&nbsp;/g, " ");
			}
		    if (jQuery.inArray(name, multiValuedMetadata) != -1) {

			// split the values
			var values_list = value.split(mvm_delimiter);
			var orig_list;
			var num_orig;
			if (orig) {
			    orig_list = orig.split(mvm_delimiter);
			    num_orig = orig_list.length;
			}

			for(var i = 0; i < values_list.length; i++) {
			    var val = values_list[i];
			    var ori =null;
			    if (orig && i<num_orig) {
				    ori = orig_list[i];
				}
			    metadataChanges.push({collection:collection, docID:docID, name:name, value:val, orig:ori});
			}
		    } else {
			metadataChanges.push({collection:collection, docID:docID, name:name, value:value, orig:orig});
		    }
			changedElem.originalValue = changedElem.value;
			addCollectionToBuild(collection);
		}
		//Save content
		else if(gs.functions.hasClass(changedElem, "renderedText"))
		{
			var section = changedElem.parentDiv.parentItem;
			saveTransaction('{"operation":"setText", "text":"' + CKEDITOR.instances[changedElem.getAttribute("id")].getData().replace(/%/g, "%25").replace(/"/g, "\\\"").replace(/&/g, "%26") + '", "collection":"' + section.collection + '", "oid":"' + section.nodeID + '"}'); //'
			addCollectionToBuild(section.collection);
		}
		else if(gs.functions.hasClass(changedElem, "sectionText"))
		{
			var id = changedElem.getAttribute("id");
			var sectionID = id.substring(4);
			saveTransaction('{"operation":"setText", "text":"' + CKEDITOR.instances[changedElem.getAttribute("id")].getData().replace(/%/g, "%25").replace(/"/g, "\\\"").replace(/&/g, "%26") + '", "collection":"' + gs.cgiParams.c + '", "oid":"' + sectionID + '"}'); //'
			addCollectionToBuild(gs.cgiParams.c);
		}
	}

    // Check for changes to any map editors in the document
    // NOTE: At present, we don't maintain a list of deletions for the map editor:
    // GPS.mapOverlay data that has been removed is recorded as a change not a deletion,
    // with the metadata's new value being the string of an empty JSON array, [],
    // and entered as such into doc.xml.
	var modified_map_editors_data = getDocMapsEditDataForSaving(gs.cgiParams.c); // collection	
	for(var i = 0; i < modified_map_editors_data.length; i++) {		
		metadataChanges.push(modified_map_editors_data[i]); // of the form { collection: gs.cgiParams.c, docID: nodeID, name:"GSP.mapOverlay", metapos: 0, value: <stringifiedJSON> }
		addCollectionToBuild(gs.cgiParams.c); // collection
	}

	
	var errorCallback = function() {		
		alert(gs.text.dse.setarchives_server_error); // "A server side error occurred during setArchivesMetadata. (Is the server running?)\nNot proceeding further with saving and rebuilding."
		return true;
		
	}
	
	// called on success callback, to check for errors in response. Returns true if response contains the error status code 3
	var hadErrorResponseOnSave = function(response) {
		
		// check response for error status code 3
		//<status code="3"
		
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(response,"text/xml");
		
		// Response may have no status code if metadata changes made and the the server stopped and then restarted and docEditor's building button pressed:
		// response message returned is that the user is not logged in. Don't handle this scenario here. This function solely checks for error status code===3 in responses.
		if(xmlDoc.getElementsByTagName("status").length > 0) {
		
			var status_code = xmlDoc.getElementsByTagName("status")[0].getAttribute("code");
			if(status_code === "3") { // status code 3 means error (see GSStatus.java::ERROR)
				alert(gs.text.dse.setarchives_error); // "An error occurred during setArchivesMetadata.\nNot proceeding further with saving and rebuilding.\nSee browser's console log for details."
				console.log("@@@ Error on setting archive metadata. Got error message: " + response);
				return true;
			}
		}
		return false;

	}
	
	var processChangesLoop = function(index)
	{
		var change = metadataChanges[index];
				
		var callbackFunction;
		if(index + 1 == metadataChanges.length)
		{
			callbackFunction = sendBuildRequest;
		}
		else
		{
			callbackFunction = function(){processChangesLoop(index + 1)};
		}
		if (change.type == "delete") {
		    gs.functions.removeArchivesMetadata(collection, gs.xsltParams.site_name, change.docID, change.name, null, encodeDelimiters(change.value), function(){callbackFunction();});
		} else {
		  // Checking "if(change.metapos)" doesn't work for us as it becomes false when the property doesn't exist AND when the property is 0. But metapos IS 0 for us.
		  // https://ultimatecourses.com/blog/methods-to-determine-if-an-object-has-a-given-property
		  if('metapos' in change && change.metapos === 0) {// && change.metapos === 0) { // for maps
				
				// collection, site, documentID, metadataName, metadataPosition, metadataValue, prevMetadataValue, metamode, responseFunction				
				//console.log("@@@ metapos! change: ", change);
				gs.functions.setArchivesMetadata(change.collection, gs.xsltParams.site_name, change.docID, change.name, change.metapos, encodeDelimiters(change.value), null, "override",
					function(response){ if(!hadErrorResponseOnSave(response)) callbackFunction(); },
					errorCallback);					
			}
		  else if(change.orig)
		    {
			gs.functions.setArchivesMetadata(change.collection, gs.xsltParams.site_name, change.docID, change.name, null, encodeDelimiters(change.value), encodeDelimiters(change.orig), "override",
				function(response){ if(!hadErrorResponseOnSave(response)) callbackFunction(); },
				errorCallback);
		    }
		  else
		    {
			gs.functions.setArchivesMetadata(change.collection, gs.xsltParams.site_name, change.docID, change.name, null, encodeDelimiters(change.value), null, "accumulate",
				function(response){ if(!hadErrorResponseOnSave(response)) callbackFunction(); },
				errorCallback);
		    }
		}
	}
	if (metadataChanges.length>0) {
	  // this will process each change one by one, and then send the build request
	  processChangesLoop(0);
	}
	else if(_collectionsToBuild.length > 0) {
	  // if there are no metadata changes, but some other changes eg text have happened, then we need to send the build request.
	  sendBuildRequest();
	}
	  
	/* need to clear the changes from the page so that we don't process them again next time */
	while (_deletedMetadata.length>0) {
	  _deletedMetadata.pop();
	}

}


function buildCollections(collections, documents, callback)
{
	if(!collections || collections.length == 0)
	{
		console.log(gs.text.dse.empty_collection_list);
		enableSaveButtons(true);
		return;
	}
	
	var docs = "";
	var buildOperation = "";
	if(documents)
	{
		buildOperation = "ImportCollection";
		docs += "&s1.documents=";
		for(var i = 0; i < documents.length; i++)
		{
			docs += documents[i];
			if(i < documents.length - 1)
			{			
				docs += ",";
			}
		}
	}
	else
	{
		buildOperation = "BuildAndActivateCollection";
	}

	var counter = 0;
	var statusID = 0;
	var buildFunction = function()
	{
		var ajax = new gs.functions.ajaxRequest();
		ajax.open("GET", gs.xsltParams.library_name + "?a=g&rt=r&ro=1&s=" + buildOperation + "&s1.incremental=true&s1.collection=" + collections[counter] + docs);
		ajax.onreadystatechange = function()
		{
			if(ajax.readyState == 4 && ajax.status == 200)
			{
				var text = ajax.responseText;
				var xml = validateXML(text);

				if(!xml || checkForErrors(xml))
				{
					alert(gs.text.dse.could_not_build_p1 + " " + collections[counter] + gs.text.dse.could_not_build_p2);
					
					if(_statusBar)
					{
						_statusBar.removeStatus(statusID);
					}
					enableSaveButtons(true);
					
					return;
				}

				var status = xml.getElementsByTagName("status")[0];
				var pid = status.getAttribute("pid");

				startCheckLoop(pid, buildOperation, statusID, function()
				{
					/*
					var localAjax = new gs.functions.ajaxRequest();
					localAjax.open("GET", gs.xsltParams.library_name + "?a=g&rt=r&ro=1&s=ActivateCollection&s1.collection=" + collections[counter], true);
					localAjax.onreadystatechange = function()
					{
						if(localAjax.readyState == 4 && localAjax.status == 200)
						{
							var localText = localAjax.responseText;
							var localXML = validateXML(localText);
							
							if(!xml || checkForErrors(xml))
							{
								alert(gs.text.dse.could_not_activate_p1 + " " + collections[counter] + gs.text.dse.could_not_activate_p2);
								
								if(_statusBar)
								{
									_statusBar.removeStatus(statusID);
								}
								enableSaveButtons(true);
								
								return;
							}

							var localStatus = localXML.getElementsByTagName("status")[0];
							if(localStatus)
							{
								var localPID = localStatus.getAttribute("pid");
								startCheckLoop(localPID, "ActivateCollection", statusID, function()
								{
								*/
									if(counter == collections.length - 1)
									{
										// We're here because rebuilding has now completed with no errors.
										// This means changes were definitely successfully saved to archives AND have been rebuilt with NO errors,
										// so set init states to current states:
										changesSaved();
										
										removeCollectionsFromBuildList(collections);
										if(callback)
										{
											callback();
										}
									}
									else
									{
										counter++;
										buildFunction();
									}

									_transactions = new Array();

									if(_statusBar)
									{
										_statusBar.removeStatus(statusID);
									}
									enableSaveButtons(true);
								/*
								});
							}
						}
					}
					if(_statusBar)
					{
						_statusBar.changeStatus(statusID, gs.text.dse.activating + " " + collections[counter] + "...");
					}
					localAjax.send();
					*/
				});
			}
		}
		if(_statusBar)
		{
			statusID = _statusBar.addStatus(gs.text.dse.building + " " + collections[counter] + "...");
		}
		ajax.send();
	}
	buildFunction();
}

function startCheckLoop(pid, serverFunction, statusID, callbackFunction)
{
	var ajaxFunction = function()
	{
		var ajax = new gs.functions.ajaxRequest();
		ajax.open("GET", gs.xsltParams.library_name + "?a=g&rt=s&ro=1&s=" + serverFunction + "&s1.pid=" + pid, true);
		ajax.onreadystatechange = function()
		{
			if(ajax.readyState == 4 && ajax.status == 200)
			{
				var text = ajax.responseText;
				var xml = validateXML(text);
				
				if(!xml || checkForErrors(xml))
				{
					alert(gs.text.dse.could_not_check_status_p1 + " " + serverFunction + gs.text.dse.could_not_check_status_p2a);
					
					if(_statusBar)
					{
						_statusBar.removeStatus(statusID);
					}
					enableSaveButtons(true);
					
					return;
				}

				var status = xml.getElementsByTagName("status")[0];
				var code = status.getAttribute("code");

				if (code == COMPLETED || code == SUCCESS)
				{
					callbackFunction();
				}
				else if (code == HALTED || code == ERROR)
				{
					alert(gs.text.dse.could_not_check_status_p1 + " " + serverFunction + gs.text.dse.could_not_check_status_p2b);
					
					if(_statusBar)
					{
						_statusBar.removeStatus(statusID);
					}
					enableSaveButtons(true);
				}
				else
				{
					setTimeout(ajaxFunction, 1000);
				}
			}
		}
		ajax.send();
	}
	ajaxFunction();
}

function removeCollectionsFromBuildList(collections)
{
	var tempArray = new Array();
	for(var i = 0; i < _collectionsToBuild.length; i++)
	{
		var found = false;
		for(var j = 0; j < collections.length; j++)
		{
			if(collections[j] == _collectionsToBuild[i])
			{
				found = true;
				break;
			}
		}
		
		if(!found)
		{
			tempArray.push(_collectionsToBuild[i]);
		}
	}
	_collectionsToBuild = tempArray;
}

function checkForErrors(xml)
{
	var errorElems = xml.getElementsByTagName("error");
	
	if(errorElems && errorElems.length > 0)
	{
		var errorString = gs.text.dse.error_saving_changes + ": ";
		for(var i = 0; i < errorElems.length; i++)
		{
			errorString += " " + errorElems.item(i).firstChild.nodeValue;
		}
		alert(errorString);
		return true;
	}
	return false; //No errors
}

function validateXML(txt)
{
	// code for IE
	if (window.ActiveXObject)
	{
		var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = "false";
		xmlDoc.loadXML(document.all(txt).value);

		if(xmlDoc.parseError.errorCode!=0)
		{
			txt = dse.error_code + ": " + xmlDoc.parseError.errorCode + "\n";
			txt = txt + dse.error_reason + ": " + xmlDoc.parseError.reason;
			txt = txt + dse.error_line + ": " + xmlDoc.parseError.line;
			console.log(txt);
			return null;
		}
		
		return xmlDoc;
	}
	// code for Mozilla, Firefox, Opera, etc.
	else if (document.implementation.createDocument)
	{
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(txt,"text/xml");

		if (xmlDoc.getElementsByTagName("parsererror").length > 0)
		{
			console.log(gs.text.dse.xml_error);
			return null;
		}
		
		return xmlDoc;
	}
	else
	{
		console.log(gs.text.dse.browse_cannot_validate_xml);
	}
	return null;
}

function onVisibleMetadataSetChange()
{
	var metadataList = document.getElementById("metadataSetList");
	var index = metadataList.selectedIndex;
	var options = metadataList.getElementsByTagName("OPTION");
	var selectedOption = options[index];
	
	var selectedSet = selectedOption.value;
	changeVisibleMetadata(selectedSet);
}

function changeVisibleMetadata(metadataSetName)
{
        var metaSetList = metadataSetName.split(",");
	var tables = document.getElementsByTagName("TABLE");
	for(var i = 0; i < tables.length; i++)
	{
		var id = tables[i].getAttribute("id");
		if(id && id.search(/^meta/) != -1)
		{
			var rows = tables[i].getElementsByTagName("TR");
			for(var j = 0; j < rows.length; j++)
			{
				if(metadataSetName == "All")
				{
					rows[j].style.display = "table-row";
				}
				else
				{
				    var cells = rows[j].getElementsByTagName("TD");
				    // metadata name cell might have the multivalue indicator in it, so just want the first word
				    var cellName = cells[0].innerHTML.split(" ")[0];
					
					if(cellName.indexOf(".") == -1)
					{
						rows[j].style.display = "none";
					}
					else
					{
						var setName = cellName.substring(0, cellName.lastIndexOf("."));
						if (metaSetList.indexOf(setName)!= -1) 
						{
							rows[j].style.display = "table-row";
						}
						else
						{
							rows[j].style.display = "none";
						}
					}
				}
			}
		}
	}
}

function asyncRegisterEditSection(cell)
{
	//This registering can cause a sizeable delay so we'll thread it (effectively) so the browser is not paused
	cell.originalValue = cell.value;
	setTimeout(function(){
		addEditableState(cell, editableInitStates);
		// finished initialising one more editable element,
		// so decrement the counter keeping track of how many elements still need initialising
		editableElementsInitialisationProgress--;
	},0);
}

function addOptionToList(list, optionvalue, optiontext, selected) {
  var newOption = $("<option>");
  if (optiontext) {
    newOption.html(optiontext);
    newOption.attr("value", optionvalue);
  } else {
    newOption.html(optionvalue);
  }
  if (selected) {
    newOption.attr("selected", true);
  }
  list.append(newOption);
}

/* returns either an input or a select element. Data based on 
   availableMetadataElements var. */
function createMetadataElementSelector() {
  var metaNameField;
  if (new_metadata_field_input_type == "fixedlist") {
    metaNameField =  $("<select>", {"class": "ui-state-default"});
    for(var i=0; i<availableMetadataElements.length; i++) {
      addOptionToList(metaNameField, availableMetadataElements[i]);
    }
    return metaNameField;
  }
  metaNameField = $("<input>", {"type": "text","style":"margin: 5px; border: 1px solid #000;"}); 
  if (new_metadata_field_input_type == "autocomplete") {
    metaNameField.autocomplete({
	minLength: 0,
	  source: availableMetadataElements
	  });
      metaNameField.attr("title", gs.text.de.enter_meta_dropdwon); //"Enter a metadata name, or use the down arrow to select one, then click 'Add New Metadata'");
  } else {
      metaNameField.attr("title", gs.text.de.enter_meta_name); //"Enter a metadata name, then click 'Add New Metadata'");
  }
  
  return metaNameField;
}

function addFunctionalityToTable(table)
{
	var $tr_array = table.find("tr");	

	
	// We need to keep track of editableElementsInitialisationProgress: the number of editable elements that still need to be initialised/need to finish initialising
	// Each table's rows means *that* many more editable elements still need initialising.
	// So each time addFunctionalityToTable() is called on a table, we must increment our counter editableElementsInitialisationProgress
	// with how many editable cells it has/how many rows it has.
	editableElementsInitialisationProgress += $tr_array.length;
	
	$tr_array.each(function()
	{
		var cells = $(this).find("td");
		var metadataName = $(cells[0]).html();

		if(dynamic_metadata_set_list == true && metadataName.indexOf(".") != -1)
		{
			var metadataSetName = metadataName.substring(0, metadataName.lastIndexOf("."));
			
			var found = false;
			for(var j = 0; j < _metadataSetList.length; j++)
			{
				if(metadataSetName == _metadataSetList[j])
				{
					found = true;
					break;
				}
			}
			
			if(!found)
			{
				_metadataSetList.push(metadataSetName);
				addOptionToList( $("#metadataSetList"), metadataSetName);
			}
		}
			
		asyncRegisterEditSection(cells[1].getElementsByTagName("textarea")[0]);
	    addRemoveLinkToRow(this);

	    // add multivalued indicator if needed
	     if (jQuery.inArray(metadataName, multiValuedMetadata) != -1) {
	    //if (multiValuedMetadata.includes(metadataName)){
		$(cells[0]).html(metadataName + " <span title='"+gs.text.de.multi_valued_tooltip + "' style='float:right;'>"+mvm_delimiter+"</span>"); //Multi-valued metadata. Separate values with semi-colon ;
	    }
	    
	});

    // set up autocomplete values
    var value_cells = $(".metaTableCellArea");
    for (var k=0; k<autocompleteMetadata.length; k++) {
	var source_name = autocompleteMetadata[k].replace(/[\.-]/g, "");
	var source_obj = window[source_name+"_values"];
	if (source_obj) {
	    value_cells.filter("."+source_name).autocomplete({
		minLength: 0,
		source: source_obj
	    });
	}
    }

    // add metadata field selector
	var metaNameField = createMetadataElementSelector(); 	
	table.after(metaNameField);
	table.metaNameField = metaNameField;
	
    /* add the buttons */
    // check enable_add_all_button - only valid for fixedlist and autocomplete
    if (enable_add_all_metadata_button == true) {
	if (new_metadata_field_input_type != "fixedlist" && new_metadata_field_input_type != "autocomplete") {
	    enable_add_all_metadata_button = false;
	}
    }

    // add single metadata button
    var addRowButton = $("<button>",{"class": "ui-state-default ui-corner-all", "style": "margin: 5px;"});

	addRowButton.html(gs.text.de.add_new_metadata);
	addRowButton.click(function() 
	{ 
	        var name = metaNameField.val();
		if(!name || name == "")
		{
			console.log(gs.text.de.no_meta_name_given);
			return;
		}
	    addNewMetadataRow(table, name);

		
	});
    table.addRowButton = addRowButton;
    metaNameField.after(addRowButton);

    // add all metadata button
    if (enable_add_all_metadata_button == true) {
	var addAllButton = $("<button>",{"class": "ui-state-default ui-corner-all", "style": "margin: 5px;"});
	addAllButton.html(gs.text.de.add_all_metadata);
	addAllButton.click(function()
			   {
			       for(var i=0; i<availableMetadataElements.length; i++) {
				   
			           addNewMetadataRow(table, availableMetadataElements[i])
			       }
			       
			   });
	table.addAllButton = addAllButton;
	addRowButton.after(addAllButton);
    
    }

}

function addNewMetadataRow(table, name) {

    var clean_name = name.replace(/[\.-]/g, "");
    var newRow = $("<tr>", {"style": "display: table-row;"});
    var nameCell;
    if (jQuery.inArray(name, multiValuedMetadata) != -1) {
	nameCell = $("<td>" + name + " <span title='"+gs.text.de.multi_valued_tooltip + "' style='float:right;'>"+mvm_delimiter+"</span></td>");
    } else {
	nameCell = $("<td>" + name + "</td>");
    }
    nameCell.attr("class", "metaTableCellName");
    var valueCell = $("<td>", {"class": "metaTableCell"}); 	
    var textValue = $("<textarea>", {"class": "metaTableCellArea "+ clean_name}); 
    
    if (jQuery.inArray(name, autocompleteMetadata) != -1) {
	var source_obje = window[clean_name +"_values"];
	if (source_obje) {
	    textValue.autocomplete({
		minLength: 0,
		source: source_obje
	    });
	}
    }
    valueCell.append(textValue);
    newRow.append(nameCell);
    newRow.append(valueCell);
    addRemoveLinkToRow(newRow.get(0));
    table.append(newRow);
    
    var undo = new Array();
    undo.op = "delMeta";
    undo.srcElem = newRow;
    undo.removeTransaction = false;
    _undoOperations.push(undo);
    if ( hierarchyStorage && hierarchyStorage[name])
    {
        setHierarchyEventsWrappers(name);
    }
}

function addRemoveLinkToRow(row)
{
	var newCell = $("<td>");
	var removeLink = $("<a>"+gs.text.de.remove+"</a>", {"href": "javascript:;"});
	removeLink.click(function()
	{
		var undo = new Array();
		undo.srcElem = row;
		undo.op = "display";
		undo.subOp = "table-row";
		undo.removeDeletedMetadata = true;
		_undoOperations.push(undo);
		_deletedMetadata.push(row);
		//row.css("display", "none");
		$(row).hide();
	});
	newCell.append(removeLink);
	newCell.attr({"class": "metaTableCellRemove", "style": "font-size:0.6em; padding-left: 3px; padding-right: 3px;"});
	$(row).append(newCell);
}

/* This is for 'edit structure' menu bar */
function createTopMenuBar()
{
	//Create the top menu bar
	var headerTable = document.createElement("TABLE");
	var tableBody = document.createElement("TBODY");
	var row = document.createElement("TR");
	var newDocCell = document.createElement("TD");
	var newSecCell = document.createElement("TD");
	var saveCell = document.createElement("TD");
	var undoCell = document.createElement("TD");
	var metadataListCell = document.createElement("TD");
	
	var metadataListLabel = document.createElement("SPAN");
    metadataListLabel.innerHTML = gs.text.de.visible_metadata; 
	var metadataList = document.createElement("SELECT");
	metadataList.setAttribute("id", "metadataSetList");
	metadataList.onchange = onVisibleMetadataSetChange;
	var allMetadataOption = document.createElement("OPTION");
	metadataList.appendChild(allMetadataOption);
    allMetadataOption.innerHTML = gs.text.de.all_metadata; 
	metadataListCell.appendChild(metadataListLabel);
	metadataListCell.appendChild(metadataList);

	metadataListCell.setAttribute("class", "headerTableTD");
	newDocCell.setAttribute("class", "headerTableTD");
	newSecCell.setAttribute("class", "headerTableTD");
	undoCell.setAttribute("class", "headerTableTD");
	saveCell.setAttribute("class", "headerTableTD");
	
	headerTable.appendChild(tableBody);
	tableBody.appendChild(row);
	row.appendChild(saveCell);
	row.appendChild(undoCell);
	row.appendChild(newDocCell);
	row.appendChild(newSecCell);
	row.appendChild(metadataListCell);

	//The "Save changes" button
	var saveButton = document.createElement("BUTTON");
	saveButton.innerHTML = gs.text.de.save_changes;
	saveButton.setAttribute("onclick", "saveAndRebuild();");
	saveButton.setAttribute("id", "saveButton");
	saveCell.appendChild(saveButton);
	
	//The "Undo" button
	var undoButton = document.createElement("BUTTON");
    undoButton.innerHTML = gs.text.dse.undo; 
	undoButton.setAttribute("onclick", "undo();");
	undoCell.appendChild(undoButton);

	//The "Create new document" button
	var newDocButton = document.createElement("BUTTON");
	newDocButton.innerHTML = gs.text.dse.create_new_document;
	newDocButton.setAttribute("onclick", "createNewDocumentArea();");
	newDocButton.setAttribute("id", "createNewDocumentButton");
	newDocCell.appendChild(newDocButton);

	//The "Insert new section" LI
	var newSecLI = createDraggableNewSection(newSecCell);
	
	return headerTable;
}

function getMetadataFromNode(node, name)
{
	var currentNode = node.firstChild;
	while(currentNode != null)
	{
		if(currentNode.nodeName == "metadataList")
		{
			currentNode = currentNode.firstChild;
			break;
		}
		
		currentNode = currentNode.nextSibling;
	}
	
	while(currentNode != null)
	{
		if(currentNode.nodeName == "metadata" && currentNode.getAttribute("name") == name)
		{
			return currentNode.firstChild.nodeValue;
		}
		
		currentNode = currentNode.nextSibling;
	}
	return "";
}

function storeMetadata(node, listItem)
{
	listItem.metadata = new Array();
	
	var currentNode = node.firstChild;
	while(currentNode != null)
	{
		if(currentNode.nodeName == "metadataList")
		{
			currentNode = currentNode.firstChild;
			break;
		}
		
		currentNode = currentNode.nextSibling;
	}
	
	while(currentNode != null)
	{
		if(currentNode.nodeName == "metadata")
		{
			listItem.metadata[currentNode.getAttribute("name")] = currentNode.firstChild.nodeValue;
		}
		
		currentNode = currentNode.nextSibling;
	}
}

function getNodeContent(node)
{
	var currentNode = node.firstChild;
	while(currentNode != null)
	{
		if(currentNode.nodeName == "nodeContent")
		{
			return currentNode.firstChild;
		}
		
		currentNode = currentNode.nextSibling;
	}
	return null;
}

function containsDocumentNode(node)
{
	var currentNode = node.firstChild;
	while(currentNode != null)
	{
		if(currentNode.nodeName == "documentNode")
		{
			return true;
		}
		
		currentNode = currentNode.nextSibling;
	}
	return false;
}

function isExpanded(textDiv)
{
	if(typeof textDiv.style == "undefined" || typeof textDiv.style.display == "undefined" || textDiv.style.display == "block")
	{
		return true;
	}
	return false;
}

function toggleTextDiv(section)
{
	var textDiv = section.textDiv;
	if(textDiv)
	{
		if(isExpanded(textDiv))
		{
			textDiv.style.display = "none";
			section.menu.editTextLink.innerHTML = gs.text.dse.edit;
		}
		else
		{
			textDiv.style.display = "block";
			section.menu.editTextLink.innerHTML = gs.text.dse.hide;
		}
	}
}

function updateFromTop()
{
	updateRecursive(document.getElementById("dbDiv"), null, null, 0);
}

function insertAfter(elem, refElem)
{
	if(refElem.nextSibling)
	{
		refElem.parentNode.insertBefore(elem, refElem.nextSibling);
	}
	else
	{
		refElem.parentNode.appendChild(elem);
	}
}

function removeFromParent(elem)
{
	elem.parentNode.removeChild(elem);
}

function createSectionTitle(text)
{
	var textSpan = document.createElement("SPAN");
	if(text)
	{
		textSpan.appendChild(document.createTextNode(" " + text + " "));
	}
	else
	{
		textSpan.appendChild(document.createTextNode(" [" + gs.text.dse.untitled_section + "] "));
	}
	return textSpan;
}

function setMouseOverAndOutFunctions(section)
{
	//Colour the list item and display the menu on mouse over
	section.onmouseover = function(e)
	{
		if(this.menu){this.menu.style.display = "inline";}
		this.style.background = "rgb(255, 200, 0)";
	};
	//Uncolour the list item and hide the menu on mouse out
	section.onmouseout = function(e)
	{
		if(this.menu){this.menu.style.display = "none";}
		this.style.background = "none";
	};
}

function createDraggableNewSection(parent)
{
	var newSecLI = document.createElement("LI");
	var newSpan = document.createElement("SPAN");
	newSpan.innerHTML = gs.text.dse.insert_new_section + " ";
	
	newSecLI.sectionTitle = newSpan;
	newSecLI.appendChild(newSpan);
	newSecLI.setAttribute("class", "dragItem newSection");
	newSecLI.newSection = true;
	newSecLI.parent = parent;
	newSecLI.index = -1;
	new YAHOO.example.DDList(newSecLI);
	parent.appendChild(newSecLI);
}

function closeAllOpenContents()
{
	for(var i = 0; i < _allContents.length; i++)
	{
		if(isExpanded(_allContents[i].textDiv))
		{
			toggleTextDiv(_allContents[i]);
		}
	}
	DDM.refreshCache();
}

//Status Bar class (initialised with new StatusBar(elem);)
function StatusBar(mainElem)
{
	var _statusMap = new Array();
	var _statusIDCounter = 0;
	var _mainElem = mainElem;
	var _activeMessages = 0;
	
	_mainElem.style.display = "none";
	
	this.addStatus = function(newStatus)
	{
		_mainElem.style.display = "block";
		var newStatusDiv = document.createElement("DIV");
		var newStatusSpan = document.createElement("SPAN");
		
		var workingImage = document.createElement("IMG"); 
		workingImage.setAttribute("src", gs.imageURLs.loading);
		workingImage.setAttribute("height", "16px");
		workingImage.setAttribute("width", "16px");
		newStatusDiv.appendChild(workingImage);
		
		newStatusDiv.appendChild(newStatusSpan);
		newStatusSpan.innerHTML = " " + newStatus;
		newStatusDiv.setAttribute("class", "statusMessage");		
		newStatusDiv.span = newStatusSpan;
		
		_mainElem.appendChild(newStatusDiv);
		_statusMap["status" + _statusIDCounter] = newStatusDiv;
		_activeMessages++;
		return _statusIDCounter++;
	}
	
	this.changeStatus = function(id, newStatus)
	{
		if(_statusMap["status" + id])
		{
			_statusMap["status" + id].span.innerHTML = " " + newStatus;
		}
	}
	
	this.removeStatus = function(id)
	{
		if(_statusMap["status" + id])
		{
			removeFromParent(_statusMap["status" + id]);
			
			if(--_activeMessages == 0)
			{
				_mainElem.style.display = "none";
			}
		}
	}
	
	this.clear = function()
	{
		for(var p in _statusMap)
		{
			if(_statusMap.hasOwnProperty(p))
			{
				if(_statusMap[p] && _statusMap[p].parentNode)
				{
					removeFromParent(_statusMap[p]);
				}
			
				if(--_activeMessages == 0)
				{
					_mainElem.style.display = "none";
				}
			}
		}
	}
}

/*
function toggleEdit(e)
{
	var mousePos = de.events.getXYInWindowFromEvent(e);
	var cDesc = de.cursor.getCursorDescAtXY(mousePos.x, mousePos.y, de.events.getEventTarget(e));
	de.cursor.setCursor(cDesc);
}
*/


$( document ).ready(function() {
    // DOM Ready.
	
	// Now can add handlers to monitor when ckeditor instances are all ready
	// See https://stackoverflow.com/questions/18461206/how-to-retrieve-the-ckeditor-status-ready
	// (and https://stackoverflow.com/questions/3447803/how-to-determine-if-ckeditor-is-loaded )
	if(gs.cgiParams.docEdit == "1") { // CKEDITOR only exists in docEdit mode
	
		//CKEDITOR.on( 'loaded', function( evt ) { // not triggered
			//console.log("*** CKEDITOR loaded");
			
			CKEDITOR.on( 'instanceReady', function( evt ) {
				//console.log("*** CKEDITOR instanceReady", evt);
				addCKEEditableState(evt,editableInitStates);
				// finished initialising one more editable element,
				// so decrement the counter keeping track of how many elements still need initialising
				editableElementsInitialisationProgress--;
			} );
		//} );
	}
	
});



