<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="urn:tibco.com/v3.0">
			<SOAP-ENV:Body>
				<ns0:ListQuery xmlns:ns0="http://www.tibco.com/schemas/COMMONLENEW/SharedResources/SchemaDefinitions/Public/Pluggable/GUI/Common/ListQuery.xsd">
					<xsl:element name="ns0:Applications">
						<xsl:for-each select="/data/child::record[@jsxid='Applications']/child::record[@jsxvalue='1']">
						<xsl:choose>
							<xsl:when test="@jsxid='AllApps'"></xsl:when>
							<xsl:otherwise>
								<xsl:element name="ns0:Application">
									<ns0:ApplicationID>
										<xsl:value-of select="@jsxid"/>
									</ns0:ApplicationID>
								</xsl:element>
							</xsl:otherwise>
						</xsl:choose>
						</xsl:for-each>
					</xsl:element>
					<xsl:element name="ns0:Criteria">
						<xsl:for-each select="//record[@type='criteria']">
							<xsl:variable name="attrName">
								<xsl:value-of select="@id"/>
							</xsl:variable>
							<xsl:variable name="attrValue">
								<xsl:value-of select="@jsxvalue"/>
							</xsl:variable>
							<xsl:choose>
								<xsl:when test="$attrName='Time_Stamp' and child::record[@jsxid='fromTimestamp']/@jsxvalue!=''">
									<ns0:Criterion>
										<ns0:FieldName>
											<xsl:value-of select="@id"/>
										</ns0:FieldName>
										<ns0:FromValue>
											<xsl:value-of select="child::record[@jsxid='fromTimestamp']/@jsxvalue"/>
										</ns0:FromValue>
										<ns0:ToValue>
											<xsl:value-of select="child::record[@jsxid='toTimestamp']/@jsxvalue"/>
										</ns0:ToValue>
									</ns0:Criterion>
								</xsl:when>
								<xsl:otherwise>
									<xsl:if test="$attrValue!=''">
										<ns0:Criterion>
											<ns0:FieldName>
												<xsl:value-of select="@id"/>
											</ns0:FieldName>
											<ns0:FromValue>
												<xsl:value-of select="@jsxvalue"/>
											</ns0:FromValue>
											<!-- not required for filter type query -->
											<!--
											<ns0:ToValue>
												<xsl:value-of select="@jsxvalue"/>
											</ns0:ToValue>
											-->
										</ns0:Criterion>
									</xsl:if>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:for-each>
					</xsl:element>
					<xsl:element name="ns0:OrderBy">
						<xsl:value-of select="//record[@jsxid='OrderBy'][1]/@jsxvalue"/>
					</xsl:element>
				</ns0:ListQuery>
			</SOAP-ENV:Body>
		</SOAP-ENV:Envelope>
	</xsl:template>
</xsl:stylesheet>
