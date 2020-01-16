<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:param name="attrName">InterfaceID</xsl:param>
<xsl:template match="/">
	<xsl:element name="data">
		<xsl:attribute name="jsxid">jsxroot</xsl:attribute>
		<xsl:for-each select="//record">
			<xsl:element name="record">
			<xsl:for-each select="@*">
			<xsl:choose>
				<xsl:when test="name()=$attrName">	
					<xsl:attribute name="jsxid"><xsl:value-of select="."/></xsl:attribute>
				</xsl:when>
			</xsl:choose>
			</xsl:for-each>
			<xsl:attribute name="jsxtext"><xsl:value-of select="@jsxtext"/></xsl:attribute>
			</xsl:element>
		</xsl:for-each>
	</xsl:element>
</xsl:template>
</xsl:stylesheet>
