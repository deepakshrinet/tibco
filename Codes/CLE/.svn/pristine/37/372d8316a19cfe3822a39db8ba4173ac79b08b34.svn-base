jsx3.require("jsx3.gui.BlockX");

jsx3.lang.Package.definePackage("cle.log",
  function(log) {
	  
	  log.ENDPOINT_HOST = "http://localhost:9950";
	  log.ENDPOINT_URL = "/Logging/GUIServices/Retrieve_Log_service.serviceagent/intfwsRetrieve_Log_DetailEndpoint2";
	  log.TIMEOUT = 20 * 1000; //20 seconds
	  log.LOG_CRITERIA_CACHE_ID = "logCriteria_cdf_xml";
	  log.LIST_CACHE_ID = "logList_cdf";
	  log.DETAIL_CACHE_ID = "logDetails_cdf";
	  log.AUTHORIZATION_CACHE_ID = "authorization_cdf";
	  log.APPLICATION_CACHE_ID = "applicationList_cdf";

	  log.setSubscriptions = function(){
		  cle.LOG.trace("log#setSubscriptions");

		  //when service call faults are 'published' on the 'logFault' subject, this method will be invoked
		  cle.SERVER.subscribe("logFault",log.onLogFault);

		  //when the Cache file for the applicationIds is added, updated or deleted, this method will be invoked
		  cle.SERVER.getCache().subscribe(log.APPLICATION_CACHE_ID,log.onAuthorizationUpdate);

		  //when the application is asked to unload, this method will be invoked
		  cle.SERVER.subscribe("unloadApplication", log.onUnloadApplication);

		  //when the main UI is added, this method will be invoked
		  cle.SERVER.subscribe("mainReady",log.onMainReady);
		  
		  cle.SERVER.subscribe("logListSelected",log.onSelectLog);
		  cle.SERVER.subscribe("requestLogDetails",log.onGetLogDetails);
		  cle.SERVER.subscribe("logQueryFieldChange",log.onQueryFieldChange);
		  cle.SERVER.subscribe('getCorrespondingLogs',log.onCorrelateFromException);
	  };
	  log.onCorrelateFromException = function(objEvent){
		  cle.LOG.trace('log#onCorrelateFromException');
		  var rv =log.resetCorrelationCriteria();
		  rv.when(function(){
			  //find log tab and set
			  var objLogTab = cle.SERVER.getJSXByName('logTab');
			  objMainTabbedPane = objLogTab.getParent();
			  if (objMainTabbedPane != null){
				  objMainTabbedPane.setSelectedIndex(objLogTab, true);
			  }
			  log.setCorrelationCriteria(objEvent);
		  });
	  };
	  log.resetCorrelationCriteria = jsx3.$Y(function(cb){
		  cle.LOG.trace('log#resetCorrelationCriteria');
		  var objDoc = cle.SERVER.getCache().getDocument(log.LOG_CRITERIA_CACHE_ID);
		  if (objDoc != null){
			  var objNodeIt = objDoc.selectNodeIterator('//record[@jsxvalue]');
			  while(objNodeIt.hasNext()){
				  objNodeIt.next().setAttribute('jsxvalue','');
			  }
		  }
		  var objMatrix = cle.SERVER.getJSXByName('logQueryMatrix');
		  if (objMatrix != null){
			  objMatrix.repaintData();
		  }
		  cb.done();
	  });
	  log.setCorrelationCriteria = function(objEvent){
		  cle.LOG.trace('log#setCorrelationCriteria');
		  //inbound has appId, recordId: strRecordId, fieldId: strFieldId, fieldValue: strValue
		  var strRecordId = objEvent.recordId;
		  var strAppId = objEvent.appId;
		  var strFieldId = objEvent.fieldId;
		  var strValue = objEvent.fieldValue;
		  var strNotFound = cle.utils.getProperty('m_notFound');
		  cle.LOG.trace('log#setCorrelationCriteria recordId: ' +(strRecordId)? strRecordId : strNotFound);
		  cle.LOG.trace('log#setCorrelationCriteria appId: ' +(strAppId)? strAppId : strNotFound);
		  cle.LOG.trace('log#setCorrelationCriteria fieldId: ' +(strFieldId)? strFieldId : strNotFound);
		  cle.LOG.trace('log#setCorrelationCriteria fieldValue: ' +(strValue)? strValue : strNotFound);

		  //only two allowed ids: [CORRELATIONID,TRANSID]
		  if (strFieldId){
			  var objCDF = cle.SERVER.getCache().getDocument(log.LOG_CRITERIA_CACHE_ID);
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
			  
			  if (strFieldId=='CORRELATIONID'){
				  var objRecordNode = objCDF.getRecordNode('correlationID');
				  if (objRecordNode != null){
					  objRecordNode.setAttribute('jsxvalue',strValue);
				  }
			  }
			  else if (strFieldId=='TRANSID'){
				  var objRecordNode = objCDF.getRecordNode('transactionID');
				  if (objRecordNode != null){
					  objRecordNode.setAttribute('jsxvalue',strValue);
				  }
			  }
			  //requirement for UI wanted to automatically query the logs based on correlation from exception
			  var objMatrix = cle.SERVER.getJSXByName('logQueryMatrix');
			  log.queryFieldChange(objMatrix);
			  //find query button to pass as arg
			  var objButton = cle.SERVER.getJSXByName('logSearchBtn');
			  //TODO: handle NPE if button not found
			  log.queryLogs(objButton);
			  //sync the view
			  var objMatrix = cle.SERVER.getJSXByName('logQueryMatrix');
			  if (objMatrix != null){
				  objMatrix.repaintData();
			  }
              cle.SERVER.getCache().publish({subject: log.LOG_CRITERIA_CACHE_ID, action:jsx3.app.Cache.CHANGE});
		  }
	  };
	  //mask the child in order to move the splitter over the iframe
	  log.onBeforeSplitterResize = function(objEvent) {
		  cle.LOG.trace("log#onBeforeSplitterResize");
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
	  log.onAfterSplitterResize = function(objEvent) {
		  cle.LOG.trace("log#onAfterSplitterResize");
		  var objParent = objEvent.target.getChild(1);
		  if (objParent){
			  cle.utils.hideMask(objParent);
		  }
	  };
	  log.getEndpointHost = function() {
		  return log.ENDPOINT_HOST;
	  };
	  log.setEndpointHost = function(strEndpointHost) {
		  log.ENDPOINT_HOST = strEndpointHost;
	  };
	  log.getEndpointUrl = function() {
		  return log.ENDPOINT_URL;
	  };
	  log.setEndpointUrl = function(strEndpointUrl) {
		  log.ENDPOINT_URL = strEndpointUrl;
	  };
	  log.getEndpoint = function() {
		  return log.ENDPOINT_HOST + log.ENDPOINT_URL;
	  };
	  /**
	   * add Log tab to main UI
	   */
	  log.onMainReady = function(objEvent) {
		  try {
			  cle.LOG.trace("log#onMainReady");
			  var objMainPane = objEvent.objJSX;
			  var objMainTabbedPane = objMainPane.getDescendantOfName("mainTabbedPane",true,false);
			  if (objMainTabbedPane != null){
				  cle.LOG.trace("found objMainTabbedPane");

				  //add log tab
				  var objLogTabRV = log.addTab(objMainTabbedPane);
				  objLogTabRV.when(function(objLogTab){
					  //add the tab pane
					  var strURI = cle.SERVER.resolveURI("interfaces/log/logPane_gui.xml");
					  //get the parent for the pane
					  var objParentPane = objLogTab.getDescendantOfName("logTabPane",true,false);
					  var objLogPane = objParentPane.load(strURI,false);
					  var objChildren = objLogPane.findDescendants(function(descendant){return (descendant.instanceOf(jsx3.gui.Matrix));}, true, true, false, false);
					  if (objChildren != null){
						  jsx3.$A(objChildren).each(function(child){
							  child.setXSLParam("jsx_treehead_bgcolor",cle.utils.getProperty("cellTreeheadBG"));
						  });
					  }
					  objMainTabbedPane.paintChild(objLogTab);
					  cle.LOG.trace("done loading log tab");
				  });
			  }
		  } catch (e) {
			  e = jsx3.lang.NativeError.wrap(e);
			  cle.LOG.error("log#onMainReady error: " + e.getMessage());
		  }
		};
		/**
		 * removes certain cache files when user is logged off
		 */
		log.onUnloadApplication = function(objEvent) {
			try {
				cle.LOG.trace("log#onUnloadApplication");
				var objCache = cle.SERVER.getCache();
				objCache.clearById("logCriteria_cdf_xml");
				objCache.clearById("logList_cdf");
				objCache.clearById("logDetails_cdf");
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#onUnloadApplication error: " + e.getMessage());
			}
		};
		log.rebuildApplicationList = function(objJSX) {
			try {
				cle.LOG.trace("log#rebuildApplicationList");
				log.onAuthorizationUpdate({subject:log.AUTHORIZATION_CACHE_ID,action:jsx3.app.Cache.CHANGE});
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#rebuildApplicationList error: " + e.getMessage());
			}
		};
		/**
		 * called by the main page to add a tab for the Log view
		 */
		log.addTab = jsx3.$Y(function(cb) {
			try {
				var objParent = cb.args()[0];
				var strURI = cle.SERVER.resolveURI("interfaces/log/logTab_gui.xml");
				var objTab = objParent.load(strURI, false);
				cb.done(objTab);
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#addTab error: " + e.getMessage());
			}
		});
		/**
		 * change the splitter from vertical to horizontal to vertical
		 */
		log.flipOrientation = function(objMenu,strRecordId) {
			try {
				cle.LOG.trace("log#flipOrientation");
				var objSplitter = objMenu.getAncestorOfName("logListSplitter");
				if (objSplitter != null){
					var isHorizontal = (objSplitter.getOrientation()== jsx3.gui.Splitter.ORIENTATIONH);
					objSplitter.setOrientation((isHorizontal)? jsx3.gui.Splitter.ORIENTATIONV: jsx3.gui.Splitter.ORIENTATIONH);
					objSplitter.recalcBox();
					objSplitter.repaint();
					objMenu.insertRecordProperty(strRecordId, 'jsximg',(isHorizontal)? 'images/icons/splitter-side.gif': 'images/icons/splitter-over.gif', true);
				}
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#flipOrientation error: " + e.getMessage());
			}
		};
		log.beforeShowMenu = function(objMatrix,strRecordId,objColumn,objMenu) {
			try {
				var strColumnName = objColumn.getName();
				if ((strColumnName=='transactionIdCol')||(strColumnName=='correlationIdCol')){
					objMenu._fieldId = objColumn.getPath();
					return {objMENU:objMenu};
				}
				else {
					return false;
				}
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#beforeShowMenu error: " + e.getMessage());
			}
		};
		/**
		 * a context menu on the Log list wants to show related Exceptions
		 */
		log.correlateExceptions = function(objMatrix, strRecordId, strFieldId) {
			try {
				cle.LOG.trace("log#correlateExceptions");
				  var objRecord = objMatrix.getRecord(strRecordId);
				  if (objRecord){
					var strAppId = objRecord['APPLICATIONID'];
					var strValue = objRecord[strFieldId];
					cle.LOG.trace('log#correlateExceptions using fieldId: ' + strFieldId + ', fieldValue: ' + strValue);
					cle.SERVER.publish({subject: "getCorrespondingExceptions", appId: strAppId ,recordId: strRecordId, fieldId: strFieldId, fieldValue: strValue});
				}
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#correlateExceptions error: " + e.getMessage());
			}
		};
		/**
		 * an event handler for update the list of applications available in the search criteria form
		 */
		log.onAuthorizationUpdate = function(objEvent){
			cle.LOG.debug("log#onAuthorizationUpdate");
			var strSubject = objEvent.subject;
			var strAction = objEvent.action;
			cle.LOG.trace("log#onAuthorizationUpdate subject: " + strSubject + ", action: " + strAction);
			//update the configuration if the action is for an add or change
			var objLogQueryMatrix = cle.SERVER.getJSXByName("logQueryMatrix");
			if (objLogQueryMatrix != null){
				if (strAction == jsx3.app.Cache.ADD || strAction == jsx3.app.Cache.CHANGE){
					cle.LOG.trace("log#onAuthorizationUpdate replacing the elements in the logCriteria cdf");
					//replace the elements in the logCriteria_cdf
					var objApplicationsXML = cle.SERVER.getCache().getDocument(log.APPLICATION_CACHE_ID);
					if (objApplicationsXML != null){
						cle.LOG.trace("log#onAuthorizationUpdate appList xml: " + objApplicationsXML.toString());
					}
					var objSrcXML = cle.SERVER.getCache().getDocument(log.AUTHORIZATION_CACHE_ID);
					var objSrcNodes = objSrcXML.selectNodes('//record[@p8]'); //view log permission
					var objTargetXML = objLogQueryMatrix.getXML();
					if (objTargetXML != null){
						cle.LOG.trace("log#onAuthorizationUpdate found logQueryMatrix XML");
						var objParentNode = objTargetXML.selectSingleNode('//record[@jsxid="Applications"]');
						if (objParentNode != null){
							cle.LOG.trace("log#onAuthorizationUpdate remove child nodes");
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
										cle.LOG.trace("log#onAuthorizationUpdate appID lookup not found for " + strId);
									}
								}
								objParentNode.appendChild(objCloneNode);
								//cle.LOG.trace("log#onAuthorizationUpdate added " + objCloneNode.toString());
							});
						}
						else {
							cle.LOG.warn("log#onAuthorizationUpdate 'Applications' node not found");
						}
					}
					else {
						cle.LOG.warn("log#onAuthorizationUpdate logQueryMatrix XML not found");
					}
					cle.LOG.trace("log#onAuthorizationUpdate repainting logQueryMatrix");
					objLogQueryMatrix.repaintData();
				}
			}
			else {
				cle.LOG.warn("log#onAuthorizationUpdate logQueryMatrix not found");
			}
		};
		log.showColumnManager = function(objJSX) {
			//TODO: persist settings across browser openings
			//TODO: check for open dialog
			var objParent = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid");
			var objMatrix = objParent.getDescendantOfName("logListMatrix");
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
				cle.SERVER.getCache().setDocument("logConfiguredColumns_cdf",objConfiguredColumnsCDF);
				//show the dialog
				var strURI = cle.SERVER.resolveURI("interfaces/log/logColumnManagerDialog_gui.xml");
				cle.LOG.trace("show dialog");
				var objDialog = cle.SERVER.getBodyBlock().loadAndCache(strURI,true);
				//add functionality to the dialog
				jsx3.$O(objDialog).extend({
				    getTarget: function() {
				        return objMatrix;
				    },
				    getConfigurationMatrix: function() {
				        return objDialog.getDescendantOfName("logConfiguredColumnsMatrix",true,false);
				    },
				    doCancelButton: function(objJSX) {
				        //close the dialog with no changes
				    	this.doClose();
				    },
				    doApplyButton: function(objJSX) {
				        //apply the changes, remain open
				    	cle.log.applyColumns(objDialog,objJSX);
				    	this.getTarget().repaint();
				    },
				    doCloseButton: function(objJSX) {
				        //apply the changes, close dialog
				    	cle.log.applyColumns(objDialog,objJSX);
				    	this.getTarget().repaint();
				    	this.doClose();
				    }
				});
			}

		};
		/**
		 * apply the column settings to the target Matrix
		 * @param {jsx3.gui.Dialog} The configuration dialog
		 * @param {jsx3.app.Model}  The object calling function (for context)
		 */
		log.applyColumns = function(objDialog, objJSX) {
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
		log.setTimeframe = function(objMatrix, strRecordId){
			try {
				cle.LOG.trace("log#setTimeframe");
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
				cle.LOG.error("log#setTimeframe error: " + e.getMessage());
			}
		  };
		log.onLogFault = function(objEvent) {
			try {
				switch (objEvent.code) {
				//do nothing for the following codes
				case "CMN-01":
				case "LOG-01":
					break;
				//lookup code in LJSS file for message
				default:
					var strCaption = cle.utils.getProperty("m_faultCaption");
					var strMessage = cle.utils.getProperty(objEvent.code);
					//use included message if the code translation is unavailable
					if (jsx3.util.strEmpty(strMessage)) strMessage = objEvent.message;
					var strOK = cle.utils.getProperty("m_ok");
					var objParams = {width: 300, height: 150, noTitle: false, nonModal: false};
					cle.SERVER.alert(strCaption, objEvent.src + ": <br/>" + strMessage,null,strOK,objParams);
				}
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#onLogFault error: " + e.getMessage());
			}
		};
		log.setLogSelection = function(objMatrix){
			  try{
				  cle.LOG.trace("log#setLogSelection");
				  log.disableDeleteButton();
				  //publish request for log details retrieval
				  var aSelections = objMatrix.getSelectedIds();
				  //TODO: check for valid selection type -- recordType? 
				  cle.SERVER.publish({subject:"logListSelected",target: objMatrix, list: aSelections});
			  } catch (e){
				  e = jsx3.lang.NativeError.wrap(e);
				  cle.LOG.error("log#setLogSelection error: " + e.getMessage());
			  }
		  };
		  log.onSelectLog = function(objEvent){
			  try{
				  cle.LOG.trace("log#onSelectLog");
				  var objMatrix = objEvent.target;
				  var objFirstRecord = objMatrix.getRecord(objEvent.list[0]);
				  if (objFirstRecord){
					  var strAppId = objFirstRecord.APPLICATIONID;
					  if (!jsx3.util.strEmpty(strAppId)){
						  log.enableDeleteButton(strAppId);
					  }
				  }
			  } catch (e){
				  e = jsx3.lang.NativeError.wrap(e);
				  cle.LOG.error("log#onSelectLog error: " + e.getMessage());
			  }
		  };
		log.enableApp = function(objMatrix,strRecordId,bEnable) {
			try {
				var objRecordNode = objMatrix.getRecordNode(strRecordId);
				objRecordNode.setAttribute("jsxvalue",bEnable);

				objMatrix.redrawRecord(strRecordId,jsx3.xml.CDF.UPDATE);
				//trigger change event
				log.queryFieldChange(objMatrix);
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#enableApp error: " + e.getMessage());
			}
		};
		log.enableAllApps = function(objMatrix,bEnable) {
			try {
				cle.LOG.trace("log#enableAllApps");
				cle.LOG.trace("log#enableAllApps " + objMatrix.getName() + " is enabled: " + bEnable);
				var objRecordNodes = objMatrix.getXML().selectNodes("//record[@type='appId']");
				for (var it = objRecordNodes.iterator();it.hasNext();){
					it.next().setAttribute("jsxvalue",bEnable);
				}
				objMatrix.repaintData();
				//trigger change event 
				log.queryFieldChange(objMatrix);
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#enableAllApps error: " + e.getMessage());
			}
		};
		log.deleteSelectedLogs = function(objButton){
			try{
				cle.LOG.trace("log#deleteSelectedLogs");

				var strTitle = cle.utils.getProperty("m_confirmCaption");
				var strMessage = cle.utils.getProperty("log_deleteMessage");
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
								var objMatrix = objParent.getDescendantOfName("logListMatrix",true,false);
								//get the selected records
								if (objMatrix != null){
									var objFilteredNodes;
									var objSelectedNodes = objMatrix.getSelectedNodes();
									if (objSelectedNodes.size()>0){
										objFilteredNodes = objSelectedNodes.filter(function(node){
											//local function to only return the nodes with attribute 'recordType' set to log
											return (node.getAttribute('recordType') == 'log');
										});
									}
									if (objFilteredNodes.size() > 0) {
										//map from nodes to id array
										var selectedIds = objFilteredNodes.map(function(e) { return e.getAttribute('LOGID'); });
										if (selectedIds){
											var objXML = new jsx3.xml.CDF.Document.newDocument();
											jsx3.$A(selectedIds.toArray()).each(function(id){
												objXML.insertRecord({jsxid:id});
											});
											//store document in local cache
											var strCacheId = "deleteLogList_" + jsx3.xml.CDF.getKey();
											cle.SERVER.getCache().setDocument(strCacheId, objXML);
											var rv = log.deleteLogsOp(strCacheId);
											rv.when(function(result){
												if (result.status){
													//retrieve new list or delete records from matrix?  Here is the delete
													jsx3.$A(objFilteredNodes.toArray()).each(function(record){
														objMatrix.deleteRecord(record.getAttribute("jsxid"),false);
													});
													objMatrix.repaintData();
													log.disableDeleteButton();
													cle.SERVER.getCache().clearById(strCacheId);
												}
												//TODO: handle !true status response
											});
										}
										else {
											cle.LOG.warn("log#deleteSelectedLogs XSL document at " + strXSLUrl + " has problems.");
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
				cle.LOG.error("log#deleteSelectedLogs error: " + e.getMessage());
			}
		};
		log.enableDeleteButton = function(strAppId){
			try{
				var objButton = cle.SERVER.getJSXByName("deleteSelectedLogsBtn",true,false);
				if (objButton != null){
					  //get privilege to resolve exception for this application
					  var hasDeleteLogPrivilege = cle.privileges.getPrivilegesById(strAppId).hasPrivilege(cle.Privilege.DELETE_LOGS);
					  cle.LOG.debug('has delete log privilege: ' + hasDeleteLogPrivilege);
					  if (hasDeleteLogPrivilege == jsx3.Boolean.TRUE){
						  objButton.setEnabled(jsx3.gui.Form.STATEENABLED,true);
					  }
				}
			} catch (e){
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#enableDeleteButton error: " + e.getMessage());
			}
		};
		log.disableDeleteButton = function(){
			try{
				var objButton = cle.SERVER.getJSXByName("deleteSelectedLogsBtn",true,false);
				if (objButton != null){
					objButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
				}
			} catch (e){
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#enableDeleteButton error: " + e.getMessage());
			}
		};
		/**
		 * when the query field changes, notify listeners
		 */
		log.queryFieldChange = function(objMatrix) {
			try {
				cle.LOG.trace("log#queryFieldChange");
				cle.SERVER.publish({subject:'logQueryFieldChange',target: objMatrix});
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#queryFieldChange error: " + e.getMessage());
			}
		};
		/**
		 * handle query field change event
		 */
		log.onQueryFieldChange = function(objEvent) {
			try {
				cle.LOG.trace("log#onQueryFieldChange");
				var objMatrix = objEvent.target;
				var objParent = objMatrix.getAncestorOfType("jsx3.gui.LayoutGrid");
				if (objParent != null){
					//enable the search button
					var objSearchButton = objParent.getDescendantOfName("logSearchBtn",true,false);
					if (objSearchButton != null){
						//test if at least one application id is marked
						objSearchButton.setEnabled((log.hasApplicationId(objMatrix))? jsx3.gui.Form.STATEENABLED: jsx3.gui.Form.STATEDISABLED,true);
					}
				}
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#onQueryFieldChange error: " + e.getMessage());
			}
		};
		log.hasApplicationId = function(objMatrix) {
			try {
				cle.LOG.trace("log#hasApplicationId");
				var objRecords = objMatrix.getXML().selectNodes("//record[@jsxid='Applications']/child::record[@jsxvalue='1']");
				return objRecords.size()>0;
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#hasApplicationId error: " + e.getMessage());
			}
		};
		log.queryLogs = function(objJSX){
			try{
				cle.LOG.trace("log#queryLogs");
				var objParent = objJSX.getAncestorOfType("jsx3.gui.Splitter");
				cle.LOG.trace("parent: " + objParent.getName());
				var objChildren = objParent.findDescendants(function(descendant){return (descendant.instanceOf(jsx3.gui.Matrix));}, true, true, false, false);
				if (objChildren.length > 0){
					var objQueryMatrix = objChildren[0];
					var objListMatrix = objChildren[1];
					objJSX.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
					cle.utils.hideMask(objListMatrix.getParent());
					cle.utils.showMask(objListMatrix.getParent(),cle.utils.getProperty("m_retrievingRecords"), true);
					var strXMLCacheId = objQueryMatrix.getXMLId();
					var rv = log.retrieveLogListOp(strXMLCacheId);
					rv.when(function(response){
						if (response.status){
							objJSX.setEnabled((log.hasApplicationId(objQueryMatrix))? jsx3.gui.Form.STATEENABLED: jsx3.gui.Form.STATEDISABLED,true);
							cle.utils.hideMask(objListMatrix.getParent());
							cle.SERVER.getCache().clearById("logDetails_cdf");
							var objDetailsMatrix = cle.SERVER.getJSXByName("logDetailsMatrix");
							if (objDetailsMatrix != null)
								objDetailsMatrix.repaintData();
							var objStacktracePane = cle.SERVER.getJSXByName("logStacktracePane");
							if (objStacktracePane != null)
								objStacktracePane.setText("").repaint();
							var objTransactionPane = cle.SERVER.getJSXByName("logTransactionPane");
							if (objTransactionPane != null){
								objTransactionPane.setText("");
								objTransactionPane.removeChildren();
							}
							cle.LOG.trace('log#queryLogs completed: ' + response.status);
						}
						else {
							cle.utils.hideMask(objListMatrix.getParent());
						}
					});
				}
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#queryLogs error: " + e.getMessage());
			}
		};
		log.getLogDetails = function(objMatrix, strRecordId){
			try{
				var objRecord = objMatrix.getRecord(strRecordId);
				//publish only if the record type is for a log
				if (objRecord.recordType == "log"){
					//publish request for log details retrieval
					var objMessage = {subject:"requestLogDetails",recordId: strRecordId};
					cle.SERVER.publish(objMessage);
				}
			} catch (e){
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("log#getLogDetails error: " + e.getMessage());
			}
		};
		log.onGetLogDetails = function(objEvent){
	        try{
				cle.LOG.trace("log#getLogDetails");
				var strId = objEvent.recordId;
				var objLogInfoPane = cle.SERVER.getJSXByName("logActionsPane");
				if (objLogInfoPane != null){
					var strMessage = cle.utils.getProperty("m_loadingData");
					cle.utils.hideMask(objLogInfoPane);  //remove mask before showing
					cle.utils.showMask(objLogInfoPane,strMessage, false, 8);  //custom
				}
				var rv = log.retrieveLogDetailOp(strId);
				rv.when(function(response){
					if (response.status){
						var objMatrix = cle.SERVER.getJSXByName("logDetailsMatrix");
						var objXML = objMatrix.getXML();
						if (objXML != null){
							var objParentNode = objXML.selectSingleNode("//record[@jsxid='" + strId + "']");
							var objTransactionNode = objParentNode.selectSingleNode("child::record[@jsxid='Transaction']");
							if (objTransactionNode != null){
								var objTransactionPane = cle.SERVER.getJSXByName("logTransactionPane");
								if (objTransactionPane != null){
									objTransactionPane.removeChildren();
									var strTransactionData = objTransactionNode.getAttribute("jsxvalue");
									cle.LOG.trace("log#getLogDetails transaction data: " + strTransactionData);
									var xmlPattern = new RegExp(/^<?xml/); //XML tag at start
									var xmlAnywherePattern = new RegExp(/<?xml/g); //XML tag anywhere
									var htmlPattern = new RegExp(/^<html/); //HTML tag at start
									if (xmlPattern.test(strTransactionData)){
										objTransactionPane.setText("");
										//create new jsx3.gui.BlockX object
										cle.LOG.trace("log#getLogDetails creating BlockX");
										var objBlockX = new jsx3.gui.BlockX("transactionData",0,0,"100%","100%");
										objTransactionPane.setChild(objBlockX,jsx3.app.Model.PERSISTNONE);
										cle.LOG.trace("log#getLogDetails resetXmlCacheData");
										objBlockX.resetXmlCacheData();
										cle.LOG.trace("log#getLogDetails setXMLString");
										objBlockX.setXMLString(strTransactionData);
										objTransactionPane.repaint();
									}
									else if (xmlAnywherePattern.test(strTransactionData)){
										//FIXME: either at the server or here, remove the '[CMN-03] Rendering transformation error, the transaction XSLT code may have errors. Original XML data displayed" '
										var objBlock = new jsx3.gui.Block("logTransactionData",0,0,"100%","100%");
										objBlock.setText(strTransactionData.toString().replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;"));
										objTransactionPane.setChild(objBlock,jsx3.app.Model.PERSISTNONE);
										objTransactionPane.repaint();
									}
									else if (htmlPattern.test(strTransactionData)){
										cle.LOG.trace("exception#onGetExceptionDetails creating iframe");
										var objIBlock = new jsx3.gui.IBlock("logTransactionData",0,0,"100%","100%");
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
									else {
										//don't format the data, just display it as is
										var objBlock = new jsx3.gui.Block("logTransactionData",0,0,"100%","100%");
										objBlock.setText(strTransactionData.toString().replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;"));
										objTransactionPane.setChild(objBlock,jsx3.app.Model.PERSISTNONE);
										objTransactionPane.repaint();
									}
									cle.LOG.trace("log#getLogDetails remove cdf transaction node from parent");
									//remove the transaction element from the cdf
									objParentNode.removeChild(objTransactionNode);
								}
							}
							cle.LOG.trace("log#getLogDetails setRenderingContext");
							objMatrix.setRenderingContext(strId);
							objMatrix.repaintData();
							cle.LOG.trace('log#getLogDetails completed: ' + response.status);
						}
						else {
							cle.LOG.warn('log#getLogDetails problems with logDetailsMatrix XML');
						}
						if (objLogInfoPane != null){
							cle.utils.hideMask(objLogInfoPane); //custom
						}
					}
				});
	        } catch (e){
		           e = jsx3.lang.NativeError.wrap(e);
		           cle.LOG.error("log#getLogDetails error: " + e.getMessage());
		    }
		};
		log.retrieveLogListOp = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("retrieveLogListOp_rule_xml");
			objService.setOperation("Retrieve_sp_Log_sp_ListOp");
			objService.setEndpointURL(log.getEndpoint());
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/log/cdf2LogListQuery.xsl");
			cle.LOG.trace("retrieving XSL: " + strXSLUrl);
			var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
			if (!objXSL.hasError()){
				cle.LOG.trace('log.retrieveLogListOp found XSL');
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
					cle.LOG.trace(objDoc.toString());
				}
			}
			else {
				cle.LOG.warn("log#retrieveLogListOp XSL document at " + strXSLUrl + " has problems.");
				cb.done({status:false});
			}
	
			//set service response timeout handler
			objService.setTimeout(log.TIMEOUT,
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
					var strXSLUrl = cle.SERVER.resolveURI("interfaces/log/logList2CDF.xsl");
					var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
					if (!objXSL.hasError()){
						var templateProcessor = new jsx3.xml.Template(objXSL);               
						var objCDF = templateProcessor.transformToObject(objXML);
						//TODO: handle 'no records found' error
						cle.SERVER.getCache().setDocument(log.LIST_CACHE_ID,objCDF);
			    		cle.LOG.trace("log#retrieveLogListOp call completed");
			    		cb.done({status:true});
					}
					else {
						cle.LOG.warn("log#retrieveLogListOp XSL document at " + strXSLUrl + " has problems.");
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
						cle.SERVER.publish({subject:"logFault",code:strFaultCode,message:strFaultMessage,src:"retrieveLogListOp"});
					}
				}
				else {
					cle.SERVER.publish({subject:"logFault",code:strStatus,message:strStatusText});
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
		log.retrieveLogDetailOp = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("retrieveLogDetailOp_rule_xml");
			objService.setOperation("Retrieve_sp_Log_sp_DetailOp");
			objService.setEndpointURL(log.getEndpoint());
			var strExceptionId = cb.args()[0];
			if (!jsx3.util.strEmpty(strExceptionId)){
				objService.id = strExceptionId;
			}
			//TODO: report no log id supplied
	
			//set service response timeout handler
			objService.setTimeout(log.TIMEOUT,
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
					var strXSLUrl = cle.SERVER.resolveURI("interfaces/log/logDetail2CDF.xsl");
					var objXSL = cle.SERVER.getCache().getOrOpenDocument(strXSLUrl);
					if (!objXSL.hasError()){
						var templateProcessor = new jsx3.xml.Template(objXSL);               
						var objCDF = templateProcessor.transformToObject(objXML);
						//TODO: handle 'no records found' error
						objCDF = jsx3.xml.CDF.Document.wrap(objCDF);
						objCDF.convertProperties(cle.SERVER.JSS, ["jsxtext","jsxtip"]);
						cle.SERVER.getCache().setDocument(log.DETAIL_CACHE_ID,objCDF);
			    		cle.LOG.trace("log#retrieveLogDetailOp call completed");
			    		cb.done({status:true});
					}
					else {
						cle.LOG.warn("log#retrieveLogDetailOp XSL document at " + strXSLUrl + " has problems.");
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
						cle.SERVER.publish({subject:"logFault",code:strFaultCode,message:strFaultMessage,src:"retrieveLogDetailOp"});
					}
				}
				else {
					cle.SERVER.publish({subject:"logFault",code:strStatus,message:strStatusText});
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
		log.deleteLogsOp = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("deleteLogOp_rule_xml");
			objService.setOperation("DeleteLogOp");
			objService.setEndpointURL(log.getEndpoint());
			//TODO: check privilege before proceeding
			var strCacheId = cb.args()[0];
			var objXML = cle.SERVER.getCache().getDocument(strCacheId);
			if (objXML == null){
				cle.LOG.warn('log#deleteLogsOp target document not found.');
				cb.done({status:false});
			}
			//use XSLT to create outbound message
			var strXSLUrl = cle.SERVER.resolveURI("interfaces/log/xml2DeleteLog.xsl") ;
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
					cle.LOG.trace('log#deleteLogsOp objDoc: ' + objDoc.toString());
				}
			}
			else {
				cle.LOG.warn("log#deleteLogsOp XSL document at " + strXSLUrl + " has problems.");
				cb.done({status:false});
			}

			//set service response timeout handler
			objService.setTimeout(log.TIMEOUT,
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
						//FIXME: the following is not used, delete?
						var objXML = new jsx3.xml.Document().loadXML(responseXML.toString());
						cle.LOG.trace('log#deleteLogsOp objXML: ' + objXML.toString());
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
						cle.SERVER.publish({subject:"logFault",code:strFaultCode,message:strFaultMessage,src:"deleteLogsOp"});
					}
				}
				else {
					cle.SERVER.publish({subject:"logFault",code:strStatus,message:strStatusText});
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
		//do subscriptions on load
		log.setSubscriptions();
});
