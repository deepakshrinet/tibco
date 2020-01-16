--===============================================
--   APPLICATIONS
--===============================================
INSERT INTO APPLICATIONS
            (applicationid, NAME, description)
     VALUES ('RESTART', 'RESTART', 'Interface stop/start in QA/PROD');

--===============================================
--   EXCEPTIONCATEGORY
--===============================================
INSERT INTO EXCEPTIONCATEGORY
	(applicationid, ID, NAME,description)
	VALUES ('RESTART', categoryid.nextval, 'System', 'System Exceptions, such as timeout, db outage.');

INSERT INTO EXCEPTIONCATEGORY (applicationid, ID, NAME,description)	VALUES 
('RESTART', categoryid.nextval, 'Technical', 'Technical Exceptions, such as java,mail,xpath exceptions.');
	
	
--===============================================
--   EXCEPTIONTYPE
--===============================================

Insert into EXCEPTIONTYPE (APPLICATIONID,ID,NAME,DESCRIPTION) values ('RESTART',TYPEID.nextval,'CatchAll','Generic Catch All Exception');
Insert into EXCEPTIONTYPE (APPLICATIONID,ID,NAME,DESCRIPTION) values ('RESTART',TYPEID.nextval,'InvalidData','Invalid Data Exception');
Insert into EXCEPTIONTYPE (APPLICATIONID,ID,NAME,DESCRIPTION) values ('RESTART',TYPEID.nextval,'Unknown','Unknown Exception');
Insert into EXCEPTIONTYPE (APPLICATIONID,ID,NAME,DESCRIPTION) values ('RESTART',TYPEID.nextval,'Login','Login Exception');


--===============================================
--   	EXCEPTIONSEVERITY
--===============================================

Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values ('RESTART',SEVERITYID.nextval,'CRITICAL','Condition that affects service has occurred, Immediate Corrective Action required');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values ('RESTART',SEVERITYID.nextval,'HIGH','Problem with a relatively high severity level has occurred, It is likely that normal use of the object will be impeded');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values ('RESTART',SEVERITYID.nextval,'MEDIUM','Problem with a relatively low severity level has occurred, It is unlikely that normal use of the object will be impeded');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values ('RESTART',SEVERITYID.nextval,'LOW','Problem that affects service will or could occur, Diagnostic and corrective action is recommended');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values ('RESTART',SEVERITYID.nextval,'NORMAL','Message output is normal');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values ('RESTART',SEVERITYID.nextval,'UNKNOWN','Severity level cannot be determined');

--===============================================
--   	EXCEPTIONPROCEDURE
--===============================================

--===============================================
--   	BW EXCEPTIONCONFIG
--===============================================
--Common BW Exceptions

Insert into EXCEPTIONCONFIG (APPLICATIONID,EXCEPTIONCODE,DESCRIPTION,CATEGORYID,TYPEID,SEVERITYID,REPLYDESTINATION,ROLENAME,PROCEDUREID,NOTIFICATIONCHNL,EMAILTO,EMAILCC,EXCEPTIONTTL,RESOLVEDELAYINTERVAL,EVENTTYPE) values ('RESTART','TECHNICAL-100','Invalid Username Password Error',(SELECT EXCEPTIONCATEGORY.ID FROM EXCEPTIONCATEGORY WHERE NAME='System' AND APPLICATIONID='RESTART'),(SELECT EXCEPTIONTYPE.ID FROM EXCEPTIONTYPE WHERE NAME='Login' AND APPLICATIONID='RESTART'),(SELECT EXCEPTIONSEVERITY.ID FROM EXCEPTIONSEVERITY WHERE NAME='HIGH' AND APPLICATIONID='RESTART'),null,null,null,'ZBS.INTEGRATION.CLE.NOTIFICATION','MG-ZIM-WAR-TIBCO-SUP-TEAM@zimmerbiomet.com',null,10,0,null);
Insert into EXCEPTIONCONFIG (APPLICATIONID,EXCEPTIONCODE,DESCRIPTION,CATEGORYID,TYPEID,SEVERITYID,REPLYDESTINATION,ROLENAME,PROCEDUREID,NOTIFICATIONCHNL,EMAILTO,EMAILCC,EXCEPTIONTTL,RESOLVEDELAYINTERVAL,EVENTTYPE) values ('RESTART','TECHNICAL-101','External Command activity generated Error',(SELECT EXCEPTIONCATEGORY.ID FROM EXCEPTIONCATEGORY WHERE NAME='Technical' AND APPLICATIONID='RESTART'),(SELECT EXCEPTIONTYPE.ID FROM EXCEPTIONTYPE WHERE NAME='Unknown' AND APPLICATIONID='RESTART'),(SELECT EXCEPTIONSEVERITY.ID FROM EXCEPTIONSEVERITY WHERE NAME='HIGH' AND APPLICATIONID='RESTART'),null,null,null,'ZBS.INTEGRATION.CLE.NOTIFICATION','MG-ZIM-WAR-TIBCO-SUP-TEAM@zimmerbiomet.com',null,10,0,null);
Insert into EXCEPTIONCONFIG (APPLICATIONID,EXCEPTIONCODE,DESCRIPTION,CATEGORYID,TYPEID,SEVERITYID,REPLYDESTINATION,ROLENAME,PROCEDUREID,NOTIFICATIONCHNL,EMAILTO,EMAILCC,EXCEPTIONTTL,RESOLVEDELAYINTERVAL,EVENTTYPE) values ('RESTART','TECHNICAL-777','Generic Technical Error',(SELECT EXCEPTIONCATEGORY.ID FROM EXCEPTIONCATEGORY WHERE NAME='Technical' AND APPLICATIONID='RESTART'),(SELECT EXCEPTIONTYPE.ID FROM EXCEPTIONTYPE WHERE NAME='CatchAll' AND APPLICATIONID='RESTART'),(SELECT EXCEPTIONSEVERITY.ID FROM EXCEPTIONSEVERITY WHERE NAME='HIGH' AND APPLICATIONID='RESTART'),null,null,null,'ZBS.INTEGRATION.CLE.NOTIFICATION','MG-ZIM-WAR-TIBCO-SUP-TEAM@zimmerbiomet.com',null,10,0,null);


--================================================
--        INTERFACE CONFIG
--================================================
Insert into INTERFACECONFIG (APPLICATIONID,INTERFACEID,INTERFACENAME,INTERFACETYPE,OWNER,SOURCESYSTEM,TARGETSYSTEM,DBUSE,TRANSCOMPLEXITY,DESCRIPTION,PARENTID,STATUS,PROTOCOL) values ('RESTART','Restart_Utility','Restart_Utility','Logical','ZIMMER','TIBCO','TIBCO','N','Medium',null,null,'Active',null);
