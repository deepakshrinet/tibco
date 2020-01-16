/*********************************************************************** */
/* Changes                                                               */
/* 1. Sequences and Triggers replaced with Identities                    */
/* 2. Drop tables re ordered based on dependancies CASCADE CONSTRAINTS   */
/* is not available in MSSQL                                             */
/* 3. GO keyword introduced for batch operations                         */
/* 4. VARCHAR2 changed to VARCHAR                                        */
/* 5. NUMBER changed to NUMERIC                                          */
/* 6. DATE changed to SMALLDATETIME                                      */
/* 7. INTEGER changed to BIGINT                                          */
/* 8. CLOB changed to VARCHAR(MAX)                                       */
/* 9. TIMESTAMP changed to DATETIME                                      */
/* 10. TIMESTAMP(6) changed to DATETIME                                  */
/* 11. SINGLE PRIMARY KEY INDEX changed to CLUSTERED INDEX               */
/* 12. Stored Proc updated to have input/ouput of VARCHAR(MAX) from      */
/* VARCHAR with Oracle                                                   */
/* 13. Updated Exception record table to also use identities and updated */
/* BW code accordingly to drop insert into dual and use a stored proc    */
/* which returns the idenitity STOREDPROC INSERTEXECPTIONREC added       */
/*********************************************************************** */

/* ********************************************************************** */
/*                 Drop COMMONLE Tables                                   */
/* ********************************************************************** */
IF OBJECT_ID('LOG') IS NOT NULL DROP TABLE LOG
IF OBJECT_ID('EXCEPTIONREC') IS NOT NULL DROP TABLE EXCEPTIONREC
IF OBJECT_ID('LOGALTKEY') IS NOT NULL DROP TABLE LOGALTKEY
IF OBJECT_ID('EXCEPTIONRECALTKEY') IS NOT NULL DROP TABLE EXCEPTIONRECALTKEY


IF OBJECT_ID('TRANSACTIONRENDERCONFIG') IS NOT NULL DROP TABLE TRANSACTIONRENDERCONFIG

IF OBJECT_ID('ACCESSCONTROL') IS NOT NULL DROP TABLE ACCESSCONTROL

IF OBJECT_ID('EXCEPTIONCONFIG') IS NOT NULL DROP TABLE EXCEPTIONCONFIG
IF OBJECT_ID('EXCEPTIONPROCEDURE') IS NOT NULL DROP TABLE EXCEPTIONPROCEDURE
IF OBJECT_ID('EXCEPTIONCATEGORY') IS NOT NULL DROP TABLE EXCEPTIONCATEGORY
IF OBJECT_ID('EXCEPTIONSEVERITY') IS NOT NULL DROP TABLE EXCEPTIONSEVERITY
IF OBJECT_ID('EXCEPTIONTYPE') IS NOT NULL DROP TABLE EXCEPTIONTYPE
IF OBJECT_ID('NOTIFICATION') IS NOT NULL DROP TABLE NOTIFICATION

GO

IF OBJECT_ID('INTERFACECONFIG') IS NOT NULL DROP TABLE INTERFACECONFIG
IF OBJECT_ID('TARGETSYSTEM') IS NOT NULL DROP TABLE TARGETSYSTEM

IF OBJECT_ID('APPLICATIONS') IS NOT NULL DROP TABLE APPLICATIONS

GO

/* ********************************************************************** */
/*                 Create CommonLE Tables                                 */
/* ********************************************************************** */
CREATE TABLE APPLICATIONS
  (
    APPLICATIONID         VARCHAR(50)         NOT NULL,
    NAME                  VARCHAR(125),
    DESCRIPTION           VARCHAR(500)
  )

CREATE TABLE EXCEPTIONCATEGORY
  (
    APPLICATIONID         VARCHAR(50)         NOT NULL,
    ID                    INT                 IDENTITY(1,1),
    NAME                  VARCHAR(50)         NOT NULL,
    DESCRIPTION           VARCHAR(500)
  )

CREATE TABLE EXCEPTIONPROCEDURE
  (
    APPLICATIONID         VARCHAR(50)         NOT NULL,
    ID                    INT                 IDENTITY(1,1),
    NAME                  VARCHAR(50)         NOT NULL,
    DESCRIPTION           VARCHAR(500),
    DESTINATION           VARCHAR(250)        NOT NULL,
    PHYSICALNAME          VARCHAR(250)        NOT NULL
  )

CREATE TABLE EXCEPTIONSEVERITY
  (
    APPLICATIONID         VARCHAR(50)         NOT NULL,
    ID                    INT                 IDENTITY(1,1),
    NAME                  VARCHAR(50)         NOT NULL,
    DESCRIPTION           VARCHAR(500)
  )

CREATE TABLE EXCEPTIONTYPE
  (
    APPLICATIONID         VARCHAR(50)         NOT NULL,
    ID                    INT                 IDENTITY(1,1),
    NAME                  VARCHAR(50)         NOT NULL,
    DESCRIPTION           VARCHAR(500)
  )

CREATE TABLE LOG
  (
    APPLICATIONID         VARCHAR(50)         NOT NULL,
    LOGID                 INT                 IDENTITY(1,1),
    COMPONENTNAME         VARCHAR(250),
    HOSTNAME              VARCHAR(50),
    TRANSACTIONDOMAIN     VARCHAR(50),
    TRANSACTIONID         VARCHAR(50),
    TRANSACTIONTYPE       VARCHAR(50),
    TIME_STAMP            SMALLDATETIME       NOT NULL,
    TIMEDURATION          BIGINT,
    CATEGORY              VARCHAR(50),
    MESSAGE               VARCHAR(1500),
    STATUS                VARCHAR(50),
    TRANSACTIONDATA       VARCHAR(MAX),
    FILENAME              VARCHAR(100),
    LOGAUDIT              INT,
    INTERFACEID           VARCHAR(50),
    TRANSACTIONSIZE       BIGINT,
    DATAENCODING          VARCHAR(10),
    CORRELATIONID         VARCHAR(25),
    RENDERID              VARCHAR(50)
  )

CREATE TABLE TRANSACTIONRENDERCONFIG
  (
    APPLICATIONID         VARCHAR(50)         NOT NULL,
    RENDERID              VARCHAR(50)         NOT NULL,
    XSLT                  VARCHAR(MAX)        NOT NULL,
    CSS                   VARCHAR(MAX)
  )

CREATE TABLE ACCESSCONTROL
  (
    APPLICATIONID         VARCHAR(50)         NOT NULL,
    ROLENAME              VARCHAR(50)         NOT NULL,
    PRIVILEGE             VARCHAR(MAX)        NOT NULL
  )

CREATE TABLE EXCEPTIONCONFIG
  (
    APPLICATIONID         VARCHAR(50)         NOT NULL,
    EXCEPTIONCODE         VARCHAR(50)         NOT NULL,
    DESCRIPTION           VARCHAR(125)        NOT NULL,
    CATEGORYID            INT                 NOT NULL,
    TYPEID                INT                 NOT NULL,
    SEVERITYID            INT                 NOT NULL,
    REPLYDESTINATION      VARCHAR(128),
    ROLENAME              VARCHAR(50),
    PROCEDUREID           INT,
    NOTIFICATIONCHNL      VARCHAR(128),
    EMAILTO               VARCHAR(250),
    EMAILCC               VARCHAR(250),
    EXCEPTIONTTL          BIGINT,
    INSTRUCTION           VARCHAR(MAX),
    RESOLVEDELAYINTERVAL BIGINT,
    EVENTTYPE             VARCHAR(50)
  )

CREATE TABLE EXCEPTIONREC
  (
    APPLICATIONID         VARCHAR(50)         NOT NULL,
    EXCEPTIONID           INT                 IDENTITY(1,1),
    EXCEPTIONCODE         VARCHAR(50)         NOT NULL,
    COMPONENTNAME         VARCHAR(250),
    HOSTNAME              VARCHAR(50),
    TRANSACTIONDOMAIN     VARCHAR(50),
    TRANSACTIONID         VARCHAR(50),
    TRANSACTIONTYPE       VARCHAR(50),
    FILENAME              VARCHAR(100),
    INTERFACEID           VARCHAR(50),
    TIME_STAMP            DATETIME            NOT NULL,
    MESSAGE               VARCHAR(1500),
    TRANSACTIONDATA       VARCHAR(MAX),
    TRANSACTIONDATAAFTER  VARCHAR(MAX),
    NOTIFICATIONCHNL      VARCHAR(128),
    REPLYDESTINATION      VARCHAR(128),
    STACKTRACE            VARCHAR(MAX),
    STATUS                VARCHAR(25)         NOT NULL,
    RESOLUTIONDESCRIPTION VARCHAR(255),
    DATAENCODING          VARCHAR(10),
    CORRELATIONID         VARCHAR(25),
    RENDERID              VARCHAR(50),
    RESOLVEDELAYTIME      DATETIME,
    EVENTTYPE             VARCHAR(50),
    JMSPROPERTIES         VARCHAR(MAX),
    CUSTOM                VARCHAR(255)
  )


CREATE TABLE INTERFACECONFIG
(
  APPLICATIONID       	VARCHAR(50)       NOT NULL,
  INTERFACEID      	VARCHAR(50)       NOT NULL,
  INTERFACENAME	      	VARCHAR(250),
  INTERFACETYPE	        VARCHAR(25)       NOT NULL,
  OWNER	          	VARCHAR(25),
  SOURCESYSTEM         	VARCHAR(50),
  TARGETSYSTEM         	VARCHAR(250),
  DBUSE 	    	CHAR(1)           NOT NULL,
  TRANSCOMPLEXITY       VARCHAR(25)  	  NOT NULL, 
  DESCRIPTION   	VARCHAR(500),
  PARENTID      	VARCHAR(50), 
  STATUS		VARCHAR(10), 
  PROTOCOL		VARCHAR(250)
);


CREATE TABLE NOTIFICATION
  (
    APPLICATIONID         VARCHAR(50)         NOT NULL,
    EXCEPTIONCODE         VARCHAR(50)         NOT NULL,
    TIMENOTIFIED          DATETIME            NOT NULL
  )


CREATE TABLE TARGETSYSTEM
(
   Applicationid   VARCHAR(50)      NOT NULL,
   Interfaceid     VARCHAR(50)      NOT NULL,
   Name            VARCHAR(50)      NOT NULL
);

CREATE TABLE LOGALTKEY 
(
   LOGID           INT              NOT NULL, 
   ALTKEYNAME      VARCHAR(255)     NOT NULL, 
   ALTKEYVALUE     VARCHAR(100)
);

CREATE TABLE EXCEPTIONRECALTKEY 
(
   EXCEPTIONID     INT              NOT NULL,
   ALTKEYNAME      VARCHAR(255)     NOT NULL, 
   ALTKEYVALUE     VARCHAR(100)
);

GO

/* ******************************************************************** */
/*                   Initializing tables                                */
/* ******************************************************************** */

INSERT INTO APPLICATIONS
            (applicationid, NAME, description)
     VALUES ('System', 'System Application', 'Reserved Application ID for CLE Application');

SET IDENTITY_INSERT  EXCEPTIONCATEGORY ON;
INSERT INTO EXCEPTIONCATEGORY
	(applicationid, ID, NAME,description)
	VALUES ('System', 1, 'Technical', 'Technical Error');
SET IDENTITY_INSERT  EXCEPTIONCATEGORY OFF;

SET IDENTITY_INSERT  EXCEPTIONTYPE ON;
INSERT INTO EXCEPTIONTYPE
	(applicationid,ID, NAME,description)
	VALUES ('System', 1, 'Usage','Potential CLE usage problem');
SET IDENTITY_INSERT  EXCEPTIONTYPE OFF;

SET IDENTITY_INSERT  EXCEPTIONSEVERITY ON;
INSERT INTO EXCEPTIONSEVERITY
	(applicationid, ID, NAME, description)
	VALUES ('System', 1, 'High', 'High lever severity');
SET IDENTITY_INSERT  EXCEPTIONSEVERITY OFF;

INSERT INTO EXCEPTIONCONFIG
	(applicationid, exceptioncode, description, categoryid, typeid, Severityid)
	VALUES ('System', 'CLEUSAGE-ERROR', 'CLE Service Request Denied', 1, 1, 1);

GO

/* ******************************************************************** */
/*                   Setup Constraint and Index for Tables              */
/* ******************************************************************** */

ALTER TABLE APPLICATIONS
  ADD
    PRIMARY KEY CLUSTERED(APPLICATIONID)

ALTER TABLE TRANSACTIONRENDERCONFIG
  ADD
    PRIMARY KEY CLUSTERED(APPLICATIONID, RENDERID),
    FOREIGN KEY (APPLICATIONID) REFERENCES APPLICATIONS (APPLICATIONID)

ALTER TABLE INTERFACECONFIG ADD
  UNIQUE CLUSTERED(APPLICATIONID, INTERFACEID),
  FOREIGN KEY (APPLICATIONID) REFERENCES APPLICATIONS (APPLICATIONID)


ALTER TABLE EXCEPTIONCATEGORY
  ADD
    PRIMARY KEY CLUSTERED(ID),
    UNIQUE (APPLICATIONID, NAME),
    FOREIGN KEY (APPLICATIONID) REFERENCES APPLICATIONS (APPLICATIONID)

ALTER TABLE EXCEPTIONPROCEDURE
  ADD
    PRIMARY KEY CLUSTERED(ID),
    UNIQUE (APPLICATIONID, NAME),
    FOREIGN KEY (APPLICATIONID) REFERENCES APPLICATIONS (APPLICATIONID)

ALTER TABLE EXCEPTIONSEVERITY
  ADD
    PRIMARY KEY CLUSTERED(ID),
    UNIQUE (APPLICATIONID, NAME),
    FOREIGN KEY (APPLICATIONID) REFERENCES APPLICATIONS (APPLICATIONID)

ALTER TABLE EXCEPTIONTYPE
  ADD
    PRIMARY KEY CLUSTERED(ID),
    UNIQUE (APPLICATIONID, NAME),
    FOREIGN KEY (APPLICATIONID) REFERENCES APPLICATIONS (APPLICATIONID)

ALTER TABLE ACCESSCONTROL
  ADD
    UNIQUE CLUSTERED(APPLICATIONID, ROLENAME),
    FOREIGN KEY (APPLICATIONID) REFERENCES APPLICATIONS (APPLICATIONID)

ALTER TABLE EXCEPTIONCONFIG
  ADD
    UNIQUE CLUSTERED(APPLICATIONID, EXCEPTIONCODE),
    FOREIGN KEY (APPLICATIONID) REFERENCES APPLICATIONS (APPLICATIONID),
    FOREIGN KEY (CATEGORYID) REFERENCES EXCEPTIONCATEGORY (ID),
    FOREIGN KEY (TYPEID) REFERENCES EXCEPTIONTYPE (ID),
    FOREIGN KEY (SEVERITYID) REFERENCES EXCEPTIONSEVERITY (ID),
    FOREIGN KEY (PROCEDUREID) REFERENCES EXCEPTIONPROCEDURE (ID)

ALTER TABLE EXCEPTIONREC
  ADD
    PRIMARY KEY CLUSTERED(EXCEPTIONID),
    FOREIGN KEY (APPLICATIONID, RENDERID) REFERENCES TRANSACTIONRENDERCONFIG (APPLICATIONID, RENDERID),
    FOREIGN KEY (APPLICATIONID, INTERFACEID) REFERENCES INTERFACECONFIG (APPLICATIONID, INTERFACEID), 
    FOREIGN KEY (APPLICATIONID, EXCEPTIONCODE) REFERENCES EXCEPTIONCONFIG (APPLICATIONID, EXCEPTIONCODE),
    FOREIGN KEY (APPLICATIONID) REFERENCES APPLICATIONS (APPLICATIONID)

ALTER TABLE EXCEPTIONRECALTKEY
  ADD
    PRIMARY KEY CLUSTERED(EXCEPTIONID, ALTKEYNAME),
    FOREIGN KEY (EXCEPTIONID) REFERENCES EXCEPTIONREC(EXCEPTIONID)

ALTER TABLE LOG
  ADD
    PRIMARY KEY CLUSTERED(LOGID),
    FOREIGN KEY (APPLICATIONID, RENDERID) REFERENCES TRANSACTIONRENDERCONFIG (APPLICATIONID, RENDERID),
    FOREIGN KEY (APPLICATIONID, INTERFACEID) REFERENCES INTERFACECONFIG (APPLICATIONID, INTERFACEID), 
    FOREIGN KEY (APPLICATIONID) REFERENCES APPLICATIONS (APPLICATIONID)

ALTER TABLE LOGALTKEY
  ADD
    PRIMARY KEY CLUSTERED(LOGID, ALTKEYNAME),
    FOREIGN KEY (LOGID) REFERENCES LOG(LOGID)

ALTER TABLE NOTIFICATION
  ADD
    UNIQUE CLUSTERED(APPLICATIONID, EXCEPTIONCODE)

ALTER TABLE TARGETSYSTEM
  ADD
    UNIQUE CLUSTERED(APPLICATIONID, INTERFACEID, NAME),
    FOREIGN KEY (APPLICATIONID, INTERFACEID) REFERENCES INTERFACECONFIG(APPLICATIONID, INTERFACEID)

GO

/* ******************************************************************** */
/*                     Create Views                                     */
/* ******************************************************************** */
IF OBJECT_ID('EXCEPTIONCONFIGVIEW') IS NOT NULL DROP VIEW EXCEPTIONCONFIGVIEW
IF OBJECT_ID('EXCEPTIONDETAILVIEW') IS NOT NULL DROP VIEW EXCEPTIONDETAILVIEW
GO

CREATE VIEW EXCEPTIONCONFIGVIEW
  (
    APPLICATIONID,
    EXCEPTIONCODE,
    DESCRIPTION,
    REPLYDESTINATION,
    ROLENAME,
    EMAILTO,
    EMAILCC,
    CATEGORYNAME,
    TYPENAME,
    SEVERITYNAME,
    PROCEDURENAME,
    PHYSICALPROCEDURENAME,
    EXCEPTIONTTL,
    NOTIFICATIONCHNL,
    PROCEDURECHNL,
    INSTRUCTION,
    RESOLVEDELAYINTERVAL,
    EVENTTYPE
  )
  AS
  SELECT
       CONFIG.APPLICATIONID,
       CONFIG.EXCEPTIONCODE,
       CONFIG.DESCRIPTION,
       CONFIG.REPLYDESTINATION,
       CONFIG.ROLENAME,
       CONFIG.EMAILTO,
       CONFIG.EMAILCC,
       CAT.NAME,
       TP.NAME,
       SEV.NAME,
       PRO.NAME,
       PRO.PHYSICALNAME,
       CONFIG.EXCEPTIONTTL,
       CONFIG.NOTIFICATIONCHNL,
       PRO.DESTINATION,
       CONFIG.INSTRUCTION,
       CONFIG.RESOLVEDELAYINTERVAL,
       CONFIG.EVENTTYPE
  FROM EXCEPTIONCONFIG CONFIG
  LEFT OUTER JOIN EXCEPTIONCATEGORY CAT ON CONFIG.CATEGORYID = CAT.ID
  LEFT OUTER JOIN EXCEPTIONSEVERITY SEV ON CONFIG.SEVERITYID = SEV.ID
  LEFT OUTER JOIN EXCEPTIONTYPE TP ON CONFIG.TYPEID = TP.ID
  LEFT OUTER JOIN EXCEPTIONPROCEDURE PRO ON CONFIG.PROCEDUREID = PRO.ID
GO

CREATE VIEW EXCEPTIONDETAILVIEW
  (
    EXCEPTIONID,
    APPLICATIONID,
    COMPONENTNAME,
    HOSTNAME,
    TRANSACTIONDOMAIN,
    TRANSACTIONID,
    TRANSACTIONTYPE,
    TIME_STAMP,
    STATUS,
    EXCEPTIONCODE,
    MESSAGE,
    TRANSACTIONDATA,
    CATEGORY,
    TYPE,
    SEVERITY,
    NOTIFICATIONCHNL,
    REPLYDESTINATION,
    STACKTRACE,
    RESOLUTIONDESCRIPTION,
    DATAENCODING,
    RENDERID,
    TRANSACTIONDATAAFTER,
    CORRELATIONID,
    CUSTOM,
    FILENAME,
    INTERFCEID,
    RESOLVEDELAYTIME,
    EVENTTYPE
  )
  AS
  SELECT
    EXP.EXCEPTIONID,
    EXP.APPLICATIONID,
    EXP.COMPONENTNAME,
    EXP.HOSTNAME,
    EXP.TRANSACTIONDOMAIN,
    EXP.TRANSACTIONID,
    EXP.TRANSACTIONTYPE,
    EXP.TIME_STAMP,
    EXP.STATUS,
    EXP.EXCEPTIONCODE,
    EXP.MESSAGE,
    EXP.TRANSACTIONDATA,
    CAT.NAME,
    TYP.NAME,
    SEV.NAME,
    CONFIG.NOTIFICATIONCHNL,
    EXP.REPLYDESTINATION,
    EXP.STACKTRACE,
    EXP.RESOLUTIONDESCRIPTION,
    EXP.DATAENCODING,
    EXP.RENDERID,
    EXP.TRANSACTIONDATAAFTER,
    EXP.CORRELATIONID,
    EXP.CUSTOM,
    EXP.FILENAME,
    EXP.INTERFACEID,
    EXP.RESOLVEDELAYTIME,
    EXP.EVENTTYPE
  FROM EXCEPTIONREC EXP,
    EXCEPTIONCONFIG CONFIG,
    EXCEPTIONCATEGORY CAT,
    EXCEPTIONTYPE TYP,
    EXCEPTIONSEVERITY SEV
  WHERE EXP.EXCEPTIONCODE = CONFIG.EXCEPTIONCODE
    AND CONFIG.CATEGORYID = CAT.ID
    AND CONFIG.TYPEID = TYP.ID
    AND CONFIG.SEVERITYID = SEV.ID
GO

/* ******************************************************************** */
/*                   Retrieve Log List Stored Procedures                */
/* ******************************************************************** */
IF OBJECT_ID('SELECTLOGRECORDS') IS NOT NULL DROP PROCEDURE SELECTLOGRECORDS
IF OBJECT_ID('INSERTEXCEPTIONREC') IS NOT NULL DROP PROCEDURE INSERTEXCEPTIONREC
IF OBJECT_ID('INSERTLOG') IS NOT NULL DROP PROCEDURE INSERTLOG
GO

CREATE PROCEDURE SELECTLOGRECORDS
  @QUERYSTRING VARCHAR(MAX)
AS
  BEGIN
    SET NOCOUNT ON

    EXEC (@QUERYSTRING)

    -- IMPLICIT_TRANSACTIONS IS SET TO OFF
    SET NOCOUNT OFF

  END
GO

CREATE PROCEDURE INSERTEXCEPTIONREC
    @APPLICATIONID         VARCHAR(50),
    @EXCEPTIONCODE         VARCHAR(50),
    @COMPONENTNAME         VARCHAR(250),
    @HOSTNAME              VARCHAR(50),
    @TRANSACTIONDOMAIN     VARCHAR(50),
    @TRANSACTIONID         VARCHAR(50),
    @TRANSACTIONTYPE       VARCHAR(50),
    @TIME_STAMP            DATETIME,
    @MESSAGE               VARCHAR(255),
    @TRANSACTIONDATA       VARCHAR(MAX),
    @TRANSACTIONDATAAFTER  VARCHAR(MAX),
    @NOTIFICATIONCHNL      VARCHAR(128),
    @REPLYDESTINATION      VARCHAR(128),
    @STACKTRACE            VARCHAR(MAX),
    @STATUS                VARCHAR(25),
    @RESOLUTIONDESCRIPTION VARCHAR(255),
    @DATAENCODING          VARCHAR(10),
    @CORRELATIONID         VARCHAR(100),
    @RENDERID              VARCHAR(50),
    @INTERFACEID           VARCHAR(50),
    @RESOLVEDELAYTIME      DATETIME,
    @EVENTTYPE             VARCHAR(50),
    @JMSPROPERTIES         VARCHAR(MAX),
    @CUSTOM                VARCHAR(255),
    @EXCEPTIONID           INT                 OUT
AS
  BEGIN

    INSERT EXCEPTIONREC
      (APPLICATIONID,
       EXCEPTIONCODE,
       COMPONENTNAME,
       HOSTNAME,
       TRANSACTIONDOMAIN,
       TRANSACTIONID,
       TRANSACTIONTYPE,
       TIME_STAMP,
       MESSAGE,
       TRANSACTIONDATA,
       TRANSACTIONDATAAFTER,
       NOTIFICATIONCHNL,
       REPLYDESTINATION,
       STACKTRACE,
       STATUS,
       RESOLUTIONDESCRIPTION,
       DATAENCODING,
       CORRELATIONID,
       RENDERID,
       INTERFACEID,
       RESOLVEDELAYTIME,
       EVENTTYPE,
       JMSPROPERTIES,
       CUSTOM)
    VALUES
      (@APPLICATIONID,
       @EXCEPTIONCODE,
       @COMPONENTNAME,
       @HOSTNAME,
       @TRANSACTIONDOMAIN,
       @TRANSACTIONID,
       @TRANSACTIONTYPE,
       @TIME_STAMP,
       @MESSAGE,
       @TRANSACTIONDATA,
       @TRANSACTIONDATAAFTER,
       @NOTIFICATIONCHNL,
       @REPLYDESTINATION,
       @STACKTRACE,
       @STATUS,
       @RESOLUTIONDESCRIPTION,
       @DATAENCODING,
       @CORRELATIONID,
       @RENDERID,
       @INTERFACEID,
       @RESOLVEDELAYTIME,
       @EVENTTYPE,
       @JMSPROPERTIES,
       @CUSTOM)
    SELECT @EXCEPTIONID = SCOPE_IDENTITY()
  END
GO

CREATE PROCEDURE INSERTLOG
    @APPLICATIONID         VARCHAR(50),
    @COMPONENTNAME         VARCHAR(250),
    @HOSTNAME              VARCHAR(50),
    @TRANSACTIONDOMAIN     VARCHAR(50),
    @TRANSACTIONID         VARCHAR(50),
    @TRANSACTIONTYPE       VARCHAR(50),
    @TIME_STAMP            SMALLDATETIME,
    @TIMEDURATION          BIGINT,
    @CATEGORY              VARCHAR(50),
    @MESSAGES              VARCHAR(1500),
    @STATUS                VARCHAR(50),
    @TRANSACTIONDATA      VARCHAR(MAX),
    @FILENAME              VARCHAR(100),
    @LOGAUDIT              INT,
    @INTERFACEID           VARCHAR(50),
    @TRANSACTIONSIZE       BIGINT,
    @DATAENCODING          VARCHAR(10),
    @CORRELATIONID         VARCHAR(25),
    @RENDERID              VARCHAR(50),
    @LOGID                 INT OUT
AS
  BEGIN
    INSERT LOG (
    APPLICATIONID,
    COMPONENTNAME,
    HOSTNAME,
    TRANSACTIONDOMAIN,
    TRANSACTIONID,
    TRANSACTIONTYPE,
    TIME_STAMP,
    TIMEDURATION,
    CATEGORY,
    MESSAGE,
    STATUS,
    TRANSACTIONDATA ,
    FILENAME,
    LOGAUDIT,
    INTERFACEID,
    TRANSACTIONSIZE,
    DATAENCODING ,
    CORRELATIONID,
    RENDERID)
    VALUES
    (  @APPLICATIONID,
       @COMPONENTNAME,     
       @HOSTNAME,        
       @TRANSACTIONDOMAIN,
       @TRANSACTIONID,    
       @TRANSACTIONTYPE,  
       @TIME_STAMP,       
       @TIMEDURATION,     
       @CATEGORY,         
       @MESSAGES,         
       @STATUS,           
       @TRANSACTIONDATA, 
       @FILENAME,         
       @LOGAUDIT,         
       @INTERFACEID,      
       @TRANSACTIONSIZE,  
       @DATAENCODING,     
       @CORRELATIONID,    
       @RENDERID)
    SELECT @LOGID = SCOPE_IDENTITY()
  END
GO


/* ******************************************************************** */
/*                   Count Records Function                             */
/* ******************************************************************** */

IF OBJECT_ID('LOGROW_COUNT') IS NOT NULL DROP FUNCTION LOGROW_COUNT
GO

CREATE FUNCTION LOGROW_COUNT
(
  @QUERYSTRING VARCHAR(MAX)
)
RETURNS INTEGER
AS
  BEGIN

    DECLARE @ROWS INTEGER
    EXECUTE @ROWS = @QUERYSTRING
    RETURN @ROWS

  END
GO