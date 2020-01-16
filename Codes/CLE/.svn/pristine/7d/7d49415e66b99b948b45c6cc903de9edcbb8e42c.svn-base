<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
	<xsl:template match="/">
		<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
			<SOAP-ENV:Body>
				<xsl:for-each select="//record[@hasChanges]">
					<ns0:RolePermissionsInfo xmlns:ns0="http://www.tibco.com/CommonLE2/namespace/Public/Pluggable/GUI/SecurityConfiguration/RolePermissionInformation">
						<ns0:rolename><xsl:value-of select="@role"/></ns0:rolename>
						<ns0:appid><xsl:value-of select="@appId"/></ns0:appid>
						<ns0:permissions>
							<xsl:for-each select="@*[starts-with(local-name(),'p') and .='1']">
								<ns0:permission>
									<ns0:permissionID><xsl:value-of select="substring(local-name(),2)"/></ns0:permissionID>
								</ns0:permission>
							</xsl:for-each>
						</ns0:permissions>
					</ns0:RolePermissionsInfo>
				</xsl:for-each>
			</SOAP-ENV:Body>
		</SOAP-ENV:Envelope>
	</xsl:template>
</xsl:stylesheet>
