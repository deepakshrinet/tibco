jsx3.require("jsx3.util.DateFormat","jsx3.gui.Form");
jsx3.lang.Package.definePackage(
  "cle.exception",
  function(exception) {

	  exception.ENDPOINT_HOST = "http://localhost:9950";
	  exception.ENDPOINT_URL = "/ExceptionManagement/GUIServices/intfExceptions-service.serviceagent/intfwsResolveExceptionsEndpoint1";
	  exception.TIMEOUT = 20 * 1000; //20 seconds
	  exception.CURRENT_APP_ID = null;
	  exception.EXCEPTION_CRITERIA_CACHE_ID = "exceptionCriteria_cdf_xml";
	  exception.LIST_CACHE_ID = "exceptionList_cdf";
	  exception.DETAIL_CACHE_ID = "exceptionDetails_cdf";
	  exception.AUTHORIZATION_CACHE_ID = "authorization_cdf";
	  exception.APPLICATION_CACHE_ID = "applicationList_cdf";
	  
	  //Status types used to enable delete button
	  exception.STATUS_PENDING_PROCEDURE = 'Pending Procedure';
	  exception.STATUS_PENDING_PROCEDURE = 'Replied';
	  exception.STATUS_RESOLVED = 'Resolved';
	  exception.STATUS_NEW = 'New';
	  exception.STATUS_NOTIFIED = 'Notified';

	  exception.setSubscriptions = function(){
			cle.LOG.trace("exception#setSubscriptions");
			cle.SERVER.subscribe("exceptionFault",exception.onExceptionFault);
			cle.SERVER.subscribe("selectExceptionList",exception.onSelectException);
			cle.SERVER.subscribe("requestExceptionDetails",exception.onGetExceptionDetails);
			cle.SERVER.getCache().subscribe(exception.APPLICATION_CACHE_ID,exception.onAuthorizationUpdate);
			cle.SERVER.subscribe("unloadApplication", exception.onUnloadApplication);
			cle.SERVER.subscribe('getCorrespondingExceptions',exception.onCorrelateFromLog);
			//after the main UI is added, this method will be invoked
			cle.SERVER.subscribe("mainReady",exception.onMainReady);
			//invoked after a query criteria field is changed
			cle.SERVER.subscribe("exceptionQueryFieldChange",exception.onQueryFieldChange);
	  };
	  exception.onCorrelateFromLog = function(objEvent){
		  cle.LOG.trace('exception#onCorrelateFromLog');
		  var rv =exception.resetCorrelationCriteria();
		  rv.when(function(){
			  //find log tab and set
			  var objExceptionTab = cle.SERVER.getJSXByName('exceptionTab');
			  objMainTabbedPane = objExceptionTab.getParent();
			  if (objMainTabbedPane != null){
				  objMainTabbedPane.setSelectedIndex(objExceptionTab, true);
			  }
			  exception.setCorrelationCriteria(objEvent);
		  });
	  };
	  exception.resetCorrelationCriteria = jsx3.$Y(function(cb){
		  cle.LOG.trace('exception#resetCorrelationCriteria');
		  var objDoc = cle.SERVER.getCache().getDocument(exception.EXCEPTION_CRITERIA_CACHE_ID);
		  if (objDoc != null){
			  var objNodeIt = objDoc.selectNodeIterator('//record[@jsxvalue]');
			  while(objNodeIt.hasNext()){
				  objNodeIt.next().setAttribute('jsxvalue','');
			  }
		  }
		  var objMatrix = cle.SERVER.getJSXByName('exceptionQueryMatrix');
		  if (objMatrix != null){
			  objMatrix.repaintData();
		  }
		  cb.done();
	  });
	  exception.setCorrelationCriteria = function(objEvent){
		  cle.LOG.trace('exception#setCorrelationCriteria');
		  //inbound has appId, recordId: strRecordId, fieldId: strFieldId, fieldValue: strValue
		  var strRecordId = objEvent.recordId;
		  var strAppId = objEvent.appId;
		  var strFieldId = objEvent.fieldId;
		  var strValue = objEvent.fieldValue;
		  var strNotFound = cle.utils.getProperty('m_notFound');
		  cle.LOG.trace('exception#setCorrelationCriteria recordId: ' +(strRecordId)? strRecordId : strNotFound);
		  cle.LOG.trace('exception#setCorrelationCriteria appId: ' +(strAppId)? strAppId : strNotFound);
		  cle.LOG.trace('exception#setCorrelationCriteria fieldId: ' +(strFieldId)? strFieldId : strNotFound);
		  cle.LOG.trace('exception#setCorrelationCriteria fieldValue: ' +(strValue)? strValue : strNotFound);
		  if (strFieldId){
			  var objCDF = cle.SERVER.getCache().getDocument(exception.EXCEPTION_CRITERIA_CACHE_ID);
			  objCDF = jsx3.xml.CDF.Document.wrap(objCDF);
			  //set the application id for the search
			  if (!jsx3.util.strEmpty(strAppId)){
				  var objRecordNode = objCDF.getRecordNode(strAppId);
				  if (objRecordNode != null){
					  objRecordNode.setAttribute('jsxvalue',jsx3.Boolean.TRUE);
				  }
			  }
			  var objRecordNode = objCDF.getRecordNode('OrderBy');
			  if (objRecordNode != null){
				  objRecordNode.setAttribute('jsxvalue','Time_Stamp');
			  }
			  //only two ids allowed
			  if (strFieldId=='CORRELATIONID'){
				  var objRecordNode = objCDF.getRecordNode('correlationID');
				  if (objRecordNode != null){
					  objRecordNode.setAttribute('jsxvalue',strValue);
				  }
			  }
			  else if (strFieldId=='TRANSACTIONID'){
				  var objRecordNode = objCDF.getRecordNode('transactionID');
				  if (objRecordNode != null){
					  objRecordNode.setAttribute('jsxvalue',strValue);
				  }
			  }
			  //requirement for UI wanted to automatically query the exceptions based on correlation from log
			  var objMatrix = cle.SERVER.getJSXByName('exceptionQueryMatrix');
			  exception.queryFieldChange(objMatrix);
			  //find query button to pass as argument
			  var objButton = cle.SERVER.getJSXByName('exceptionSearchBtn');
			  //TODO: handle NPE if button not found
			  exception.queryExceptions(objButton);

			  //sync the view
			  var objMatrix = cle.SERVER.getJSXByName('exceptionQueryMatrix');
			  if (objMatrix != null){
				  objMatrix.repaintData();
			  }
              cle.SERVER.getCache().publish({subject: exception.EXCEPTION_CRITERIA_CACHE_ID, action:jsx3.app.Cache.CHANGE});
		  }
	  };
	  //mask the child in order to move the splitter over the iframe
	  exception.onBeforeSplitterResize = function(objEvent) {
		  cle.LOG.trace("exception#onBeforeSplitterResize");
		  var objJSX = objEvent.target.getChild(1);
		  if (objJSX){
			  objJSX._jsxmaskid  = objJSX.getId() + "_mask";
			  //match the splitter cursor for continuity
			  var cursorType = (objEvent.target.getOrientation()==jsx3.gui.Splitter.ORIENTATIONH) ? 'col-resize': 'row-resize';
			  var objMask = (new jsx3.gui.Block(objJSX._jsxmaskid,0,0,"100%","100%","&#160")).setOverflow(jsx3.gui.Block.OVERFLOWHIDDEN).setIndex(0).setRelativePosition(0).setZIndex(32000).setDynamicProperty("jsxbgcolor","@Transparent BG");
			  objMask.setWidth("100%").setHeight("100%").setCSSOverride('cursor:' + cursorType);
			  objJSX.setChild(objMask);
			  objJSX.paintChild(objMask);
		  }
	  };
	  exception.onAfterSplitterResize = function(objEvent) {
		  cle.LOG.trace("exception#onAfterSplitterResize");
		  var objParent = objEvent.target.getChild(1);
		  if (objParent){
			  cle.utils.hideMask(objParent);
		  }
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
	  /**
	   * after the main UI is added, add Exception tab to main UI
	   */
	  exception.onMainReady = function(objEvent) {
		  try {
			  cle.LOG.trace("exception#onMainReady");
			  var objMainPane = objEvent.objJSX;
			  var objMainTabbedPane = objMainPane.getDescendantOfName("mainTabbedPane",true,false);
			  if (objMainTabbedPane != null){
				  cle.LOG.trace("found objMainTabbedPane");
				  //add log tab
				  var objExceptionTabRV = exception.addTab(objMainTabbedPane);
				  objExceptionTabRV.when(function(objExceptionTab){
					  //add the tab pane
					  var strURI = cle.SERVER.resolveURI("interfaces/exception/exceptionPane_gui.xml");
					  //get the parent for the pane
					  var objParentPane = objExceptionTab.getDescendantOfName("exceptionTabPane",true,false);
					  var objExceptionPane = objParentPane.load(strURI,false);
					  var objChildren = objExceptionPane.findDescendants(function(descendant){return (descendant.instanceOf(jsx3.gui.Matrix));}, true, true, false, false);
					  if (objChildren != null){
						  jsx3.$A(objChildren).each(function(child){
							  child.setXSLParam("jsx_treehead_bgcolor",cle.utils.getProperty("cellTreeheadBG"));
						  });
					  }
					  objMainTabbedPane.paintChild(objExceptionTab);
					  cle.LOG.trace("done loading exception tab");
				  });
			  }
		  } catch (e) {
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#onMainReady error: " + e.getMessage());
		  }
	  };
	  exception.addTab = jsx3.$Y(function(cb) {
	     try{
	    	 var objParent = cb.args()[0];
	    	 var strURI = cle.SERVER.resolveURI("interfaces/exception/exceptionTab_gui.xml");
	    	 var objTab = objParent.load(strURI,false);
	    	 cb.done(objTab);
	     } catch (e){
	       e = jsx3.lang.NativeError.wrap(e);
	       cle.LOG.error("exception#addTab error: " + e.getMessage());
	     }
	  });
	  exception.rebuildApplicationList = function(objJSX) {
		  try {
			  cle.LOG.trace("exception#rebuildApplicationList");
			  exception.onAuthorizationUpdate({subject:exception.AUTHORIZATION_CACHE_ID,action:jsx3.app.Cache.CHANGE});
		  } catch (e) {
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#rebuildApplicationList error: " + e.getMessage());
		  }
	  };
	  exception.beforeShowMenu = function(objMatrix,strRecordId,objColumn,objMenu) {
		  try {
				var strColumnName = objColumn.getName();
				if ((strColumnName=='transIdCol') || (strColumnName=='correlationIdCol')){
					objMenu._fieldId = objColumn.getPath();
					return {objMENU:objMenu};
				}
				else {
					return false;
				}
		  } catch (e) {
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#beforeShowMenu error: " + e.getMessage());
		  }
	  };
	  exception.correlateLogs = function(objMatrix, strRecordId, strFieldId) {
		  try {
			  cle.LOG.trace("exception#correlateLogs");
			  var objRecord = objMatrix.getRecord(strRecordId);
			  if (objRecord){
				  var strAppId = objRecord['APPLICATIONID'];
				  var strValue = objRecord[strFieldId];
				  cle.LOG.trace('exception#correlateLogs using fieldId: ' + strFieldId + ', fieldValue: ' + strValue);
				  cle.SERVER.publish({subject: "getCorrespondingLogs", appId: strAppId , recordId: strRecordId, fieldId: strFieldId, fieldValue: strValue});
			  }
		  } catch (e) {
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#correlateLogs error: " + e.getMessage());
		  }
	  };
		/**
		 * synchronize the authorization and the application list and
		 * update the query UI to include only the authorized applications
		 * @param {Event} subject (a cache id of source document), action (add or change integers)
		 * note: event trigger is based on the application list changing but actually uses the authorization list
		 */
		exception.onAuthorizationUpdate = function(objEvent){
			cle.LOG.debug("exception#onAuthorizationUpdate");
			var strSubject = objEvent.subject;
			var strAction = objEvent.action;
			cle.LOG.trace("exception#onAuthorizationUpdate subject: " + strSubject + ", action: " + strAction);
			//update the configuration if the action is for an add or change
			var objExceptionQueryMatrix = cle.SERVER.getJSXByName("exceptionQueryMatrix");
			if (objExceptionQueryMatrix != null){
				cle.LOG.trace("found objExceptionQueryMatrix");
				if (strAction == jsx3.app.Cache.ADD || strAction == jsx3.app.Cache.CHANGE){
					//replace the elements in the exceptionCriteria_cdf
					var objApplicationsXML = cle.SERVER.getCache().getDocument(exception.APPLICATION_CACHE_ID);
					var objSrcXML = cle.SERVER.getCache().getDocument(exception.AUTHORIZATION_CACHE_ID);
					if (objApplicationsXML != null){
						cle.LOG.trace("exception#onAuthorizationUpdate appList xml: " + objApplicationsXML.toString());
					}
					var objSrcNodes = objSrcXML.selectNodes("//record[@p9]");
					var objTargetXML = cle.SERVER.getCache().getDocument(objExceptionQueryMatrix.getXMLId());
					if (objTargetXML != null){
						var objParentNode = objTargetXML.selectSingleNode("//record[@jsxid='Applications']");
						if (objParentNode != null){
							var objChildNodes = objParentNode.selectNodes("child::record[@type='appId']");
							jsx3.$A(objChildNodes.toArray()).each(function(childNode){
								objParentNode.removeChild(childNode);
							});
							//reset the 'All Apps' record
							var allAppsRecord = objTargetXML.selectSingleNode("//record[@jsxid='AllApps']");
							if (allAppsRecord != null){
								allAppsRecord.setAttribute("jsxvalue","0");
								//objLogQueryMatrix.redrawRecord(allAppsRecord.getAttribute("jsxid"),jsx3.xml.CDF.UPDATE,true);
							}
							//add the records from the src XML
							jsx3.$A(objSrcNodes.toArray()).each(function(childNode){
								var objCloneNode = childNode.cloneNode(true);
								try{
									objCloneNode.removeAttribute("jsximg");
								}
								catch (ex){};
								objCloneNode.setAttribute("type","appId");
								objCloneNode.setAttribute("maskName","checkboxMask");
								objCloneNode.setAttribute("dataType","Checkbox");
								//find the application text using application id
								if (objApplicationsXML != null){
									var strId = objCloneNode.getAttribute("AppID");
									var appNode = objApplicationsXML.selectSingleNode("//record[@jsxid='" + strId + "']");
									if (appNode != null){
										objCloneNode.setAttribute("jsxtext",appNode.getAttribute("jsxtext"));
									}
									else {
										cle.LOG.trace("exception#onAuthorizationUpdate appID lookup not found for " + strId);
									}
								}
								objParentNode.appendChild(objCloneNode);
								cle.LOG.trace("added " + objCloneNode.toString());
							});
						}
					}
					objExceptionQueryMatrix.repaintData();
				}
			}
		};
	  exception.showColumnManager = function(objJSX) {
		  try{
				cle.LOG.trace("exception#showColumnManager");
				//TODO: persist settings across browser openings
				//TODO: check for open dialog
				var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid");
				var objMatrix = objParent.getDescendantOfName("exceptionListMatrix");
				if (objMatrix != null){
					cle.LOG.trace("found matrix: " + objMatrix.getName());
					//retrieve the column objects and create CDF
					var objColumnsList = new jsx3.util.List(objMatrix.getDescendantsOfType("jsx3.gui.Matrix.Column",true));
					//create the 'available' columns CDF
					//create the 'configured' columns CDF
					var objConfiguredColumnsCDF = new jsx3.xml.CDF.Document.newDocument();
					for (var it = objColumnsList.iterator();it.hasNext();){
						var objColumn = it.next();
						var strText = (objColumn.getText()=="&#160;")? "Image": objColumn.getText(); //the image column has a 'blank' caption
						cle.LOG.trace(objColumn.getName() + ": display=" + objColumn.getDisplay());
						var objRecord = {jsxid:objColumn.getName(),jsxtext:strText,jsxwidth:objColumn.getWidth(),jsxdisplay:(objColumn.getDisplay()==jsx3.gui.Block.DISPLAYBLOCK || typeof(objColumn.getDisplay())=="undefined")? jsx3.gui.CheckBox.CHECKED:jsx3.gui.CheckBox.UNCHECKED};
						cle.LOG.trace("inserting record in configured CDF");
						objConfiguredColumnsCDF.insertRecord(objRecord,"jsxroot",false);
					}
					//cache the available columns CDF
					cle.SERVER.getCache().setDocument("exceptionConfiguredColumns_cdf",objConfiguredColumnsCDF);
					//show the dialog
					var strURI = cle.SERVER.resolveURI("interfaces/exception/exceptionColumnManagerDialog_gui.xml");
					cle.LOG.trace("show dialog");
					var objDialog = cle.SERVER.getBodyBlock().loadAndCache(strURI,true);
					//add functionality to the dialog
					jsx3.$O(objDialog).extend({
					    getTarget: function() {
					        return objMatrix;
					    },
					    getConfigurationMatrix: function() {
					        return objDialog.getDescendantOfName("exceptionConfiguredColumnsMatrix");
					    },
					    doCancelButton: function(objJSX) {
					        //close the dialog with no changes
					    	this.doClose();
					    },
					    doApplyButton: function(objJSX) {
					        //apply the changes, remain open
					    	cle.exception.applyColumns(objDialog,objJSX);
					    	this.getTarget().repaint();
					    },
					    doCloseButton: function(objJSX) {
					        //apply the changes, close dialog
					    	cle.exception.applyColumns(objDialog,objJSX);
					    	this.getTarget().repaint();
					    	this.doClose();
					    }
					});
				}
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("exception#showColumnManager error: " + e.getMessage());
			}
	  };
		/**
		 * apply the column settings to the target Matrix
		 * @param {jsx3.gui.Dialog} The configuration dialog
		 * @param {jsx3.app.Model}  The object calling function (for context)
		 */
		exception.applyColumns = function(objDialog, objJSX) {
			//retrieve the target matrix
			var objTargetMatrix = objDialog.getTarget();
			//retrieve the configuration XML
			var objMatrix = objDialog.getConfigurationMatrix();
			//wrap the CDF
			var objCDF = jsx3.xml.CDF.Document.wrap(objMatrix.getXML());
			//apply changes
			jsx3.$A(objCDF.getRecordIds()).each(function(colName){
				var objRecord = objMatrix.getRecord(colName);
				var objColumn = objTargetMatrix.getChild(colName);
				objColumn.setDisplay((objRecord.jsxdisplay==jsx3.gui.CheckBox.CHECKED)? jsx3.gui.Block.DISPLAYBLOCK: jsx3.gui.Block.DISPLAYNONE);
				objColumn.setWidth(objRecord.jsxwidth,false);
			});
			return;
		};
	  exception.onExceptionFault = function(objEvent) {
			try {
				switch (objEvent.code) {
				case "no value":
				case "CMN-01":
				case "LOG-01":
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
				cle.LOG.error("exception#onExceptionFault error: " + e.getMessage());
			}
	  };
	  exception.enableApp = function(objMatrix,strRecordId,bEnable) {
			try {
				var objRecordNode = objMatrix.getRecordNode(strRecordId);
				objRecordNode.setAttribute("jsxvalue",bEnable);

				objMatrix.redrawRecord(strRecordId,jsx3.xml.CDF.UPDATE);
				exception.queryFieldChange(objMatrix);
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("exception#enableApp error: " + e.getMessage());
			}
		};
	  exception.enableAllApps = function(objMatrix,bEnable) {
		try {
			cle.LOG.trace("exception#enableAllApps");
			var objRecordNodes = objMatrix.getXML().selectNodes("//record[@type='appId']");
			for (var it = objRecordNodes.iterator();it.hasNext();){
				it.next().setAttribute("jsxvalue",bEnable);
			}
			objMatrix.repaintData();
			exception.queryFieldChange(objMatrix);
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("exception#enableAllApps error: " + e.getMessage());
		}
	  };
	  /**
	   * when the query field changes, notify listeners
	   * @param {jsx3.gui.Matrix}
	   */
	  exception.queryFieldChange = function(objMatrix) {
		  try {
			  cle.LOG.trace("exception#queryFieldChange");
			  cle.SERVER.publish({subject:'exceptionQueryFieldChange',target: objMatrix});
		  } catch (e) {
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#queryFieldChange error: " + e.getMessage());
		  }
	  };
	  /**
	   * handle query field change event
	   */
	  exception.onQueryFieldChange = function(objEvent) {
		  try {
			  cle.LOG.trace("exception#onQueryFieldChange");
			  var objMatrix = objEvent.target;
			  var objParent = objMatrix.getAncestorOfType("jsx3.gui.LayoutGrid");
			  if (objParent != null){
				  //enable the search button
				  var objSearchButton = objParent.getDescendantOfName("exceptionSearchBtn",true,false);
				  if (objSearchButton != null){
					  //test if at least one application id is marked
					  objSearchButton.setEnabled((exception.hasApplicationId(objMatrix))? jsx3.gui.Form.STATEENABLED: jsx3.gui.Form.STATEDISABLED,true);
				  }
			  }
		  } catch (e) {
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#onQueryFieldChange error: " + e.getMessage());
		  }
	  };
	  exception.hasApplicationId = function(objMatrix) {
			try {
				cle.LOG.trace("exception#hasApplicationId");
				var objRecords = objMatrix.getXML().selectNodes("//record[@jsxid='Applications']/child::record[@jsxvalue='1']");
				return objRecords.size()>0;
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("exception#hasApplicationId error: " + e.getMessage());
			}
		};
	  exception.setTimeframe = function(objMatrix, strRecordId){
			try {
				cle.LOG.trace("exception#setTimeframe");
				var objRecordNode = objMatrix.getRecordNode(strRecordId);
				var strValue = objRecordNode.getAttribute("jsxvalue");
				//find the child record that has the same value
				var objChildNode = objRecordNode.selectSingleNode("child::*[@jsxtext='" + strValue + "']");
				var strChiildId = objChildNode.getAttribute("jsxid");
				/*
				<enum jsxid="pastTenMinutes" jsxtext="Past 10 minutes"/>
				<enum jsxid="pastThirtyMinutes" jsxtext="Past 30 minutes"/>
				<enum jsxid="pastHour" jsxtext="Past hour"/>
				<enum jsxid="pastSixHours" jsxtext="Past 6 hours"/>
				<enum jsxid="pastTwelveHours" jsxtext="Past 12 hours"/>
				<enum jsxid="pastDay" jsxtext="Past day"/>
				<enum jsxid="pastTwoDays" jsxtext="Past 2 days"/>
				<enum jsxid="pastWeek" jsxtext="Past week"/>
				<enum jsxid="pastTwoWeeks" jsxtext="Past 2 weeks"/>
				 */
				var dTo = new Date();
				var dFrom = new Date();
				switch (strChiildId){
				case "pastTenMinutes":
					dFrom.setMinutes(dTo.getMinutes()-10);
					break;
				case "pastThirtyMinutes":
					dFrom.setMinutes(dTo.getMinutes()-30);
					break;
				case "pastHour":
					dFrom.setHours(dTo.getHours()-1);
					break;
				case "pastSixHours":
					dFrom.setHours(dTo.getHours()-6);
					break;
				case "pastTwelveHours":
					dFrom.setHours(dTo.getHours()-12);
					break;
				case "pastDay":
					dFrom.setHours(dTo.getHours()-24);
					break;
				case "pastTwoDays":
					dFrom.setHours(dTo.getHours()-48);
					break;
				case "pastWeek":
					dFrom.setHours(dTo.getHours()-168);
					break;
				case "pastTwoWeeks":
					dFrom.setHours(dTo.getHours()-336);
					break;
				}
		        var df = new jsx3.util.DateFormat("yyyy-MM-dd HH:mm:ss");
		        //build 'from' timestamp
		        var objFromTimestamp = objMatrix.getRecordNode("fromTimestamp");
		        objFromTimestamp.setAttribute("jsxvalue", df.format(dFrom));
		        objMatrix.redrawRecord("fromTimestamp",jsx3.xml.CDF.UPDATE);
		        //build 'to' timestamp
		        var objToTimestamp = objMatrix.getRecordNode("toTimestamp");
		        objToTimestamp.setAttribute("jsxvalue", df.format(dTo));
		        objMatrix.redrawRecord("toTimestamp",jsx3.xml.CDF.UPDATE);
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("exception#setTimeframe error: " + e.getMessage());
			}
	  };
	  exception.formatCellForDate = function(objGUI, strRecordId, objMatrix, objColumn, intRowNumber, objServer) {
		try{
			 var objRecordNode = objMatrix.getRecordNode(strRecordId);
			 var strPath = objColumn.getPath();
		     var strValue = objRecordNode.getAttribute(strPath);
		     var pattern = new RegExp("T");
		     if (pattern.test(strValue)==true){
		         objGUI.innerHTML = cle.utils.makeDateFromString(strValue);
		     }
		} catch (e){
		   e = jsx3.lang.NativeError.wrap(e);
		   cle.LOG.error("exception#formatCellForDate error: " + e.getMessage());
		}
	  };
	  /**
	   * change the splitter from vertical to horizontal to vertical
	   */
	  exception.flipOrientation = function(objMenu,strRecordId) {
		  try {
			  cle.LOG.trace("exception#flipOrientation");
			  var objSplitter = objMenu.getAncestorOfName("exceptionListSplitter");
			  if (objSplitter != null){
				  var isHorizontal = (objSplitter.getOrientation()== jsx3.gui.Splitter.ORIENTATIONH);
				  objSplitter.setOrientation((isHorizontal)? jsx3.gui.Splitter.ORIENTATIONV: jsx3.gui.Splitter.ORIENTATIONH);
				  objSplitter.recalcBox();
				  objSplitter.repaint();
				  objMenu.insertRecordProperty(strRecordId, 'jsximg',(isHorizontal)? 'images/icons/splitter-side.gif': 'images/icons/splitter-over.gif', true);
			  }
		  } catch (e) {
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#flipOrientation error: " + e.getMessage());
		  }
		};
	  exception.queryExceptions = function(objJSX){
        try{
			cle.LOG.trace("exception#queryExceptions");
			var objParent = objJSX.getAncestorOfType("jsx3.gui.Splitter");
			cle.LOG.trace("parent: " + objParent.getName());
			var objChildren = objParent.findDescendants(function(descendant){return (descendant.instanceOf(jsx3.gui.Matrix));}, true, true, false, false);
			if (objChildren.length > 0){
				//TODO: determine the children better
				var objQueryMatrix = objChildren[0];
				var objListMatrix = objChildren[1];
				objJSX.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
				//reset and show the mask
				cle.utils.hideMask(objListMatrix.getParent());
				cle.utils.showMask(objListMatrix.getParent(),cle.utils.getProperty("m_retrievingRecords"), true);
				var strXMLCacheId = objQueryMatrix.getXMLId();
				//call the service passing the cache id
				var rv = exception.retrieveExceptionListOp(strXMLCacheId);
				rv.when(function(response){
					if (response.status){
						objJSX.setEnabled(jsx3.gui.Form.STATEENABLED,true);
						exception.resetButtons();
						cle.utils.hideMask(objListMatrix.getParent());
						cle.SERVER.getCache().clearById("exceptionDetails_cdf");
						var objDetailsMatrix = cle.SERVER.getJSXByName("exceptionDetailsMatrix");
						if (objDetailsMatrix != null)
							objDetailsMatrix.repaintData();
						var objStacktracePane = cle.SERVER.getJSXByName("exceptionStacktracePane");
						if (objStacktracePane != null)
							objStacktracePane.setText("").repaint();
						var objTransactionPane = cle.SERVER.getJSXByName("exceptionTransactionPane");
						if (objTransactionPane != null){
							objTransactionPane.setText("");
							objTransactionPane.removeChildren();
						}
						var objTransactionAfterResolvePane = cle.SERVER.getJSXByName("exceptionTransactionAfterResolvePane");
						if (objTransactionAfterResolvePane != null){
							objTransactionAfterResolvePane.setText("");
							objTransactionAfterResolvePane.removeChildren();
						}
						cle.LOG.trace('exception#queryExceptions completed: ' + response.status);
					}
					else{
						cle.utils.hideMask(objListMatrix.getParent());
					}
				});
			}
        } catch (e){
	           e = jsx3.lang.NativeError.wrap(e);
	           cle.LOG.error("exception#queryExceptions error: " + e.getMessage());
	    }
	  };
	  exception.setExceptionSelection = function(objMatrix){
		  try{
			  exception.resetButtons();
			  //publish request for exception details retrieval
			  var aSelections = objMatrix.getSelectedIds();
			  //TODO: check for valid selection type -- recordType? 
			  var objMessage = {subject:"selectExceptionList",target: objMatrix, list: aSelections};
			  cle.SERVER.publish(objMessage);
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#setExceptionSelection error: " + e.getMessage());
		  }
	  };
	  exception.onSelectException = function(objEvent){
		  try{
			  cle.LOG.trace("exception#onSelectException");
			  var objMatrix = objEvent.target;
			  var objFirstRecord = objMatrix.getRecord(objEvent.list[0]);
			  if (objFirstRecord){
				  var strAppId = objFirstRecord.APPLICATIONID;
				  if (!jsx3.util.strEmpty(strAppId)){
					  exception.enableResolveButton(strAppId);
					  exception.enableSuppressButton(strAppId);
					  exception.enableDeleteButton(strAppId);
				  }
			  }
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#onSelectException error: " + e.getMessage());
		  }
	  };
	  exception.resetButtons = function(){
		  try{
			  cle.LOG.trace("exception#resetButtons");
			  exception.disableResolveButton();
			  exception.disableSuppressButton();
			  exception.disableDeleteButton();
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#resetButtons error: " + e.getMessage());
		  }
	  };
	  exception.validateResolutionDescription = function(){
		  try{
			  cle.LOG.trace("exception#validateResolutionDescription");
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#validateResolutionDescription error: " + e.getMessage());
		  }
	  };
	  exception.cancelResolveSelectedExceptions = function(objButton){
		  try{
			  //TODO: add confirmation warning
			  var objDialog = objButton.getAncestorOfType(jsx3.gui.Dialog);
			  var strAppId = objDialog.getApplicationId();
			  exception.enableResolveButton(strAppId);
			  objDialog.doClose();
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#cancelResolveSelectedExceptions error: " + e.getMessage());
		  }
	  };
	  exception.deleteSelectedExceptions = function(objButton){
		  try{
			  cle.LOG.trace("exception#deleteSelectedExceptions");

			  var strTitle = cle.utils.getProperty("m_confirmCaption");
			  var strMessage = cle.utils.getProperty("exception_deleteMessage");
			  var strOk = cle.utils.getProperty("m_ok");
			  var strCancel = cle.utils.getProperty("m_cancel");
			  var initBtnDefault = 2; //CANCEL
			  //parameters may include fields 'width' {int}, 'height' {int}, 'noTitle' {boolean}, and 'nonModal' {boolean}.
			  var objParams = {width: 260, height: 160, noTitle: false, nonModal: false};
			  var objDialog = cle.SERVER.confirm(
					  //caption title
					  strTitle,
					  //message to display
					  strMessage,
					  //fctOnOk
					  function(objDialog){
						  var objParent = objButton.getAncestorOfType("jsx3.gui.LayoutGrid");
						  if (objParent != null){
							  //get the Matrix
							  var objMatrix = objParent.getDescendantOfName("exceptionListMatrix",true,false);
							  //get the selected records
							  if (objMatrix != null){
								  var objFilteredNodes;
								  var objSelectedNodes = objMatrix.getSelectedNodes();
								  if (objSelectedNodes.size()>0){
									  objFilteredNodes = objSelectedNodes.filter(function(node){
										  //local function to only return the nodes with attribute 'recordType' set to exception
										  return (node.getAttribute('recordType') == 'exception');
									  });
								  }
								  if (objFilteredNodes.size() > 0) {
									  //map from nodes to id array
									  var selectedIds = objFilteredNodes.map(function(e) { return e.getAttribute('EXCEPTIONID'); });
									  if (selectedIds){
										  var objXML = new jsx3.xml.CDF.Document.newDocument();
										  jsx3.$A(selectedIds.toArray()).each(function(id){
											  objXML.insertRecord({jsxid:id});
										  });
										  //store document in local cache
										  var strCacheId = "deleteExceptionList_" + jsx3.xml.CDF.getKey();
										  cle.SERVER.getCache().setDocument(strCacheId, objXML);
										  var rv = exception.deleteExceptionsOp(strCacheId);
										  rv.when(function(response){
											  if (response.status){
												  //retrieve new list or delete records from matrix?  Here is the delete
												  jsx3.$A(objFilteredNodes.toArray()).each(function(record){
													  objMatrix.deleteRecord(record.getAttribute("jsxid"),false);
												  });
												  objMatrix.repaintData();
												  exception.resetButtons();
												  cle.SERVER.getCache().clearById(strCacheId);
											  }
											  //TODO: handle !true response
										  });
									  }
									  else {
										  cle.LOG.warn("exception#deleteSelectedExceptions no exceptions selected.");
									  }
								  }
								  else {
									  //TODO: notify user of nothing selected
								  }
							  }
						  }
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
			  ); //end confirm dialog
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#deleteSelectedExceptions error: " + e.getMessage());
		  }
	  };
	  exception.resolveSelectedExceptions = function(objButton){
		  try{
			  var objParent = objButton.getAncestorOfType("jsx3.gui.Dialog");
			  if (objParent != null){
				  var objResolutionDescription = objParent.getDescendantOfName("resolutionDescription", true, false);
				  if (objResolutionDescription != null){
					  var strResolutionDescription = objResolutionDescription.getValue();
					  if (jsx3.util.strEmpty(strResolutionDescription)){
						  //TODO: throw validation exception
					  }
					  var exceptionIds = objParent.getSelectedIds();
					  cle.LOG.trace("exceptionIds raw: " + exceptionIds);
					  cle.LOG.trace("exceptionIds to array to string: " + exceptionIds.toArray().toString());

					  //format outbound service call
					  var strStatusResolved = cle.utils.getProperty("exception_statusResolved");
					  var objXML = new jsx3.xml.Document().loadXML('<resolution><description>'+ strResolutionDescription + '</description><status>' + strStatusResolved + '</status><exceptions></exceptions></resolution>');
					  var objExceptionsNode = objXML.selectSingleNode("//exceptions");
					  if (objExceptionsNode != null && exceptionIds){
						  jsx3.$A(exceptionIds.toArray()).each(function(id){
							  cle.LOG.trace("exception id: " + id);
							  var node = objExceptionsNode.createNode(jsx3.xml.Entity.TYPEELEMENT,'exception');
							  node.setAttribute("id",id);
							  objExceptionsNode.appendChild(node);
						  });
						  if (objParent.getIsDirty()==true){
							  var transactionNode = objExceptionsNode.createNode(jsx3.xml.Entity.TYPEELEMENT,'transaction');
							  var objRootNode = objXML.getRootNode();
							  //jsxcodeeditor
							  var objEditor = objParent.getDescendantOfName('jsxcodeeditor',true,false);
							  if (objEditor != null){
								  var strXML = objEditor.getTextValue();
								  transactionNode.setValue(strXML);
								  objRootNode.appendChild(transactionNode);
							  }
						  }
					  }
					  var strCacheId = 'resolution_' + jsx3.xml.CDF.getKey();
					  cle.SERVER.getCache().setDocument(strCacheId, objXML);
					  var rv = exception.resolveExceptionsOp(strCacheId);
					  rv.when(function(response){
						  if (response.status) {
							  //remove cache entry
							  //cle.SERVER.getCache().clearById(strCacheId);
							  exception.resetButtons();
							  objParent.doClose();
						  }
						  //TODO: handle response for !true result
					  });
				  }
			  }
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#resolveSelectedExceptions error: " + e.getMessage());
		  }
	  };
	  exception.showSelectedExceptionsSpy = function(objJSX){
		  try{
			  var strTableHeader = cle.utils.getProperty("exception_tableHeader");
			  //TODO: add css classes for table and td
			  var strHTML = '<div><table style="width:260px;font-size:10px;"><tr><td>' + strTableHeader + '</td></tr>';
			  var selectedIds = objJSX.getAncestorOfType("jsx3.gui.Dialog").getSelectedIds();
			  jsx3.$A(selectedIds.toArray()).each(function (id){
				  strHTML += '<tr><td style="padding:2px 2px 2px 4px;">' + id + '</td></tr>';
			  });
			  strHTML += '</table></div>';
			  return strHTML;
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#resolveSelectedExceptions error: " + e.getMessage());
		  }
	  };
	  exception.enableResolveExceptionsButton = function(objJSX){
		  try{
			  var objParent = objJSX.getAncestorOfType("jsx3.gui.Dialog");
			  if (objParent != null){
				  var objButton = objParent.getDescendantOfName("resolveBtn",true,false);
				  if (objButton != null){
					  objButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
				  }
			  }
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#enableResolveExceptionsButton error: " + e.getMessage());
		  }
	  };
	  exception.disableResolveExceptionsButton = function(objJSX){
		  try{
			  var objParent = objJSX.getAncestorOfType("jsx3.gui.Dialog");
			  if (objParent != null){
				  var objButton = objParent.getDescendantOfName("resolveBtn",true,false);
				  if (objButton != null){
					  objButton.setEnabled(jsx3.gui.Form.STATEEDISABLED,true);
				  }
			  }
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#disableResolveExceptionsButton error: " + e.getMessage());
		  }
	  };
	  exception.showResolveExceptionsUI = function(objButton){
		  try{
			  cle.LOG.trace("exception#showResolveExceptionsUI");
			  exception.disableResolveButton();
			  //get the common parent from the button's context
			  var objParent = objButton.getAncestorOfType("jsx3.gui.LayoutGrid");
			  if (objParent != null){
				  //get the Matrix
				  var objMatrix = objParent.getDescendantOfName("exceptionListMatrix",true,false);
				  //get the selected records
				  if (objMatrix != null){
					  var objFilteredNodes;
					  var objSelectedNodes = objMatrix.getSelectedNodes();
					  if (objSelectedNodes.size()>0){
						  objFilteredNodes = objSelectedNodes.filter(function(node){
							  //local function to only return the nodes with attribute 'recordType' set to exception
							  return (node.getAttribute('recordType') == 'exception');
						  });
					  }
					  if (objFilteredNodes.size() > 0) {
						  //map from nodes to id array
						  var selectedIds = objFilteredNodes.map(function(e) { return e.getAttribute('EXCEPTIONID'); });
						  cle.LOG.trace("selected ids: " + selectedIds.toString());
						  //show the resolve form
						  var strURI = cle.SERVER.resolveURI("interfaces/exception/resolveExceptionsDialog_gui.xml");
						  var objParent = cle.SERVER.getBodyBlock();
						  var objDialog = objParent.loadAndCache(strURI,false);
						  //extend the dialog methods to include retrieval of selected ids
						  jsx3.$O(objDialog).extend({
							  getSelectedIds: function(){
								  return selectedIds;
							  }
						  });
						  //extend the dialog methods to indicate if dialog has transaction edits
						  jsx3.$O(objDialog).extend({
							  setIsDirty: function(bHasEdits){
								  objDialog._isDirty = bHasEdits;
							  }
						  });
						  jsx3.$O(objDialog).extend({
							  getIsDirty: function(){
								  return objDialog._isDirty;
							  }
						  });
						  //TODO: determine if user has 'transaction edit' privilege for all selected ids
						  //note: not sure how to handle selections from multiple application ids
						  var firstSelectedNode = objFilteredNodes.get(0);
						  cle.LOG.debug('objFilteredNodes[0]: ' + firstSelectedNode.toString());
						  var firstAppId = firstSelectedNode.getAttribute("APPLICATIONID");
						  cle.LOG.debug('firstAppId: ' + firstAppId);
						  jsx3.$O(objDialog).extend({
							  getApplicationId: function(){
								  return firstAppId;
							  }
						  });
						  var hasEditTransactionPrivilege = cle.privileges.getPrivilegesById(firstAppId).hasPrivilege(cle.Privilege.EDIT_TRANSACTIONS);
						  cle.LOG.debug('get edit transaction privilege: ' + hasEditTransactionPrivilege);
						  if (hasEditTransactionPrivilege == jsx3.Boolean.TRUE){
							  //load 'transaction' tab
							  var objTabbedPane = objDialog.getDescendantOfName("tabbedpane",true,false);
							  if (objTabbedPane != null){
								  var strTabURI = cle.SERVER.resolveURI("interfaces/exception/transactionTab_gui.xml");
								  var objTransactionTab = objTabbedPane.loadAndCache(strTabURI,false);
								  /*
								  var objEditTransactionButton = objTransactionTab.getDescendantOfName('editTransactionBtn',true,false);
								  if (objEditTransactionButton != null){
									  objEditTransactionButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
								  }
								  */
								  //get the transaction data for the first selected node
								  var strExceptionId = selectedIds.toArray()[0];
								  //the following name must be coordinated with the 'retrieveTransactionDetails' method
								  var strTransactionCacheId = strExceptionId + "_transaction_xml";
								  var rv = exception.retrieveTransactionDetailsNoRendering(strExceptionId);
								  rv.when(function(response){
									  if (response.status){
										  var objTransactionXML = cle.SERVER.getCache().getDocument(strTransactionCacheId);
										  var objBlockX = objDialog.getDescendantOfName("transactionBlockX",true,false);
										  if (objBlockX != null){
											  objBlockX.setSourceXML(objTransactionXML);
											  //remove original XML from cache
											  cle.SERVER.getCache().clearById(strTransactionCacheId);
										  }
									  }
									  else {
										  //TODO: handle !true status
									  }
								  });
							  }
						  }
						  //set the infomation area with the ids of the selected exceptions to resolve
						  //set dialog window to mask other activities while open (modal)
						  objDialog.setModal(jsx3.gui.Dialog.MODAL); //or jsx3.gui.Dialog.NONMODAL
						  //TODO: position dialog
						  var objReference = objParent.getDescendantOfName("exceptionListMatrix",true,false);
						  if (objReference != null){
							  //set the dialog 50px over and down from the top left corner of the exception list
							  var objPosition = objReference.getAbsolutePosition();
							  objDialog.setLeft(objPosition.L + 50,false);
							  objDialog.setTop(objPosition.T + 50,false);
							  objDialog.setWidth(objPosition.W - 150,false);
							  objDialog.setHeight(objPosition.H - 150,false);
						  }
						  objParent.paintChild(objDialog);
						  var objResolutionDescription = objDialog.getDescendantOfName("resolutionDescription", true, false);
						  if (objResolutionDescription != null){
							  jsx3.sleep(function(){
								  objResolutionDescription.focus();
							  });
						  }
					  }
					  else {
						  //TODO: notify user of nothing selected
					  }
					  
				  }
			  }
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#showResolveExceptionsUI error: " + e.getMessage());
		  }
	  };
	  exception.suppressSelectedExceptions = function(objButton){
		  try{
			  cle.LOG.trace("exception#suppressSelectedExceptions");
			  exception.disableSuppressButton();
			  var strTitle = cle.utils.getProperty("m_confirmCaption");
			  var strMessage = cle.utils.getProperty("exception_suppressMessage");
			  var strOk = cle.utils.getProperty("m_ok");
			  var strCancel = cle.utils.getProperty("m_cancel");
			  var initBtnDefault = 2; //CANCEL
			  //parameters may include fields 'width' {int}, 'height' {int}, 'noTitle' {boolean}, and 'nonModal' {boolean}.
			  var objParams = {width: 260, height: 160, noTitle: false, nonModal: false};
			  var objDialog = cle.SERVER.confirm(
					  //caption title
					  strTitle,
					  //message to display
					  strMessage,
					  //fctOnOk
					  function(objDialog){
						  var objParent = objButton.getAncestorOfType("jsx3.gui.LayoutGrid");
						  if (objParent != null){
							  //find list of selected exceptions
							  var objMatrix = objParent.getDescendantOfName("exceptionListMatrix",true, false);
							  var exceptionIds = objMatrix.getSelectedIds();
							  cle.LOG.trace("exceptionIds: " + exceptionIds);

							  //format XML that will be transformed by service invocation method
							  var strStatusSuppressed = cle.utils.getProperty("exception_statusSuppressed");
							  var objXML = new jsx3.xml.Document().loadXML('<resolution><description>'+ strStatusSuppressed + '</description><status>' + strStatusSuppressed + '</status><exceptions></exceptions></resolution>');
							  var objExceptionsNode = objXML.selectSingleNode("//exceptions");
							  if (objExceptionsNode != null && exceptionIds){
								  jsx3.$A(exceptionIds).each(function(id){
									  cle.LOG.trace("exception id: " + id);
									  var node = objExceptionsNode.createNode(jsx3.xml.Entity.TYPEELEMENT,'exception');
									  node.setAttribute("id",id);
									  objExceptionsNode.appendChild(node);
								  });
							  }
							  var strCacheId = 'suppressed_' + jsx3.xml.CDF.getKey();
							  cle.SERVER.getCache().setDocument(strCacheId, objXML);
							  var rv = exception.resolveExceptionsOp(strCacheId);
							  rv.when(function(response){
								  if (response.status){
									  //remove cache entry
									  cle.SERVER.getCache().clearById(strCacheId);
									  //TODO: remove record?
								  }
								  //TODO: handle !true response
							  });
						  }
						  objDialog.doClose();
					  },
					  //fctOnCancel
					  function(objDialog){
						  exception.enableSuppressButton();
						  objDialog.doClose();
					  },
					  strOk,
					  strCancel,
					  initBtnDefault,
					  //fctOnNo
					  null,
					  null,
					  objParams
			  ); //end confirm dialog
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#suppressSelectedExceptions error: " + e.getMessage());
		  }
	  };
	  exception.editTransaction = function(objButton){
		  try{
			  var objDialog = objButton.getAncestorOfType('jsx3.gui.Dialog');
			  if (objDialog != null){
				  objDialog.setIsDirty(true); //assume so
			  }
			  var objLayout = objButton.getAncestorOfName('transactionLayout');
			  var strContent = '';
			  if (objLayout != null){
				  var objParent;
				  var objBlockX = objLayout.getDescendantOfName('transactionBlockX',true,false);
				  if (objBlockX != null){
					  objParent = objBlockX.getParent();
					  var objXML = objBlockX.getXML();
					  strContent = objXML.toString();
					  objParent.removeChildren();

					  //the addin named 'editor' started, but the 'code.editor' plugin may not have loaded
					  var cePI = cle_Editors.getEngine().getPlugIn("code.editor");
					  if (cePI) {
						  cePI.load().when(jsx3.$F(function() {
							  //get the resource for the 'code_editor_xml' UI
							  var rsrc = cePI.getResource("code_editor_xml");
							  rsrc.load().when(function() {
								  //var objEditor = cePI._currentEditor = cePI.loadRsrcComponent(rsrc, XsltEditor);
								  var objEditor = cePI.loadRsrcComponent(rsrc, objParent);
								  objEditor.initAsType("xml");
								  objEditor.setTextValue(strContent);
								  //TODO: set the scroll bar to top position
								  //use placeCursorAtStart or jsx3.html.scrollIntoView(objGUI : HTMLElement, objRoot : HTMLElement, intPaddingX : int, intPaddingY : int)
								  var objEditButton = objParent.getDescendantOfName('editTransactionBtn',true,false);
								  if (objEditButton){
									  objEditButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
								  }
							  });
						  }).bind(this));
					  }
				  }
			  }
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#editTransaction error: " + e.getMessage());
		  }
	  };
	  exception.enableResolveButton = function(strAppId){
		  try{
			  var objButton = cle.SERVER.getJSXByName("exceptionResolveSelectedBtn");
			  if (objButton != null){
				  //get privilege to resolve exception for this application
				  var hasResolveExceptionPrivilege = cle.privileges.getPrivilegesById(strAppId).hasPrivilege(cle.Privilege.RESOLVE_EXCEPTIONS);
				  cle.LOG.debug('has resolve exception privilege: ' + hasResolveExceptionPrivilege);
				  if (hasResolveExceptionPrivilege == jsx3.Boolean.TRUE){
					  objButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
				  }
			  }
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#enableResolveButton error: " + e.getMessage());
		  }
	  };
	  exception.disableResolveButton = function(){
		  try{
			  var objButton = cle.SERVER.getJSXByName("exceptionResolveSelectedBtn");
			  if (objButton != null){
				  objButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
			  }
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#disableResolveButton error: " + e.getMessage());
		  }
	  };
	  exception.enableSuppressButton = function(strAppId){
		  try{
			  var objButton = cle.SERVER.getJSXByName("exceptionSuppressSelectedBtn");
			  if (objButton != null){
				  //get privilege to resolve exception for this application
				  var hasResolveExceptionPrivilege = cle.privileges.getPrivilegesById(strAppId).hasPrivilege(cle.Privilege.RESOLVE_EXCEPTIONS);
				  cle.LOG.debug('has suppress (resolve) exception privilege: ' + hasResolveExceptionPrivilege);
				  if (hasResolveExceptionPrivilege == jsx3.Boolean.TRUE){
					  objButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
				  }
			  }
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#enableSuppressButton error: " + e.getMessage());
		  }
	  };
	  exception.disableSuppressButton = function(){
		  try{
			  var objButton = cle.SERVER.getJSXByName("exceptionSuppressSelectedBtn");
			  if (objButton != null){
				  objButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
			  }
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#disableSuppressButton error: " + e.getMessage());
		  }
	  };
	  exception.enableDeleteButton = function(strAppId){
		  try{
			  var objButton = cle.SERVER.getJSXByName("exceptionDeleteSelectedBtn",true,false);
			  //get privilege to resolve exception for this application
			  var hasDeleteExceptionPrivilege = cle.privileges.getPrivilegesById(strAppId).hasPrivilege(cle.Privilege.DELETE_EXCEPTIONS);
			  cle.LOG.debug('has delete exception privilege: ' + hasDeleteExceptionPrivilege);
			  if (hasDeleteExceptionPrivilege == jsx3.Boolean.TRUE){
				  objButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
			  }
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#enableDeleteButton error: " + e.getMessage());
		  }
	  };
	  exception.disableDeleteButton = function(){
		  try{
			  var objButton = cle.SERVER.getJSXByName("exceptionDeleteSelectedBtn",true,false);
			  if (objButton != null){
				  objButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
			  }
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#disableDeleteButton error: " + e.getMessage());
		  }
	  };
	  exception.getExceptionDetails = function(objMatrix, strRecordId){
		  try{
			  var objRecord = objMatrix.getRecord(strRecordId);
			  //publish only if the record type is for an exception
			  if (objRecord.recordType == "exception"){
				  //publish request for exception details retrieval
				  var objMessage = {subject:"requestExceptionDetails",recordId: strRecordId};
				  cle.SERVER.publish(objMessage);
			  }
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#getExceptionDetails error: " + e.getMessage());
		  }
	  };
	  exception.onGetExceptionDetails = function(objEvent){
		  try{
			  cle.LOG.trace("exception#onGetExceptionDetails");
			  var strId = objEvent.recordId;
			  var objExceptionInfoPane = cle.SERVER.getJSXByName("exceptionActionsPane");
			  if (objExceptionInfoPane != null){
				  var strMessage = cle.utils.getProperty("m_loadingData");
				  cle.utils.showMask(objExceptionInfoPane,strMessage, false, 8);  //custom
			  }
			  var rv = exception.retrieveExceptionDetailOp(strId);
			  rv.when(function(response){
				  cle.utils.hideMask(objExceptionInfoPane);
				  if (response.status){
					  var objMatrix = cle.SERVER.getJSXByName("exceptionDetailsMatrix");
					  var objXML = objMatrix.getXML();
					  var objParentNode = objXML.selectSingleNode("//record[@jsxid='" + strId + "']");
					  var objStacktraceNode = objParentNode.selectSingleNode("child::record[@jsxid='Stacktrace']");
					  if (objStacktraceNode != null){
						  var objStacktracePane = cle.SERVER.getJSXByName("exceptionStacktracePane");
						  if (objStacktracePane != null){
							  objStacktracePane.setText(objStacktraceNode.getAttribute("jsxvalue")).repaint();
							  objParentNode.removeChild(objStacktraceNode);
						  }
					  }
					  var objTransactionNode = objParentNode.selectSingleNode("child::record[@jsxid='Transaction']");
					  if (objTransactionNode != null){
						  var objTransactionPane = cle.SERVER.getJSXByName("exceptionTransactionPane");
						  if (objTransactionPane != null){
							  objTransactionPane.removeChildren();
							  var strTransactionData = objTransactionNode.getAttribute("jsxvalue");
							  cle.LOG.trace("exception#onGetExceptionDetails transaction data: " + strTransactionData);
							  var xmlPattern = new RegExp(/^\<\?xml/);
							  var htmlPattern = new RegExp(/^\<html/);
							  if (xmlPattern.test(strTransactionData)){
								  cle.LOG.trace("exception#onGetExceptionDetails loading BlockX.");
								  objTransactionPane.setText("");
								  //create new jsx3.gui.BlockX object
								  var objBlockX = new jsx3.gui.BlockX("exceptionTransactionData",0,0,"100%","100%");
								  objTransactionPane.setChild(objBlockX,jsx3.app.Model.PERSISTNONE);
								  cle.LOG.trace("exception#onGetExceptionDetails resetXmlCacheData");
								  objBlockX.resetXmlCacheData();
								  cle.LOG.trace("exception#onGetExceptionDetails setXMLString");
								  objBlockX.setXMLString(strTransactionData);
								  objTransactionPane.paintChild(objBlockX);
							  }
							  else if (htmlPattern.test(strTransactionData)){
								  cle.LOG.trace("exception#onGetExceptionDetails creating iframe");
								  try{
									  var objIBlock = new jsx3.gui.IBlock("exceptionTransactionData",0,0,"100%","100%");
									  var objDoc = new jsx3.xml.Document().loadXML(strTransactionData);
									  var objHead = objDoc.selectSingleNode("//head");
									  var strHead = '<style type="text/css">' + ((objHead) ? objHead.getValue(): "") + '</style>';
									  objIBlock.setHead(strHead);
									  var objBody = objDoc.selectSingleNode("//body");
									  if (objBody){
										  objIBlock.setBody(objBody.toString());
									  }
									  objDoc = null;
									  objTransactionPane.setChild(objIBlock,jsx3.app.Model.PERSISTNONE);
									  objTransactionPane.repaint();
								  }
								  catch (ex){
									  ex = jsx3.NativeError.wrap(ex);
									  cle.LOG.error('exception#onGetExceptionDetails htmlPattern error: ' + ex.getMessage());
								  }
							  }
							  else {
								  var objBlock = new jsx3.gui.Block("exceptionTransactionData",0,0,"100%","100%");
								  objBlock.setText(strTransactionData.toString().replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;"));
								  objTransactionPane.setChild(objBlock,jsx3.app.Model.PERSISTNONE);
								  objTransactionPane.repaint();
							  }
							  cle.LOG.trace("exception#onGetExceptionDetails remove transaction node from parent");
							  objParentNode.removeChild(objTransactionNode);
						  }
					  }
					  var objTransactionAfterResolveNode = objParentNode.selectSingleNode("child::record[@jsxid='TransactionDataAfterResolve']");
					  if (objTransactionAfterResolveNode != null){
						  var objTransactionPane = cle.SERVER.getJSXByName("exceptionTransactionAfterResolvePane");
						  if (objTransactionPane != null){
							  objTransactionPane.removeChildren();
							  var strTransactionData = objTransactionAfterResolveNode.getAttribute("jsxvalue");
							  cle.LOG.trace("exception#onGetExceptionDetails transaction data: " + strTransactionData);
							  var xmlPattern = new RegExp(/^\<\?xml/);
							  var htmlPattern = new RegExp(/^\<html/);
							  if (xmlPattern.test(strTransactionData)){
								  cle.LOG.trace("exception#onGetExceptionDetails loading BlockX.");
								  objTransactionPane.setText("");
								  //create new jsx3.gui.BlockX object
								  var objBlockX = new jsx3.gui.BlockX("exceptionTransactionAfterResolveData",0,0,"100%","100%");
								  objTransactionPane.setChild(objBlockX,jsx3.app.Model.PERSISTNONE);
								  cle.LOG.trace("exception#onGetExceptionDetails afteResolve resetXmlCacheData");
								  objBlockX.resetXmlCacheData();
								  cle.LOG.trace("exception#onGetExceptionDetails afterResolve setXMLString");
								  objBlockX.setXMLString(strTransactionData);
								  objTransactionPane.paintChild(objBlockX);
							  }
							  else if (htmlPattern.test(strTransactionData)){
								  cle.LOG.trace("exception#onGetExceptionDetails afterResolve creating iframe");
								  try{
									  var objBlock = new jsx3.gui.IBlock("exceptionTransactionAfterResolveData",0,0,"100%","100%");
									  var objDoc = new jsx3.xml.Document().loadXML(strTransactionData);
									  var objHead = objDoc.selectSingleNode("//head");
									  var strHead = '<style type="text/css">' + ((objHead) ? objHead.getValue(): "") + '</style>';
									  objBlock.setHead(strHead);
									  var objBody = objDoc.selectSingleNode("//body");
									  if (objBody){
										  objBlock.setBody(objBody.toString());
									  }
									  objDoc = null;
								  } catch (ex){
									  ex = jsx3.NativeError.wrap(ex);
									  cle.LOG.error('exception#onGetExceptionDetails aferResolve htmlPattern error: ' + ex.getMessage());
								  }
							  }
							  else {
								  var objBlock = new jsx3.gui.Block("exceptionTransactionAfterResolveData",0,0,"100%","100%");
								  objBlock.setText(strTransactionData.toString().replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;"));
								  objTransactionPane.setChild(objBlock,jsx3.app.Model.PERSISTNONE);
								  objTransactionPane.repaint();
							  }
							  cle.LOG.trace("exception#onGetExceptionDetails afterResolve remove transaction node from parent");
							  objParentNode.removeChild(objTransactionAfterResolveNode);
						  }
					  }
					  objMatrix.setRenderingContext(strId);
					  objMatrix.repaintData();
					  cle.LOG.trace('exception#onGetExceptionDetails completed: ' + response.status);
				  }
				  //TODO: handle !true response
			  });
		  } catch (e){
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("exception#onGetExceptionDetails error: " + e.getMessage());
			  //risky to do this here, but the mask needs to be removed.
			  var objExceptionInfoPane = cle.SERVER.getJSXByName("exceptionActionsPane");
			  if (objExceptionInfoPane)
				  cle.utils.hideMask(objExceptionInfoPane);
			  //TODO: report exception to user
		  }
	  };
	  exception.retrieveExceptionListOp = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("retrieveExceptionListOp_rule_xml");
			objService.setOperation("RetrieveExceptionListOp");
			objService.setEndpointURL(exception.getEndpoint());
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/exception/cdf2ExceptionListQuery.xsl");
			cle.LOG.trace("retrieving XSL: " + strXSLUrl);
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				cle.LOG.trace('exception#retrieveExceptionListOp found XSL');
				var strCacheId = cb.args()[0];
				cle.LOG.trace("retrieving " + strCacheId);
				var objXML = cle.SERVER.getCache().getDocument(strCacheId);
				//TODO: replace the OrderBy node value with the matching id of the enum (use text for the view, use id for service call)
				//get transformation XSL document
				cle.LOG.trace("transforming CDF to SOAP");
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objDoc = templateProcessor.transformToObject(objXML);
				if (objDoc != null){
					//TODO: validate at least one app id is included
					/*
					 * Note: The outbound stub document is generally used to switch to an alternate XML prototype
					 * but if the 'input' element of the WSDL is removed, then an entire document can be sent
					 * to the backend service.  If the 'input' element is not removed in the XML Mapping utility
					 * there will be 2 elements sent where the second one is empty.
					 */
					objService.setOutboundStubDocument(objDoc);
				}
			}
			else {
				cle.LOG.warn("exception#retrieveExceptionListOp XSL document at " + strXSLUrl + " has problems.");
				cb.done({status:false});
			}
	
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
					var strXSLUrl = cle.SERVER.resolveURI("interfaces/exception/exceptionList2CDF.xsl");
					var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
					if (!objXSL.hasError()){
						var templateProcessor = new jsx3.xml.Template(objXSL);               
						var objCDF = templateProcessor.transformToObject(objXML);
						//TODO: handle 'no records found' error
						//TODO: should return the document instead of writing it to cache
						cle.SERVER.getCache().setDocument(exception.LIST_CACHE_ID,objCDF);
			    		cle.LOG.trace("exception#retrieveExceptionListOp call completed");
			    		cb.done({status:true});
					}
					else {
						cle.LOG.warn("exception#retrieveExceptionListOp XSL document at " + strXSLUrl + " has problems.");
						cb.done({status:false});
					}
			});
			//inner function handler for soap fault response
		    objService.subscribe(jsx3.net.Service.ON_ERROR,
			  function(objEvent) {
		    	//get the request object status
				var strStatus = objEvent.target.getRequest().getStatus();
				var strStatusText = objEvent.target.getRequest().getStatusText();
				if (jsx3.util.strEmpty(strStatusText)){
					//try to lookup error description from LJSS
					strStatusText = cle.utils.getProperty("http-" + strStatus);
				}
				cle.LOG.warn("The service call failed. The HTTP Status code is: " + strStatus);
				var responseXML = objEvent.target.getRequest().getResponseXML();
				if (responseXML != null){
					var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
					faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
					var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
					if (objCodeNode != null){
						var strFaultCode = objCodeNode.getValue();
						cle.LOG.warn("response fault code: " + strFaultCode);
						//get fault message from ns:Message
						var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
						var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
						cle.SERVER.publish({subject:"exceptionFault",code:strFaultCode,message:strFaultMessage,src:"retrieveExceptionListOp"});
					}
				}
				else {
					cle.SERVER.publish({subject:"exceptionFault",code:strStatus,message:strStatusText});
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
		exception.retrieveExceptionDetailOp = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("retrieveExceptionDetailOp_rule_xml");
			objService.setOperation("RetrieveExceptionDetailOp");
			objService.setEndpointURL(exception.getEndpoint());
			var strExceptionId = cb.args()[0];
			if (!jsx3.util.strEmpty(strExceptionId)){
				objService.id = strExceptionId;
			}
			//TODO: report no exception id supplied
	
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
					var strXSLUrl = cle.SERVER.resolveURI("interfaces/exception/exceptionDetail2CDF.xsl");
					var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
					if (!objXSL.hasError()){
						var templateProcessor = new jsx3.xml.Template(objXSL);               
						var objCDF = templateProcessor.transformToObject(objXML);
						//TODO: handle 'no records found' error
						objCDF = jsx3.xml.CDF.Document.wrap(objCDF);
						objCDF.convertProperties(cle.SERVER.JSS, ["jsxtext","jsxtip"]);
						//TODO: should return document not write to cache
						cle.SERVER.getCache().setDocument(exception.DETAIL_CACHE_ID,objCDF);
			    		cle.LOG.trace("exception#retrieveExceptionDetailOp call completed");
			    		cb.done({status:true});
					}
					else {
						cle.LOG.warn("exception#retrieveExceptionDetailOp XSL document at " + strXSLUrl + " has problems.");
						cb.done({status:false});
					}
			});
			//inner function handler for soap fault response
		    objService.subscribe(jsx3.net.Service.ON_ERROR,
			  function(objEvent) {
		    	//get the request object status
				var strStatus = objEvent.target.getRequest().getStatus();
				var strStatusText = objEvent.target.getRequest().getStatusText();
				if (jsx3.util.strEmpty(strStatusText)){
					//try to lookup error description from LJSS
					strStatusText = cle.utils.getProperty("http-" + strStatus);
				}
				cle.LOG.warn("The service call failed. The HTTP Status code is: " + strStatus);
				var responseXML = objEvent.target.getRequest().getResponseXML();
				if (responseXML != null){
					var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
					faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
					var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
					if (objCodeNode != null){
						var strFaultCode = objCodeNode.getValue();
						cle.LOG.warn("response fault code: " + strFaultCode);
						//get fault message from ns:Message
						var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
						var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
						cle.SERVER.publish({subject:"exceptionFault",code:strFaultCode,message:strFaultMessage,src:"retrieveExceptionDetailOp"});
					}
				}
				else {
					cle.SERVER.publish({subject:"exceptionFault",code:strStatus,message:strStatusText});
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
		exception.retrieveTransactionDetails = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("retrieveExceptionDetailOp_rule_xml");
			objService.setOperation("RetrieveExceptionDetailOp");
			objService.setEndpointURL(exception.getEndpoint());
			var strExceptionId = cb.args()[0];
			if (!jsx3.util.strEmpty(strExceptionId)){
				objService.id = strExceptionId;
			}
			//TODO: report no exception id supplied
	
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
					objXML.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/ExceptionManagement" xmlns:ns1="http://www.tibco.com/CommonLE2/namespace/Public/Common/RequestHeader.xsd"');
					var objTransactionNode = objXML.selectSingleNode("//ns1:Transaction");
					if (objTransactionNode != null){
						var strTransaction = objTransactionNode.getValue();
						var objTransactionXML = new jsx3.xml.Document().loadXML(strTransaction);
						//TODO: should return document not write to cache
						cle.SERVER.getCache().setDocument(strExceptionId+"_transaction_xml", objTransactionXML);
						cb.done({status:true});
					}
					else {
						cb.done({status:false});
					}
			});
			//inner function handler for soap fault response
		    objService.subscribe(jsx3.net.Service.ON_ERROR,
			  function(objEvent) {
		    	//get the request object status
				var strStatus = objEvent.target.getRequest().getStatus();
				var strStatusText = objEvent.target.getRequest().getStatusText();
				if (jsx3.util.strEmpty(strStatusText)){
					//try to lookup error description from LJSS
					strStatusText = cle.utils.getProperty("http-" + strStatus);
				}
				cle.LOG.warn("The service call failed. The HTTP Status code is: " + strStatus);
				var responseXML = objEvent.target.getRequest().getResponseXML();
				if (responseXML != null){
					var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
					faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
					var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
					if (objCodeNode != null){
						var strFaultCode = objCodeNode.getValue();
						cle.LOG.warn("response fault code: " + strFaultCode);
						//get fault message from ns:Message
						var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
						var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
						cle.SERVER.publish({subject:"exceptionFault",code:strFaultCode,message:strFaultMessage,src:"retrieveTransactionDetails"});
					}
				}
				else {
					cle.SERVER.publish({subject:"exceptionFault",code:strStatus,message:strStatusText});
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
		exception.retrieveTransactionDetailsNoRendering = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("retrieveExceptionDetailNoRenderingOp_rule_xml");
			objService.setOperation("RetrieveExceptionDetailNoRenderingOp");
			objService.setEndpointURL(exception.getEndpoint());
			var strExceptionId = cb.args()[0];
			if (!jsx3.util.strEmpty(strExceptionId)){
				objService.id = strExceptionId;
			}
			//TODO: report no exception id supplied
	
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
					objXML.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/ExceptionManagement" xmlns:ns1="http://www.tibco.com/CommonLE2/namespace/Public/Common/RequestHeader.xsd"');
					var objTransactionNode = objXML.selectSingleNode("//ns1:Transaction");
					if (objTransactionNode != null){
						var strTransaction = objTransactionNode.getValue();
						var objTransactionXML = new jsx3.xml.Document().loadXML(strTransaction);
						//TODO: should return document not write to cache
						cle.SERVER.getCache().setDocument(strExceptionId+"_transaction_xml", objTransactionXML);
						cb.done({status:true});
					}
					else {
						cb.done({status:false});
					}
			});
			//inner function handler for soap fault response
		    objService.subscribe(jsx3.net.Service.ON_ERROR,
			  function(objEvent) {
		    	//get the request object status
				var strStatus = objEvent.target.getRequest().getStatus();
				var strStatusText = objEvent.target.getRequest().getStatusText();
				if (jsx3.util.strEmpty(strStatusText)){
					//try to lookup error description from LJSS
					strStatusText = cle.utils.getProperty("http-" + strStatus);
				}
				cle.LOG.warn("The service call failed. The HTTP Status code is: " + strStatus);
				var responseXML = objEvent.target.getRequest().getResponseXML();
				if (responseXML != null){
					var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
					faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
					var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
					if (objCodeNode != null){
						var strFaultCode = objCodeNode.getValue();
						cle.LOG.warn("response fault code: " + strFaultCode);
						//get fault message from ns:Message
						var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
						var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
						cle.SERVER.publish({subject:"exceptionFault",code:strFaultCode,message:strFaultMessage,src:"retrieveTransactionDetails"});
					}
				}
				else {
					cle.SERVER.publish({subject:"exceptionFault",code:strStatus,message:strStatusText});
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
		exception.resolveExceptionsOp = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("resolveExceptionsOp_rule_xml");
			objService.setOperation("ResolveExceptionsOp");
			objService.setEndpointURL(exception.getEndpoint());
			//TODO: check privilege before proceeding
			//SecurityManagement/GUIServices/intfACL-service.serviceagent/intfwsUpdateRoleACLEndpoint0
			var strCacheId = cb.args()[0];
			var objXML = cle.SERVER.getCache().getDocument(strCacheId);
			if (objXML == null){
				cle.LOG.warn('exception.resolveExceptionsOp target document not found.');
				cb.done({status:false});
			}
			//use XSLT to create outbound message
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/exception/xml2ExceptionResolution.xsl") ;
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objDoc = templateProcessor.transformToObject(objXML);
				if (objDoc != null){
					//TODO: validate at least one id is included
					/*
					 * Note: The outbound stub document is generally used to switch to an alternate XML prototype
					 * but if the 'input' element of the WSDL is removed, then an entire document can be sent
					 * to the backend service.  If the 'input' element is not removed in the XML Mapping utility
					 * there will be 2 elements sent where the second one is empty.
					 */
					objService.setOutboundStubDocument(objDoc);
					cle.LOG.trace('exception.resolveExceptionsOp objDoc: ' + objDoc.toString());
				}
			}
			else {
				cle.LOG.warn("exception#resolveExceptionsOp XSL document at " + strXSLUrl + " has problems.");
				cb.done({status:false});
			}

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
					cle.LOG.trace('exception.resolveExceptionsOp objXML: ' + objXML.toString());
					cb.done({status:true});
			});
			//inner function handler for soap fault response
		    objService.subscribe(jsx3.net.Service.ON_ERROR,
			  function(objEvent) {
		    	//get the request object status
				var strStatus = objEvent.target.getRequest().getStatus();
				var strStatusText = objEvent.target.getRequest().getStatusText();
				if (jsx3.util.strEmpty(strStatusText)){
					//try to lookup error description from LJSS
					strStatusText = cle.utils.getProperty("http-" + strStatus);
				}
				cle.LOG.warn("The service call failed. The HTTP Status code is: " + strStatus);
				var responseXML = objEvent.target.getRequest().getResponseXML();
				if (responseXML != null){
					var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
					faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
					var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
					if (objCodeNode != null){
						var strFaultCode = objCodeNode.getValue();
						cle.LOG.warn("response fault code: " + strFaultCode);
						//get fault message from ns:Message
						var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
						var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
						cle.SERVER.publish({subject:"exceptionFault",code:strFaultCode,message:strFaultMessage,src:"resolveExceptionsOp"});
					}
				}
				else {
					cle.SERVER.publish({subject:"exceptionFault",code:strStatus,message:strStatusText});
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
		exception.deleteExceptionsOp = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("deleteExceptionsOp_rule_xml");
			objService.setOperation("DeleteExceptionsOp");
			objService.setEndpointURL(exception.getEndpoint());
			//TODO: check privilege before proceeding
			var strCacheId = cb.args()[0];
			var objXML = cle.SERVER.getCache().getDocument(strCacheId);
			if (objXML == null){
				cle.LOG.warn('exception#deleteExceptionsOp target document not found.');
				cb.done({status:false});
			}
			//use XSLT to create outbound message
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/exception/xml2DeleteException.xsl") ;
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				var templateProcessor = new jsx3.xml.Template(objXSL);               
				var objDoc = templateProcessor.transformToObject(objXML);
				if (objDoc != null){
					//TODO: validate at least one id is included
					/*
					 * Note: The outbound stub document is generally used to switch to an alternate XML prototype
					 * but if the 'input' element of the WSDL is removed, then an entire document can be sent
					 * to the backend service.  If the 'input' element is not removed in the XML Mapping utility
					 * there will be 2 elements sent where the second one is empty.
					 */
					objService.setOutboundStubDocument(objDoc);
					cle.LOG.trace('exception#deleteExceptionsOp objDoc: ' + objDoc.toString());
				}
			}
			else {
				cle.LOG.warn("exception#deleteExceptionsOp XSL document at " + strXSLUrl + " has problems.");
				cb.done({status:false});
			}

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
					if (responseXML != null){
						//FIXME: this isn't used at this time, delete the following?
						var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());
						cle.LOG.trace('exception#deleteExceptionsOp objXML: ' + objXML.toString());
					}
					cb.done({status:true});
			});
			//inner function handler for soap fault response
		    objService.subscribe(jsx3.net.Service.ON_ERROR,
			  function(objEvent) {
		    	//get the request object status
				var strStatus = objEvent.target.getRequest().getStatus();
				var strStatusText = objEvent.target.getRequest().getStatusText();
				if (jsx3.util.strEmpty(strStatusText)){
					//try to lookup error description from LJSS
					strStatusText = cle.utils.getProperty("http-" + strStatus);
				}
				cle.LOG.warn("The service call failed. The HTTP Status code is: " + strStatus);
				var responseXML = objEvent.target.getRequest().getResponseXML();
				if (responseXML != null){
					var faultDoc = new jsx3.xml.Document().loadXML(responseXML);
					faultDoc.setSelectionNamespaces('xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="http://www.tibco.com/CommonLE2/Public/Common" xmlns:ns0="http://schemas.xmlsoap.org/soap/envelope/"');
					var objCodeNode = faultDoc.selectSingleNode("//ns:Code");
					if (objCodeNode != null){
						var strFaultCode = objCodeNode.getValue();
						cle.LOG.warn("response fault code: " + strFaultCode);
						//get fault message from ns:Message
						var objMessageNode = faultDoc.selectSingleNode("//ns:Message");
						var strFaultMessage = (objMessageNode != null)? objMessageNode.getValue(): "";
						cle.SERVER.publish({subject:"exceptionFault",code:strFaultCode,message:strFaultMessage,src:"deleteExceptionsOp"});
					}
				}
				else {
					cle.SERVER.publish({subject:"exceptionFault",code:strStatus,message:strStatusText});
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
		 * runs when user is logging off
		 */
		exception.onUnloadApplication = function(objEvent) {
			try {
				cle.LOG.trace("exception#onUnloadApplication");
				var objCache = cle.SERVER.getCache();
				objCache.clearById("exceptionCriteria_cdf_xml");
				objCache.clearById("exceptionList_cdf");
				objCache.clearById("exceptionDetails_cdf");
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("exception#onUnloadApplication error: " + e.getMessage());
			}
		};
});
//do subscriptions on load
cle.exception.setSubscriptions();
