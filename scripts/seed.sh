#!/bin/sh
# Reset FinTech's data to the seed state. Handy before a repeatable agent run.
set -e
PORT="${PORT:-3002}"
curl -fsS -X POST "http://localhost:${PORT}/dev/reset"
echo
