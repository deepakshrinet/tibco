<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format">
	<xsl:template match="/">
		<xsl:element name="data">
			<xsl:attribute name="jsxid">jsxroot</xsl:attribute>
			<xsl:variable name="recordId">
				<xsl:value-of select="/data/record/@jsxid"/>
			</xsl:variable>
			<xsl:element name="record">
				<xsl:attribute name="jsxid">header</xsl:attribute>
				<xsl:for-each select="//record/@*">
					<xsl:if test="not(starts-with(name(),'jsx'))">
						<xsl:choose>
							<xsl:when test="starts-with(name(),'hasChanges')"/>
							<xsl:when test="name()='XSLT'">
							</xsl:when>
							<xsl:when test="name()='CSS'">
							</xsl:when>
							<xsl:otherwise>
								<xsl:element name="record">
									<xsl:attribute name="jsxid"><xsl:value-of select="local-name()"/></xsl:attribute>
									<xsl:attribute name="jsxtext">{renderConfig_<xsl:value-of select="local-name()"/>}</xsl:attribute>
									<xsl:attribute name="jsxvalue"><xsl:value-of select="."/></xsl:attribute>
									<xsl:attribute name="maskName">textboxMask</xsl:attribute>
									<!-- changed the view to exclude edits on all attributes
								        <xsl:if test="name()='ApplicationID' or name()='ExceptionCode'">
								        	<xsl:attribute name="readOnly">1</xsl:attribute>
								        </xsl:if>
								        -->
									<xsl:attribute name="readOnly">1</xsl:attribute>
									<xsl:attribute name="referenceId"><xsl:value-of select="$recordId"/></xsl:attribute>
									<xsl:attribute name="attrName"><xsl:value-of select="name()"/></xsl:attribute>
								</xsl:element>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:if>
				</xsl:for-each>
			</xsl:element>
			<xsl:element name="record">
				<xsl:attribute name="jsxid">details</xsl:attribute>
				<xsl:attribute name="jsxtext">details</xsl:attribute>
				<xsl:apply-templates select="/data/record[1]" mode="XSLT"/>
				<xsl:apply-templates select="/data/record[1]" mode="CSS"/>
			</xsl:element>
		</xsl:element>
	</xsl:template>
	<xsl:template match="record" mode="XSLT">
		<xsl:element name="record">
			<xsl:attribute name="jsxid">XSLT</xsl:attribute>
			<xsl:attribute name="jsxtext">{renderConfig_XSLT}</xsl:attribute>
			<xsl:attribute name="jsxvalue"><xsl:value-of select="attribute::XSLT"/></xsl:attribute>
			<xsl:attribute name="maskName">texteditMask</xsl:attribute>
		</xsl:element>
	</xsl:template>
	<xsl:template match="record" mode="CSS">
		<xsl:element name="record">
			<xsl:attribute name="jsxid">CSS</xsl:attribute>
			<xsl:attribute name="jsxtext">{renderConfig_CSS}</xsl:attribute>
			<xsl:attribute name="jsxvalue"><xsl:value-of select="attribute::CSS"/></xsl:attribute>
			<xsl:attribute name="maskName">texteditMask</xsl:attribute>
		</xsl:element>
	</xsl:template>
</xsl:stylesheet>
