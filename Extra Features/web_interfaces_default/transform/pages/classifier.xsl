<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		xmlns:java="http://xml.apache.org/xslt/java"
		xmlns:util="xalan://org.greenstone.gsdl3.util.XSLTUtil"
		xmlns:gslib="http://www.greenstone.org/skinning"
		xmlns:gsf="http://www.greenstone.org/greenstone3/schema/ConfigFormat"
		extension-element-prefixes="java util"
		exclude-result-prefixes="java util gsf">
  
  <!-- use the 'main' layout -->
  <xsl:import href="layouts/main.xsl"/>
  <xsl:import href="map-tools.xsl"/>
  <xsl:import href="panorama-viewer-tools.xsl"/>

  <!-- set page title -->
  <xsl:template name="pageTitle"><gslib:serviceName/></xsl:template>

  <!-- set page breadcrumbs -->
  <xsl:template name="breadcrumbs"><gslib:siteLink/><gslib:rightArrow/><gslib:collectionNameLinked/><gslib:rightArrow/></xsl:template>

  <!-- optional cgi-params for links to document pages -->
  <xsl:variable name="opt-doc-link-args"></xsl:variable>

  <!-- the page content -->
  <xsl:template match="/page/pageResponse">
    <xsl:call-template name="classifierPre"/>
    
    <script type="text/javascript" src="interfaces/{$interface_name}/js/classifier_scripts.js"><xsl:text> </xsl:text></script>
    <script type="text/javascript">$(window).load(openStoredClassifiers);</script>
    
    <!-- this right sidebar -->
    <xsl:if test="$berryBasketOn or ($documentBasketOn and (util:contains(/page/pageRequest/userInformation/@groups, 'administrator') or util:contains(/page/pageRequest/userInformation/@groups, 'all-collections-editor') or util:contains(/page/pageRequest/userInformation/@groups, $thisCollectionEditor)))">
      <div id="rightSidebar">
	<xsl:if test="$berryBasketOn">
	  <!-- show the berry basket if it's turned on -->
	  <gslib:berryBasket/>
	  <xsl:text> </xsl:text>
	</xsl:if>

	<xsl:if test="$documentBasketOn">
	  <gslib:documentBasket/>
	  <xsl:text> </xsl:text>
	</xsl:if>
      </div>
    </xsl:if>
    
    <!--
	show the clasifier results - 
	you can change the appearance of the results by editing
	the two templates at the bottom of this file
    -->
    <div id="results">
      <xsl:variable name="collName"><xsl:value-of select="/page/pageRequest/paramList/param[@name='c']/@value"/></xsl:variable>
      <xsl:variable name="serviceName"><xsl:value-of select="service/@name"/></xsl:variable>

      <xsl:call-template name="classifierResultsPre"/>
      
      <xsl:apply-templates select="classifier">
	<xsl:with-param name="collName" select="$collName"/>
	<xsl:with-param name="serviceName" select="$serviceName"/>
      </xsl:apply-templates>
    </div>

    <div class="clear"><xsl:text> </xsl:text></div>
  </xsl:template>

  <xsl:template match="classifier">
    <xsl:param name="collName"/>
    <xsl:param name="serviceName"/>
    <div id="classifiers">
      <xsl:variable name="cl_name"><xsl:value-of select="@name"/></xsl:variable>
      <xsl:choose>
	<xsl:when test="@childType = 'HList'">
	  <xsl:call-template name="HList">
	    <xsl:with-param name='collName' select='$collName'/>
	    <xsl:with-param name='serviceName' select='$serviceName'/>
	  </xsl:call-template>
	</xsl:when>
	<xsl:otherwise>
	  <table id="classifiernodelist">
	    <xsl:text> </xsl:text>
	    <xsl:call-template name="processNodeChildren">
	      <xsl:with-param name='collName' select='$collName'/>
	      <xsl:with-param name='serviceName' select='$serviceName'/>
	    </xsl:call-template>
	  </table>
	</xsl:otherwise>
      </xsl:choose>
    </div>
  </xsl:template>
  
  <xsl:template name="HList">
    <xsl:param name="collName"/>
    <xsl:param name="serviceName"/>
    <xsl:variable name="selectedNode"><xsl:value-of select="/page/pageRequest/paramList/param[@name = 'cl']/@value"/></xsl:variable>
    <ul class="horizontalContainer">
      <xsl:for-each select='classifierNode'>
	<li>
	  <xsl:attribute name="class">
	    <xsl:if test="starts-with($selectedNode, @nodeID) or (not(contains($selectedNode, '.')) and @nodeID = concat($selectedNode, '.1'))">selectedHorizontalClassifierNode </xsl:if>
	    <xsl:text>horizontalClassifierNode</xsl:text>
	  </xsl:attribute>
	  <xsl:apply-templates select='.'>
	    <xsl:with-param name='collName' select='$collName'/>
	    <xsl:with-param name='serviceName' select='$serviceName'/>
	  </xsl:apply-templates>
	</li>
      </xsl:for-each>
    </ul>
    <xsl:choose>
      <!-- if the children are HLists-->
      <xsl:when test="classifierNode[@childType = 'HList']">
	<xsl:for-each select='classifierNode'><!-- there should be only one-->
	  <xsl:call-template name="HList">
	    <xsl:with-param name='collName' select='$collName'/>
	    <xsl:with-param name='serviceName' select='$serviceName'/>
	  </xsl:call-template>
	</xsl:for-each>
	</xsl:when>
	<xsl:otherwise>
	<table id="classifiernodelist">
	  <xsl:for-each select='classifierNode'>
	    <xsl:call-template name="processNodeChildren">
	      <xsl:with-param name='collName' select='$collName'/>
	      <xsl:with-param name='serviceName' select='$serviceName'/>
	    </xsl:call-template>
	  </xsl:for-each>
	</table>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>	

  <xsl:template name="processNodeChildren">
    <xsl:param name="collName"/>
    <xsl:param name="serviceName"/>

    <xsl:choose>
      
	  <xsl:when test="@childType = 'VList' or @childType = 'DateList'">
	  <!--	
	      <xsl:when test="@childType = 'VList' or @childType = 'HList' or @childType = 'DateList'"> - - **** mod ???? - -
	      -->
	    
	<xsl:value-of select="util:storeString('prevMonth', '')"/>
	<xsl:for-each select='classifierNode|documentNode'>
	  <tr>
	    <xsl:choose>
	      <xsl:when test="name()='documentNode'">
		<xsl:if test="../@childType = 'DateList'">
		  <xsl:variable name="prevMonth"><xsl:value-of select="util:getString('prevMonth')"/></xsl:variable>
		  <xsl:variable name="currentDate"><gsf:metadata name="Date" pos="1"/></xsl:variable> <!-- note pos=1 won't work if a document can be included in a datelist multiple times. currently only the first date is used...-->
		  <xsl:variable name="currentMonth"><xsl:value-of select="util:getDetailFromDate($currentDate, 'month', /page/@lang)"/></xsl:variable>
		  <xsl:value-of select="util:storeString('prevMonth', $currentMonth)"/>
		  <td>
		    <xsl:if test="not($currentMonth = $prevMonth)">
		      <xsl:value-of select="$currentMonth"/>
		    </xsl:if>
		    <xsl:text> </xsl:text>
		  </td>
		</xsl:if>
		<td>
		  <table id="div{@nodeID}"><tr>
		    <xsl:call-template name="documentNodeWrapper">
		      <xsl:with-param name='collName' select='$collName'/>
		      <xsl:with-param name='serviceName' select='$serviceName'/>
		    </xsl:call-template>
		  </tr></table>
		</td>
	      </xsl:when>
	      <xsl:when test="name()='classifierNode' and (@childType = 'VList' or @childType = 'HList')"><!-- *** mod -->
		<td>
		  <table id="title{@nodeID}"><tr>
		    <xsl:if test="not(/page/pageResponse/format[@type='browse']/gsf:option[@name='turnstyleClassifiers']) or /page/pageResponse/format[@type='browse']/gsf:option[@name='turnstyleClassifiers']/@value='true'">
		      <td class="headerTD">
			<img id="toggle{@nodeID}" onclick="toggleSection('{@nodeID}');" class="icon turnstyleicon">			
			  <xsl:attribute name="src">
			    <xsl:choose>
			      <xsl:when test="classifierNode or documentNode">
				<xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'collapse_image')"/>
			      </xsl:when>
			      <xsl:otherwise>
				<xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'expand_image')"/>
			      </xsl:otherwise>
			    </xsl:choose>
			  </xsl:attribute>
			</img>
		      </td>
		    </xsl:if>
		    <xsl:apply-templates select='.'>
		      <xsl:with-param name='collName' select='$collName'/>
		      <xsl:with-param name='serviceName' select='$serviceName'/>
		    </xsl:apply-templates>
		  </tr></table>
		</td>
		<xsl:if test="child::classifierNode or child::documentNode">
		  <!--recurse into the children-->
		  <tr><td><table class="childrenlist" id="div{@nodeID}">
		    <xsl:apply-templates select='.' mode='process-all-children'>
		      <xsl:with-param name='collName' select='$collName'/>
		      <xsl:with-param name='serviceName' select='$serviceName'/>
		    </xsl:apply-templates>
		  </table></td></tr>
		</xsl:if>
	      </xsl:when>
	      <xsl:otherwise><td>Unknown classifier style specified: <xsl:value-of select="name()"/></td></xsl:otherwise>
	    </xsl:choose>
	  </tr>
	</xsl:for-each>
      </xsl:when>
      <xsl:when test="@childType = 'HTML'">
	<xsl:variable name="URL"><xsl:value-of select="documentNode/@nodeID"/></xsl:variable>
	<iframe width="100%" height="600" frameborder="0"><xsl:attribute name="src"><xsl:value-of select="$URL"/></xsl:attribute>Frame for <xsl:value-of select="$URL"/></iframe>
      </xsl:when>
      <xsl:otherwise>
	we are in the other wise
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>


  <!-- processing for the recursive bit -->
  <xsl:template match="classifierNode" mode="process-all-children">
    <xsl:param name="collName"/>
    <xsl:param name="serviceName"/>

    <!--
	***mod: previous, simpler version
    <xsl:call-template name="processNodeChildren">
      <xsl:with-param name='collName' select='$collName'/>
      <xsl:with-param name='serviceName' select='$serviceName'/>
    </xsl:call-template>
    -->

      <xsl:choose>
	<xsl:when test="@childType = 'HList'">
	    <xsl:call-template name="HList">
	      <xsl:with-param name='collName' select='$collName'/>
	      <xsl:with-param name='serviceName' select='$serviceName'/>
	    </xsl:call-template>
	</xsl:when>
	<xsl:otherwise>
	    <xsl:call-template name="processNodeChildren">
	      <xsl:with-param name='collName' select='$collName'/>
	      <xsl:with-param name='serviceName' select='$serviceName'/>
	    </xsl:call-template>
	</xsl:otherwise>
      </xsl:choose>

    
  </xsl:template>

  

  <!-- this is a wrapper node, which the interface can use to add stuff into the classifier display that isn't part of and doesn't depend on the documentNode template which may come from the collection -->
  <xsl:template name="documentNodeWrapper">
    <xsl:param name="collName"/>
    <xsl:param name="serviceName"/> 
    <xsl:apply-templates select=".">
      <xsl:with-param name="collName" select="$collName"/>
      <xsl:with-param name="serviceName" select="$serviceName"/>
    </xsl:apply-templates>
    <!-- The berry (optional) -->
    <td>
      <xsl:call-template name="documentBerryForClassifierOrSearchPage"/>
    </td>
    <xsl:call-template name="documentNodePost"/>
  </xsl:template>

  <!--
      TEMPLATE FOR DOCUMENTS
  -->
  <xsl:template match="documentNode">
    <td valign="top">
      <gsf:link type="document">
	<gsf:icon type="document"/>
      </gsf:link>
    </td>
    <td valign="top">
      <gsf:link type="source">
	<gsf:choose-metadata>
	  <gsf:metadata name="thumbicon"/>
	  <gsf:metadata name="srcicon"/>
	</gsf:choose-metadata>
      </gsf:link>
    </td>
    <td valign="top">
      <gsf:link type="document">
	<!-- Defined in the global format statement -->
	<xsl:call-template name="choose-title"/>
	<gsf:switch>
	  <gsf:metadata name="Source"/>
	  <gsf:when test="exists"><br/><i>(<gsf:metadata name="Source"/>)</i></gsf:when>
	</gsf:switch>
      </gsf:link>
    </td>
  </xsl:template>


  <xsl:template name="documentNodePost">
    <xsl:if test="/page/pageResponse/format[@type='display' or @type='browse' or @type='search']/gsf:option[@name='mapEnabled']/@value = 'true'">
      <xsl:if test="metadataList/metadata[@name='Latitude' or @name='Longitude']">
	<xsl:call-template name="mapFeaturesIcon"/>
      </xsl:if>
    </xsl:if>


    <xsl:if test="/page/pageResponse/format/gsf:option[@name='panoramaViewerEnabled']/@value = 'true'">
      <xsl:if test=" metadataList/metadata[@name = 'Latitude'] and metadataList/metadata[@name = 'Longitude'] and metadataList/metadata[@name = 'PhotoType']='Panorama'">
	<xsl:call-template name="panoramaViewerFeaturesIcon"/>
      </xsl:if>
    </xsl:if>

  </xsl:template>

  <!--
      TEMPLATE FOR GROUPS OF DOCUMENTS
  -->
  <xsl:template match="classifierNode[@classifierStyle = 'HList']" >
    <gsf:link type="classifier" style="static">
      <gsf:metadata name="Title"/>
    </gsf:link>
  </xsl:template>

  <xsl:template match="classifierNode">
    <td valign="top">
      <gsf:link type="classifier" style="static">
	<gsf:icon type="classifier"/>
      </gsf:link>
    </td>
    <td valign="top">
      <gsf:link type="classifier">
	<gsf:metadata name="Title"/>
      </gsf:link>
    </td>
  </xsl:template>
  

  <xsl:template name="classifierPre">
    <xsl:if test="/page/pageResponse/format[@type='display' or @type='browse' or @type='search']/gsf:option[@name='mapEnabled']/@value = 'true'">
      <xsl:call-template name="mapFeaturesJSONNodes"/>
    </xsl:if>
    
    <xsl:if test="/page/pageResponse/format/gsf:option[@name='panoramaViewerEnabled']/@value = 'true'">
      <xsl:call-template name="panoramaViewerFeaturesJSONNodes"/>
    </xsl:if>
    
  </xsl:template>
  
  <xsl:template name="classifierResultsPre">
    <xsl:if test="/page/pageResponse/format[@type='display' or @type='browse' or @type='search']/gsf:option[@name='mapEnabled']/@value = 'true'">
      <xsl:call-template name="mapFeaturesMap"/>
    </xsl:if>
    <xsl:if test="/page/pageResponse/format/gsf:option[@name='panoramaViewerEnabled']/@value = 'true'">
      <xsl:call-template name="panoramaViewerFeatures"/>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="/page/xsltparams">
    <!-- suppress xsltparam block in page -->
  </xsl:template>

</xsl:stylesheet>

