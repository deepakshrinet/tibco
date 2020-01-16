jsx3.require("jsx3.gui.Form");

jsx3.lang.Package.definePackage("cle.configuration.interfaceConfig",
  function(interfaceConfig) {
	interfaceConfig.ENDPOINT_HOST = "http://localhost:9950";
	interfaceConfig.ENDPOINT_URL = "/Administration/GUIServices/InterfaceConfigurationServices/Service.serviceagent/InterfaceConfigurationEndpoint";
	interfaceConfig.TIMEOUT = 20 * 1000; //20 seconds

	interfaceConfig.setSubscriptions = function(){
		cle.LOG.trace("interface#setSubscriptions");
		cle.SERVER.subscribe("interfaceFault",interfaceConfig.handleFault);
	};
	interfaceConfig.createNewInterface = function(objJSX) {
		try {
			cle.LOG.debug("interface#createNewInterface");
			//TODO: enable the 'id' field for input and focus
			var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid");
			var strAppId = objParent.getParent().getApplicationId();  //use the method from the dialog
			var objInputs = objParent.getChild(1).getDescendantsOfType("jsx3.gui.Form",false); //downward from second child
			var hasValidationErrors = false;
			var fieldErrors = [];
			cle.LOG.trace("interface#createNewInterface found " + objInputs.length + " inputs");
			var objRecord = {};
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
				var strOkay = cle.utils.getProperty('m_ok');
				var objParams ={'height':210};
				cle.SERVER.alert(strCaption, fieldErrors.join('<br/>'), null, strOkay, objParams);
				return;
			}
			var rv = interfaceConfig.createInterfaceOp(objRecord);
			rv.when(function(isSuccess){
				cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'interface', appId:strAppId});
				//TODO: 'create another?' dialog
				objJSX.getAncestorOfType("jsx3.gui.Dialog").doClose();
			});                
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("interface#createNewInterface error: "
					+ e.getMessage());
		}
	};
	interfaceConfig.getEndpointHost = function() {
		return interfaceConfig.ENDPOINT_HOST;
	};
	interfaceConfig.setEndpointHost = function(strEndpointHost) {
		interfaceConfig.ENDPOINT_HOST = strEndpointHost;
	};
	interfaceConfig.getEndpointUrl = function() {
		return interfaceConfig.ENDPOINT_URL;
	};
	interfaceConfig.setEndpointUrl = function(strEndpointUrl) {
		interfaceConfig.ENDPOINT_URL = strEndpointUrl;
	};
	interfaceConfig.getEndpoint = function() {
		return interfaceConfig.ENDPOINT_HOST + interfaceConfig.ENDPOINT_URL;
	};
	interfaceConfig.editConfiguration = function(objJSX){
		try {
			cle.LOG.trace("interface#editConfiguration");
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
					var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/interfaceConfig/configurationEditorDialog_gui.xml");
					var objDialog = objBody.loadAndCache(configDialogURL,false);
					//set the type of dialog to 'modal' to control window context
					objDialog.setModal(jsx3.gui.Dialog.MODAL);
					//set the dialog caption bar text
					var objWindowBar = objDialog.getCaptionBar();
					var strCaption = cle.utils.getProperty('config_editConfigurationItem');
					objWindowBar.setText(strCaption,false); //wait to paint it
					objDialog.setHeight(640,false);
					//load interface into dialog
					var dialogPane = objDialog.getDescendantOfName("dialogPane",true,false);
					if (dialogPane != null){
						//TODO: should only enable the button if form has changes
						var objSaveButton = objDialog.getSaveButton();
						if (objSaveButton){
							objSaveButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
						}
						objDialog.setApplicationId(objParent.getApplicationId()); //from viewer method in deserialization script
						objDialog.setInterfaceId(objParent.getInterfaceId()); //from viewer method in deserialization script
						var strAppId = objParent.getApplicationId();
						var rvInterfaceParentId = interfaceConfig.retrieveInterfaceParentList(strAppId);
						rvInterfaceParentId.when(function(response){
							var isSuccess = response.status;
							if (isSuccess){
								//copy the results to this node
								var objCDF = response.document;
								if (objCDF != null){
									cle.LOG.trace('interface#editConfiguration cdf for interface parent list: ' + objCDF.toString());
									var objNodes = objCDF.selectNodes("//record[@InterfaceID]"); //just nodes from interface result
									if (objNodes.size() >0){
										cle.LOG.trace('interface#editConfiguration found ' + objNodes.size() + ' for interface');
										//update the category select options CDF
										var objParentId = objDialog.getInterfaceParentId();
										objParentId.clearXmlData();
										//transform selected record
										var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/xsl/config2selectCDF.xsl");
										var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
										var templateProcessor = new jsx3.xml.Template(objXSL);
										var objParams ={attrName:'InterfaceID'};
										templateProcessor.setParams(objParams);
										var objDoc = templateProcessor.transformToObject(objCDF);
										cle.LOG.trace('interface#editConfiguration cdf for procedure: ' + objDoc.toString());
										objParentId.setSourceXML(objDoc, cle.SERVER.getCache());
									}
								}
							}
						});
						//show after all the return values are finished
						rvInterfaceParentId.when(function(response){
							objDialog.setEditButton(objJSX);
							objDialog.markRequiredInputs(false);
							objDialog.setFieldValues(obj);
							objBody.paintChild(objDialog);
							jsx3.sleep(function(){objDialog.getFirstResponder().focus();});
						});
					}
				}
			}
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("interface#editConfiguration error: "
					+ e.getMessage());
		}
	};
	interfaceConfig._doDelete = function(objJSX){
		cle.LOG.trace("interface#_doDelete");
		var objParent = objJSX.getAncestorOfName("configurationViewerPane");
		if (objParent != null){
			//need the CategoryID for the service call.
			var strId = objParent.getInterfaceId();
			var strApplicationId = objParent.getApplicationId();
			if (!jsx3.util.strEmpty(strId)){
				var rv = interfaceConfig.deleteInterfaceOp(strId, strApplicationId);
				rv.when(function(response){
					if (response.status){
						if (!jsx3.util.strEmpty(strApplicationId)){
							cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'interface', appId:strApplicationId});
						}
					}
					//TODO: handle error
				});
			}
		}
	};
	interfaceConfig.deleteConfiguration = function(objJSX){
		cle.LOG.trace("interface#deleteConfiguration");
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
				interfaceConfig._doDelete(objJSX);
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
	interfaceConfig.updateConfiguration = function(objJSX){
		try {
			cle.LOG.trace("interface#updateConfiguration");
			var objParent = objJSX.getAncestorOfType("jsx3.gui.Dialog");
			var strAppId = objParent.getApplicationId();  //use the method from the dialog
			var strId = objParent.getInterfaceId();  //use the method from the dialog
			var objBodyPane = objParent.getDescendantOfName("bodyPane",true,false);
			var objInputs = objBodyPane.getDescendantsOfType("jsx3.gui.Form",false); //downward from second child
			var hasValidationErrors = false;
			var fieldErrors = [];
			cle.LOG.trace("interface#updateConfiguration found " + objInputs.length + " inputs");
			var objRecord = {InterfaceID:strId};
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
			var rv = interfaceConfig.updateInterfaceOp(objRecord);
			rv.when(function(response){
				if (response.status){
					if (!jsx3.util.strEmpty(strAppId)){
						cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'interface', appId:strAppId});
					}
					//TODO: 'create another?' dialog
				}
				//FIXME: avoid an abrupt close without notification
				objJSX.getAncestorOfType("jsx3.gui.Dialog").close(); //use method added in object onAfterDeserialization
			});                
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("interface#updateConfiguration error: "
					+ e.getMessage());
		}
	};
	/**
	 * Create a new type from the server
	 *   {String} the parent application id
	 *   {String} the type name
	 *   {String} the description
	 *   {String} type id
	 */
	interfaceConfig.createInterfaceOp = jsx3.$Y(function(cb) {
		try{
		var objService = cle.SERVER.loadResource("createInterfaceConfiguration2011_rule_xml");
		objService.setOperation("CreateInterfaceConfiguration");
		objService.setEndpointURL(interfaceConfig.getEndpoint());
		objService.data = cb.args()[0];
		cle.LOG.trace('interface#createInterfaceOp appId: ' + objService.data['ApplicationID']);

		//set service response timeout handler
		objService.setTimeout(interfaceConfig.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
			cb.done({status:false});
		});

		//subscribe
		/*
		 * this subscription is a workaround resulting from the WSDL not including a service response
		 */
		objService.getRequest().subscribe(jsx3.net.Request.EVENT_ON_RESPONSE,
		  function(objEvent) {
    		cle.LOG.trace("createInterfaceOp call completed");
    		//TODO should check for status code of 202 (Accepted)
    		cle.LOG.trace('createInterfaceOp request EVENT_ON_RESPONSE status: ' + objEvent.target.getStatus());
    		var bError = objEvent.target.getStatus() != 200 && objEvent.target.getStatus() != 202;
    		(!bError)? cb.done({status:true}) : cb.done({status:false});
		});
		
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
    		cle.LOG.trace("createInterfaceOp call completed");
    		//TODO should check for status code of 202 (Accepted)
    		cle.LOG.trace('createInterfaceOp status: ' + objEvent.target.getRequest().getStatus());
    		cb.done({status:true});
		});
		
		objService.subscribe(jsx3.net.Service.ON_ERROR,
		  function(objEvent) {
			var responseXML = objEvent.target.getRequest().getResponseXML();
			if (responseXML != null){
				cle.LOG.trace(responseXML.toString());
				var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
				faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
				var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
				if (objCodeNode != null){
					var strFaultCode = objCodeNode.getValue();
					cle.LOG.warn("response fault code: " + strFaultCode);
					//get fault message from ns:Message
					var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
					var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
					cle.SERVER.publish({subject:"interfaceFault",code:strFaultCode,message:strFaultMessage,src:"createInterfaceOp"});
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
		}
		catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("interface#createInterfaceOp error: "
					+ e.getMessage());
		}
	});
	/**
	 * Retrieve the all the exception types from the server using application id as the key
	 *   {String}	The id of exception type parent.
	 */
	interfaceConfig.retrieveInterfaceConfigurationList = jsx3.$Y(function(cb) {
	  cle.LOG.debug("interface#retrieveAllInterfacesOp");
      var objService = cle.SERVER.loadResource("retrieveInterfaceConfigurationList_rule_xml");
      objService.setOperation("RetrieveInterfaceConfigurationList");
      var strAppId = cb.args()[0]; //parent id passed in as method argument
	  objService.appId = strAppId;
	  objService.setEndpointURL(interfaceConfig.getEndpoint());
	  
	  //set service response timeout handler
	  objService.setTimeout(interfaceConfig.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
		    cb.done({status:false});
	  });
	
	  //subscribe
	  //inner function handler for successful response
	  objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		function(objEvent) {
			var responseXML = objEvent.target.getInboundDocument();
			var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());

			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/interfaceConfig/interfaceList2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);
				var objParams = {parentId: strAppId};
				templateProcessor.setParams(objParams);
				var objCDF = templateProcessor.transformToObject(objXML);
	    		cle.LOG.trace("RetrieveInterfaceConfigurationList call completed");
				cb.done({status:true,document:objCDF});
			}
	  });
	  //inner function handler for soap fault response
		objService.subscribe(jsx3.net.Service.ON_ERROR,
		  function(objEvent) {
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
					//FIXME: the service should not return an error for an empty set
					if ((!jsx3.util.strEmpty(strFaultCode)) && (strFaultCode=='no value')){
						var objCDF = new jsx3.xml.CDF.Document.newDocument();
						var strText = cle.utils.getProperty("config_noEntriesFound");
						objCDF.insertRecord({jsxid:jsx3.xml.CDF.getKey(),jsxtext:strText,InterfaceID:'0'},'jsxroot',true);
						cb.done({status:true,document:objCDF});
					}
					else {
						cle.SERVER.publish({subject:"interfaceFault",code:strFaultCode,message:strFaultCodeMessage,src:"retrieveInterfaceConfigurationList"});
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
	 * Retrieves a single interface item
	 * {String} the type id
	 */
	interfaceConfig.retrieveInterfaceConfigurationDetail = jsx3.$Y(function(cb) {
		cle.LOG.debug("interface#retrieveInterfaceConfigurationDetail");
		var objService = cle.SERVER.loadResource("retrieveInterfaceConfigurationDetail_rule_xml");
		objService.setOperation("RetrieveInterfaceConfigurationDetail");
		objService.setEndpointURL(interfaceConfig.getEndpoint());
		objService.id = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(interfaceConfig.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
    		cle.LOG.warn("retrieveInterfaceConfigurationDetail call timeout.");
		    cb.done({status:false});
		});

		//subscribe
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
			var responseXML = objEvent.target.getInboundDocument();
			var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/interfaceConfig/interfaceList2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objCDF = templateProcessor.transformToObject(objXML);
				var objDoc = cle.SERVER.getCache().getDocument(interfaceConfig.LIST_CACHE_ID);
				if (objDoc == null){
					cle.LOG.trace("retrieveInterfaceConfigurationDetail created cdf");
					objDoc = new jsx3.xml.CDF.Document.newDocument();
					cle.SERVER.getCache().setDocument(interfaceConfig.LIST_CACHE_ID,objDoc);
				}
				objDoc = jsx3.xml.CDF.Document.wrap(objDoc);
				var strInterfaceId = objEvent.target.id;
				var objNodes = objCDF.selectNodes("//record[@InterfaceID='" + strInterfaceId + "']");
	  			if (objNodes.size() > 0){
	  				jsx3.$A(objNodes.toArray()).each(function(childNode){
	  					objDoc.insertRecordNode(childNode.cloneNode(true),"jsxroot",true);
	  				});
	  			}
	    		cle.LOG.trace("retrieveInterfaceConfigurationDetail call completed");
			    cb.done({status:true});
			}
		});
		objService.subscribe(jsx3.net.Service.ON_ERROR,
		  function(objEvent) {
			var responseXML = objEvent.target.getRequest().getResponseXML();
			if (responseXML != null){
				cle.LOG.trace(responseXML.toString());
				var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
				faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
				var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
				if (objCodeNode != null){
					var strFaultCode = objCodeNode.getValue();
					cle.LOG.warn("response fault code: " + strFaultCode);
					//get fault message from ns:Message
					var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
					var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
					cle.SERVER.publish({subject:"interfaceFault",code:strFaultCode,message:strFaultMessage,src:"retrieveInterfaceConfigurationDetail"});
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
	 * Retrieves a single interface item
	 * {String} the type id
	 */
	interfaceConfig.retrieveInterfaceParentList = jsx3.$Y(function(cb) {
		cle.LOG.debug("interface#retrieveInterfaceParentList");
		var objService = cle.SERVER.loadResource("retrieveInterfaceParentList_rule_xml");
		objService.setOperation("RetrieveInterfaceParentList");
		
		objService.setEndpointURL(interfaceConfig.getEndpoint());
		objService.id = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(interfaceConfig.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
    		cle.LOG.warn("retrieveInterfaceParentList call timeout.");
		    cb.done({status:false});
		});

		//subscribe
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
			var responseXML = objEvent.target.getInboundDocument();
			var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/interfaceConfig/interfaceParentList2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objCDF = templateProcessor.transformToObject(objXML);
	    		cle.LOG.trace("retrieveInterfaceConfigurationDetail call completed");
	    		cb.done({status:true,document:objCDF});
			}
		});
		objService.subscribe(jsx3.net.Service.ON_ERROR,
		  function(objEvent) {
			var responseXML = objEvent.target.getRequest().getResponseXML();
			if (responseXML != null){
				cle.LOG.trace(responseXML.toString());
				var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
				faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
				var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
				if (objCodeNode != null){
					var strFaultCode = objCodeNode.getValue();
					cle.LOG.warn("response fault code: " + strFaultCode);
					//get fault message from ns:Message
					var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
					var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
					cle.SERVER.publish({subject:"interfaceFault",code:strFaultCode,message:strFaultMessage,src:"retrieveInterfaceParentList"});
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
	interfaceConfig.updateInterfaceOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("interface#updateInterfaceOp");
		var objService = cle.SERVER.loadResource("updateInterfaceConfiguration_rule_xml");
		objService.setOperation("UpdateInterfaceConfiguration");
		objService.setEndpointURL(interfaceConfig.getEndpoint());
		objService.data = cb.args()[0];
		
		//set service response timeout handler
		objService.setTimeout(interfaceConfig.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
    		cle.LOG.warn("updateInterfaceOp call timeout.");
		    cb.done({status:false});
		});

		  // subscribe
		objService.subscribe(jsx3.net.Service.ON_SUCCESS, function(objEvent) {
    		cle.LOG.trace("updateInterfaceOp call completed");
		    cb.done({status:true});
		});
		objService.subscribe(jsx3.net.Service.ON_ERROR,
		  function(objEvent) {
			var responseXML = objEvent.target.getRequest().getResponseXML();
			if (responseXML != null){
				cle.LOG.trace(responseXML.toString());
				var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
				faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
				var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
				if (objCodeNode != null){
					var strFaultCode = objCodeNode.getValue();
					cle.LOG.warn("response fault code: " + strFaultCode);
					//get fault message from ns:Message
					var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
					var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
					cle.SERVER.publish({subject:"interfaceFault",code:strFaultCode,message:strFaultMessage,src:"updateInterfaceOp"});
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
		
		// call the service
		objService.doCall();
	});
	/**
	 * Delete the type at the server
	 *   {String}	The interface id to delete.
	 *   {String}	The application id.
	 */
	interfaceConfig.deleteInterfaceOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("interface#deleteInterfaceOp");
		var objService = cle.SERVER.loadResource("deleteInterfaceConfigurations_rule_xml");
		objService.setOperation("DeleteInterfaceConfigurations");
		objService.setEndpointURL(interfaceConfig.getEndpoint());
		objService.id = cb.args()[0];
		objService.appId = cb.args()[1];

		//set service response timeout handler
		objService.setTimeout(interfaceConfig.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
    		cle.LOG.warn("deleteInterfaceOp call timeout.");
		    cb.done({status:false});
		});

		//subscribe
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
    		cle.LOG.trace("deleteInterfaceOp call completed");
		    cb.done({status:true});
		});
		objService.subscribe(jsx3.net.Service.ON_ERROR,
		  function(objEvent) {
			var responseXML = objEvent.target.getRequest().getResponseXML();
			if (responseXML != null){
				cle.LOG.trace(responseXML.toString());
				var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
				faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
				var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
				if (objCodeNode != null){
					var strFaultCode = objCodeNode.getValue();
					cle.LOG.warn("response fault code: " + strFaultCode);
					//get fault message from ns:Message
					var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
					var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
					cle.SERVER.publish({subject:"interfaceFault",code:strFaultCode,message:strFaultMessage,src:"deleteInterfaceOp"});
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
	 * displays fault information from service response
	 */
	interfaceConfig.handleFault = function(objEvent){
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
	interfaceConfig.setSubscriptions();
  }
);
 