<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:java="http://xml.apache.org/xslt/java"
	xmlns:gslib="http://www.greenstone.org/skinning"
	xmlns:util="xalan://org.greenstone.gsdl3.util.XSLTUtil"
	extension-element-prefixes="java util"
	exclude-result-prefixes="java util">
	
	<!-- use the 'main' layout -->
	<xsl:import href="layouts/main.xsl"/>
	<xsl:output method="html"/>

	<!-- add recaptcha js to the head -->
	<xsl:template name="additionalHeaderContent-page">
	  <script src='https://www.google.com/recaptcha/api.js?hl={/page/@lang}'><xsl:text> </xsl:text></script>
	</xsl:template>

  <!-- set page title -->
	<xsl:template name="pageTitle">
		<xsl:choose>
			<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'AddUser'">
				<xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.add_a_new_user_title')"/>
			</xsl:when>
			<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'Register'">
				<xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.register')"/>
			</xsl:when>
			<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'EditUser'">
				<xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.edit_user_information')"/>
			</xsl:when>
			<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'AccountSettings'">
				<xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.account_settings')"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.authentication')"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<!-- set page breadcrumbs -->
	<xsl:template name="breadcrumbs">
		<gslib:siteLink/><xsl:if test="/page/pageResponse/authenticationNode/service/@operation = 'ListUsers' or /page/pageResponse/authenticationNode/service/@operation = 'EditUser' or /page/pageResponse/authenticationNode/service/@operation = 'PerformEdit' or /page/pageResponse/authenticationNode/service/@operation = 'AddUser' or /page/pageResponse/authenticationNode/service/@operation = 'PerformAdd' or /page/pageResponse/authenticationNode/service/@operation = 'PerformDeleteUser'"><gslib:rightArrow/><a href="{$library_name}/admin/ListUsers"><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.authentication')"/></a></xsl:if>
	</xsl:template>
	
	<xsl:template match="/page">
		<xsl:if test="/page/pageResponse/error">
			<div id="gs_error" class="ui-state-error ui-corner-all">
				<span class="ui-icon ui-icon-alert" style="float: left;"><xsl:text> </xsl:text></span><xsl:value-of select="/page/pageResponse/error"/>
			</div>
			<br/>
		</xsl:if>
		<div id="main">
			<xsl:choose>
				<!-- ********** -->
				<!-- LOGIN PAGE: this page is used when the user has been directed to Login by trying to access a restricted page when they are not already logged in
				If they click the login button, then the login.xsl is used -->
				<!-- ********** -->
				<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'Login'">
				  
					<form method="POST" action="{$library_name}/admin/{/page/pageRequest/paramList/param[@name = 's1.authpage']/@value}">
						<table id="loginTable">
							<tr><td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.username')"/>: </td><td><input type="text" name="username"/></td></tr>
							<tr><td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.password')"/>: </td><td><input type="password" name="password"/></td></tr>
							<tr><td><input type="submit" value="Login"/></td><td><xsl:text> </xsl:text></td></tr>
						</table>
					</form>
					<script type="text/javascript">
						<xsl:text disable-output-escaping="yes">
						{
							$("#loginTable input[name=\"username\"]").focus();
						}
						</xsl:text>
					</script>
				</xsl:when>

				<!-- *************** -->
				<!-- LIST USERS PAGE -->
				<!-- *************** -->
				<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'ListUsers'">
					<table id="userListTable">
						<tr class="ui-widget-header">
							<td colspan="7"><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.list_of_current_users_title')"/></td>
						</tr>
						<tr class="ui-state-default">
							<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.username')"/></td>
							<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.account_status')"/></td>
							<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.groups')"/></td>
							<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.comment')"/></td>
							<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.email')"/></td>
							<td><xsl:text> </xsl:text></td>
							<td><xsl:text> </xsl:text></td>
						</tr>
						<xsl:for-each select="/page/pageResponse/authenticationNode/service/userNodeList/userNode">
							<tr class="ui-widget-content">
								<td><xsl:value-of select="@username"/></td>
								<td>
									<xsl:choose>
										<xsl:when test="@status = 'true'">
											<xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.enabled')"/>
										</xsl:when>
										<xsl:otherwise>
											<xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.disabled')"/>
										</xsl:otherwise>
									</xsl:choose>
								</td>
								<td><xsl:value-of select='util:replace(@groups, ",", " ")'/></td>
								<td><xsl:value-of select="@comment"/></td>
								<td><xsl:value-of select="@email"/></td>
								<td><a href="{$library_name}/admin/EditUser?s1.username={@username}"><button><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.edit')"/></button></a></td>
								<td>
									<xsl:variable name="user-pos">username<xsl:number value="position()"/></xsl:variable>
									<xsl:variable name="message-pos">confirmMessage<xsl:number value="position()"/></xsl:variable> 
									<form method="GET" action="{$library_name}/admin/PerformDeleteUser">
										<input type="hidden" name="s1.username" value="{@username}"/>
										<input id="delUser{@username}" type="submit" value="{util:getInterfaceText($interface_name, /page/@lang, 'authen.delete')}"/>
										<script type="text/javascript">
											<xsl:text disable-output-escaping="yes">
											{
												var </xsl:text><xsl:value-of select="$user-pos"/><xsl:text disable-output-escaping="yes"> = "</xsl:text><xsl:value-of select="@username"/><xsl:text disable-output-escaping="yes">";
												var </xsl:text><xsl:value-of select="$message-pos"/><xsl:text disable-output-escaping="yes"> = "</xsl:text><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.delete_warning')"/><xsl:text disable-output-escaping="yes">" + </xsl:text><xsl:value-of select="$user-pos"/><xsl:text disable-output-escaping="yes"> + "?";
												var button = $("#delUser" + </xsl:text><xsl:value-of select="$user-pos"/><xsl:text disable-output-escaping="yes">);
												button.click(function()
												{
													if(confirm(</xsl:text><xsl:value-of select="$message-pos"/><xsl:text disable-output-escaping="yes">))
													{
														return true;
													}
													else
													{
														return false;
													}
												});
											}	
											</xsl:text>
										</script>
									</form>
								</td>
							</tr>
						</xsl:for-each>
					</table>
					<div id="auth_navbar">
						<!-- Add User link-->
						<span class="ui-state-default ui-corner-all">
							<a href="{$library_name}/admin/AddUser"><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.add_a_new_user')"/></a>
						</span>
					</div>
				</xsl:when>

				<!-- ********************************* -->
				<!-- EDIT USER / ACCOUNT SETTINGS PAGE -->
				<!-- ********************************* -->
				<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'EditUser' or /page/pageResponse/authenticationNode/service/@operation = 'AccountSettings'">
					<form id="editForm" method="POST">
						<xsl:attribute name="action">
							<xsl:choose>
								<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'EditUser'">
									<xsl:value-of select="$library_name"/><xsl:text>/admin/PerformEdit</xsl:text>
								</xsl:when>
								<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'AccountSettings'">
									<xsl:value-of select="$library_name"/><xsl:text>/admin/PerformAccEdit</xsl:text>
								</xsl:when>
							</xsl:choose>
						</xsl:attribute>
						<input type="hidden" name="s1.prevUsername" value="{/page/pageResponse/authenticationNode/service/userNodeList/userNode/@username}"/>
						<table>
							<tr>
								<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.username')"/><xsl:text>: </xsl:text></td>
								<td>
									<input type="text" name="s1.newUsername" value="{/page/pageResponse/authenticationNode/service/userNodeList/userNode/@username}"/>
								</td>
							</tr>
							<tr>
								<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.email')"/><xsl:text>: </xsl:text></td>
								<td>
									<input type="text" name="s1.newEmail" value="{/page/pageResponse/authenticationNode/service/userNodeList/userNode/@email}"/>
								</td>
							</tr>
							<xsl:choose>
								<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'EditUser'">
									<tr>
										<td id="passwordLabelCell">
											<button id="changePasswordButton"><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.change_password')"/>...</button>
											<script type="text/javascript">
												<xsl:text disable-output-escaping="yes">
													var passwordLabelText = "</xsl:text><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.password')"/><xsl:text disable-output-escaping="yes">";
													var changePasswordButton = document.getElementById("changePasswordButton");
													changePasswordButton.onclick = function()
													{
														changePasswordButton.parentNode.removeChild(changePasswordButton);
														
														var passwordLabel = document.createTextNode(passwordLabelText + ": ");
														document.getElementById("passwordLabelCell").appendChild(passwordLabel);
														
														var passwordInput = document.createElement("INPUT");
														passwordInput.setAttribute("name", "s1.password");
														passwordInput.setAttribute("type", "password");
														document.getElementById("passwordInputCell").appendChild(passwordInput);
													}
												</xsl:text>
											</script>
										</td>
										<td id="passwordInputCell">
											<xsl:text> </xsl:text>
										</td>
									</tr>
								</xsl:when>
								<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'AccountSettings'">
									<tr>										
										<xsl:if test="not(/page/pageResponse/error/@type = 'INCORRECT_PASSWORD')">
											<td><button id="changePasswordButton"><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.change_password')"/>...</button></td>
											<script type="text/javascript">
												<xsl:text disable-output-escaping="yes">
													var oldPasswordLabelText = "</xsl:text><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.old_password')"/><xsl:text disable-output-escaping="yes">";
													var newPasswordLabelText = "</xsl:text><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.new_password')"/><xsl:text disable-output-escaping="yes">";
													var rtNewPasswordLabelText = "</xsl:text><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.retype_password')"/><xsl:text disable-output-escaping="yes">";
													
													var changePasswordButton = document.getElementById("changePasswordButton");
													changePasswordButton.onclick = function()
													{
														changePasswordButton.parentNode.removeChild(changePasswordButton);
														
														var names = ["s1.oldPassword", "s1.newPassword", ""];
														var ids = ["oldPassword", "passwordOne", "passwordTwo"];
														var labels = [oldPasswordLabelText, newPasswordLabelText, rtNewPasswordLabelText];
														var parents = ["oldPassword", "password", "retypePassword"];
														
														for(var i = 0; i &lt; names.length; i++)
														{
															$("#" + parents[i] + "LabelCell").append(labels[i] + ": ");
															
															var input = $("&lt;input&gt;");
															input.attr("name", names[i]);
															input.attr("type", "password");
															input.attr("id", ids[i]);
															
															$("#" + parents[i] + "InputCell").append(input);
														}
													}
												</xsl:text>
											</script>
										</xsl:if>
									</tr>
									
									<xsl:choose>
										<xsl:when test="not(/page/pageResponse/error/@type = 'INCORRECT_PASSWORD')">
											<tr>
												<td id="oldPasswordLabelCell"><xsl:text> </xsl:text></td>
												<td id="oldPasswordInputCell"><xsl:text> </xsl:text></td>
											</tr>
											<tr>
												<td id="passwordLabelCell"><xsl:text> </xsl:text></td>
												<td id="passwordInputCell"><xsl:text> </xsl:text></td>
											</tr>
											<tr>
												<td id="retypePasswordLabelCell"><xsl:text> </xsl:text></td>
												<td id="retypePasswordInputCell"><xsl:text> </xsl:text></td>
											</tr>
										</xsl:when>
										<xsl:otherwise>
											<tr>
												<td id="oldPasswordLabelCell"><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.old_password')"/></td>
												<td id="oldPasswordInputCell"><input id="oldPassword" name="s1.oldPassword" type="password"/></td>
											</tr>
											<tr>
												<td id="passwordLabelCell"><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.new_password')"/></td>
												<td id="passwordInputCell"><input id="passwordOne" name="s1.newPassword" type="password"/></td>
											</tr>
											<tr>
												<td id="retypePasswordLabelCell"><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.retype_password')"/></td>
												<td id="retypePasswordInputCell"><input id="passwordTwo" type="password"/></td>
											</tr>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:when>
							</xsl:choose>						
							<xsl:if test="/page/pageResponse/authenticationNode/service/@operation = 'EditUser'">
							  <xsl:call-template name="addGroupInputField"><xsl:with-param name="default_value"><xsl:value-of select="/page/pageResponse/authenticationNode/service/userNodeList/userNode/@groups"/></xsl:with-param></xsl:call-template>
								<tr>
									<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.comment')"/><xsl:text>: </xsl:text></td>
									<td>
										<textarea name="s1.comment" style="width:100%;"><xsl:value-of select="/page/pageResponse/authenticationNode/service/userNodeList/userNode/@comment"/></textarea>
									</td>
								</tr>
								<tr>
									<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.status')"/><xsl:text>: </xsl:text></td>
									<td>
										<input type="radio" name="s1.status" value="true">
											<xsl:if test="/page/pageResponse/authenticationNode/service/userNodeList/userNode/@status = 'true'">
												<xsl:attribute name="checked">true</xsl:attribute>
											</xsl:if>
										</input>
										<xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.enabled')"/><xsl:text> </xsl:text>
										
										<input type="radio" name="s1.status" value="false">
											<xsl:if test="/page/pageResponse/authenticationNode/service/userNodeList/userNode/@status = 'false'">
												<xsl:attribute name="checked">true</xsl:attribute>
											</xsl:if>
										</input>
										<xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.disabled')"/><xsl:text> </xsl:text>
									</td>
								</tr>
							</xsl:if>
							<xsl:call-template name="addRecaptcha">
							  <xsl:with-param name="formName">editForm</xsl:with-param>
							</xsl:call-template>
							<tr>
								<td>
									<input id="submitButton" type="submit" value="{util:getInterfaceText($interface_name, /page/@lang, 'authen.submit')}"/>
									<xsl:if test="/page/pageResponse/authenticationNode/service/@operation = 'AccountSettings'">
									  <xsl:call-template name="addPasswordCheckJavascript"/>
									</xsl:if>
								</td>
							</tr>
							<!--<tr>
								<td style="font-size:0.6em;"><a href="{$library_name}/admin/PerformResetPassword?s1.username={/page/pageResponse/authenticationNode/service/userNodeList/userNode/@username}"><br/><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.reset_password')"/>...</a></td>
							</tr>-->
						</table>
					</form>
				</xsl:when>
				
				<!-- ************************ -->
				<!-- ADD USER / REGISTER PAGE -->
				<!-- ************************ -->
				<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'AddUser' or /page/pageResponse/authenticationNode/service/@operation = 'Register'">
					<div id="errorArea"><xsl:text> </xsl:text></div>
					<form method="POST" id="registerForm">
						<xsl:attribute name="action">
							<xsl:choose>
								<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'AddUser'">
									<xsl:value-of select="$library_name"/><xsl:text>/admin/PerformAdd</xsl:text>
								</xsl:when>
								<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'Register'">
									<xsl:value-of select="$library_name"/><xsl:text>/admin/PerformRegister</xsl:text>
								</xsl:when>
							</xsl:choose>
						</xsl:attribute>
						<table>
							<tr>
								<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.username')"/><xsl:text>: </xsl:text></td>
								<td>
									<input type="text" name="s1.username"/>
								</td>
							</tr>
							<tr>
								<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.password')"/><xsl:text>: </xsl:text></td>
								<td>
									<input id="passwordOne" type="password" name="s1.password"/>
								</td>
							</tr>
							<tr>
								<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.retype_password')"/><xsl:text>: </xsl:text></td>
								<td>
									<input id="passwordTwo" type="password"/>
								</td>
							</tr>
							<tr>
								<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.email')"/><xsl:text>: </xsl:text></td>
								<td>
									<input type="text" name="s1.email"/>
								</td>
							</tr>
							<xsl:if test="/page/pageResponse/authenticationNode/service/@operation = 'AddUser'">
							  <xsl:call-template name="addGroupInputField"/>
								<tr>
									<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.comment')"/><xsl:text>: </xsl:text></td>
									<td>
										<textarea name="s1.comment" style="width:100%;"><xsl:text> </xsl:text></textarea>
									</td>
								</tr>
								<tr>
									<td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.status')"/><xsl:text>: </xsl:text></td>
									<td>
										<input type="radio" name="s1.status" value="true" checked="true"/><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.enabled')"/><xsl:text> </xsl:text>
										<input type="radio" name="s1.status" value="false"/><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.disabled')"/><xsl:text> </xsl:text>
									</td>
								</tr>
							</xsl:if>
							<xsl:call-template name="addRecaptcha">
							  <xsl:with-param name="formName">registerForm</xsl:with-param>
							</xsl:call-template>
							<tr>
							  <td>
							    <input id="submitButton" type="submit" value="{util:getInterfaceText($interface_name, /page/@lang, 'authen.submit')}"/>
							    <xsl:call-template name="addPasswordCheckJavascript"/>
							  </td>
							</tr>
						</table>
					</form>
				</xsl:when>
				
				<!-- ********************** -->
				<!-- REGISTER RESPONSE PAGE -->
				<!-- ********************** -->
				<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'PerformRegister'">
				  <xsl:choose>
				    <!-- don't think we ever get here, as we revert back to Register if there was an error with PerformRegister -->
				    <xsl:when test="/page/pageResponse/error">
				      <xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.error_failed_to_add')"/>
				    </xsl:when>
				    
				    <xsl:otherwise>
				      <xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.user_added_success')"/>
				      <meta http-equiv="refresh" content="2; url={/page/pageRequest/@baseURL}{$library_name}"/> 
				    </xsl:otherwise>
				  </xsl:choose>
				</xsl:when>
				
				<xsl:when test="/page/pageResponse/authenticationNode/service/@operation = 'Info'">
				  <!-- do nothing -->
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.page_not_found')"/>
				</xsl:otherwise>
			</xsl:choose>
		</div>
	      </xsl:template>

	      <xsl:template name="addGroupInputField">
		<xsl:param name="default_value"/>
		<tr>
		  <td><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.groups')"/><xsl:text>: </xsl:text></td>
		  <td>
		    <input id="groupsInput" size="50" type="text" name="s1.groups" value="{$default_value}"/>
		  </td>
		  <td>
		    <select id="groupSelector">
		      <option>COLLNAME-collection-editor</option>
		      <option>personal-collections-editor</option>
		      <option>all-collections-editor</option>
		      <option>administrator</option>
		    </select>
		  </td>
		  <td>
		    <button id="addGroupButton"><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.add_group')"/></button>
		    <script type="text/javascript">
		      <xsl:text disable-output-escaping="yes">
			var addGroupButton = document.getElementById("addGroupButton");
			addGroupButton.onclick = function()
			{
			var groupsInput = document.getElementById("groupsInput");
			var groupSelector = document.getElementById("groupSelector");
			var options = groupSelector.getElementsByTagName("OPTION");
			var selectedGroup = options[groupSelector.selectedIndex].innerHTML;
			var currentValue = groupsInput.value;
			
			if(currentValue &amp;&amp; currentValue.search(/\w/) != -1)
			{
			groupsInput.value = currentValue + "," + selectedGroup;
			}
			else
			{
			groupsInput.value = selectedGroup;
			}
			return false;
			}
		      </xsl:text>
		    </script>
		  </td>
		</tr>
		<tr><td colspan="4"><xsl:value-of select="util:getInterfaceText('default', /page/@lang, 'authen.group_desc')"/><ul><li><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.admin_desc')"/></li><li><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.all_coll_edit_desc')"/> </li> <li><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.pers_coll_edit_desc')"/></li><li><xsl:value-of select="util:getInterfaceText($interface_name, /page/@lang, 'authen.single_coll_edit_desc')"/> </li></ul></td></tr>

	      </xsl:template>
	      
	      <xsl:template name="addPasswordCheckJavascript">
		<script type="text/javascript">
		  <xsl:text disable-output-escaping="yes">
		    $("#submitButton").click(function()
		    {
		      var passwordOne = $("#passwordOne");
		      var passwordTwo = $("#passwordTwo");
		    
		      if(passwordOne.val() != passwordTwo.val())
		      {
		      alert("The passwords you have entered do not match");
		      passwordOne.val("");
		      passwordTwo.val("");
		        return false;
		      }
		      else
		      {
		        return true;
		      }
		    });
		  </xsl:text>
		</script>
		
	      </xsl:template>

	      <!-- adds in recaptcha box if the recaptcha_key attribute is set for authenticationNode/service - this is determined by operations element in Authentication serviceRack -->
	      <xsl:template name="addRecaptcha">
		<xsl:param name="formName"/>
		<xsl:variable name="recaptcha_key"><xsl:value-of select="/page/pageResponse/authenticationNode/service/@recaptcha_key"/></xsl:variable>
		<xsl:if test="$recaptcha_key">
		<tr>
		  <td colspan="2">
		    <div class="g-recaptcha" data-sitekey="{$recaptcha_key}"><xsl:text> </xsl:text></div>
		    <!-- need to add s1. to the name of g-recaptcha-response, so that it gets passed to the service -->
		    <script type="text/javascript">
		      <xsl:text disable-output-escaping="yes">
			$( "#</xsl:text><xsl:value-of select="$formName"/><xsl:text disable-output-escaping="yes">").submit(function( event ) {
			var captchaelem = $("#g-recaptcha-response");
			captchaelem.attr("name", "s1.g-recaptcha-response");
			return true;
			});
			
		      </xsl:text>
		    </script>
		</td></tr>
		</xsl:if>
	      </xsl:template>
</xsl:stylesheet>
