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
	
	<!-- add recaptcha js to the head -->
	<xsl:template name="additionalHeaderContent-page">
	  <script src='https://www.google.com/recaptcha/api.js?hl={/page/@lang}'><xsl:text> </xsl:text></script>
	</xsl:template>

	<!-- set page title -->
	<xsl:template name="pageTitle"><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'verify.title')"/></xsl:template>

	<!-- set page breadcrumbs -->
	<xsl:template name="breadcrumbs"><gslib:siteLink/><gslib:rightArrow/> <gslib:collectionNameLinked/><gslib:rightArrow/></xsl:template>

	<!-- the page content -->
	<xsl:template match="/page">
	  <xsl:variable name="URL" select="/page/pageRequest/paramList/param[@name='url']/@value"/>
	  <xsl:variable name="site_key" select="/page/pageResponse/security/@siteKey"/>
	  <xsl:variable name="use_recaptcha"><xsl:choose><xsl:when test="/page/pageResponse/security/@siteKey">true</xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose></xsl:variable>
	  <xsl:variable name="coll_specific_terms"><xsl:value-of select="util:getCollectionText($collName, $site_name, /page/@lang,'verify.terms_content')"/></xsl:variable>
	  <xsl:variable name="terms"><xsl:choose><xsl:when test="$coll_specific_terms = concat('text:',$collName, ':verify.terms_content')"><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'verify.terms_content')"/></xsl:when>
	  <xsl:otherwise><xsl:value-of select="$coll_specific_terms" disable-output-escaping="yes"/></xsl:otherwise>
	</xsl:choose></xsl:variable>
	  <div id="queryform">
	    <form name="VerifyForm" method="post" action="{$URL}" id="verifyform">
	      <table>
		<tr><td>
	      <xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'verify.terms_title')"/></td>
	      <td><div style="height:120px;  border: 1px solid; overflow:auto;"><xsl:value-of select="$terms" disable-output-escaping="yes"/>
</div></td></tr>
<tr><td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'verify.terms_accept')"/></td>
<td>
	      <input type="checkbox" name="accept_terms" id="acceptTerms" value="true" onchange="check1();"/></td></tr></table>
	      <xsl:if test="$use_recaptcha = 'true'">
	      <div class="g-recaptcha" data-sitekey="{$site_key}" data-callback="check2" data-expired-callback="uncheck2"><xsl:text> </xsl:text></div></xsl:if>
	      <!-- need to include this - this is what we use to check that the form has been submitted -->
	      <input type="hidden" name="hmvf" value="1"/>
	      <script type="text/javascript"><xsl:text disable-output-escaping="yes">
		var use_recaptcha = </xsl:text><xsl:value-of select="$use_recaptcha"/><xsl:text disable-output-escaping="yes">;
		var recaptcha_complete=false;
		var check1 = function() {
		  enableSubmit();
		}
		var check2 = function() {
		  recaptcha_complete = true;
		  enableSubmit();
		}
		var uncheck2 = function() {
		  recaptcha_complete = false;
		  enableSubmit();
		}
		function enableSubmit() {
		  if (document.getElementById('acceptTerms').checked &amp;&amp; (!use_recaptcha || recaptcha_complete)) {
		    document.getElementById('submitVerification').disabled = false;
		  } else {
		     document.getElementById('submitVerification').disabled = true;
		  }
		}
	      </xsl:text></script>
	      <input type="submit" autocomplete="off" id="submitVerification" value="Submit" disabled="true"/>
	    </form>
	  </div>
	</xsl:template>



</xsl:stylesheet>  

	
