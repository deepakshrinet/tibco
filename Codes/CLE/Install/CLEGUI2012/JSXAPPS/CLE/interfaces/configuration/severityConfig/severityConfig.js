jsx3.require("jsx3.gui.Form");

jsx3.lang.Package.definePackage("cle.configuration.severity",
  function(severity) {
	severity.ENDPOINT_HOST = "http://localhost:9950";
	severity.ENDPOINT_URL = "/Administration/GUIServices/SeverityServices/intfSeverity-service.serviceagent/intfwsUpdateSeverityEndpoint0";
	severity.TIMEOUT = 20 * 1000; //20 seconds

	severity.setSubscriptions = function(){
		cle.LOG.trace("severity#setSubscriptions");
		cle.SERVER.subscribe("severityFault",severity.handleFault);
	};
	severity.getEndpointHost = function() {
		return severity.ENDPOINT_HOST;
	};
	severity.setEndpointHost = function(strEndpointHost) {
		severity.ENDPOINT_HOST = strEndpointHost;
	};
	severity.getEndpointUrl = function() {
		return severity.ENDPOINT_URL;
	};
	severity.setEndpointUrl = function(strEndpointUrl) {
		severity.ENDPOINT_URL = strEndpointUrl;
	};
	severity.getEndpoint = function() {
		return severity.ENDPOINT_HOST + severity.ENDPOINT_URL;
	};
	severity.createNewSeverity = function(objJSX){
		try{
			cle.LOG.trace("severity#createNewSeverity");
			//TODO: enable the 'id' field for input and focus
			var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid");
			var strAppId = objParent.getParent().getApplicationId();  //use the method added to the dialog
			var objInputs = objParent.getChild(1).getDescendantsOfType("jsx3.gui.Form",false); //downward from second child
			var hasValidationErrors = false;
			var fieldErrors = [];
			cle.LOG.trace("severity#createNewSeverity found " + objInputs.length + " inputs");
			var objRecord = {SeverityID:0};  //required field set to zero
			var intFontSize = Number(cle.utils.getProperty('labelFontSize'));
			jsx3.$A(objInputs).each(function(input){
				var strValue = input.getValue();
				if (jsx3.util.strEmpty(strValue) && input.getRequired()==jsx3.gui.Form.REQUIRED){
					hasValidationErrors = true;
					//throw data entry exception
					var objLabel = input.getParent().getChild('label');
					if (objLabel != null){
						fieldErrors.push("<span style='font-size:" + intFontSize +"'>" + objLabel.getText() + "</span>");
					}
				}
				objRecord[input.getCDFAttribute()] = strValue;
				//unused
				var theName = input.getCDFAttribute();
				cle.LOG.trace(theName + ": " + objRecord[theName]);
			});
			if (hasValidationErrors){
				var strCaption = cle.utils.getProperty('config_requiredFieldsFailedValidation');
				//TODO: could use fieldErrors.join('\r\n') in the following
				//cle.SERVER.alert(strCaption, fieldErrors.toString());
				var strOkay = cle.utils.getProperty('m_ok');
				var objParams ={'height':210};
				cle.SERVER.alert(strCaption, fieldErrors.join('<br/>'), null, strOkay, objParams);
				return;
			}
			var rv = severity.createSeverityOp(objRecord);
			rv.when(function(response){
				cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'severity', appId:strAppId});
				//TODO: 'create another?' dialog
				objJSX.getAncestorOfType("jsx3.gui.Dialog").doClose();
			});                
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("severity#createNewSeverity error: "
					+ e.getMessage());
		}
	};
	severity.editConfiguration = function(objJSX){
		try {
			cle.LOG.trace("severity#editConfiguration");
			objJSX.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
			var objParent = objJSX.getAncestorOfName("configurationViewerPane");
			if (objParent != null){
				var objMatrix = objParent.getDescendantOfName("configurationEditorMatrix",true,false);
				if (objMatrix != null){
					var obj = {};
					var objCDF = objMatrix.getXML();
					objCDF = jsx3.xml.CDF.Document.wrap(objCDF);
					var recordIds = objCDF.getRecordIds();
					//build JavaScript literal object using name/value pairs from CDF
					jsx3.$A(recordIds).each(function(id){
						var objCDFRecord = objCDF.getRecord(id);
						obj[objCDFRecord.attrName] = objCDFRecord.jsxvalue;
					});
					//
					var objBody = cle.SERVER.getBodyBlock();
					//launch dialog and wait to show it
					var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/severityConfig/configurationEditorDialog_gui.xml");
					var objDialog = objBody.loadAndCache(configDialogURL,false);
					//set the type of dialog to 'modal'
					objDialog.setModal(jsx3.gui.Dialog.MODAL);
					//set the dialog caption bar text
					var objWindowBar = objDialog.getCaptionBar();
					var strCaption = cle.utils.getProperty('config_editConfigurationItem');
					objWindowBar.setText(strCaption,false); //wait to paint it
					objDialog.setHeight(320,false);
					//load interface into dialog
					var dialogPane = objDialog.getDescendantOfName("dialogPane",true,false);
					if (dialogPane != null){
						//TODO: should only enable the button if form has changes
						var objSaveButton = objDialog.getSaveButton();
						if (objSaveButton){
							objSaveButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
						}
						objDialog.setApplicationId(objParent.getApplicationId()); //from viewer method in deserialization script
						objDialog.setSeverityId(objParent.getSeverityId()); //from viewer method in deserialization script
						objDialog.setEditButton(objJSX);
						objDialog.markRequiredInputs(false);
						objDialog.setFieldValues(obj);
						objBody.paintChild(objDialog);
						jsx3.sleep(function(){objDialog.getFirstResponder().focus();});
					}
				}
			}
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("severity#editConfiguration error: "
					+ e.getMessage());
		}
	};
	severity._doDelete = function(objJSX){
		cle.LOG.trace("severity#_doDelete");
		var objParent = objJSX.getAncestorOfName("configurationViewerPane");
		if (objParent != null){
			//need the CategoryID for the service call.
			var strId = objParent.getSeverityId();
			var strApplicationId = objParent.getApplicationId();
			if (!jsx3.util.strEmpty(strId)){
				var rv = severity.deleteSeverityOp(strId);
				rv.when(function(response){
					if (response.status){
						if (!jsx3.util.strEmpty(strApplicationId)){
							cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'severity', appId:strApplicationId});
						}
					}
					//TODO: handle error
				});
			}
		}
	};
	severity.deleteConfiguration = function(objJSX){
		cle.LOG.trace("severity#deleteConfiguration");
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
				severity._doDelete(objJSX);
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
	severity.updateConfiguration = function(objJSX){
		try {
			cle.LOG.trace("severity#updateConfiguration");
			var objParent = objJSX.getAncestorOfType("jsx3.gui.Dialog");
			var strAppId = objParent.getApplicationId();  //use the method from the dialog
			var strId = objParent.getSeverityId();  //use the method from the dialog
			var objBodyPane = objParent.getDescendantOfName("bodyPane",true,false);
			var objInputs = objBodyPane.getDescendantsOfType("jsx3.gui.Form",false); //downward from second child
			var hasValidationErrors = false;
			var fieldErrors = [];
			cle.LOG.trace("severity#updateConfiguration found " + objInputs.length + " inputs");
			var objRecord = {SeverityID:strId};
			var intFontSize = Number(cle.utils.getProperty('labelFontSize'));
			jsx3.$A(objInputs).each(function(input){
				var strValue = input.getValue();
				if (jsx3.util.strEmpty(strValue) && input.getRequired()==jsx3.gui.Form.REQUIRED){
					hasValidationErrors = true;
					//throw data entry exception
					var objLabel = input.getParent().getChild('label');
					if (objLabel != null){
						fieldErrors.push("<span style='font-size:" + intFontSize +"'>" + objLabel.getText() + "</span>");
					}
				}
				objRecord[input.getCDFAttribute()] = strValue;
				//only used for debugging
				var theName = input.getCDFAttribute();
				cle.LOG.trace(theName + ": " + objRecord[theName]);
			});
			if (hasValidationErrors){
				var strCaption = cle.utils.getProperty('config_requiredFieldsFailedValidation');
				var strOkay = cle.utils.getProperty('m_ok');
				var objParams ={'height':210};
				cle.SERVER.alert(strCaption, fieldErrors.join('<br/>'), null, strOkay, objParams);
				return;
			}
			var rv = severity.updateSeverityOp(objRecord);
			rv.when(function(response){
				if (response.status){
					if (!jsx3.util.strEmpty(strAppId)){
						cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'severity', appId:strAppId});
					}
					//TODO: 'create another?' dialog
				}
				//FIXME: avoid an abrupt close without notification
				objJSX.getAncestorOfType("jsx3.gui.Dialog").close(); //use method added in object onAfterDeserialization
			});                
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("severity#updateConfiguration error: "
					+ e.getMessage());
		}
	};
	/**
	 * Create a new severity persisted at the server
	 *   {String} the parent application id
	 *   {String} the severity name
	 *   {String} the description
	 *   {String} severity id
	 */
	severity.createSeverityOp = jsx3.$Y(function(cb) {
		var objService = cle.SERVER.loadResource("createSeverityOp_rule_xml");
		objService.setOperation("CreateSeverityOp");
		objService.setEndpointURL(severity.getEndpoint());
		objService.data = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(severity.TIMEOUT,
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
				cle.SERVER.publish({subject:"severityFault",code:strFaultCode,message:strFaultMessage,src:"createSeverityOp"});
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
	 * Retrieve the all the severities from the server using application id as the key
	 *   {String}	The id of severity parent.
	 */
	severity.retrieveAllSeveritiesOp = jsx3.$Y(function(cb) {
		//TODO: the operation should be changed to 'retrieveSeverityList', then refactor this name to match operation
	  cle.LOG.debug("severity#retrieveAllSeveritiesOp");
	  var objService = app.tibco.CLE.loadResource("retrieveSpecificSeverityOp_rule_xml");
	  objService.setOperation("RetrieveSpecificSeverityOp");
	  objService.id = cb.args()[0];
	  objService.setEndpointURL(severity.getEndpoint());
	  
	  //set service response timeout handler
	  objService.setTimeout(severity.TIMEOUT,
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
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/severityConfig/severityList2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objCDF = templateProcessor.transformToObject(objXML);
	    		cle.LOG.trace("retrieveAllSeveritiesOp call completed");
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
						objCDF.insertRecord({jsxid:jsx3.xml.CDF.getKey(),jsxtext:strText,SeverityID:'0'},'jsxroot',true);
						cb.done({status:true,document:objCDF});
					}
					else {
						cle.SERVER.publish({subject:"severityFault",code:strFaultCode,message:strFaultCodeMessage,src:"retrieveAllCategoriesOp"});
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
	 * Retrieves all severities for a given application
	 * {String} the severity's application id
	 */
	severity.retrieveSeverityListWithSysIDOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("severity#retrieveSeverityListWithSysIDOp");
		var objService = cle.SERVER.loadResource("retrieveSeverityListWithSysIDOp_rule_xml");
		objService.setOperation("RetrieveSeverityListWithSysIDOp");
		objService.setEndpointURL(severity.getEndpoint());
		objService.id = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(severity.TIMEOUT,
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
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/severityConfig/severityList2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objCDF = templateProcessor.transformToObject(objXML);
				cb.done({status:true,document:objCDF});
			}
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
				cle.SERVER.publish({subject:"severityFault",code:strFaultCode,message:strFaultMessage,src:"retrieveSeverityListWithSysIDOp"});
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
	 * Persist the severity changes at the server
	 *   uses the severity list CDF marked with 'hasChanges' attributes
	 *   maps to SOAP request within the mapping utility context
	 */
	severity.updateSeverityOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("severity#updateSeverityOp");
		var objService = cle.SERVER.loadResource("updateSeverityOp_rule_xml");
		objService.setOperation("UpdateSeverityOp");
		objService.setEndpointURL(severity.getEndpoint());
		objService.data = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(severity.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
		    cb.done({status:false});
		});

		//inner function handler for successful response
		objService.subscribe(jsx3.net.Service.ON_SUCCESS, function(objEvent) {
    		cle.LOG.trace("updateSeverityOp call completed");
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
				cle.SERVER.publish({subject:"severityFault",code:strFaultCode,message:strFaultMessage,src:"updateSeverityOp"});
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
	 * Delete the severity at the server
	 *   {String}	The severity id to delete.
	 */
	severity.deleteSeverityOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("severity#deleteSeverityOp");
		var objService = cle.SERVER.loadResource("deleteSeverityOp_rule_xml");
		objService.setOperation("DeleteSeverityOp");
		objService.setEndpointURL(severity.getEndpoint());
		objService.id = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(severity.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
		    cb.done({status:false});
		});

		//inner function handler for successful response
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
    		cle.LOG.trace("deleteSeverityOp call completed");
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
				cle.SERVER.publish({subject:"severityFault",code:strFaultCode,message:strFaultMessage,src:"deleteSeverityOp"});
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
	severity.handleFault = function(objEvent){
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
	severity.setSubscriptions();
  }
);
