<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		xmlns:java="http://xml.apache.org/xslt/java"
		xmlns:util="xalan://org.greenstone.gsdl3.util.XSLTUtil"
		xmlns:gslib="http://www.greenstone.org/skinning"
		xmlns:gsf="http://www.greenstone.org/greenstone3/schema/ConfigFormat"
		extension-element-prefixes="java util"
		exclude-result-prefixes="java util gsf">

  <!-- inherit from document, but modify the main templates to cut out unnecessary bits -->
  <xsl:import href="pages/document.xsl"/>

  <!-- set page breadcrumbs -->
  <!-- just have library and collection link, not the document link -->
  <xsl:template name="breadcrumbs">
    <gslib:siteLink/><gslib:rightArrow/> 
    <gslib:collectionNameLinked/><gslib:rightArrow/> 
  </xsl:template>

  <!-- right side bar, we only want cover image and toc -->
  <xsl:template name="rightSidebar">
    <div id="rightSidebar">
      <xsl:choose>
	<xsl:when test="@docType = 'simple'">
	  <xsl:for-each select=".">
	    <xsl:call-template name="displayCoverImage"/>
	  </xsl:for-each>
	</xsl:when>
	<xsl:otherwise>
	  <xsl:for-each select="documentNode[1]">
	    <xsl:call-template name="displayCoverImage"/>
	  </xsl:for-each>
	  <xsl:call-template name="displayTOC"/>
	</xsl:otherwise>
      </xsl:choose>
    </div>
  </xsl:template>
  
  <xsl:template match="/">
    <html>

      <head>
	<!-- ***** in header.xsl ***** -->
	<xsl:call-template name="create-html-header"/>
      </head>
      
      <body><xsl:call-template name="textDirectionAttribute"/><xsl:call-template name="actionClass"/>
      <style type="text/css">
	.tableOfContentsContainer {
	max-height: none;
	}
	.backToTop {
	display: none;
	}
      </style>

      <div id="topArea" class="ui-state-default ui-corner-top">
	<table>
	  <tbody>
	    <tr>
	      <td><div id="breadcrumbs"><xsl:call-template name="breadcrumbs"/><xsl:text> </xsl:text></div></td>	      
	    </tr>
	  </tbody>
	</table>
      </div>
      <br class="clear"/> 
      
      <div id="container" class="ui-corner-all">	
	<div id="gs_content" class="ui-widget-content">
	  <xsl:apply-templates select="/page"/>
	</div>

      </div>
      </body>
    </html>
  </xsl:template>
  

</xsl:stylesheet>
