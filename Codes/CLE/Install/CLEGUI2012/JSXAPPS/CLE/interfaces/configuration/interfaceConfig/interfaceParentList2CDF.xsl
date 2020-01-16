<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/Configuration/InterfaceConfigList">
	<xsl:output omit-xml-declaration="yes" indent="yes" encoding="UTF-8"/>
	<xsl:template match="/">
		<xsl:element name="data">
			<xsl:attribute name="jsxid">jsxroot</xsl:attribute>
				<xsl:apply-templates select="//ns0:InterfaceParentRecord">
				</xsl:apply-templates>
		</xsl:element>
	</xsl:template>
	<xsl:template match="ns0:InterfaceParentRecord">
		<xsl:variable name="id"><xsl:value-of select="child::ns0:InterfaceID[1]"/></xsl:variable>
		<xsl:element name="record">
			<xsl:attribute name="jsxid"><xsl:value-of select="$id"/></xsl:attribute>
			<xsl:attribute name="jsxtext"><xsl:value-of select="$id"/></xsl:attribute>
			<xsl:for-each select="child::*">
				<xsl:attribute name="{local-name()}"><xsl:value-of select="."/></xsl:attribute>
			</xsl:for-each>
		</xsl:element>
	</xsl:template>
</xsl:stylesheet>
