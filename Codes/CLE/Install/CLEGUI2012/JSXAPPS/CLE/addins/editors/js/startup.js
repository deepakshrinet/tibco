if (window.cle_Editors == null) var cle_Editors = {};
// make the cle_Editors package an event dispatcher
jsx3.util.EventDispatcher.jsxclass.mixin(cle_Editors);
cle_Editors.LOG = jsx3.util.Logger.getLogger('cle_Editors');
cle_Editors.LOG.setLevel(jsx3.util.Logger.OFF); //OFF, ERROR, WARN, DEBUG, TRACE
cle_Editors.LOG.info("now logging at " + cle_Editors.LOG.getLevel());
jsx3.$O(cle_Editors).extend({
  getAddin: function(){
    return jsx3.System.getAddin("user:editors");
  },
  getEngine: function(){
	  return cle_Editors._engine;
  },
  getCache: function(){
	  return cle_Editors._cache;
  },
  setServer: function(objServer){
	  cle_Editors._server = objServer;
  },
  getServer: function(){
	  return cle_Editors._server;
  },
  getMode: function(){
	  return cle_Editors._mode;
  },
  setMode: function(bMode){
	  cle_Editors._mode = bMode;
  },
  getUserId: function(){
	  return cle_Editors._userId;
  },
  setUserId: function(strUserId){
	  cle_Editors._userId = strUserId;
  },
  getUserSessionId: function(){
	  return cle_Editors._userSessionId;
  },
  setUserSessionId: function(strUserSessionId){
	  cle_Editors._userSessionId = strUserSessionId;
  },
  onStartup: function(){
	  cle_Editors.LOG.trace("onStartup");
	  try{
		  var job = jsx3.CLASS_LOADER.loadAddin("amp");
		  job.subscribe("finish", function() {
			  var objEngine = cle_Editors._engine = jsx3.amp.Engine.getEngine(cle_Editors.getServer());
			  cle_Editors.publish({subject: "finish"});
		  });
	  } catch (e){
		  e = jsx3.lang.NativeError.wrap(e);
		  cle_Editors.LOG.error("startup error: " + e.getMessage());
	  }
  }
});
try{
cle_Editors._cache = new jsx3.app.Cache();

cle_Editors.unsubscribeAll("cle_Editors_startup");}catch(e){};
cle_Editors.subscribe("cle_Editors_startup", cle_Editors.onStartup);
/*
 * set the target server for reference
 */
cle_Editors.setServer(app.tibco.CLE);
/*
 * Sets the mode (static jsx3.Boolean.FALSE or live jsx3.Boolean.TRUE).
 *  Overrides the default setting for the context Server instance within which this Service instance is running.
 *  (NOTE: This setting is accessible at the server level via the Project Settings dialog.) Setting this value
 *  to jsx3.Boolean.FALSE, forces a test document to be used to simulate a "typical" server response, instead of
 *  actually sending a request to a remote service. This is useful when setting up test environments as well as
 *  providing "live" interactions when the remote server may not be available.
*/
cle_Editors.setMode(jsx3.Boolean.TRUE);
/*
 * Send message to load the AMP addin and start the processing of the plugins/plugins.xml file.
 */
cle_Editors.publish({subject:"cle_Editors_startup"});

