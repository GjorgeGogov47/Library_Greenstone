// The default link type in the basket - "document" = greenstone version of the document, "source" = link to source file eg pdf.
var default_link_type = "document"; // "source" or "document"
// use the appropriate one of these to override the default for particular collections.
var source_link_collections = new Array(); // or add list of collections like ["pdfberry", "mgppdemo"];
var document_link_collections = new Array(); // or add list of collections as above.
//these are the default metadata items used by  berry baskets.
var default_metas = ["Title", "root_Title", "root_assocfilepath", "root_srclinkFile", "name", "collection", "Date"];

var docList = new Array();
var urlonly = false;
var mailinfo = new Array();
mailinfo['address'] = gs.text.berry.to; 
mailinfo['cc'] = gs.text.berry.cc; 
mailinfo['bcc'] = gs.text.berry.bcc; 
mailinfo['subject'] = gs.text.berry.subject; 
var textwin;
var mailwin;

var options = ['fullview', 'textview', 'email'];

function toggleSelectAll(selAllCheckbox) {
    // https://stackoverflow.com/questions/386281/how-to-implement-select-all-check-box-in-html
    var allBerriesCheckboxList = document.getElementsByName('select-berry-checkbox');
    for (var i = 0; i < allBerriesCheckboxList.length; i++) {
	// if the selectAllCheckbox is checked, then all the berries' checkboxes will get checked
	// And vice-versa.
	allBerriesCheckboxList[i].checked = selAllCheckbox.checked;
    }
}

function deleteSelected() {
    
    if(docList.length == 0) return; // no berries on page, nothing to delete

    // https://stackoverflow.com/questions/590018/getting-all-selected-checkboxes-in-an-array
    // https://www.w3schools.com/jsref/met_document_queryselectorall.asp
    // https://www.w3schools.com/cssref/css_selectors.asp
    var selectedList = document.querySelectorAll('input[name=select-berry-checkbox]:checked');
    if(selectedList.length == 0) return; // nothing selected, so nothing to delete

    // if all berries selected for deletion, can optimise
    if(selectedList.length === docList.length) {
	deleteAll();
	return; // done!
    }
    
    // otherwise selected list of berries is a proper subset of total berries (berries in docList)    
    var idsToDelete = [];

    // construct the deletion url by concatenating the ids with | which is %7C in URL-encoded form
    var  delurl = delurlPath; // var delurlPath is declared in ygDDPlayer.js.
    
    for(var i = 0; i < selectedList.length; i++) {
	selected_id = selectedList[i].id;
	// Format of checkbox id: "<docid>-checkbox"
	var end = selected_id.indexOf("-checkbox");
	var doc_id = selected_id.substring(0, end);

	idsToDelete[i] = doc_id;

	// Now just need to append each doc_id to the deletion URL separated by |,
	// but this character needs to be URL encoded, else the delete doesn't work.
	if((i+1) == selectedList.length) { // if it's the last id to process, don't append separator
	    delurl += doc_id;
	} else { // there's more ids to process, so append separator
	    delurl += doc_id + "%7C"; // url-encoded version of |
	}
	
    }

    var delAll = false;
    doDelete(delAll, delurl, selectedList, idsToDelete);
}

function deleteAll() {

    if(docList.length == 0) return; // nothing to delete
    
    var  delurl = delurlPath; // var delurlPath is declared in ygDDPlayer.js.
    // Just need to append each doc id separated by |, but this character needs to be URL encoded,
    // else the delete doesn't work.

    for(var i = 0; i < docList.length; i++) {
	var doc = docList[i];
	var doc_id = doc['collection']+":"+ doc['name'];

	if((i+1) == docList.length) { // if it's the last id to process, don't append separator
	    delurl += doc_id;
	} else { // there's more ids to process, so append separator (in URL encoded form!)
	    delurl += doc_id + "%7C"; // url-encoded version of |
	}
    }
    
    var delAll = true;
    doDelete(delAll, delurl, null, null);
}


function doDelete(deleteAll, delurl, selectedList, idsToDelete) { // given list of selected checkboxes

    // The following is a modified version of methods internal to
    // ygDDPlayer.js's ygDDPlayer.prototype.onDragDrop
    var delSuccess = function(o) {
	var result = o.responseXML;
	
	if(!deleteAll) { // then we're given a selection to delete: Not deleting all berries, just a subset
	    // Remove id of selected doc to be deleted from docList.	    
	    // Minor optimisation to double for loop, dependent on ordering of selected berries being
	    // in order of checkboxes (i.e. order of docList ids), and order of docList ids having
	    // the same order as the checkboxes
	    var searchForNextSelectedIdFromIndex = idsToDelete.length-1;
	    for (var i = docList.length - 1; i >= 0; i--) {
		var berry = docList[i];
		var berry_id = berry['collection'] + ":" + berry['name'];
		
		for(var j = searchForNextSelectedIdFromIndex; j >= 0; j--) {
		    if(idsToDelete[j] == berry_id) {
			docList.splice(i, 1); // i indexes into docList, delete element i from docList
			searchForNextSelectedIdFromIndex = j-1;
			break;
		    }
		}
	    }
	    
	    // remove the selected documents' HTML display elements
	    var berryDocsList = YAHOO.util.Dom.get('berryDocsList'); // ordered list item containing the berries	
	    for(var i = 0; i < selectedList.length; i++) {
		var li = selectedList[i].parentNode; // list item parent of checkbox
		// remove the list item from its containing orderedList		
		berryDocsList.removeChild(li);
	    }
	}
    

	// if all docs are deleted by this stage, then display "berry basket is empty" message
	if (deleteAll || !berryDocsList.hasChildNodes()) { // 2nd clause no longer needed?, then this just becomes an else against the first if(!deleteAll) test
	    
	    // if deleting all docs, just use the easy way to empty the docList array
	    docList.length = 0; // https://www.jstips.co/en/javascript/two-ways-to-empty-an-array/

	    // Removing all child nodes (done one at a time) is more optimal
	    // than setting innerHTML to empty string, see
	    // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
	    var content =  YAHOO.util.Dom.get('berryBasketContent');
	    while (content.hasChildNodes()) {
		content.removeChild(content.firstChild);
	    }  
	    content.appendChild(document.createTextNode('Your berry basket is empty.'));
	
	    var trashbin =  YAHOO.util.Dom.get('trashbin');
	    if ( trashbin !=null){
		trashbin.style.background = 'url("interfaces/default/images/trash-full.png") 0 0 no-repeat';
	    }
	}

	// Ensure the select-all, delete-all and delete-selected checkboxes are deselected
	YAHOO.util.Dom.get('select-all-checkbox').checked = false; 
	YAHOO.util.Dom.get('delete-selected-checkbox').checked = false;
	YAHOO.util.Dom.get('delete-all-checkbox').checked = false; 
    }

    var delFailure = function(o){ alert("Deletion failed" + o);}
    
    var delcallback = {
	success:delSuccess,
	failure:delFailure,  
	argument:null // supposed to be the ygDDPlayer object, but don't have a ref to it here, so trying null
    }

    // Finally send the actual delete request
    // request_type defaults to GET, which is what's used for add and del, see ygDDPlayer.js.
    YAHOO.util.Connect.asyncRequest(request_type, delurl , delcallback);
}

function navigate(e){
	
	var target = this;

	if ( target.id.toLowerCase() == '' ) {
		target = target.parentNode;
	}

	if (target.id.toLowerCase() == 'fullview'){
		berryCheckoutHighlight( 'fullview' );
		showFullView();
	}

	if (target.id.toLowerCase() == 'textview'){
		berryCheckoutHighlight( 'textview' );
		showTextView();
	}

	if (target.id.toLowerCase() == 'email'){
		berryCheckoutHighlight( 'email' );
		showEmail();
	}

	if (target.id.toLowerCase() == 'sendmail'){
		sendMail();
	}

	if (target.id.toLowerCase() == 'urlcheck' && urlonly){
		var urlcheck = YAHOO.util.Dom.get('urlcheck');
		urlcheck.src = 'interfaces/default/images/check3.gif';
		var parea =YAHOO.util.Dom.get('pretextarea');
		urlonly = false;
		
	    this.value=gs.text.berry.url_only; 
		
		populateUrlsAndMetadata(parea);
		return;
	}

	if (target.id.toLowerCase() == 'urlcheck' && !urlonly ){
		var urlcheck = YAHOO.util.Dom.get('urlcheck');
		urlcheck.src = 'interfaces/default/images/check4.gif';
		var parea =YAHOO.util.Dom.get('pretextarea');
		populateUrls(parea);
		urlonly = true;
		
	    this.value=gs.text.berry.url_and_metadata; 
		
		return;
	}

	if (target.id.toLowerCase() == 'extextview' ){
		if (textwin != null){
			textwin.close();
		}

		textwin = window.open("","Berry basket plain text view","status=1,width=450,height=300");
		textwin.moveTo(0,0);
		var content = document.createElement('div');
		buildPreview(content);
		var body = textwin.document.getElementsByTagName('body')[0]; 
		body.appendChild(content);
		var prearea = textwin.document.getElementsByTagName('textarea')[0];
		prearea.cols = '55';
		prearea.rows = '15';
	}

	if (target.id.toLowerCase() == 'exemail' ){
		if (mailwin != null){
			mailwin.close();
		}
		mailwin = window.open("","Berry basket mail to a friend","status=1,width=450,height=350");
		mailwin.moveTo(0,0);
		var content = document.createElement('div');
		getEmailContent(content);
		var body = mailwin.document.getElementsByTagName('body')[0];
		body.appendChild(content);
		var prearea = mailwin.document.getElementsByTagName('textarea')[0];
		prearea.cols = '50';
		prearea.rows = '11';
	}
}

function pageLoad(){
	for(var j = 0; j < options.length; j++)
	{
		var ele = document.getElementById(options[j]);
		YAHOO.util.Event.addListener(ele, 'click', navigate);
	}
	
	showFullView();
}

function showFullView(){

	var content =  YAHOO.util.Dom.get('berryBasketContent');
	var fullview =  YAHOO.util.Dom.get('fullview');
	berryCheckoutPageClear();

	if (docList.length == 0){
	    content.appendChild(document.createTextNode(gs.text.berry.empty_basket));
		return;
	}

	var trashbin = document.createElement('div');
	trashbin.id ='trashbin';

	var binhandle = document.createElement('div');
	binhandle.id = 'binhandle';
	binhandle.appendChild(document.createElement('span'));
	trashbin.appendChild(binhandle);
	content.appendChild(trashbin);

	var dd = new ygDDOnTop('trashbin');
	dd.setHandleElId('binhandle');
	new YAHOO.util.DDTarget('trashbin','trash');

	var dlist = document.createElement('div');
	content.appendChild(dlist);
	var ol = document.createElement('ol');
	dlist.appendChild(ol);

	ol.setAttribute("id", "berryDocsList");
    
	for (var i in docList){
		var doc = docList[i];
		var li = document.createElement('li');
		var img = document.createElement('img');
		var text ="";

		var doc_id = doc['collection']+":"+ doc['name'];	    
	    
		img.setAttribute("src", "interfaces/default/images/berry.png");
		img.setAttribute("id", doc_id);
		img.setAttribute("height", "15px");
		img.setAttribute("width", "15px");
		li.appendChild(img);

		generateDocDisplay(li, doc, doc_id)
		li.className = 'berrydoc';
		ol.appendChild(li);
		new ygDDPlayer(img.id,'trash',docList);
	}

}

function generateDocDisplay(li, doc, doc_id) {
    var checkbox = document.createElement('input');
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("id", doc_id+"-checkbox");
    checkbox.setAttribute("name", "select-berry-checkbox");
    checkbox.setAttribute("value", "select-"+doc_id);
    
    var a = document.createElement('a');
    var text="";
    a.href=generateURL(doc);
    a.appendChild(document.createTextNode(doc['Title'])); 

    if (doc['root_Title']){
	li.appendChild(document.createTextNode(doc['root_Title']+": ")); 
    }
    li.appendChild(checkbox);
    li.appendChild(a);
    li.appendChild(document.createTextNode(" ("+doc['collection']+")"));
    var metadata = "";
    for (var metaItem in doc) {
	if ( !default_metas.includes(metaItem)){
	    metadata += " "+metaItem+": "+ doc[metaItem]+" ";
	}
    }
    text +=metadata;
    li.appendChild(document.createTextNode(text));

}
 
function showTextView(){

	var content = YAHOO.util.Dom.get('berryBasketContent');
	var textview = YAHOO.util.Dom.get('textview');

	berryCheckoutPageClear();
	if (docList.length == 0){
	    content.appendChild(document.createTextNode(gs.text.berry.empty_basket)); 
		return;
	}
	buildPreview(content);

}

function getEmailContent(content){
	var item ;
	var tr;
	var td;
	var input;

	table = document.createElement('table');
	table.setAttribute("class","mailtable");

	for (item in mailinfo){
		tr = document.createElement('tr');
		td = document.createElement('td');
		td.setAttribute("class","mailitem");
		td.appendChild(document.createTextNode(mailinfo[item]));
		tr.appendChild(td);
		td = document.createElement('td');
		input = document.createElement('input');
		input.setAttribute("id", item);
		input.setAttribute("class", "mailinput");
		if(item === "address") {
		    input.setAttribute("type", "email"); // https://html5-tutorial.net/form-validation/validating-email/
		    input.required = true; // https://stackoverflow.com/questions/18770369/how-to-set-html5-required-attribute-in-javascript
		} else {
		    input.setAttribute("type", "text");
		}
		td.appendChild(input);
		tr.appendChild(td);
		table.appendChild(tr);
	}

	// an empty line
	tr = document.createElement('tr');
	td = document.createElement('td');
	td.appendChild(document.createElement('br'));
	tr.appendChild(td);
	table.appendChild(tr);

	content.appendChild(table);

	buildPreview(content);

	//send button
	input = document.createElement('input');
	input.setAttribute("id", 'sendmail');
	input.setAttribute("class", "sendbutton");
	input.setAttribute("type", "button");
	input.setAttribute("value", gs.text.berry.send);
	content.appendChild(input);
}

function showEmail(){
	var content = YAHOO.util.Dom.get('berryBasketContent');
	var email = YAHOO.util.Dom.get('email');

	berryCheckoutPageClear();

	if (docList.length == 0){
	    content.appendChild(document.createTextNode(gs.text.berry.empty_basket));
		return;
	}

	var item;
	var tr;
	var td;
	var input;

	table = document.createElement('table');
	table.setAttribute("class","mailtable");

	for (item in mailinfo){
		tr = document.createElement('tr');
		td = document.createElement('td');
		td.setAttribute("class","mailitem");
		td.appendChild(document.createTextNode(mailinfo[item]));
		tr.appendChild(td);

		td = document.createElement('td');
		input = document.createElement('input');
		input.setAttribute("id", item);
		input.setAttribute("class", "mailinput");
		if(item === "address") {
		    input.setAttribute("type", "email"); // https://html5-tutorial.net/form-validation/validating-email/
		    input.required = true; // https://stackoverflow.com/questions/18770369/how-to-set-html5-required-attribute-in-javascript
		} else {
		    input.setAttribute("type", "text");
		}
		td.appendChild(input);
		tr.appendChild(td);
		table.appendChild(tr);

	}

	// an empty line
	tr = document.createElement('tr');
	td = document.createElement('td');
	td.appendChild(document.createElement('br'));
	tr.appendChild(td);
	table.appendChild(tr);

	content.appendChild(table);

	buildPreview(content);

	//send button
	input = document.createElement('input');
	input.setAttribute("id", 'sendmail');
	input.setAttribute("class", "sendbutton");
	input.setAttribute("type", "button");
	input.setAttribute("value", gs.text.berry.send);
	content.appendChild(input);
	
	YAHOO.util.Event.addListener(input, 'click', navigate);
}

function buildPreview(parent){

	var div = document.createElement('div');
	var cb = document.createElement('input');
	cb.setAttribute('class', 'sendbutton');
	cb.type = 'button';
	cb.id = 'urlcheck';
	if (urlonly)
	{
	    cb.value=gs.text.berry.url_and_metadata; 
	}
	else
	{
	    cb.value=gs.text.berry.url_only;
	}

	YAHOO.util.Event.addListener(cb, 'click', navigate);
	
	var img = document.createElement('img');
	img.src = 'interfaces/default/images/check3.gif';
	img.id = 'urlcheck';
	div.appendChild(cb);
	//div.appendChild(img);

	var urls = document.createElement('span');
	urls.id = 'urls';
	urls.className = 'berrycheck';
	//urls.appendChild(document.createTextNode('URL only'));
	div.appendChild(urls);

	// var urlsmetadata = document.createElement('span');
	// urlsmetadata.id = 'urlsmetadata'
	// urlsmetadata.className = 'berryradio';
	// urlsmetadata.appendChild(document.createTextNode('URLs and Metadata'));
	// div.appendChild(urlsmetadata);

	parent.appendChild(div);

	var parea = document.createElement('textarea');
	parea.id = 'pretextarea';
	parea.required = true; // https://www.w3schools.com/tags/att_textarea_required.asp
            // and https://stackoverflow.com/questions/18770369/how-to-set-html5-required-attribute-in-javascript
    
	parent.appendChild(parea);

	if(urlonly)
	{
		populateUrls(parea);
	}
	else
	{
		populateUrlsAndMetadata(parea);
	}
}

function getDefaultLinkType(collection) {
    var link_type; 
    if (document_link_collections.includes(collection)) {
	link_type = "document";
    } else if (source_link_collections.includes(collection)) {
	link_type = "source";
    }
    else {
	link_type = default_link_type;
	if (link_type != "source" && link_type != "document") {
	    link_type = "document"; //the default default
	}
    }
    return link_type;
}
   
function generateURL(doc) {

    var url;
    var doc_url = document.URL;
    var root_url = doc_url.substring(0,doc_url.indexOf('?'));

    var link_type = getDefaultLinkType(doc["collection"]);
    if (link_type == "document") {
	url = root_url+"/collection/"+doc["collection"]+"/document/"+doc["name"];
    } else if (link_type == "source") { 
	// remove library
	root_url = root_url.substring(0, root_url.lastIndexOf('/'));
	url = root_url+"/sites/"+gs.xsltParams.site_name+"/collect/"+doc['collection']+"/index/assoc/"+doc["root_assocfilepath"]+"/"+doc["root_srclinkFile"];
    }
    return url;
}


function populateUrls(parea){

	var urls="";
	for (var i in docList){
	    var doc = docList[i];
	    urls += generateURL(doc)+"\n\n";
	}

	parea.value = urls;

}

function populateUrlsAndMetadata(parea){

	var fulltext="";
	for (var i in docList){
	    var doc = docList[i];
	    var url = generateURL(doc)+"\n";

	    var metadata = "";
	    if (doc['Title']) {
		metadata += gs.text.berry.doc_title+": "+doc['Title']+"\n";
	    }
	    if (doc['root_Title']) {
		metadata += gs.text.berry.doc_root_title+": "+doc['root_Title']+"\n";

	    }
	    if (doc['name']) {
		metadata += gs.text.berry.doc_name+": "+doc['name']+"\n";
	    }
	    if (doc['collection']) {
		metadata += gs.text.berry.doc_collection+": "+doc['collection']+"\n";
	    }
	    if (doc['Date']) {
		metadata += gs.text.berry.doc_date+": "+doc['Date']+"\n";
	    }
	    // allow for inclusion of custom metadata
	    for (var m in doc) {
		if (!default_metas.includes(m)) {
		    metadata += m +":" + doc[m]+"\n";
		}
	    }
	    fulltext +=url+metadata+"\n";
	}

	parea.value = fulltext;

}

function sendMail(){
	var url = gs.xsltParams.library_name + "?a=pr&rt=r&ro=1&s=SendMail&c=";
	var request_type = "POST";
	var postdata = "";
	var i;

	var content = YAHOO.util.Dom.get('pretextarea').value;
    
    // To send an email, the To address and message Body must contain data.
    // HTML5 input checking (required attribute) would make empty fields red outlined,
    // but did not prevent Send button submitting form. So some basic sanity checking in JS:
    // Checking non-empty and to address field must further be a URL: checking it contains @
    var to_address = YAHOO.util.Dom.get('address').value;

    if(to_address.trim() === "") {
	alert(gs.text.berry.invalid_to_address_empty);
	return;
    } else if(to_address.indexOf('@') === -1) {
	alert(gs.text.berry.invalid_to_address);
	return;
    } else if(content.trim() === "") {
	alert(gs.text.berry.invalid_msg_body_empty);
	return;
    }
    
	//get checked items
	for (i in mailinfo) {
		var input = YAHOO.util.Dom.get(i);
		var value = input.value;
		postdata +="&s1."+i+"="+value;
	}


	content = content.replace(/&/g,'-------');
	postdata +="&s1.content="+content;

	var callback = {
		success: function(o) {
			var result = o.responseText;
		    alert(gs.text.berry.send_success); 
		} ,
		failure: function(o) {
		    alert(gs.text.berry.send_fail); 
		}
	}
	YAHOO.util.Connect.asyncRequest(request_type , url , callback, postdata);
}	

function berryCheckoutPageClear() {
	var bbc = document.getElementById('berryBasketContent');
	if ( bbc == null ) return;
	bbc.innerHTML = '';
}

function berryCheckoutHighlight( id ) {

	for ( var i=0; i<options.length; i++ ) {
		var option = document.getElementById( options[i] );
		if ( option != null ) {
			if ( id == options[i] ) {
				//YAHOO.util.Dom.addClass( option, 'current' );
				option.className='current';
			} else {
				//YAHOO.util.Dom.removeClass( option, 'current' );
				option.className='';
			}
		}
	}

	if ( option == null ) return;
	option.style.className = 'current';

}

YAHOO.util.Event.addListener(window,'load', pageLoad);


