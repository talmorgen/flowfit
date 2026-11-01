#!/bin/zsh
set -euo pipefail
cd "${0:A:h}/.."
venv_path=".flowfit-private/garmin-venv"
python_path="/Users/talmorgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
if [[ ! -x "$python_path" ]]; then
  python_path="$(command -v python3)"
fi
if [[ ! -x "$venv_path/bin/python" ]]; then
  "$python_path" -m venv "$venv_path"
  "$venv_path/bin/pip" install -r garmin-sync/requirements.txt
fi
"$venv_path/bin/python" garmin-sync/sync_site.py "$@"
