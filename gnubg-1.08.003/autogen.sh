#! /bin/sh

# Copyright (C) 2002 Gary Wong <gtw@gnu.org>
# Copyright (C) 2003-2018 the AUTHORS

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


# $Id: autogen.sh,v 1.12 2019/09/15 17:54:57 plm Exp $

# If we use libtool-2, libtoolize below will recreate them, but if we use
# libtool-1 we don't want them, which could happen if we use a shared
# source directory or work from a "make dist" made on a libtool-2 system.
#
rm -f m4/libtool.m4 m4/ltoptions.m4 m4/ltsugar.m4 m4/ltversion.m4 m4/lt~obsolete.m4

rm -f aclocal.m4
aclocal -I m4

if [ `uname -s` = Darwin ]
then
    LIBTOOLIZE=glibtoolize
else
    LIBTOOLIZE=libtoolize
fi

$LIBTOOLIZE --force --copy

# In case we got a "You should update your `aclocal.m4' by running aclocal."
# from libtoolize.
#
aclocal -I m4

autoheader

# automake will replace them by its local version.
#
rm -f compile config.guess config.sub install-sh missing ylwrap

automake --add-missing --copy -Wno-portability

autoconf
