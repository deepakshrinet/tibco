/* localization.js */

jsx3.lang.Package.definePackage(
  "cle.localization",
  function(localization) {
    /**
    * Function is executed when user selects the language the menu.
    * @param objMenu {jsx3.gui.Menu}
    * @param strRecordId {String} the CDF record ID of the execute menu record.
    */
    localization.doLoadLocalizeResource = function(objMenu, strRecordId) {
      try{
          cle.LOG.trace("localization#doLoadLocalizeResource");
          var locale = (strRecordId != "-1") ? jsx3.util.Locale.valueOf(strRecordId) : jsx3.util.Locale.valueOf("en_EN");
          cle.LOG.debug("Setting application locale to " + locale + ".");
          // Set the locale of the server to the selected locale
          cle.SERVER.setLocale(locale);
          // We need to tell the server to reload any localized properties
          cle.SERVER.reloadLocalizedResources();
          cle.LOG.trace("localization#doLoadLocalizeResource repainting body block.");
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
						var objJSX = objParent.loadXML(strSerialization,true);
						objJSX.setSourceXML(objXMLSrc);
					}
					else {
						cle.LOG.trace("no parent: " + child.getName());
						child.repaint();
					}
				});
			}
			var objMenuChildren = objBody.findDescendants(function(descendant){return (descendant.instanceOf(jsx3.gui.Menu));}, true, true, false, false);
			if (objMenuChildren != null){
				jsx3.$A(objMenuChildren).each(function(child){
					child.resetXmlCacheData();
					child.repaint();
				});
			}
      } catch (e) {
        e = jsx3.NativeError.wrap(e);
        cle.LOG.error("localization#doLoadLocalizeResource error: " + e.getMessage());
      }
    };
  }
);