jsx3.lang.Package.definePackage(
  "cle.utils",
  function(utils) {

      utils.LIST_TIMESTAMP_FORMAT = new jsx3.util.DateFormat("yyyy-MM-dd HH:mm:ss");

	    utils.getProperty = function(strProperty){
	     try{
	        var jss = cle.SERVER.getProperties();
	        var p = jss.get(strProperty);
	        return p;
	     } catch (e){
	       e = jsx3.lang.NativeError.wrap(e);
	       cle.LOG.error("utils#getProperty error: " + e.getMessage());
	     }
	   };
		utils.clearValue = function(objJSX, strRecordId) {
			try {
				cle.LOG.trace("utils#clearValue");
				var objRecordNode = objJSX.getRecordNode(strRecordId);
				if (objRecordNode) {
					objRecordNode.setAttribute("jsxvalue", "");
					objJSX.redrawRecord(strRecordId,jsx3.xml.CDF.UPDATE,false);
				}
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("utils#clearValue error: "
						+ e.getMessage());
			}
		};
		utils.clearAllValues = function(objJSX, strRecordId) {
			try {
				cle.LOG.trace("utils#clearAllValues");
				var objRecordNode = objJSX.getRecordNode(strRecordId);
				if (objRecordNode) {
					var objChildNodes = objRecordNode.selectNodes("//record");
					for ( var it = objChildNodes.iterator(); it.hasNext();) {
						it.next().setAttribute("jsxvalue", "");
					}
					objJSX.repaintData();
				}
			} catch (e) {
				e = jsx3.lang.NativeError.wrap(e);
				cle.LOG.error("utils#clearAllValues error: "
						+ e.getMessage());
			}
		};
	    utils.getMonthIndexFromName = function(strMonthName){
	        cle.LOG.trace("utils.getMonthIndexFromName strMonthName: " + strMonthName);
	        strMonthName = strMonthName.toUpperCase();
	        var index = null;
	        switch (strMonthName){
	            case "JAN":
	            case "JANUARY":
	              index = 1;
	              break;
	            case "FEB":
	            case "FEBRUARY":
	              index = 2;
	              break;
	            case "MAR":
	            case "MARCH":
	              index = 3;
	              break;
	            case "APR":
	            case "APRIL":
	              index = 4;
	              break;
	            case "MAY":
	              index = 5;
	              break;
	            case "JUN":
	            case "JUNE":
	              index = 6;
	              break;
	            case "JUL":
	            case "JULY":
	              index = 7;
	              break;
	            case "AUG":
	            case "AUGUST":
	              index = 8;
	              break;
	            case "SEP":
	            case "SEPTEMBER":
	              index = 9;
	              break;
	            case "OCT":
	            case "OCTOBER":
	              index = 10;
	              break;
	            case "NOV":
	            case "NOVEMBER":
	              index = 11;
	              break;
	            case "DEC":
	            case "DECEMBER":
	              index = 12;
	              break;
	        }
	        cle.LOG.trace("utils#getMonthIndexFromName index: " + index);
	        return index;
	    };
	    jsx3.require("jsx3.util.DateFormat");
	    utils.formatTimeT = function(element, cdfkey, matrix, column, rownumber, server) {
	        try{
	            var objRecord = matrix.getRecord(cdfkey);
	            if ((objRecord != null)&&(objRecord.time_t != null)){
	                var intTimeT = Math.floor(objRecord.time_t);
	                if ((intTimeT != null)&& (!isNaN(intTimeT))){
	                    //var df = new jsx3.util.DateFormat("dd/MMM/yy");
	                    //element.innerHTML = df.format(new Date().setTime(intTimeT));
	                    var dInstance = new jsx3.util.DateFormat.getDateTimeInstance(jsx3.util.DateFormat.SHORT, jsx3.util.DateFormat.MEDIUM);
	                    dInstance.setTimeZoneOffset(0);
	                    element.innerHTML = dInstance.format(new Date().setTime(intTimeT));
	                }
	            }
	        }
	        catch (e) {
	           e = jsx3.lang.NativeError.wrap(e);
	           cle.LOG.error("utils#formatTimeT: " + e.getMessage());            
	        }
	    };
	    utils.getDateFromString = function(strValue){
	        cle.LOG.debug("utils.getDateFromString");
	        var isDateFormatted = false;
	        var isDateVoid = jsx3.util.strEmpty(strValue);
	        var mm, dd, yy, dgd;
	        if (!isDateVoid){
	            cle.LOG.trace("utils.getDateFromString not void, value: " + strValue);
	            var pattern = new RegExp("\/");
	            isDateFormatted = pattern.test(strValue);
	            if (isDateFormatted){
	                cle.LOG.trace("utils.getDateFromString has '/'");
	                var str = strValue.split(" ");
	                //create date from formatted text, assume 1/1/2000 is January 1
	                var s = str[0];
	                var p1 = s.indexOf("/");
	                var f1 = s.substring(0,p1);
	                if (isNaN(f1)){
	                   mm = utils.getMonthIndexFromName(f1);
	                }
	                else if(!isNaN(f1)){
	                   //f1 might have been the year or date
	                   if (Number(f1)>2000){
	                   	 yy = f1;
	                   }
	                   else if (Number(f1)>12){
	                   	 dd = f1;
	                   }
	                   else {
	                   	 (mm == null)? mm = f1: dd = f1;
	                   }
	                }
	                var s2 = s.substring(p1+1,s.length);
	                var p2 = s2.indexOf("/");
	                var f2 = s2.substring(0,p2);
	                if (isNaN(f2)){
	                   if ((dd == null)&&(Number(f1)>2000)){
	                   		yy = f1;
	                   }
	                   else {
	                   		dd = f1;
	                   }
	                   mm = utils.getMonthIndexFromName(f2);
	                }
	               else if(!isNaN(f2)){
	                   if (Number(f2)>2000){
	                   	 yy = f2;
	                   }
	                   else if (Number(f2)>12){
	                   	 dd = f2;
	                   }
	                   else {
	                   	 if (mm == null){
	                   	 	mm = f2;
	                   	 }
	                   	 else {
	                   	 	dd = f2;
	                   	 }
	                   }
	                }
	                var f3 = s2.substring(p2+1,s2.length);
	                if (isNaN(f3)){
	                   mm = utils.getMonthIndexFromName(f3);
	                }
	                else if(!isNaN(f3)){
	                   if ((yy == null)||(Number(f3)>2000)){
	                   	 yy = f3;
	                   }
	                   else if ((yy==null)&&(dd != null)&&(mm != null)){
	                   	 yy = 2000 + Number(f3);
	                   }
	                   else if ((mm!=null)&&(dd == null)){
	                   	 dd = f3;
	                   }
	                   else {
	                   	 mm = f3;
	                   }
	                }
	                cle.LOG.trace("utils.getDateFromString mm: " + mm + ", dd: " + dd + ", yy: " + yy);
	                dgd = new Date(mm + "/" + dd + "/" + yy);
	            }
	            else {
	                //the inbound date string does not have a '/' in the string
	                //test for a number and return a date?
	                cle.LOG.trace("utils.getDateFromString not formatted string");
	                return strValue;
	            }
	        }
	        else {
	            //the inbound string is empty.  Maybe return a new date?
	            cle.LOG.trace("utils#getDateFromString found empty string");
	            return strValue;
	        }
	        //return a date object
	        return dgd;
	    };
	    //
	    utils.formatDateForSQL = function(objDate){
	      /* out example: 2011-04-18 15:03:57
	       */
	      try{
	          cle.LOG.debug("utils#formatDateForSQL");
	          var df = new jsx3.util.DateFormat("yyyy-MM-dd HH:mm:ss");
	          var d = (objDate != null)? objDate: new Date();
	          return df.format(d);

	      } catch (e) {
	        e = jsx3.NativeError.wrap(e);
	        cle.LOG.error("utils#formatDateForSQL error: " + e.getMessage());
	      }
	    };
	    utils.formatDateForXML = function(objDate){
	      /* out example: 2011-04-23T00:03:24Z
	       */
	      try{
	          cle.LOG.debug("utils#formatDateForSQL");
	          var df = new jsx3.util.DateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
	          var d = (objDate != null)? objDate: new Date();
	          d = new Date(d.toUTCString());
	          return df.format(d);

	      } catch (e) {
	        e = jsx3.NativeError.wrap(e);
	        cle.LOG.error("utils#formatDateForSQL error: " + e.getMessage());
	      }
	    };
	    /** Format Date object from specific formatted string
	      *  specific format example: 2001-02-03T00:00:00-08:00
	      */
	    utils.makeDateFromString = function(strFormattedDate){
	      /** TODO: error handling and correction */
	      /* input example: 2011-02-03T00:00:00.000-08:00
	       * output: 2011-02-03 03:00:00 AM
	       */
	      try{
	          cle.LOG.trace("utils#makeDateFromString");
	          cle.LOG.trace("utils#makeDateFromString working with: " + strFormattedDate)
	          var datetimeArray = strFormattedDate.split("T");

	          var df = new jsx3.util.DateFormat("yyyy-MM-dd HH:mm:ss");
	          var strDT = datetimeArray[0] + " " + datetimeArray[1].substring(0,8);

	          var fullTimeArray = datetimeArray[1].split(":");
	          var intOffsetHours = new Number(fullTimeArray[2].substring(6,fullTimeArray[2].length));

	          df.setTimeZoneOffset(60 * intOffsetHours);
	          var parsedDate = df.parse(strDT);
	          var outputFormat = new jsx3.util.DateFormat("yyyy-MM-dd hh:mm:ss a");

	          return outputFormat.format(parsedDate);
	      } catch (e) {
	        e = jsx3.NativeError.wrap(e);
	        cle.LOG.error("utils#makeDateFromString error: " + e.getMessage());
	      }
	    };
	     /** This function sets the mask field of the matrix form
	     *   @param objJXS Matrix object
	     *   @param objColumn Child that has the display mask
	     *   @param strRecordId 'jsxid' attribute for record
	     *   @return objMask Child object that will be displayed and can return 'false'
	       */
	     utils.onBeforeEdit = function(objJSX, objColumn, strRecordId) {
	          try{
	              cle.LOG.trace("utils.onBeforeEdit");
	               var objRecordNode = objJSX.getRecordNode(strRecordId);
	               //cle.LOG.trace("utils.onBeforeEdit record: " + objRecordNode.toString());

	               var maskName = objRecordNode.getAttribute("maskName");
	               cle.LOG.trace("utils.onBeforeEdit maskName: " + maskName);
	               var maskValue = objRecordNode.getAttribute("jsxvalue");
	               if (maskName == null) {return false;}
	               if (objRecordNode.getAttribute("uneditable") == "1") {return false;}
	               if (objRecordNode.getAttribute("readOnly") == "1") {return false;}
	               var objMask = objColumn.getChild(maskName);

	               if (objMask.instanceOf("jsx3.xml.Cacheable")) {
		             cle.LOG.trace("utils.onBeforeEdit isCacheable");
	                 var jsxxmlid = objRecordNode.getAttribute("jsxxmlid");
	                 if (jsxxmlid != null) {
	                   objMask.setXMLId(jsxxmlid);
	                 }
	                 else {
	                   var enums = objRecordNode.selectNodes("enum");
	                   objMask.setXMLId(objRecordNode.getAttribute("jsxid")+ "_xml");
	                   objMask.clearXmlData();
	                   for (var it=enums.iterator();it.hasNext();) {
	                     var enumNode = it.next();
	                     var text = enumNode.getAttribute('jsxtext');
	                     var o = new Object();
	                     o.jsxid = text;
	                     o.jsxtext = text;
	                     objMask.insertRecord(o);
	                   }
	                   objMask.setValue(maskValue);
	                 }
	               }
	               cle.LOG.trace("utils.onBeforeEdit return maskName: " + objMask.getName());
	               return {objMASK:objMask};
	          } catch (e) {
	            	e = jsx3.lang.NativeError.wrap(e);
	            	cle.LOG.error("utils#onBeforeEdit error: " + e.getMessage());
	          }
	     };
	     utils.toggleFolderIcon = function(objJSX,strRecordId,isOpen) {
	         try{
	             //toggle between the open and closed icon
	             var strType = objJSX.getRecord(strRecordId).recordType;
	             if (strType){
	                 if (strType!=utils.TYPE_FOLDER){
	                     return false;
	                 }
	             }
	             var strPropName = "jsximg";
	             var strFolderClosedURL = cle.SERVER.resolveURI("images/icons/folder_closed.gif");
	             var strFolderOpenedURL = cle.SERVER.resolveURI("images/icons/folder_opened.gif");
	             var strPropValue = (isOpen)? strFolderOpenedURL : strFolderClosedURL;
	             objJSX.insertRecordProperty(strRecordId, strPropName, strPropValue, true);
	         } catch (e){
	           e = jsx3.lang.NativeError.wrap(e);
	           cle.LOG.error("utils#toggleFolderIcon error: " + e.getMessage());
	         }
	     };
	     utils.togglePlusIcon = function(objJSX) {
	         try{
	             cle.LOG.trace("utils#togglePlusIcon");
	             //toggle between the open and closed icon
	             var strCurrentIcon = objJSX.getSrc();
	             PLUS_ICON = "images/icons/plus.gif";
	             MINUS_ICON = "images/icons/minus.gif";
	             objJSX.setSrc((strCurrentIcon == PLUS_ICON)? MINUS_ICON: PLUS_ICON);
	             //toggle the detail section of the blocks
	             var objGParent = objJSX.getParent().getParent();
	             var objDetailChild = objGParent.getLastChild();
	             if (objDetailChild){
	                 //toggle dislplay
	                 objDetailChild.setDisplay((objDetailChild.getDisplay() == jsx3.gui.Block.DISPLAYBLOCK)? jsx3.gui.Block.DISPLAYNONE: jsx3.gui.Block.DISPLAYBLOCK, false);
	             }
	             objGParent.repaint();

	         } catch (e){
	           e = jsx3.lang.NativeError.wrap(e);
	           cle.LOG.error("utils#togglePlusIcon error: " + e.getMessage());
	         }
	     };
	     utils.onAfterCommit = function(objJSX,strRecordId,objColumn,strValue){
	         try{
	             cle.LOG.trace("utils#onAfterCommit");
	             var strPropName = "hasChanges";
	             var strPropValue = "1";
	             var bRedraw = true;
	             objJSX.insertRecordProperty(strRecordId, strPropName, strPropValue, bRedraw);
	         } catch (e){
	           e = jsx3.lang.NativeError.wrap(e);
	           cle.LOG.error("utils#onAfterCommit error: " + e.getMessage());
	         }
	     };
	     utils.formatMessage = function(objGUI, strRecordId, objMatrix, objColumn, intRowNumber, objServer) {
	         try{
	         } catch (e){
	           e = jsx3.lang.NativeError.wrap(e);
	           cle.LOG.error("utils#onAfterCommit error: " + e.getMessage());
	         }
	     };
	     utils.selectMaskFormat = function(objDiv, strCDFKey, objMatrix, objMatrixColumn, intRowNumber, objServer) {
	    	 try{
	    		 var objMask = objMatrixColumn.getEditMask();
	    		 if (objMask != null && typeof(objMask.getRecordNode) == "function") {
	    			 var objNode = objMatrix.getRecordNode(strCDFKey);
	    			 if (objNode) {
	    				 var strValue = objMatrixColumn.getValueForRecord(strCDFKey);
	    				 var lookupNode = objMask.getRecordNode(strValue);
	    				 objDiv.innerHTML = jsx3.util.strEscapeHTML(
	    						 lookupNode ? lookupNode.getAttribute("jsxtext") : (strValue != null ? strValue : ""));
	    			 }
	    			 objDiv.style.backgroundImage = "URL(JSX/images/select/arrowmask.gif)";
	    			 objDiv.style.backgroundRepeat= "no-repeat";
	    			 objDiv.style.backgroundPosition = "top right";
	    		 }
	    	 } catch (e){
	    		 e = jsx3.lang.NativeError.wrap(e);
	    		 cle.LOG.error("utils#selectMaskFormat error: " + e.getMessage());
	    	 }
	     };
	     utils.formatCell = function(objGUI, strRecordId, objMatrix, objColumn, intRowNumber, objServer) {
	    	 try{
	    		 var objRecord = objMatrix.getRecord(strRecordId);
	    		 /* this was originally designed to remove those attributes the users didn't have access to view */
	    		 var isHidden = objRecord.uneditable;
	    		 if (isHidden == "-1"){
	    			 //objGUI.parentNode.parentNode.parentNode.style.display = "none";  //this works, but flashes. So do following:
	    			 var objParentGUI = objGUI.parentNode.parentNode.parentNode.parentNode.parentNode;
	    			 var objRecordNode = objMatrix.getRecordNode(strRecordId);
	    			 if (objRecordNode){
	    				 var objParentNode = objRecordNode.getParent();
	    				 var objHiddenRecordNode = objParentNode.selectSingleNode("descendant::hidden");
	    				 if (objHiddenRecordNode){
	    					 objHiddenRecordNode.appendChild(objRecordNode);
	    				 }
	    				 else {
	    					 if (objParentNode){
	    						 var objHiddenRecordNode = objParentNode.createNode(jsx3.xml.Entity.TYPEELEMENT, "hidden");
	    						 objHiddenRecordNode.setAttribute("jsxid",jsx3.xml.CDF.getKey());
	    						 objHiddenRecordNode.appendChild(objRecordNode);
	    						 objParentNode.appendChild(objHiddenRecordNode);
	    					 }
	    				 }
	    				 var intViewableChildren = objParentNode.selectNodes("child::record").size();
	    				 if (intViewableChildren == 0){
	    					 //whew... got to go up the chain to hide the <TR>
	    					 objParentGUI.parentNode.parentNode.style.display = "none";
	    				 }                      
	    			 }
	    		 }
	    		 //format the mask image
	    		 var maskName = objRecord.maskName;
	    		 if (!jsx3.util.strEmpty(maskName)){
		    		 switch (maskName){
		    		 case 'selectMask':
		    		 case 'timeframeSelectMask':
			    		 cle.LOG.trace("util#formatCell found: " + maskName);
		    			 objGUI.style.backgroundImage = "URL(JSX/images/select/arrowmask.gif)";
		    			 objGUI.style.backgroundRepeat= "no-repeat";
		    			 objGUI.style.backgroundPosition = "top right";
		    			 break;
		    		 }
	    		 }
	    		 var strDataType = objRecord.dataType;
	    		 switch (strDataType){
	    		 case 'String':
	    			 objGUI.innerHTML = objRecord.jsxvalue;
	    			 break;
	    		 case 'URL':
	    			 objGUI.innerHTML = objRecord.jsxvalue;
	    			 break;
	    		 case 'Checkbox':
	    			 var strValue = objRecord.jsxvalue;
	    			 var strIncluded = cle.utils.getProperty("m_included");
	    			 var strNotIncluded = cle.utils.getProperty("m_notIncluded");
	    			 var strText = (strValue==jsx3.Boolean.TRUE)? strIncluded: strNotIncluded;
	    			 objGUI.innerHTML = '<span style="margin-left:19px;">' + strText + '</span>';
	    			 var strPath = cle.SERVER.resolveURI("images/icons");
	    			 if (strValue==jsx3.Boolean.TRUE){
		    			 objGUI.style.backgroundImage = "URL(" + strPath + "/checked-green.gif)";
	    			 }
	    			 else {
		    			 objGUI.style.backgroundImage = "URL(" + strPath + "/check_unchecked.jpg)";
	    				 
	    			 }
	    			 objGUI.style.backgroundRepeat= "no-repeat";
	    			 objGUI.style.backgroundPosition = "center left";
	    			 break;
	    		 case 'Date':
	    			 var df = new jsx3.util.DateFormat("yyyy-MM-dd");
	    			 var strValue = objRecord.jsxvalue;
	    			 if (jsx3.util.strEmpty(strValue)){
	    				 var sDate = df.format(new Date());
	    				 objGUI.innerHTML = sDate;
	    				 objMatrix.insertRecordProperty(strRecordId, objColumn.getPath(), sDate, true);
	    			 }
	    			 else if (strValue.length > 0 ){
	    				 var d = parseInt(strValue);
	    				 if (!isNaN(d)){
	    					 var sDate = df.format(new Date(d));
	    					 objGUI.innerHTML = sDate;
	    					 //  objMatrix.insertRecordProperty(strRecordId, objColumn.getPath(), sDate, true);
	    				 }
	    			 }
	    			 break;
	    		 case 'Time':
	    			 var tf = new jsx3.util.DateFormat("HH:mm:ss");
	    			 var strValue = objRecord.jsxvalue;
	    			 if (jsx3.util.strEmpty(strValue)){
	    				 objGUI.innerHTML = tf.format(new Date());
	    			 }
	    			 else {
	    				 objGUI.innerHTML = strValue; //TODO: fix data format problem
	    			 }
	    			 break;
	    		 case 'Boolean':
	    			 var strTrue = utils.getProperty('m_true');
	    			 var strFalse = utils.getProperty('m_false');
	    			 if (objRecord.jsxvalue == '1'){
	    				 objGUI.innerHTML = strTrue;
	    			 }
	    			 else if (objRecord.jsxvalue == '1'){
	    				 objGUI.innerHTML = strFalse;
	    			 }
	    			 else {}
	    			 break;
	    		 case 'Number':
	    			 objGUI.innerHTML = objRecord.jsxvalue;
	    			 break;             
	    		 case 'Currency':
	    			 var mf = new jsx3.util.MessageFormat("{0,number,currency}"); //TODO: edit and test currency formatting
	    			 objGUI.innerHTML = mf.format(objRecord.jsxvalue);
	    			 break;
	    		 default:
	    			 //objGUI.innerHTML = objGUI.innerHTML;
	    		 }
	    	 } catch (e){
	           e = jsx3.lang.NativeError.wrap(e);
	           cle.LOG.error("utils#formatCell error: " + e.getMessage());
	         }
	     };
	     /**
		    *  utils.showMask(objJSX, strMessageId, bCentered, intPadding)
		    */
	     utils.showMask = function(objJSX, strMessageId, bCentered, intPadding, strDynamicBGColor) {
	    	 try{
	    		 cle.LOG.trace("utils#showMask");
	    		 var objMask = null;
	    		 var strMessage = null;
	    		 //use a valid jss name for the jsxbgcolor property
	    		 strDynamicBGColor = (!jsx3.util.strEmpty(strDynamicBGColor))? strDynamicBGColor: "maskBGColor";
	    		 var Block = jsx3.gui.Block;
	    		 var Interactive = jsx3.gui.Interactive;
	    		 if ((objJSX != null) && (typeof(objJSX) != "undefined")){
	    			 if ((strMessageId != null) || (typeof(strMessageId) != "undefined")){
	    				 strMessage = strMessageId;
	    			 }
	    			 else {
	    				 strMessage = "&#160;";
	    			 }
	    			 /* note: Use only on blocks with no padding (padding:0px) */
	    			 if (objJSX.instanceOf(jsx3.gui.Block)) {
	    				 //delete any existing mask
	    				 if (typeof(objJSX._jsxmaskid) != "undefined") utils.hideMask();
	    				 //is there an onscreen instance
	    				 var objGUI;
	    				 if(objGUI = objJSX.getRendered()) {
	    					 //get the true height of the block to mask
	    					 var intHeight = objJSX.getAbsolutePosition().H;
	    					 //add/replace "onfocus" method for VIEW (this way there is no problem when serializing the MODEL)
	    					 if (objGUI.onfocus)
	    						 objGUI._jsxonfocus = objGUI.onfocus;
	    					 jsx3.html.addEventListener(objGUI,"onfocus",Block._focusMask);
	    					 //add/replace "tabIndex" setting (also for VIEW)
	    					 if (objGUI.tabIndex) objGUI._jsxtabindex = objGUI.tabIndex;
	    					 objGUI.tabIndex = 0;
	    					 //create the mask child (a jsx3.gui.Block instance) and insert directly into the VIEW
	    					 objJSX._jsxmaskid  = objJSX.getId() + "_mask";
	    					 objMask = (new Block(objJSX._jsxmaskid,0,0,"100%","100%",strMessage)).setOverflow(Block.OVERFLOWHIDDEN).setFontWeight(Block.FONTBOLD).setTextAlign(Block.ALIGNCENTER).setIndex(0).setRelativePosition(0).setZIndex(32000).setDynamicProperty("jsxfontsize","labelFontSize").setDynamicProperty("jsxbgcolor",strDynamicBGColor).setDynamicProperty("jsxcursor","@No").setDynamicProperty("jsxbg","@Mask 70%");
	    					 objMask.setWidth("100%");
	    					 objMask.setHeight("100%");

	    					 //use the following for text to be centered between top and bottom
	    					 if ((typeof(bCentered)!="undefined") && (!jsx3.util.strEmpty(bCentered))){
	    						 if (bCentered){
	    							 objMask.setPadding(parseInt(intHeight / 2));
	    						 }
	    					 }
	    					 else {
	    						 //or use this to place text near the top of pane
	    						 var _PADDING = 8;
	    						 if ((!isNaN(intPadding) && (Number(intPadding)>0)))
	    							 _PADDING = Number(intPadding);
	    						 objMask.setPadding(_PADDING);
	    					 }

	    					 objMask.setEvent("if (objEVENT.tabKey() && objEVENT.shiftKey()) { this.getParent().focus(); }",Interactive.JSXKEYDOWN);
	    					 objMask.setAttribute("onfocus", "var objEVENT = jsx3.gui.Event.wrap(event); if (objEVENT.shiftKey()) { jsx3.GO(this.id).getParent().focus(); }");
	    					 objJSX.setChild(objMask);
	    					 objJSX.paintChild(objMask);
	    				 }
	    			 }
	    		 }
	    		 return objMask;
	    	 } catch (e) {
	    		 e = jsx3.NativeError.wrap(e);
	    		 LOG.error("utils#showMask error: " + e.getMessage());
	    	 }
	     };
		   /** utils.hideMask
		    */
		   utils.hideMask = function(objJSX) {
		      try{
		    	 cle.LOG.trace("utils#hideMask");
		         if ((objJSX != null) && (typeof(objJSX) != "undefined")){
		            var objMask;
		            if(objMask = objJSX.getChild(objJSX._jsxmaskid)) {
		              //update MODEL
		              objJSX.removeChild(objMask);
		              delete objJSX._jsxmaskid;
		              //update VIEW
		              var objGUI;
		              if(objGUI = objJSX.getRendered()) {
		                //remove/replace tabIndex setting used to support masking
		                if (objGUI._jsxtabindex) {
		                  objGUI.tabIndex = objGUI._jsxtabindex;
		                } else {
		                  objGUI.removeAttribute("tabIndex");
		                }
		                //remove/replace onfocus method used to support masking
		                jsx3.html.removeEventListener(objGUI,"onfocus",jsx3.gui.Block._focusMask);
		                if(objGUI._jsxonfocus) {
		                  objGUI.onfocus = objGUI._jsxonfocus;
		                  delete objGUI._jsxonfocus;
		                } else {
		                  //objGUI.onfocus = null;
		                }
		              }
		            }
		        }
		      } catch (e) {
		        e = jsx3.NativeError.wrap(e);
		        cle.LOG.error("utils#hideMask error: " + e.getMessage());
		      }
		    };
  }
);
