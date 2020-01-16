/**
 *  This file creates the structures that the other interface elements use.
 */
jsx3.require("jsx3.app.Monitor");
jsx3.require("jsx3.util.Logger");
jsx3.require("jsx3.util.DateFormat");

jsx3.lang.Package.definePackage("cle", function(cle) {
	
	//the following must match the application namespace set in the 'Project Settings' menu.
	cle.SERVER = app.tibco.CLE;
	
	//use the following to send trace comments to the monitor if enabled.
	cle.LOG = jsx3.util.Logger.getLogger("CLE");
	cle.LOG.setLevel(jsx3.util.Logger.TRACE); //OFF
	//TODO: put trace level into persisted settings
	cle.LOG.info("logging at " + cle.LOG.getLevel());

	//the following can be used in development to trace the load time for documents
	if (cle.LOG.getLevel()==jsx3.util.Logger.TRACE){ //could also use 'false' to never or 'true' to always use the pointcut
	    jsx3.require("jsx3.lang.AOP");
	    cle.LOG.trace("building pointcuts for jsx3.xml.Document");
	    jsx3.require("jsx3.xml.Document");

	    try{ jsx3.lang.AOP.pcrem("traceDocLoading");} catch (e){};
        jsx3.lang.AOP.pc("traceDocLoading", {classes:"jsx3.xml.Document", methods:"load"});
        jsx3.lang.AOP.around("traceDocLoading", function(aop, strURL, intTimeout) {
            var t1 = new Date().getTime();
            var rv = aop.proceed(strURL, intTimeout);
            var tTotal = new Date().getTime() - t1;
            cle.LOG.trace("jsx3.xml.Document.load() called on URL " + strURL + " took " + tTotal + " ms.");
            return rv;
        });
        
	    cle.LOG.trace("building pointcuts for jsx3.net.Request");
	    try{ jsx3.lang.AOP.pcrem("traceRequests");} catch (e){};
        jsx3.lang.AOP.pc("traceRequests", {classes:"jsx3.net.Request", methods:"open"});
        jsx3.lang.AOP.around("traceRequests", function(aop, strMethod, strURL, bAsync) {
            var rv = aop.proceed(strMethod, strURL, bAsync);
            cle.LOG.trace("jsx3.net.Request#open " + strURL);
            return rv;
        });
		        
	}

});

jsx3.lang.Package.definePackage("cle.logic", function(logic) {
	logic.CANCEL_BUTTON = 2;
	logic.OK_BUTTON = 1;
	logic.NO_BUTTON = 3;
	/**
	 * runs after the config.xml file elements have loaded but before the initial page is displayed
	 */
	logic.onApplicationLoad = function(){
		cle.LOG.debug("logic#onApplicationLoad");
		logic.LOAD_DATETIME = new Date();
		cle.LOG.trace("cle.logic.onApplicationLoad publishing 'applicationLoaded'");
		cle.SERVER.publish({subject: 'applicationLoaded'});
		cle.main.showLoginPage();
	};
	/**
	 * runs before the application view is unloaded
	 */
	logic.onBeforeUnloadApplication = function(objEvent){
		try{
			cle.LOG.debug("logic#onBeforeUnloadApplication");
			//TODO: determine if any editors have changes and display appropriate message
			var strMessage = cle.utils.getProperty("m_confirmUnloadApplication");
			objEvent.returnValue = strMessage;
		}
		catch (e){
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("logic#onBeforeUnloadApplication error: " + e.getMessage());
		}
		return;
	};
	logic.logOffApplication = function(objJSX, objEvent){
		logic.unloadApplication();
	};
	logic.unloadApplication = function(){
		cle.LOG.debug("logic#unloadApplication");
		var strTitle = cle.utils.getProperty("m_confirmCaption");
		var strMessage = cle.utils.getProperty("m_confirmUnloadApplication");
		var strOk = cle.utils.getProperty("m_ok");
		var strCancel = cle.utils.getProperty("m_cancel");
		var initBtnDefault = logic.CANCEL_BUTTON;
		//parameters may include fields 'width' {int}, 'height' {int}, 'noTitle' {boolean}, and 'nonModal' {boolean}.
		var objParams = {width: 260, height: 160, noTitle: false, nonModal: false};
		var objDialog = cle.SERVER.confirm(
			//caption title
			strTitle,
			//message to display
			strMessage,
			//fctOnOk
			function(objDialog){
				cle.LOG.trace("cle.logic.unloadApplication publishing 'unloadApplication'");
				cle.SERVER.publish({subject: 'unloadApplication'});
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
		//
	};
	/**
	 * sets the login time
	 */
	logic.setLoginDate = function(dLogin) {
		try {
			logic.LOGIN_DATETIME = dLogin;
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("logic#setLoginDate error: " + e.getMessage());
		}
	};
	/**
	 * gets the login time
	 */
	logic.getLoginDate = function() {
		try {
			return logic.LOGIN_DATETIME;
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("logic#getLoginDate error: " + e.getMessage());
		}
	};
	/**
	 * sets the main user id
	 */
	logic.setUserId = function(strUserId) {
		try {
			logic.USER_ID = strUserId;
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("logic#setUserId error: " + e.getMessage());
		}
	};
	/**
	 * gets the main user id
	 */
	logic.getUserId = function() {
		try {
			return logic.USER_ID;
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("logic#getUserId error: " + e.getMessage());
		}
	};
	/**
	 * load all security tab related dependencies
	 * event properties: appIdCacheId, roleCacheId
	 */
	logic.onLoadSecurityTabDependencies = function(objEvent) {
		try {
			cle.LOG.trace("logic#onLoadSecurityTabDependencies");
			//get the available roles array and create CDF
			var roleListDoc = new jsx3.xml.CDF.Document.newDocument();
			cle.roles.getAvailableRoles().when(function(){
				cle.roles.AVAILABLE_ROLES.each(
					function(roleName){
						cle.LOG.trace("logic#onLoadSecurityTabDependencies inserting record for " + roleName);
						roleListDoc.insertRecord({jsxid:jsx3.xml.CDF.getKey(),jsxtext:roleName,jsximg:'images/icons/role.gif'});
				});
				cle.LOG.trace("logic#onLoadSecurityTabDependencies set doc for " + objEvent.roleCacheId);
				cle.SERVER.getCache().setDocument(objEvent.roleCacheId,roleListDoc);
			});
			
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("logic#onLoadSecurityTabDependencies error: " + e.getMessage());
		}
	};
	/**
	 * runs when user is authenticated
	 */
	logic.onUserIdAuthenticated = function(objEvent) {
		try {
			cle.LOG.trace("logic#onUserIdAuthenticated");
			var strUserId = objEvent.userId;
			var strCacheId = objEvent.cacheId;
			logic.setUserId(strUserId);
			logic.setLoginDate(new Date());
			//set the available roles into local array
			var availableRolesRV = cle.roles.getAvailableRoles();
			//set the user roles into local array
			var userRolesRV = cle.roles.getUserRoles(strUserId);
			userRolesRV.when(function(){
				cle.privileges.createPrivilegesFromCache(strCacheId).when(function(isSuccess){
					//check for "Super User" authorization
					cle.privileges.setSuperUser(cle.roles.isSuperUser()==jsx3.Boolean.TRUE);
					cle.LOG.trace("publishing 'readyToLoadMain'");
					cle.SERVER.publish({subject:"readyToLoadMain",userId: strUserId});
				});
			});
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("logic#onUserIdAuthenticated error: " + e.getMessage());
		}
	};
	/**
	 * runs when user is logged off
	 */
	logic.onUnloadApplication = function(objEvent) {
		try {
			cle.LOG.trace("logic#onUnloadApplication");
			logic.setUserId('');
/*			cle.LOG.info("destroying server");
			cle.SERVER.destroy();
			window.location.reload();
			alert("unloaded");
*/		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("logic#onUnloadApplication error: " + e.getMessage());
		}
	};
	/** set of debugging tools that are registered for hot-key use
	 * use: <CTRL><ALT><SHIFT><c> for cache viewer
	 */
	logic._registerTools = function(){
		//open the cache viewer on CTL+ALT+SHIFT+c
		cle.SERVER.registerHotKey(jsx3.$F(function(){
			var window = cle.SERVER.getAppWindow("cache_viewer");
			if (window == null) {
				cle.LOG.trace("window not found, creating new window");
				var strWindowURI = cle.SERVER.resolveURI("interfaces/shared/cacheViewerWindow_gui.xml");
				window = cle.SERVER.loadAppWindow(strWindowURI, cle.SERVER);
				window.onDidOpen = function(objEvent){
					var strURI = cle.SERVER.resolveURI("interfaces/shared/cacheViewer_gui.xml");
					cle.LOG.trace("loading viewer into window.");
					var objRoot = window.getRootBlock();
					if (objRoot != null){
						var objViewer = objRoot.loadAndCache(strURI,false);
						cle.LOG.trace("done loading dialog into window.");
						objRoot.paintChild(objViewer);
						jsx3.sleep(function(){window.focus();});
					}
					else {
						cle.LOG.warn("window root object not found.");
					}
				};
				window.onDidFocus = function(objEvent){
					cle.LOG.trace("window got focus.");
				};
				window.onResize = function(objEvent){
					cle.LOG.trace("after window resized.");
				};
				window.subscribe(jsx3.gui.Window.DID_OPEN, window.onDidOpen);
				window.subscribe(jsx3.gui.Window.WILL_CLOSE,
					function() {
						try{
							window.unsubscribe(jsx3.gui.Window.DID_OPEN,window.onDidOpen);
							window.unsubscribe(jsx3.gui.Interactive.AFTER_RESIZE,window.onResize);
							window.doClose();
						}catch(e){}
					});
				window.subscribe(jsx3.gui.Interactive.AFTER_RESIZE, window.onResize);
				window.subscribe(jsx3.gui.Window.DID_FOCUS, window.onDidFocus);
				window.open();
			} else {
				cle.LOG.trace("found window, opening...");
				window.open();
			}
		}).bind(this),'c', true, true, true);
/*
		//open the dom viewer on CTL+ALT+SHIFT+d
		objServer.registerHotKey(jsx3.$F(function(){
			var window = objServer.getAppWindow("dom_viewer");
			if (window == null) {
				var rsrc = plugIn.getResource("domViewer_window_xml");
				rsrc.load().when(jsx3.$F(function() {
					window = objServer.loadAppWindow(rsrc.getData(), plugIn);
					window.getPlugIn = jsx3.$F(function() { return plugIn; }).bind(this);
					//window.subscribe(jsx3.gui.Window.DID_OPEN, this.windowDidOpen);
					window.subscribe(jsx3.gui.Window.WILL_CLOSE, jsx3.$F(function() { try{window.doClose();}catch(e){} }).bind(this));
					//window.subscribe(jsx3.gui.Window.DID_FOCUS, this.windowDidFocus);

					if (! window.isOpen())
						window.open();
				}).bind(this));
			} else if (!window.isOpen()) {
				window.open();
			}
		}).bind(this),'d', true, true, true);
*/
	};


	//subscriptions
	cle.SERVER.subscribe("userIdAuthenticated", logic.onUserIdAuthenticated);
	cle.SERVER.subscribe("loadSecurityTabDependencies", logic.onLoadSecurityTabDependencies);
	cle.SERVER.subscribe("unloadApplication", logic.onUnloadApplication);
	jsx3.gui.Event.subscribe(jsx3.gui.Event.BEFOREUNLOAD, logic.onBeforeUnloadApplication);
});
cle.logic._registerTools();
