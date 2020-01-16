<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
 xmlns:xsl="http://www.w3.org/1999/XSL/Transform" >
 <xsl:output method="xml" encoding="UTF-8" indent="yes"/>
 <xsl:template match="/|comment()|processing-instruction()">
  <xsl:copy> <!-- go process children (applies to root node only) -->
   <xsl:apply-templates/>
  </xsl:copy>
 </xsl:template>
 <xsl:template match="*">
  <xsl:element name="{local-name()}">
  <!-- go process attributes and children -->
   <xsl:apply-templates select="@*|node()"/>
  </xsl:element>
 </xsl:template>
 <xsl:template match="@*">
  <xsl:attribute name="{local-name()}">
   <xsl:value-of select="."/>
  </xsl:attribute>
 </xsl:template>
</xsl:stylesheet>