--===============================================
--   APPLICATIONS ApplicationName = ""
--===============================================
INSERT INTO APPLICATIONS(applicationid, NAME, description)VALUES ('LiveLink', 'LiveLink', 'LiveLink Interface.');

--===============================================
--   EXCEPTIONCATEGORY
--===============================================
INSERT INTO EXCEPTIONCATEGORY (applicationid, ID, NAME,description)	VALUES 
('LiveLink', categoryid.nextval, 'System', 'System Exceptions, such as timeout, db outage,jms exception');
INSERT INTO EXCEPTIONCATEGORY (applicationid, ID, NAME,description)	VALUES 
('LiveLink', categoryid.nextval, 'Technical', 'Technical Exceptions, such as java,mail,xpath exceptions.');

	
--===============================================
--   EXCEPTIONTYPE
--===============================================

Insert into EXCEPTIONTYPE (APPLICATIONID,ID,NAME,DESCRIPTION) values 
('LiveLink',TYPEID.nextval,'Timeout','Timeout Exception');
Insert into EXCEPTIONTYPE (APPLICATIONID,ID,NAME,DESCRIPTION) values 
('LiveLink',TYPEID.nextval,'InvalidHTTPConf','HttpClientException,HttpServerException,HttpCommunicationException');
Insert into EXCEPTIONTYPE (APPLICATIONID,ID,NAME,DESCRIPTION) values 
('LiveLink',TYPEID.nextval,'CatchAll','Generic Catch All Exception');


--===============================================
--   	EXCEPTIONSEVERITY
--===============================================

Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values 
('LiveLink',SEVERITYID.nextval,'CRITICAL','Condition that affects service has occurred, Immediate Corrective Action required');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values 
('LiveLink',SEVERITYID.nextval,'HIGH','Problem with a relatively high severity level has occurred, It is likely that normal use of the object will be impeded');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values 
('LiveLink',SEVERITYID.nextval,'MEDIUM','Problem with a relatively low severity level has occurred, It is unlikely that normal use of the object will be impeded');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values
 ('LiveLink',SEVERITYID.nextval,'LOW','Problem that affects service will or could occur, Diagnostic and corrective action is recommended');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values 
('LiveLink',SEVERITYID.nextval,'NORMAL','Message output is normal');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values 
('LiveLink',SEVERITYID.nextval,'UNKNOWN','Severity level cannot be determined');
--===============================================
--   	EXCEPTIONPROCEDURE
--===============================================

--===============================================
--   	BW EXCEPTIONCONFIG
--===============================================
--Common BW Exceptions



Insert into EXCEPTIONCONFIG (APPLICATIONID,EXCEPTIONCODE,DESCRIPTION,CATEGORYID,TYPEID,SEVERITYID,REPLYDESTINATION,ROLENAME,PROCEDUREID,NOTIFICATIONCHNL,EMAILTO,EMAILCC,EXCEPTIONTTL,RESOLVEDELAYINTERVAL,EVENTTYPE) values 
('LiveLink','TECHNICAL-777','Generic Technical Exception',(SELECT EXCEPTIONCATEGORY.ID FROM EXCEPTIONCATEGORY WHERE NAME='Technical' AND APPLICATIONID='LiveLink'),(SELECT EXCEPTIONTYPE.ID FROM EXCEPTIONTYPE WHERE NAME='CatchAll' AND APPLICATIONID='LiveLink'),(SELECT EXCEPTIONSEVERITY.ID FROM EXCEPTIONSEVERITY WHERE NAME='HIGH' AND APPLICATIONID='LiveLink'),null,null,null,'ZBS.INTEGRATION.CLE.NOTIFICATION','rishabh.singhal@zimmerbiomet.com,Sreemoy.Mohan@zimmerbiomet.com',null,10,0,null);

Insert into EXCEPTIONCONFIG (APPLICATIONID,EXCEPTIONCODE,DESCRIPTION,CATEGORYID,TYPEID,SEVERITYID,REPLYDESTINATION,ROLENAME,PROCEDUREID,NOTIFICATIONCHNL,EMAILTO,EMAILCC,EXCEPTIONTTL,RESOLVEDELAYINTERVAL,EVENTTYPE) values 
('LiveLink','TECHNICAL-101','Connection Timeout',(SELECT EXCEPTIONCATEGORY.ID FROM EXCEPTIONCATEGORY WHERE NAME='System' AND APPLICATIONID='LiveLink'),(SELECT EXCEPTIONTYPE.ID FROM EXCEPTIONTYPE WHERE NAME='Timeout' AND APPLICATIONID='LiveLink'),(SELECT EXCEPTIONSEVERITY.ID FROM EXCEPTIONSEVERITY WHERE NAME='HIGH' AND APPLICATIONID='LiveLink'),null,null,null,'ZBS.INTEGRATION.CLE.NOTIFICATION','rishabh.singhal@zimmerbiomet.com,jahnavi.chandra@zimmerbiomet.com,Sreemoy.Mohan@zimmerbiomet.com',null,10,0,null);

Insert into EXCEPTIONCONFIG (APPLICATIONID,EXCEPTIONCODE,DESCRIPTION,CATEGORYID,TYPEID,SEVERITYID,REPLYDESTINATION,ROLENAME,PROCEDUREID,NOTIFICATIONCHNL,EMAILTO,EMAILCC,EXCEPTIONTTL,RESOLVEDELAYINTERVAL,EVENTTYPE) values 
('LiveLink','TECHNICAL-111','HTTP_Exception',(SELECT EXCEPTIONCATEGORY.ID FROM EXCEPTIONCATEGORY WHERE NAME='System' AND APPLICATIONID='LiveLink'),(SELECT EXCEPTIONTYPE.ID FROM EXCEPTIONTYPE WHERE NAME='InvalidHTTPConf' AND APPLICATIONID='LiveLink'),(SELECT EXCEPTIONSEVERITY.ID FROM EXCEPTIONSEVERITY WHERE NAME='HIGH' AND APPLICATIONID='LiveLink'),null,null,null,'ZBS.INTEGRATION.CLE.NOTIFICATION','rishabh.singhal@zimmerbiomet.com,jahnavi.chandra@zimmerbiomet.com,Sreemoy.Mohan@zimmerbiomet.com',null,10,0,null);


--================================================
--        INTERFACE CONFIG
--================================================

Insert into INTERFACECONFIG (APPLICATIONID,INTERFACEID,INTERFACENAME,INTERFACETYPE,OWNER,SOURCESYSTEM,TARGETSYSTEM,DBUSE,TRANSCOMPLEXITY,DESCRIPTION,PARENTID,STATUS,PROTOCOL) values 
('LiveLink','RECEIVELIVELINKREQUEST','RECEIVELIVELINKREQUEST','Logical','Zimmer','TIBCO','LiveLink','N','Medium',null,null,'Active',null);

Insert into INTERFACECONFIG (APPLICATIONID,INTERFACEID,INTERFACENAME,INTERFACETYPE,OWNER,SOURCESYSTEM,TARGETSYSTEM,DBUSE,TRANSCOMPLEXITY,DESCRIPTION,PARENTID,STATUS,PROTOCOL) values 
('LiveLink','UPLOAD','UPLOAD','Logical','Zimmer','TIBCO','LiveLink','N','Medium',null,null,'Active',null);


Insert into INTERFACECONFIG (APPLICATIONID,INTERFACEID,INTERFACENAME,INTERFACETYPE,OWNER,SOURCESYSTEM,TARGETSYSTEM,DBUSE,TRANSCOMPLEXITY,DESCRIPTION,PARENTID,STATUS,PROTOCOL) values 
('LiveLink','PublishToUpload','PublishToUpload','Logical','Zimmer','SF','TIBCO','Medium',null,null,'Active',null);


