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
	
	<!-- set page title -->
	<xsl:template name="pageTitle"><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'berry.title')"/></xsl:template>

	<!-- set page breadcrumbs -->
	<xsl:template name="breadcrumbs"><gslib:siteLink/><gslib:rightArrow/> <gslib:collectionNameLinked/><gslib:rightArrow/></xsl:template>

	<!-- the page content -->
	<xsl:template match="/page">
	  <gslib:langfrag name="berry"/>
		<xsl:variable name="clusterName"><xsl:value-of select="/page/pageRequest/paramList/param[@name='c']/@value"/></xsl:variable>
		<script type="text/javascript" src="interfaces/default/js/berrybasket/berrycheckout.js"><xsl:text> </xsl:text></script>
		<xsl:call-template name="customJavascript"/>
		<script type="text/javascript">
			<xsl:text disable-output-escaping="yes">
				var doc;
				var docList = new Array();
			</xsl:text>
			<xsl:for-each select="/page/pageResponse/berryList/item">
				<xsl:text disable-output-escaping="yes">doc = new Array();</xsl:text>
				<xsl:for-each select="@*">
					<xsl:text disable-output-escaping="yes">doc["</xsl:text>
					<xsl:value-of select="name()" />
					<xsl:text disable-output-escaping="yes">"]='</xsl:text>
					<xsl:value-of select="." />
					<xsl:text disable-output-escaping="yes">';</xsl:text>
				</xsl:for-each>
				<xsl:text disable-output-escaping="yes">docList[</xsl:text>
				<xsl:value-of select="position()-1"/>
				<xsl:text>] = doc;</xsl:text>
			</xsl:for-each>
		</script>

		<table class="navList" id="berryCheckoutOptions">
			<tr>
				<td id="fullview" class="current"><span><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'berry.full_view')"/></span></td>
				<td id="textview"><span><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'berry.text_view')"/></span></td>
				<td id="email"><span><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'berry.email_view')"/></span></td>
			</tr>
			<div class="clear"><xsl:text> </xsl:text></div>
		</table>
		<input type="checkbox" name="selall-checkbox" id="select-all-checkbox" value="select-all" onclick="toggleSelectAll(this)">Select All</input>
		<input type="checkbox" name="delsel-checkbox" id="delete-selected-checkbox" value="delete-all" onclick="deleteSelected()">Delete Selected</input>
		<input type="checkbox" name="delall-checkbox" id="delete-all-checkbox" value="delete-all" onclick="deleteAll()">Delete All</input>
		<div id="berryBasketContent"><span><xsl:text> </xsl:text></span></div>

	</xsl:template>

	<xsl:template name="customJavascript">
	</xsl:template>

</xsl:stylesheet>  

