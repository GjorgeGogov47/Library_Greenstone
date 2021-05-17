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
  <xsl:template name="pageTitle"><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'error.title')"/></xsl:template>
  
  <!-- set page breadcrumbs -->
  <xsl:template name="breadcrumbs"><gslib:siteLink/><gslib:rightArrow/> <gslib:collectionNameLinked/><gslib:rightArrow/></xsl:template>
  
  <!-- the page content -->
  <xsl:template match="/page">
    <xsl:variable name="ec" select="/page/pageRequest/paramList/param[@name='ec']/@value"/>
    <xsl:variable name="es"><xsl:choose><xsl:when test="$ec">error.<xsl:value-of select="$ec"/></xsl:when>
    <xsl:otherwise>error.unknown</xsl:otherwise></xsl:choose></xsl:variable>
    <xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, $es)"/>
  </xsl:template>
  
</xsl:stylesheet>
