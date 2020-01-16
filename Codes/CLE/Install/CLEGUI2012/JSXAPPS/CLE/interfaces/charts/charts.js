jsx3.lang.Package.definePackage(
  "cle.charts",
	function(charts) {
	  charts.ENDPOINT_HOST = "http://localhost:9950";
	  charts.ENDPOINT_URL = "/Common/GUIServices/intfChartInfoRetrieval-service.serviceagent/portTypeEndpoint1";
	  charts.TIMEOUT = 20 * 1000; //20 seconds

		charts.init = function(objTarget){
			if (!jsx3.chart){
				cle.LOG.trace("charts#init no chart package found.  Loading...");
				var job = jsx3.CLASS_LOADER.loadAddin("charting");
				job.subscribe("finish", function() {
					cle.SERVER.publish({subject: "chartsLoaded", objJSX: objTarget});
				});
			}
			else {
				cle.LOG.trace("charts#init chart package found.  Loading...");
				cle.SERVER.publish({subject: "chartsLoaded", objJSX: objTarget});
			}
		};
		charts.setSubscriptions = function(){
			cle.LOG.trace("charts#setSubscriptions");

			//when the application is asked to unload, this method will be invoked
			cle.SERVER.subscribe("unloadApplication", charts.onUnloadApplication);

			//when the main UI is added, this method will be invoked
			cle.SERVER.subscribe("mainReady",charts.onMainReady);
			
			//when the main UI is added, this method will be invoked
			cle.SERVER.subscribe("chartsLoaded",charts.onChartsLoaded);
		};
		charts.getEndpointHost = function() {
			return charts.ENDPOINT_HOST;
		};
		charts.setEndpointHost = function(strEndpointHost) {
			charts.ENDPOINT_HOST = strEndpointHost;
		};
		charts.getEndpointUrl = function() {
			return charts.ENDPOINT_URL;
		};
		charts.setEndpointUrl = function(strEndpointUrl) {
			charts.ENDPOINT_URL = strEndpointUrl;
		};
		charts.getEndpoint = function() {
			return charts.ENDPOINT_HOST + charts.ENDPOINT_URL;
		};
		charts.pieColoring = function( record, index ) {
			jsx3.log(record.name + ': ' + index);
		    return charts.DEFAULT_FILLS[index % charts.DEFAULT_FILLS.length];
		 };
		charts.zoomMe = function(objButton) {
			var objDialog = objButton.getAncestorOfType('jsx3.gui.Dialog');
			if (objDialog){
				var objChart = objDialog.getDescendantsOfType('jsx3.chart.Chart')[0];
				//original size: jsxwidth="400" jsxheight="300"
				objChart.setWidth(objChart.getWidth() + 100, false);
				objChart.setHeight(objChart.getHeight() + 100, true);
				objDialog.setWidth(objDialog.getWidth() + 100, false);
				objDialog.setHeight(objDialog.getHeight() + 100, true);
				//objDialog.recalcBox();
				//objDialog.repaint();
			}
		};
		/**
		 * load files associated with Charts tab
		 */
		charts.onMainReady = function(objEvent) {
			try {
				cle.LOG.trace("charts#onMainReady");
				//pass the target to the init method to pass to the onChartsLoaded
				charts.init(objEvent.objJSX);
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("charts#onMainReady error: " + e.getMessage());
			}
		};
		charts.removeCharts = function(objButton){
			var objParent = objButton.getAncestorOfType('jsx3.gui.LayoutGrid');
			if (objParent){
				var objPane = objParent.getDescendantOfName('chartsPane',true,false);
				if (objPane){
					cle.LOG.trace('getCharts removing children from chartsPane');
					objPane.removeChildren();
				}
			}
			var btn = objButton.getPreviousSibling();
			if (btn.getName()=='getChartsToolBarBtn'){
				btn.setEnabled(jsx3.gui.Form.STATEENABLED,true);
			}
			objButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
		};
		/**
		 * add Charts tab to main UI
		 */
		charts.getCharts = function(objButton) {
			try {
				cle.LOG.trace("charts#getCharts");
				var chartsRv = charts.getChartInfo(cle.logic.getUserId());
				chartsRv.when(function(status){
					if (status.success){
						var btn = objButton.getNextSibling();
						if (btn.getName()=='removeChildrenToolBarBtn'){
							btn.setEnabled(jsx3.gui.Form.STATEENABLED,true);
						}
						objButton.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
						var objParent = objButton.getAncestorOfType('jsx3.gui.LayoutGrid');
						if (objParent){
							var objPane = objParent.getDescendantOfName('chartsPane',true,false);
							if (objPane){
								objPane.removeChildren();
								//log chart
								var strLogURI = cle.SERVER.resolveURI("interfaces/charts/totalLogsDialog_gui.xml");
								var objLogDialog = objPane.loadAndCache(strLogURI,true);
								//objPane.paintChild(objLogDialog);
								//exception chart
								var strExceptionURI = cle.SERVER.resolveURI("interfaces/charts/totalExceptionsDialog_gui.xml");
								var objExceptionDialog = objPane.loadAndCache(strExceptionURI,true);
								//objPane.paintChild(objExceptionDialog);
								//exception distribution pie chart
								var strExceptionDistURI = cle.SERVER.resolveURI("interfaces/charts/exceptionDistributionDialog_gui.xml");
								var objExceptionDistDialog = objPane.loadAndCache(strExceptionDistURI,true);
								//objPane.paintChild(objExceptionDialog);
							}
						}
					}
					else {
						var jss = cle.SERVER.JSS;
						var strCaption = jss.get('chart_serviceUnavailable_caption');
						var strMessage = jss.get('chart_serviceUnavailable_message');
						cle.SERVER.alert(strCaption,strMessage);
					}
				});
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("charts#getCharts error: " + e.getMessage());
			}
		};
		charts.onChartsLoaded = function(objEvent) {
			try {
				cle.LOG.trace("charts#onChartsLoaded");
				var Fill = jsx3.vector.Fill;
				charts.DEFAULT_FILLS = [
				  new Fill(0x3399CC, 1),
      	          new Fill(0xFFCC00, 1),
      	          new Fill(0x99CC66, 1),
      	          new Fill(0xCC9933, 1),
      	          new Fill(0xCCCCCC, 1),
      	          new Fill(0xCC3366, 1),
      	          new Fill(0xFF99FF, 1),
      	          new Fill(0x666666, 1)
      	        ];
				var objMainPane = objEvent.objJSX;
				var objMainTabbedPane = objMainPane.getDescendantOfName("mainTabbedPane",true,false);
				if (objMainTabbedPane != null){
					cle.LOG.trace("found objMainTabbedPane");
					//add log tab
					var objChartsTabRV = charts.addTab(objMainTabbedPane);
					objChartsTabRV.when(function(objChartsTab){
						//add the tab pane
						var strURI = cle.SERVER.resolveURI("interfaces/charts/chartsPane_gui.xml");
						//get the parent for the pane
						var objParentPane = objChartsTab.getDescendantOfName("chartsTabPane",true,false);
						var objChartsPane = objParentPane.load(strURI,false);
						var objChildren = objChartsPane.findDescendants(function(descendant){return (descendant.instanceOf(jsx3.gui.Matrix));}, true, true, false, false);
						if (objChildren != null){
							jsx3.$A(objChildren).each(function(child){
								child.setXSLParam("jsx_treehead_bgcolor",cle.utils.getProperty("cellTreeheadBG"));
							});
						}
						//jsx3.sleep(function(objMainTabbedPane,objChartsTab){
						objMainTabbedPane.paintChild(objChartsTab);
						//});
						cle.LOG.trace("done loading charts tab");
					});
				}
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("charts#onChartsLoaded error: " + e.getMessage());
			}
		};
		/**
		 * called by the main page to add a tab for the Charts view
		 */
		charts.addTab = jsx3.$Y(function(cb) {
			try {
				var objParent = cb.args()[0];
				var strURI = cle.SERVER.resolveURI("interfaces/charts/chartsTab_gui.xml");
				var objTab = objParent.load(strURI, false);
				cb.done(objTab);
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("chart#addTab error: " + e.getMessage());
			}
		});
		/**
		 * executes when user is logging off
		 */
		charts.onUnloadApplication = function(objEvent) {
			try {
				cle.LOG.trace("charts#onUnloadApplication");
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("charts#onUnloadApplication error: " + e.getMessage());
			}
		};
		charts.getChartInfo = jsx3.$Y(function(cb) {
			var strUserName = cb.args()[0];
			  var rv = charts.chartInfoRetrievalOp(strUserName);
			  rv.when(function(response){
				  cle.LOG.trace('getChartInfo response status: ' + response.status);
				  if ((response.status==true)&&(response.document)){
					  var objXML = new jsx3.xml.Document().loadXML(response.document.toString());
					  //create log count CDF
					  var strLogXslUrl = cle.SERVER.resolveURI('interfaces/charts/logCount2CDF.xsl');
					  var objLogXSL = cle.SERVER.getCache().getOrOpenDocument(strLogXslUrl);
					  if (!objLogXSL.hasError()){
						  var logProcessor = new jsx3.xml.Template(objLogXSL);               
						  var objLogDoc = logProcessor.transformToObject(objXML);
						  cle.SERVER.getCache().setDocument('totalLogsChartData_cdf', objLogDoc);
					  }
					  //create exception count CDF
					  var strExecptionXslUrl = cle.SERVER.resolveURI('interfaces/charts/exceptionCount2CDF.xsl');
					  var objExecptionXSL = cle.SERVER.getCache().getOrOpenDocument(strExecptionXslUrl);
					  if (!objExecptionXSL.hasError()){
						  var execptionProcessor = new jsx3.xml.Template(objExecptionXSL);               
						  var objExecptionDoc = execptionProcessor.transformToObject(objXML);
						  cle.SERVER.getCache().setDocument('totalExceptionsChartData_cdf', objExecptionDoc);
					  }
					  //create exception distribution CDF
					  var strChartInfoXslUrl = cle.SERVER.resolveURI('interfaces/charts/chartInfo2CDF.xsl');
					  var objChartInfoXSL = cle.SERVER.getCache().getOrOpenDocument(strChartInfoXslUrl);
					  if (!objChartInfoXSL.hasError()){
						  var distributionProcessor = new jsx3.xml.Template(objChartInfoXSL);
						  var objParams = {useComparison:'0'};
						  distributionProcessor.setParams(objParams);
						  var objDistributionDoc = distributionProcessor.transformToObject(objXML);
						  cle.SERVER.getCache().setDocument('exceptionDistributionChartData_cdf', objDistributionDoc);
					  }
					  cb.done({success: true});
				  }
				  else {
					  cle.LOG.warn('problem with getChartInfo');
					  cb.done({success: false});
				  }
			  });
		});
		charts.chartInfoRetrievalOp = jsx3.$Y(function(cb) {
			var objService = cle.SERVER.loadResource("retrieveChartInfo_rule_xml");
			objService.setOperation("ChartInfoRetrievalOp");
			objService.setEndpointURL(charts.getEndpoint());
			objService.setMode(jsx3.Boolean.TRUE); //or jsx3.Boolean.FALSE to return static response
			objService.setInboundURL('interfaces/charts/samples/chartInfo_soapResponse.xml');
			//TODO: check privilege before proceeding
			var strUserName = cb.args()[0];
			objService.userName = strUserName;
			
			//set service response timeout handler
			objService.setTimeout(charts.TIMEOUT,
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
						cle.LOG.trace('charts#chartInfoRetrievalOp objXML: ' + objXML.toString());
						cb.done({status:true, document:objXML});
					}
					//return, no document
					cb.done({status:true, document:null});
			});
			//inner function handler for soap fault response
		    objService.subscribe(jsx3.net.Service.ON_ERROR,
			  function(objEvent) {
		    	try{
		    	//get the request object status
				var strStatus = objEvent.target.getRequest().getStatus();
				var strStatusText = objEvent.target.getRequest().getStatusText();
				if (jsx3.util.strEmpty(strStatusText)){
					//try to lookup error description from LJSS bundle
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
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("charts#chartInfoRetrievalOp error: " + e.getMessage());
				cb.done({status:false});
			}

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
	});
cle.charts.setSubscriptions();