<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output omit-xml-declaration="yes" encoding="UTF-8"/>
	<xsl:template match="/">
		<xsl:element name="data">
			<xsl:attribute name="jsxid">jsxroot</xsl:attribute>
			<xsl:element name="record">
				<xsl:attribute name="jsxid">Applications</xsl:attribute>
				<xsl:attribute name="jsxtext">{config_applications}</xsl:attribute>
				<xsl:attribute name="jsxtype">applications</xsl:attribute>
				<xsl:attribute name="jsxcategory">1</xsl:attribute>
				<xsl:attribute name="jsxopen">1</xsl:attribute>
				<xsl:attribute name="jsximg">images/icons/folder_opened.gif</xsl:attribute>
				<xsl:apply-templates select="//record" mode="applications">
					<xsl:sort order="ascending" select="@jsxid"/>
				</xsl:apply-templates>
			</xsl:element>
		</xsl:element>
	</xsl:template>
	<xsl:template match="record" mode="applications">
		<xsl:copy>
			<xsl:for-each select="@*">
				<xsl:copy-of select="."/>
			</xsl:for-each>
			<xsl:attribute name="jsxtype">application</xsl:attribute>
			<xsl:attribute name="jsxcategory">1</xsl:attribute>
			<xsl:attribute name="jsxopen">0</xsl:attribute>
			<xsl:attribute name="jsximg">images/icons/folder_closed.gif</xsl:attribute>
			<xsl:call-template name="addAppFolders">
				<xsl:with-param name="appId" select="@jsxid"/>
			</xsl:call-template>
		</xsl:copy>
	</xsl:template>
	<!-- build prototype directories for configuration entries -->
	<xsl:template name="addAppFolders">
	<xsl:param name="appId"/>
		<xsl:element name="record">
			<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_categories</xsl:attribute>
			<xsl:attribute name="jsxtext">{config_categories}</xsl:attribute>
			<xsl:attribute name="jsxtype">category</xsl:attribute>
			<xsl:attribute name="ApplicationID"><xsl:value-of select="$appId"/></xsl:attribute>
			<xsl:attribute name="jsxcategory">1</xsl:attribute>
			<xsl:attribute name="jsxopen">0</xsl:attribute>
			<xsl:attribute name="jsximg">images/icons/folder_closed.gif</xsl:attribute>
			<xsl:element name="record">
				<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_category_empty</xsl:attribute>
				<xsl:attribute name="jsxtext">{m_loadingData}</xsl:attribute>
				<xsl:attribute name="jsximg">jsx:///images/spc.gif</xsl:attribute>
			</xsl:element>
		</xsl:element>
		<xsl:element name="record">
			<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_exceptionCodes</xsl:attribute>
			<xsl:attribute name="jsxtext">{config_exceptionCodes}</xsl:attribute>
			<xsl:attribute name="jsxtype">exceptionCode</xsl:attribute>
			<xsl:attribute name="ApplicationID"><xsl:value-of select="$appId"/></xsl:attribute>
			<xsl:attribute name="jsxcategory">1</xsl:attribute>
			<xsl:attribute name="jsxopen">0</xsl:attribute>
			<xsl:attribute name="jsximg">images/icons/folder_closed.gif</xsl:attribute>
			<xsl:element name="record">
				<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_exceptionCode_empty</xsl:attribute>
				<xsl:attribute name="jsxtext">{m_loadingData}</xsl:attribute>
				<xsl:attribute name="jsximg">jsx:///images/spc.gif</xsl:attribute>
			</xsl:element>
		</xsl:element>
		<xsl:element name="record">
			<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_interfaces</xsl:attribute>
			<xsl:attribute name="jsxtext">{config_interfaces}</xsl:attribute>
			<xsl:attribute name="jsxtype">interface</xsl:attribute>
			<xsl:attribute name="ApplicationID"><xsl:value-of select="$appId"/></xsl:attribute>
			<xsl:attribute name="jsxcategory">1</xsl:attribute>
			<xsl:attribute name="jsxopen">0</xsl:attribute>
			<xsl:attribute name="jsximg">images/icons/folder_closed.gif</xsl:attribute>
			<xsl:element name="record">
				<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_interface_empty</xsl:attribute>
				<xsl:attribute name="jsxtext">{m_loadingData}</xsl:attribute>
				<xsl:attribute name="jsximg">jsx:///images/spc.gif</xsl:attribute>
			</xsl:element>
		</xsl:element>
		<xsl:element name="record">
			<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_procedures</xsl:attribute>
			<xsl:attribute name="jsxtext">{config_procedures}</xsl:attribute>
			<xsl:attribute name="jsxtype">procedure</xsl:attribute>
			<xsl:attribute name="ApplicationID"><xsl:value-of select="$appId"/></xsl:attribute>
			<xsl:attribute name="jsxcategory">1</xsl:attribute>
			<xsl:attribute name="jsxopen">0</xsl:attribute>
			<xsl:attribute name="jsximg">images/icons/folder_closed.gif</xsl:attribute>
			<xsl:element name="record">
				<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_procedure_empty</xsl:attribute>
				<xsl:attribute name="jsxtext">{m_loadingData}</xsl:attribute>
				<xsl:attribute name="jsximg">jsx:///images/spc.gif</xsl:attribute>
			</xsl:element>
		</xsl:element>
		<xsl:element name="record">
			<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_renderings</xsl:attribute>
			<xsl:attribute name="jsxtext">{config_renderConfigs}</xsl:attribute>
			<xsl:attribute name="jsxtype">rendering</xsl:attribute>
			<xsl:attribute name="ApplicationID"><xsl:value-of select="$appId"/></xsl:attribute>
			<xsl:attribute name="jsxcategory">1</xsl:attribute>
			<xsl:attribute name="jsxopen">0</xsl:attribute>
			<xsl:attribute name="jsximg">images/icons/folder_closed.gif</xsl:attribute>
			<xsl:element name="record">
				<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_rendering_empty</xsl:attribute>
				<xsl:attribute name="jsxtext">{m_loadingData}</xsl:attribute>
				<xsl:attribute name="jsximg">jsx:///images/spc.gif</xsl:attribute>
			</xsl:element>
		</xsl:element>
		<xsl:element name="record">
			<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_severities</xsl:attribute>
			<xsl:attribute name="jsxtext">{config_severities}</xsl:attribute>
			<xsl:attribute name="jsxtype">severity</xsl:attribute>
			<xsl:attribute name="ApplicationID"><xsl:value-of select="$appId"/></xsl:attribute>
			<xsl:attribute name="jsxcategory">1</xsl:attribute>
			<xsl:attribute name="jsxopen">0</xsl:attribute>
			<xsl:attribute name="jsximg">images/icons/folder_closed.gif</xsl:attribute>
			<xsl:element name="record">
				<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_severity_empty</xsl:attribute>
				<xsl:attribute name="jsxtext">{m_loadingData}</xsl:attribute>
				<xsl:attribute name="jsximg">jsx:///images/spc.gif</xsl:attribute>
			</xsl:element>
		</xsl:element>
		<xsl:element name="record">
			<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_types</xsl:attribute>
			<xsl:attribute name="jsxtext">{config_types}</xsl:attribute>
			<xsl:attribute name="jsxtype">type</xsl:attribute>
			<xsl:attribute name="ApplicationID"><xsl:value-of select="$appId"/></xsl:attribute>
			<xsl:attribute name="jsxcategory">1</xsl:attribute>
			<xsl:attribute name="jsxopen">0</xsl:attribute>
			<xsl:attribute name="jsximg">images/icons/folder_closed.gif</xsl:attribute>
			<xsl:element name="record">
				<xsl:attribute name="jsxid"><xsl:value-of select="$appId"/>_type_empty</xsl:attribute>
				<xsl:attribute name="jsxtext">{m_loadingData}</xsl:attribute>
				<xsl:attribute name="jsximg">jsx:///images/spc.gif</xsl:attribute>
			</xsl:element>
		</xsl:element>
	</xsl:template>
</xsl:stylesheet>
