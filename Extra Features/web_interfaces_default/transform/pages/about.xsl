<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:java="http://xml.apache.org/xslt/java"
	xmlns:util="xalan://org.greenstone.gsdl3.util.XSLTUtil"
	xmlns:gslib="http://www.greenstone.org/skinning"
	extension-element-prefixes="java util"
	exclude-result-prefixes="java util">

	<!-- use the 'main' layout -->
	<xsl:include href="layouts/main.xsl"/>

	<xsl:variable name="groupPath"><xsl:value-of select="/page/pageRequest/paramList/param[@name='group']/@value"/></xsl:variable>
	<!-- set page title -->
	<xsl:template name="pageTitle"><gslib:collectionName/></xsl:template>

	<!-- set page breadcrumbs -->
	<xsl:template name="breadcrumbs"><gslib:siteLink/><gslib:rightArrow/>
	<xsl:if test="$groupPath != ''">
	  <xsl:for-each select="/page/pageResponse/pathList/group">
	    <xsl:sort data-type="number" select="@position"/>
	      <a>
		<xsl:attribute name="href"><gslib:groupHref path="{@path}"/></xsl:attribute>				
		<xsl:attribute name="title"><gslib:groupName path="{@path}"/></xsl:attribute>
		<gslib:groupName path="{@path}"/>
	      </a>
	      <gslib:rightArrow/>
	  </xsl:for-each>
	</xsl:if>
	</xsl:template>

	<!-- the page content -->
	<xsl:template match="/page">
  
		<xsl:choose>
			<xsl:when test="$this-element/displayItemList/displayItem[@name='icon']">
			  <img border="0">
				<xsl:attribute name="src"><xsl:value-of select="$this-element/metadataList/metadata[@name='httpPath']"/>/images/<xsl:value-of select="$this-element/displayItemList/displayItem[@name='icon']"/></xsl:attribute>
				<xsl:attribute name="alt">
				  <xsl:value-of select="$this-element/displayItemList/displayItem[@name='name']"/>
				</xsl:attribute>
				<xsl:attribute name="title">
				  <xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'aboutpage')"/>
				</xsl:attribute>
			  </img>		
			</xsl:when>      
		</xsl:choose>	
  
		<!--Display the description text of the current collection,
		and if some services are available then create a list
		of links for each service within a <ul id="servicelist"> element.-->
		<xsl:call-template name="coll-description"/>
	</xsl:template>
	
	<xsl:template name="coll-description">
	  <gslib:collectionDescriptionTextAndServicesLinks/>
	</xsl:template>

</xsl:stylesheet>  

