<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/Configuration/InterfaceConfigDetail">
	<xsl:output omit-xml-declaration="yes" indent="yes" encoding="UTF-8"/>
	<xsl:param name="parentId">unknown</xsl:param>
	<xsl:template match="/">
		<xsl:element name="data">
			<xsl:attribute name="jsxid">jsxroot</xsl:attribute>
			<xsl:element name="record">
			<xsl:attribute name="jsxid"><xsl:value-of select="$parentId"/></xsl:attribute>
				<xsl:apply-templates select="//ns0:InterfaceConfig">
					<xsl:with-param name="appId"><xsl:value-of select="$parentId"/></xsl:with-param>
				</xsl:apply-templates>
			</xsl:element>
		</xsl:element>
	</xsl:template>
	<xsl:template match="ns0:InterfaceConfig">
		<xsl:param name="appId"/>
		<xsl:variable name="id"><xsl:value-of select="child::ns0:InterfaceID[1]"/></xsl:variable>
		<xsl:element name="record">
			<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_interface_<xsl:value-of select="$id"/></xsl:attribute>
			<xsl:for-each select="child::*">
				<xsl:variable name="attrName"><xsl:value-of select="local-name()"/></xsl:variable>
					<xsl:if test="$attrName='InterfaceID'">
					<xsl:variable name="attrValue"><xsl:value-of select="."/></xsl:variable>
					<xsl:attribute name="jsxtext">
						<xsl:choose>
							<xsl:when test="string-length($attrValue)=0"><xsl:value-of select="$id"/></xsl:when>
							<xsl:otherwise><xsl:value-of select="$attrValue"/></xsl:otherwise>
						</xsl:choose>
					</xsl:attribute></xsl:if>
				<xsl:attribute name="{$attrName}"><xsl:value-of select="."/></xsl:attribute>
			</xsl:for-each>
		</xsl:element>
	</xsl:template>
</xsl:stylesheet>
