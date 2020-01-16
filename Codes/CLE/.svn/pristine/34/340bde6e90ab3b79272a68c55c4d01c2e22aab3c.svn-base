jsx3.lang.Package.definePackage("cle.login", function(login) {
	
	login.TIMEOUT = 20 * 1000; //20 seconds
	login.ENDPOINT_HOST = "http://localhost:9950";
	login.ENDPOINT_URL = "/SecurityManagement/GUIServices/intfACL-service.serviceagent/intfwsUpdateRoleACLEndpoint0";
	login.AUTHORIZATION_CACHE_ID = "authorization_cdf";

	login.getEndpointHost = function() {
		return login.ENDPOINT_HOST;
	};
	login.setEndpointHost = function(strEndpointHost) {
		login.ENDPOINT_HOST = strEndpointHost;
	};
	login.getEndpointUrl = function() {
		return login.ENDPOINT_URL;
	};
	login.setEndpointUrl = function(strEndpointUrl) {
		login.ENDPOINT_URL = strEndpointUrl;
	};
	login.getEndpoint = function() {
		return login.ENDPOINT_HOST + login.ENDPOINT_URL;
	};
	/**
	 * Publish a login message
	 */
	login.sendLoginRequest = function(objButton) {
		try {
			cle.LOG.debug("login#sendLoginRequest");
			var objParent = objButton.getAncestorOfType("jsx3.gui.LayoutGrid");
			if (objParent != null) {
				var objUserId = objParent.getDescendantOfName("userId", true,
						false);
				var strUserId = objUserId.getValue();
				cle.LOG.trace("userId: " + strUserId);
				var objPassword = objParent.getDescendantOfName("password",
						true, false);
				var strPassword = objPassword.getValue();
				cle.LOG.trace("password: " + strPassword);
				//test for empty values
				if ((jsx3.util.strEmpty(strUserId))||(jsx3.util.strEmpty(strPassword))){
					var strCaption = cle.utils.getProperty("login_incompleteLogin");
					var strMessage = cle.utils.getProperty("login_completeLoginToContinue");
					var strOk = cle.utils.getProperty("m_ok");
					var objParams = {width:320,height:120};
					cle.SERVER.alert(strCaption,strMessage,function(objDialog){
						jsx3.sleep(function(){objUserId.focus();});
						objDialog.doClose();
					},strOk,objParams);
					return false;
				}
				//disable button
				objButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
				//publish request
				cle.SERVER.publish({subject: "loginRequest", userId: strUserId, password: strPassword, context: objParent});
			}
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("login#sendLoginRequest error: " + e.getMessage());
		}
	};
	/**
	 * Authenticate user
	 */
	login.authenticateUserId = function(objEvent) {
		try {
			cle.LOG.debug("login#authenticateUserId");
			var strUserId = objEvent.userId;
			var strPassword = objEvent.password;
			var objService = cle.SERVER.loadResource("userAuthentication_rule_xml");
			objService.setOperation("UserAuthenticationOp");
			objService.setEndpointURL(login.getEndpoint());
			objService.userId = strUserId;
			objService.password = strPassword;
			cle.LOG.trace("userId: " + strUserId);
			// subscribe
			objService.subscribe(jsx3.net.Service.ON_SUCCESS,
				function(objEvent){
					//persist login id and password
					cle.settings.put('userId',strUserId);
					cle.settings.put('pwd',strPassword);

					var responseXML = objEvent.target.getInboundDocument();
					if (responseXML){
						cle.LOG.trace(responseXML.toString());
						//retrieve ns0:AuthenticationResult
						var resultDoc = new jsx3.xml.Document().loadXML(responseXML.toString());
						resultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/SecurityConfiguration/UserAuthenticationResponse"');
						var objResultNode = resultDoc.selectSingleNode("//ns0:AuthenticationResult");
						if (objResultNode != null){
							var strResult = objResultNode.getValue();
							if (!jsx3.util.strEmpty(strResult)){
								cle.LOG.trace(strResult);
								var objAuthDoc = new jsx3.xml.Document();
								//test for encoded XML
								var pattern = new RegExp("&lt;"); // test for less than sign '<' as escaped text
								if (pattern.test(strResult))
									strResult = strResult.replace(/&lt;/g, '<').replace(/&gt;/g,'>').replace(/&quot;/g, '"');
								objAuthDoc.loadXML(strResult);
								if (!objAuthDoc.hasError()){
									//store authorization result in local data cache
									cle.SERVER.getCache().setDocument(login.AUTHORIZATION_CACHE_ID,objAuthDoc);
								}
								else {
									//TODO: report malformed XML using ljss lookup
									cle.LOG.warn("login#authenticateUserId malformed XML in AuthenticationResult response.");
								}
							}
						}
						//publish message notification
						cle.SERVER.publish({subject:"userIdAuthenticated", cacheId:login.AUTHORIZATION_CACHE_ID, userId: strUserId});
					}
					else {
						//TODO: report empty result using ljss lookup
						cle.LOG.warn("login#authenticateUserId AuthenticationResult not found.");
					}
			});
			objService.subscribe(jsx3.net.Service.ON_ERROR,
			  function(objEvent){
					//enable button
					login.enableLoginButton();
					//get the request object status
					var strStatus = objEvent.target.getRequest().getStatus();
					var strStatusText = objEvent.target.getRequest().getStatusText();
					if (jsx3.util.strEmpty(strStatusText)){
						//try to lookup error description from LJSS
						strStatusText = cle.utils.getProperty("http-" + strStatus);
					}
					cle.LOG.warn("The service call failed. The HTTP Status code is: " + strStatus);
					var responseXML = objEvent.target.getRequest().getResponseXML();
					if (responseXML != null){
						cle.LOG.trace(responseXML.toString());
						var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
						faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
						var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
						if (objCodeNode != null){
							var strFaultCode = objCodeNode.getValue();
							cle.LOG.trace("response fault code: " + strFaultCode);
							//check for registered fault code
							var strFaultCodeMessage = cle.utils.getProperty(strFaultCode);
							if (!jsx3.util.strEmpty(strFaultCodeMessage)){
								cle.SERVER.publish({subject:"loginResponseFault",code:strFaultCode,message:strFaultCodeMessage});
							}
							else {
								cle.SERVER.publish({subject:"loginResponseFault",code:strFaultCode,message:strStatusText});								
							}
						}
					}
					else {
						cle.SERVER.publish({subject:"loginResponseFault",code:strStatus,message:strStatusText});
					}
			});
			objService.subscribe(jsx3.net.Service.ON_INVALID,
			  function(objEvent){
					//enable button
					login.enableLoginButton();
					var strCaption = cle.utils.getProperty('login_invalidRequestCaption');
					var strMessage = cle.utils.getProperty('login_invalidRequestMessage');
					objEvent.target.getServer().alert(strCaption,strMessage + "\r\n" + objEvent.message);
				});
			objService.setTimeout(login.TIMEOUT,
			  function(objEvent){
				//enable button
				login.enableLoginButton();
				var strCaption = cle.utils.getProperty('login_timeoutCaption');
				var strMessage = cle.utils.getProperty('login_timeoutMessage');
				objEvent.target.getServer().alert(strCaption,strMessage);
			});

			// call the service
			objService.doCall();

		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("login#authenticateUserId error: " + e.getMessage());
		}
	};
	/**
	 * Handle a login 'fault' response
	 */
	login.onLoginResponseFault = function(objMessage) {
		try {
			cle.LOG.debug("login#onLoginResponseFault");
			var strFaultCode = objMessage.code;
			var strFaultMessage = objMessage.message;
			var strCaption = cle.utils.getProperty("login_errorCaption");
			var strOK = cle.utils.getProperty("m_ok");
			var objParams = {width: 300, height: 150, noTitle: false, nonModal: false};
			cle.SERVER.alert(strCaption,strFaultMessage,null,strOK,objParams);
			//enable button
			login.enableLoginButton();
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("login#onLoginResponseFault error: " + e.getMessage());
		}
	};
	login.enableLoginButton = function() {
		try {
			//enable button
			var objButton = cle.SERVER.getJSXByName("loginButton");
			if (objButton != null)
				objButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("login#enableLoginButton error: " + e.getMessage());
		}
	};

	//subscriptions
	cle.SERVER.subscribe("loginRequest",login.authenticateUserId);
	cle.SERVER.subscribe("loginResponseFault",login.onLoginResponseFault);
});
