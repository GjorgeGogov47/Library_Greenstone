<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:java="http://xml.apache.org/xslt/java"
	xmlns:util="xalan://org.greenstone.gsdl3.util.XSLTUtil"
	xmlns:gslib="http://www.greenstone.org/skinning"
	extension-element-prefixes="java util"
	exclude-result-prefixes="java util">
	
<xsl:template match="/">
<html>
<head>
<meta name="keywords" content="" />
<meta name="description" content="" />
<title><xsl:call-template name="siteName"/></title>
<link href="interfaces/{$interface_name}/style/themes/tutorialbliss/style.css" rel="stylesheet" type="text/css" media="screen" />
<link rel="icon" href="interfaces/{$interface_name}/style/themes/tutorialbliss/images/icon.jpg" type="image/jpg"/>
<!--
Design by Free CSS Templates
http://www.freecsstemplates.org
Released for free under a Creative Commons Attribution 2.5 License

Name       : Heavenly Bliss  
Description: A two-column, fixed-width design with dark color scheme.
Version    : 1.0
Released   : 20130517

-->
</head>
<body>
<div id="banner-wrapper">
	<div id="banner"><img src="https://www.svam.org.uk/data1/images/banner6.jpeg" width="1200" height="300" alt="" /></div>
</div>
<div id="header-wrapper">
	<div id="header">
		<div id="logo">
			<h1><a href="{$library_name}"><xsl:call-template name="siteName"/></a></h1>
			<p>A <a href="http://www.greenstone.org/">Greenstone3</a> Digital Library</p>
		</div>
	</div>
</div>
<div id="wrapper"> 
	<!-- end #header -->
	<div id="page">
		<div id="page-bgtop">
			<div id="page-bgbtm">
				<div id="sidebar">
					<ul>
						<li>
							<h2><a href="?a=q&amp;rt=d&amp;s=TextQuery">пребарај композитор:</a></h2>
							<div id="search" >	
								<xsl:call-template name="searchBox"/>
						</div>
							<div style="clear: both;"></div>
						</li>
						<li>
							<h2>Линкови од библиотека</h2>
							<ul>
								<xsl:call-template name="loginButton"/> 
								<li><a href="{$library_name}/collection//page/help">Help</a></li>
								<li><a href="{$library_name}/collection//page/pref">Preferences</a></li>
							</ul>
						</li>
					</ul>
				</div>
				<!-- end #sidebar -->
				<div id="content">
					<div class="post">
						<h2 class="title"><a href="#">Опис</a></h2>
						<div class="entry">
							<p>Дигиталната библиотека Classical Composers е составена од податоци за композитори на класична музика. Податоците за композиторите се складирани во HTML фајлови во кои има додадено CSS елементи. За секој композитор во дигиталната библиотека се зачувани: име и презиме, година на раѓање и смрт, портрет/цртеж/фотографија од композиторот, земја на потекло, музички стил на композиторот или временски период кога компонирал, други композитори од кои селектираниот композитор има добиено инспирација, и други композитори за кои селектираниот композитор служел како инспирација. Самата колекција може да се пребарува со името на композиторот кој го барате, и самите композитори се класифицирани или поделени според земјата на потекло и векот во кој биле активни. </p>
						</div>
					</div>
				</div>
				<!-- end #content -->
				
				<div id="sidebar2">
					<ul>
						<li>
							<h2>Избери колекција:</h2>
							<ul>
								<xsl:call-template name="collectionsList"/>
							</ul>
						</li>					
					</ul>
				</div>
				<div style="clear: both;"></div>
			</div>
		</div>
	</div>
	<!-- end #page --> 
</div>
<div id="footer">
	<p> Ѓорге Гогов - 163136</p>
</div>
<!-- end #footer -->
</body>
</html>
</xsl:template>	

<xsl:template name="collectionsList">
	<xsl:for-each select="./page/pageResponse/collectionList/collection">
	<xsl:variable name="collectionName" select="@name"/>
		<li>
		<a href="{$library_name}/collection/{$collectionName}/page/about">
		<xsl:value-of select="displayItemList/displayItem[@name='name']"/>
		</a>
		</li>
	</xsl:for-each>
</xsl:template>

<xsl:template name="searchBox">
	<xsl:for-each select="//page/pageResponse/serviceList/service[@name='TextQuery']">
		<form name="QuickSearch" method="get" action="{$library_name}">
			<input type="hidden" name="a" value="q"/>
			<input type="hidden" name="rt" value="rd"/>
			<input type="hidden" name="s" value="{@name}"/>
			<input type="hidden" name="s1.collection" value="all"/>
			<input type="text" name="s1.query" size="20" id="search-text" value="" />
			<input type="submit" id="search-submit">
			<xsl:attribute name="value">
				<xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'home.quick_search')"/>
			</xsl:attribute>
			</input>
		</form>
	</xsl:for-each>
</xsl:template>

<xsl:template name="loginButton">
	<xsl:variable name="username" select="/page/pageRequest/userInformation/@username"/>
	<xsl:variable name="groups" select="/page/pageRequest/userInformation/@groups"/>

	<xsl:choose>
		<xsl:when test="$username">
			<xsl:if test="contains($groups,'admin')">
				<li class="login"><a href="{$library_name}/admin/AddUser">Add user</a></li>
				<li class="login"><a href="{$library_name}/admin/ListUsers">Administration</a></li>
			</xsl:if>
			<li class="login"><a href="{$library_name}/admin/AccountSettings?s1.username={$username}">Logged in as: <xsl:value-of select="$username"/></a></li>
			<li class="login"><a href="{$library_name}?logout=">Logout</a></li>
		</xsl:when>
		<xsl:otherwise>
			<li class="login">
				<a href="{$library_name}?a=p&amp;sa=login&amp;redirectURL={$library_name}%3Fa=p%26sa=home">Login
					<xsl:attribute name="title">
						<xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'login_tip')"/>
					</xsl:attribute>
				</a>
			</li>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

</xsl:stylesheet>
