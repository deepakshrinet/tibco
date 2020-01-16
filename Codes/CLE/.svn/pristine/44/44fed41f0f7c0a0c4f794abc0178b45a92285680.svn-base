<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/Log/LogDetail" xmlns:ns1="http://www.tibco.com/CommonLE2/namespace/Public/Common/RequestHeader.xsd">
	<xsl:output omit-xml-declaration="yes" indent="yes" encoding="UTF-8"/>
	<xsl:template match="/">
		<xsl:element name="data">
			<xsl:attribute name="jsxid">jsxroot</xsl:attribute>
			<xsl:for-each select="//ns0:LogDetail">
				<xsl:element name="record">
					<xsl:variable name="id">
						<xsl:value-of select="child::LogID"/>
					</xsl:variable>
					<xsl:attribute name="jsxid"><xsl:value-of select="$id"/></xsl:attribute>
					<xsl:attribute name="jsxtext"><xsl:value-of select="$id"/></xsl:attribute>
					<xsl:attribute name="jsxopen">1</xsl:attribute>
					<xsl:element name="record">
						<xsl:attribute name="jsxid">detail_<xsl:value-of select="$id"/></xsl:attribute>
						<!-- entries within curly braces will be translated using log_ljss.xml lookup -->
						<xsl:attribute name="jsxtext">{log_detail}</xsl:attribute>
						<xsl:attribute name="jsxopen">1</xsl:attribute>
						<xsl:attribute name="jsxcategory">1</xsl:attribute>
						<xsl:for-each select="child::*">
							<xsl:if test="name()!='ns1:Header'">
									<xsl:element name="record">
										<xsl:attribute name="jsxid"><xsl:value-of select="local-name()"/></xsl:attribute>
										<xsl:attribute name="jsxtext">{log_attr<xsl:value-of select="local-name()"/>}</xsl:attribute>
										<xsl:attribute name="jsxvalue"><xsl:value-of select="."/></xsl:attribute>
									</xsl:element>
							</xsl:if>
						</xsl:for-each>
					</xsl:element>
					<xsl:for-each select="child::ns1:*">
						<xsl:element name="record">
							<xsl:attribute name="jsxid">header_<xsl:value-of select="$id"/></xsl:attribute>
							<xsl:attribute name="jsxtext">{log_header}</xsl:attribute>
							<xsl:attribute name="jsxopen">1</xsl:attribute>
							<xsl:attribute name="jsxcategory">1</xsl:attribute>
							<xsl:for-each select="child::*">
								<xsl:if test="local-name()!='Transaction'">
									<xsl:element name="record">
										<xsl:attribute name="jsxid"><xsl:value-of select="local-name()"/></xsl:attribute>
										<xsl:attribute name="jsxtext">{log_attr<xsl:value-of select="local-name()"/>}</xsl:attribute>
										<xsl:attribute name="jsxvalue"><xsl:value-of select="."/></xsl:attribute>
									</xsl:element>
								</xsl:if>
							</xsl:for-each>
						</xsl:element>
					</xsl:for-each>
					<xsl:for-each select="child::ns1:Header/child::ns1:Transaction">
						<xsl:element name="record">
							<xsl:attribute name="jsxid"><xsl:value-of select="local-name()"/></xsl:attribute>
							<xsl:attribute name="jsxtext"><xsl:value-of select="local-name()"/></xsl:attribute>
							<xsl:attribute name="jsxvalue"><xsl:value-of select="."/></xsl:attribute>
						</xsl:element>
					</xsl:for-each>
				</xsl:element>
			</xsl:for-each>
		</xsl:element>
	</xsl:template>
</xsl:stylesheet>
