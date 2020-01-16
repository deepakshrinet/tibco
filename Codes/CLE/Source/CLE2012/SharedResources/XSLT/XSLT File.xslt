<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:c = "http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/SecurityConfiguration/UserApplicationPermissionsInfo">
  <xsl:template match="/">
    <xsl:element name="data">
      <xsl:attribute name="jsxid">jsxroot</xsl:attribute>
	      <xsl:for-each select="//c:Application">
	          <xsl:element name="record">
			<xsl:attribute name="jsxid"><xsl:value-of select="./c:ApplicationID"/></xsl:attribute>
			<xsl:attribute name="jsxtext"><xsl:value-of select="./c:ApplicationID"/></xsl:attribute>
			<xsl:attribute name="AppID"><xsl:value-of select="./c:ApplicationID"/></xsl:attribute>
  			<xsl:for-each select="./c:Permissions/c:PermissionID">
	        			<xsl:attribute name="p{.}"><xsl:value-of select="."/></xsl:attribute>
	     			 </xsl:for-each>
	         </xsl:element>
	      </xsl:for-each>
      </xsl:element>
  </xsl:template>
</xsl:stylesheet>