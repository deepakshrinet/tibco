<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/ExceptionManagement" xmlns:ns1="http://www.tibco.com/CommonLE2/namespace/Public/Common/RequestHeader.xsd">
	<xsl:output omit-xml-declaration="yes" indent="yes" encoding="UTF-8"/>
	<xsl:template match="/">
		<xsl:element name="data">
			<xsl:attribute name="jsxid">jsxroot</xsl:attribute>
			<xsl:element name="record">
				<xsl:variable name="id">
					<xsl:value-of select="//ns0:ExceptionDetail/child::ExceptionInstanceID"/>
				</xsl:variable>
				<xsl:attribute name="jsxid"><xsl:value-of select="$id"/></xsl:attribute>
				<xsl:for-each select="//ns0:ExceptionDetail/child::*">
					<xsl:if test="name()!='ns1:Header'">
						<xsl:attribute name="{local-name()}"><xsl:value-of select="."/></xsl:attribute>
					</xsl:if>
				</xsl:for-each>
			<xsl:for-each select="//ns0:ExceptionDetail/child::ns1:*">
				<xsl:element name="record">
				<xsl:variable name="instanceId"><xsl:value-of select="//ns0:ExceptionDetail/child::ExceptionInstanceID"/></xsl:variable>
					<xsl:attribute name="jsxid">header_<xsl:value-of select="$instanceId"/></xsl:attribute>
					<xsl:attribute name="jsxtext"><xsl:value-of select="$instanceId"/></xsl:attribute>
					<xsl:attribute name="jsxopen">1</xsl:attribute>
					<xsl:for-each select="child::*">
						<xsl:attribute name="{local-name()}"><xsl:value-of select="."/></xsl:attribute>
					</xsl:for-each>
				</xsl:element>
			</xsl:for-each>
			</xsl:element>
		</xsl:element>
	</xsl:template>
</xsl:stylesheet>
