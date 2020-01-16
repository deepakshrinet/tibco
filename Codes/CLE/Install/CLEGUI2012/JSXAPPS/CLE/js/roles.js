jsx3.lang.Package.definePackage("cle.roles", function(roles) {
	roles.AVAILABLE_ROLES = jsx3.$A([]);
	roles.USER_ROLES = jsx3.$A([]);
	roles.SUPER_USER_GROUP_NAME = "CLEAdmin";
	roles.ENDPOINT_HOST = "http://localhost:9950";
	roles.ENDPOINT_URL = "/SecurityManagement/GUIServices/intfACL-service.serviceagent/intfwsUpdateRoleACLEndpoint0";
	roles.TIMEOUT = 20 * 1000; //20 seconds

	roles.getEndpointHost = function() {
		return roles.ENDPOINT_HOST;
	};
	roles.setEndpointHost = function(strEndpointHost) {
		roles.ENDPOINT_HOST = strEndpointHost;
	};
	roles.getEndpointUrl = function() {
		return roles.ENDPOINT_URL;
	};
	roles.setEndpointUrl = function(strEndpointUrl) {
		roles.ENDPOINT_URL = strEndpointUrl;
	};
	roles.getEndpoint = function() {
		return roles.ENDPOINT_HOST + roles.ENDPOINT_URL;
	};
	/**
	 * provides an asynchronous wrapper to retrieve all available roles
	 * @return {jsx3.$AsyncRV} string array of all roles
	 */
	roles.getAvailableRoles = jsx3.$Y(function(cb) {
		try {
			cle.LOG.debug("roles#getAvailableRoles");
			roles.AVAILABLE_ROLES = jsx3.$A([]); //reset available roles
			var rv = roles.availableRolesRetrievalOp();
			rv.when(function(isSuccess){
				cb.done(roles.AVAILABLE_ROLES);
			});
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("roles#getAvailableRoles error: "
					+ e.getMessage());
		}
	});
	/**
	 * provides an asynchronous wrapper to retrieve all roles by user id
	 * @return {jsx3.$AsyncRV} string array of all user roles
	 */
	roles.getUserRoles = jsx3.$Y(function(cb) {
		cle.LOG.debug("roles#getUserRoles");
		var strUserId = cb.args()[0];
		roles.USER_ROLES = jsx3.$A([]); //reset user roles
		roles.userRolesRetrievalOp(strUserId).when(
			function(isSuccess){
				cb.done(roles.USER_ROLES);
			}
		);
	});
	/**
	 * lookup role name in local array
	 * @param {string} role name
	 * @return {jsx3.Boolean}
	 */
	roles.hasRole = function(strRole) {
		return (roles.USER_ROLES.contains(strRole))? jsx3.Boolean.TRUE: jsx3.Boolean.FALSE;
	};
	/**
	 * lookup to determine if 'Super Users' role is present
	 * @return {jsx3.Boolean}
	 */
	roles.isSuperUser = function(){
		return roles.hasRole(roles.SUPER_USER_GROUP_NAME);
	};
	/**
	 * uses asynchronous wrapper to retrieve all roles by user id
	 * @param objEvent inbound event published from cle.login.authenticateUserId#onSuccess
	 */
	roles.addUserRoles = function(objEvent) {
		try {
			cle.LOG.debug("roles.addUserRoles");
			roles.USER_ROLES = jsx3.$A([]); //reset user roles
			var strUserId = objEvent.userId;
			var rv = roles.userRolesRetrievalOp(strUserId);
			rv.when(function(isSuccess){
				cle.LOG.trace("roles#addUserRoles: " + isSuccess);
			});
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("roles#addUserRoles error: "
					+ e.getMessage());
		}
	};
	/**
	 *  asynchronous service call to retrieve all available roles
	 */
	roles.availableRolesRetrievalOp = jsx3.$Y(function(cb) {
		var objService = cle.SERVER.loadResource("availableRolesRetrievalOp_rule_xml");
		objService.setOperation("AvailableRolesRetrievalOp");
		  objService.setEndpointURL(roles.getEndpoint());
		  
		  //set service response timeout handler
		  objService.setTimeout(roles.TIMEOUT,
			  function(objEvent){
				var strTitle = cle.utils.getProperty("m_timeout");
				var strMessage = cle.utils.getProperty("m_timeoutMessage");
				objEvent.target.getServer().alert(strTitle,strMessage);
				cb.done(false);
		  });
		
		  //inner function handler for successful response
		  objService.subscribe(jsx3.net.Service.ON_SUCCESS,
			function(objEvent) {
				var responseXML = objEvent.target.getInboundDocument();
				var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());
				cle.LOG.trace('roles#availableRolesRetrievalOp responseXML: ' + objXML.toString());
				objXML.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/SecurityConfiguration/AllRolesRetrievalResponse"');
				var objRoleNodes = objXML.selectNodes("//ns0:rolename");
				jsx3.$A(objRoleNodes.toArray()).each(function(node){
					var strValue = node.getValue();
					(!roles.AVAILABLE_ROLES.contains(strValue))?
						roles.AVAILABLE_ROLES.push(strValue):
						null;
				});
				cle.LOG.trace("roles#availableRolesRetrievalOp done.");
				cb.done(true);
		  });
			//inner function handler for soap fault response
			objService.subscribe(jsx3.net.Service.ON_ERROR,
			  function(objEvent) {
				var responseXML = objEvent.target.getRequest().getResponseXML();
				//cle.LOG.trace(responseXML.toString());
				var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
				faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
				var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
				if (objCodeNode != null){
					var strFaultCode = objCodeNode.getValue();
					cle.LOG.warn("response fault code: " + strFaultCode);
					//get fault message from ns:Message
					var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
					var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
					cle.SERVER.publish({subject:"rolesFault",code:strFaultCode,message:strFaultMessage,src:"userRolesRetrievalOp"});
				}
				cb.done(false);
			});
		  //inner function handler for invalid request
			objService.subscribe(jsx3.net.Service.ON_INVALID,
					  function(objEvent) {
						var strCaption = cle.utils.getProperty('m_invalid');
						var strMessage = cle.utils.getProperty('m_invalidMessage');
						objEvent.target.getServer().alert(
								strCaption,
								strMessage + "\n\n"
										+ objEvent.message);
						cb.done({status:false});
					});
		
		  //call the service
		  objService.doCall();
		});

	/**
	 *  asynchronous service call to retrieve user roles
	 *  @param {string} userId
	 */
	roles.userRolesRetrievalOp = jsx3.$Y(function(cb) {
		var objService = cle.SERVER.loadResource("userRolesRetrievalOp_rule_xml");
		objService.setOperation("UserRolesRetrievalOp");
		  objService.userId = cb.args()[0];
		  objService.setEndpointURL(roles.getEndpoint());
		  
		  //set service response timeout handler
		  objService.setTimeout(roles.TIMEOUT,
			  function(objEvent){
				var strTitle = cle.utils.getProperty("m_timeout");
				var strMessage = cle.utils.getProperty("m_timeoutMessage");
				objEvent.target.getServer().alert(strTitle,strMessage);
				//return unsuccessful boolean
				cb.done(false);
		  });
		
		  //inner function handler for successful response
		  objService.subscribe(jsx3.net.Service.ON_SUCCESS,
			function(objEvent) {
				var responseXML = objEvent.target.getInboundDocument();
				var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());
				cle.LOG.trace('roles#userRolesRetrievalOp responseXML: ' + objXML.toString());
				objXML.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/SecurityConfiguration/AllRolesRetrievalResponse"');
				var objRoleNodes = objXML.selectNodes("//ns0:rolename");
				jsx3.$A(objRoleNodes.toArray()).each(function(node){
					roles.USER_ROLES.push(node.getValue());
				});
				cle.LOG.trace("roles#userRolesRetrievalOp done.");
				//return successful boolean
				cb.done(true);
			});
			//inner function handler for soap fault response
			objService.subscribe(jsx3.net.Service.ON_ERROR,
			  function(objEvent) {
				var responseXML = objEvent.target.getRequest().getResponseXML();
				//cle.LOG.trace(responseXML.toString());
				var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
				faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
				var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
				if (objCodeNode != null){
					var strFaultCode = objCodeNode.getValue();
					cle.LOG.warn("response fault code: " + strFaultCode);
					//get fault message from ns:Message
					var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
					var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
					cle.SERVER.publish({subject:"rolesFault",code:strFaultCode,message:strFaultMessage,src:"userRolesRetrievalOp"});
				}
				//return unsuccessful boolean
				cb.done(false);
			});
		  //inner function handler for invalid request
			objService.subscribe(jsx3.net.Service.ON_INVALID,
					  function(objEvent) {
						var strCaption = cle.utils.getProperty('m_invalid');
						var strMessage = cle.utils.getProperty('m_invalidMessage');
						objEvent.target.getServer().alert(
								strCaption,
								strMessage + "\n\n"
										+ objEvent.message);
						cb.done({status:false});
					});
		
		  //call the service
		  objService.doCall();
		});

	/* user roles by app */
	roles.userRolesAppsRetrievalOp = jsx3.$Y(function(cb) {
		var objService = cle.SERVER.loadResource("userRolesAppsRetrievalOp_rule_xml");
		objService.setOperation("UserRolesAppsRetrievalOp");
		  objService.userId = cb.args()[0];
		  objService.setEndpointURL(roles.getEndpoint());
		  
		  //set service response timeout handler
		  objService.setTimeout(roles.TIMEOUT,
			  function(objEvent){
				var strTitle = cle.utils.getProperty("m_timeout");
				var strMessage = cle.utils.getProperty("m_timeoutMessage");
				objEvent.target.getServer().alert(strTitle,strMessage);
				cb.done(false);
		  });
		
		  //inner function handler for successful response
		  objService.subscribe(jsx3.net.Service.ON_SUCCESS,
			function(objEvent) {
				var responseXML = objEvent.target.getInboundDocument();
				var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());
				cle.LOG.trace(objXML.toString());
				//TODO: set user roles and privileges
				cb.done(true);
		  });
		//inner function handler for soap fault response
		objService.subscribe(jsx3.net.Service.ON_ERROR,
		  function(objEvent) {
			var responseXML = objEvent.target.getRequest().getResponseXML();
			//cle.LOG.trace(responseXML.toString());
			var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
			faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
			var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
			if (objCodeNode != null){
				var strFaultCode = objCodeNode.getValue();
				cle.LOG.warn("response fault code: " + strFaultCode);
				//get fault message from ns:Message
				var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
				var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
				cle.SERVER.publish({subject:"rolesFault",code:strFaultCode,message:strFaultMessage,src:"userRolesAppsRetrievalOp"});
			}
			cb.done(false);
		});
	  //inner function handler for invalid request
		objService.subscribe(jsx3.net.Service.ON_INVALID,
				  function(objEvent) {
					var strCaption = cle.utils.getProperty('m_invalid');
					var strMessage = cle.utils.getProperty('m_invalidMessage');
					objEvent.target.getServer().alert(
							strCaption,
							strMessage + "\n\n"
									+ objEvent.message);
					cb.done({status:false});
				});
	
	  //call the service
	  objService.doCall();
	});
	
});
