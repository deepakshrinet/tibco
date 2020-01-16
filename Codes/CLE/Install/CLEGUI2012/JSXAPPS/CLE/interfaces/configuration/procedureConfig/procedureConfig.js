jsx3.require("jsx3.gui.Form");

jsx3.lang.Package.definePackage("cle.configuration.procedure",
  function(procedure) {
	procedure.ENDPOINT_HOST = "http://localhost:9950";
	procedure.ENDPOINT_URL = "/Administration/GUIServices/ProcedureServices/intfProcedure-service.serviceagent/intfwsUpdateProcedureEndpoint2";
	procedure.TIMEOUT = 20 * 1000; //20 seconds

	procedure.setSubscriptions = function(){
		cle.LOG.trace("procedure#setSubscriptions");
		cle.SERVER.subscribe("procedureFault",procedure.handleFault);
	};
	procedure.getEndpointHost = function() {
		return procedure.ENDPOINT_HOST;
	};
	procedure.setEndpointHost = function(strEndpointHost) {
		procedure.ENDPOINT_HOST = strEndpointHost;
	};
	procedure.getEndpointUrl = function() {
		return procedure.ENDPOINT_URL;
	};
	procedure.setEndpointUrl = function(strEndpointUrl) {
		procedure.ENDPOINT_URL = strEndpointUrl;
	};
	procedure.getEndpoint = function() {
		return procedure.ENDPOINT_HOST + procedure.ENDPOINT_URL;
	};
	procedure.createNewProcedure = function(objJSX){
		try{
			cle.LOG.trace("procedure#createNewProcedure");
			//TODO: enable the 'id' field for input and focus
			var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid");
			var strAppId = objParent.getParent().getApplicationId();  //use the method added to the dialog
			var objInputs = objParent.getChild(1).getDescendantsOfType("jsx3.gui.Form",false); //downward from second child
			var hasValidationErrors = false;
			var fieldErrors = [];
			cle.LOG.trace("procedure#createNewProcedure found " + objInputs.length + " inputs");
			var objRecord = {ProcedureID:0};  //required field set to zero
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
			var rv = procedure.createProcedureOp(objRecord);
			rv.when(function(isSuccess){
				cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'procedure', appId:strAppId});
				//TODO: 'create another?' dialog
				objJSX.getAncestorOfType("jsx3.gui.Dialog").doClose();
			});                
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("procedure#createNewProcedure error: "
					+ e.getMessage());
		}
	};
	procedure.editConfiguration = function(objJSX){
		try {
			cle.LOG.trace("procedure#editConfiguration");
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
					var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/procedureConfig/configurationEditorDialog_gui.xml");
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
						objDialog.setProcedureId(objParent.getProcedureId()); //from viewer method in deserialization script
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
			cle.LOG.error("procedure#editConfiguration error: "
					+ e.getMessage());
		}
	};
	procedure._doDelete = function(objJSX){
		cle.LOG.trace("procedure#_doDelete");
		var objParent = objJSX.getAncestorOfName("configurationViewerPane");
		if (objParent != null){
			//need the CategoryID for the service call.
			var strId = objParent.getProcedureId();
			var strApplicationId = objParent.getApplicationId();
			if (!jsx3.util.strEmpty(strId)){
				var rv = procedure.deleteProcedureOp(strId);
				rv.when(function(response){
					if (response.status){
						if (!jsx3.util.strEmpty(strApplicationId)){
							cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'procedure', appId:strApplicationId});
						}
					}
					//TODO: handle error
				});
			}
		}
	};
	procedure.deleteConfiguration = function(objJSX){
		cle.LOG.trace("procedure#deleteConfiguration");
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
				procedure._doDelete(objJSX);
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
	procedure.updateConfiguration = function(objJSX){
		try {
			cle.LOG.trace("procedure#updateConfiguration");
			var objParent = objJSX.getAncestorOfType("jsx3.gui.Dialog");
			var strAppId = objParent.getApplicationId();  //use the method from the dialog
			var strId = objParent.getProcedureId();  //use the method from the dialog
			var objBodyPane = objParent.getDescendantOfName("bodyPane",true,false);
			var objInputs = objBodyPane.getDescendantsOfType("jsx3.gui.Form",false); //downward from second child
			var hasValidationErrors = false;
			var fieldErrors = [];
			cle.LOG.trace("procedure#updateConfiguration found " + objInputs.length + " inputs");
			var objRecord = {ProcedureID:strId};
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
			var rv = procedure.updateProcedureOp(objRecord);
			rv.when(function(response){
				if (response.status){
					if (!jsx3.util.strEmpty(strAppId)){
						cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'procedure', appId:strAppId});
					}
					//TODO: 'create another?' dialog
				}
				//FIXME: avoid an abrupt close without notification
				objJSX.getAncestorOfType("jsx3.gui.Dialog").close(); //use method added in object onAfterDeserialization
			});                
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("procedure#updateConfiguration error: "
					+ e.getMessage());
		}
	};
	/**
	 * Create a new procedure persisted at the server
	 *   {String} the parent application id
	 *   {String} the procedure name
	 *   {String} the description
	 *   {String} procedure id
	 */
	procedure.createProcedureOp = jsx3.$Y(function(cb) {
		var objService = cle.SERVER.loadResource("createProcedureOp_rule_xml");
		objService.setOperation("CreateProcedureOp");
		objService.setEndpointURL(procedure.getEndpoint());
		objService.data = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(procedure.TIMEOUT,
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
				cle.SERVER.publish({subject:"procedureFault",code:strFaultCode,message:strFaultMessage,src:"createProcedureOp"});
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
	 *   {String}	The id of procedure parent.
	 */
	procedure.retrieveAllProceduresOp = jsx3.$Y(function(cb) {
		//TODO: the operation should be changed to 'retrieveProcedureList', then refactor this name to match operation
	  cle.LOG.debug("procedure#retrieveAllProceduresOp");
	  var objService = app.tibco.CLE.loadResource("retrieveSpecificProcedureOp_rule_xml");
	  objService.setOperation("RetrieveSpecificProcedureOp");
	  objService.id = cb.args()[0];
	  objService.setEndpointURL(procedure.getEndpoint());
	  
	  //set service response timeout handler
	  objService.setTimeout(procedure.TIMEOUT,
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
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/procedureConfig/procedureList2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objCDF = templateProcessor.transformToObject(objXML);
	    		cle.LOG.trace("retrieveAllProceduresOp call completed");
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
					  objCDF.insertRecord({jsxid:jsx3.xml.CDF.getKey(),jsxtext:strText,ProcedureID:'0'},'jsxroot',true);
					  cb.done({status:true,document:objCDF});
				  }
				  else {
					  cle.SERVER.publish({subject:"procedureFault",code:strFaultCode,message:strFaultCodeMessage,src:"retrieveAllProceduresOp"});
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
	 * {String} the procedure's application id
	 */
	procedure.retrieveProcedureListWithSysIDOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("procedure#retrieveProcedureListWithSysIDOp");
		var objService = cle.SERVER.loadResource("retrieveProcedureListWithSysIDOp_rule_xml");
		objService.setOperation("RetrieveProcedureListWithSysIDOp");
		objService.setEndpointURL(procedure.getEndpoint());
		objService.id = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(procedure.TIMEOUT,
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
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/procedureConfig/procedureList2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objCDF = templateProcessor.transformToObject(objXML);
	    		cle.LOG.trace("retrieveProcedureListWithSysIDOp call completed");
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
						objCDF.insertRecord({jsxid:jsx3.xml.CDF.getKey(),jsxtext:strText,ProcedureID:'0'},'jsxroot',true);
						cb.done({status:true,document:objCDF});
					}
					else {
						cle.SERVER.publish({subject:"procedureFault",code:strFaultCode,message:strFaultCodeMessage,src:"retrieveProcedureListWithSysIDOp"});
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
	 * Persist the procedure changes at the server
	 *   uses the procedure list CDF marked with 'hasChanges' attributes
	 *   maps to SOAP request within the mapping utility context
	 */
	procedure.updateProcedureOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("procedure#updateProcedureOp");
		var objService = cle.SERVER.loadResource("updateProcedureOp_rule_xml");
		objService.setOperation("UpdateProcedureOp");
		objService.setEndpointURL(procedure.getEndpoint());
		objService.data = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(procedure.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
		    cb.done({status:false});
		});

		//inner function handler for successful response
		objService.subscribe(jsx3.net.Service.ON_SUCCESS, function(objEvent) {
    		cle.LOG.trace("updateProcedureOp call completed");
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
				cle.SERVER.publish({subject:"procedureFault",code:strFaultCode,message:strFaultMessage,src:"updateProcedureOp"});
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
	 * Delete the procedure at the server
	 *   {String}	The procedure id to delete.
	 */
	procedure.deleteProcedureOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("procedure#deleteProcedureOp");
		var objService = cle.SERVER.loadResource("deleteProcedureOp_rule_xml");
		objService.setOperation("DeleteProcedureOp");
		objService.setEndpointURL(procedure.getEndpoint());
		objService.id = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(procedure.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
		    cb.done({status:false});
		});

		//inner function handler for successful response
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
    		cle.LOG.trace("deleteProcedureOp call completed");
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
				cle.SERVER.publish({subject:"procedureFault",code:strFaultCode,message:strFaultMessage,src:"deleteProcedureOp"});
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
	procedure.handleFault = function(objEvent){
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
	procedure.setSubscriptions();
  }
);
