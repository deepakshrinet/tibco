jsx3.require("jsx3.gui.Form");

jsx3.lang.Package.definePackage("cle.configuration.rendering",
  function(rendering) {
	rendering.ENDPOINT_HOST = "http://localhost:9950";
	rendering.ENDPOINT_URL = "/Administration/GUIServices/RenderServices/intfRenderConfig-service.serviceagent/RenderConfigEndpoint";
	rendering.TIMEOUT = 20 * 1000; //20 seconds

	rendering.setSubscriptions = function(){
		cle.LOG.trace("rendering#setSubscriptions");
		cle.SERVER.subscribe("renderingFault",rendering.handleFault);
	};
	rendering.getEndpointHost = function() {
		return rendering.ENDPOINT_HOST;
	};
	rendering.setEndpointHost = function(strEndpointHost) {
		rendering.ENDPOINT_HOST = strEndpointHost;
	};
	rendering.getEndpointUrl = function() {
		return rendering.ENDPOINT_URL;
	};
	rendering.setEndpointUrl = function(strEndpointUrl) {
		rendering.ENDPOINT_URL = strEndpointUrl;
	};
	rendering.getEndpoint = function() {
		return rendering.ENDPOINT_HOST + rendering.ENDPOINT_URL;
	};
	rendering.createNewRendering = function(objJSX){
		try{
			cle.LOG.trace("rendering#createNewRendering");
			//TODO: enable the 'id' field for input and focus
			var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid").getParent();
			var objInputs = objParent.getDescendantsOfType("jsx3.gui.Form",false);
			cle.LOG.trace("found " + objInputs.length + " inputs");
			var objRecord = {};
			jsx3.$A(objInputs).each(function(input){
				objRecord[input.getCDFAttribute()] = input.getValue();
				cle.LOG.trace(input.getName() + '/' +input.getCDFAttribute() + ": " + input.getValue());
				//TODO: validate input
				/* example: the same id should not be allowed twice */
			});
			var rv = rendering.createRenderConfigOp(objRecord['ApplicationID'], objRecord['RenderID'], objRecord['XSLT'], objRecord['CSS']);
			rv.when(function(response){
				//TODO: use result.status instead of isSuccess
				if (response.status){
					cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'rendering', appId:objRecord['ApplicationID']});
					objJSX.getAncestorOfType("jsx3.gui.Dialog").doClose();
				}
				//TODO: notify user of problem for a retry
			});                
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("rendering#createNewRendering error: "
					+ e.getMessage());
		}
	};
	rendering.editConfiguration = function(objJSX){
		cle.LOG.trace("rendering#editConfiguration");
		//disable the edit button, enable the save changes button
		objJSX.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
		var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid");
		var objUpdateButton = objParent.getDescendantOfName("updateRenderConfigBtn",true,false);
		objUpdateButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
		//TODO: modify the record to set the 'readOnly' to '0'
		var objCDF = cle.SERVER.getCache().getDocument('configurationEditor_cdf');

		var objRenderIdRecord = objCDF.selectSingleNode('//record[@jsxid="RenderID"]');
		if (objRenderIdRecord){
			//TODO: set a 'dirty' handler to notify if another record is selected
			var referenceId = objRenderIdRecord.getAttribute("referenceId");
			cle.SERVER.publish({subject:'configEdit', recordId:referenceId, state:jsx3.Boolean.TRUE});
		}
		
		var XsltEditor = objParent.getDescendantOfName("XsltEditor",true,false);
		if (XsltEditor != null){
			var strXSLContent = "";
			//exchange xsl view with editor
			var objBlockX = XsltEditor.getDescendantOfName('XsltViewer',true,false);
			if (objBlockX != null){
				var objXML = objBlockX.getXML();
				strXSLContent = objXML.toString();
				XsltEditor.removeChildren();
			}
			
			//the addin named 'editor' started, but the 'code.editor' plugin may not have loaded
			var cePI = cle_Editors.getEngine().getPlugIn("code.editor");
			if (cePI) {
				cePI.load().when(jsx3.$F(function() {
					//get the resource for the 'code_editor_xml' UI
					var rsrc = cePI.getResource("code_editor_xml");
					rsrc.load().when(function() {
						var objXsltEditor = cePI._currentXsltEditor = cePI.loadRsrcComponent(rsrc, XsltEditor);
						objXsltEditor.initAsType("xml");
						objXsltEditor.setTextValue(strXSLContent);
						//TODO: set the scroll bar to top position
						//use placeCursorAtStart or jsx3.html.scrollIntoView(objGUI : HTMLElement, objRoot : HTMLElement, intPaddingX : int, intPaddingY : int)
					});
				}).bind(this));
			 }
			//exchange css view with editor
			var CssEditor = objParent.getDescendantOfName('CssEditor',true,false);
			var CssViewer = CssEditor.getDescendantOfName('CssViewer',true,false);
			var strCssContent = CssViewer.getText();
			CssEditor.removeChildren();
			
			//make sure the plugin loaded
			if (cePI) {
				cePI.load().when(jsx3.$F(function() {
					//get the resource for the 'code_editor_xml' UI
					var rsrc = cePI.getResource("code_editor_xml");
					rsrc.load().when(function() {
						var objCssEditor = cePI._currentCssEditor = cePI.loadRsrcComponent(rsrc, CssEditor);
						objCssEditor.initAsType("css");
						objCssEditor.setTextValue(strCssContent);
						//TODO: set the scroll bar to top position
					});
				}).bind(this));
			 }
		}
	};
	rendering._doDelete = function(objJSX){
		cle.LOG.trace("rendering#_doDelete");
		var objParent = objJSX.getAncestorOfName("configurationViewerPane");
		if (objParent != null){
			//need the CategoryID for the service call.
			var strId = objParent.getRenderId();
			var strApplicationId = objParent.getApplicationId();
			if (!jsx3.util.strEmpty(strId)){
				var rv = rendering.deleteRenderConfigOp(strId, strApplicationId);
				rv.when(function(response){
					if (response.status){
						if (!jsx3.util.strEmpty(strApplicationId)){
							cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'rendering', appId:strApplicationId});
						}
					}
					//TODO: handle error
				});
			}
		}
	};
	rendering.deleteConfiguration = function(objJSX){
		cle.LOG.trace("rendering#deleteConfiguration");
		var strTitle = cle.utils.getProperty("m_confirmCaption");
		var strMessage = cle.utils.getProperty("config_confirmDelete");
		var strOk = cle.utils.getProperty("m_ok");
		var strCancel = cle.utils.getProperty("m_cancel");
		var initBtnDefault = 2; // ok:1, cancel:2, no:3
		//parameters may include fields 'width' {int}, 'height' {int}, 'noTitle' {boolean}, and 'nonModal' {boolean}.
		var objParams = {width: 260, height: 160, noTitle: false, nonModal: false};
		var objDialog = cle.SERVER.confirm(
			//caption title
			strTitle,
			//message to display
			strMessage,
			//fctOnOk
			function(objDialog){
				//call delete
				rendering._doDelete(objJSX);
				objDialog.doClose();
			},
			//fctOnCancel
			function(objDialog){
				objDialog.doClose();
			},
			strOk,
			strCancel,
			initBtnDefault,
			//fctOnNo
			null,
			null,
			objParams
		);
	};
	rendering.updateConfiguration = function(objJSX){
		cle.LOG.trace("rendering#updateConfiguration");
		var cePI = cle_Editors.getEngine().getPlugIn("code.editor");
		if (cePI) {
			var objXsltEditor = cePI._currentXsltEditor;
			var objCssEditor = cePI._currentCssEditor;
			var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid");
			if (objParent != null){
				var objMatrix = objParent.getDescendantOfName("configurationEditorMatrix",true,false);
				if (objMatrix != null){
					var objData = {};
					var strReferenceId = objMatrix.getRecordNode("ApplicationID").getAttribute("referenceId");
					objData['ApplicationID'] = objMatrix.getRecordNode("ApplicationID").getAttribute("jsxvalue");
					objData['RenderID'] = objMatrix.getRecordNode("RenderID").getAttribute("jsxvalue");
					objData['XSLT'] = objXsltEditor.getTextValue();
					objData['CSS'] = objCssEditor.getTextValue();
					var rvUpdateRendering = rendering.updateRenderConfigOp(objData);
					rvUpdateRendering.when(function(result){
						if (result.status){
							//update the configTree
							var objConfigTreeMatrix = cle.SERVER.getJSXByName("configTreeMatrix");
							if (objConfigTreeMatrix){
								var objRecordNode = objConfigTreeMatrix.getRecordNode(strReferenceId);
								if (objRecordNode != null){
									//update attributes
									objRecordNode.setAttribute("XSLT",objData['XSLT']);
									objRecordNode.setAttribute("CSS",objData['CSS']);
									objConfigTreeMatrix.redrawRecord(strReferenceId,jsx3.xml.CDF.UPDATE);
									cle.LOG.trace("rendering#updateConfiguration update complete");
								}
							}
						}
					});
				}
			}
		}
	};
	/**
	 * Create a new rendering persisted at the server
	 *   {String} the parent application id
	 *   {String} the rendering id
	 *   {String} the encoded XSLT string
	 *   {String} the CSS string
	 */
	rendering.createRenderConfigOp = jsx3.$Y(function(cb) {
		var objService = cle.SERVER.loadResource("createRenderConfigOp_rule_xml");
		objService.setOperation("CreateRenderConfigOp");
		objService.setEndpointURL(rendering.getEndpoint());
		objService.applicationId = cb.args()[0];
		objService.id = cb.args()[1];
		objService.xslt = cb.args()[2];
		objService.css = cb.args()[3];

		//set service response timeout handler
		objService.setTimeout(rendering.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
		    cb.done({status:false});
		});

		//inner function handler for successful response
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
			// var responseXML = objEvent.target.getInboundDocument();
		    cb.done({status:true});
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
				cle.SERVER.publish({subject:"renderingFault",code:strFaultCode,message:strFaultMessage,src:"createRenderConfigOp"});
			}
		    cb.done({status:false});
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
	 * Retrieve the all the rendering configurations from the server using application id as the key
	 *   {String}	The id of rendering parent.
	 */
	rendering.retrieveAppSpecificRenderConfigOp = jsx3.$Y(function(cb) {
	  cle.LOG.debug("renderConfig#retrieveAppSpecificRenderConfigOp");
	  var objService = cle.SERVER.loadResource("retrieveAppSpecificRenderConfigOp_rule_xml");
	  objService.setOperation("RetrieveAppSpecificRenderConfigOp");
	  objService.applicationId = cb.args()[0];
	  objService.setEndpointURL(rendering.getEndpoint());
	  
	  //set service response timeout handler
	  objService.setTimeout(rendering.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
		    cb.done({status:false});
	  });
	
	  //inner function handler for successful response
	  objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		function(objEvent) {
			var responseXML = objEvent.target.getInboundDocument();
			var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/renderConfig/renderConfigList2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objCDF = templateProcessor.transformToObject(objXML);
	    		cle.LOG.trace("retrieveRenderConfigDetailOp call completed");
				cb.done({status:true,document:objCDF});
			}
	  });
		//inner function handler for soap fault response
		objService.subscribe(jsx3.net.Service.ON_ERROR,
		  function(objEvent) {
			var responseXML = objEvent.target.getRequest().getResponseXML();
			if (responseXML != null){
				//cle.LOG.trace(responseXML.toString());
				var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
				faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
				var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
				if (objCodeNode != null){
					var strFaultCode = objCodeNode.getValue();
					cle.LOG.trace("response fault code: " + strFaultCode);
					//check for registered fault code
					var strFaultCodeMessage = cle.utils.getProperty(strFaultCode);
					//FIXME: the service should not return an error for an empty set
					if ((!jsx3.util.strEmpty(strFaultCode)) && (strFaultCode=='no value')){
						var objCDF = new jsx3.xml.CDF.Document.newDocument();
						var strText = cle.utils.getProperty("config_noEntriesFound");
						objCDF.insertRecord({jsxid:jsx3.xml.CDF.getKey(),jsxtext:strText,RenderID:'0'},'jsxroot',true);
						cb.done({status:true,document:objCDF});
					}
					else {
						cle.SERVER.publish({subject:"renderingFault",code:strFaultCode,message:strFaultCodeMessage,src:"retrieveAllRenderingsOp"});
					}
				}
			}
			cb.done({status:false});
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
	 * Retrieves all categories for a given application
	 * {String} the rendering's application id
	 */
	rendering.retrieveRenderConfigListWithSysIDOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("rendering#retrieveRenderConfigListWithSysIDOp");
		var objService = cle.SERVER.loadResource("retrieveRenderConfigListWithSysID_rule_xml");
		objService.setOperation("RetrieveRenderConfigListWithSysIDOp");
		objService.setEndpointURL(rendering.getEndpoint());
		objService.id = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(rendering.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
		    cb.done({status:false});
		});

		//inner function handler for successful response
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
			var responseXML = objEvent.target.getInboundDocument();
			var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/renderConfig/renderingList2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objCDF = templateProcessor.transformToObject(objXML);
	    		cle.LOG.trace("retrieveRenderConfigListWithSysIDOp call completed");
				cb.done({status:true,document:objCDF});
			}
		});
		//inner function handler for soap fault response
		objService.subscribe(jsx3.net.Service.ON_ERROR,
		  function(objEvent) {
			var responseXML = objEvent.target.getRequest().getResponseXML();
			if (responseXML != null){
				//cle.LOG.trace(responseXML.toString());
				var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
				faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
				var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
				if (objCodeNode != null){
					var strFaultCode = objCodeNode.getValue();
					cle.LOG.trace("response fault code: " + strFaultCode);
					//check for registered fault code
					var strFaultCodeMessage = cle.utils.getProperty(strFaultCode);
					//FIXME: the service should not return an error for an empty set
					if ((!jsx3.util.strEmpty(strFaultCode)) && (strFaultCode=='no value')){
						var objCDF = new jsx3.xml.CDF.Document.newDocument();
						var strText = cle.utils.getProperty("config_noEntriesFound");
						objCDF.insertRecord({jsxid:jsx3.xml.CDF.getKey(),jsxtext:strText,RenderID:'0'},'jsxroot',true);
						cb.done({status:true,document:objCDF});
					}
					else {
						cle.SERVER.publish({subject:"renderingFault",code:strFaultCode,message:strFaultCodeMessage,src:"retrieveRenderConfigListWithSysIDOp"});
					}
				}
			}
			cb.done({status:false});
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
	 * Persist the rendering changes at the server
	 *   uses the rendering list CDF marked with 'hasChanges' attributes
	 *   maps to SOAP request within the mapping utility context
	 */
	rendering.updateRenderConfigOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("rendering#updateRenderConfigOp");
		var objService = cle.SERVER.loadResource("updateRenderConfigOp_rule_xml");
		objService.setOperation("UpdateRenderConfigOp");
		objService.setEndpointURL(rendering.getEndpoint());
		objService.data = cb.args()[0];
		
		//set service response timeout handler
		objService.setTimeout(rendering.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
		    cb.done({status:false});
		});

		//inner function handler for successful response
		objService.subscribe(jsx3.net.Service.ON_SUCCESS, function(objEvent) {
    		cle.LOG.trace("updateRenderConfigOp call completed");
		    cb.done({status:true});
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
				cle.SERVER.publish({subject:"renderingFault",code:strFaultCode,message:strFaultMessage,src:"updateRenderConfigOp"});
			}
		    cb.done({status:false});
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
	/**
	 * Delete the rendering at the server
	 *   {String}	The rendering id to delete.
	 */
	rendering.deleteRenderConfigOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("rendering#deleteRenderConfigOp");
		var objService = cle.SERVER.loadResource("deleteRenderConfigOp_rule_xml");
		objService.setOperation("DeleteRenderConfigOp");
		objService.setEndpointURL(rendering.getEndpoint());
		objService.id = cb.args()[0];
		objService.appId = cb.args()[1];

		//set service response timeout handler
		objService.setTimeout(rendering.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
		    cb.done({status:false});
		});

		//inner function handler for successful response
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
    		cle.LOG.trace("deleteRenderConfigOp call completed");
		    cb.done({status:true});
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
				cle.SERVER.publish({subject:"renderingFault",code:strFaultCode,message:strFaultMessage,src:"deleteRenderConfigOp"});
			}
		    cb.done({status:false});
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
	 * displays fault information from service response
	 */
	rendering.handleFault = function(objEvent){
		if (objEvent.code == "no value")
			return;
		var strCaption = cle.utils.getProperty("m_faultCaption");
		var strMessage = cle.utils.getProperty(objEvent.code);
		//use included message if the code translation is unavailable
		if (jsx3.util.strEmpty(strMessage)) strMessage = objEvent.message;
		var strOK = cle.utils.getProperty("m_ok");
		var objParams = {width: 300, height: 150, noTitle: false, nonModal: true};
		cle.SERVER.alert(strCaption, objEvent.src + ": <br/>" + strMessage,null,strOK,objParams);
	};

	//start subscriptions after loading this package
	rendering.setSubscriptions();
  }
);
