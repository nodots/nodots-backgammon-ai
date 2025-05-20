/*
 * Copyright (C) 2000 Gary Wong <gtw@gnu.org>
 * Copyright (C) 2002-2015 the AUTHORS
 *
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
 *
 * $Id: sgf_l.l,v 1.3 2020/04/12 19:02:41 plm Exp $
 */

%{
#include "common.h"
#include <ctype.h>
#include "list.h"

#include "sgf.h"
#include "sgf_y.h"
#include <glib/gi18n.h>

static int error( char *s ) {

    /* refer to yy_fatal_error, to shut up the compiler */
    (void) yy_fatal_error;

    if( SGFErrorHandler )
	SGFErrorHandler( s, 0 );
    else
	fprintf( stderr, "%s\n", s );
    
    return 0;
}

#define YY_FATAL_ERROR(m) error(m)
%}

%option noyywrap
%option prefix="sgf"
%option 8bit
%option nodefault
%option ecs
%option fast
%option noread
%option outfile="lex.yy.c"

%option noinput
%option nounput
%option noyy_scan_buffer
%option noyy_scan_bytes
%option noyy_scan_string

%x value

%%
[[:space:]]+		/* ignore */
"("|")"|";"		return *yytext;
[[:lower:]]*[[:upper:]][[:lower:]]*[[:upper:]]?[[:lower:]]* {
			    char *pch;

			    sgflval.ach[ 1 ] = 0;

			    for( pch = yytext; *pch; pch++ )
			        if( isupper( *pch ) ) {
				    sgflval.ach[ 0 ] = *pch;    
				    break;
				}

			    for( pch++; *pch; pch++ )
			        if( isupper( *pch ) ) {
				    sgflval.ach[ 1 ] = *pch;
				    break;
				}

			    return PROPERTY;
			}
[[:lower:]]+		/* ignore -- this rule avoids making flex back up */
"["			BEGIN(value); return '[';
.			{ error( _("illegal character in SGF file" )); }

<value>\0		/* ignore -- we want value strings null-terminated */
<value>"\\]"		{ sgflval.pch = strdup( "]" ); return VALUETEXT; }
<value>"\\\n"		/* ignore */
<value>"]"		BEGIN(INITIAL); return ']';
<value>[^]\0\\]+	{ sgflval.pch = strdup( yytext ); return VALUETEXT; }
<value>\\.?		{ sgflval.pch = strdup( yytext ); return VALUETEXT; }

%%
