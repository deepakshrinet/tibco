<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<xsl:variable name="description"><xsl:value-of select="//description"/></xsl:variable>
		<xsl:variable name="status"><xsl:value-of select="//status"/></xsl:variable>
		<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="urn:tibco.com/v3.0">
			<SOAP-ENV:Body>
				<ns0:ExceptionResolutionRecordList xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/Exception/ExceptionResolution">
					<xsl:for-each select="//exception">
						<ns0:ExceptionResolutionRecord>
							<ns0:ExceptionID><xsl:value-of select="@id"/></ns0:ExceptionID>
							<ns0:ResolutionDesc><xsl:value-of select="$description"/></ns0:ResolutionDesc>
							<ns0:Status><xsl:value-of select="$status"/></ns0:Status>
							<xsl:choose>
								<xsl:when test="//resolution/child::transaction">
									<ns0:TransactionUpdate><xsl:value-of select="//resolution/child::transaction"/></ns0:TransactionUpdate>
								</xsl:when>
							</xsl:choose>
						</ns0:ExceptionResolutionRecord>
					</xsl:for-each>
				</ns0:ExceptionResolutionRecordList>
			</SOAP-ENV:Body>
		</SOAP-ENV:Envelope>
	</xsl:template>
</xsl:stylesheet>
