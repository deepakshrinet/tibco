jsx3.require("jsx3.gui.Form");

jsx3.lang.Package.definePackage("cle.configuration.category",
  function(category) {
	category.ENDPOINT_HOST = "http://localhost:9950";
	category.ENDPOINT_URL = "/Administration/GUIServices/CategoryServices/intfCategory-service.serviceagent/intfwsUpdateCategoryEndpoint0";
	category.TIMEOUT = 20 * 1000; //20 seconds

	category.setSubscriptions = function(){
		cle.LOG.trace("category#setSubscriptions");
		cle.SERVER.subscribe("categoryFault",category.handleFault);
	};
	category.getEndpointHost = function() {
		return category.ENDPOINT_HOST;
	};
	category.setEndpointHost = function(strEndpointHost) {
		category.ENDPOINT_HOST = strEndpointHost;
	};
	category.getEndpointUrl = function() {
		return category.ENDPOINT_URL;
	};
	category.setEndpointUrl = function(strEndpointUrl) {
		category.ENDPOINT_URL = strEndpointUrl;
	};
	category.getEndpoint = function() {
		return category.ENDPOINT_HOST + category.ENDPOINT_URL;
	};
	category.disableDeleteButton = function(objEvent) {
		try {
			cle.LOG.trace("category#disableDeleteButton");
			var objButton = cle.SERVER.getJSXByName("deleteCategoryBtn");
			if (objButton != null){
				objButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
			}
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("category#disableDeleteButton error: "
					+ e.getMessage());
		}
	};
	category.enableDeleteButton = function(objEvent) {
		try {
			cle.LOG.trace("category#enableDeleteButton");
			var objButton = cle.SERVER.getJSXByName("deleteCategoryBtn");
			if (objButton != null){
				//check for privilege
				var hasDeleteConfigPrivilege = cle.privileges.getPrivilegesById(strAppId).hasPrivilege(cle.Privilege.DELETE_CONFIGURATIONS);
				if (hasDeleteConfigPrivilege == jsx3.Boolean.TRUE){
					objButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
			}
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("category#enableDeleteButton error: "
					+ e.getMessage());
		}
	};
	category.editConfiguration = function(objJSX){
		try {
			cle.LOG.trace("category#editConfiguration");
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
					var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/categoryConfig/configurationEditorDialog_gui.xml");
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
						objDialog.setCategoryId(objParent.getCategoryId()); //from viewer method in deserialization script
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
			cle.LOG.error("category#editConfiguration error: "
					+ e.getMessage());
		}
	};
	category._doDelete = function(objJSX){
		cle.LOG.trace("category#_doDelete");
		var objParent = objJSX.getAncestorOfName("configurationViewerPane");
		if (objParent != null){
			//need the CategoryID for the service call.
			var strId = objParent.getCategoryId();
			var strApplicationId = objParent.getApplicationId();
			if (!jsx3.util.strEmpty(strId)){
				var rv = category.deleteCategoryOp(strId);
				rv.when(function(response){
					if (response.status)
					if (!jsx3.util.strEmpty(strApplicationId)){
						cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'category', appId:strApplicationId});
					}
				});
			}
		}
	};
	category.deleteConfiguration = function(objJSX){
		cle.LOG.trace("category#deleteConfiguration");
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
				category._doDelete(objJSX);
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
	category.updateConfiguration = function(objJSX){
		try {
			cle.LOG.trace("category#updateConfiguration");
			var objParent = objJSX.getAncestorOfType("jsx3.gui.Dialog");
			var strAppId = objParent.getApplicationId();  //use the method from the dialog
			var strId = objParent.getCategoryId();  //use the method from the dialog
			var objBodyPane = objParent.getDescendantOfName("bodyPane",true,false);
			var objInputs = objBodyPane.getDescendantsOfType("jsx3.gui.Form",false); //downward from second child
			var hasValidationErrors = false;
			var fieldErrors = [];
			cle.LOG.trace("category#updateConfiguration found " + objInputs.length + " inputs");
			var objRecord = {CategoryID:strId};
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
			var rv = category.updateCategoryOp(objRecord);
			rv.when(function(response){
				if (response.status){
					if (!jsx3.util.strEmpty(strAppId)){
						cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'category', appId:strAppId});
					}
					//TODO: 'create another?' dialog
				}
				//FIXME: avoid an abrupt close without notification
				objJSX.getAncestorOfType("jsx3.gui.Dialog").close(); //use method added in object onAfterDeserialization
			});                
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("category#updateConfiguration error: "
					+ e.getMessage());
		}
	};
	category.onSelectCategory = function(objEvent) {
		try {
			cle.LOG.warn("category#onSelectCategory");
			var objMatrix = objEvent.src;
			var strRecordId = objEvent.id;
			category.disableDeleteButton();
			var objRecordNode = objMatrix.getRecordNode(strRecordId);
			var objXML = new jsx3.xml.CDF.Document.newDocument();
			objXML.getRootNode().appendChild(objRecordNode.cloneNode(true)); //use a copy, not the real record
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/categoryConfig/categoryRecord2records.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				//transform selected record
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objDoc = templateProcessor.transformToObject(objXML);
	            jsx3.xml.CDF.Document.wrap(objDoc).convertProperties(cle.SERVER.JSS, ["jsxtext","jsxtip"]);
				cle.SERVER.getCache().setDocument(category.EDITOR_CACHE_ID,objDoc);
			}
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("category#onSelectCategory error: "
					+ e.getMessage());
		}
	};
	category.createNewCategory = function(objJSX) {
		  try {
			  cle.LOG.trace("category#createNewCategory");
			  //TODO: enable the 'id' field for input and focus
			  var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid").getParent();
			  var objInputs = objParent.getDescendantsOfType("jsx3.gui.Form",false);
			  cle.LOG.trace("found " + objInputs.length + " inputs");
			  var objRecord = {};
			  jsx3.$A(objInputs).each(function(input){
				  objRecord[input.getCDFAttribute()] = input.getValue();
				  cle.LOG.trace(input.getName() + '/' +input.getCDFAttribute() + ": " + input.getValue());
				  //TODO: validate input
				  /* example: the category name should not be allowed to be used twice */
			  });
			  var rv = category.createCategoryOp(objRecord['ApplicationID'], objRecord['CategoryName'], objRecord['Description'], 1);
			  rv.when(function(response){
				  //TODO: use result.status instead of isSuccess
				  if (response.status){
					  //var objMatrix = cle.SERVER.getJSXByName('configTreeMatrix');
					  //var strRecordId = objParent.getRecordId();
					  cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'category', appId:objRecord['ApplicationID']});
					  /*
					  cle.LOG.trace("category#createNewCategory strRecordId used in response handler: " + strRecordId);
					  var objRecordNode = objMatrix.getRecordNode(strRecordId);
					  var strRecordType = objRecordNode.getAttribute("jsxtype");
					  var strAppId = (strRecordType=='application')? objRecordNode.getAttribute("jsxid") : objRecordNode.getAttribute("ApplicationID");
					  cle.LOG.trace("category#createNewCategory strAppId used in response handler: " + strAppId);
					  category.refreshCategoryDetails(objMatrix,strRecordId,objRecordNode,strAppId);
					  */
					  objJSX.getAncestorOfType("jsx3.gui.Dialog").doClose();
				  }
				  //TODO: notify user of problem for a retry
			  });                
		  } catch (e) {
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("category#createNewCategory error: "
					  + e.getMessage());
		  }
	  };
	  /**
	   * refreshes the category list using the application id
	   */
	  category.refreshCategoryDetails = function(objMatrix,strRecordId,objRecordNode,strAppId) {
		  try{
			  cle.LOG.trace("category#refreshCategoryDetails");
			  //call service to retrieve all category configurations for this application id
			  var rv = category.retrieveAllCategoriesOp(strAppId);
			  rv.when(function(result){
				  var isSuccess = result.status;
				  if (isSuccess){
					  //copy the results to this node
					  var objCDF = result.document;
					  if (objCDF != null){
						  var objNodes = objCDF.selectNodes("//record[@CategoryID]"); //just nodes from a category result
						  if (objNodes.size() >0){
							  //this is a category, remove children and show list from service
							  objRecordNode.removeChildren();
							  jsx3.$A(objNodes.toArray()).each(function(node){
								  node.setAttribute('jsxtype',cle.configuration.TYPE_CATEGORY); //note dependency on configuration js
								  node.setAttribute('jsximg',cle.configuration.ATTR_IMG_URL);
								  objRecordNode.appendChild(node);
							  });
						  }
					  }
				  }
				  cle.configuration.toggleTreeItem(objMatrix,strRecordId,true); //show open icon
				  jsx3.sleep(function(){objMatrix.revealRecord(strRecordId);});
			  });
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("category#refreshCategoryDetails error: " + e.getMessage());
		  }
	  };
	/**
	 * Create a new category persisted at the server
	 *   {String} the parent application id
	 *   {String} the category name
	 *   {String} the description
	 *   {String} category id
	 */
	category.createCategoryOp = jsx3.$Y(function(cb) {
		var objService = cle.SERVER.loadResource("createCategory_rule_xml");
		objService.setOperation("CreateCategoryOp");
		objService.setEndpointURL(category.getEndpoint());
		objService.applicationId = cb.args()[0];
		objService.name = cb.args()[1];
		objService.description = cb.args()[2];
		objService.id = cb.args()[3];

		//set service response timeout handler
		objService.setTimeout(category.TIMEOUT,
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
				cle.SERVER.publish({subject:"categoryFault",code:strFaultCode,message:strFaultMessage,src:"createCategoryOp"});
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
	 * Retrieve all the categories from the service using application id as the key
	 *   {String}	The id of category parent.
	 */
	category.retrieveAllCategoriesOp = jsx3.$Y(function(cb) {
		//TODO: the operation should be changed to 'retrieveCategoryList', then refactor this name to match operation
	  cle.LOG.trace("category#retrieveAllCategoriesOp");
	  var objService = app.tibco.CLE.loadResource("retrieveCategoryConfiguration_rule_xml");
	  objService.setOperation("RetrieveCategoryDetailOp");
	  objService.id = cb.args()[0];
	  objService.setEndpointURL(category.getEndpoint());
	  
	  //set service response timeout handler
	  objService.setTimeout(category.TIMEOUT,
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
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/categoryConfig/categoryList2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objCDF = templateProcessor.transformToObject(objXML);
	    		cle.LOG.trace("retrieveCategoryDetailOp call completed");
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
					objCDF.insertRecord({jsxid:jsx3.xml.CDF.getKey(),jsxtext:strText,CategoryID:'0'},'jsxroot',true);
					cb.done({status:true,document:objCDF});
				}
				else {
					cle.SERVER.publish({subject:"categoryFault",code:strFaultCode,message:strFaultCodeMessage,src:"retrieveAllCategoriesOp"});
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
	 * {String} the category's application id
	 */
	category.retrieveCategoryListWithSysIDOp = jsx3.$Y(function(cb) {
		cle.LOG.trace("category#retrieveCategoryListWithSysIDOp");
		var objService = cle.SERVER.loadResource("retrieveCategoryListWithSysID_rule_xml");
		objService.setOperation("RetrieveCategoryListWithSysIDOp");
		objService.setEndpointURL(category.getEndpoint());
		objService.id = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(category.TIMEOUT,
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
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/categoryConfig/categoryList2CDF.xsl");
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objCDF = templateProcessor.transformToObject(objXML);
				alert(objCDF.toString());
				var objDoc = cle.SERVER.getCache().getDocument(category.LIST_CACHE_ID);
				if (objDoc == null){
					cle.LOG.trace("created " + category.LIST_CACHE_ID);
					objDoc = new jsx3.xml.CDF.Document.newDocument();
					cle.SERVER.getCache().setDocument(category.LIST_CACHE_ID,objDoc);
				}
				objDoc = jsx3.xml.CDF.Document.wrap(objDoc);
				var strCategoryId = objEvent.target.id;
				var objNodes = objCDF.selectNodes("//record[@CategoryID='" + strCategoryId + "']");
	  			if (objNodes.size() > 0){
	  				jsx3.$A(objNodes.toArray()).each(function(childNode){
	  					objDoc.insertRecordNode(childNode.cloneNode(true),"jsxroot",true);
	  				});
	  			}
	    		cle.LOG.trace("retrieveCategoryListWithSysIDOp call completed");
	    		cb.done({status:true});
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
				cle.SERVER.publish({subject:"categoryFault",code:strFaultCode,message:strFaultMessage,src:"retrieveCategoryListWithSysIDOp"});
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
	 * Persist the category changes at the server
	 *   uses the category list CDF marked with 'hasChanges' attributes
	 *   maps to SOAP request within the mapping utility context
	 */
	category.updateCategoryOp = jsx3.$Y(function(cb) {
		cle.LOG.trace("category#updateCategoryOp");
		var objService = cle.SERVER.loadResource("updateCategory_rule_xml");
		objService.setOperation("UpdateCategoryOp");
		objService.setEndpointURL(category.getEndpoint());
		objService.data = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(category.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
			cb.done({status:false});
		});

		//inner function handler for successful response
		objService.subscribe(jsx3.net.Service.ON_SUCCESS, function(objEvent) {
    		cle.LOG.trace("updateCategoryOp call completed");
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
				cle.SERVER.publish({subject:"categoryFault",code:strFaultCode,message:strFaultMessage,src:"updateCategoryOp"});
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
	 * Delete the category at the server
	 *   {String}	The category id to delete.
	 */
	category.deleteCategoryOp = jsx3.$Y(function(cb) {
		cle.LOG.trace("category#deleteCategoryOp");
		var objService = cle.SERVER.loadResource("deleteCategory_rule_xml");
		objService.setOperation("DeleteCategoryOp");
		objService.setEndpointURL(category.getEndpoint());
		objService.id = cb.args()[0];

		//set service response timeout handler
		objService.setTimeout(category.TIMEOUT,
		  function(objEvent){
			var strTitle = cle.utils.getProperty("m_timeout");
			var strMessage = cle.utils.getProperty("m_timeoutMessage");
			objEvent.target.getServer().alert(strTitle,strMessage);
			cb.done({status:false});
		});

		//inner function handler for successful response
		objService.subscribe(jsx3.net.Service.ON_SUCCESS,
		  function(objEvent) {
    		cle.LOG.trace("deleteCategoryOp call completed");
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
				cle.SERVER.publish({subject:"categoryFault",code:strFaultCode,message:strFaultMessage,src:"deleteCategoryOp"});
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
	category.handleFault = function(objEvent){
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
	category.setSubscriptions();
  }
);
