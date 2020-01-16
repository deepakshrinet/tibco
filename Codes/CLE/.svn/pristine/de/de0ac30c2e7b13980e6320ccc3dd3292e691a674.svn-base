<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <xsl:template match="/">
    <xsl:element name="data">
      <xsl:attribute name="jsxid">jsxroot</xsl:attribute>
      <xsl:variable name="recordId"><xsl:value-of select="/data/record/@jsxid"/></xsl:variable>
      <xsl:element name="record">
       <xsl:attribute name="jsxid"><xsl:value-of select="generate-id()"/></xsl:attribute>
       <xsl:attribute name="jsxtext">{application_ApplicationID}</xsl:attribute>
       <xsl:attribute name="jsxvalue"><xsl:value-of select="$recordId"/></xsl:attribute>
       <xsl:attribute name="maskName">textboxMask</xsl:attribute>
       <xsl:attribute name="readOnly">1</xsl:attribute>
       <xsl:attribute name="referenceId"><xsl:value-of select="$recordId"/></xsl:attribute>
       <xsl:attribute name="attrName">ApplicationID</xsl:attribute>
      </xsl:element>
      <xsl:element name="record">
       <xsl:attribute name="jsxid"><xsl:value-of select="generate-id()"/>-1</xsl:attribute>
       <xsl:attribute name="jsxtext">{application_Name}</xsl:attribute>
       <xsl:attribute name="jsxvalue"><xsl:value-of select="/data/record/@jsxtext"/></xsl:attribute>
       <xsl:attribute name="maskName">textboxMask</xsl:attribute>
       <xsl:attribute name="readOnly">1</xsl:attribute>
       <xsl:attribute name="referenceId"><xsl:value-of select="$recordId"/></xsl:attribute>
       <xsl:attribute name="attrName">Name</xsl:attribute>
      </xsl:element>
      <xsl:for-each select="//record/@*">
        <xsl:if test="not(starts-with(name(),'jsx') or starts-with(name(),'hasChanges'))">
	        <xsl:element name="record">
		        <xsl:attribute name="jsxid"><xsl:value-of select="generate-id()"/></xsl:attribute>
		        <xsl:attribute name="jsxtext">{application_<xsl:value-of select="name()"/>}</xsl:attribute>
		        <xsl:attribute name="jsxvalue"><xsl:value-of select="."/></xsl:attribute>
		        <xsl:attribute name="maskName">textboxMask</xsl:attribute>
		        <xsl:attribute name="readOnly">1</xsl:attribute>
		        <xsl:attribute name="referenceId"><xsl:value-of select="$recordId"/></xsl:attribute>
		        <xsl:attribute name="attrName"><xsl:value-of select="name()"/></xsl:attribute>
	        </xsl:element>
        </xsl:if>
      </xsl:for-each>
      </xsl:element>
  </xsl:template>
</xsl:stylesheet>