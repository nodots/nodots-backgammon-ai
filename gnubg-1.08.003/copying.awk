# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

#
# $Id: $
# 

# Stolen from the copying.awk script included in gdb.

BEGIN {
  FS="\"";
  print "/* Do not modify this file!  It is created automatically by";
  print "   copying.awk.  Modify copying.awk instead. */";
  print "";
  print "#include \"backgammon.h\""
  print "#include \"common.h\""
  print "char *aszCopying[] = {";
}

/^[ \t]*END OF TERMS AND CONDITIONS[ \t]*$/ {
  print "  0\n};";
  exit;
}

/^[ \t]*15. Disclaimer of Warranty.*$/ {
  print "  0\n}, *aszWarranty[] = {";
}

{
  if ($0 ~ /\f/) {
    print "  \"\",";
  } else {
    printf "  \"";
    for (i = 1; i < NF; i++)
      printf "%s\\\"", $i;
    printf "%s\",\n", $NF;
  }
}
