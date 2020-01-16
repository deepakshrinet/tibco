jsx3.require("jsx3.gui.Form");

jsx3.lang.Package.definePackage("cle.configuration.application",
	function(application) {
		//TODO: read from static config file or from persisted local cookie	
		application.ENDPOINT_HOST = "http://localhost:9950";
		application.ENDPOINT_URL = "/Administration/GUIServices/ApplicationServices/intfUpdate_ApplicationConfiguration-service.serviceagent/intfwsUpdate_ApplicationConfigurationEndpoint2";
		application.CANCEL_BUTTON = 2;
		application.OK_BUTTON = 1;
		application.NO_BUTTON = 3;
		application.LIST_CACHE_ID = "applicationList_cdf";

		application.LIST_UPDATED_SUBJECT = "applicationListUpdated";
		application.LIST_SELECTED_SUBJECT = "applicationListSelected";

		application.getEndpointHost = function() {
			return application.ENDPOINT_HOST;
		};
		application.setEndpointHost = function(strEndpointHost) {
			application.ENDPOINT_HOST = strEndpointHost;
		};
		application.getEndpointUrl = function() {
			return application.ENDPOINT_URL;
		};
		application.setEndpointUrl = function(strEndpointUrl) {
			application.ENDPOINT_URL = strEndpointUrl;
		};
		application.getEndpoint = function() {
			return application.ENDPOINT_HOST + application.ENDPOINT_URL;
		};
		application.setSubscriptions = function(){
			cle.LOG.trace("application#setSubscriptions");
			cle.SERVER.subscribe(application.LIST_UPDATED_SUBJECT,application.enableSaveChangesButton); //when made 'dirty' with changes
			cle.SERVER.subscribe(application.LIST_SELECTED_SUBJECT,application.enableDeleteApplicationButton);
			cle.SERVER.subscribe("applicationFault",application.handleFault);
			cle.SERVER.subscribe("unloadApplication", application.onUnloadApplication);
			cle.SERVER.subscribe("userIdAuthenticated",application.lookupApplicationList);
		};
		application.lookupApplicationList = function(objEvent) {
			cle.LOG.trace("application#lookupApplicationList");
			var strUserId = objEvent.userId;
			application.retrieveAllApplicationConfigurations(strUserId);
			/*
			var objAuthorizationDoc = cle.SERVER.getCache().getDocument('authorization_cdf');
			if (objAuthorizationDoc != null){
				cle.LOG.info("authorization_cdf:");
				cle.LOG.debug(objAuthorizationDoc.toString());
				var objAppIdNodes = objAuthorizationDoc.selectNodes('//record');
				var aIds = objAppIdNodes.map(function(e) { return e.getAttribute('AppID'); });
				jsx3.$A(aIds).each(function(id){
					application.retrieveSpecificApplicationConfiguration(id); //apparently removed from services
				});
			}
			 */
		};
		application.editConfiguration = function(objJSX){
			try {
				cle.LOG.trace("application#editConfiguration");
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
						var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/applicationConfig/configurationEditorDialog_gui.xml");
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
				cle.LOG.error("application#editConfiguration error: "
						+ e.getMessage());
			}
		};
		application._doDelete = function(objJSX){
			cle.LOG.trace("application#_doDelete");
			var objParent = objJSX.getAncestorOfName("configurationViewerPane");
			if (objParent != null){
				//need the application ID for the service call.
				var strApplicationId = objParent.getApplicationId();
				if (!jsx3.util.strEmpty(strApplicationId)){
					var rv = application.deleteApplicationConfiguration(strApplicationId);
					rv.when(function(response){
						if (response.status){
							if (!jsx3.util.strEmpty(strApplicationId)){
								//FIXME: this seems pretty invasive so maybe just alter the tree contents instead
								var refreshRv = application.retrieveAllApplicationConfigurations();
								refreshRv.when(function(refreshResponse){
									cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'applications', appId:'Applications'});
								});
							}
						}
					});
				}
			}
		};
		application.deleteConfiguration = function(objJSX){
			cle.LOG.trace("application#deleteConfiguration");
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
					application._doDelete(objJSX);
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
		application.updateConfiguration = function(objJSX){
			try {
				cle.LOG.trace("application#updateConfiguration");
				var objParent = objJSX.getAncestorOfType("jsx3.gui.Dialog");
				var strAppId = objParent.getApplicationId();  //use the method from the dialog
				var objBodyPane = objParent.getDescendantOfName("bodyPane",true,false);
				var objInputs = objBodyPane.getDescendantsOfType("jsx3.gui.Form",false); //downward from second child
				var hasValidationErrors = false;
				var fieldErrors = [];
				cle.LOG.trace("application#updateConfiguration found " + objInputs.length + " inputs");
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
				var rv = application.updateApplicationConfiguration(objRecord);
				rv.when(function(response){
					if (response.status){

						if (!jsx3.util.strEmpty(strAppId)){
							//FIXME: this seems pretty invasive so maybe just alter the tree contents instead
							var refreshRv = application.retrieveAllApplicationConfigurations();
							refreshRv.when(function(refreshResponse){
								cle.SERVER.publish({subject:'updateConfigurationTree',jsxtype:'application', appId:strAppId});
							});
						}
						//TODO: 'create another?' dialog
					}
					//FIXME: avoid an abrupt close without notification
					objJSX.getAncestorOfType("jsx3.gui.Dialog").close(); //use method added in object onAfterDeserialization
				});                
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("application#updateConfiguration error: "
						+ e.getMessage());
			}
		};
		//unused
		application.makeDirty = function(objJSX) {
			try {
				cle.LOG.debug("application#makeDirty");
				var objCDF = objJSX.getAncestorOfType("jsx3.gui.CDF");
				var strCDFRecordId = objCDF.getCDFId();
				cle.LOG.trace("application#makeDirty recordId: " + strCDFRecordId);
				var objRecordNode = objCDF.getXML().selectSingleNode('//record[@jsxid="' + strCDFRecordId + '" or @oldId="' + strCDFRecordId + '"]');
				objRecordNode.setAttribute("hasChanges",jsx3.Boolean.TRUE);
				var strAttrId = objJSX.getCDFAttribute();
				var strValue = objJSX.getValue();
				var objList = objCDF.getDescendantOfName("applicationList");
				objList.insertRecordProperty(strCDFRecordId,strAttrId,strValue,true);
				//special case where the id is being modified
				if (objJSX.getName()=="txtId"){
					objRecordNode.setAttribute("oldId",strCDFRecordId);
					//reset the CDF pointer to the 'new' jsxid so the other two attributes update correct element
					objCDF.setCDFId(strValue);
				}
				cle.LOG.trace(objList.getXML().toString());
				var objMessage = {subject: application.LIST_UPDATED_SUBJECT};
				cle.LOG.trace("application#makeDirty publishing");
				cle.SERVER.publish(objMessage);
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("application#makeDirty error: "
						+ e.getMessage());
			}
		};
		//FIXME: the 'hasChanges' attribute is legacy and should be removed
		application.refreshList = function(objJSX){
			var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid");
			var objCDF = objParent.getDescendantsOfType("jsx3.gui.CDF",false)[0];
			var objXML = objCDF.getXML();
			var objChangedRecords = objXML.selectNodes('//record[@jsxid="applications"]/child::record[@hasChanges]');
			if (objChangedRecords.size() > 0){
				//show dialog that changes are detected
				var strTitle = cle.utils.getProperty("m_confirmCaption");
				var strMessage = cle.utils.getProperty("config_confirmChangesMessage");;
				var strOk = cle.utils.getProperty("m_ok");;
				var strNo = cle.utils.getProperty("m_no");;
				var strCancel = cle.utils.getProperty("m_cancel");
				var initBtnDefault = application.OK_BUTTON;
				//parameters may include fields 'width' {int}, 'height' {int}, 'noTitle' {boolean}, and 'nonModal' {boolean}.
				var objParams = {width: 260, height: 160, noTitle: false, nonModal: false};
				var objDialog = cle.SERVER.confirm(
						//caption title
						strTitle,
						//message to display
						strMessage,
						//fctOnOk
						function(objDialog){
							cle.LOG.debug("OK selected, updating and refreshing.");
							var rv = application.updateApplicationConfiguration();
							rv.when(function(response){
								//disable button
								if (response.status){
									var rv = cle.configuration.application.retrieveAllApplicationConfigurations();
									rv.when(function(retrieveResponse){
										if (retrieveResponse.status){
											cle.LOG.trace("returned from retrieveAllApplicationConfigurations");
											//reset the button, 'hasChanges' flag removed from records after refresh
											application.disableSaveChangesButton();
										}
										else {
											//TODO: report problem to user
										}
									});
								}
								//TODO: report failure?
							});
							objDialog.doClose();
						},
						//fctOnCancel
						function(objDialog){
							cle.LOG.debug("CANCEL selected, closing dialog.");
							objDialog.doClose();
						},
						strOk,
						strCancel,
						initBtnDefault,
						//fctOnNo
						function(objDialog){
							cle.LOG.debug("NO selected, refreshing and closing dialog.");
							var rv = cle.configuration.application.retrieveAllApplicationConfigurations();
							objDialog.doClose();
						},
						strNo,
						objParams
				);
			}
			else {
				//TODO: match results with privileges
				var rv = cle.configuration.application.retrieveAllApplicationConfigurations();
				rv.when(function(response){
					cle.LOG.trace("returned from retrieveAllApplicationConfigurations");
					application.disableSaveChangesButton();
					//reset objects in application component (note: could use publish/subscribe here)
					application.disableDeleteApplicationButton();
					var objApplicationList = cle.SERVER.getJSXByName("applicationList");
					if (objApplicationList != null)
						objApplicationList.setValue(null);
					objCDF.setCDFId(null);
					//publish 'empty' as applicationId to reset listeners
					cle.SERVER.publish({subject:application.LIST_SELECTED_SUBJECT, id: "empty"});
				});
			}
		};
		application.selectApplication = function(objMatrix,strRecordId){
			cle.LOG.trace("application#selectApplication");
			//reset buttons
			application.disableDeleteApplicationButton();
			cle.SERVER.publish({subject:application.LIST_SELECTED_SUBJECT, id: strRecordId});
			return;
		};
		/**
		 * runs when user is logged off
		 */
		application.onUnloadApplication = function(objEvent) {
			try {
				cle.LOG.trace("application#onUnloadApplication");
				var objCache = cle.SERVER.getCache();
				objCache.clearById(application.LIST_CACHE_ID);
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("application#onUnloadApplication error: " + e.getMessage());
			}
		};
		application.enableSaveChangesButton = function(objEvent) {
			try {
				cle.LOG.trace("application#enableSaveChangesButton");
				var objButton = cle.SERVER.getJSXByName("saveApplicationChangesBtn");
				if (objButton != null)
					objButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("application#enableSaveChangesButton error: "
						+ e.getMessage());
			}
		};
		application.disableSaveChangesButton = function() {
			try {
				var objButton = cle.SERVER.getJSXByName("saveApplicationChangesBtn");
				if (objButton != null)
					objButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("application#disableSaveChangesButton error: "
						+ e.getMessage());
			}
		};
		application.enableDeleteApplicationButton = function(objEvent) {
			try {
				cle.LOG.trace("application#enableDeleteApplicationButton");
				var objButton = cle.SERVER.getJSXByName("deleteApplicationBtn");
				if (objButton != null){
					//check for privilege
					var hasDeleteConfigPrivilege = cle.privileges.getPrivilegesById(strAppId).hasPrivilege(cle.Privilege.DELETE_CONFIGURATIONS);
					if (hasDeleteConfigPrivilege == jsx3.Boolean.TRUE){
						objButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
					}
				}
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("application#enableDeleteApplicationButton error: "
						+ e.getMessage());
			}
		};
		application.disableDeleteApplicationButton = function() {
			try {
				var objButton = cle.SERVER.getJSXByName("deleteApplicationBtn");
				if (objButton != null)
					objButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("application#disableDeleteApplicationButton error: "
						+ e.getMessage());
			}
		};
		/**
		 * displays fault information from service response
		 */
		application.handleFault = function(objEvent){
			var strCaption = cle.utils.getProperty("m_faultCaption");
			var strMessage = cle.utils.getProperty(objEvent.code);
			//use included message if the code translation is unavailable
			if (jsx3.util.strEmpty(strMessage)) strMessage = objEvent.message;
			var strOK = cle.utils.getProperty("m_ok");
			var objParams = {width: 300, height: 150, noTitle: false, nonModal: true};
			cle.SERVER.alert(strCaption, objEvent.src + ": <br/>" + strMessage,null,strOK,objParams);
		};
		application.createNewApplication = function(objJSX) {
			try {
				cle.LOG.debug("application#createNewApplication");
				//TODO: enable the 'id' field for input and focus
				var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid").getParent();
				var objInputs = objParent.getDescendantsOfType("jsx3.gui.Form",false); //downward from second child
				cle.LOG.trace("found " + objInputs.length + " inputs");
				var objRecord = {};
				jsx3.$A(objInputs).each(function(input){
					objRecord[input.getCDFAttribute()] = input.getValue();
					cle.LOG.trace(input.getName() + '/' +input.getCDFAttribute() + ": " + input.getValue());
					//TODO: validate input
				});
				var rv = application.createApplicationConfiguration(objRecord['ApplicationID'], objRecord['Name'], objRecord['Description']);
				rv.when(function(response){
					if (response.status){
						//FIXME: should have a service call similar to authentication sequence
						if (cle.privileges.isSuperUser()){
							var objPrivilege = new cle.Privilege(objRecord['ApplicationID']);
							for (var i=cle.Privilege._MIN;i<cle.Privilege._MAX+1;i++){
								//Grant all
								objPrivilege.addPrivilege(i);
							}
							cle.privileges.USER_PRIVILEGES.push(objPrivilege);
						}
						application.retrieveAllApplicationConfigurations();
						cle.LOG.trace('application#createNewApplication recordId: ' + objParent.getRecordId());
						
					}
					else {
						//report failure to user
					}
					objJSX.getAncestorOfType("jsx3.gui.Dialog").doClose();
				});                
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("application#createNewApplication error: "
						+ e.getMessage());
			}
		};
		//unused
		application.removeApplication = function(objJSX) {
			try {
				var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid");
				var objInputs = objParent.getChild(1).getDescendantsOfType("jsx3.gui.Form",false); //downward from second child
				cle.LOG.trace("found " + objInputs.length + " inputs");
				var objRecord = {};
				jsx3.$A(objInputs).each(function(input){
					objRecord[input.getCDFAttribute()] = input.getValue();
					cle.LOG.trace(input.getCDFAttribute() + ": " + input.getValue());
				});
				var rv = application.deleteApplicationConfiguration(objRecord.jsxid);
				rv.when(function(response){
					if (response.status){
						application.disableDeleteApplicationButton();
						//update the list
						application.retrieveAllApplicationConfigurations();
						//notify listeners of to not use the old id
						cle.SERVER.publish({subject:application.LIST_SELECTED_SUBJECT, id: ""});
					}
				});
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("application#removeApplication error: "
						+ e.getMessage());
			}
		};
		application.deleteApplication = function(objJSX) {
			try {
				var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid");
				var objMatrix = objParent.getDescendantsOfName("configTreeMatrix",true,false);
				var strRecordId = objMatrix.getSelectedId();
				var rv = application.deleteApplicationConfiguration(strRecordId);
				rv.when(function(response){
					if (response.status){
						application.disableDeleteApplicationButton();
						//update the list
						application.retrieveAllApplicationConfigurations();
						//notify listeners of to not use the old id
						cle.SERVER.publish({subject:application.LIST_SELECTED_SUBJECT, id: ""});
					}
				});
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("application#removeApplication error: "
						+ e.getMessage());
			}
		};
		application.saveChanges = function(objButton) {
			try {
				//TODO: this function will need to determine if the record is an update or new to make the correct call
				//1. look for the 'oldId' field if the record has changes to the id then
				//delete old, add new, remove 'hasChanges' flag
				var objParent = objButton.getAncestorOfType("jsx3.gui.LayoutGrid");
				cle.LOG.trace("found layout");
				var objMatrix = objParent.getDescendantOfName("applicationList");
				cle.LOG.trace("found matrix");
				var objCDF = objMatrix.getXML();
				cle.LOG.trace("got xml");
				cle.LOG.trace(objCDF.toString());
				//If there are records with the 'oldId' attribute, make a service call to first remove it and then create it.
				var objOldIdRecords = objCDF.selectNodes('//record[@oldId]');
				if (objOldIdRecords.size() > 0){
					cle.LOG.trace("records with 'oldId' attribute: " + objOldIdRecords.size());
					jsx3.$A(objOldIdRecords.toArray()).each(function(oldIdRecord){
						//the 'hasChanges' flag is no longer needed for this record
						cle.LOG.trace(oldIdRecord.toString());
						oldIdRecord.removeAttribute('hasChanges');
						cle.LOG.trace("removed 'hasChanges' attribute");
						application.deleteApplicationConfiguration(oldIdRecord.getAttribute('oldId')).when(function(isDeleteSuccess){
							cle.LOG.trace("returned from delete with: " + isDeleteSuccess);
							//do create
							var rvCreate = application.createApplicationConfiguration(
									oldIdRecord.getAttribute('jsxid'),
									oldIdRecord.getAttribute('jsxtext'),
									oldIdRecord.getAttribute('Description'));
							rvCreate.when(function(isCreateSuccess){
								//disable button
								objButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
								cle.LOG.trace("returning from create with: " + isCreateSuccess);
								//I don't think the following is needed anymore
								/*
								cle.LOG.trace("removing child");
								//TODO: use wrapped CDF Document and update UI
								objCDF.removeChild(record);
								cle.LOG.trace("removed child");
								 */
							});
						});
					});
				}
				//if there are records that have the 'hasChanges' attribute, call service with update
				var objChangedRecords = objCDF.selectNodes('//record[@hasChanges]');  //and not @oldId
				cle.LOG.trace("records with 'hasChanges' attribute: " + objChangedRecords.size());
				if (objChangedRecords.size() > 0){
					var rv = application.updateApplicationConfiguration();
					rv.when(function(response){
						cle.LOG.trace("updateApplicationConfiguration returned: " + isUpdateSuccess);
						if (response.status){
							//disable button
							objButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
							application.disableDeleteApplicationButton();
							//refresh entire list
							application.retrieveAllApplicationConfigurations();
						}
						//TODO: report failure?
					});
				}
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("application#saveChanges error: "
						+ e.getMessage());
			}
		};
		/**
		 * checks the authorization_cdf for all entries with 'p1' attribute (view configurations)
		 * and returns an array of application ids.
		 * note: the authorization_cdf is only created at login, if the list has changed it
		 *       must either be modified locally or the user must logout/login to see changes.
		 *       There doesn't seem to be any other way to get the updated list.
		 */
		application.getAuthorizedApplicationsList = function() {
			try {
				cle.LOG.trace("application#getAuthorizedApplicationsList");
				//remove existing application list from cache
				/* cle.SERVER.getCache().clearById(application.LIST_CACHE_ID); */
				//create new CDF
				var objAppCDF = new jsx3.xml.CDF.Document.newDocument();
				//get array of allowed applications
				//retrieve the authorizations from login response
				var objAuthDoc = cle.SERVER.getCache().getDocument(cle.login.AUTHORIZATION_CACHE_ID);
				if (objAuthDoc != null){
					//create new document
					var objAppList = new jsx3.util.List();

					var objIterator = objAuthDoc.selectNodeIterator('//record[@p1]');
					while (objIterator.hasNext()){
						var objNode = objIterator.next();
						var appId = objNode.getAttribute('AppID');
						if (appId != null)
							objAppList.add(appId);
					}
					var objAllowedAppList = objAppList;
					var objCDF = cle.SERVER.getCache().getDocument(application.LIST_CACHE_ID);
					//iterate over permitted apps, find and clone to new document
					jsx3.$A(objAllowedAppList.toArray()).each(function(id){
						var objNode = objCDF.selectSingleNode("//record[@jsxid='"+id+"']");
						if (objNode != null){
							objAppCDF.getRootNode().appendChild(objNode.clone(true));
						}
					});
				}
				return objAppCDF; //could be empty
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("application#getAuthorizedApplicationsList error: " + e.getMessage());
			}
		};
		application.createApplicationConfiguration = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("createApplicationConfiguration_rule_xml");
			objService.setOperation("CreateApplicationConfigurationOp");
			objService.id = cb.args()[0];
			objService.name = cb.args()[1];
			objService.description = cb.args()[2];
			objService.setEndpointURL(application.getEndpoint());

			// subscribe
			objService.subscribe(
					jsx3.net.Service.ON_SUCCESS,
					function(objEvent) {
						// var responseXML = objEvent.target.getInboundDocument();
						//objEvent.target.getServer().alert("Success","The service call was successful.");
						cle.LOG.trace("createApplicationConfiguration call completed");
						cb.done({status:true});
					});
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
					cle.SERVER.publish({subject:"applicationFault",code:strFaultCode,message:strFaultMessage,src:"createApplicationConfiguration"});
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
		//gets them all
		application.retrieveApplicationConfigurationsList = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("retrieveApplicationConfiguration_rule_xml");
			objService.setOperation("Retrieve_sp_ApplicationConfiguration_sp_ListOp");
			objService.setEndpointURL(application.getEndpoint());
			objService.id = cle.logic.getUserId();

			// subscribe
			objService.subscribe(
					jsx3.net.Service.ON_SUCCESS,
					function(objEvent){
						var responseXML = objEvent.target.getInboundDocument();
						var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());
						var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/applicationConfig/applicationList2CDF.xsl");
						var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
						if (!objXSL.hasError()){
							var templateProcessor = new jsx3.xml.Template(objXSL);               
							var objCDF = templateProcessor.transformToObject(objXML);
							cle.SERVER.getCache().setDocument(application.LIST_CACHE_ID,objCDF);
							cle.LOG.trace("retrieveApplicationConfigurationsList call completed");
							cb.done({status:true});
						}
					}
			);
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
						cle.SERVER.publish({subject:"applicationFault",code:strFaultCode,message:strFaultCodeMessage,src:"retrieveAllApplicationConfigurations"});
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
		//rework of the retrieveAll for specific apps for which user has access
		application.retrieveAllApplicationConfigurations = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("retrieveApplicationConfiguration_rule_xml");
			objService.setOperation("Retrieve_sp_ApplicationConfiguration_sp_ListOp");
			objService.setEndpointURL(application.getEndpoint());
			objService.id = cle.logic.getUserId();

			// subscribe
			objService.subscribe(
					jsx3.net.Service.ON_SUCCESS,
					function(objEvent){
						var responseXML = objEvent.target.getInboundDocument();
						var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());
						var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/applicationConfig/applicationList2CDF.xsl");
						var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
						if (!objXSL.hasError()){
							var templateProcessor = new jsx3.xml.Template(objXSL);               
							var objCDF = templateProcessor.transformToObject(objXML);
							//store
							cle.SERVER.getCache().setDocument(application.LIST_CACHE_ID,objCDF);
							cle.LOG.trace("retrieveAllApplicationConfigurations call completed");
							cb.done({status:true});
						}
					}
			);
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
						cle.SERVER.publish({subject:"applicationFault",code:strFaultCode,message:strFaultCodeMessage,src:"retrieveAllApplicationConfigurations"});
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
		//Apparently removed from services!
		//NOT AVAILABLE
		application.retrieveSpecificApplicationConfiguration = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("retrieveSpecificApplicationById_rule_xml");
			objService.setOperation("Retrieve_sp_SpecificApplicationConfigurationOp");
			objService.setEndpointURL(application.getEndpoint());
			objService.id = cb.args()[0];

			// subscribe
			objService.subscribe(
					jsx3.net.Service.ON_SUCCESS,
					function(objEvent){
						var responseXML = objEvent.target.getInboundDocument();
						var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());
						var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/applicationConfig/applicationList2CDF.xsl");
						var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
						if (!objXSL.hasError()){
							var templateProcessor = new jsx3.xml.Template(objXSL);               
							var objCDF = templateProcessor.transformToObject(objXML);
							var objNewRecordNode = objCDF.selectSingleNode("/data/record");
							var objDoc = cle.SERVER.getCache().getDocument(application.LIST_CACHE_ID);
							objDoc = jsx3.xml.CDF.Document.wrap(objDoc);
							var strRecordId = objNewRecordNode.getAttribute("jsxid");
							var existingNode = objDoc.getRecordNode(strRecordId);
							if (existingNode != null){
								//remove existing record if it exists
								objDoc.removeChild(existingNode);
							}
							objDoc.appendChild(objNewRecordNode.cloneNode(true));

							cle.LOG.trace("retrieveSpecificApplicationConfiguration call completed");
							cb.done({status:true});
						}
					}
			);
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
					cle.SERVER.publish({subject:"applicationFault",code:strFaultCode,message:strFaultMessage,src:"retrieveSpecificApplicationConfiguration"});
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
		application.updateApplicationConfiguration = jsx3.$Y(function(cb) {
			var objService = cle.SERVER
			.loadResource("updateApplicationConfiguration_rule_xml");
			objService.setOperation("Update_sp_ApplicationConfigurationOp");
			objService.setEndpointURL(application.getEndpoint());
			objService.data = cb.args()[0];

			//subscribe
			objService.subscribe(jsx3.net.Service.ON_SUCCESS,
					function(objEvent) {
				//var responseXML = objEvent.target.getInboundDocument();
				cle.LOG.trace("updateApplicationConfiguration call completed");
				cb.done({status:true});
			});
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
					cle.SERVER.publish({subject:"applicationFault",code:strFaultCode,message:strFaultMessage,src:"updateApplicationConfiguration"});
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
		application.deleteApplicationConfiguration = jsx3.$Y(function(cb) {
			var objService = app.tibco.CLE.loadResource("deleteApplicationConfigurationById_rule_xml");
			objService.setOperation("Delete_sp_ApplicationConfigurationOp");
			objService.id = cb.args()[0];
			objService.setEndpointURL(application.getEndpoint());

			//subscribe
			objService.subscribe(
					jsx3.net.Service.ON_SUCCESS,
					function(objEvent) {
						//var responseXML = objEvent.target.getInboundDocument();
						//objEvent.target.getServer().alert("Success","The service call was successful.");
						cle.LOG.trace("deleteApplicationConfiguration call completed");
						cb.done({status:true});
					});
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
					cle.SERVER.publish({subject:"applicationFault",code:strFaultCode,message:strFaultMessage,src:"deleteApplicationConfiguration"});
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
});
cle.configuration.application.setSubscriptions();