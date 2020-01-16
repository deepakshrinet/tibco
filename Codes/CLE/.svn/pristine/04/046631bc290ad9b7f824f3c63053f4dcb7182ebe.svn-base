jsx3.lang.Package.definePackage("cle.configuration",
  function(configuration) {
	configuration.TREE_SELECT_SUBJECT = 'selectConfigTreeItem';
	configuration.TREE_EXECUTE_SUBJECT = 'executeConfigTreeItem';
	configuration.FOLDER_CLOSED_URL = cle.SERVER.resolveURI("images/icons/folder_closed.gif");
	configuration.FOLDER_OPENED_URL = cle.SERVER.resolveURI("images/icons/folder_opened.gif");
	configuration.ATTR_IMG_URL = cle.SERVER.resolveURI("images/icons/attr.gif");
	configuration.EDITOR_CACHE_ID = "configurationEditor_cdf";
	configuration.APPLICATION_CACHE_ID = "applicationList_cdf";
	configuration.TYPE_CATEGORY = "category";
	configuration.TYPE_EXCEPTION_CODE = "exceptionCode";
	configuration.TYPE_INTERFACE = "interface";
	configuration.TYPE_PROCEDURE = "procedure";
	configuration.TYPE_RENDERING = "rendering";
	configuration.TYPE_SEVERITY = "severity";
	configuration.TYPE_TYPE = "type";
	
	configuration.setSubscriptions = function(){
		cle.LOG.trace("configuration#setSubscriptions");
		//when the main UI is added, this method will be invoked
		cle.SERVER.subscribe("mainReady",configuration.onMainReady);
		cle.SERVER.subscribe(configuration.TREE_EXECUTE_SUBJECT,configuration.onExecuteTreeItem);
		cle.SERVER.subscribe(configuration.TREE_SELECT_SUBJECT,configuration.onSelectTreeItem);
		cle.SERVER.subscribe("updateConfigurationTree",configuration.onFolderUpdate);
		cle.SERVER.getCache().subscribe(configuration.APPLICATION_CACHE_ID,configuration.onAppListUpdate);
	};
	/**
	 * add configuration tab to main UI
	 */
	configuration.onMainReady = function(objEvent) {
		try {
			cle.LOG.trace("configuration#onMainReady");
			var objMainPane = objEvent.objJSX;
			var objMainTabbedPane = objMainPane.getDescendantOfName("mainTabbedPane",true,false);
			if (objMainTabbedPane != null){
				cle.LOG.trace("found objMainTabbedPane");
				
				var appRV = cle.configuration.application.retrieveAllApplicationConfigurations();
				appRV.when(function(isSuccess){
					cle.LOG.trace("retrieveAllApplicationConfigurations returned success: " + isSuccess);
					cle.configuration.application.getAuthorizedApplicationsList();
				});
				
				//add config tab
				var configTabRV = configuration.addTab(objMainTabbedPane);
				configTabRV.when(function(objConfigTab){
					objMainTabbedPane.paintChild(objConfigTab);
					cle.LOG.trace("done loading configuration tab");
				});
			}
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#onMainReady error: " + e.getMessage());
		}
	};
	configuration.onAppListUpdate = function(objEvent) {
		try {
			cle.LOG.trace("configuration#onAppListUpdate");
			var objAppListCDF = cle.configuration.application.getAuthorizedApplicationsList();
			if (objAppListCDF != null){
				//retrieve the XSL for transformation
				var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/xsl/applicationList2configTreeCDF.xsl");
				cle.LOG.trace("retrieving XSL: " + strXSLUrl);
				var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
				if (!objXSL.hasError()){
					cle.LOG.trace('configuration#onAppListUpdate found XSL');
					var templateProcessor = new jsx3.xml.Template(objXSL);               
					var objDoc = templateProcessor.transformToObject(objAppListCDF);
					if (objDoc != null){
			            objDoc = jsx3.xml.CDF.Document.wrap(objDoc);
			            objDoc.convertProperties(cle.SERVER.JSS, ["jsxtext","jsxtip"]);
						cle.SERVER.getCache().setDocument("configTreeMatrix_cdf",objDoc);
					}
				}
				else {
					cle.LOG.warn("configuration#onAppListUpdate has problems with transformation.");
				}
			}
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#onAppListUpdate error: " + e.getMessage());
		}
	};
	configuration.onFolderUpdate = function(objEvent) {
		try {
			cle.LOG.trace("configuration#onFolderUpdate");
			var strAppId = objEvent.appId;
			var strType = objEvent.jsxtype;
			cle.LOG.trace("configuration#onFolderUpdate appId: " + strAppId + ", type: " + strType);
			var configTreeMatrix = cle.SERVER.getJSXByName("configTreeMatrix");
			if (configTreeMatrix != null){
				var objXML =  configTreeMatrix.getXML();
				var objRecordNode = objXML.selectSingleNode("//record[@jsxtype='" + strType + "' and (@ApplicationID='" + strAppId + "' or @jsxid='" + strAppId + "')]");
				if (objRecordNode != null){
					var strRecordId = objRecordNode.getAttribute("jsxid");
					configTreeMatrix.setValue(strRecordId);
					cle.SERVER.publish({subject:configuration.TREE_SELECT_SUBJECT,target:configTreeMatrix,recordId:strRecordId});
				}
				else {
					cle.LOG.warn('configuration#onFolderUpdate objRecordNode not found.');
				}
			}
			else {
				cle.LOG.warn('configuration#onFolderUpdate configTreeMatrix not found.');
			}
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#onFolderUpdate error: " + e.getMessage());
		}
	};
	configuration.addTab = jsx3.$Y(function(cb) {
		try {
			cle.LOG.trace("configuration#addTab");
			var objParent = cb.args()[0]; //objMainTabbedPane
			var strURI = cle.SERVER
					.resolveURI("interfaces/configuration/configurationTab_gui.xml");
			var objTab = objParent.load(strURI, false);
			var objConfigPane = objTab.getChild(0);
			var configPaneRV = configuration.addConfigurationPane(objConfigPane);
			configPaneRV.when(function(objPane){
				//returned child has been added to tab
				cb.done(objTab);
			});
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#addTab error: "
					+ e.getMessage());
		}
	});
	configuration.addConfigurationPane = jsx3.$Y(function(cb) {
		try {
			cle.LOG.trace("configuration#addConfigurationPane");
			var objParent = cb.args()[0];
			/* view option for developer: use either Matrix or Select for interface */
			var strURI = cle.SERVER.resolveURI("interfaces/configuration/configurationPaneWithMatrix_gui.xml");
			var objPane = objParent.load(strURI, false);
			cb.done(objPane);
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#addConfigurationPane error: "
					+ e.getMessage());
		}
	});
	configuration.executeTreeItem = function(objJSX,strRecordId) {
		try{
			cle.LOG.debug("configuration#executeTreeItem");
			//using the same subject as a select for toggle shortcut
			cle.SERVER.publish({subject:configuration.TREE_SELECT_SUBJECT,target:objJSX,recordId:strRecordId});
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#executeTreeItem error: " + e.getMessage());
		}
	};
	configuration.onExecuteTreeItem = function(objEvent) {
		try{
			var objJSX = objEvent.target;
			var strRecordId = objEvent.recordId;
			var strType = objJSX.getRecord(strRecordId).type;
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#onExecuteTreeItem error: " + e.getMessage());
		}
	};
	configuration.selectTreeItem = function(objJSX,strRecordId,objEvent) {
		try{
			cle.SERVER.publish({subject:configuration.TREE_SELECT_SUBJECT,target:objJSX,recordId:strRecordId});
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#selectTreeItem error: " + e.getMessage());
		}
	};
	  //unused
	configuration.makeDirty = function(objMatrix, strRecordId, strValue) {
		try {
			cle.LOG.trace("configuration#makeDirty");
			cle.LOG.trace("configuration#makeDirty strRecordId: " + strRecordId);
			cle.LOG.trace("configuration#makeDirty strValue: " + strValue);
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#makeDirty error: "
					+ e.getMessage());
		}
	};
	configuration.deleteSelectedItem = function(objButton) {
		try {
			cle.LOG.trace("configuration#deleteSelectedItem");
			var strType = objButton.targetType;
			var strId = objButton.targetId;
			if ((!jsx3.util.strEmpty(strType)) && (!jsx3.util.strEmpty(strId))){
				var strSubject = strType + 'Delete';
				cle.SERVER.publish({subject:strSubject,type:strType,id:strId});
			}
			else {
				cle.LOG.warn("configuration#deleteSelectedItem problem with getting id and type from button property");
			}
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#deleteSelectedItem error: "
					+ e.getMessage());
		}
	};
	configuration.enableMenuItems = function(enabledSet) {
		try{
			cle.LOG.trace("configuration.enableMenuItems");
			var objMenu = cle.SERVER.getJSXByName('newItemMenu');
			if (objMenu != null){
				for (var p in enabledSet){
					objMenu.enableItem(p,enabledSet[p]);
				}
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#enableMenuItems error: " + e.getMessage());
		}
	};
	configuration.onSelectTreeItem = function(objEvent) {
		try{
			var objJSX = objEvent.target;
			var strRecordId = objEvent.recordId;
			var objRecordNode = objJSX.getRecordNode(strRecordId);
			//TODO: determine if currently editing then notify
			cle.LOG.trace('configuration#onSelectTreeItem selected node: ' + objRecordNode.toString());
			var isCategory = (objRecordNode.getAttribute('jsxcategory')==jsx3.Boolean.TRUE)? true: false;
			var strType = objRecordNode.getAttribute('jsxtype');
			var configurationEditor = cle.SERVER.getJSXByName("configurationEditor");
			if (configurationEditor != null){
				configurationEditor.removeChildren();
			}
			var configurationEditorMatrix = cle.SERVER.getJSXByName("configurationEditorMatrix");
			var strAppId = objRecordNode.getAttribute('jsxid');
			configuration.enableMenuItems({1:false,2:false,3:false,4:false,5:false,6:false,7:false,8:false});
			switch (strType){
			case 'applications':
				cle.LOG.trace("configuration#onSelectTreeItem applications selected");
				//enable application item create in menu
				if (cle.privileges.isSuperUser()){
					configuration.enableMenuItems({1:true,2:false,3:false,4:false,5:false,6:false,7:false,8:false});
				}
				if(objRecordNode.getAttribute("jsxopen")==jsx3.Boolean.TRUE){
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,true);objJSX.revealRecord(strRecordId);});
				}
				else {
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,false);});
				}
				break;
			case 'application':
				cle.LOG.trace("configuration#onSelectTreeItem application selected");
				//determine if user has privileges
				strAppId = objRecordNode.getAttribute('jsxid');
				var objPrivilege = cle.privileges.getPrivilegesById(strAppId);
				if (objPrivilege != null || cle.privileges.isSuperUser()){
					var hasAddPrivilege = objPrivilege.hasPrivilege(cle.Privilege.ADD_CONFIGURATIONS);
					cle.LOG.trace("configuration#doApplicationItem hasAddPrivilege: " + hasAddPrivilege);
					if (hasAddPrivilege || cle.privileges.isSuperUser()){
						//enable application item create in menu
						configuration.enableMenuItems({1:false,2:true,3:true,4:true,5:true,6:true,7:true,8:true});
					}
				}
				configuration.doApplicationItem(objRecordNode, objPrivilege);
				configuration.toggleTreeItem(objJSX,strRecordId,true); //show open icon
				jsx3.sleep(function(){objJSX.revealRecord(strRecordId);});
				break;
			//configuration category
			case 'category':
				cle.LOG.trace("configuration#onSelectTreeItem category selected");
				//get the application id from node
				strAppId = objRecordNode.getAttribute('ApplicationID'); //note: different services are returning different schema ids
				//determine privileges for menu
				var objPrivilege = cle.privileges.getPrivilegesById(strAppId);
				if (objPrivilege != null || cle.privileges.isSuperUser()){
					var hasAddPrivilege = objPrivilege.hasPrivilege(cle.Privilege.ADD_CONFIGURATIONS);
					cle.LOG.trace("configuration#doApplicationItem hasAddPrivilege: " + hasAddPrivilege);
					if (hasAddPrivilege==jsx3.Boolean.TRUE || cle.privileges.isSuperUser()){
						//enable application item create in menu
						configuration.enableMenuItems({1:false,2:true,3:false,4:false,5:false,6:false,7:false,8:false});
					}
				}
				if (isCategory){
					configuration.doCategoryFolder(objJSX,strRecordId,objRecordNode,strAppId);
					if (configurationEditorMatrix)
						configurationEditorMatrix.clearXmlData();
				}
				else {
					strId = objRecordNode.getAttribute('CategoryID');
					//get the selected item details
					configuration.doCategoryItem(objRecordNode,objPrivilege);
				}
				break;
			case 'exceptionCode':
				cle.LOG.trace("configuration#onSelectTreeItem exceptionCode selected");
				//get the application id from node
				strAppId = objRecordNode.getAttribute('ApplicationID'); //note: different services are returning different schema ids
				//determine if user has privileges
				var objPrivilege = cle.privileges.getPrivilegesById(strAppId);
				if (objPrivilege != null || cle.privileges.isSuperUser()){
					var hasAddPrivilege = objPrivilege.hasPrivilege(cle.Privilege.ADD_CONFIGURATIONS);
					cle.LOG.trace("configuration#doApplicationItem hasAddPrivilege: " + hasAddPrivilege);
					if (hasAddPrivilege==jsx3.Boolean.TRUE || cle.privileges.isSuperUser()){
						//enable application item create in menu
						configuration.enableMenuItems({1:false,2:false,3:true,4:false,5:false,6:false,7:false,8:false});
					}
				}
				if (isCategory){
					configuration.doExceptionCodeFolder(objJSX,strRecordId,objRecordNode,strAppId);
					if (configurationEditorMatrix)
						configurationEditorMatrix.clearXmlData();
				}
				else {
					strId = objRecordNode.getAttribute('ExceptionCode');
					//get the selected item details
					configuration.doExceptionCodeItem(objRecordNode,objPrivilege);
				}
				break;
			case 'interface':
				cle.LOG.trace("configuration#onSelectTreeItem interface selected");
				strAppId = objRecordNode.getAttribute('ApplicationID'); //note: different services are returning different schema ids
				//determine if user has privileges
				var objPrivilege = cle.privileges.getPrivilegesById(strAppId);
				if (objPrivilege != null || cle.privileges.isSuperUser()){
					var hasAddPrivilege = objPrivilege.hasPrivilege(cle.Privilege.ADD_CONFIGURATIONS);
					cle.LOG.trace("configuration#doApplicationItem hasAddPrivilege: " + hasAddPrivilege);
					if (hasAddPrivilege==jsx3.Boolean.TRUE || cle.privileges.isSuperUser()){
						//enable application item create in menu
						configuration.enableMenuItems({1:false,2:false,3:false,4:true,5:false,6:false,7:false,8:false});
					}
				}
				if (isCategory){
					configuration.doInterfaceFolder(objJSX,strRecordId,objRecordNode,strAppId);
					if (configurationEditorMatrix)
						configurationEditorMatrix.clearXmlData();
				}
				else {
					strId = objRecordNode.getAttribute('InterfaceID');
					//get the selected item details
					configuration.doInterfaceItem(objRecordNode,objPrivilege);
				}
				break;
			case 'procedure':
				cle.LOG.trace("configuration#onSelectTreeItem procedure selected");
				strAppId = objRecordNode.getAttribute('ApplicationID'); //note: different services are returning different schema ids
				//determine if user has privileges
				var objPrivilege = cle.privileges.getPrivilegesById(strAppId);
				if (objPrivilege != null || cle.privileges.isSuperUser()){
					var hasAddPrivilege = objPrivilege.hasPrivilege(cle.Privilege.ADD_CONFIGURATIONS);
					cle.LOG.trace("configuration#doApplicationItem hasAddPrivilege: " + hasAddPrivilege);
					if (hasAddPrivilege==jsx3.Boolean.TRUE || cle.privileges.isSuperUser()){
						//enable application item create in menu
						configuration.enableMenuItems({1:false,2:false,3:false,4:false,5:true,6:false,7:false,8:false});
					}
				}
				if (isCategory){
					configuration.doProcedureFolder(objJSX,strRecordId,objRecordNode,strAppId);
					if (configurationEditorMatrix)
						configurationEditorMatrix.clearXmlData();
				}
				else {
					strId = objRecordNode.getAttribute('ProcedureID');
					//get the selected item details
					configuration.doProcedureItem(objRecordNode,objPrivilege);
				}
				break;
			case 'rendering':
				cle.LOG.trace("configuration#onSelectTreeItem rendering selected");
				strAppId = objRecordNode.getAttribute('ApplicationID'); //note: different services are returning different schema ids
				//determine if user has privileges
				var objPrivilege = cle.privileges.getPrivilegesById(strAppId);
				if (objPrivilege != null || cle.privileges.isSuperUser()){
					var hasAddPrivilege = objPrivilege.hasPrivilege(cle.Privilege.ADD_CONFIGURATIONS);
					cle.LOG.trace("configuration#doApplicationItem hasAddPrivilege: " + hasAddPrivilege);
					if (hasAddPrivilege==jsx3.Boolean.TRUE || cle.privileges.isSuperUser()){
						//enable application item create in menu
						configuration.enableMenuItems({1:false,2:false,3:false,4:false,5:false,6:true,7:false,8:false});
					}
				}
				if (isCategory){
					configuration.doRenderingFolder(objJSX,strRecordId,objRecordNode,strAppId);
					if (configurationEditorMatrix)
						configurationEditorMatrix.clearXmlData();
				}
				else {
					strId = objRecordNode.getAttribute('RenderID');
					//get the selected item details
					configuration.doRenderingItem(objRecordNode,objPrivilege);
				}
				break;
			case 'severity':
				cle.LOG.trace("configuration#onSelectTreeItem severity selected");
				strAppId = objRecordNode.getAttribute('ApplicationID'); //note: different services are returning different schema ids
				//determine if user has privileges
				var objPrivilege = cle.privileges.getPrivilegesById(strAppId);
				if (objPrivilege != null || cle.privileges.isSuperUser()){
					var hasAddPrivilege = objPrivilege.hasPrivilege(cle.Privilege.ADD_CONFIGURATIONS);
					cle.LOG.trace("configuration#doApplicationItem hasAddPrivilege: " + hasAddPrivilege);
					if (hasAddPrivilege==jsx3.Boolean.TRUE || cle.privileges.isSuperUser()){
						//enable application item create in menu
						configuration.enableMenuItems({1:false,2:false,3:false,4:false,5:false,6:false,7:true,8:false});
					}
				}
				if (isCategory){
					configuration.doSeverityFolder(objJSX,strRecordId,objRecordNode,strAppId);
					if (configurationEditorMatrix)
						configurationEditorMatrix.clearXmlData();
				}
				else {
					strId = objRecordNode.getAttribute('SeverityID');
					//get the selected item details
					configuration.doSeverityItem(objRecordNode,objPrivilege);
				}
				break;
			case 'type':
				cle.LOG.trace("configuration#onSelectTreeItem type selected");
				//get the application id from node
				strAppId = objRecordNode.getAttribute('ApplicationID'); //note: different services are returning different schema ids
				//determine if user has privileges
				var objPrivilege = cle.privileges.getPrivilegesById(strAppId);
				if (objPrivilege != null || cle.privileges.isSuperUser()){
					var hasAddPrivilege = objPrivilege.hasPrivilege(cle.Privilege.ADD_CONFIGURATIONS);
					cle.LOG.trace("configuration#doApplicationItem hasAddPrivilege: " + hasAddPrivilege);
					if (hasAddPrivilege==jsx3.Boolean.TRUE || cle.privileges.isSuperUser()){
						//enable application item create in menu
						configuration.enableMenuItems({1:false,2:false,3:false,4:false,5:false,6:false,7:false,8:true});
					}
				}
				if (isCategory){
					configuration.doTypeFolder(objJSX,strRecordId,objRecordNode,strAppId);
					if (configurationEditorMatrix)
						configurationEditorMatrix.clearXmlData();
				}
				else {
					strId = objRecordNode.getAttribute('TypeID');
					//get the selected item details
					configuration.doTypeItem(objRecordNode,objPrivilege);
				}
				break;
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#onSelectTreeItem error: " + e.getMessage());
		}
	};
	configuration.toggleTreeItem = function(objJSX,strRecordId,bOpen) {
		try{
			cle.LOG.trace("configuration#toggleFolderIcon");
			//toggle between the open and closed icon
			var isCategory = objJSX.getRecord(strRecordId).jsxcategory;
			if (isCategory==jsx3.Boolean.TRUE){
				var strImgValue = (bOpen)? configuration.FOLDER_OPENED_URL : configuration.FOLDER_CLOSED_URL;
				objJSX.insertRecordProperty(strRecordId, 'jsximg', strImgValue, true);
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#toggleFolderIcon error: " + e.getMessage());
		}
	};
	configuration.doApplicationItem = function(objRecordNode,objPrivilege) {
		try{
			cle.LOG.trace("configuration#doApplicationItem");
			var objParent = cle.SERVER.getJSXByName("configurationEditor");
			if (objParent != null){
				//objParent.removeChildren();
				var strURI = cle.SERVER.resolveURI("interfaces/configuration/applicationConfig/configurationViewerPane_gui.xml");
				var objEditor = objParent.loadAndCache(strURI,true);
				var strApplicationId = objRecordNode.getAttribute("jsxid");
				if (!jsx3.util.strEmpty(strApplicationId)){
					objEditor.setApplicationId(strApplicationId);
				}
				var hasDeletePrivilege = objPrivilege.hasPrivilege(cle.Privilege.DELETE_CONFIGURATIONS);
				cle.LOG.trace("configuration#doApplicationItem hasDeletePrivilege: " + hasDeletePrivilege);
				if (hasDeletePrivilege==jsx3.Boolean.TRUE){
					objEditor.getDeleteButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var hasEditPrivilege = objPrivilege.hasPrivilege(cle.Privilege.EDIT_CONFIGURATIONS);
				cle.LOG.trace("configuration#doApplicationItem hasEditPrivilege: " + hasEditPrivilege);
				if (hasEditPrivilege==jsx3.Boolean.TRUE){
					objEditor.getEditButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var objXML = new jsx3.xml.CDF.Document.newDocument();
				objXML.getRootNode().appendChild(objRecordNode.cloneNode(false)); //use a copy without children, not the real record
				var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/applicationConfig/applicationRecord2records.xsl");
				var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
				if (!objXSL.hasError()){
					cle.LOG.trace("configuration#doApplicationItem found XSL, transforming record.");
					//transform selected record
					var templateProcessor = new jsx3.xml.Template(objXSL);               
					var objDoc = templateProcessor.transformToObject(objXML);
					objDoc = jsx3.xml.CDF.Document.wrap(objDoc);
					objDoc.convertProperties(cle.SERVER.JSS, ["jsxtext","jsxtip"]);
					cle.SERVER.getCache().setDocument(configuration.EDITOR_CACHE_ID,objDoc);
					cle.LOG.trace(objDoc.toString());
				}
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doApplicationItem error: " + e.getMessage());
		}
	};
	configuration.doCategoryFolder = function(objJSX,strRecordId,objRecordNode,strAppId) {
		try{
			//call service to retrieve all category configurations for this application id
			var rv = cle.configuration.category.retrieveAllCategoriesOp(strAppId);
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
								node.setAttribute('jsxtype',configuration.TYPE_CATEGORY);
								node.setAttribute('jsximg',configuration.ATTR_IMG_URL);
								objRecordNode.appendChild(node);
							});
						}
					}
				}
/*
				//TODO: solve the double open/close event on initial select or execute
				cle.LOG.debug("configuration#doCategoryFolder jsxselected: " + objRecordNode.getAttribute("jsxselected"));
				if(objRecordNode.getAttribute("jsxopen")==jsx3.Boolean.FALSE){
					jsx3.sleep(function(){
						configuration.toggleTreeItem(objJSX,strRecordId,true);
						//objJSX.toggleItem(strRecordId,true);
						objJSX.revealRecord(strRecordId);
						cle.LOG.warn("now open");
					});
				}
				else {
					jsx3.sleep(function(){
						configuration.toggleTreeItem(objJSX,strRecordId,false);
						//objJSX.toggleItem(strRecordId,false);
						objRecordNode.setAttribute("jsxopen",jsx3.Boolean.FALSE);
						objJSX.redrawRecord(strRecordId,jsx3.xml.CDF.UPDATE);
						cle.LOG.warn("now closed");
					});
				}
				
*/
				if(objRecordNode.getAttribute("jsxopen")==jsx3.Boolean.TRUE){
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,true);objJSX.revealRecord(strRecordId);});
				}
				else {
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,false);});
				}
			});
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doCategoryFolder error: " + e.getMessage());
		}
	};
	configuration.doCategoryItem = function(objRecordNode,objPrivilege) {
		try{
			cle.LOG.trace("configuration#doCategoryItem");
			var objParent = cle.SERVER.getJSXByName("configurationEditor");
			if (objParent != null){
				//objParent.removeChildren();
				var strURI = cle.SERVER.resolveURI("interfaces/configuration/categoryConfig/configurationViewerPane_gui.xml");
				var objEditor = objParent.loadAndCache(strURI,true);
				var hasDeletePrivilege = objPrivilege.hasPrivilege(cle.Privilege.DELETE_CONFIGURATIONS);
				cle.LOG.trace("configuration#doCategoryItem hasDeletePrivilege: " + hasDeletePrivilege);
				if (hasDeletePrivilege==jsx3.Boolean.TRUE){
					objEditor.getDeleteButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var hasEditPrivilege = objPrivilege.hasPrivilege(cle.Privilege.EDIT_CONFIGURATIONS);
				cle.LOG.trace("configuration#doCategoryItem hasEditPrivilege: " + hasEditPrivilege);
				if (hasEditPrivilege==jsx3.Boolean.TRUE){
					objEditor.getEditButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var objXML = new jsx3.xml.CDF.Document.newDocument();
				objXML.getRootNode().appendChild(objRecordNode.cloneNode(true)); //use a copy, not the real record
				var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/categoryConfig/categoryRecord2records.xsl");
				var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
				if (!objXSL.hasError()){
					cle.LOG.trace("configuration#doCategoryItem found XSL, transforming record.");
					//transform selected record
					var templateProcessor = new jsx3.xml.Template(objXSL);               
					var objDoc = templateProcessor.transformToObject(objXML);
					objDoc = jsx3.xml.CDF.Document.wrap(objDoc);
					objDoc.convertProperties(cle.SERVER.JSS, ["jsxtext","jsxtip"]);
					cle.SERVER.getCache().setDocument(configuration.EDITOR_CACHE_ID,objDoc);
				}
				var strCategoryId = objRecordNode.getAttribute("CategoryID");
				if (!jsx3.util.strEmpty(strCategoryId)){
					objEditor.setCategoryId(strCategoryId);
				}
				var strApplicationId = objRecordNode.getAttribute("ApplicationID");
				if (!jsx3.util.strEmpty(strApplicationId)){
					objEditor.setApplicationId(strApplicationId);
				}
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doCategoryItem error: " + e.getMessage());
		}
	};
	configuration.doInterfaceFolder = function(objJSX,strRecordId,objRecordNode,strAppId) {
		try{
			//call service to retrieve all category configurations for this application id
			var rv = cle.configuration.interfaceConfig.retrieveInterfaceConfigurationList(strAppId);
			rv.when(function(result){
				var isSuccess = result.status;
				if (isSuccess){
					//copy the results to this node
					var objCDF = result.document;
					if (objCDF != null){
						var objNodes = objCDF.selectNodes("//record[@InterfaceID]"); //just nodes from a category result
						if (objNodes.size() >0){
							//this is a category, remove children and show list from service
							objRecordNode.removeChildren();
							jsx3.$A(objNodes.toArray()).each(function(node){
								node.setAttribute('jsxtype',configuration.TYPE_INTERFACE);
								node.setAttribute('jsximg',configuration.ATTR_IMG_URL);
								objRecordNode.appendChild(node);
							});
						}
					}
				}
				if(objRecordNode.getAttribute("jsxopen")==jsx3.Boolean.TRUE){
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,true);objJSX.revealRecord(strRecordId);});
				}
				else {
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,false);});
				}
			});
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doCategoryFolder error: " + e.getMessage());
		}
	};
	configuration.doInterfaceItem = function(objRecordNode,objPrivilege) {
		try{
			cle.LOG.trace("configuration#doInterfaceItem");
			var objParent = cle.SERVER.getJSXByName("configurationEditor");
			if (objParent != null){
				//objParent.removeChildren();
				var strURI = cle.SERVER.resolveURI("interfaces/configuration/interfaceConfig/configurationViewerPane_gui.xml");
				var objEditor = objParent.loadAndCache(strURI,true);
				var hasDeletePrivilege = objPrivilege.hasPrivilege(cle.Privilege.DELETE_CONFIGURATIONS);
				cle.LOG.trace("configuration#doInterfaceItem hasDeletePrivilege: " + hasDeletePrivilege);
				if (hasDeletePrivilege==jsx3.Boolean.TRUE){
					objEditor.getDeleteButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var hasEditPrivilege = objPrivilege.hasPrivilege(cle.Privilege.EDIT_CONFIGURATIONS);
				cle.LOG.trace("configuration#doInterfaceItem hasEditPrivilege: " + hasEditPrivilege);
				if (hasEditPrivilege==jsx3.Boolean.TRUE){
					objEditor.getEditButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var objXML = new jsx3.xml.CDF.Document.newDocument();
				objXML.getRootNode().appendChild(objRecordNode.cloneNode(true)); //use a copy, not the real record
				var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/interfaceConfig/interfaceRecord2records.xsl");
				var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
				if (!objXSL.hasError()){
					cle.LOG.trace("configuration#doInterfaceItem found XSL, transforming record.");
					//transform selected record
					var templateProcessor = new jsx3.xml.Template(objXSL);               
					var objDoc = templateProcessor.transformToObject(objXML);
					objDoc = jsx3.xml.CDF.Document.wrap(objDoc);
					objDoc.convertProperties(cle.SERVER.JSS, ["jsxtext","jsxtip"]);
					cle.SERVER.getCache().setDocument(configuration.EDITOR_CACHE_ID,objDoc);
				}
				var strInterfaceId = objRecordNode.getAttribute("InterfaceID");
				if (!jsx3.util.strEmpty(strInterfaceId)){
					objEditor.setInterfaceId(strInterfaceId);
				}
				var strApplicationId = objRecordNode.getAttribute("ApplicationID");
				if (!jsx3.util.strEmpty(strApplicationId)){
					objEditor.setApplicationId(strApplicationId);
				}
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doInterfaceItem error: " + e.getMessage());
		}
	};
	configuration.doTypeFolder = function(objJSX,strRecordId,objRecordNode,strAppId) {
		try{
			//call service to retrieve all category configurations for this application id
			var rv = cle.configuration.type.retrieveAllTypesOp(strAppId);
			rv.when(function(result){
				var isSuccess = result.status;
				if (isSuccess){
					//copy the results to this node
					var objCDF = result.document;
					if (objCDF != null){
						var objNodes = objCDF.selectNodes("//record[@TypeID]"); //just nodes from a configuration type result
						if (objNodes.size() >0){
							//this is a category, remove children and show list from service
							objRecordNode.removeChildren();
							jsx3.$A(objNodes.toArray()).each(function(node){
								node.setAttribute('jsxtype',configuration.TYPE_TYPE);
								node.setAttribute('jsximg',configuration.ATTR_IMG_URL);
								objRecordNode.appendChild(node);
							});
						}
					}
				}
				if(objRecordNode.getAttribute("jsxopen")==jsx3.Boolean.TRUE){
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,true);objJSX.revealRecord(strRecordId);});
				}
				else {
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,false);});
				}
			});
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doTypeFolder error: " + e.getMessage());
		}
	};
	configuration.doTypeItem = function(objRecordNode,objPrivilege) {
		try{
			cle.LOG.trace("configuration#doTypeItem");
			var objParent = cle.SERVER.getJSXByName("configurationEditor");
			if (objParent != null){
				//objParent.removeChildren();
				var strURI = cle.SERVER.resolveURI("interfaces/configuration/typeConfig/configurationViewerPane_gui.xml");
				var objEditor = objParent.loadAndCache(strURI,true);
				var hasDeletePrivilege = objPrivilege.hasPrivilege(cle.Privilege.DELETE_CONFIGURATIONS);
				cle.LOG.trace("configuration#doTypeItem hasDeletePrivilege: " + hasDeletePrivilege);
				if (hasDeletePrivilege==jsx3.Boolean.TRUE){
					objEditor.getDeleteButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var hasEditPrivilege = objPrivilege.hasPrivilege(cle.Privilege.EDIT_CONFIGURATIONS);
				cle.LOG.trace("configuration#doTypeItem hasEditPrivilege: " + hasEditPrivilege);
				if (hasEditPrivilege==jsx3.Boolean.TRUE){
					objEditor.getEditButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var objXML = new jsx3.xml.CDF.Document.newDocument();
				objXML.getRootNode().appendChild(objRecordNode.cloneNode(true)); //use a copy, not the real record
				var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/typeConfig/typeRecord2records.xsl");
				var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
				if (!objXSL.hasError()){
					cle.LOG.trace("configuration#doTypeItem found XSL, transforming record.");
					//transform selected record
					var templateProcessor = new jsx3.xml.Template(objXSL);               
					var objDoc = templateProcessor.transformToObject(objXML);
					objDoc = jsx3.xml.CDF.Document.wrap(objDoc);
					objDoc.convertProperties(cle.SERVER.JSS, ["jsxtext","jsxtip"]);
					cle.SERVER.getCache().setDocument(configuration.EDITOR_CACHE_ID,objDoc);
				}
				var strTypeId = objRecordNode.getAttribute("TypeID");
				if (!jsx3.util.strEmpty(strTypeId)){
					objEditor.setTypeId(strTypeId);
				}
				var strApplicationId = objRecordNode.getAttribute("ApplicationID");
				if (!jsx3.util.strEmpty(strApplicationId)){
					objEditor.setApplicationId(strApplicationId);
				}
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doTypeItem error: " + e.getMessage());
		}
	};
	configuration.doExceptionCodeFolder = function(objJSX,strRecordId,objRecordNode,strAppId) {
		try{
			//call service to retrieve all exception codes configurations for this application id
			var rv = cle.configuration.exception.retrieveAllExceptionConfigurationsOp(strAppId);
			rv.when(function(result){
				var isSuccess = result.status;
				if (isSuccess){
					//copy the results to this node
					var objCDF = result.document;
					if (objCDF != null){
						var objNodes = objCDF.selectNodes("//record[@ExceptionCode]"); //just nodes from an exception code result
						//this is a category, remove children and show list from service
						objRecordNode.removeChildren();
						if (objNodes.size() >0){
							jsx3.$A(objNodes.toArray()).each(function(node){
								node.setAttribute('jsxtype',configuration.TYPE_EXCEPTION_CODE);
								node.setAttribute('jsximg',configuration.ATTR_IMG_URL);
								objRecordNode.appendChild(node);
							});
						}
					}
				}
				if(objRecordNode.getAttribute("jsxopen")==jsx3.Boolean.TRUE){
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,true);objJSX.revealRecord(strRecordId);});
				}
				else {
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,false);});
				}
			});
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doTypeFolder error: " + e.getMessage());
		}
	};
	configuration.doExceptionCodeItem = function(objRecordNode,objPrivilege) {
		try{
			cle.LOG.trace("configuration#doExceptionCodeItem");
			var objParent = cle.SERVER.getJSXByName("configurationEditor");
			if (objParent != null){
				//objParent.removeChildren();
				var strURI = cle.SERVER.resolveURI("interfaces/configuration/exceptionConfig/configurationViewerPane_gui.xml");
				var objEditor = objParent.loadAndCache(strURI,true);
				var hasDeletePrivilege = objPrivilege.hasPrivilege(cle.Privilege.DELETE_CONFIGURATIONS);
				cle.LOG.trace("configuration#doExceptionCodeItem hasDeletePrivilege: " + hasDeletePrivilege);
				if (hasDeletePrivilege==jsx3.Boolean.TRUE){
					objEditor.getDeleteButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var hasEditPrivilege = objPrivilege.hasPrivilege(cle.Privilege.EDIT_CONFIGURATIONS);
				cle.LOG.trace("configuration#doExceptionCodeItem hasEditPrivilege: " + hasEditPrivilege);
				if (hasEditPrivilege==jsx3.Boolean.TRUE){
					objEditor.getEditButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var strApplicationId = objRecordNode.getAttribute("ApplicationID");
				var strExceptionCode = objRecordNode.getAttribute("ExceptionCode");
				cle.utils.hideMask(objEditor);  //remove mask before showing
				var strMessage = cle.utils.getProperty("m_loadingData");
				cle.utils.showMask(objEditor,strMessage, false, 8);  //custom
				var rv = cle.configuration.exception.retrieveSpecificExceptionConfigurationOp(strApplicationId,strExceptionCode);
				rv.when(function(result){
					var isSuccess = result.status;
					if (isSuccess){
						//copy the results to this node
						var objCDF = result.document;
						if (objCDF != null){
							var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/exceptionConfig/exceptionConfigRecord2records.xsl");
							var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
							if (!objXSL.hasError()){
								cle.LOG.trace("configuration#doExceptionCodeItem found XSL, transforming record.");
								//transform selected record
								var templateProcessor = new jsx3.xml.Template(objXSL);               
								var objDoc = templateProcessor.transformToObject(objCDF);
								objDoc = jsx3.xml.CDF.Document.wrap(objDoc);
								objDoc.convertProperties(cle.SERVER.JSS, ["jsxtext","jsxtip"]);
								cle.SERVER.getCache().setDocument(configuration.EDITOR_CACHE_ID,objDoc);
							}
						}
					}
					var strExceptionCode = objRecordNode.getAttribute("ExceptionCode");
					if (!jsx3.util.strEmpty(strExceptionCode)){
						objEditor.setExceptionCode(strExceptionCode);
					}
					var strApplicationId = objRecordNode.getAttribute("ApplicationID");
					if (!jsx3.util.strEmpty(strApplicationId)){
						objEditor.setApplicationId(strApplicationId);
					}
					cle.utils.hideMask(objEditor); //custom
				});
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doExceptionCodeItem error: " + e.getMessage());
		}
	};
	configuration.doSeverityFolder = function(objJSX,strRecordId,objRecordNode,strAppId) {
		try{
			//call service to retrieve all severity configurations for this application id
			var rv = cle.configuration.severity.retrieveAllSeveritiesOp(strAppId);
			rv.when(function(result){
				var isSuccess = result.status;
				if (isSuccess){
					//copy the results to this node
					var objCDF = result.document;
					if (objCDF != null){
						var objNodes = objCDF.selectNodes("//record[@SeverityID]"); //just nodes from an severity result
						if (objNodes.size() >0){
							//this is a category, remove children and show list from service
							objRecordNode.removeChildren();
							jsx3.$A(objNodes.toArray()).each(function(node){
								node.setAttribute('jsxtype',configuration.TYPE_SEVERITY);
								node.setAttribute('jsximg',configuration.ATTR_IMG_URL);
								objRecordNode.appendChild(node);
							});
						}
					}
				}
				if(objRecordNode.getAttribute("jsxopen")==jsx3.Boolean.TRUE){
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,true);objJSX.revealRecord(strRecordId);});
				}
				else {
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,false);});
				}
			});
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doSeverityFolder error: " + e.getMessage());
		}
	};
	configuration.doSeverityItem = function(objRecordNode,objPrivilege) {
		try{
			cle.LOG.trace("configuration#doSeverityItem");
			var objParent = cle.SERVER.getJSXByName("configurationEditor");
			if (objParent != null){
				//objParent.removeChildren();
				var strURI = cle.SERVER.resolveURI("interfaces/configuration/severityConfig/configurationViewerPane_gui.xml");
				var objEditor = objParent.loadAndCache(strURI,true);
				var hasDeletePrivilege = objPrivilege.hasPrivilege(cle.Privilege.DELETE_CONFIGURATIONS);
				cle.LOG.trace("configuration#doSeverityItem hasDeletePrivilege: " + hasDeletePrivilege);
				if (hasDeletePrivilege==jsx3.Boolean.TRUE){
					objEditor.getDeleteButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var hasEditPrivilege = objPrivilege.hasPrivilege(cle.Privilege.EDIT_CONFIGURATIONS);
				cle.LOG.trace("configuration#doSeverityItem hasEditPrivilege: " + hasEditPrivilege);
				if (hasEditPrivilege==jsx3.Boolean.TRUE){
					objEditor.getEditButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var objXML = new jsx3.xml.CDF.Document.newDocument();
				objXML.getRootNode().appendChild(objRecordNode.cloneNode(true)); //use a copy, not the real record
				var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/severityConfig/severityRecord2records.xsl");
				var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
				if (!objXSL.hasError()){
					cle.LOG.trace("configuration#doSeverityItem found XSL, transforming record.");
					//transform selected record
					var templateProcessor = new jsx3.xml.Template(objXSL);               
					var objDoc = templateProcessor.transformToObject(objXML);
					objDoc = jsx3.xml.CDF.Document.wrap(objDoc);
					objDoc.convertProperties(cle.SERVER.JSS, ["jsxtext","jsxtip"]);
					cle.SERVER.getCache().setDocument(configuration.EDITOR_CACHE_ID,objDoc);
				}
				var strSeverityId = objRecordNode.getAttribute("SeverityID");
				if (!jsx3.util.strEmpty(strSeverityId)){
					objEditor.setSeverityId(strSeverityId);
				}
				var strApplicationId = objRecordNode.getAttribute("ApplicationID");
				if (!jsx3.util.strEmpty(strApplicationId)){
					objEditor.setApplicationId(strApplicationId);
				}
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doSeverityItem error: " + e.getMessage());
		}
	};
	configuration.doProcedureFolder = function(objJSX,strRecordId,objRecordNode,strAppId) {
		try{
			//call service to retrieve all severity configurations for this application id
			var rv = cle.configuration.procedure.retrieveAllProceduresOp(strAppId);
			rv.when(function(result){
				var isSuccess = result.status;
				if (isSuccess){
					//copy the results to this node
					var objCDF = result.document;
					if (objCDF != null){
						var objNodes = objCDF.selectNodes("//record[@ProcedureID]"); //just nodes from a procedure result
						if (objNodes.size() >0){
							//this is a category, remove children and show list from service
							objRecordNode.removeChildren();
							jsx3.$A(objNodes.toArray()).each(function(node){
								node.setAttribute('jsxtype',configuration.TYPE_PROCEDURE);
								node.setAttribute('jsximg',configuration.ATTR_IMG_URL);
								objRecordNode.appendChild(node);
							});
						}
					}
				}
				if(objRecordNode.getAttribute("jsxopen")==jsx3.Boolean.TRUE){
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,true);objJSX.revealRecord(strRecordId);});
				}
				else {
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,false);});
				}
			});
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doProcedureFolder error: " + e.getMessage());
		}
	};
	configuration.doProcedureItem = function(objRecordNode,objPrivilege) {
		try{
			cle.LOG.trace("configuration#doProcedureItem");
			var objParent = cle.SERVER.getJSXByName("configurationEditor");
			if (objParent != null){
				//objParent.removeChildren();
				var strURI = cle.SERVER.resolveURI("interfaces/configuration/procedureConfig/configurationViewerPane_gui.xml");
				var objEditor = objParent.loadAndCache(strURI,true);
				var hasDeletePrivilege = objPrivilege.hasPrivilege(cle.Privilege.DELETE_CONFIGURATIONS);
				cle.LOG.trace("configuration#doProcedureItem hasDeletePrivilege: " + hasDeletePrivilege);
				if (hasDeletePrivilege==jsx3.Boolean.TRUE){
					objEditor.getDeleteButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var hasEditPrivilege = objPrivilege.hasPrivilege(cle.Privilege.EDIT_CONFIGURATIONS);
				cle.LOG.trace("configuration#doProcedureItem hasEditPrivilege: " + hasEditPrivilege);
				if (hasEditPrivilege==jsx3.Boolean.TRUE){
					objEditor.getEditButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var objXML = new jsx3.xml.CDF.Document.newDocument();
				objXML.getRootNode().appendChild(objRecordNode.cloneNode(true)); //use a copy, not the real record
				var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/procedureConfig/procedureRecord2records.xsl");
				var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
				if (!objXSL.hasError()){
					cle.LOG.trace("configuration#doProcedureItem found XSL, transforming record.");
					//transform selected record
					var templateProcessor = new jsx3.xml.Template(objXSL);               
					var objDoc = templateProcessor.transformToObject(objXML);
					objDoc = jsx3.xml.CDF.Document.wrap(objDoc);
					objDoc.convertProperties(cle.SERVER.JSS, ["jsxtext","jsxtip"]);
					cle.SERVER.getCache().setDocument(configuration.EDITOR_CACHE_ID,objDoc);
				}
				var strProcedureId = objRecordNode.getAttribute("ProcedureID");
				if (!jsx3.util.strEmpty(strProcedureId)){
					objEditor.setProcedureId(strProcedureId);
				}
				var strApplicationId = objRecordNode.getAttribute("ApplicationID");
				if (!jsx3.util.strEmpty(strApplicationId)){
					objEditor.setApplicationId(strApplicationId);
				}
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doProcedureItem error: " + e.getMessage());
		}
	};
	configuration.doRenderingFolder = function(objJSX,strRecordId,objRecordNode,strAppId) {
		try{
			//call service to retrieve all severity configurations for this application id
			var rv = cle.configuration.rendering.retrieveAppSpecificRenderConfigOp(strAppId);
			rv.when(function(result){
				var isSuccess = result.status;
				if (isSuccess){
					//copy the results to this node
					var objCDF = result.document;
					if (objCDF != null){
						var objNodes = objCDF.selectNodes("//record[@RenderID]"); //just nodes from a rendering result
						if (objNodes.size() >0){
							//this is a category, remove children and show list from service
							objRecordNode.removeChildren();
							jsx3.$A(objNodes.toArray()).each(function(node){
								node.setAttribute('jsxtype',configuration.TYPE_RENDERING);
								node.setAttribute('jsximg',configuration.ATTR_IMG_URL);
								objRecordNode.appendChild(node);
							});
						}
					}
				}
				if(objRecordNode.getAttribute("jsxopen")==jsx3.Boolean.TRUE){
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,true);objJSX.revealRecord(strRecordId);});
				}
				else {
					jsx3.sleep(function(){configuration.toggleTreeItem(objJSX,strRecordId,false);});
				}
			});
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doRenderingFolder error: " + e.getMessage());
		}
	};
	configuration.doRenderingItem = function(objRecordNode,objPrivilege) {
		try{
			cle.LOG.trace("configuration#doRenderingItem");
						
			var objParent = cle.SERVER.getJSXByName("configurationEditor");
			if (objParent != null){
				//objParent.removeChildren();
				var strURI = cle.SERVER.resolveURI("interfaces/configuration/renderConfig/configurationViewerPane_gui.xml");
				var objEditor = objParent.loadAndCache(strURI,false);
				var hasDeletePrivilege = objPrivilege.hasPrivilege(cle.Privilege.DELETE_CONFIGURATIONS);
				cle.LOG.trace("configuration#doRenderingItem hasDeletePrivilege: " + hasDeletePrivilege);
				if (hasDeletePrivilege==jsx3.Boolean.TRUE){
					objEditor.getDeleteButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var hasEditPrivilege = objPrivilege.hasPrivilege(cle.Privilege.EDIT_CONFIGURATIONS);
				cle.LOG.trace("configuration#doRenderingItem hasEditPrivilege: " + hasEditPrivilege);
				if (hasEditPrivilege==jsx3.Boolean.TRUE){
					objEditor.getEditButton().setEnabled(jsx3.gui.Form.STATEENABLED,true);
				}
				var objXML = new jsx3.xml.CDF.Document.newDocument();
				objXML.getRootNode().appendChild(objRecordNode.cloneNode(true)); //use a copy, not the real record
				var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/renderConfig/renderConfigRecord2records.xsl");
				var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
				if (!objXSL.hasError()){
					cle.LOG.trace("configuration#doRenderingItem found XSL, transforming record.");
					//transform selected record
					var templateProcessor = new jsx3.xml.Template(objXSL);               
					var objDoc = templateProcessor.transformToObject(objXML);
					objDoc = jsx3.xml.CDF.Document.wrap(objDoc);
					objDoc.convertProperties(cle.SERVER.JSS, ["jsxtext","jsxtip"]);
					//grab the XSLT record
					var objXsltRecord = objDoc.getRecordNode("XSLT");
					//place the jsxvalue as the value of the blockx
					var XsltViewer = objEditor.getDescendantOfName("XsltViewer",true,false);
					if (XsltViewer != null){
						var strXSLT = objXsltRecord.getAttribute("jsxvalue");
						if (!jsx3.util.strEmpty(strXSLT)){
							XsltViewer.resetXmlCacheData();
							XsltViewer.setXMLString(strXSLT);
						}
						else {
							//if the jsxvalue of the XSLT is null, remove viewer
							var XsltEditor = XsltViewer.getParent();
							XsltEditor.removeChild(XsltViewer);
							XsltEditor.setText("");
						}
					}
					//grab the CSS record
					var objCssRecord = objDoc.getRecordNode("CSS");
					//place the jsxvalue as the text of the block
					var cssViewer = objEditor.getDescendantOfName("CssViewer",true,false);
					if (cssViewer != null){
						cssViewer.setText(objCssRecord.getAttribute("jsxvalue").toString());
					}
					//save in cache
					cle.SERVER.getCache().setDocument(configuration.EDITOR_CACHE_ID,objDoc);
					var strRenderId = objRecordNode.getAttribute("RenderID");
					if (!jsx3.util.strEmpty(strRenderId)){
						objEditor.setRenderId(strRenderId);
					}
					var strApplicationId = objRecordNode.getAttribute("ApplicationID");
					if (!jsx3.util.strEmpty(strApplicationId)){
						objEditor.setApplicationId(strApplicationId);
					}
					objParent.paintChild(objEditor);
				}
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#doRenderingItem error: " + e.getMessage());
		}
	};
	configuration.createApplicationItem = function(objMenu,strRecordId,objContextParent,strContextId) {
		try{
			cle.LOG.trace("configuration#createApplicationItem");
			if (objContextParent == null){
				objContextParent = cle.SERVER.getJSXByName('configTreeMatrix');
			}
			if (strContextId == null){
				strContextId = objContextParent.getSelectedIds()[0];
			}
			var objRecordNode = objContextParent.getRecordNode(strContextId);
			cle.LOG.trace('configuration#createApplicationItem objContextParent: ' + objContextParent.getName());
			cle.LOG.trace('configuration#createApplicationItem strContextId: ' + strContextId);
			//use base block as the parent
			var objParent = cle.SERVER.getBodyBlock();
			//launch dialog and wait to show it
			var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/configurationDialog_gui.xml");
			var objDialog = objParent.loadAndCache(configDialogURL,false);
			//set the type of dialog to 'modal'
			objDialog.setModal(jsx3.gui.Dialog.MODAL);
			//set the dialog caption bar text
			var objWindowBar = objDialog.getCaptionBar();
			objDialog.setHeight(320,false);
			var strCaption = cle.utils.getProperty('application_createNewItemCaption');
			objWindowBar.setText(strCaption,false); //wait to paint it
			//load the body section of the dialog with the specific interface
			var objTargetPane = objDialog.getDescendantOfName("dialogPane",true,false);
			if (objTargetPane != null){
				var contentURL = cle.SERVER.resolveURI("interfaces/configuration/applicationConfig/configurationEditorNew_gui.xml");
				var objPane = objTargetPane.loadAndCache(contentURL,false);
				objPane.setRecordId(strContextId);
				objPane.markRequiredInputs(false);
				//show it
				objParent.paintChild(objDialog);
				jsx3.sleep(function(){objPane.getFirstResponder().focus();});
			}
			else {
				cle.LOG.warn("configuration#createApplicationItem target 'bodyPane' not found.");
			}

		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#createApplicationItem error: " + e.getMessage());
		}
	};
	configuration.createCategoryItem = function(objMenu,strRecordId,objContextParent,strContextId) {
		try{
			cle.LOG.trace("configuration#createCategoryItem");
			if (objContextParent == null){
				objContextParent = cle.SERVER.getJSXByName('configTreeMatrix');
			}
			if (strContextId == null){
				strContextId = objContextParent.getSelectedIds()[0];
			}
			//retrieve parent record
			var objRecordNode = objContextParent.getRecordNode(strContextId);
			//find the application record
			if (objRecordNode != null){
				//use body block as the parent
				var objParent = cle.SERVER.getBodyBlock();
				//launch dialog and wait to show it
				var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/configurationDialog_gui.xml");
				var objDialog = objParent.loadAndCache(configDialogURL,false);
				//set the type of dialog to 'modal'
				objDialog.setModal(jsx3.gui.Dialog.MODAL);
				//set the dialog caption bar text
				var objWindowBar = objDialog.getCaptionBar();
				var strCaption = cle.utils.getProperty('category_createNewItemCaption');
				objWindowBar.setText(strCaption,false); //wait to paint it
				objDialog.setHeight(320,false);
				var objParentRecordNode = objRecordNode.selectSingleNode("ancestor-or-self::record[@jsxtype='application']");
				if (objParentRecordNode != null){
					cle.LOG.trace('configuration#createCategoryItem record node: ' + objParentRecordNode.toString());
					//load interface into dialog
					var createURL = cle.SERVER.resolveURI("interfaces/configuration/categoryConfig/configurationEditorNew_gui.xml");
					var dialogPane = objDialog.getDescendantOfName("dialogPane",true,false);
					if (dialogPane != null){
						var objPane = dialogPane.loadAndCache(createURL,false);
						objPane.setRecordId(objRecordNode.getAttribute('jsxid'));
						objPane.setApplicationId(objParentRecordNode.getAttribute('jsxid'));
						objPane.markRequiredInputs(false);
						objParent.paintChild(objDialog);
						jsx3.sleep(function(){objPane.getFirstResponder().focus();});
					}
				}
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#createCategoryItem error: " + e.getMessage());
		}
	};
	configuration.createExceptionCodeItem = function(objMenu,strRecordId,objContextParent,strContextId) {
		try{
			cle.LOG.trace("configuration#createExceptionCodeItem");
			if (objContextParent == null){
				objContextParent = cle.SERVER.getJSXByName('configTreeMatrix');
			}
			if (strContextId == null){
				strContextId = objContextParent.getSelectedIds()[0];
			}
			//use body block as the parent
			var objParent = cle.SERVER.getBodyBlock();
			//launch dialog and wait to show it
			var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/configurationDialog_gui.xml");
			var objDialog = objParent.loadAndCache(configDialogURL,false);
			//set the type of dialog to 'modal'
			objDialog.setModal(jsx3.gui.Dialog.MODAL);
			//set the dialog caption bar text
			var objWindowBar = objDialog.getCaptionBar();
			var strCaption = cle.utils.getProperty('exceptionConfig_createNewItemCaption');
			objWindowBar.setText(strCaption,false); //wait to paint it
			objDialog.setHeight(760,false);
			//now paint it without contents
			objParent.paintChild(objDialog);
			//load the body section of the dialog with the specific interface
			var objTargetPane = objDialog.getDescendantOfName("dialogPane",true,false);
			if (objTargetPane != null){
				var contentURL = cle.SERVER.resolveURI("interfaces/configuration/exceptionConfig/configurationEditorNew_gui.xml");
				var objPane = objTargetPane.loadAndCache(contentURL,false);
				var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/xsl/config2selectCDF.xsl");
				var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
				if (!objXSL.hasError()){
					var objRecordNode = objContextParent.getRecordNode(strContextId);
					//find the application record
					if (objRecordNode != null){
						var objParentRecordNode = objRecordNode.selectSingleNode("ancestor-or-self::record[@jsxtype='application']");
						if (objParentRecordNode != null){
							cle.LOG.trace('configuration#createExceptionCodeItem record node: ' + objParentRecordNode.toString());
							var strAppId = objParentRecordNode.getAttribute("jsxid");
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
											cle.LOG.trace('configuration#createExceptionCodeItem found ' + objNodes.size() + ' for category');
											//update the category select options CDF
											var objCategory = objPane.getCategory();
											objCategory.clearXmlData();
											//transform selected record
											var templateProcessor = new jsx3.xml.Template(objXSL);
											var objParams ={attrName:'CategoryID'};
											templateProcessor.setParams(objParams);
											var objDoc = templateProcessor.transformToObject(objCDF);
											cle.LOG.trace('configuration#createExceptionCodeItem cdf for procedure: ' + objDoc.toString());
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
										cle.LOG.trace('configuration#createExceptionCodeItem cdf for type: ' + objCDF.toString());
										var objNodes = objCDF.selectNodes("//record[@TypeID]"); //just nodes from a configuration type result
										if (objNodes.size() >0){
											cle.LOG.trace('configuration#createExceptionCodeItem found ' + objNodes.size() + ' for type');
											//update the type select options CDF
											var objType = objPane.getType();
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
										cle.LOG.trace('configuration#createExceptionCodeItem cdf for severity: ' + objCDF.toString());
										var objNodes = objCDF.selectNodes("//record[@SeverityID]"); //just nodes from an severity result
										if (objNodes.size() >0){
											cle.LOG.trace('configuration#createExceptionCodeItem found ' + objNodes.size() + ' for severity');
											//update the severity select options CDF
											var objSeverity = objPane.getSeverity();
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
										cle.LOG.trace('configuration#createExceptionCodeItem cdf for procedure: ' + objCDF.toString());
										var objNodes = objCDF.selectNodes("//record[@ProcedureID]"); //just nodes from a procedure result
										if (objNodes.size() >0){
											cle.LOG.trace('configuration#createExceptionCodeItem found ' + objNodes.size() + ' for procedure');
											//update the procedure select options CDF
											var objProcedure = objPane.getProcedure();
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
							objPane.setRecordId(objRecordNode.getAttribute('jsxid'));
							objPane.setApplicationId(objParentRecordNode.getAttribute('jsxid'));
							//show after all the return values are finished
							rvCategory.and(rvType).and(rvSeverity).and(rvProcedure).when(function(){
								cle.LOG.trace('configuration#createExceptionCodeItem ready to paint child');
							    objPane.markRequiredInputs(true);
							    //TODO: find out why it produces two objPane components when dialog paints child.
								//objDialog.paintChild(objPane);
								jsx3.sleep(function(){objPane.getFirstResponder().focus();});
							});
						}
					}
				}
			}
			else {
				cle.LOG.warn("configuration#createExceptionCodeItem target 'bodyPane' not found.");
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#createExceptionCodeItem error: " + e.getMessage());
		}
	};
	configuration.createInterfaceItem = function(objMenu,strRecordId,objContextParent,strContextId) {
		try{
			if (objContextParent == null){
				objContextParent = cle.SERVER.getJSXByName('configTreeMatrix');
			}
			if (strContextId == null){
				strContextId = objContextParent.getSelectedIds()[0];
			}
			//use body block as the parent
			var objParent = cle.SERVER.getBodyBlock();
			//launch dialog and wait to show it
			var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/configurationDialog_gui.xml");
			var objDialog = objParent.loadAndCache(configDialogURL,false);
			//set the type of dialog to 'modal'
			objDialog.setModal(jsx3.gui.Dialog.MODAL);
			//set the dialog caption bar text
			var objWindowBar = objDialog.getCaptionBar();
			var strCaption = cle.utils.getProperty('interface_createNewItemCaption');
			objWindowBar.setText(strCaption,false); //wait to paint it
			objDialog.setHeight(640,false);
			//now paint it without contents
			objParent.paintChild(objDialog);
			//load the body section of the dialog with the specific interface
			var objTargetPane = objDialog.getDescendantOfName("dialogPane",true,false);
			if (objTargetPane != null){
				var contentURL = cle.SERVER.resolveURI("interfaces/configuration/interfaceConfig/configurationEditorNew_gui.xml");
				var objPane = objTargetPane.loadAndCache(contentURL,false);
				var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/xsl/config2selectCDF.xsl");
				var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
				if (!objXSL.hasError()){
					var objRecordNode = objContextParent.getRecordNode(strContextId);
					//find the application record
					if (objRecordNode != null){
						var objParentRecordNode = objRecordNode.selectSingleNode("ancestor-or-self::record[@jsxtype='application']");
						if (objParentRecordNode != null){
							cle.LOG.trace('configuration#createExceptionCodeItem record node: ' + objParentRecordNode.toString());
							var strAppId = objParentRecordNode.getAttribute("jsxid");
							objPane.setRecordId(objRecordNode.getAttribute('jsxid'));
							objPane.setApplicationId(objParentRecordNode.getAttribute('jsxid'));
							var rvInterfaceParentId = cle.configuration.interfaceConfig.retrieveInterfaceParentList(strAppId);
							rvInterfaceParentId.when(function(result){
								var isSuccess = result.status;
								if (isSuccess){
									//copy the results to this node
									var objCDF = result.document;
									if (objCDF != null){
										cle.LOG.trace('configuration#createInterfaceItem cdf for interface parent list: ' + objCDF.toString());
										var objNodes = objCDF.selectNodes("//record[@InterfaceID]"); //just nodes from interface result
										if (objNodes.size() >0){
											cle.LOG.trace('configuration#createInterfaceItem found ' + objNodes.size() + ' for interface');
											//update the category select options CDF
											var objParentId = objPane.getInterfaceParentId();
											objParentId.clearXmlData();
											//transform selected record
											var templateProcessor = new jsx3.xml.Template(objXSL);
											var objParams ={attrName:'InterfaceID'};
											templateProcessor.setParams(objParams);
											var objDoc = templateProcessor.transformToObject(objCDF);
											cle.LOG.trace('configuration#createInterfaceItem cdf for procedure: ' + objDoc.toString());
											objParentId.setSourceXML(objDoc, cle.SERVER.getCache());
										}
									}
								}
							});
							//show after all the return values are finished
							rvInterfaceParentId.when(function(){
							    objPane.markRequiredInputs(true);
							    //TODO: find out why it produces two objPane components when dialog paints child.
								//objDialog.paintChild(objPane);
								jsx3.sleep(function(){objPane.getFirstResponder().focus();});
							});
						}
					}
				}
			}
			else {
				cle.LOG.warn("configuration#createInterfaceItem target 'bodyPane' not found.");
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#createInterfaceItem error: " + e.getMessage());
		}
	};
	configuration.createProcedureItem = function(objMenu,strRecordId,objContextParent,strContextId) {
		try{
			cle.LOG.trace("configuration#createProcedureItem");
			if (objContextParent == null){
				objContextParent = cle.SERVER.getJSXByName('configTreeMatrix');
			}
			if (strContextId == null){
				strContextId = objContextParent.getSelectedIds()[0];
			}
			//use body block as the parent
			var objParent = cle.SERVER.getBodyBlock();
			//launch dialog and wait to show it
			var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/configurationDialog_gui.xml");
			var objDialog = objParent.loadAndCache(configDialogURL,false);
			//set the type of dialog to 'modal'
			objDialog.setModal(jsx3.gui.Dialog.MODAL);
			//set the dialog caption bar text
			var objWindowBar = objDialog.getCaptionBar();
			var strCaption = cle.utils.getProperty('procedure_createNewItemCaption');
			objWindowBar.setText(strCaption,false); //wait to paint it
			objDialog.setHeight(320,false);
			//now paint it without contents
			objParent.paintChild(objDialog);
			//load the body section of the dialog with the specific interface
			var objTargetPane = objDialog.getDescendantOfName("dialogPane",true,false);
			if (objTargetPane != null){
				var contentURL = cle.SERVER.resolveURI("interfaces/configuration/procedureConfig/configurationEditorNew_gui.xml");
				var objPane = objTargetPane.loadAndCache(contentURL,false);
				var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/xsl/config2selectCDF.xsl");
				var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
				if (!objXSL.hasError()){
					var objRecordNode = objContextParent.getRecordNode(strContextId);
					//find the application record
					if (objRecordNode != null){
						var objParentRecordNode = objRecordNode.selectSingleNode("ancestor-or-self::record[@jsxtype='application']");
						if (objParentRecordNode != null){
							cle.LOG.trace(objParentRecordNode.toString());
							objPane.setRecordId(objRecordNode.getAttribute('jsxid'));
							objPane.setApplicationId(objParentRecordNode.getAttribute('jsxid'));
						}
						else {
							cle.LOG.warn("configuration#createProcedureItem 'objRecordNode' not found.");
						}
					}
				}
				else {
					cle.LOG.warn("configuration#createProcedureItem 'objXSL' has problems.");
				}
				//show it
			    objPane.markRequiredInputs(true);
				jsx3.sleep(function(){objPane.getFirstResponder().focus();});
			}
			else {
				cle.LOG.warn("configuration#createProcedureItem target 'bodyPane' not found.");
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#createProcedureItem error: " + e.getMessage());
		}
	};
	configuration.createRenderingItem = function(objMenu,strRecordId,objContextParent,strContextId) {
		try{
			cle.LOG.trace("configuration#createRenderingItem");
			if (objContextParent == null){
				objContextParent = cle.SERVER.getJSXByName('configTreeMatrix');
			}
			if (strContextId == null){
				strContextId = objContextParent.getSelectedIds()[0];
			}
			//use body block as the parent
			var objParent = cle.SERVER.getBodyBlock();
			//launch dialog and wait to show it
			var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/configurationDialog_gui.xml");
			var objDialog = objParent.loadAndCache(configDialogURL,false);
			//set the type of dialog to 'modal'
			objDialog.setModal(jsx3.gui.Dialog.MODAL);
			//set the dialog caption bar text
			var objWindowBar = objDialog.getCaptionBar();
			var strCaption = cle.utils.getProperty('renderConfig_createNewItemCaption');
			objWindowBar.setText(strCaption,false); //wait to paint it
			objDialog.setHeight(640,false);
			//now paint it without contents
			objParent.paintChild(objDialog);
			//load the body section of the dialog with the specific interface
			var objTargetPane = objDialog.getDescendantOfName("dialogPane",true,false);
			if (objTargetPane != null){
				var contentURL = cle.SERVER.resolveURI("interfaces/configuration/renderConfig/configurationEditorNew_gui.xml");
				var objPane = objTargetPane.loadAndCache(contentURL,false);
				var strXSLUrl = cle.SERVER.resolveURI("interfaces/configuration/xsl/config2selectCDF.xsl");
				var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
				if (!objXSL.hasError()){
					var objRecordNode = objContextParent.getRecordNode(strContextId);
					//find the application record
					if (objRecordNode != null){
						var objParentRecordNode = objRecordNode.selectSingleNode("ancestor-or-self::record[@jsxtype='application']");
						if (objParentRecordNode != null){
							cle.LOG.trace(objParentRecordNode.toString());
							objPane.setRecordId(objRecordNode.getAttribute('jsxid'));
							objPane.setApplicationId(objParentRecordNode.getAttribute('jsxid'));
						}
						else {
							cle.LOG.warn("configuration#createRenderingItem 'objRecordNode' not found.");
						}
					}
				}
				else {
					cle.LOG.warn("configuration#createRenderingItem 'objXSL' has problems.");
				}
				//show it
				objPane.markRequiredInputs(true);
				jsx3.sleep(function(){objPane.getFirstResponder().focus();});
			}
			else {
				cle.LOG.warn("configuration#createRenderingItem target 'bodyPane' not found.");
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#createRenderingItem error: " + e.getMessage());
		}
	};
	configuration.createSeverityItem = function(objMenu,strRecordId,objContextParent,strContextId) {
		try{
			cle.LOG.trace("configuration#createSeverityItem");
			if (objContextParent == null){
				objContextParent = cle.SERVER.getJSXByName('configTreeMatrix');
			}
			if (strContextId == null){
				strContextId = objContextParent.getSelectedIds()[0];
			}
			//retrieve parent record
			var objRecordNode = objContextParent.getRecordNode(strContextId);
			//find the application record
			if (objRecordNode != null){
				//use body block as the parent
				var objParent = cle.SERVER.getBodyBlock();
				//launch dialog and wait to show it
				var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/configurationDialog_gui.xml");
				var objDialog = objParent.loadAndCache(configDialogURL,false);
				//set the type of dialog to 'modal'
				objDialog.setModal(jsx3.gui.Dialog.MODAL);
				//set the dialog caption bar text
				var objWindowBar = objDialog.getCaptionBar();
				var strCaption = cle.utils.getProperty('severity_createNewItemCaption');
				objWindowBar.setText(strCaption,false); //wait to paint it
				objDialog.setHeight(300,false);
				var objParentRecordNode = objRecordNode.selectSingleNode("ancestor-or-self::record[@jsxtype='application']");
				if (objParentRecordNode != null){
					cle.LOG.trace('configuration#createTypeItem record node: ' + objParentRecordNode.toString());
					//load interface into dialog
					var createURL = cle.SERVER.resolveURI("interfaces/configuration/severityConfig/configurationEditorNew_gui.xml");
					var dialogPane = objDialog.getDescendantOfName("dialogPane",true,false);
					if (dialogPane != null){
						var objPane = dialogPane.loadAndCache(createURL,false);
						objPane.setRecordId(objRecordNode.getAttribute('jsxid'));
						objPane.setApplicationId(objParentRecordNode.getAttribute('jsxid'));
						//dialogPane.paintChild(objPane);
						objPane.markRequiredInputs(false);
						objParent.paintChild(objDialog);
						jsx3.sleep(function(){objPane.getFirstResponder().focus();});
					}
				}
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#createSeverityItem error: " + e.getMessage());
		}
	};
	configuration.createTypeItem = function(objMenu,strRecordId,objContextParent,strContextId) {
		try{
			cle.LOG.trace("configuration#createTypeItem");
			if (objContextParent == null){
				objContextParent = cle.SERVER.getJSXByName('configTreeMatrix');
			}
			if (strContextId == null){
				strContextId = objContextParent.getSelectedIds()[0];
			}
			//retrieve parent record
			var objRecordNode = objContextParent.getRecordNode(strContextId);
			//find the application record
			if (objRecordNode != null){
				//use body block as the parent
				var objParent = cle.SERVER.getBodyBlock();
				//launch dialog and wait to show it
				var configDialogURL = cle.SERVER.resolveURI("interfaces/configuration/configurationDialog_gui.xml");
				var objDialog = objParent.loadAndCache(configDialogURL,false);
				//set the type of dialog to 'modal'
				objDialog.setModal(jsx3.gui.Dialog.MODAL);
				//set the dialog caption bar text
				var objWindowBar = objDialog.getCaptionBar();
				var strCaption = cle.utils.getProperty('typeConfig_createNewItemCaption');
				objWindowBar.setText(strCaption,false); //wait to paint it
				objDialog.setHeight(300,false);
				var objParentRecordNode = objRecordNode.selectSingleNode("ancestor-or-self::record[@jsxtype='application']");
				if (objParentRecordNode != null){
					cle.LOG.trace('configuration#createTypeItem record node: ' + objParentRecordNode.toString());
					//load interface into dialog
					var createURL = cle.SERVER.resolveURI("interfaces/configuration/typeConfig/configurationEditorNew_gui.xml");
					var dialogPane = objDialog.getDescendantOfName("dialogPane",true,false);
					if (dialogPane != null){
						var objPane = dialogPane.loadAndCache(createURL,false);
						objPane.setRecordId(objRecordNode.getAttribute('jsxid'));
						objPane.setApplicationId(objParentRecordNode.getAttribute('jsxid'));
						//dialogPane.paintChild(objPane);
						objPane.markRequiredInputs(false);
						objParent.paintChild(objDialog);
						jsx3.sleep(function(){objPane.getFirstResponder().focus();});
					}
				}
			}
		} catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("configuration#createTypeItem error: " + e.getMessage());
		}
	};

	//do subscriptions on load
	configuration.setSubscriptions();

});
