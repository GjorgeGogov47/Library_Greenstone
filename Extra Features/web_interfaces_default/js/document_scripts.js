/** Javascript file for viewing documents */

/** NOTE, this file uses inline templates which look for httpPath, assocfilepath, Source, Thumb, Title metadata. These need to be added into any xsl file that uses this javascript (using <gsf:metadata name="xx" hidden="true"/> if they are not already being collected. */

var _imageZoomEnabled = false;
// Choose which types of filtering you want: sectionnum, or sectiontitle or both
var _filter_on_types = ["sectiontitle", "sectionnum"];

// are titles numeric match?
var _filter_title_numeric = false;

var _linkCellMap = new Array();
var _onCells = new Array();

var curHLNum = null;

/*Array to store init states of metadata fields and text*/
var editableInitStates = new Array();
/*Array to store last states of metadata fields and text*/
var editableLastStates = new Array();


/********************
* EXPANSION SCRIPTS *
********************/


function getTextForSection(sectionID, callback)
{
	if(!callback)
	{
		console.log("Cannot get text as the callback function is not defined");
	}

	var template = "";
	template += '<xsl:template match="/">';
	template +=   '<text>';
	template +=     '<xsl:for-each select="/page/pageResponse/document//documentNode[@nodeID = \'' + sectionID + '\']">';
	template +=       '<xsl:call-template name="sectionContent"/>';
	template +=     '</xsl:for-each>';
	template +=   '</text>';
	template += '</xsl:template>';
    
    template = makeURLComponentSafe(template);
    
	var hlCheckBox = document.getElementById("highlightOption");
	
	var hl = "";
	if(hlCheckBox)
	{
		if(hlCheckBox.checked)
		{
			hl = "on";
		}
		else
		{
			hl = "off";
		}
	}
	
    var url = gs.xsltParams.library_name + "/collection/" + gs.cgiParams.c + "/document/" + sectionID + "?ed=1&hl=" + hl + "&ilt=" + template;
    if (gs.cgiParams.p_s && gs.cgiParams.p_s.length > 0) {
	url += "&p.s=" + gs.cgiParams.p_s;
    }
    if (gs.cgiParams.ck && gs.cgiParams.ck.length > 0) {
	url += "&ck=" + gs.cgiParams.ck;
    }
     
    
	
	$.ajax(url)
	.success(function(response)
	{
		if(response)
		{
			var textStart = response.indexOf(">", response.indexOf(">") + 1) + 1;
			var textEnd = response.lastIndexOf("<");
			
			if(textStart == 0 || textEnd == -1 || textEnd <= textStart)
			{
				callback("");
			}
			
			var text = response.substring(textStart, textEnd);
			callback(text);
		}
		else
		{
			callback(null);
		}
	})
	.error(function()
	{
		callback(null);
	});
}

function getSubSectionsForSection(sectionID, callback)
{
	if(!callback)
	{
		console.log("Cannot get sub sections as the callback function is not defined");
	}

	var template = "";
	template += '<xsl:template match="/">';
	template +=   '<sections>';
	template +=     '<xsl:for-each select="/page/pageResponse/document//documentNode[@nodeID = \'' + sectionID + '\']/documentNode">';
	template +=       '<xsl:call-template name="wrapDocumentNodes"/>';
	template +=     '</xsl:for-each>';
	template +=   '</sections>';
	template += '</xsl:template>';

    template = makeURLComponentSafe(template);
	var url = gs.xsltParams.library_name + "/collection/" + gs.cgiParams.c + "/document/" + sectionID + "?ilt=" + template;

       if(gs.documentMetadata.docType == "paged")
	{
		url += "&dt=hierarchy";
	}
	
	$.ajax(url)
	.success(function(response)
	{
		if(response)
		{
			var sectionsStart = response.indexOf(">", response.indexOf(">") + 1) + 1;
			var sectionsEnd = response.lastIndexOf("<");
			
			if(sectionsStart == 0 || sectionsEnd == -1 || sectionsEnd <= sectionsStart)
			{
				callback(" ");
				return;
			}
			
			var sections = response.substring(sectionsStart, sectionsEnd);
			callback(sections);
		}
		else
		{
			callback(null);
		}
	})
	.error(function()
	{
		callback(null);
	});
}

function toggleSection(sectionID, callback, tocDisabled)
{
	var docElem = gs.jqGet("doc" + sectionID);
	var tocElem = gs.jqGet("toc" + sectionID);
	
	var tocToggleElem = gs.jqGet("ttoggle" + sectionID);
	var docToggleElem = gs.jqGet("dtoggle" + sectionID);
	
	if(docElem.css("display") == "none")
	{
		if(tocToggleElem.length && !tocDisabled)
		{
			tocToggleElem.attr("src", gs.imageURLs.collapse);
		}
		
		if(tocElem.length && !tocDisabled)
		{
			tocElem.css("display", "block");
		}
		
		if(docElem.hasClass("noText"))
		{
			getTextForSection(sectionID, function(text)
			{
				if(text)
				{	
					var nodeID = sectionID.replace(/\./g, "_");
					if(text.search("wrap" + nodeID) != -1)
					{
						$("#zoomOptions").css("display", "");
						$("#pagedImageOptions").css("display", "");
					}
					getSubSectionsForSection(sectionID, function(sections)
					{					
						if(sections)
						{
							var textElem = gs.jqGet("doc" + sectionID);
							textElem.html(text + sections);
							
							docElem.removeClass("noText");
							docElem.css("display", "block");
							docToggleElem.attr("src", gs.imageURLs.collapse);
							
							if(callback)
							{
								callback(true);
							}
							
							if(gs.jqGet("viewSelection").length)
							{
								changeView();
							}
						}
						else
						{
							docToggleElem.attr("src", gs.imageURLs.expand);
							if(callback)
							{
								callback(false);
							}
						}
					});
				}
				else
				{
					docToggleElem.attr("src", gs.imageURLs.expand);
					if(callback)
					{
						callback(false);
					}
				}
			});
		
			docToggleElem.attr("src", gs.imageURLs.loading);
		}
		else
		{
			docToggleElem.attr("src", gs.imageURLs.collapse);
			docElem.css("display", "block");
			
			if(callback)
			{
				callback(true);
			}
		}
	}
	else
	{
		docElem.css("display", "none");
		
		//Use the page image if this is a leaf node and the chapter image if it not
		docToggleElem.attr("src", gs.imageURLs.expand);
		
		if(tocToggleElem.length)
		{
			tocToggleElem.attr("src", gs.imageURLs.expand);
		}
		
		if(tocElem.length)
		{
			tocElem.css("display", "none");
		}
		
		if(callback)
		{
			callback(true);
		}
	}
}

function scrollToTop()
{
	$('html, body').stop().animate({scrollTop: 0}, 1000);
}

function scrollNextHightlight()
{
    if (curHLNum == null)
    {
        curHLNum = 0;
    } else 
    {
        curHLNum++;
    }
    var hlNode = $("span[class$='ermHighlight']:eq(" + curHLNum + ")");
    if (hlNode.length == 0)
    {
        curHLNum = 0;
        hlNode = $("span[class$='ermHighlight']:eq(" + curHLNum + ")");
    }
    if (hlNode.length != 0)
    {
        var topVal = $(hlNode).offset().top - 50;
        $('html, body').stop().animate({scrollTop: topVal}, 1000);
    }
}

function scrollPrevHightlight()
{
    if (curHLNum == null)
    {
        curHLNum = $("span[class$='ermHighlight']").length - 1;
    } else 
    {
        curHLNum--;
    }
    var hlNode = $("span[class$='ermHighlight']:eq(" + curHLNum + ")");
    if (hlNode.length == 0)
    {
        curHLNum = $("span[class$='ermHighlight']").length - 1;
        hlNode = $("span[class$='ermHighlight']:eq(" + curHLNum + ")");
    }
    if (hlNode.length != 0)
    {
        var topVal = $(hlNode).offset().top - 50;
        $('html, body').stop().animate({scrollTop: topVal}, 1000);
    }
}

function focusSection(sectionID, level, tocDisabled)
{
	expandAndExecute(sectionID, level, tocDisabled, function()
			{
				var topVal = $(document.getElementById("doc" + sectionID)).offset().top - 50;
				$('html, body').stop().animate({scrollTop: topVal}, 1000);
			});
}
function focusAnchor(sectionID, level, tocDisabled, anchor)
{
	expandAndExecute(sectionID, level, tocDisabled, function()
		{
			var target = document.getElementById(anchor);
			if (!target){
				target = document.getElementsByName(anchor)[0];
			}
			var topVal = $(target).offset().top - 50;
			$('html, body').stop().animate({scrollTop: topVal}, 1000);
			window.location.hash = anchor;
		});
}
function expandAndExecute(sectionID, level, tocDisabled, executeAfter)
{
	if(!level)
	{
		level = 0;
	}
	var parts = sectionID.split(".");
	if(level >= parts.length)
        {
	   if (executeAfter) {
	       executeAfter();
	   }
		document.getElementById("gs_content").style.cursor = "default";
		return;
	}
	
	var idToExpand = "";
	for(var i = 0; i < level + 1; i++)
	{
		if(i > 0)
		{
			idToExpand += ".";
		}
	
		idToExpand += parts[i];
	}
	
	if(!isSectionExpanded(idToExpand))
	{
		document.getElementById("gs_content").style.cursor = "progress";
		toggleSection(idToExpand, function(success)
		{
			if(success)
			{
				expandAndExecute(sectionID, level + 1, tocDisabled, executeAfter);
			}
		}, tocDisabled);
	}
	else
	{
		expandAndExecute(sectionID, level + 1, tocDisabled, executeAfter);
	}
}
function expandOrCollapseAll(expand)
{
	var divs = $("div");
	var startCounter = 0;
	var endCounter = 0;
	
	for(var i = 0; i < divs.length; i++)
	{
		if($(divs[i]).attr("id") && $(divs[i]).attr("id").search(/^doc/) != -1)
		{
			var id = $(divs[i]).attr("id").replace(/^doc(.*)/, "$1");
			if(isSectionExpanded(id) != expand)
			{
				//Don't collapse the top level
				if(!expand && id.indexOf(".") == -1)
				{
					continue;
				}
				startCounter++;

				var toggleFunction = function(tid)
				{
					toggleSection(tid, function(success)
					{
						if(success)
						{
							endCounter++;
						}
						else
						{
							setTimeout(function(){toggleFunction(tid)}, 500);
						}
					});
				}
				toggleFunction(id);
			}
		}
	}
	
	if(startCounter != 0)
	{
		var checkFunction = function()
		{
			if(startCounter == endCounter)
			{
				expandOrCollapseAll(expand);
			}
			else
			{
				setTimeout(checkFunction, 500);
			}
		}
		checkFunction();
	}
}

function loadTopLevelPage(callbackFunction, customURL)
{
	var url;
	if(customURL)
	{
		url = customURL;
	}
	else
	{
		url = gs.xsltParams.library_name + "?a=d&c=" + gs.cgiParams.c + "&excerptid=gs-document";
		if(gs.cgiParams.d && gs.cgiParams.d.length > 0)
		{
			url += "&d=" + gs.cgiParams.d.replace(/([^.]*)\..*/, "$1");
		}
		else if(gs.cgiParams.href && gs.cgiParams.href.length > 0)
		{
			url += "&d=&alb=1&rl=1&href=" + gs.cgiParams.href;
		}
	}

	$.ajax(url)
	.success(function(response)
	{
		if(response)
		{
			var targetElem = $("#gs-document");
			var docStart = response.indexOf(">") + 1;
			var docEnd = response.lastIndexOf("<");
			var doc = response.substring(docStart, docEnd);

			targetElem.html(doc);
			
			if(callbackFunction)
			{
				callbackFunction();
			}
		}
	})
	.error(function()
	{
		setTimeout(function(){loadTopLevelPage(callbackFunction, customURL);}, 1000);
	});
}

function retrieveFullTableOfContentsSuccess(newTOCElem)
{
    var tocStart = newTOCElem.indexOf(">") + 1;
    var tocEnd = newTOCElem.lastIndexOf("<");
    
    var newTOC = newTOCElem.substring(tocStart, tocEnd);
    
    //Add the "Expand document"/"Collapse document" links
    //newTOC = "<table style=\"width:100%; text-align:center;\"><tr><td><a href=\"javascript:expandOrCollapseAll(true);\">"+gs.text.doc.expand_doc+"</a></td><td><a href=\"javascript:expandOrCollapseAll(false);\">"+gs.text.doc.collapse_doc+"</a></td></tr></table>" + newTOC;
    //newTOC = "<table style=\"width:100%; text-align:center;\"><tr><td><a href=\""+window.location.href+"?ed=1\">"+gs.text.doc.expand_doc+"</a></td><td><a href=\""+window.location.href+"?ed=0\">"+gs.text.doc.collapse_doc+"</a></td></tr></table>" + newTOC;
    
    //Collapse the TOC
    newTOC = newTOC.replace(/display:block/g, "display:none");
    newTOC = newTOC.replace(/display:none/, "display:block");
    newTOC = newTOC.replace(/images\/collapse/g, "images/expand");
    
    var tocElem = $("#tableOfContents");
    tocElem.html(newTOC);
    
    gs.variables.tocLoaded = true;
}

function retrieveFullTableOfContentsSuccessClientSideXSLT(newTOCElem)
{
    $('#client-side-xslt-ajax').remove();
    retrieveFullTableOfContentsSuccess(newTOCElem)
}

function retrieveFullTableOfContents()
{
	var url = gs.xsltParams.library_name + "/collection/" + gs.cgiParams.c + "?excerptid=tableOfContents&ec=1";
	if(gs.cgiParams.d && gs.cgiParams.d.length > 0)
	{
		url += "&a=d&d=" + gs.cgiParams.d;
	}
	else if(gs.cgiParams.href && gs.cgiParams.href.length > 0)
	{
		url += "&a=d&d=&alb=1&rl=1&href=" + gs.cgiParams.href;
	}
    // later on we want this arg p.s so we can keep search term highlighting for expand document link
    if (gs.cgiParams.p_s && gs.cgiParams.p_s.length > 0) {
	url += "&p.s=" + gs.cgiParams.p_s;
    }
   if (gs.cgiParams.ck && gs.cgiParams.ck.length > 0) {
	url += "&ck=" + gs.cgiParams.ck;
    }
    
    if (gs.xsltParams.use_client_side_xslt == "true") { // note xsltParams are of type string, so test needs to be in quotes
	url += "&callback=retrieveFullTableOfContentsSuccessClientSideXSLT"; // used in client-side-xslt.js, in combination with 'excerptid'
        $('<iframe src="'+url+'" id="client-side-xslt-ajax" tabindex="-1" style="position: absolute; width: 0px; height: 0px; border: none;"></iframe>').appendTo('body');
    }
    else {	
	$.ajax(url)
	    .success(retrieveFullTableOfContentsSuccess)
	    .error(function() {
		setTimeout(retrieveFullTableOfContents, 1000);
	    });
    }
}

function isSectionExpanded(sectionID)
{
	var docElem = gs.jqGet("doc" + sectionID);
	if(docElem.css("display") == "block")
	{
		return true;
	}
	return false;
}

function minimizeSidebar()
{
	var toc = $("#contentsArea");
	var maxLink = $("#sidebarMaximizeButton");
	var minLink = $("#sidebarMinimizeButton");
	
	if(toc.length)
	{
		toc.css("display", "none");
	}
	
	maxLink.css("display", "block");
	minLink.css("display", "none");
}

function maximizeSidebar()
{
	var coverImage = $("#coverImage");
	var toc = $("#contentsArea");
	var maxLink = $("#sidebarMaximizeButton");
	var minLink = $("#sidebarMinimizeButton");
	
	if(coverImage.length)
	{
		coverImage.css("display", "block");
	}
	
	if(toc.length)
	{
		toc.css("display", "block");
	}
	
	maxLink.css("display", "none");
	minLink.css("display", "block");
}

function extractFilteredPagesToOwnDocument()
{
	var oids = new Array();
	var filtered = $(".pageSliderCol:visible a").each(function()
	{
		var hrefString = $(this).attr("href");
		var oidStart = hrefString.indexOf(".") + 1;
		var oidFinish = hrefString.indexOf("'", oidStart + 1);
		
		oids.push(hrefString.substring(oidStart, oidFinish));
	});
	
	var sectionString = "[";
	for(var i = 0; i < oids.length; i++)
	{
		sectionString += "\"" + oids[i] + "\"";
		if(i < oids.length - 1)
		{
			sectionString += ",";
		}
	}
	sectionString += "]";
	
	var url = "cgi-bin/document-extract.pl?a=extract-archives-doc&c=" + gs.cgiParams.c + "&d=" + gs.cgiParams.d + "&json-sections=" + sectionString + "&site=" + gs.xsltParams.site_name;// + "&json-metadata=[{"metaname":"dc.Title","metavalue":"All Black Rugy Success","metamode":"accumulate"]"
	$("#extractDocButton").attr("disabled", "disabled").html("Extracting document...");
	$.ajax(url)
	.success(function(response)
	{
		$("#extractDocButton").html("Building collection...");
		gs.functions.buildCollections([gs.cgiParams.c], function()
		{
			$("#extractDocButton").removeAttr("disabled").html("Extract these pages to document");
		});
	})
	.error(function()
	{
		$("#extractDocButton").removeAttr("disabled").html("Extract these pages to document");
	});
}

/**********************
* PAGED-IMAGE SCRIPTS *
**********************/

function changeView()
{
	var viewList = $("#viewSelection");
	var currentVal = viewList.val();
	
	var view;
	if(currentVal == "Image view")
	{
		setImageVisible(true);
		setTextVisible(false);
		view = "image";
	}
	else if(currentVal == "Text view")
	{
		setImageVisible(false);
		setTextVisible(true);
		view = "text";
	}
	else
	{
		setImageVisible(true);
		setTextVisible(true);
		view = "";
	}
	
	var url = gs.xsltParams.library_name + "?a=d&view=" + view + "&c=" + gs.cgiParams.c;
	$.ajax(url);
}

function setImageVisible(visible)
{
	$("div").each(function()
	{
		if($(this).attr("id") && $(this).attr("id").search(/^image/) != -1)
		{
			$(this).css("display", (visible ? "block" : "none"));
		}
	});
}

function setTextVisible(visible)
{
	$("div").each(function()
	{
		if($(this).attr("id") && $(this).attr("id").search(/^text/) != -1)
		{
			$(this).css("display", (visible ? "block" : "none"));
		}
	});
}

function retrieveTableOfContentsAndTitles()
{
	var ilt = "";
	ilt += '<xsl:template match="/">';
	ilt +=   '<xsl:for-each select="/page/pageResponse/document/documentNode">';
	ilt +=     '<xsl:call-template name="documentNodeTOC"/>';
	ilt +=   '</xsl:for-each>';
	ilt += '</xsl:template>';
	
    ilt = makeURLComponentSafe(ilt);


	var url = gs.xsltParams.library_name + "?a=d&ec=1&c=" + gs.cgiParams.c + "&d=" + gs.cgiParams.d + "&ilt=" + ilt;

	$.ajax(url)
	.success(function(response)
	{
	    var tableOfContents = $("#tableOfContents");
	    tableOfContents.append(response);
	    replaceLinksWithSlider();
	    
	    var loading = $("#tocLoadingImage");
	    loading.remove();
	})
	.error(function()
	{
		setTimeout(function(){retrieveTableOfContentsAndTitles();}, 1000);
	});
}


function replaceLinksWithSlider()
{
	var tableOfContents = $("#tableOfContents");
	var leafSections = new Array();
	var liElems = tableOfContents.find("li").each(function()
	{
		var section = $(this);
		var add = true;
		for(var j = 0; j < leafSections.length; j++)
		{
			if(leafSections[j] == undefined){continue;}
			
			var leaf = $(leafSections[j]);
			if(leaf.attr("id").search(section.attr("id")) != -1)
			{
				add = false;
			}
			
			if(section.attr("id").search(leaf.attr("id")) != -1)
			{
				delete leafSections[j];
			}
		}

		if(add)
		{
			leafSections.push(section);
		}
	});
	
	for(var i = 0 ; i < leafSections.length; i++)
	{
		if(leafSections[i] == undefined){continue;}

		leafSections[i].css("display", "none");
		var links = leafSections[i].find("a");

		var widget = new SliderWidget(links);
		leafSections[i].before(widget.getElem());
	}

	//Disable all TOC toggles
	var imgs = $("img").each(function()
	{
		var currentImage = $(this);
		if(currentImage.attr("id") && currentImage.attr("id").search(/^ttoggle/) != -1)
		{
			currentImage.attr("onclick", "");
			currentImage.click(function()
			{
				var sliderDiv = currentImage.parents("table").first().next();
				if(sliderDiv.is(":visible"))
				{
					sliderDiv.hide();
				}
				else
				{
					sliderDiv.show();
				}
			});
		}
		else if(currentImage.attr("id") && currentImage.attr("id").search(/^dtoggle/) != -1)
		{
			currentImage.attr("onclick", currentImage.attr("onclick").replace(/\)/, ", null, true)"));
		}
	});
}


function SliderWidget(_links)
{
	//****************
	//MEMBER VARIABLES
	//****************

	//The container for the widget
	var _mainDiv = $("<div>");
	_mainDiv.attr("class", "ui-widget-content pageSlider");
	
	//The table of images
	var _linkTable = $("<table>");
	_mainDiv.append(_linkTable);
	
	//The image row of the table
	var _linkRow = $("<tr>");
	_linkTable.append(_linkRow);
	
	//The list of titles we can search through
	var _titles = new Array();
	
	//Keep track of the slider position
	var _prevScroll = 0;

	//****************
	//PUBLIC FUNCTIONS
	//****************
	
	//Function that returns the widget element
	this.getElem = function()
	{
		return _mainDiv;
	}
	
	//*****************
	//PRIVATE FUNCTIONS
	//*****************

	//  _filter_on_types can be "sectionnum", "sectiontitle"
 var setUpFilterButtons = function() {

  var button_div = $("#filterOnButtons");
  button_div.onclick = doFiltering;
  button_div.html("radio");
  if (_filter_on_types.length == 0) {
    _filter_on_types = ["sectionnum", "sectiontitle"];
  }
  else if (_filter_on_types.length == 1) {
    if (_filter_on_types[0] == "sectionnum") {
      button_div.html("(<input type='radio' name='filterOn' value='num' checked>"+gs.text.doc.filter.pagenum+"</input>)");
    } else {
      button_div.html("(<input type='radio' name='filterOn' value='title' checked>"+gs.text.doc.filter.title+"</input>)");
    }
  } else {
    // should be both options
    button_div.html("<input type='radio' name='filterOn' value='num' checked>"+gs.text.doc.filter.pagenum+"</input><input type='radio' name='filterOn' value='title'>"+gs.text.doc.filter.title+"</input>");
  }
}

	var doFiltering = function () {
  if (typeof _titles == "undefined") {
    return;
  }

  var filter_string = $("#filterText").val();
  var filter_type = $('input[name="filterOn"]:checked').val();
  
  var index = 2; // section num
  var numeric_match = true;
  if (filter_type == "title") {
    index = 3;
    if (_filter_title_numeric != true) {
      numeric_match = false;
    }
      
  }
  var values = filter_string.split(",");
			
  var matchingTitles = new Array();
  
  for (var l = 0; l < values.length; l++)
    {
      var currentValue = values[l].replace(/^ +/g, "").replace(/ +$/g, "");
      if (numeric_match) {
	var isRange = (currentValue.search(/^\d+-\d+$/) != -1);
	if (isRange) {
	    var firstNumber = Number(currentValue.replace(/(\d+)-\d+/, "$1"));
	    var secondNumber = Number(currentValue.replace(/\d+-(\d+)/, "$1"));
	  if(firstNumber <= secondNumber)
	    {
	      for(var i = firstNumber; i <= secondNumber; i++)
		{
		  var numString = i + "";
		  for(var j = 0; j < _titles.length; j++) {
		    var currentTitle = _titles[j];
		    if(currentTitle[index] == numString) {
			matchingTitles.push(currentTitle);
			break; // assume no titles are the same
		    }
		  }
		}
	    }
	} // if isRange
	else {
	  for(var j = 0; j < _titles.length; j++) {
	    if (_titles[j][index]==currentValue) {
	      matchingTitles.push(_titles[j]);
		break; // assume no titles are the same
	    }
	  }

	}
	
      } else { // not numeric match.
	// need to do a search
	  for(var i = 0; i < _titles.length; i++)
	    {
	      var currentTitle = _titles[i];
	      if(currentTitle[index].toLowerCase().search(currentValue.toLowerCase().replace(/\./g, "\\.")) != -1)
		{
		  matchingTitles.push(currentTitle);
		}
	    }
      }
    } // for each value from filter string
  
  // set all to hide...
  for(var i = 0; i < _titles.length; i++)
    {
      $(_titles[i][1].cell).css("display", "none");
    }
  
  // .. then display the matching ones
  for(var i = 0; i < matchingTitles.length; i++)
    {
      $(matchingTitles[i][1].cell).css("display", "table-cell");
    }
	} // end doFiltering() function

	var setUpFilterBox = function() 
	{
	  var filter = $("#filterText");
	  
	 filter.keyup(function() 
	{
	  doFiltering();
	});
	}
	
	var getImage = function(page, attemptNumber)
    {
		var href = page.getAttribute("href");
		var startHREF = href.indexOf("'") + 1;
		var endHREF = href.indexOf("'", startHREF);
		var nodeID = href.substring(startHREF, endHREF);
		href = gs.xsltParams.library_name + "/collection/" + gs.cgiParams.c + "/document/" + nodeID;
		
		var template = '';
		template += '<xsl:template match="/">';
		template +=   '<html>';
		template +=     '<img>';
		template +=       '<xsl:attribute name="src">';
		template +=         "<xsl:value-of disable-output-escaping=\"yes\" select=\"/page/pageResponse/collection/metadataList/metadata[@name = 'httpPath']\"/>";
		template +=         '<xsl:text>/index/assoc/</xsl:text>';
		template +=         "<xsl:value-of disable-output-escaping=\"yes\" select=\"/page/pageResponse/document/metadataList/metadata[@name = 'assocfilepath']\"/>";
		template +=         '<xsl:text>/</xsl:text>';
		template +=         "<xsl:value-of disable-output-escaping=\"yes\" select=\"/page/pageResponse/document//documentNode[@nodeID = '" + nodeID + "']/metadataList/metadata[@name = 'Thumb']\"/>";
		template +=       '</xsl:attribute>';
		template +=     '</img>';
		template +=     '<p>';
		template +=       "<xsl:value-of disable-output-escaping=\"yes\" select=\"/page/pageResponse/document/documentNode/metadataList/metadata[@name = 'Title']\"/>";
		template +=     '</p>';
		template +=   '</html>';
		template += '</xsl:template>';
	template = makeURLComponentSafe(template);
		var url = href + "?noText=1&ilt=" + template;

		$.ajax(url)
		.success(function(text)
			 {
			var hrefStart = text.indexOf("src=\"") + 5;
			if(hrefStart == -1)
			{
				page.isLoading = false;
				page.noImage = true;
				$(page.image).attr("src", gs.imageURLs.blank);
				return;
			}
			var hrefEnd = text.indexOf("\"", hrefStart);
			var href = text.substring(hrefStart, hrefEnd);

			var image = $("<img>");
			image.load(function()
			{
				$(page.link).html("");
				$(page.link).append(image);
				page.isLoading = false;
				page.imageLoaded = true;
			});
			image.error(function()
			{
				if(!attemptNumber || attemptNumber < 3)
				{
					setTimeout(function(){getImage(page, ((!attemptNumber) ? 1 : attemptNumber + 1));}, 500);
				}
				else
				{
					page.isLoading = false;
					page.noImage = true;
					image.attr("src", gs.imageURLs.blank);
				}
			});
			image.attr("src", href);
			
			var titleStart = text.indexOf("<p>") + 3;
			var titleEnd = text.indexOf("</p>");
			var title = text.substring(titleStart, titleEnd);
		})
		.error(function()
		{
			page.failed = true;
			if(!attemptNumber || attemptNumber < 3)
			{
				setTimeout(function(){getImage(page, ((!attemptNumber) ? 1 : attemptNumber + 1));}, 500);
			}
			else
			{
				var image = $("<img>", {"src": gs.imageURLs.blank});
				$(page.link).html("");
				$(page.link).append(image);
				page.isLoading = false;
				page.noImage = true;
			}
		});
	}
	
	var startCheckFunction = function()
	{
		var checkFunction = function(forced)
		{
			//Don't bother checking if we haven't scrolled very far
			if(Math.abs(_mainDiv.scrollLeft() - _prevScroll) > 100 || forced)
			{
				_prevScroll = _mainDiv.scrollLeft();
				_checking = true;
				var widgetLeft = _mainDiv.offset().left;
				var widgetRight = widgetLeft + _mainDiv.width();
				
				var visiblePages = new Array();
				for(var i = 0; i < _links.length; i++)
				{
					var current = _links[i].cell;
					var currentLeft = current.offset().left;
					var currentRight = currentLeft + current.width();

					if(currentRight > widgetLeft && currentLeft < widgetRight)
					{
						visiblePages.push(_links[i]);
					}
				}
				
				for(var i = 0; i < visiblePages.length; i++)
				{
					var page = visiblePages[i];
					if(!page || page.imageLoaded || page.noImage || page.isLoading)
					{
						continue;
					}
					
					page.isLoading = true;
					getImage(page);
				}
				_checking = false;
			}
		}

		setTimeout(checkFunction, 250);
		setInterval(function(){checkFunction(true)}, 2000);
		_mainDiv.scroll(checkFunction);
	}
	
	//***********
	//CONSTRUCTOR
	//***********
	
	for(var i = 0; i < _links.length; i++)
	{
		var col = $("<td>");
		_linkRow.append(col);
		col.addClass("pageSliderCol");
		_links[i].cell = col;

		var link = $("<a>");
		col.append(link);
		_links[i].link = link;
		var href = $(_links[i]).attr("href");
		link.attr("href", href.replace(/\)/, ", 0, true)"));

		if(!_linkCellMap[href])
		{
			_linkCellMap[href] = new Array();
		}
		_linkCellMap[href].push(_links[i]);

		var loadingText = $("<p>Loading image</p>");
		link.append(loadingText);

		var image = $("<img>");
		link.append(image);
		image.attr("src", gs.imageURLs.loading);
		_links[i].image = image;

		var title = $(_links[i]).html();
		var t_section = "";
		var t_title = "";
		if (title.search(/tocSectionNumber/) != -1)
		  {
		    var matching_regex = /<span class=\"tocSectionNumber\">([0-9]+)<\/span>[\s\S]*<span class=\"tocSectionTitle\">(.+)<\/span>$/mg; 
		    var matches_array = matching_regex.exec(title);
		    if (matches_array != null && matches_array.length == 3) {
		      t_section = matches_array[1];
		      t_title = matches_array[2];
		      }
		  }
		
		_titles.push([title, _links[i], t_section, t_title]);

		col.append($("<br>"));
		col.append(title);
	}

	setUpFilterBox();
	setUpFilterButtons();
	startCheckFunction();
	}

/***********************
* HIGHLIGHTING SCRIPTS *
***********************/
function swapHighlight(imageClicked)
{
	var hlCheckbox = $("#highlightOption");
	if(imageClicked)
	{
	  // toggle the state of the checkbox
	  $(hlCheckbox).prop("checked", !$(hlCheckbox).prop("checked"));
	}
	var from;
	var to;
	if(hlCheckbox.prop("checked"))
	{
		from = "noTermHighlight";
		to = "termHighlight";
	}
	else
	{
		from = "termHighlight";
		to = "noTermHighlight";
	}

	var spans = $("span").each(function()
	{
		if($(this).hasClass(from))
		{
			$(this).removeClass(from);
			$(this).addClass(to);
		}
	});
}

/**************************
* REALISTIC BOOKS SCRIPTS *
**************************/

function bookInit()
{
	loadBook(); 
	hideText(); 
	showBook(); 
	swapLinkJavascript(false);
}

function hideText()
{
	$("#gs-document-text").css("visibility", "hidden");
}

function showText()
{
	$("#gs-document-text").css("visibility", "visible");
}

function hideBook()
{
	$("#bookDiv, #bookObject, #bookEmbed").css({"visibility": "hidden", "height": "0px"});
}

function showBook()
{
	$("#bookDiv, #bookObject, #bookEmbed").css({"visibility": "visible", "height": "600px"});
}

function swapLinkJavascript(rbOn)
{
	var option = $("#rbOption");
	var optionImage = $("#rbOptionImage");
	
	if(rbOn)
	{
		option.attr("onclick", "hideText(); showBook(); swapLinkJavascript(false);");
		optionImage.attr("onclick", "hideText(); showBook(); swapLinkJavascript(false);");
		$(option).prop("checked", false);
	}
	else
	{
		option.attr("onclick", "hideBook(); showText(); swapLinkJavascript(true);");
		optionImage.attr("onclick", "hideBook(); showText(); swapLinkJavascript(true);");
		$(option).prop("checked", true);
	}
}

function loadBook()
{
	var doc_url = document.URL; 
	doc_url = doc_url.replace(/(&|\?)book=[a-z]+/gi,'');
	doc_url += '&book=flashxml';
	
	var img_cover = gs.collectionMetadata.httpPath + '/index/assoc/' + gs.documentMetadata.assocfilepath + '/cover.jpg';

	var flash_plug_html = ""
	flash_plug_html += '<OBJECT align="middle" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" \n';
	flash_plug_html += '  height="600px" id="bookObject" swLiveConnect="true" \n';
	flash_plug_html += '  codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" \n';
	flash_plug_html += '  width="70%">\n';
	flash_plug_html += '    <PARAM name="allowScriptAccess" value="always" />\n';
	flash_plug_html += '    <PARAM name="movie" value="Book.swf';
	flash_plug_html += '?src_image=' + escape(img_cover);
	flash_plug_html += '&doc_url=' + escape(doc_url);
	flash_plug_html += '" />\n';
	flash_plug_html += '    <PARAM name="quality" value="high" />\n';
	flash_plug_html += '    <PARAM name="bgcolor" value="#FFFFFF" />\n';
	flash_plug_html += '    <EMBED align="middle" \n';
	flash_plug_html += '      allowScriptAccess="always" swLiveConnect="true" \n';
	flash_plug_html += '      bgcolor="#FFFFFF" height="600px" name="Book" \n';
	flash_plug_html += '      pluginspage="http://www.macromedia.com/go/getflashplayer" \n';
	flash_plug_html += '      quality="high" id="bookEmbed"\n';
	flash_plug_html += '      src="Book.swf';
	flash_plug_html += '?src_image=' + escape(img_cover);
	flash_plug_html += '&doc_url=' + escape(doc_url);
	flash_plug_html += '"\n'; 
	flash_plug_html += '      type="application/x-shockwave-flash" width="70%" />\n';
	flash_plug_html += '</OBJECT>\n';
	$("#bookdiv").html(flash_plug_html);
}



/***************
* MENU SCRIPTS *
***************/
function moveScroller() {
  var move = function() {
    var editbar = $("#editBar");
    var st = $(window).scrollTop();
    var fa = $("#float-anchor").offset().top;
    if(st > fa) {
      
      editbar.css({
	  position: "fixed",
	    top: "0px",
	    width: editbar.data("width"),
	    //width: "30%"
            });
    } else {
      editbar.data("width", editbar.css("width"));
      editbar.css({
	  position: "relative",
	    top: "",
	    width: ""
	    });
    }
  };
  $(window).scroll(move);
  move();
}


function floatMenu(enabled)
{
	var menu = $(".tableOfContentsContainer");
	if(enabled)
	{
		menu.data("position", menu.css("position"));
		menu.data("width", menu.css("width"));
		menu.data("right", menu.css("right"));
		menu.data("top", menu.css("top"));
		menu.data("max-height", menu.css("max-height"));
		menu.data("overflow", menu.css("overflow"));
		menu.data("z-index", menu.css("z-index"));
		
		menu.css("position", "fixed");
		menu.css("width", "300px");
		menu.css("right", "0px");
		menu.css("top", "100px");
		menu.css("max-height", "600px");
		menu.css("overflow", "auto");
		menu.css("z-index", "200");
		
		$("#unfloatTOCButton").show();
	}
	else
	{
		menu.css("position", menu.data("position"));
		menu.css("width", menu.data("width"));
		menu.css("right", menu.data("right"));
		menu.css("top", menu.data("top"));
		menu.css("max-height", menu.data("max-height"));
		menu.css("overflow", menu.data("overflow"));
		menu.css("z-index", menu.data("z-index"));
		
		$("#unfloatTOCButton").hide();
		$("#floatTOCToggle").prop("checked", false);
	}
	
	var url = gs.xsltParams.library_name + "?a=d&ftoc=" + (enabled ? "1" : "0") + "&c=" + gs.cgiParams.c;
	
	$.ajax(url);
}

/********************
* SLIDESHOW SCRIPTS *
********************/

function showSlideShow()
{
	if(!($("#gs-slideshow").length))
	{
		var slideshowDiv = $("<div>", {id:"gs-slideshow", style:"height:100%;"});
		var loadingImage = $("<img>", {src:gs.imageURLs.loading});
		slideshowDiv.append(loadingImage);
		
		$.blockUI({message: $(slideshowDiv), css:{top: "5%", left: "5%", width: "90%", height: "90%", overflow: "auto", cursor: "auto"}});
		
		retrieveImagesForSlideShow(function(imageIDArray)
		{
			loadingImage.hide();
			if(imageIDArray && imageIDArray.length > 0)
			{
				var imageURLs = new Array();
				for(var i = 0; i < imageIDArray.length; i++)
				{
					if(imageIDArray[i].source && imageIDArray[i].source.search(/.*\.(gif|jpg|jpeg|png)$/) != -1)
					{
						imageURLs.push(gs.collectionMetadata.httpPath + "/index/assoc/" + gs.documentMetadata.assocfilepath + "/" + imageIDArray[i].source);
					}
				}
				new SlideShowWidget(slideshowDiv, imageURLs, imageIDArray);
			}
		});
	}
	else
	{
		$("#gs-slideshow").show();
	}
}

function retrieveImagesForSlideShow(callback)
{
	var template = "";
	template += '<xsl:template match="/">';
	template +=   '<images>[';
	template +=     '<xsl:for-each select="//documentNode">';
	template +=       '<xsl:text disable-output-escaping="yes">{"source":"</xsl:text><gsf:metadata name="Source"/><xsl:text disable-output-escaping="yes">",</xsl:text>';
	template +=       '<xsl:text disable-output-escaping="yes">"id":"</xsl:text><xsl:value-of select="@nodeID"/><xsl:text disable-output-escaping="yes">"}</xsl:text>';
	template +=       '<xsl:if test="position() != count(//documentNode)">,</xsl:if>';
	template +=     '</xsl:for-each>';
	template +=   ']</images>';
	template += '</xsl:template>';
    template = makeURLComponentSafe(template);
	var url = gs.xsltParams.library_name + "/collection/" + gs.cgiParams.c + "/document/" + gs.cgiParams.d + "?ed=1&ilt=" + template;

	$.ajax(
	{
		url:url,
		success: function(data)
		{
			var startIndex = data.indexOf(">", data.indexOf(">") + 1) + 1;
			var endIndex = data.lastIndexOf("<");
			var arrayString = data.substring(startIndex, endIndex);
			var imageIDArray = eval(arrayString);

			callback(imageIDArray);
		}
	});
}

function SlideShowWidget(mainDiv, images, idArray)
{
	var _inTransition = false;
	var _images = new Array();
	var _mainDiv = mainDiv;
	var _imageDiv = $("<div>", {id:"ssImageDiv", style:"height:95%; overflow:auto;"});
	var _navDiv = $("<div>", {style:"height:5%;"});
	var _nextButton = $("<img>", {src:gs.imageURLs.next, style:"float:right; cursor:pointer;"});
	var _prevButton = $("<img>", {src:gs.imageURLs.prev, style:"float:left; cursor:pointer; display:none;"});
	var _closeLink = $("<a href=\"javascript:$.unblockUI()\">Close Slideshow</a>");
	var _clearDiv = $("<div>", {style:"clear:both;"});
	var _currentIndex = 0;
	
	_navDiv.append(_nextButton);
	_navDiv.append(_closeLink);
	_navDiv.append(_prevButton);
	_navDiv.append(_clearDiv);
	_mainDiv.append(_navDiv);
	_mainDiv.append(_imageDiv);
	
	for(var i = 0; i < images.length; i++)
	{
		_images.push($("<img>", {src:images[i], "class":"slideshowImage"}));
	}
	
	if(_images.length < 2)
	{
		_nextButton.css("display", "none");
	}
	
	_imageDiv.append(_images[0]);
	
	this.nextImage = function()
	{
		if(!_inTransition)
		{
			_inTransition = true;
			if((_currentIndex + 1) < _images.length)
			{
				_prevButton.css("display", "");
				if(_currentIndex + 1 == _images.length - 1)
				{
					_nextButton.css("display", "none");
				}
			
				_imageDiv.fadeOut(500, function()
				{
					_imageDiv.empty();
					_imageDiv.append(_images[_currentIndex + 1]);
					_currentIndex++;
					_imageDiv.fadeIn(500, function()
					{
						_inTransition = false;
					});
				});
			}
			else
			{
				_inTransition = false;
			}
		}
	}
	
	this.prevImage = function()
	{
		if(!_inTransition)
		{
			_inTransition = true;
			if((_currentIndex - 1) >= 0)
			{
				_nextButton.css("display", "");
				if(_currentIndex - 1 == 0)
				{
					_prevButton.css("display", "none");
				}
			
				_imageDiv.fadeOut(500, function()
				{
					_imageDiv.empty();
					_imageDiv.append(_images[_currentIndex - 1]);
					_currentIndex--;
					_imageDiv.fadeIn(500, function()
					{
						_inTransition = false;
					});
				});
			}
			else
			{
				_inTransition = false;
			}
		}
	}
	
	var getRootFilenameFromURL = function(url)
	{
		var urlSegments = url.split("/");
		var filename = urlSegments[urlSegments.length - 1];
		return filename.replace(/_thumb\..*$/, "");
	}
	
	var setLink = function(currentLink, index)
	{
		$(currentLink).click(function()
		{
			_inTransition = true;
			_currentIndex = index;
			_imageDiv.fadeOut(500, function()
			{
				_imageDiv.empty();
				_imageDiv.append(_images[_currentIndex]);
				_imageDiv.fadeIn(500, function()
				{
					_inTransition = false;
				});
			});
		});
	}

	var sliderLinks = $(".pageSliderCol a");
	for(var i = 0; i < sliderLinks.length; i++)
	{
		var currentLink = sliderLinks[i];
		var id = $(currentLink).attr("href").split("'")[1];

		for(var j = 0; j < idArray.length; j++)
		{
			if(idArray[j].id == id)
			{
				var image = idArray[j].source;
				
				for(var l = 0; l < images.length; l++)
				{
					var filename = getRootFilenameFromURL(images[l]);
					if (filename == image)
					{
						setLink(currentLink, l);
						break;
					}
				}
				
				break;
			}
		}
	}

	_nextButton.click(this.nextImage);
	_prevButton.click(this.prevImage);
}
