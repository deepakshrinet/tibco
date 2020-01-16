/* settings.js */
jsx3.require("jsx3.gui.Form");
jsx3.require("jsx3.app.UserSettings");

jsx3.lang.Package.definePackage(
		"cle.settings",
		function(settings) {

			settings.IS_DIRTY = false;
			settings.USE_DEFAULTS = false;
			settings.IS_PERSIST_AVAILABLE = false;

			/* functions */
			settings.init = function(){
				try{
					settings.IS_PERSIST_AVAILABLE = settings.isAvailable();
					settings.loadSettings();
				}
				catch (e){
					e = jsx3.lang.NativeError.wrap(e);
					cle.LOG.error("settings#init error: " + e.getMessage());
				}
			};
			settings.loadSettings = function(){
				try{
					cle.LOG.debug("settings#loadSettings");
					settings.persist = new jsx3.app.UserSettings(cle.SERVER,jsx3.app.UserSettings.PERSIST_INDEFINITE);

					settings.load("THEME_ID", "");
					settings.load("DEFAULT_THEME", "greyTheme_jss_xml");

				}
				catch (e){
					e = jsx3.lang.NativeError.wrap(e);
					cle.LOG.error("settings#loadSettings error: " + e.getMessage());
				}
			};
			settings.restoreDefaults = function(objJSX){
				try{
					cle.LOG.trace("settings#restoreDefaults");
					settings.USE_DEFAULTS = true;
					settings.persist.clear();
					settings.init();
					settings.save();
					settings.setReferenceValues();
				}
				catch (e){
					e = jsx3.lang.NativeError.wrap(e);
					cle.LOG.error("settings#restoreDefaults error: " + e.getMessage());
				}
			};
			settings.load = function(strKey,defaultValue){
				try{
					cle.LOG.trace("settings#load");
					if (settings.IS_PERSIST_AVAILABLE){
						var savedValue = settings.persist.get(settings._getKey(strKey));
						if (!jsx3.util.strEmpty(savedValue)){
							settings.persist.set(settings._getKey(strKey),savedValue);
						}
						else {
							settings.persist.set(settings._getKey(strKey),defaultValue);
						}
					}
					else {
						cle.LOG.warn("settings#load no persistence available");
					}
				}
				catch (e){
					e = jsx3.lang.NativeError.wrap(e);
					cle.LOG.error("settings#load error: " + e.getMessage());
				}
			};
			settings.save = function(objJSX){
				try{
					cle.LOG.trace("settings#save");
					if (settings.IS_PERSIST_AVAILABLE){
						settings.persist.save();
						settings.setDirty(false,objJSX);
					}
				}
				catch (e){
					e = jsx3.lang.NativeError.wrap(e);
					cle.LOG.error("settings#save error: " + e.getMessage());
				}
			};
			settings.setDirty = function(bIsDirty,objJSX){
				try{
					cle.LOG.trace("settings#setDirty");
					settings.IS_DIRTY = bIsDirty;
					if (objJSX != null){
						var objUpdateButton = objJSX.getAncestorOfType("jsx3.gui.LayoutGrid").getDescendantOfName("saveSettingsButton",true,false);
						if (objUpdateButton != null){
							cle.LOG.trace("settings#setDirty found button.");
							objUpdateButton.setEnabled(((bIsDirty)? jsx3.gui.Form.STATEENABLED: jsx3.gui.Form.STATEDISABLED),true);
						}
					}
				}
				catch (e){
					e = jsx3.lang.NativeError.wrap(e);
					cle.LOG.error("settings#setDirty error: " + e.getMessage());
				}
			};
			settings.isDirty = function(){
				try{
					cle.LOG.trace("settings#isDirty");
					return settings.IS_DIRTY;
				}
				catch (e){
					e = jsx3.lang.NativeError.wrap(e);
					cle.LOG.error("settings#isDirty error: " + e.getMessage());
				}
			};
			settings._getKey = function(k){
				try{
					return "cle_persist_" + k;
				}
				catch (e){
					e = jsx3.lang.NativeError.wrap(e);
					cle.LOG.error("settings#_getKey error: " + e.getMessage());
				}
			};
			settings.isAvailable = function(){
				try{
			        var s = cle.SERVER;
			        cle.LOG.trace("settings#isAvailable creating key.");
			        var k = settings._getKey("__key"), v = "__value";
			        cle.LOG.trace("settings#isAvailable setting cookie.");
			        s.setCookie(k, v);
			        var ok = s.getCookie(k) == v;
			        cle.LOG.trace("settings#isAvailable deleting cookie.");
			        s.deleteCookie(k);
			        return ok;
				}
				catch (e){
					e = jsx3.lang.NativeError.wrap(e);
					cle.LOG.error("settings#isAvailable error: " + e.getMessage());
				}
			};
			settings.get = function(k){
				try{
			        return cle.SERVER.getCookie(settings._getKey(k));
				}
				catch (e){
					e = jsx3.lang.NativeError.wrap(e);
					cle.LOG.error("settings#get error: " + e.getMessage());
				}
			};
			settings.put = function(k,v){
				try{
			        var s = cle.SERVER;
			        s.deleteCookie(settings._getKey(k));
			        var now = new Date();
			        s.setCookie(settings._getKey(k), v, new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()));
				}
				catch (e){
					e = jsx3.lang.NativeError.wrap(e);
					cle.LOG.error("settings#put error: " + e.getMessage());
				}
			};
			settings.remove = function(k){
				try{
			        cle.SERVER.deleteCookie(settings._getKey(k));
				}
				catch (e){
					e = jsx3.lang.NativeError.wrap(e);
					cle.LOG.error("settings#remove error: " + e.getMessage());
				}
			};
			settings.setReferenceValues = function(){
				try{
					cle.LOG.trace("settings#setReferenceValues");
					var objServer = cle.SERVER;
					var strSettingsCacheId = "settingsMatrix_cdf_xml";
					var strSettingsURL = objServer.resolveURI("interfaces/shared/settingsMatrix_cdf.xml");
					var objSettingsXML = objServer.getCache().getOrOpenDocument(strSettingsURL, strSettingsCacheId);
					redi.utils.convertProps(strSettingsCacheId);
					if (!objSettingsXML.hasError()) {
						cle.LOG.trace("settings#setReferenceValues found settings XML");
						var objRecordNodes = objSettingsXML.selectNodes("//record");
						for (var recordsIt = objRecordNodes.iterator(); recordsIt.hasNext();) {
							var objRecordNode = recordsIt.next();
							var reference = objRecordNode.getAttribute("reference");
							if (!jsx3.util.strEmpty(reference)){
								cle.LOG.trace("settings#setReferenceValues getting value for " + settings._getKey(reference));
								var value = settings.persist.get(settings._getKey(reference));
								objRecordNode.setAttribute("jsxvalue",value);
							}
						}
					}
				}
				catch (e){
					e = jsx3.lang.NativeError.wrap(e);
					cle.LOG.error("settings#setReferenceValues error: " + e.getMessage());
				}
			};
			settings.showProfileDialog = function(){
				try{
					cle.LOG.trace("settings#showProfileDialog");
					var objServer = cle.SERVER;
					settings.setReferenceValues();
					var strXMLURL = "interfaces/shared/settingsDialog_gui.xml";
					var objBodyBlock = objServer.getBodyBlock();
					var objDialog = objBodyBlock.load(strXMLURL,false);
					objBodyBlock.paintChild(objDialog);
				} catch (e){
					e = jsx3.lang.NativeError.wrap(e);
					cle.LOG.error("settings#showProfileDialog error: " + e.getMessage());
				}
			};
			/** The settings menu has a jsx3.gui.Matrix to hold settings
			 *   and this function sets the mask field of the matrix form
			 *   @param objJXS Matrix object
			 *   @param objColumn Child that has the display mask
			 *   @param strRecordId 'jsxid' attribute for record
			 *   @return objMask Child object that will be displayed and can return 'false'
			 */
			settings.onBeforeEdit = function(objJSX, objColumn, strRecordId) {
				cle.LOG.debug("settings#onBeforeEdit");
				var objRecord = objJSX.getRecordNode(strRecordId);
				var maskName = objRecord.getAttribute("maskName");
				var maskValue = objRecord.getAttribute("jsxvalue");
				if (maskName == null) {return false;}
				if (objRecord.getAttribute("uneditable") == "1") {return false;}
				var objMask = objColumn.getChild(maskName); 
				if (objMask instanceof jsx3.gui.Select) {
					var jsxxmlid = objRecord.getAttribute("jsxxmlid");
					if (jsxxmlid != null) {
						objMask.setXMLId(jsxxmlid);
					}
					else {
						var enums = objRecord.selectNodes("enum");
						objMask.setXMLId(objRecord.getAttribute("jsxid")+ "_xml");
						objMask.clearXmlData();
						for (var i = 0; i < enums.getLength(); i++) {
							var enumNode = enums.getItem(i);
							var text = enumNode.getAttribute('jsxtext');
							var o = new Object();
							o.jsxid = text;
							o.jsxtext = text;
							objMask.insertRecord(o);
						}
						objMask.setValue(maskValue);
					}
				}
				return {objMASK:objMask};
			};
			/** Change the background colors using dynamic property files
			 */
			settings.loadTheme = function(strTheme, bRepaint) {
				try{
					var objCache = cle.SERVER.getCache();
					(settings.THEME_ID != null)? objCache.clearById(settings.THEME_ID): objCache.clearById(settings.DEFAULT_THEME);
					var strPropertiesFile = strTheme + new Date().getTime() + "_jss_xml";
					cle.LOG.trace("loading resource file: " + strTheme);
					//TODO: update to use persisted settings
					settings.THEME_ID = strPropertiesFile;
					var strXMLURL = null;
					var strCacheId = null;
					var strType = null;
					//TODO: read path from menu, not switch/case
					switch (strTheme) {
					case "blueTheme_jss_xml":
						strXMLURL = cle.SERVER.resolveURI("jss/blueTheme_jss.xml");
						strCacheId = strPropertiesFile;
						strType = "jss";
						break;
					case "greyTheme_jss_xml":
						strXMLURL = cle.SERVER.resolveURI("jss/greyTheme_jss.xml");
						strCacheId = strPropertiesFile;
						strType = "jss";
						break;
					}
					cle.SERVER.loadInclude(strXMLURL, strCacheId, strType, bRepaint);
					if ((bRepaint != null) && (bRepaint)){
						var objBody = cle.SERVER.getBodyBlock();
						objBody.repaint();
						var objChildren = objBody.findDescendants(function(descendant){return (descendant.instanceOf(jsx3.gui.Matrix));}, true, true, false, false);
						if (objChildren != null){
							jsx3.$A(objChildren).each(function(child){
								var objParent = child.getParent();
								if (objParent != null){
									cle.LOG.trace("has parent: " + child.getName());
									var strSerialization = child.toXML({persistall:true});
									var objXMLSrc = child.getXML();
									objParent.removeChild(child);
									var objJSX = objParent.loadXML(strSerialization,false);
									var objParams = objJSX.getXSLParams();
									if (objParams["jsx_treehead_bgcolor"])
										objJSX.setXSLParam("jsx_treehead_bgcolor",cle.utils.getProperty("cellTreeheadBG"));
									objJSX.setSourceXML(objXMLSrc);
									objParent.paintChild(objJSX);
								}
								else {
									cle.LOG.trace("no parent: " + child.getName());
									child.repaint();
								}
							});
						}
					}
				} catch (e){
					e = jsx3.NativeError.wrap(e);
					cle.LOG.error("loadTheme error: " + e.getMessage());
				}
			};
			/** update package property settings
			 *    
			 */
			settings.updateSettings = function(objJSX,strRecordId,strValue) {
				try{
					settings.setDirty(true,objJSX);
					var objRecord = objJSX.getRecord(strRecordId);
					settings.persist.set(settings._getKey(objRecord.reference),strValue);
					
				} catch (e) {
					e = jsx3.NativeError.wrap(e);
					cle.LOG.error(e.getMessage());
				}
			};
		}
);
cle.settings.init();
