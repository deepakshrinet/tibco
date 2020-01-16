jsx3.require("jsx3.gui.Form");

jsx3.lang.Package.definePackage("cle.configuration.exception",
  function(exception) {
	exception.ENDPOINT_HOST = "http://localhost:9950";
	exception.ENDPOINT_URL = "/Administration/GUIServices/ExceptionConfigurationServices/intfExceptionConfiguration-service.serviceagent/intfwsRetrieveSpecificExceptionConfigurationListEndpoint0";
	exception.TIMEOUT = 20 * 1000; //20 seconds

	exception.setSubscriptions = function(){
		cle.LOG.trace("exceptionConfig#setSubscriptions");
		cle.SERVER.subscribe("exceptionConfigFault",exception.handleFault);
	};
	exception.deleteExceptionCodeById = function(objEvent){
		cle.LOG.trace("exceptionConfig#deleteExceptionCodeById");
	};
	exception.getEndpointHost = function() {
		return exception.ENDPOINT_HOST;
	};
	exception.setEndpointHost = function(strEndpointHost) {
		exception.ENDPOINT_HOST = strEndpointHost;
	};
	exception.getEndpointUrl = function() {
		return exception.ENDPOINT_URL;
	};
	exception.setEndpointUrl = function(strEndpointUrl) {
		exception.ENDPOINT_URL = strEndpointUrl;
	};
	exception.getEndpoint = function() {
		return exception.ENDPOINT_HOST + exception.ENDPOINT_URL;
	};
	exception.editConfiguration = function(objJSX){
		try{
			cle.LOG.trace("exceptionConfig#editConfiguration");
			objJSX.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
			var objParent = objJSX.getAncestorOfName("configurationViewerPane");
			if (objParent != null){
				var objMatrix = objParent.getDescendantOfName("configurationEditorMatrix",true,false);
				if (objMatrix != null){
					var obj = {};
					var objCDF = objMatrix.getXML();
					objCDF = jsx3.xml.CDF.Document.wrap(objCDF);
					var recordIds = objCDF.getRecordIds();
					jsx3.$A(recordIds).each(function(id){
						var objCDFRecord = objCDF.getRecord(id);
						obj[objCDFRecord.attrName] = objCDFRecord.jsxvalue;
					});
					//
					var objBody = cle.SERVER.getBodyBlock();
					//launch dialog and wait to show it
					var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/exceptionConfig/configurationEditorDialog_gui.xml");
					var objDialog = objBody.loadAndCache(configDialogURL,false);
					//set the type of dialog to 'modal'
					objDialog.setModal(jsx3.gui.Dialog.MODAL);
					//set the dialog caption bar text
					var objWindowBar = objDialog.getCaptionBar();
					var strCaption = cle.utils.getProperty('config_editConfigurationItem');
					objWindowBar.setText(strCaption,false); //wait to paint it
					objDialog.setHeight(760,false);
					//paint it without contents
					objBody.paintChild(objDialog);
					//load the body section of the dialog with the specific interface
					var objTargetPane = objDialog.getDescendantOfName("dialogPane",true,false);
					if (objTargetPane != null){
						//TODO: should only enable the button if form has changes
						var objSaveButton = objDialog.getSaveButton();
						if (objSaveButton){
							objSaveButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
						}
						var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/xsl/config2selectCDF.xsl");
						var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
						if (!objXSL.hasError()){
							var strAppId = objParent.getApplicationId();
							//call the following services to establish the selection options for the UI
							//category
							var rvCategory = cle.configuration.category.retrieveAllCategoriesOp(strAppId);
							rvCategory.when(function(result){
								var isSuccess = result.status;
								if (isSuccess){
									//copy the results to this node
									var objCDF = result.document;
									if (objCDF != null){
										cle.LOG.trace('configuration#createExceptionCodeItem cdf for category: ' + objCDF.toString());
										var objNodes = objCDF.selectNodes("//record[@CategoryID]"); //just nodes from a category result
										if (objNodes.size() >0){
											cle.LOG.trace('exceptionConfig#editConfiguration found ' + objNodes.size() + ' for category');
											//update the category select options CDF
											var objCategory = objDialog.getCategory();
											objCategory.clearXmlData();
											//transform selected record
											var templateProcessor = new jsx3.xml.Template(objXSL);
											var objParams ={attrName:'CategoryID'};
											templateProcessor.setParams(objParams);
											var objDoc = templateProcessor.transformToObject(objCDF);
											cle.LOG.trace('exceptionConfig#editConfiguration cdf for procedure: ' + objDoc.toString());
											objCategory.setSourceXML(objDoc, cle.SERVER.getCache());
										}
									}
								}
							});
							//type
							var rvType = cle.configuration.type.retrieveAllTypesOp(strAppId);
							rvType.when(function(result){
								var isSuccess = result.status;
								if (isSuccess){
									//copy the results to this node
									var objCDF = result.document;
									if (objCDF != null){
										cle.LOG.trace('exceptionConfig#editConfiguration cdf for type: ' + objCDF.toString());
										var objNodes = objCDF.selectNodes("//record[@TypeID]"); //just nodes from a configuration type result
										if (objNodes.size() >0){
											cle.LOG.trace('exceptionConfig#editConfiguration found ' + objNodes.size() + ' for type');
											//update the type select options CDF
											var objType = objDialog.getType();
											objType.clearXmlData();
											//transform selected record
											var templateProcessor = new jsx3.xml.Template(objXSL);
											var objParams ={attrName:'TypeID'};
											templateProcessor.setParams(objParams);
											var objDoc = templateProcessor.transformToObject(objCDF);
											objType.setSourceXML(objDoc, cle.SERVER.getCache());
										}
									}
								}
							});
							//severity
							var rvSeverity = cle.configuration.severity.retrieveAllSeveritiesOp(strAppId);
							rvSeverity.when(function(result){
								var isSuccess = result.status;
								if (isSuccess){
									//copy the results to this node
									var objCDF = result.document;
									if (objCDF != null){
										cle.LOG.trace('exceptionConfig#editConfiguration cdf for severity: ' + objCDF.toString());
										var objNodes = objCDF.selectNodes("//record[@SeverityID]"); //just nodes from an severity result
										if (objNodes.size() >0){
											cle.LOG.trace('exceptionConfig#editConfiguration found ' + objNodes.size() + ' for severity');
											//update the severity select options CDF
											var objSeverity = objDialog.getSeverity();
											objSeverity.clearXmlData();
											//transform selected record
											var templateProcessor = new jsx3.xml.Template(objXSL);
											var objParams ={attrName:'SeverityID'};
											templateProcessor.setParams(objParams);
											var objDoc = templateProcessor.transformToObject(objCDF);
											objSeverity.setSourceXML(objDoc, cle.SERVER.getCache());
										}
									}
								}
							});
							//procedure
							var rvProcedure = cle.configuration.procedure.retrieveAllProceduresOp(strAppId);
							rvProcedure.when(function(result){
								var isSuccess = result.status;
								if (isSuccess){
									//copy the results to this node
									var objCDF = result.document;
									if (objCDF != null){
										cle.LOG.trace('exceptionConfig#editConfiguration cdf for procedure: ' + objCDF.toString());
										var objNodes = objCDF.selectNodes("//record[@ProcedureID]"); //just nodes from a procedure result
										if (objNodes.size() >0){
											cle.LOG.trace('exceptionConfig#editConfiguration found ' + objNodes.size() + ' for procedure');
											//update the procedure select options CDF
											var objProcedure = objDialog.getProcedure();
											objProcedure.clearXmlData();
											//transform selected record
											var templateProcessor = new jsx3.xml.Template(objXSL);
											var objParams ={attrName:'ProcedureID'};
											templateProcessor.setParams(objParams);
											var objDoc = templateProcessor.transformToObject(objCDF);
											objProcedure.setSourceXML(objDoc, cle.SERVER.getCache());
										}
									}
								}
							});
							//objPane.setRecordId(objRecordNode.getAttribute('jsxid'));
							objDialog.setApplicationId(objParent.getApplicationId()); //from viewer method in deserialization script
							objDialog.setExceptionCode(objParent.getExceptionCode()); //from viewer method in deserialization script
							//show after all the return values are finished
							rvCategory.and(rvType).and(rvSeverity).and(rvProcedure).when(function(){
								cle.LOG.trace('exceptionConfig#editConfiguration ready to paint child');
								objDialog.setEditButton(objJSX);
								objDialog.markRequiredInputs(true);
								objDialog.setFieldValues(obj);
								//TODO: find out why it produces two objPane components when dialog paints child.
								//objDialog.paintChild(objPane);
								jsx3.sleep(function(){objDialog.getFirstResponder().focus();});
							});
						}
					}
					else {
						cle.LOG.warn("exceptionConfig#editConfiguration target 'bodyPane' not found.");
					}
				}
			}
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("exceptionConfig#editConfiguration error: "
					+ e.getMessage());
		}
	};
	exception._doDelete = function(objJSX){
		cle.LOG.trace("exception#_doDelete");
		var objParent = objJSX.getAncestorOfName("configurationViewerPane");
		if (objParent != null){
			//need the CategoryID for the service call.
			var strId = objParent.getExceptionCode();
			var strApplicationId = objParent.getApplicationId();
			if (!jsx3.util.strEmpty(strId)){
				var rv = exception.deleteExceptionConfigurationOp(strId, strApplicationId);
				rv.when(function(response){
					if (response.status){
						if (!jsx3.util.strEmpty(strApplicationId)){
							cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'exceptionCode', appId:strApplicationId});
						}
					}
					//TODO: handle error
				});
			}
		}
	};
	exception.deleteConfiguration = function(objJSX){
		cle.LOG.trace("exceptionConfig#deleteConfiguration");
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
				exception._doDelete(objJSX);
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
	exception.updateConfiguration = function(objJSX){
		try{
			cle.LOG.trace("exceptionConfig#updateConfiguration");
			var objParent = objJSX.getAncestorOfType("jsx3.gui.Dialog");
			var strAppId = objParent.getApplicationId();  //use the method from the dialog
			var strId = objParent.getExceptionCode();  //use the method from the dialog
			var objBodyPane = objParent.getDescendantOfName("bodyPane",true,false);
			var objInputs = objBodyPane.getDescendantsOfType("jsx3.gui.Form",false); //downward from second child
			var hasValidationErrors = false;
			var fieldErrors = [];
			cle.LOG.trace("exceptionConfig#updateConfiguration found " + objInputs.length + " inputs");
			var objRecord = {ExceptionCode:strId};
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
			var rv = exception.updateExceptionOp(objRecord);
			rv.when(function(response){
				if (response.status){
					if (!jsx3.util.strEmpty(strAppId)){
						cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'exceptionCode', appId:strAppId});
					}
					//TODO: 'create another?' dialog
				}
				//FIXME: avoid an abrupt close without notification
				objJSX.getAncestorOfType("jsx3.gui.Dialog").close(); //use method added in object onAfterDeserialization
			});                
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("exceptionConfig#updateConfiguration error: "
					+ e.getMessage());
		}
	};
	exception.createNewExceptionCode = function(objJSX) {
		try {
			cle.LOG.debug("exceptionConfig#createNewException");
			//TODO: enable the 'id' field for input and focus
			var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid");
			var objInputs = objParent.getChild(1).getDescendantsOfType("jsx3.gui.Form",false); //downward from second child
			var hasValidationErrors = false;
			var fieldErrors = [];
			cle.LOG.trace("found " + objInputs.length + " inputs");
			var objRecord = {};
			jsx3.$A(objInputs).each(function(input){
				var strValue = input.getValue();
				if (jsx3.util.strEmpty(strValue) && input.getRequired()==jsx3.gui.Form.REQUIRED){
					hasValidationErrors = true;
					//throw data entry exception
					var objLabel = input.getParent().getChild('label');
					if (objLabel != null){
						fieldErrors.push(objLabel.getText());
					}
				}
				objRecord[input.getCDFAttribute()] = strValue;
				cle.LOG.trace(input.getCDFAttribute() + ": " + input.getValue());
			});
			if (hasValidationErrors){
				var strCaption = cle.utils.getProperty('exceptionConfig_createExceptionRequiredFieldsFailedValidation');
				cle.SERVER.alert(strCaption, fieldErrors.toString());
				return;
			}
			var rv = exception.createExceptionConfigOp();
			rv.when(function(isSuccess){
				var strAppId = objParent.getParent().getApplicationId();
				cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'exceptionCode', appId:strAppId});
				//TODO: 'create another?' dialog
				objJSX.getAncestorOfType("jsx3.gui.Dialog").doClose();
			});                
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("exceptionConfig#createNewExceptionCode error: "
					+ e.getMessage());
		}
	};
	/**
	 * Create a new exception persisted at the server
	 *   {String} the parent application id
	 *   {String} the exception name
	 *   {String} the description
	 *   {String} exception id
	 */
	exception.createExceptionConfigOp = jsx3.$Y(function(cb) {
		cle.LOG.trace("exceptionConfig#createExceptionConfigOp");
		var objService = cle.SERVER.loadResource("createExceptionConfigurationOp_rule_xml");
		objService.setOperation("CreateExceptionConfigurationOp");
		objService.setEndpointURL(exception.getEndpoint());
/*		
		objService.applicationId = cb.args()[0];
		objService.name = cb.args()[1];
		objService.description = cb.args()[2];
		objService.id = 1;
*/
		//set service response timeout handler
		objService.setTimeout(exception.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
		});

		//inner function handler for successful response
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
			// var responseXML = objEvent.target.getInboundDocument();
			cb.done({status:false});
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
				cle.SERVER.publish({subject:"exceptionConfigFault",code:strFaultCode,message:strFaultMessage,src:"createExceptionConfigOp"});
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
	 * Retrieve the all the exception configurations from the server using application id as the key
	 *   {String}	The id of exception application id.
	 */
	exception.retrieveAllExceptionConfigurationsOp = jsx3.$Y(function(cb) {
	  //TODO: modify the operation name to something like 'retrieveAllExceptionConfigurationsOp'
	  cle.LOG.debug("exceptionConfig#retrieveAllExceptionsOp");
	  var objService = app.tibco.CLE.loadResource("retrieveSpecificExceptionConfigurationListOp_rule_xml");
	  objService.setOperation("RetrieveSpecificExceptionConfigurationListOp");
	  objService.applicationId = cb.args()[0];
	  objService.setEndpointURL(exception.getEndpoint());
	  
	  //set service response timeout handler
	  objService.setTimeout(exception.TIMEOUT,
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
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/exceptionConfig/exceptionConfigList2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objCDF = templateProcessor.transformToObject(objXML);
	    		cle.LOG.trace("retrieveAllExceptionsOp call completed");
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
				cle.LOG.trace("response fault code: " + strFaultCode);
				//check for registered fault code
				var strFaultCodeMessage = cle.utils.getProperty(strFaultCode);
				//FIXME: the service should not return an error for an empty set
				if ((!jsx3.util.strEmpty(strFaultCode)) && (strFaultCode=='no value')){
					var objCDF = new jsx3.xml.CDF.Document.newDocument();
					var strText = cle.utils.getProperty("config_noEntriesFound");
					objCDF.insertRecord({jsxid:jsx3.xml.CDF.getKey(),jsxtext:strText,ExceptionCode:'0'},'jsxroot',true);
					cb.done({status:true,document:objCDF});
				}
				else {
					cle.SERVER.publish({subject:"exceptionConfigFault",code:strFaultCode,message:strFaultCodeMessage,src:"retrieveAllExceptionConfigurationsOp"});
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
	 * Retrieves exception configurations for a given application and code
	 * {String} the exception's application id
	 * {String} the exception code
	 */
	exception.retrieveSpecificExceptionConfigurationOp = jsx3.$Y(function(cb) {	
		cle.LOG.debug("exception#retrieveSpecificExceptionConfigurationOp");
	    var objService = cle.SERVER.loadResource("retrieveSpecificExceptionConfigurationOp_rule_xml");
	    objService.setOperation("RetrieveSpecificExceptionConfigurationOp");		
		objService.setEndpointURL(exception.getEndpoint());
		objService.applicationId = cb.args()[0];
		objService.exceptionCode = cb.args()[1];

		//set service response timeout handler
		objService.setTimeout(exception.TIMEOUT,
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
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/exceptionConfig/exceptionConfigDetail2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objCDF = templateProcessor.transformToObject(objXML);
	    		cle.LOG.trace("retrieveSpecificExceptionConfigurationOp call completed");
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
				cle.SERVER.publish({subject:"exceptionConfigFault",code:strFaultCode,message:strFaultMessage,src:"retrieveSpecificExceptionConfigurationOp"});
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
	 * Persist the exception changes at the server
	 *   uses the exception list CDF marked with 'hasChanges' attributes
	 *   maps to SOAP request within the mapping utility context
	 */
	exception.updateExceptionOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("exceptionConfig#updateExceptionOp");
		var objService = cle.SERVER.loadResource("updateExceptionConfigurationOp_rule_xml");
		objService.setOperation("UpdateExceptionConfigurationOp");
		objService.setEndpointURL(exception.getEndpoint());
		objService.data = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(exception.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
			cb.done({status:false});
		});

		//inner function handler for successful response
		objService.subscribe(jsx3.net.Service.ON_SUCCESS, function(objEvent) {
    		cle.LOG.trace("updateExceptionOp call completed");
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
				cle.SERVER.publish({subject:"exceptionConfigFault",code:strFaultCode,message:strFaultMessage,src:"updateExceptionOp"});
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
	 * Delete the exception at the server
	 *   {String}	The exception id to delete.
	 */
	exception.deleteExceptionConfigurationOp = jsx3.$Y(function(cb) {
		cle.LOG.debug("exception#deleteExceptionOp");
		var objService = cle.SERVER.loadResource("deleteExceptionConfigurationOp_rule_xml");
		objService.setOperation("DeleteExceptionConfigurationOp");
		objService.setEndpointURL(exception.getEndpoint());
		objService.id = cb.args()[0];
		objService.appId = cb.args()[1];

		//set service response timeout handler
		objService.setTimeout(exception.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
			cb.done({status:false});
		});

		//inner function handler for successful response
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
    		cle.LOG.trace("DeleteExceptionConfigurationOp call completed");
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
				cle.SERVER.publish({subject:"exceptionConfigFault",code:strFaultCode,message:strFaultMessage,src:"deleteExceptionOp"});
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
	exception.handleFault = function(objEvent){
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
	exception.setSubscriptions();
  }
);
