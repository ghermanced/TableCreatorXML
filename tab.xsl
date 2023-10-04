<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">
<html>
<body>
    <table class="table table-sortable" border="1">
        <tr bgcolor="#9acd32">
      <th id="id">ID</th>
      <th id="firstName">First Name</th>
      <th id="lastName">Last Name</th>
      <th id="email">Email</th>
      <th id="phone">Phone</th>
    </tr>
    <xsl:for-each select="root/element">
    <xsl:sort select="id" data-type="number" id="sort"/>
    <tr>
        <td><xsl:value-of select="id" /></td>
        <td><xsl:value-of select="firstName" /></td>
        <td><xsl:value-of select="lastName" /></td>
      <td><xsl:value-of select="email" /></td>
      <td><xsl:value-of select="phone" /></td>
    </tr>
    </xsl:for-each>
    </table>
</body>
</html>
</xsl:template>
</xsl:stylesheet>