<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/ExceptionManagement" xmlns:ns1="http://www.tibco.com/CommonLE2/namespace/Public/Common/RequestHeader.xsd">
	<xsl:output omit-xml-declaration="yes" indent="yes" encoding="UTF-8"/>
	<xsl:template match="/">
		<xsl:element name="data">
			<xsl:attribute name="jsxid">jsxroot</xsl:attribute>
			<xsl:for-each select="//ns0:ExceptionDetail">
				<xsl:element name="record">
					<xsl:variable name="id">
						<xsl:value-of select="child::ExceptionInstanceID"/>
					</xsl:variable>
					<xsl:attribute name="jsxid"><xsl:value-of select="$id"/></xsl:attribute>
					<xsl:attribute name="jsxtext"><xsl:value-of select="$id"/></xsl:attribute>
					<xsl:attribute name="jsxopen">1</xsl:attribute>
					<xsl:element name="record">
						<xsl:attribute name="jsxid">detail_<xsl:value-of select="$id"/></xsl:attribute>
						<!--  curly braces around the value will be translated from the exception_ljss.xml file -->
						<xsl:attribute name="jsxtext">{exception_detail}</xsl:attribute>
						<xsl:attribute name="jsxopen">1</xsl:attribute>
						<xsl:attribute name="jsxcategory">1</xsl:attribute>
						<xsl:for-each select="child::*">
						<xsl:variable name="childName"><xsl:value-of select="local-name()"/></xsl:variable>
							<xsl:choose>
							<!-- filter out the following node names -->
								<xsl:when test="$childName='Header'"></xsl:when>
								<xsl:when test="$childName='Stacktrace'"></xsl:when>
								<xsl:when test="$childName='TransactionDataAfterResolve'"></xsl:when>
								<xsl:when test="$childName='Custom'"></xsl:when>
								<xsl:otherwise>
									<xsl:element name="record">
										<xsl:attribute name="jsxid"><xsl:value-of select="$childName"/></xsl:attribute>
										<xsl:attribute name="jsxtext">{exception_attr<xsl:value-of select="$childName"/>}</xsl:attribute>
										<xsl:attribute name="jsxvalue"><xsl:value-of select="."/></xsl:attribute>
									</xsl:element>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:for-each>
					</xsl:element>
					<xsl:for-each select="child::Custom">
						<xsl:if test="count(child::Custom/child::*)&gt;0">
							<xsl:element name="record">
								<xsl:attribute name="jsxid"><xsl:value-of select="local-name()"/></xsl:attribute>
								<xsl:attribute name="jsxtext"><xsl:value-of select="local-name()"/></xsl:attribute>
								<xsl:attribute name="jsxopen">1</xsl:attribute>
								<xsl:attribute name="jsxcategory">1</xsl:attribute>
								<xsl:for-each select="child::*">
										<xsl:element name="record">
											<xsl:attribute name="jsxid"><xsl:value-of select="local-name()"/></xsl:attribute>
											<xsl:attribute name="jsxtext"><xsl:value-of select="local-name()"/></xsl:attribute>
											<xsl:attribute name="jsxvalue"><xsl:value-of select="."/></xsl:attribute>
										</xsl:element>
								</xsl:for-each>
							</xsl:element>
						</xsl:if>
					</xsl:for-each>
					<xsl:for-each select="child::Stacktrace">
						<xsl:element name="record">
							<xsl:attribute name="jsxid"><xsl:value-of select="local-name()"/></xsl:attribute>
							<xsl:attribute name="jsxtext"><xsl:value-of select="local-name()"/></xsl:attribute>
							<xsl:attribute name="jsxvalue"><xsl:value-of select="."/></xsl:attribute>
						</xsl:element>
					</xsl:for-each>
					<xsl:for-each select="child::ns1:*">
						<xsl:element name="record">
							<xsl:variable name="instanceId">
								<xsl:value-of select="child::ExceptionInstanceID"/>
							</xsl:variable>
							<xsl:attribute name="jsxid">header_<xsl:value-of select="$id"/></xsl:attribute>
							<xsl:attribute name="jsxtext">{exception_header}</xsl:attribute>
							<xsl:attribute name="jsxopen">1</xsl:attribute>
							<xsl:attribute name="jsxcategory">1</xsl:attribute>
							<xsl:for-each select="child::*">
								<xsl:if test="local-name()!='Transaction'">
									<xsl:element name="record">
										<xsl:attribute name="jsxid"><xsl:value-of select="local-name()"/></xsl:attribute>
										<xsl:attribute name="jsxtext">{exception_attr<xsl:value-of select="local-name()"/>}</xsl:attribute>
										<xsl:attribute name="jsxvalue"><xsl:value-of select="."/></xsl:attribute>
										<xsl:if test="local-name()='Timestamp'">
											<xsl:attribute name="dataType"><xsl:value-of select="."/></xsl:attribute>
										</xsl:if>
									</xsl:element>
								</xsl:if>
							</xsl:for-each>
						</xsl:element>
					</xsl:for-each>
					<xsl:for-each select="child::ns1:Header/child::ns1:Transaction">
						<xsl:element name="record">
							<xsl:attribute name="jsxid"><xsl:value-of select="local-name()"/></xsl:attribute>
							<xsl:attribute name="jsxtext">{exception_attr<xsl:value-of select="local-name()"/>}</xsl:attribute>
							<xsl:attribute name="jsxvalue"><xsl:value-of select="."/></xsl:attribute>
						</xsl:element>
					</xsl:for-each>
					<xsl:for-each select="TransactionDataAfterResolve">
						<xsl:element name="record">
							<xsl:attribute name="jsxid"><xsl:value-of select="local-name()"/></xsl:attribute>
							<xsl:attribute name="jsxtext"><xsl:value-of select="local-name()"/></xsl:attribute>
							<xsl:attribute name="jsxvalue"><xsl:value-of select="."/></xsl:attribute>
						</xsl:element>
					</xsl:for-each>
				</xsl:element>
			</xsl:for-each>
		</xsl:element>
	</xsl:template>
</xsl:stylesheet>
