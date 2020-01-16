<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/Exception/ExceptionList">
	<xsl:output omit-xml-declaration="yes" indent="yes" encoding="UTF-8"/>
	<xsl:key name="appIdkey" match="ns0:ExceptionRecord" use="child::ns0:APPLICATIONID[1]"/>
	<xsl:template match="/">
		<xsl:element name="data">
			<xsl:attribute name="jsxid">jsxroot</xsl:attribute>
				<xsl:for-each select="//ns0:ExceptionRecord[count(.|key('appIdkey',child::ns0:APPLICATIONID)[1])=1]">
					<xsl:sort select="*[local-name()='APPLICATIONID']" data-type="text" order="ascending"/>
					<xsl:element name="record">
					<xsl:variable name="id"><xsl:value-of select="child::ns0:APPLICATIONID[1]"/></xsl:variable>
						<xsl:attribute name="jsxid"><xsl:value-of select="$id"/></xsl:attribute>
						<xsl:attribute name="jsxopen">1</xsl:attribute>
						<xsl:attribute name="jsxcategory">1</xsl:attribute>
						<xsl:apply-templates select="//ns0:ExceptionRecord[child::ns0:APPLICATIONID=$id]" mode="record"/>
					</xsl:element>
				</xsl:for-each>
		</xsl:element>
	</xsl:template>
	<xsl:template match="ns0:ExceptionRecord" mode="record">
		<xsl:element name="record">
			<xsl:attribute name="jsxid"><xsl:value-of select="child::ns0:EXCEPTIONID[1]"/></xsl:attribute>
			<xsl:attribute name="recordType">exception</xsl:attribute>
			<xsl:for-each select="child::*">
				<xsl:attribute name="{local-name()}"><xsl:value-of select="."/></xsl:attribute>
			</xsl:for-each>
		</xsl:element>
	</xsl:template>
</xsl:stylesheet>
