#!/bin/zsh
set -euo pipefail
cd "${0:A:h}/.."
if [[ ! -x .venv-garmin/bin/python ]]; then
  python3 -m venv .venv-garmin
  .venv-garmin/bin/pip install -r garmin-sync/requirements.txt
fi
.venv-garmin/bin/python garmin-sync/sync.py "$@"
