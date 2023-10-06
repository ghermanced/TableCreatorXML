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

    <!-- <xsl:variable name="pageSize" select="5"/>
    <xsl:variable name="currentPage" select="1"/> 
    
    <xsl:variable name="startIndex" select="($currentPage - 1) * $pageSize + 1"/>
    <xsl:variable name="endIndex" select="$currentPage * $pageSize"/> -->

    <xsl:for-each select="root/element">
    <!-- <xsl:for-each select="root/element[position() >= $startIndex and position() &lt;=$endIndex]"> -->
    <xsl:sort select="id" data-type="number" id="sort"/>
    <xsl:if test="id" id="filter">
    <tr>
        <td><xsl:value-of select="id" /></td>
        <td><xsl:value-of select="firstName" /></td>
        <td><xsl:value-of select="lastName" /></td>
        <td><xsl:value-of select="email" /></td>
        <td><xsl:value-of select="phone" /></td>
      </tr>
    </xsl:if>
    </xsl:for-each>
    </table>

    <div class="pagination"> <!--
      <xsl:if test="$currentPage > 1"> -->
        <!-- <a href="?page={$currentPage-1}">Previous</a> -->
      <!-- </xsl:if> -->
      <!-- <xsl:variable name="totalPages" select="ceiling(count(root/element) div $pageSize)" /> -->
      <!-- <xsl:for-each select="1 to $totalPages">
        <xsl:choose>
          <xsl:when test=". = $currentPage">
            <span class="current-page"><xsl:value-of select="." /></span>
          </xsl:when>
          <xsl:otherwise>
            <a href="?page{.}"><xsl:value-of select="."/></a> 
          </xsl:otherwise>
        </xsl:choose>
      </xsl:for-each> -->

      <!-- <xsl:if test="$currentPage &lt; $totalPages">
        <a href="?page={$currentPage+1}">Next</a>
      </xsl:if> -->

    </div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>