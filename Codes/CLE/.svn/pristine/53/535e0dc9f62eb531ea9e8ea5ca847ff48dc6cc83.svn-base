/*********************************************************************** */
/*                 Drop Sequences                                        */
/*********************************************************************** */
DROP SEQUENCE categoryid;
DROP SEQUENCE exceptionid;
DROP SEQUENCE procedureid;
DROP SEQUENCE typeid;
DROP SEQUENCE severityid;
DROP SEQUENCE logid;


/* ********************************************************************** */
/*                 Drop COMMONLE Tables                                   */
/* ********************************************************************** */
DROP TABLE LOG CASCADE CONSTRAINTS;
DROP TABLE EXCEPTIONREC CASCADE CONSTRAINTS;
DROP TABLE LOGALTKEY CASCADE CONSTRAINTS;
DROP TABLE EXCEPTIONRECALTKEY CASCADE CONSTRAINTS;
DROP TABLE TRANSACTIONRENDERCONFIG CASCADE CONSTRAINTS;

DROP TABLE EXCEPTIONCONFIG CASCADE CONSTRAINTS;
DROP TABLE EXCEPTIONPROCEDURE CASCADE CONSTRAINTS;
DROP TABLE EXCEPTIONCATEGORY CASCADE CONSTRAINTS;
DROP TABLE EXCEPTIONSEVERITY CASCADE CONSTRAINTS;
DROP TABLE EXCEPTIONTYPE CASCADE CONSTRAINTS;
DROP TABLE NOTIFICATION CASCADE CONSTRAINTS;

DROP TABLE ACCESSCONTROL CASCADE CONSTRAINTS;

DROP TABLE INTERFACECONFIG CASCADE CONSTRAINTS;
DROP TABLE TARGETSYSTEM CASCADE CONSTRAINTS;

DROP TABLE APPLICATIONS CASCADE CONSTRAINTS;



/* ********************************************************************** */
/*                     Create Sequences                                   */
/* ********************************************************************** */

CREATE SEQUENCE categoryid
  START WITH 10
  MAXVALUE 9999
  MINVALUE 10
  NOCYCLE
  CACHE 100
  NOORDER;


CREATE SEQUENCE exceptionid
  START WITH 10
  NOCYCLE
  CACHE 100
  NOORDER;


CREATE SEQUENCE procedureid
  START WITH 10
  MAXVALUE 9999
  MINVALUE 10
  NOCYCLE
  CACHE 100
  NOORDER;


CREATE SEQUENCE severityid
  START WITH 10
  MAXVALUE 9999
  MINVALUE 10
  NOCYCLE
  CACHE 100
  NOORDER;


CREATE SEQUENCE typeid
  START WITH 10
  MAXVALUE 9999
  MINVALUE 10
  NOCYCLE
  CACHE 100
  NOORDER;


CREATE SEQUENCE logid
  START WITH 10
  NOCYCLE
  CACHE 100
  NOORDER;

/* ********************************************************************** */
/*                 Create CommonLE Tables                                 */
/* ********************************************************************** */
CREATE TABLE APPLICATIONS
(
  applicationid   VARCHAR2(50 BYTE)    NOT NULL,
  NAME        VARCHAR2(125 BYTE),
  description    VARCHAR2(500 BYTE)
);

CREATE TABLE EXCEPTIONCATEGORY
(
  applicationid  VARCHAR2(50 BYTE)              NOT NULL,
  ID			 	NUMBER(10)                     NOT NULL,
  NAME           VARCHAR2(50 BYTE)              NOT NULL,
  description    VARCHAR2(500 BYTE)
);


CREATE TABLE EXCEPTIONPROCEDURE
(
  applicationid  VARCHAR2(50 BYTE)              NOT NULL,
  ID             NUMBER(10)                     NOT NULL,
  NAME           VARCHAR2(50 BYTE)              NOT NULL,
  description    VARCHAR2(500 BYTE)                     ,
  destination    VARCHAR2(250 BYTE)             NOT NULL,
  physicalname   VARCHAR2(250 BYTE)             NOT NULL
);


CREATE TABLE EXCEPTIONSEVERITY
(
  applicationid  VARCHAR2(50 BYTE)              NOT NULL,
  ID             NUMBER(10)                     NOT NULL,
  NAME           VARCHAR2(50 BYTE)              NOT NULL,
  description    VARCHAR2(500 BYTE)
);


CREATE TABLE EXCEPTIONTYPE
(
  applicationid  VARCHAR2(50 BYTE)              NOT NULL,
  ID             NUMBER(10)                     NOT NULL,
  NAME           VARCHAR2(50 BYTE)              NOT NULL,
  description    VARCHAR2(500 BYTE)
);


CREATE TABLE LOG
(
  applicationid	   VARCHAR2(50 BYTE)          NOT NULL,
  logid		   NUMBER(12)                 NOT NULL,
  componentname      VARCHAR2(250 BYTE),
  hostname           VARCHAR2(50 BYTE),
  transactiondomain  VARCHAR2(50 BYTE),
  transactionid      VARCHAR2(50 BYTE),
  transactiontype    VARCHAR2(50 BYTE),
  time_stamp         DATE                       NOT NULL,
  timeduration       INTEGER,
  CATEGORY           VARCHAR2(50 BYTE),
  message            VARCHAR2(1500 BYTE),
  status             VARCHAR2(50 BYTE),
  TRANSACTION        CLOB,
  Filename           VARCHAR2 (100 BYTE),
  LogAudit           INTEGER,
  InterfaceID        VARCHAR2(50  BYTE),
  Transactionsize    INTEGER,
  dataencoding       VARCHAR2(10 BYTE),
  correlationid      VARCHAR2(25),
  renderid           VARCHAR2(50 BYTE)
);


CREATE TABLE TRANSACTIONRENDERCONFIG
(
  applicationid  VARCHAR2(50 BYTE)              NOT NULL,
  renderid       VARCHAR2(50 BYTE)              NOT NULL,
  xslt           CLOB                           NOT NULL,
  css            CLOB                           
);


CREATE TABLE ACCESSCONTROL
(
  applicationid  VARCHAR2(50 BYTE)              NOT NULL,
  rolename       VARCHAR2(50 BYTE)              NOT NULL,
  PRIVILEGE      CLOB                           NOT NULL
);


CREATE TABLE EXCEPTIONCONFIG
(
  applicationid       	VARCHAR2(50 BYTE)         NOT NULL,
  exceptioncode       	VARCHAR2(50 BYTE)         NOT NULL,
  description         	VARCHAR2(125 BYTE)        NOT NULL,
  categoryid          	NUMBER(10)                NOT NULL,
  typeid              	NUMBER(10)                NOT NULL,
  severityid          	NUMBER(10)                NOT NULL,
  replydestination    	VARCHAR2(128 BYTE),
  rolename            	VARCHAR2(50 BYTE),         
  procedureid         	NUMBER(10),                
  notificationchnl    	VARCHAR2(128 BYTE),
  emailto             	VARCHAR2(250 BYTE),
  emailcc             	VARCHAR2(250 BYTE),
  exceptionttl        	INTEGER,
  instruction         	CLOB,
  resolvedelayinterval  INTEGER,
  eventtype           	VARCHAR2(50 BYTE)
);


CREATE TABLE EXCEPTIONREC
(
  applicationid          VARCHAR2(50 BYTE)      NOT NULL,
  exceptionid            NUMBER(10)             NOT NULL,
  exceptioncode          VARCHAR2(50 BYTE)      NOT NULL,
  componentname          VARCHAR2(250 BYTE),
  hostname               VARCHAR2(50 BYTE),
  transactiondomain      VARCHAR2(50 BYTE),
  transactionid          VARCHAR2(50 BYTE),
  transactiontype        VARCHAR2(50 BYTE),
  Filename               VARCHAR2 (100 BYTE),
  InterfaceID            VARCHAR2(50  BYTE),
  time_stamp             TIMESTAMP              NOT NULL,
  message                VARCHAR2(1500 BYTE),
  transactiondata        CLOB,
  transactiondataafter   CLOB,
  notificationchnl       VARCHAR2(128 BYTE),
  replydestination       VARCHAR2(128 BYTE),
  Stacktrace             CLOB,
  status                 VARCHAR2(25 BYTE)      NOT NULL,
  resolutiondescription  VARCHAR2(255 BYTE),
  dataencoding           VARCHAR2(10 BYTE),
  correlationid          VARCHAR2(25),
  renderid               VARCHAR2(50 BYTE),
  resolvedelaytime    	 TIMESTAMP(6)		 , 
  eventtype     	 VARCHAR2(50 BYTE)       ,
  jmsproperties          CLOB,
  custom                 VARCHAR2(255 BYTE)
);


CREATE TABLE INTERFACECONFIG
(
  applicationid       	VARCHAR2(50  BYTE)         NOT NULL,
  Interfaceid       	VARCHAR2(50  BYTE)         NOT NULL,
  interfacename	      	VARCHAR2(250 BYTE),
  interfacetype	        VARCHAR2(25  BYTE)         NOT NULL,
  owner	          	VARCHAR2(25  BYTE),
  sourcesystem         	VARCHAR2(50  BYTE),
  targetsystem         	VARCHAR2(250  BYTE),
  dbuse		    	CHAR(1) 		   NOT NULL,
  transComplexity       VARCHAR2(25  BYTE)  	   NOT NULL, 
  description		VARCHAR2(500 BYTE),
  parentid      	VARCHAR2(50  BYTE), 
  Status		VARCHAR2(10  BYTE), 
  Protocol		VARCHAR2(250 BYTE)
);

CREATE TABLE NOTIFICATION
(
  applicationid  VARCHAR2(50 BYTE)              NOT NULL,
  exceptioncode  VARCHAR2(50 BYTE)              NOT NULL,
  timenotified   TIMESTAMP(6)                   NOT NULL
);

CREATE TABLE TARGETSYSTEM
(
   Applicationid   VARCHAR2(50  BYTE)      NOT NULL,
   Interfaceid     VARCHAR2(50  BYTE)      NOT NULL,
   Name            VARCHAR2(50  BYTE)      NOT NULL
);

CREATE TABLE LOGALTKEY 
(
   logid           NUMBER(12)              NOT NULL, 
   altkeyname      VARCHAR2(255 BYTE)       NOT NULL, 
   altkeyvalue     VARCHAR2(255 BYTE)
);

CREATE TABLE EXCEPTIONRECALTKEY 
(
   exceptionid     NUMBER(10)              NOT NULL,
   altkeyname      VARCHAR2(255 BYTE)       NOT NULL, 
   altkeyvalue     VARCHAR2(255 BYTE)
);


/* ******************************************************************** */
/*                   Initializing tables                                */
/* ******************************************************************** */

INSERT INTO APPLICATIONS
            (applicationid, NAME, description)
     VALUES ('System', 'System Application', 'Reserved Application ID for CLE Application');


INSERT INTO EXCEPTIONCATEGORY
	(applicationid, ID, NAME,description)
	VALUES ('System', 1, 'Technical', 'Technical Error');


INSERT INTO EXCEPTIONTYPE
	(applicationid,ID, NAME,description)
	VALUES ('System', 1, 'Usage','Potential CLE usage problem');


INSERT INTO EXCEPTIONSEVERITY
	(applicationid, ID, NAME, description)
	VALUES ('System', 1, 'High', 'High lever severity');


INSERT INTO EXCEPTIONCONFIG
	(applicationid, exceptioncode, description, categoryid, typeid, Severityid)
	VALUES ('System', 'CLEUSAGE-ERROR', 'CLE Service Request Denied', 1, 1, 1);

COMMIT;

/* ******************************************************************** */
/*                     Create Triggers                                  */
/*                                                                      */
/*  Note: 											*/
/*    Exception ID is not generated internally because the              */
/*    exception handling process requires the exception id after        */
/*    persisting an exception request--persisting does not return the   */
/*    exception id.									*/
/*    Interface ID is also not generate                                 */
/* ******************************************************************** */

CREATE OR REPLACE TRIGGER trigcategory
   BEFORE INSERT
   ON EXCEPTIONCATEGORY
   FOR EACH ROW
BEGIN
   SELECT categoryid.NEXTVAL
     INTO :NEW.ID
     FROM DUAL;
END;
/

CREATE OR REPLACE TRIGGER trigprocedure
   BEFORE INSERT
   ON EXCEPTIONPROCEDURE
   FOR EACH ROW
BEGIN
   SELECT procedureid.NEXTVAL
     INTO :NEW.ID
     FROM DUAL;
END;
/

CREATE OR REPLACE TRIGGER trigseverity
   BEFORE INSERT
   ON EXCEPTIONSEVERITY
   FOR EACH ROW
BEGIN
   SELECT severityid.NEXTVAL
     INTO :NEW.ID
     FROM DUAL;
END;
/

CREATE OR REPLACE TRIGGER trigtype
   BEFORE INSERT
   ON EXCEPTIONTYPE
   FOR EACH ROW
BEGIN
   SELECT typeid.NEXTVAL
     INTO :NEW.ID
     FROM DUAL;
END;
/

--CREATE OR REPLACE TRIGGER triglog
--   BEFORE INSERT
--   ON LOG
--   FOR EACH ROW
--BEGIN
--   SELECT logid.NEXTVAL
--     INTO :NEW.logid
--     FROM DUAL;
--END;
/

/* ******************************************************************** */
/*                     Create Views                                     */
/* ******************************************************************** */

CREATE OR REPLACE VIEW exceptionconfigview (applicationid,
                                            exceptioncode,
                                            description,
                                            replydestination,
                                            rolename,
                                            emailto,
                                            emailcc,
                                            categoryname,
                                            typename,
                                            severityname,
                                            procedurename,
                                            physicalprocedurename,
                                            exceptionttl,
                                            notificationchnl,
                                            procedurechnl,
                                            instruction,
                                            resolvedelayinterval,
eventtype)
AS SELECT config.applicationid, config.exceptioncode, config.description,
          config.replydestination, config.rolename, config.emailto,
          config.emailcc, cat.NAME, tp.NAME, sev.NAME, pro.NAME,
          pro.physicalname, config.exceptionttl, config.notificationchnl,
          pro.destination, config.instruction,config.resolvedelayinterval,config.eventtype
     FROM EXCEPTIONCONFIG config,
          EXCEPTIONCATEGORY cat,
          EXCEPTIONTYPE tp,
          EXCEPTIONSEVERITY sev,
          EXCEPTIONPROCEDURE pro
    WHERE config.categoryid = cat.ID(+)
      AND config.severityid = sev.ID(+)
      AND config.typeid = tp.ID(+)
      AND config.procedureid = pro.ID(+);


CREATE OR REPLACE VIEW exceptiondetailview (exceptionid,
                                            applicationid,
                                            componentname,
                                            hostname,
                                            transactiondomain,
                                            transactionid,
                                            transactiontype,
                                            time_stamp,
                                            status,
                                            exceptioncode,
                                            MESSAGE,
                                            transactiondata,
                                            CATEGORY,
                                            TYPE,
                                            severity,
                                            notificationchnl,
                                            replydestination,
                                            stacktrace,
                                            resolutiondescription,
                                            dataencoding,
                                            renderid,
                                            transactiondataafter,
                                            correlationid,
                                            custom,
                                            filename, 
                                            interfaceid,
                                            resolvedelaytime,
                                            eventtype)
AS SELECT EXP.exceptionid, EXP.applicationid, EXP.componentname, EXP.hostname,
          EXP.transactiondomain, EXP.transactionid, EXP.transactiontype,
          EXP.time_stamp, EXP.status, EXP.exceptioncode, EXP.MESSAGE,
          EXP.transactiondata, cat.NAME, typ.NAME, sev.NAME,
          config.notificationchnl, EXP.replydestination, EXP.stacktrace,
          EXP.resolutiondescription, EXP.dataencoding,EXP.renderid,EXP.transactiondataafter,
          EXP.correlationid,EXP.custom,EXP.filename, EXP.interfaceid, EXP.resolvedelaytime,EXP.eventtype
     FROM EXCEPTIONREC EXP,
          EXCEPTIONCONFIG config,
          EXCEPTIONCATEGORY cat,
          EXCEPTIONTYPE typ,
          EXCEPTIONSEVERITY sev
    WHERE EXP.applicationid = config.applicationid
      AND EXP.exceptioncode = config.exceptioncode
      AND config.categoryid = cat.ID 
      AND config.typeid = typ.ID
      AND config.severityid = sev.ID;


/* ******************************************************************** */
/*                   Setup Constraint and Index for Tables              */
/* ******************************************************************** */

ALTER TABLE APPLICATIONS ADD (
  PRIMARY KEY (applicationid)
  USING INDEX);

ALTER TABLE TRANSACTIONRENDERCONFIG ADD (
  PRIMARY KEY (applicationid, renderid)
    USING INDEX,
  FOREIGN KEY (applicationid)
    REFERENCES APPLICATIONS (applicationid)
  );
  
ALTER TABLE INTERFACECONFIG ADD (
  UNIQUE (applicationid, interfaceid)
    USING INDEX,
  FOREIGN KEY (applicationid)
    REFERENCES APPLICATIONS (applicationid)
  );

ALTER TABLE EXCEPTIONCATEGORY ADD (
  PRIMARY KEY (ID)
    USING INDEX,
  UNIQUE (applicationid, NAME)
    USING INDEX,
  FOREIGN KEY (applicationid)
    REFERENCES APPLICATIONS (applicationid)
  );

ALTER TABLE EXCEPTIONPROCEDURE ADD (
  PRIMARY KEY (ID)
    USING INDEX,
  UNIQUE (applicationid, NAME)
    USING INDEX,
  FOREIGN KEY (applicationid)
    REFERENCES APPLICATIONS (applicationid)
  );

ALTER TABLE EXCEPTIONSEVERITY ADD (
  PRIMARY KEY (ID)
    USING INDEX,
  UNIQUE (applicationid, NAME)
    USING INDEX,
  FOREIGN KEY (applicationid)
    REFERENCES APPLICATIONS (applicationid)
  );

ALTER TABLE EXCEPTIONTYPE ADD (
  PRIMARY KEY (ID)
    USING INDEX,
  UNIQUE (applicationid, NAME)
    USING INDEX,
  FOREIGN KEY (applicationid)
    REFERENCES APPLICATIONS (applicationid)
  );

ALTER TABLE ACCESSCONTROL ADD (
  UNIQUE (applicationid, rolename)
    USING INDEX,
  FOREIGN KEY (applicationid)
    REFERENCES APPLICATIONS (applicationid)
  );

ALTER TABLE EXCEPTIONCONFIG ADD (
  UNIQUE (applicationid,exceptioncode)
    USING INDEX,
  FOREIGN KEY (applicationid)
    REFERENCES APPLICATIONS (applicationid),
  FOREIGN KEY (categoryid)
    REFERENCES EXCEPTIONCATEGORY (ID),
  FOREIGN KEY (typeid)
    REFERENCES EXCEPTIONTYPE (ID),
  FOREIGN KEY (severityid)
    REFERENCES EXCEPTIONSEVERITY (ID),
  FOREIGN KEY (procedureid)
    REFERENCES EXCEPTIONPROCEDURE (ID)
  );

ALTER TABLE EXCEPTIONREC ADD (
  PRIMARY KEY (exceptionid)
    USING INDEX,
  FOREIGN KEY (applicationid, renderid)
    REFERENCES TRANSACTIONRENDERCONFIG(applicationid, renderid),
  FOREIGN KEY (applicationid, interfaceID)
    REFERENCES INTERFACECONFIG(applicationid, interfaceID),
  FOREIGN KEY (applicationid, exceptioncode)
      REFERENCES EXCEPTIONCONFIG(applicationid, exceptioncode), 
  FOREIGN KEY (applicationid)
    REFERENCES APPLICATIONS(applicationid)
);

ALTER TABLE EXCEPTIONRECALTKEY ADD (
   PRIMARY KEY (exceptionid, altkeyname)
      USING INDEX,
   FOREIGN KEY (exceptionid)
      REFERENCES EXCEPTIONREC (exceptionid)
   ON DELETE CASCADE
);

ALTER TABLE LOG ADD (
  PRIMARY KEY (logid)
    USING INDEX,
  FOREIGN KEY (applicationid, renderid)
    REFERENCES TRANSACTIONRENDERCONFIG(applicationid, renderid),
  FOREIGN KEY (applicationid, interfaceID)
    REFERENCES INTERFACECONFIG(applicationid, interfaceID),
  FOREIGN KEY (applicationid)
    REFERENCES APPLICATIONS(applicationid)
);

ALTER TABLE LOGALTKEY ADD (
   PRIMARY KEY (logid, altkeyname)
      USING INDEX,
   FOREIGN KEY (logid)
      REFERENCES LOG (logid)
   ON DELETE CASCADE
);

ALTER TABLE NOTIFICATION ADD (
  UNIQUE (applicationid, exceptioncode)
    USING INDEX );

ALTER TABLE TARGETSYSTEM ADD (
   UNIQUE (ApplicationID, Interfaceid, Name)
     USING INDEX, 
   FOREIGN KEY (applicationid, Interfaceid )
      REFERENCES INTERFACECONFIG(applicationid, Interfaceid)
 ); 

/* ******************************************************************** */
/*                   Retrieve Log List Stored Procedures                */
/* ******************************************************************** */

CREATE OR REPLACE PROCEDURE selectlogrecords (
   querystring   IN       VARCHAR2,
   p_recordset   OUT      sys_refcursor
)
AS
BEGIN
   OPEN p_recordset FOR querystring;

   COMMIT;
END;
/

/* ******************************************************************** */
/*                   Count Records Stored Procedures                    */
/* ******************************************************************** */

DROP FUNCTION logrow_count;

CREATE FUNCTION logrow_count (querystring VARCHAR2)
   RETURN INTEGER
AS
   ROWS   INTEGER;
BEGIN
   EXECUTE IMMEDIATE querystring
                INTO ROWS;

   RETURN ROWS;
END;
/