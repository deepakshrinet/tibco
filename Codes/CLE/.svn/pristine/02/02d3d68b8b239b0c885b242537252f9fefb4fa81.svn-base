jsx3.Class.defineClass("jsx3.gui.IBlock", jsx3.gui.Block, [], function(IBlock, IBlock_prototype) {
	//INSTANCE INITIALIZER
	IBlock_prototype.init = function(strName,vntLeft,vntTop,vntWidth,vntHeight) {
		this.jsxsuper(strName,vntLeft,vntTop,vntWidth,vntHeight);
	};
	//PAINT
	IBlock_prototype.paint = function() {
		return this.jsxsuper();
	};
	IBlock_prototype.getHead = function() {
		return this._head;
	};
	IBlock_prototype.setHead = function(strHead) {
		this._head = strHead;
	};
	IBlock_prototype.getBody = function() {
		return this._body;
	};
	IBlock_prototype.setBody = function(strBody) {
		this._body = strBody;
	};
	//REPAINT
	IBlock_prototype.onAfterPaint = function() {
		var objGUI = this.getRendered();
		if (objGUI){
			var children = objGUI.childNodes;
			if (children.length >0){
				jsx3.$A(children).each(function(child){
					objGUI.removeChild(child);
				});
			}
			var iframe = document.createElement("IFRAME");
			cle.LOG.trace("IBlock created iframe");
			iframe.setAttribute("application","yes");
			var strId = jsx3.app.DOM.newId(cle.SERVER.getEnv('namespace'));
			var strName = strId + '_iframe';
			iframe.setAttribute("id",strId);
			iframe.setAttribute("name",strName);
			iframe.style.width = "100%";
			iframe.style.height = "100%";
			iframe.style.borderWidth="0px";
			objGUI.appendChild(iframe);
			cle.LOG.trace("IBlock appended iframe");
			var iframeDoc = objGUI.firstChild.contentWindow || objGUI.firstChild.contentDocument;
			if (iframeDoc.document) {
				iframeDoc = iframeDoc.document;
				objGUI.firstChild.contentWindow.onbeforeunload = null;
			}
			if (iframeDoc){
				try {
					cle.LOG.trace("IBlock open iframe");
					iframeDoc.open();
					cle.LOG.trace("IBlock opened iframe");
					var strHTML = '<html><head>' + this._head + '</head><body>' + this._body + '</body></html>';
					cle.LOG.trace("IBlock write content");
					iframeDoc.write(strHTML);
					cle.LOG.trace("IBlock closing iframe");
					iframeDoc.close();
				}
				catch (ex){
					ex = jsx3.NativeError.wrap(ex);
					cle.LOG.error('IBlock error while writing to iframe: ' + ex.getMessage());
					cle.LOG.trace("IBlock removing iframe");
					objGUI.removeChild(iframe);
					//punt
					cle.LOG.trace("IBlock creating Block");
					var objBlock = new jsx3.gui.Block("transactionData",0,0,"100%","100%");
					objBlock.setText(this._body);
					this.setChild(objBlock,jsx3.app.Model.PERSISTNONE);
					this.paintChild(objBlock);
				}
			}
			else {
				cle.LOG.error("IBlock problem getting iframeDoc");
			}
		}
	};
});