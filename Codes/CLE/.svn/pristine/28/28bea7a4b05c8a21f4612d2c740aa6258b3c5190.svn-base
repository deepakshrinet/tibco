jsx3.require("jsx3.gui.Form");

jsx3.lang.Package.definePackage("cle.configuration.type",
  function(type) {
	type.ENDPOINT_HOST = "http://localhost:9950";
	type.ENDPOINT_URL = "/Administration/GUIServices/TypeServices/intfType-service.serviceagent/intfwsUpdateTypeEndpoint1";
	type.TIMEOUT = 20 * 1000; //20 seconds

	type.getEndpointHost = function() {
		return type.ENDPOINT_HOST;
	};
	type.setEndpointHost = function(strEndpointHost) {
		type.ENDPOINT_HOST = strEndpointHost;
	};
	type.getEndpointUrl = function() {
		return type.ENDPOINT_URL;
	};
	type.setEndpointUrl = function(strEndpointUrl) {
		type.ENDPOINT_URL = strEndpointUrl;
	};
	type.getEndpoint = function() {
		return type.ENDPOINT_HOST + type.ENDPOINT_URL;
	};
	type.setSubscriptions = function(){
		cle.LOG.trace("type#setSubscriptions");
		cle.SERVER.subscribe("typeConfigFault",type.handleFault);
	};
	type.createNewType = function(objJSX){
		try{
			cle.LOG.trace("type#createNewType");
			//TODO: enable the 'id' field for input and focus
			var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid");
			var strAppId = objParent.getParent().getApplicationId();  //use the method added to the dialog
			var objInputs = objParent.getChild(1).getDescendantsOfType("jsx3.gui.Form",false); //downward from second child
			var hasValidationErrors = false;
			var fieldErrors = [];
			cle.LOG.trace("type#createNewType found " + objInputs.length + " inputs");
			var objRecord = {TypeID:0};  //required field set to zero
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
				var strOkay = cle.utils.getProperty('m_ok');
				var objParams ={'height':210};
				cle.SERVER.alert(strCaption, fieldErrors.join('<br/>'), null, strOkay, objParams);
				return;
			}
			var rv = type.createTypeOp(objRecord);
			rv.when(function(response){
				cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'type', appId:strAppId});
				//TODO: 'create another?' dialog
				objJSX.getAncestorOfType("jsx3.gui.Dialog").doClose();
			});                
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("type#createNewType error: "
					+ e.getMessage());
		}
	};
	type.editConfiguration = function(objJSX){
		try {
			cle.LOG.trace("type#editConfiguration");
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
					var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/typeConfig/configurationEditorDialog_gui.xml");
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
						objDialog.setTypeId(objParent.getTypeId()); //from viewer method in deserialization script
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
			cle.LOG.error("type#editConfiguration error: "
					+ e.getMessage());
		}
	};
	type._doDelete = function(objJSX){
		cle.LOG.trace("type#_doDelete");
		var objParent = objJSX.getAncestorOfName("configurationViewerPane");
		if (objParent != null){
			//need the CategoryID for the service call.
			var strId = objParent.getTypeId();
			var strApplicationId = objParent.getApplicationId();
			if (!jsx3.util.strEmpty(strId)){
				var rv = type.deleteTypeOp(strId);
				rv.when(function(response){
					if (response.status){
						if (!jsx3.util.strEmpty(strApplicationId)){
							cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'type', appId:strApplicationId});
						}
					}
					//TODO: handle error
				});
			}
		}
	};
	type.deleteConfiguration = function(objJSX){
		cle.LOG.trace("type#deleteConfiguration");
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
				type._doDelete(objJSX);
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
	type.updateConfiguration = function(objJSX){
		try {
			cle.LOG.trace("type#updateConfiguration");
			var objParent = objJSX.getAncestorOfType("jsx3.gui.Dialog");
			var strAppId = objParent.getApplicationId();  //use the method from the dialog
			var strId = objParent.getTypeId();  //use the method from the dialog
			var objBodyPane = objParent.getDescendantOfName("bodyPane",true,false);
			var objInputs = objBodyPane.getDescendantsOfType("jsx3.gui.Form",false); //downward from second child
			var hasValidationErrors = false;
			var fieldErrors = [];
			cle.LOG.trace("type#updateConfiguration found " + objInputs.length + " inputs");
			var objRecord = {TypeID:strId};
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
			var rv = type.updateTypeOp(objRecord);
			rv.when(function(response){
				if (response.status){
					if (!jsx3.util.strEmpty(strAppId)){
						cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'type', appId:strAppId});
					}
					//TODO: 'create another?' dialog
				}
				//FIXME: avoid an abrupt close without notification
				objJSX.getAncestorOfType("jsx3.gui.Dialog").close(); //use method added in object onAfterDeserialization
			});                
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("type#updateConfiguration error: "
					+ e.getMessage());
		}
	};
	type.handleFault = function(objEvent) {
		try {
			if (objEvent.code == "no value")
				return;
			var strCaption = cle.utils.getProperty("m_faultCaption");
			var strMessage = cle.utils.getProperty(objEvent.code);
			//use included message if the code translation is unavailable
			if (jsx3.util.strEmpty(strMessage)) strMessage = objEvent.message;
			var strOK = cle.utils.getProperty("m_ok");
			var objParams = {width: 300, height: 150, noTitle: false, nonModal: true};
			cle.SERVER.alert(strCaption, objEvent.src + ": <br/>" + strMessage,null,strOK,objParams);
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("type#handleFault error: " + e.getMessage());
		}
	};
	/**
	 * Create a new type from the server
	 *   {String} the parent application id
	 *   {String} the type name
	 *   {String} the description
	 *   {String} type id
	 */
	type.createTypeOp = jsx3.$Y(function(cb) {
		var objService = cle.SERVER.loadResource("createType_rule_xml");
		objService.setOperation("CreateTypeOp");
		objService.setEndpointURL(type.getEndpoint());
		objService.data = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(type.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
			cb.done({status:false});
		});

		//subscribe
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
			// var responseXML = objEvent.target.getInboundDocument();
			cb.done({status:false});
		});
		objService.subscribe(jsx3.net.Service.ON_ERROR,
		  function(objEvent) {
			var responseXML = objEvent.target.getRequest().getResponseXML();
			cle.LOG.trace(responseXML.toString());
			var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
			faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
			var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
			if (objCodeNode != null){
				var strFaultCode = objCodeNode.getValue();
				cle.LOG.trace("response fault code: " + strFaultCode);
				//check for registered fault code
				var strFaultCodeMessage = cle.utils.getProperty(strFaultCode);
				cle.SERVER.publish({subject:"typeConfigFault",code:strFaultCode,message:strFaultCodeMessage});
			}
			cb.done({status:false});
		});
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
	 * Retrieve the all the exception types from the server using application id as the key
	 *   {String}	The id of type parent.
	 */
	type.retrieveAllTypesOp = jsx3.$Y(function(cb) {
	  cle.LOG.debug("type#retrieveAllTypesOp");
      var objService = app.tibco.CLE.loadResource("retrieveSpecificType_rule_xml");
      objService.setOperation("RetrieveSpecificTypeOp");
	  objService.id = cb.args()[0];
	  objService.setEndpointURL(type.getEndpoint());
	  
	  //set service response timeout handler
	  objService.setTimeout(type.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
		    cb.done({status:false});
	  });
	
	  //subscribe
	  objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		function(objEvent) {
			var responseXML = objEvent.target.getInboundDocument();
			var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/typeConfig/typeList2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objCDF = templateProcessor.transformToObject(objXML);
				cb.done({status:true,document:objCDF});
			}
	  });
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
						cle.LOG.trace('type#retrieveAllTypesOp strText: ' + strText);
						objCDF.insertRecord({jsxid:jsx3.xml.CDF.getKey(),jsxtext:strText,TypeID:'0'},'jsxroot',true);
						cle.LOG.trace('type#retrieveAllTypesOp cdf: ' + objCDF.toString());
						cb.done({status:true,document:objCDF});
					}
					else {
						cle.SERVER.publish({subject:"typeConfigFault",code:strFaultCode,message:strFaultCodeMessage,src:"retrieveAllTypesOp"});
					}
				}
			}
			cb.done({status:false});
		});
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
	 * Retrieves a types by application Id and includes the 'System' item
	 * {String} the type id
	 */
	type.retrieveTypeListWithSysID = jsx3.$Y(function(cb) {
		cle.LOG.debug("type#getTypeByIdOp");
		var objService = cle.SERVER.loadResource("retrieveTypeListWithSysID_rule_xml");
		objService.setOperation("RetrieveTypeListWithSysIDOp");
		objService.setEndpointURL(type.getEndpoint());
		objService.id = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(type.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
			cb.done({status:false});
		});

		//subscribe
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
			var responseXML = objEvent.target.getInboundDocument();
			var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/typeConfig/typeList2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objCDF = templateProcessor.transformToObject(objXML);
				alert(objCDF.toString());
				var objDoc = cle.SERVER.getCache().getDocument(type.LIST_CACHE_ID);
				if (objDoc == null){
					cle.LOG.trace("created typeList_cdf");
					objDoc = new jsx3.xml.CDF.Document.newDocument();
					cle.SERVER.getCache().setDocument(type.LIST_CACHE_ID,objDoc);
				}
				objDoc = jsx3.xml.CDF.Document.wrap(objDoc);
				var strTypeId = objEvent.target.id;
				var objNodes = objCDF.selectNodes("//record[@ApplicationID='" + strTypeId + "']");
	  			if (objNodes.size() > 0){
	  				jsx3.$A(objNodes.toArray()).each(function(childNode){
	  					objDoc.insertRecordNode(childNode.cloneNode(true),"jsxroot",true);
	  				});
	  			}
	    		cle.LOG.trace("retrieveTypeDetailOp call completed");
	    		cb.done({status:true});
			}
		});
		objService.subscribe(jsx3.net.Service.ON_ERROR,
		  function(objEvent) {
			var responseXML = objEvent.target.getRequest().getResponseXML();
			cle.LOG.trace(responseXML.toString());
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
					objCDF.insertRecord({jsxid:jsx3.xml.CDF.getKey(),jsxtext:strText,TypeID:'0'},'jsxroot',true);
					cb.done({status:true,document:objCDF});
				}
				else {
					cle.SERVER.publish({subject:"typeConfigFault",code:strFaultCode,message:strFaultCodeMessage,src:"retrieveTypeListWithSysID"});
				}
			}
			cb.done({status:false});
		});
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
	 * Persist the type changes at the server
	 *   uses the type list CDF marked with 'hasChanges' attributes
	 *   maps to SOAP request within the mapping utility context
	 */
	type.updateTypeOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("type#updateTypeOp");
		var objService = cle.SERVER.loadResource("updateType_rule_xml");
		objService.setOperation("UpdateTypeOp");
		objService.setEndpointURL(type.getEndpoint());
		objService.data = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(type.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
		});

		  // subscribe
		objService.subscribe(jsx3.net.Service.ON_SUCCESS, function(objEvent) {
    		cle.LOG.trace("updateTypeOp call completed");
    		cb.done({status:true});
		});
		objService.subscribe(jsx3.net.Service.ON_ERROR,
		  function(objEvent) {
			var responseXML = objEvent.target.getRequest().getResponseXML();
			cle.LOG.trace(responseXML.toString());
			var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
			faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
			var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
			if (objCodeNode != null){
				var strFaultCode = objCodeNode.getValue();
				cle.LOG.trace("response fault code: " + strFaultCode);
				//check for registered fault code
				var strFaultCodeMessage = cle.utils.getProperty(strFaultCode);
				cle.SERVER.publish({subject:"typeConfigFault",code:strFaultCode,message:strFaultCodeMessage,src:"updateTypeOp"});
			}
			cb.done(false);
		});
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
	 * Delete the type at the server
	 *   {String}	The type id to delete.
	 */
	type.deleteTypeOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("type#deleteTypeOp");
		var objService = cle.SERVER.loadResource("deleteType_rule_xml");
		objService.setOperation("DeleteTypeOp");
		objService.setEndpointURL(type.getEndpoint());
		objService.id = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(type.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
			cb.done({status:false});
		});

		//subscribe
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
    		cle.LOG.trace("deleteTypeOp call completed");
    		cb.done({status:true});
		});
		objService.subscribe(jsx3.net.Service.ON_ERROR,
		  function(objEvent) {
			var responseXML = objEvent.target.getRequest().getResponseXML();
			cle.LOG.trace(responseXML.toString());
			var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
			faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
			var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
			if (objCodeNode != null){
				var strFaultCode = objCodeNode.getValue();
				cle.LOG.trace("response fault code: " + strFaultCode);
				//check for registered fault code
				var strFaultCodeMessage = cle.utils.getProperty(strFaultCode);
				cle.SERVER.publish({subject:"typeConfigFault",code:strFaultCode,message:strFaultCodeMessage,src:"deleteTypeOp"});
			}
			cb.done({status:false});
		});
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
	
	//start subscriptions after loading this package
	type.setSubscriptions();
  }
);
