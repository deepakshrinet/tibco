<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:jsx1="http://www.tibco.com/CommonLE2/namespace/Public//Pluggable/GUI/Common/Response">
<xsl:param name="useComparison">0</xsl:param>
<xsl:output encoding="UTF-8" omit-xml-declaration="yes" indent="yes"/>
	<xsl:template match="/">
		<xsl:element name="data">
			<xsl:attribute name="jsxid">jsxroot</xsl:attribute>
			<xsl:choose>
				<xsl:when test="$useComparison='1'">
					<xsl:apply-templates select="//jsx1:LogExceptionCountChart/child::jsx1:AppInfo"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:apply-templates select="//jsx1:ExceptionPercentageChart/child::jsx1:ExceptionCountInfo"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:element>
	</xsl:template>
	<xsl:template match="jsx1:AppInfo">
		<xsl:element name="record">
			<xsl:attribute name="cat"><xsl:value-of select="jsx1:AppName"/></xsl:attribute>
			<xsl:attribute name="s1"><xsl:value-of select="jsx1:LogCount"/></xsl:attribute>
			<xsl:attribute name="s2"><xsl:value-of select="jsx1:ExceptionCount"/></xsl:attribute>
		</xsl:element>
	</xsl:template>
	<xsl:template match="jsx1:ExceptionCountInfo">
		<xsl:element name="record">
			<xsl:attribute name="name"><xsl:value-of select="jsx1:ExceptionResolveTypeName"/></xsl:attribute>
			<xsl:attribute name="value"><xsl:value-of select="jsx1:ExceptionCountValue"/></xsl:attribute>
		</xsl:element>
	</xsl:template>
</xsl:stylesheet>
