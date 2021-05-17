<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		xmlns:java="http://xml.apache.org/xslt/java"
		xmlns:util="xalan://org.greenstone.gsdl3.util.XSLTUtil"
		xmlns:gslib="http://www.greenstone.org/skinning"
		extension-element-prefixes="java util"
		exclude-result-prefixes="java util xsl gslib">

  
  <!-- use the 'main' layout -->
  <xsl:include href="layouts/main.xsl"/>

  <!-- set page title -->
  <xsl:template name="pageTitle"><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'gsdl.title')"/></xsl:template>

  <!-- set page breadcrumbs -->
  <xsl:template name="breadcrumbs">
    <gslib:siteLink/>
  </xsl:template>

  <!-- the page content -->
  <xsl:template match="/page/pageResponse">
    <xsl:variable name="gsorg_link"><a href="//www.greenstone.org">www.greenstone.org</a></xsl:variable>
    <p><xsl:value-of select="util:getInterfaceTextWithDOM($interface_name, /page/@lang, 'gsdl.main', $gsorg_link)"  disable-output-escaping="yes"/>
</p>
    <dl>
      <dt><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'gsdl.technical')"/></dt><dd><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'gsdl.technical_desc', '//www.greenstone.org/factsheet')"  disable-output-escaping="yes"/></dd>
      <dt><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'gsdl.customisation')"/></dt><dd><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'gsdl.customisation_desc', '//wiki.greenstone.org/doku.php?id=en:beginner:customization')"  disable-output-escaping="yes"/></dd>
      <dt><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'gsdl.documentation')"/></dt><dd><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'gsdl.documentation_desc', '//wiki.greenstone.org;//wiki.greenstone.org/doku.php?id=en:tutorials')"  disable-output-escaping="yes"/></dd>
      <dt><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'gsdl.support')"/></dt><dd><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'gsdl.support_desc', '//www.greenstone.org/support')"  disable-output-escaping="yes"/></dd>
      <dt><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'gsdl.bugs')"/></dt><dd><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'gsdl.bugs_desc', 'mailto:greenstone-users@list.waikato.ac.nz')"  disable-output-escaping="yes"/></dd>
    </dl>
    <hr/>

    <h3>Kia papapounamu te moana</h3>
    <p>
      <br/>kia hora te marino,
      <br/>kia tere te karohirohi,
      <br/>kia papapounamu te moana
      <br/>
      <br/>may peace and calmness surround you,
      <br/>may you reside in the warmth of a summer's haze,
      <br/>may the ocean of your travels be as smooth as the polished greenstone.
    </p>
    <p>
      <xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'gsdl.greenstone_stone')"/>	      
    </p>
    <hr/>
    <h3>Toki Pou Hinengaro</h3>
    <a href="interfaces/default/images/toki.png" title="view larger toki image"><img style="float:right;" src="interfaces/default/images/toki_sm.png"/></a>
    <br/>
    <p><i>'The adze that shapes the excellence of thought'</i></p>
    <p><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'gsdl.toki_about1', '//nzdl.org/niupepa')" disable-output-escaping="yes"/></p>
    <p><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'gsdl.toki_about2')"/></p>
    <p><i>Haramai te toki, haumi e, hui e, tāiki e!</i></p>
    </xsl:template>

    

    <xsl:template match="/page/xsltparams">
      <!-- suppress xsltparam block in page -->
    </xsl:template>

  </xsl:stylesheet>


