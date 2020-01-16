<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/Configuration/Applications">
<xsl:output omit-xml-declaration="yes" indent="yes" encoding="UTF-8"/>
	<xsl:template match="/">
		<xsl:element name="data">
			<xsl:attribute name="jsxid">jsxroot</xsl:attribute>
			<xsl:for-each select="//ns0:Application">
				<xsl:element name="record">
					<xsl:attribute name="jsxid"><xsl:value-of select="child::ns0:ApplicationID"/></xsl:attribute>
					<xsl:attribute name="jsxtext"><xsl:value-of select="child::ns0:Name"/></xsl:attribute>
					<xsl:attribute name="jsxtip"><xsl:value-of select="child::ns0:Description"/></xsl:attribute>
					<xsl:attribute name="jsxopen">0</xsl:attribute>
					<xsl:attribute name="type">application</xsl:attribute>
				</xsl:element>
			</xsl:for-each>
		</xsl:element>
	</xsl:template>
</xsl:stylesheet>
