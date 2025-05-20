# Copyright (C) 2004 Jon Kinsey <Jon_Kinsey@hotmail.com>
# Copyright (C) 2014 Michael Petch <mpetch@gnubg.org>

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
# $Id: db_import.py,v 1.8 2022/06/29 21:09:18 plm Exp $
#

"""
 db_import.py -- batch import of multiple sgf files into relational database

 by Jon Kinsey <Jon_Kinsey@hotmail.com>, 2004
\n"""

import os
import sys

if sys.version_info >= (3, 0):
    def python3_raw_input(prompt):
        return input(prompt)

    raw_input = python3_raw_input


def GetFiles(dir):
    "Look for gnubg import files in dir"
    try:
        files = os.listdir(dir)
    except OSError:
        print("  ** Directory not found **")
        return 0

    fileList = []
    foundAnyFile = False
    foundBGFile = False
    # Check each file in dir
    for file in files:
        # Check it's a file (not a directory)
        if os.path.isfile(dir + file):
            foundAnyFile = True
            # Check has supported extension
            dot = file.rfind('.')
            if dot != -1:
                ext = file[dot + 1:].lower()
                if ext == "sgf":
                    foundBGFile = True
                    fileList.append(file)

    if foundBGFile:
        return fileList
    else:
        if not foundAnyFile:
            print("  ** No files in directory **")
        else:
            print("  ** No sgf files found in directory **")
        return 0


def ImportFile(prompt, file, dir):
    "Run commands to import stats into gnubg"
    print(prompt + " Importing " + file)
    gnubg.command('load match "' + dir + file + '"')
    gnubg.command('relational add match')


def GetYN(prompt):
    confirm = ''
    while len(confirm) == 0 or (confirm[0] != 'y' and confirm[0] != 'n'):
        confirm = raw_input(prompt + " (y/n): ").lower()
    return confirm


def GetDir(prompt):
    dir = raw_input(prompt)
    if dir:
        # Make sure dir ends in a slash
        if (dir[-1] != '\\' and dir[-1] != '/'):
            dir = dir + '/'
    return dir


def BatchImport():
    "Import stats for all sgf files in a directory"

    inFiles = []
    while not inFiles:
        # Get directory with original files in
        dir = GetDir("Directory containing files to import (enter-exit): ")
        if not dir:
            return

        # Look for some files
        inFiles = GetFiles(dir)

    # Display files that will be analyzed
    for file in inFiles:
        print("    " + file)

    print("\n", len(inFiles), "files found\n")

    # Check user wants to continue
    if GetYN("Continue") == 'n':
        return

    # Get stats for each file
    num = 0
    for file in inFiles:
        num = num + 1
        prompt = "(%d/%d)" % (num, len(inFiles))
        ImportFile(prompt, file, dir)

    print("\n** Finished **")
    return


# Run batchimport on load
try:
    print(__doc__)
    BatchImport()
except Exception:
    e = sys.exc_info()[1].args[0]
    print("Error: " + e)
