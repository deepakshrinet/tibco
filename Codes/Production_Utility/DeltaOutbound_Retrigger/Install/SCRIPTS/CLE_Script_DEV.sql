--===============================================
--   APPLICATIONS
--===============================================
INSERT INTO APPLICATIONS
            (applicationid, NAME, description)
     VALUES ('DELTAOUTBOUND_RETRIGGER', 'DELTAOUTBOUND_RETRIGGER', 'Retriggering failed outbounds');

--===============================================
--   EXCEPTIONCATEGORY
--===============================================

INSERT INTO EXCEPTIONCATEGORY (applicationid, ID, NAME,description)	VALUES 
('DELTAOUTBOUND_RETRIGGER', categoryid.nextval, 'Technical', 'Technical Exceptions, such as java,mail,xpath exceptions.');
	
	
--===============================================
--   EXCEPTIONTYPE
--===============================================

Insert into EXCEPTIONTYPE (APPLICATIONID,ID,NAME,DESCRIPTION) values ('DELTAOUTBOUND_RETRIGGER',TYPEID.nextval,'CatchAll','Generic Catch All Exception');

--===============================================
--   	EXCEPTIONSEVERITY
--===============================================

Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values ('DELTAOUTBOUND_RETRIGGER',SEVERITYID.nextval,'CRITICAL','Condition that affects service has occurred, Immediate Corrective Action required');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values ('DELTAOUTBOUND_RETRIGGER',SEVERITYID.nextval,'HIGH','Problem with a relatively high severity level has occurred, It is likely that normal use of the object will be impeded');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values ('DELTAOUTBOUND_RETRIGGER',SEVERITYID.nextval,'MEDIUM','Problem with a relatively low severity level has occurred, It is unlikely that normal use of the object will be impeded');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values ('DELTAOUTBOUND_RETRIGGER',SEVERITYID.nextval,'LOW','Problem that affects service will or could occur, Diagnostic and corrective action is recommended');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values ('DELTAOUTBOUND_RETRIGGER',SEVERITYID.nextval,'NORMAL','Message output is normal');
Insert into EXCEPTIONSEVERITY (APPLICATIONID,ID,NAME,DESCRIPTION) values ('DELTAOUTBOUND_RETRIGGER',SEVERITYID.nextval,'UNKNOWN','Severity level cannot be determined');

--===============================================
--   	EXCEPTIONPROCEDURE
--===============================================

--===============================================
--   	BW EXCEPTIONCONFIG
--===============================================
--Common BW Exceptions

Insert into EXCEPTIONCONFIG (APPLICATIONID,EXCEPTIONCODE,DESCRIPTION,CATEGORYID,TYPEID,SEVERITYID,REPLYDESTINATION,ROLENAME,PROCEDUREID,NOTIFICATIONCHNL,EMAILTO,EMAILCC,EXCEPTIONTTL,RESOLVEDELAYINTERVAL,EVENTTYPE) values ('DELTAOUTBOUND_RETRIGGER','TECHNICAL-777','Generic Technical Error',(SELECT EXCEPTIONCATEGORY.ID FROM EXCEPTIONCATEGORY WHERE NAME='Technical' AND APPLICATIONID='DELTAOUTBOUND_RETRIGGER'),(SELECT EXCEPTIONTYPE.ID FROM EXCEPTIONTYPE WHERE NAME='CatchAll' AND APPLICATIONID='DELTAOUTBOUND_RETRIGGER'),(SELECT EXCEPTIONSEVERITY.ID FROM EXCEPTIONSEVERITY WHERE NAME='HIGH' AND APPLICATIONID='DELTAOUTBOUND_RETRIGGER'),null,null,null,'ZBS.INTEGRATION.CLE.NOTIFICATION','sreemoy.mohan@zimmerbiomet.com,Kartik.Khurana@zimmerbiomet.com,jahnavi.chandra@zimmerbiomet.com',null,10,0,null);


--================================================
--        INTERFACE CONFIG
--================================================
Insert into INTERFACECONFIG (APPLICATIONID,INTERFACEID,INTERFACENAME,INTERFACETYPE,OWNER,SOURCESYSTEM,TARGETSYSTEM,DBUSE,TRANSCOMPLEXITY,DESCRIPTION,PARENTID,STATUS,PROTOCOL) values ('DELTAOUTBOUND_RETRIGGER','Outbound_Retrigger','Outbound_Retrigger','Logical','ZIMMER','TIBCO','TIBCO','N','Medium',null,null,'Active',null);
