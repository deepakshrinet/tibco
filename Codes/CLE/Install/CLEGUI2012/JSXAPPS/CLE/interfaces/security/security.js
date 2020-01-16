jsx3.require("jsx3.gui.Form");

jsx3.lang.Package.definePackage(
  "cle.security",
  function(security) {
	  
	  security.ENDPOINT_HOST = "http://localhost:9950";
	  security.ENDPOINT_URL = "/SecurityManagement/GUIServices/intfACL-service.serviceagent/intfwsUpdateRoleACLEndpoint0";
	  security.TIMEOUT = 20 * 1000; //20 seconds
	  security.APPLICATION_LIST_CACHE_ID = "securityAppIdList_cdf";
	  security.ROLE_LIST_CACHE_ID = "securityRoleNameList_cdf";
	  security.ACL_CACHE_ID = "securityACL_cdf";
	  security.ACL_MODIFIED_SUBJECT = "aclModified";
	  security.APPLICATION_CACHE_ID = "applicationList_cdf";
	  
	  security.getEndpointHost = function() {
		  return security.ENDPOINT_HOST;
	  };
	  security.setEndpointHost = function(strEndpointHost) {
		  security.ENDPOINT_HOST = strEndpointHost;
	  };
	  security.getEndpointUrl = function() {
		  return security.ENDPOINT_URL;
	  };
	  security.setEndpointUrl = function(strEndpointUrl) {
		  security.ENDPOINT_URL = strEndpointUrl;
	  };
	  security.getEndpoint = function() {
		  return security.ENDPOINT_HOST + security.ENDPOINT_URL;
	  };
	  security.init = function(){
		  cle.LOG.trace("security#init");
		  //var objDoc = new jsx3.xml.CDF.Document.newDocument();
		  //cle.SERVER.getCache().setDocument(security.ACL_CACHE_ID, objDoc);
		  security.setSubscriptions();
	  };

	  security.setSubscriptions = function(){
		  cle.LOG.trace("security#setSubscriptions");
		  //when the main UI is added, this method will be invoked
		  cle.SERVER.subscribe("mainReady",security.onMainReady);
		  cle.SERVER.getCache().subscribe(security.APPLICATION_CACHE_ID,security.onApplicationListUpdate);
		  cle.SERVER.subscribe("securityFault",security.onSecurityFault);
		  cle.SERVER.subscribe(security.ACL_MODIFIED_SUBJECT,security.onAclModified);
	  };
	  security.selectAppId = function(objJSX,strRecordId){
		  cle.LOG.trace("security#selectAppId");
		  //find jsx3.gui.CDF ancestor
		  var objCDF = objJSX.getAncestorOfType("jsx3.gui.CDF");
		  if (objCDF != null){
			  var objRoleCombo = objCDF.getDescendantOfName("roleCombo",true,false);
			  if (objRoleCombo != null){
				  objRoleCombo.setValue("");
				  objRoleCombo.setEnabled(jsx3.gui.Form.STATEENABLED,true);
			  }
			  objCDF.setCDFId(strRecordId);
			  objCDF.read(true);
			  //disable the checkboxes
			  var objCheckboxes = objCDF.findDescendants(function(descendant){return (descendant.instanceOf(jsx3.gui.CheckBox));}, true, true, false, false);
			  if (objCheckboxes != null)
				  jsx3.$A(objCheckboxes).each(function(checkbox){
					  checkbox.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
				  });
		  }
	  };
	  security.selectRoleName = function(objJSX,strRecordId){
		  try {
			  cle.LOG.debug("security#selectRoleName");
			  cle.LOG.trace("security#selectRoleName objJSX: " + objJSX.getName());
			  var objRoleRecord = objJSX.getRecord(strRecordId);
			  var out = "";
			  for (var p in objRoleRecord){
				  out += p + ": " + objRoleRecord[p] + "\r\n";
			  }
			  cle.LOG.debug("security#selectRoleName role record: " + out);
			  var strSelectedRoleName = objRoleRecord.jsxtext;
			  cle.LOG.trace("security#selectRoleName record id: " + strRecordId + ", role name: " + strSelectedRoleName);
			  //find jsx3.gui.CDF ancestor
			  var objCDF = objJSX.getAncestorOfType("jsx3.gui.CDF");
			  if (objCDF != null){
				  var objAppIdCombo = objCDF.getDescendantOfName("appIdCombo",true,false);
				  if (objAppIdCombo != null){
					  var strApplicationId = objAppIdCombo.getValue();
					  cle.LOG.trace("security#selectRoleName appId value: " + strApplicationId);
					  //call service to get existing permissions
					  var rv = security.retrieveACLOp(strSelectedRoleName, strApplicationId);
					  rv.when(function(isSuccess){
						  var objRecordNode = objCDF.getXML().selectSingleNode('//record[@role="'+strSelectedRoleName+'" and @appId="'+strApplicationId+'"]');
						  var strNodeId = (objRecordNode != null) ? objRecordNode.getAttribute("jsxid"): jsx3.xml.CDF.getKey();
						  cle.LOG.trace("security#selectRoleName nodeId: " + strNodeId);
						  if (!isSuccess){
							  //as a workaround, add record manually
							  cle.LOG.warn("security#selectRoleName problem with retrieveACLOp response, creating local record manually.");
							  if (objRecordNode == null){
								  objCDF.insertRecord({jsxid:strNodeId, appId:strApplicationId, role:strSelectedRoleName},"jsxroot",true);
							  }
						  }
						  objCDF.setCDFId(strNodeId);
						  objCDF.read(true);
						  //enable the checkboxes
						  var objCheckboxes = objCDF.findDescendants(function(descendant){return (descendant.instanceOf(jsx3.gui.CheckBox));}, true, true, false, false);
						  if (objCheckboxes != null)
							  jsx3.$A(objCheckboxes).each(function(checkbox){
								  checkbox.setEnabled(jsx3.gui.Form.STATEENABLED,true);
							  });
					  });
				  }
			  }
		  } catch (e) {
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("security#selectRoleName error: " + e.getMessage());
		  }
	  };
	  security.onSecurityFault = function(objEvent) {
		  try {
			  switch (objEvent.code) {
			  //ignore error
			  case 'BW-XML-100013':
				  break;
			  default:
				  var strCaption = cle.utils.getProperty("m_faultCaption");
				  var strMessage = cle.utils.getProperty(objEvent.code);
				  //use included message if the code translation is unavailable
				  if (jsx3.util.strEmpty(strMessage)) strMessage = objEvent.message;
				  var strOK = cle.utils.getProperty("m_ok");
				  var objParams = {width: 300, height: 150, noTitle: false, nonModal: false};
				  cle.SERVER.alert(strCaption, objEvent.src + ": <br/>" + strMessage,null,strOK,objParams);
				  break;
			  }
		  } catch (e) {
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("security#onSecurityFault error: " + e.getMessage());
		  }
	  };
	  security.togglePrivilege = function(objJSX,intChecked){
		  cle.LOG.trace("security#togglePrivilege");
		  var objCDF = objJSX.getAncestorOfType("jsx3.gui.CDF");
		  var strId = objCDF.getCDFId();
		  cle.LOG.trace("CDF Id: " + strId);
		  var strAttr = objJSX.getCDFAttribute();
		  cle.LOG.trace("attr: " + strAttr);
		  objCDF.insertRecordProperty(strId,strAttr,intChecked,true);
		  objCDF.insertRecordProperty(strId,'hasChanges','1',true);
		  cle.SERVER.publish({subject:security.ACL_MODIFIED_SUBJECT, target: objJSX});
	  };
	  security.onAclModified = function(objEvent){
		  cle.LOG.trace("security#onAclModified");
		  var objJSX = objEvent.target;
		  var objCDF = objJSX.getAncestorOfType("jsx3.gui.CDF");
		  if (objCDF != null){
			  var objUpdateButton = objCDF.getDescendantOfName("updateRoleACLButton",true,false);
			  if (objUpdateButton != null){
				  //enable 'Update' button
				  objUpdateButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
			  }
		  }
	  };
	  security.resetForm = function(objCDF){
		  cle.LOG.trace("security#resetForm");
		  var objUpdateButton = objCDF.getDescendantOfName("updateRoleACLButton",true,false);
		  if (objUpdateButton != null){
			  objUpdateButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
		  }
		  var objAppIdCombo = objCDF.getDescendantOfName("appIdCombo",true,false);
		  if (objAppIdCombo != null){
			  objAppIdCombo.setValue("");
		  }
		  var objRoleCombo = objCDF.getDescendantOfName("roleCombo",true,false);
		  if (objRoleCombo != null){
			  objRoleCombo.setValue("");
			  objRoleCombo.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
		  }
		  objCDF.setCDFId("");
		  objCDF.read(true);
		  //disable the checkboxes
		  var objCheckboxes = objCDF.findDescendants(function(descendant){return (descendant.instanceOf(jsx3.gui.CheckBox));}, true, true, false, false);
		  if (objCheckboxes != null){
			  jsx3.$A(objCheckboxes).each(function(checkbox){
				  checkbox.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
			  });
		  }
	  };
	  security.refreshACLView = function(objButton){
		  cle.LOG.trace("security#refreshACLView");
		  var objCDF = objButton.getAncestorOfType("jsx3.gui.CDF");
		  if (objCDF != null){
			  var objChangedRecords = objCDF.getXML().selectNodes("//record[@hasChanges='1']");
			  if ((objChangedRecords != null) && (objChangedRecords.size() > 0)){
				  var strTitle = cle.utils.getProperty("m_confirmCaption");
				  var strMessage = cle.utils.getProperty("security_refreshMessage");
				  var strOk = cle.utils.getProperty("m_ok");
				  var strNo = cle.utils.getProperty("m_no");
				  var strCancel = cle.utils.getProperty("m_cancel");
				  var btnDefault = 2;
				  //parameters may include fields 'width' {int}, 'height' {int}, 'noTitle' {boolean}, and 'nonModal' {boolean}.
				  var objParams = {width: 260, height: 160, noTitle: false, nonModal: false};
				  var objDialog = cle.SERVER.confirm(
						  //caption title
						  strTitle,
						  //message to display
						  strMessage,
						  //fctOnOk
						  function(objDialog){
							  cle.LOG.debug("OK selected, refreshing.");
							  objCDF.clearXmlData();
							  security.resetForm(objCDF);
							  objDialog.doClose();
						  },
						  //fctOnCancel
						  function(objDialog){
							  cle.LOG.debug("CANCEL selected, closing dialog.");
							  objDialog.doClose();
						  },
						  strOk,
						  strCancel,
						  btnDefault,
						  //fctOnNo
						  null,
						  null,
						  objParams
				  );
			  }
			  else {
				  //no harm in just clearing the contents
				  objCDF.clearXmlData();
				  security.resetForm(objCDF);
			  }
		  }
	  };
	  security.updateACL = function(objButton){
		  cle.LOG.trace("security#updateACL");
		  var objCDF = objButton.getAncestorOfType("jsx3.gui.CDF");
		  if (objCDF != null){
			  var rv = security.setRoleACLOp(objCDF.getXMLId());
			  rv.when(function(isSuccess){
				  cle.LOG.trace("security#updateACL result: " + isSuccess);
				  if (isSuccess){
					  //disable the 'Update' button
					  objButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
					  //remove 'hasChanges' flag
					  var objChangedRecords = objCDF.getXML().selectNodes("//record[@hasChanges]");
					  if (objChangedRecords != null){
						  jsx3.$A(objChangedRecords.toArray()).each(function(record){
							  record.removeAttribute("hasChanges");
						  });
					  }
				  }
			  });
		  }
	  };
	  security.onApplicationListUpdate = function(objEvent) {
			var strAction = objEvent.action;
			if (strAction == jsx3.app.Cache.ADD || strAction == jsx3.app.Cache.CHANGE){
				//get the applicationList_cdf, clone it and store in local cache by designated id
				var objCache = cle.SERVER.getCache();
				var objAppListDoc = objCache.getDocument(security.APPLICATION_CACHE_ID);
				if (objAppListDoc != null){
					objCache.setDocument(security.APPLICATION_LIST_CACHE_ID, objAppListDoc.cloneDocument());
				}
			}
	  };
	  /**
	   * add Security tab to main UI
	  */
	  security.onMainReady = function(objEvent) {
			try {
				cle.LOG.trace("security#onMainReady");
				var objMainPane = objEvent.objJSX;
				var objMainTabbedPane = objMainPane.getDescendantOfName("mainTabbedPane",true,false);
				if (objMainTabbedPane != null){
					cle.LOG.trace("found objMainTabbedPane");
					cle.LOG.debug("security: testing for super user group member");
					if (cle.roles.isSuperUser()==jsx3.Boolean.TRUE){
						var objSecurityTabRV = security.addTab(objMainTabbedPane);
						objSecurityTabRV.when(function(objSecurityTab){
							cle.LOG.trace("publishing 'loadSecurityTabDependencies'");
							cle.SERVER.publish({subject: "loadSecurityTabDependencies", appIdCacheId: security.APPLICATION_LIST_CACHE_ID, roleCacheId: security.ROLE_LIST_CACHE_ID});
							objMainTabbedPane.paintChild(objSecurityTab);
							cle.LOG.trace("done loading security tab");
						});
					}
					else {
						cle.LOG.debug("security: not a member of super users group");
					}
				}
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("security#onMainReady error: " + e.getMessage());
			}
		};
		security.addTab = jsx3.$Y(function(cb) {
			try{
				var objParent = cb.args()[0];
				var strURI = cle.SERVER.resolveURI("interfaces/security/securityTab_gui.xml");
				var objTab = objParent.load(strURI,false);
				cb.done(objTab);
			} catch (e){
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("security#addTab error: " + e.getMessage());
			}
		});
	    security.setRoleACLOp = jsx3.$Y(function(cb) {
	    	var objService = cle.SERVER.loadResource("setRoleACLOp_rule_xml");
	    	objService.setOperation("SetRoleACLOp");
	    	objService.setEndpointURL(security.getEndpoint());
	    	var strXSLUrl = cle.SERVER.resolveURI("interfaces/security/cdf2setRoleACLRequest.xsl");
	    	cle.LOG.trace("retrieving XSL: " + strXSLUrl);
	    	var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
	    	if (!objXSL.hasError()){
	    		cle.LOG.trace('security#setRoleACLOp found XSL');
	    		var strCacheId = cb.args()[0];
	    		cle.LOG.trace("retrieving " + strCacheId);
	    		var objXML = cle.SERVER.getCache().getDocument(strCacheId);
	    		//get transformation XSL document
	    		cle.LOG.trace("transforming CDF to SOAP");
	    		var templateProcessor = new jsx3.xml.Template(objXSL);               
	    		var objDoc = templateProcessor.transformToObject(objXML);
	    		if (objDoc != null){
	    			//TODO: validate at least one app id is included
					/*
					 * Note: The outbound stub document is generally used to switch to an alternate XML prototype
					 * but if the 'input' element of the WSDL is removed, then an entire document can be sent
					 * to the service.  If the 'input' element is not removed in the XML Mapping utility
					 * there will be 2 elements sent where the second one is empty.
					 */
	    			objService.setOutboundStubDocument(objDoc);
	    		}
	    	}
	    	else {
	    		cle.LOG.warn("security#setRoleACLOp XSL document at " + strXSLUrl + " has problems.");
	    		cb.done(false);
	    	}

	    	//set service response timeout handler
	    	objService.setTimeout(security.TIMEOUT,
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
		    		//TODO: handle response?
		    		cle.LOG.trace(responseXML.toString());
		    		cb.done(true);
	    	});
	    	//inner function handler for soap fault response
	    	objService.subscribe(jsx3.net.Service.ON_ERROR,
	    		function(objEvent) {
		    		var responseXML = objEvent.target.getRequest().getResponseXML();
		    		//cle.LOG.trace(responseXML.toString());
		    		var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
		    		faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
					cle.LOG.warn("security#setRoleACLOp onError response doc: " + faultDoc.toString());
		    		var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
		    		if (objCodeNode != null){
		    			var strFaultCode = objCodeNode.getValue();
		    			cle.LOG.warn("response fault code: " + strFaultCode);
		    			//get fault message from ns:Message
		    			var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
		    			var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
		    			cle.SERVER.publish({subject:"securityFault",code:strFaultCode,message:strFaultMessage,src:"setRoleACLOp"});
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

	    	// call the service
	    	objService.doCall();
	    });
		/* role ACL */
	    security.retrieveACLOp = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("retrieveACLOp_rule_xml");
			objService.setOperation("RetrieveACLOp");
			  objService.roleName = cb.args()[0];
			  objService.applicationId = cb.args()[1];
			  objService.setEndpointURL(security.getEndpoint());
			  
			  //set service response timeout handler
			  objService.setTimeout(security.TIMEOUT,
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
					cle.LOG.trace('roles#retrieveACLOp response: ' + objXML.toString());
					var aclDoc = cle.SERVER.getCache().getDocument(security.ACL_CACHE_ID);
					objXML.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/SecurityConfiguration/RolePermissionInformation"');
					var objRoleNode = objXML.selectSingleNode("//ns0:RolePermissionsInfo/child::ns0:rolename");
					var objAppIdNode = objXML.selectSingleNode("//ns0:RolePermissionsInfo/child::ns0:appid");
					var idValue = objAppIdNode.getValue().replace(/\ /g,'');
					var roleValue = objRoleNode.getValue().replace(/\ /g,'');
					var id = idValue + '_' + roleValue;
					var record = {jsxid:id, appId:objAppIdNode.getValue(), role:objRoleNode.getValue()};
					var objPermissionsNode = objXML.selectSingleNode("//ns0:RolePermissionsInfo/child::ns0:permissions");
					var objPermissionIds = objPermissionsNode.selectNodes("descendant::ns0:permissionID");
					jsx3.$A(objPermissionIds.toArray()).each(function(node){
						cle.LOG.trace("permissionId: " + node.getValue());
						record['p' + node.getValue()] = 1;
					});
					if (aclDoc != null){
						aclDoc = jsx3.xml.CDF.Document.wrap(aclDoc);
						aclDoc.insertRecord(record,"jsxroot",true);
					}
					cle.LOG.trace("roles#retrieveACLOp done.");
					//return successful
					cb.done(true);
			  });
				//inner function handler for soap fault response
				objService.subscribe(jsx3.net.Service.ON_ERROR,
				  function(objEvent) {
					var responseXML = objEvent.target.getRequest().getResponseXML();
					//cle.LOG.trace(responseXML.toString());
					var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
					cle.LOG.warn("security#retrieveACLOp onError response doc: " + faultDoc.toString());
					faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
					var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
					if (objCodeNode != null){
						var strFaultCode = objCodeNode.getValue();
						cle.LOG.warn("response fault code: " + strFaultCode);
						//get fault message from ns:Message
						var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
						var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
						cle.SERVER.publish({subject:"securityFault",code:strFaultCode,message:strFaultMessage,src:"retrieveACLOp"});
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
cle.security.init();
