if (cle.Privilege) delete cle.Privilege;
jsx3.lang.Class.defineClass("cle.Privilege", null, null, function(Privilege, Privilege_prototype) {
	Privilege.ID = 0;
	Privilege.VIEW_CONFIGURATIONS = 1;
	Privilege.ADD_CONFIGURATIONS = 2;
	Privilege.EDIT_CONFIGURATIONS = 3;
	Privilege.DELETE_CONFIGURATIONS = 4;
	Privilege.RESOLVE_EXCEPTIONS = 5;
	Privilege.DELETE_EXCEPTIONS = 6;
	Privilege.DELETE_LOGS = 7;
	Privilege.VIEW_LOGS = 8;
	Privilege.VIEW_EXCEPTIONS = 9;
	Privilege.EDIT_TRANSACTIONS = 10;
	
	Privilege._MIN = 1;
	Privilege._MAX = 10;
	
	Privilege_prototype._PRIVILEGES;
	
	Privilege_prototype.init = function(strId){
		this._PRIVILEGES = jsx3.$A(new Array(10));
		this._PRIVILEGES[Privilege.ID] = (!jsx3.util.strEmpty(strId))? strId : -1;
		for (var i=Privilege._MIN;i<=Privilege._MAX;i++)
			this._PRIVILEGES[i] = jsx3.Boolean.FALSE;
	};
	
	Privilege_prototype.addPrivilege = function(intPrivilege) {
		//TODO: add !NaN test
		if ((intPrivilege >= Privilege._MIN)&&(intPrivilege <= Privilege._MAX)){
			this._PRIVILEGES[intPrivilege] = jsx3.Boolean.TRUE;
			return true;
		}
		else return false;
		//TODO: add throws
	};
	Privilege_prototype.removePrivilege = function(intPrivilege) {
		if ((intPrivilege >= Privilege._MIN)&&(intPrivilege <= Privilege._MAX)){
			this._PRIVILEGES[intPrivilege] = jsx3.Boolean.FALSE;
			return true;
		}
		else return false;
		//TODO: add throws
	};
	Privilege_prototype.getId = function() {
		return this._PRIVILEGES[Privilege.ID];
	};
	Privilege_prototype.hasPrivilege = function(intPrivilege) {
		return (this._PRIVILEGES[intPrivilege] == jsx3.Boolean.TRUE)? jsx3.Boolean.TRUE: jsx3.Boolean.FALSE;
	};
	Privilege_prototype.toJson = function() {
		var out = '{';
		for (var i=0;i<=Privilege._MAX;i++){
			out += i + ':' + this._PRIVILEGES[i];
			out += (i<Privilege._MAX)? ', ':'';
		}
		out += '}';
		return out;
	};
	Privilege_prototype.toString = function() {
		var out = '[' + this.getId() + ': ';
		for (var i=Privilege._MIN;i<=Privilege._MAX;i++){
			out += i + '=' + this._PRIVILEGES[i];
			out += (i<Privilege._MAX)? ', ' : '';
		}
		return out + ']';
	};
	
});

jsx3.lang.Package.definePackage("cle.privileges", function(privileges) {
	privileges.USER_PRIVILEGES = [];
	privileges.USER_PRIVILEGES._superUser = false;
	
	privileges.isSuperUser = function() {
		return privileges.USER_PRIVILEGES._superUser;
	};
	privileges.setSuperUser = function(bIsSuperUser) {
		privileges.USER_PRIVILEGES._superUser = bIsSuperUser;
	};

	privileges.getPrivilegesById = function(strId) {
		try {
			return jsx3.$A(privileges.USER_PRIVILEGES).find(function(e){return e.getId()==strId;});
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("privileges#getPrivilegesById error: "
					+ e.getMessage());
		}
	};
	privileges.getPrivilegesByRole = function(strRoleId) {
		try {

		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("privileges#getPrivilegesByRole error: "
					+ e.getMessage());
		}
	};
	privileges.getPrivilegesByUserId = function(strUserId) {
		try {
			//TODO
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("privileges#getPrivilegesByUserId error: "
					+ e.getMessage());
		}
	};
	/**
	 * Event based function to read permissions from CDF and create permission objects
	 */
	privileges.createPrivilegesFromCache = jsx3.$Y(function(cb) {
		 //{subject:"userIdAuthenticated",cacheId:"authorization_cdf",userId: strUserId};
		try {
			cle.LOG.debug("privileges#createPrivilegesFromCache");
			privileges.USER_PRIVILEGES = [];
			var strCacheId = cb.args()[0];
			var objAuthDoc = cle.SERVER.getCache().getDocument(strCacheId);
			if (objAuthDoc != null){
				var objRecordNodes = objAuthDoc.selectNodes("//record");
				if ((objRecordNodes != null)&&(objRecordNodes.size()>0)){
					cle.LOG.trace("privileges#createPrivilegesFromCache authDoc with records: " + objAuthDoc.toString());
					for (var it = objRecordNodes.iterator();it.hasNext();){
						var objRecordNode = it.next();
						var strId = objRecordNode.getAttribute("AppID");
						var objPrivilege = new cle.Privilege(strId);
						//get all attribute nodes where name begins with 'p'
						var objAttrs = objRecordNode.getAttributes().filter(function(attr){
							return (attr.getNodeName().substring(0,1) == "p");
						});
						var nodesIt = objAttrs.iterator();
						while (nodesIt.hasNext()) {
							var node = nodesIt.next();
							var intPrivilegeId = Number(node.getValue());
							if (!isNaN(intPrivilegeId)){
								objPrivilege.addPrivilege(intPrivilegeId);
							}
						}
						privileges.USER_PRIVILEGES.push(objPrivilege);
					}
				}
			}
			cb.done(jsx3.Boolean.TRUE);
		} catch (e) {
			e = jsx3.lang.NativeError.wrap(e);
			cle.LOG.error("privileges#createPrivilegesFromCache error: "
					+ e.getMessage());
			cb.done(jsx3.Boolean.FALSE);
		}
	});
});
