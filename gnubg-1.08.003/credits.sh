#!/bin/sh

# Copyright (C) 1998-2004 Gary Wong <gtw@gnu.org>
# Copyright (C) 2004-2023 the AUTHORS

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
# $Id: credits.sh,v 1.168 2023/10/18 21:33:42 plm Exp $
# 

authors=/tmp/auth.$$
contributors=/tmp/cont.$$
support=/tmp/supp.$$
translations=/tmp/trans.$$
credit=/tmp/cred.$$
extra=/tmp/extra.$$

cat > $authors <<EOF
Joseph Heled
Oystein Johansen
Jonathan Kinsey
David Montgomery
Jim Segrave
Joern Thyssen
Gary Wong
Christian Anthon
Michael Petch
Philippe Michel
EOF

cat > $contributors <<EOF
Olivier Baur
Holger Bochnig
Guido Flohr
Nis Joergensen
Petr Kadlec
Isaac Keslassy
Kaoru Takahashi
Stein Kulseth
Ingo Macherius
Jeremy Moore
Rod Roark
Aaron Tikuisis
EOF

cat > $support <<EOF
Oystein Johansen,Web Pages
Achim Mueller,Manual
Nardy Pillards,Web Pages
Albert Silver,Tutorial
EOF

cat > $translations <<EOF
Petr Kadlec,Czech
Joern Thyssen,Danish
Matti Kamppinen,Finnish
Olivier Baur,French
Achim Mueller,German
Vangelis Skarmoutsos,Greek
Hlynur Sigurgislason,Icelandic
Renzo Campagna,Italian
Yoshito Takeuchi,Japanese
Mihai Varzaru,Romanian
Dmitri I Gouliaev,Russian
Fernando García García,Spanish
Akif Dinc,Turkish
EOF

cat > $credit <<EOF
Russ Allbery
Misja Alma
Kazuaki Asai
Eric Augustine
Erik Barfoed
Ron Barry
Steve Baedke
Stefan van den Berg
Frank Berger
Jim Borror
Chuck Bower
Adrian Bunk
Nick Bratby
Craig Campbell
Timothy Chow
John Chuang
Tristan Colgate
Olivier Croisille
Ned Cross
Ian Curtis
Bill Davidson
Michael Depreli
Ian Dunstan
Max Durbano
Peter Eberhard
Robert Eberlein
Fotis
Dan Fandrich
Kennedy Fraser
Ric Gerace
Michel Grimminck
Eric Groleau
Jeff Haferman
Morten Juul Henriksen
Alain Henry
Jens Hoefkens
Casey Hopkins
Martin Janke
Neil Kazaross
Mathias Kegelmann
Matija Kejzar
Bert Van Kerckhove
James F. Kibler
Johnny Kirk
Gerhard Knop
Robert Konigsberg
Martin Krainer
Elias Kritikos
Corrin Lakeland
Tim Laursen
Myshkin LeVine
Eli Liang
Ege Lundgren
Kevin Maguire
Massimiliano Maini
Giulio De Marco
John Marttila
Alix Martin
Tom Martin
William Maslen
Joachim Matussek
Thomas Meyer
Daniel Murphy
Magnar Naustdalslid
Dave Neary
Rolf Nielsen
Mirori Orange
Peter Orum
Roy Passfield
Thomas Patrick
Billie Patterson
Zvezdan Petkovic
Petri Pitkanen
Sam Pottle
Henrik Ravn
James Rech
Jared Riley
Klaus Rindholt
Oliver Riordan
Alex Romosan
Hans-Juergen Schaefer
Steve Schreiber
Hugh Sconyers
Martin Schrode
Paul Selick
Sho Sengoku
Ian Shaw
Alberta di Silvio
Peter Sochovsky
Mark Spencer
Scott Steiner
Maik Stiebler
W. Stroop (Rob)
Daisuke Takahashi
Yoshito Takeuchi
Jacques Thiriat
Malene Thyssen
Claes Tornberg
Sander van Rijnswou
Robert-Jan Veldhuizen
Morten Wang
Jeff White
JP White
Mike Whitton
Chris Wilson
Simon Woodhead
Kit Woolsey
Frank Worrell
Christopher D. Yep
Anders Zachrison
Douglas Zare
Tilemachos Zoidis
Louis Zulli
EOF

cat > $extra <<EOF
Hans Berliner
Chuck Bower
Rick Janowski
Brian Sheppard
Gerry Tesauro
Morten Wang
Douglas Zare
Michael Zehr
EOF

# generate credits.c

cat > credits.h <<EOF
/* Do not modify this file!  It is created automatically by credits.sh. */

/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

#include <glib/gi18n.h>

typedef struct {
	char* Name;
	char* Type;
} credEntry;

typedef struct {
	const char* Title;
	credEntry *Entry;
} credits;

extern credEntry ceAuthors[];
extern credEntry ceContrib[];
extern credEntry ceTranslations[];
extern credEntry ceSupport[];
extern credEntry ceCredits[];

extern credits creditList[];

extern const char aszAUTHORS[];

extern const char aszCOPYRIGHT[];

EOF
cat > credits.c <<EOF
/* Do not modify this file!  It is created automatically by credits.sh. */

/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

#include "common.h"
#include <glib/gi18n.h>
#include "credits.h"

const char aszCOPYRIGHT[] = N_("Copyright (C) 1999-2004 Gary Wong.\n"
                               "Copyright (C) 2004-2024 the AUTHORS; for details type \`show version'.");

credEntry ceAuthors[] = {
EOF

# Authors

cat $authors | sed -e 's/.*/  {"&", 0},/g' >> credits.c

cat >> credits.c <<EOF
  {0, 0}
};
EOF

# Contributors

cat >> credits.c <<EOF

credEntry ceContrib[] = {
EOF

cat $contributors | sed -e 's/.*/  {"&", 0},/g' >> credits.c

cat >> credits.c <<EOF
  {0, 0}
};
EOF

# Support

cat >> credits.c <<EOF

credEntry ceSupport[] = {
EOF

cat $support | sed -e 's/^\(.*\),\(.*\)$/  {"\1", N_\("\2\"\) },/g' >> credits.c

cat >> credits.c <<EOF
  {0, 0}
};
EOF

# Translations

cat >> credits.c <<EOF

credEntry ceTranslations[] = {
EOF

cat $translations | sed -e 's/^\(.*\),\(.*\)$/  {"\1", N_\("\2\"\) },/g' >> credits.c

cat >> credits.c <<EOF
  {0, 0}
};
EOF

# Contributors

cat >> credits.c <<EOF

credEntry ceCredits[] = {
EOF

cat $credit $extra | sort -f -k 2 | uniq | sed -e 's/.*/  {"&", 0},/g' >> credits.c

cat >> credits.c <<EOF
  {0, 0}
};
EOF

# some C stuff

cat >> credits.c <<EOF

credits creditList[] =
{
	{N_("Authors"), ceAuthors},
	{N_("Code Contributors"), ceContrib},
	{N_("Translations"), ceTranslations},
	{N_("Support"), ceSupport},
	{0, 0}
};

EOF

#
# Generate AUTHORS
#

cat > AUTHORS <<EOF
                         GNU Backgammon was written by:

EOF

pr -3 -t < $authors | expand | sed 's/^/    /' >> AUTHORS

cat >> AUTHORS <<EOF
 
                                   Support by:

EOF
cat $support | sed -e 's/^\(.*\),\(.*\)$/ \1 (\2)/g' | pr -2 -t | expand | sed 's/^/    /' >> AUTHORS

cat >> AUTHORS <<EOF

                         Contributors of code include:

EOF

pr -3 -t < $contributors | expand | sed 's/^/    /' >> AUTHORS

cat >> AUTHORS <<EOF

                            Translations by:

EOF

cat $translations | sed -e 's/^\(.*\),\(.*\)$/ \1 (\2)/g' | pr -1 -t | expand | sed 's/^/    /' >> AUTHORS


cat >> AUTHORS <<EOF

             Contributors (of bug reports and suggestions) include:

EOF

pr -3 -t < $credit | expand | sed 's/^/    /' >> AUTHORS

cat >> AUTHORS <<'EOF'


  Credit is also due to those who have published information about backgammon
   playing programs (references will appear here later).  GNU Backgammon has
                              borrowed ideas from:

EOF

pr -4 -t < $extra | expand | sed 's/^/    /' >> AUTHORS

cat >> AUTHORS <<'EOF'                            

 
    The manual for GNU Backgammon includes a chapter describing the rules of
      backgammon, written by Tom Keith for his Backgammon Galore web site
                             <https://www.bkgm.com/>.


  Library code from the following authors has been included in GNU Backgammon:

               Austin Appleby (the MurmurHash3 hashing function)
     Ulrich Drepper (an implementation of the public domain MD5 algorithm)
            Bob Jenkins (the ISAAC pseudo random number generator)
         Mutsuo Saito and Makoto Matsumoto (the Mersenne Twister PRNG)
                   Brian Paul (the TR tile rendering library)
             Claes Tornberg (the mec match equity table generator)


      If you feel that you're not given credits for your contributions to
         GNU Backgammon please write to one of the developers.


       Please send bug reports for GNU Backgammon to: <bug-gnubg@gnu.org>
EOF

#
# Add AUTHORS to credits.c
# 

cat >> credits.c <<EOF
const char aszAUTHORS[] =
EOF

sed -e 's/"/\\"/g' AUTHORS | sed -e 's/.*/"&\\n"/g' >> credits.c

cat >> credits.c <<EOF
;
EOF

rm -f $authors $contributors $support $translations $credit $extra
