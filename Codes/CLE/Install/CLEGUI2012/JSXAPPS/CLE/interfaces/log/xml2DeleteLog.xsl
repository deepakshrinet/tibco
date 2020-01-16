<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="urn:tibco.com/v3.0" xmlns:jsx1="http://www.tibco.com/CommonLE2/namespace/Public//Pluggable/GUI/Common">
			<SOAP-ENV:Body>
				<jsx1:Query>
					<xsl:for-each select="//record">
						<jsx1:ID><xsl:value-of select="@jsxid"/></jsx1:ID>
					</xsl:for-each>
				</jsx1:Query>
			</SOAP-ENV:Body>
		</SOAP-ENV:Envelope>
	</xsl:template>
</xsl:stylesheet>
