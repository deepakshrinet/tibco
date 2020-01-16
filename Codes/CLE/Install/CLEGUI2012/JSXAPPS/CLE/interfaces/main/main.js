jsx3.lang.Package.definePackage("cle.main", function(main) {
	main.SPLASH_WAIT_TIME = 3000; //milliseconds
	
	/**
	 * Display the main user interface page
	 */
	main.showMainPage = function(objEvent) {
		try {
			cle.LOG.debug("main#showMainPage");
			var objParent = cle.SERVER.getJSXByName("paneMiddleMain");

			//load the main page and display it after the splash page is removed
			if (objParent != null) {
				objParent.removeChildren();
				
				var strURI = cle.SERVER.resolveURI("interfaces/main/mainPane_gui.xml");
				var objMainPane = objParent.load(strURI, false);
				//update user id
				var userId = objEvent.userId;
				objMainPane.getDescendantOfName("loggedInUser",true,false).setText(userId);
				//process menubar
				var objMainMenuBar = objMainPane.getDescendantOfName("mainMenuBar",true,false);
				if (objMainMenuBar != null){
					cle.LOG.trace("found objMainMenuBar");
					//add main menu items
				}
				//process toolbar
				var objMainToolBar = objMainPane.getDescendantOfName("mainToolBar",true,false);
				if (objMainToolBar != null){
					cle.LOG.trace("found objMainToolBar");
					//add main toolbar icons
				}
				//the splash page will remove itself after a timeout period
				jsx3.sleep(function(){main.showSplashPage();});
				
				objParent.paintChild(objMainPane);
				cle.SERVER.publish({subject: "mainReady", objJSX: objMainPane});
			}
			
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("main#showMainPage error: " + e.getMessage());
		}
	};
	/**
	 * Display the splash page
	 */
	main.showSplashPage = function(objEvent) {
		try {
			cle.LOG.debug("main#showSplashPage");
			var objParent = cle.SERVER.getBodyBlock();
			if (objParent != null) {
				var strURI = cle.SERVER.resolveURI("interfaces/main/splashDialog_gui.xml");
				var objSplashPage = objParent.load(strURI, true);
				window.setTimeout(function(){objSplashPage.doClose();},cle.main.SPLASH_WAIT_TIME);
			}
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("main#showSplashPage error: " + e.getMessage());
		}
	};
	/**
	 * Display the login page
	 */
	main.showLoginPage = function(objEvent) {
		try {
			cle.LOG.debug("main#showLoginPage");
			var objParent = cle.SERVER.getJSXByName("paneMiddleMain");
			if (objParent != null) {
				objParent.removeChildren();
				var strURI = cle.SERVER.resolveURI("interfaces/login/loginPane_gui.xml");
				var objLoginPane = objParent.load(strURI, false);
				objParent.paintChild(objLoginPane);
			}
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("main#showLoginPage error: " + e.getMessage());
		}
	};
	//subscriptions
	cle.SERVER.subscribe("readyToLoadMain", main.showMainPage);
	cle.SERVER.subscribe("unloadApplication", main.showLoginPage);
});
