<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/Configuration/Category">
	<xsl:output omit-xml-declaration="yes" indent="yes" encoding="UTF-8"/>
	<xsl:key name="appIdkey" match="ns0:ExceptionCategory" use="child::ns0:ApplicationID[1]"/>
	<xsl:template match="/">
		<xsl:element name="data">
			<xsl:attribute name="jsxid">jsxroot</xsl:attribute>
				<xsl:for-each select="//ns0:ExceptionCategory[count(.|key('appIdkey',child::ns0:ApplicationID)[1])=1]">
					<xsl:sort select="*[local-name()='ApplicationID']" data-type="text" order="ascending"/>
					<xsl:element name="record">
					<xsl:variable name="id"><xsl:value-of select="child::ns0:ApplicationID[1]"/></xsl:variable>
						<xsl:attribute name="jsxid"><xsl:value-of select="$id"/></xsl:attribute>
						<xsl:apply-templates select="//ns0:ExceptionCategory[child::ns0:ApplicationID=$id]" mode="record">
							<xsl:with-param name="appId"><xsl:value-of select="$id"/></xsl:with-param>
						</xsl:apply-templates>
					</xsl:element>
				</xsl:for-each>
		</xsl:element>
	</xsl:template>
	<xsl:template match="ns0:ExceptionCategory" mode="record">
		<xsl:param name="appId"/>
		<xsl:element name="record">
			<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_category_<xsl:value-of select="child::ns0:CategoryID[1]"/></xsl:attribute>
			<xsl:for-each select="child::*">
				<xsl:variable name="attrName"><xsl:value-of select="local-name()"/></xsl:variable>
					<xsl:if test="$attrName='CategoryName'"><xsl:attribute name="jsxtext"><xsl:value-of select="."/></xsl:attribute></xsl:if>
				<xsl:attribute name="{$attrName}"><xsl:value-of select="."/></xsl:attribute>
			</xsl:for-each>
		</xsl:element>
	</xsl:template>
</xsl:stylesheet>
