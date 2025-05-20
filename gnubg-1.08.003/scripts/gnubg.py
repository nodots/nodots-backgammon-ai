# Copyright (C) 2003 Joern Thyssen <jth@gnubg.org>
# Copyright (C) 2006-2022 the AUTHORS

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
# $Id: gnubg.py,v 1.22 2023/12/18 21:20:28 plm Exp $
#

# This file is read by GNU Backgammon during startup.
# You can add your own user specified functions.
# At the end are a few examples for inspiration.


# Add the scripts directory to the module path to allow
# for modules from this directory to be imported
import sys
import os

sys.path.insert(1, './scripts')

if sys.version_info >= (3, 0):
    import builtins as bi
else:
    import __builtin__ as bi


def setinterpreterquit():
    class interpreterquit(object):
        def __repr__(self):
            self()

        def __call__(self, code=None):

            if not ('idlelib' in sys.stdin.__class__.__module__):
                raise SystemExit(0)
            else:
                print('Press Ctrl-D to exit')

    bi.quit = interpreterquit()
    bi.exit = interpreterquit()


setinterpreterquit()


def gnubg_InteractivePyShell_tui(argv=[''], banner=None):
    import sys
    import traceback
    import code

    try:
        sys.argv = argv

        # Check for IPython as it is generally the best cmdline interpreter
        from IPython import version_info as ipy_version_info
        if ipy_version_info[0] >= 1:
            from IPython.terminal.embed import InteractiveShellEmbed
        else:
            from IPython.frontend.terminal.embed import InteractiveShellEmbed

        from IPython import __version__ as ipyversion
        if ipy_version_info[0] >= 4:
            from traitlets.config.loader import Config
        else:
            from IPython.config.loader import Config

    except Exception:
        # Otherwise use standard interpreter
        if (banner is None):
            banner = 'Python ' + sys.version

        try:
            # See if we can use readline support
            import readline
        except ImportError:
            # Might be Win32 so check for pyreadline
            try:
                import pyreadline as readline
            except ImportError:
                pass
        try:
            # See if we can add tab completion
            readline.parse_and_bind('tab: complete')
        except Exception:
            pass

        try:
            code.interact(banner=banner, local=globals())
        except SystemExit:
            # Ignore calls to exit() and quit()
            pass

        return True

    try:
        # Launch IPython interpreter
        if ipy_version_info[0] <= 4:
            cfg = Config()
            prompt_config = cfg.PromptManager
            prompt_config.in_template = 'In <\\#> > '
            prompt_config.in2_template = '   .\\D. > '
            prompt_config.out_template = 'Out<\\#> > '
            cfg.InteractiveShell.confirm_exit = False
        else:
            # FIXME:
            # As of IPython 5.0 `PromptManager` config will have no effect and
            # has been replaced by TerminalInteractiveShell.prompts_class
            cfg = None

        if banner is None:
            banner = 'IPython ' + ipyversion + ', Python ' + sys.version

        # We want to execute in the name space of the CALLER of this function,
        # not within the namespace of THIS function.
        # This allows us to have changes made in the IPython environment
        # visible to the CALLER of this function

        # Go back one frame and get the locals.
        call_frame = sys._getframe(0).f_back
        calling_ns = call_frame.f_locals

        ipshell = InteractiveShellEmbed(
            config=cfg, user_ns=calling_ns, banner1=banner)

        try:
            ipshell()
        except SystemExit:
            # Ignore calls to exit() and quit()
            pass

        # Cleanup the sys environment (including exception handlers)
        ipshell.restore_sys_module_state()

        return True

    except Exception:
        traceback.print_exc()

    return False


def gnubg_InteractivePyShell_gui(argv=['', '-n']):
    import sys
    import traceback

    sys.argv = argv

    try:
        if sys.version_info >= (3, 6):
            import idlelib.pyshell as pyshell
        else:
            import idlelib.PyShell as pyshell

        try:
            pyshell.main()
            return True
        except SystemExit:
            # Ignore calls to exit() and quit()
            return True
        except Exception:
            traceback.print_exc()

    except Exception:
        pass

    return False

#
# Examples of python usage start here
#

# Simple functions using the board object


def swapboard(board):
    """Swap the board"""

    return [board[1], board[0]]


def pipcount(board):
    """Calculate pip count"""

    sum = [0, 0]
    for i in range(2):
        for j in range(25):
            sum[i] += (j + 1) * board[i][j]

    return sum


# Following code is intended as an example on the usage of the match command.
# It illustrates how to iterate over matches and do something useful with the
# navigate command.

import os.path


def skillBad(s):
    return s and (s == "very bad" or s == "bad" or s == "doubtful")


def exportBad(baseName):
    """ For current analyzed match, export all moves/cube decisions marked
    doubtful or bad"""

    # Get current match
    m = gnubg.match()

    # Go to match start
    gnubg.navigate()

    # Skill of previous action, to avoid exporting double actions twice
    prevSkill = None

    # Exported position number, used in file name
    poscount = 0

    for game in m["games"]:
        for action in game["game"]:

            analysis = action.get("analysis", None)
            if analysis:
                type = action["action"]
                skill = analysis.get("skill", None)
                bad = skillBad(skill)

                if type == "move":
                    if skillBad(analysis.get("cube-skill", None)):
                        bad = True
                elif type == "take" or type == "drop":
                    if skillBad(prevSkill):
                        # Already exported
                        bad = False

                if bad:
                    exportfile = "%s__%d.html" % (
                        os.path.splitext(baseName)[0], poscount)
                    gnubg.command(
                        "export position html " + "\"" + exportfile + "\"")
                    poscount += 1

            # Advance to next record
            gnubg.navigate(1)

        # Advance to next game
        gnubg.navigate(game=1)
