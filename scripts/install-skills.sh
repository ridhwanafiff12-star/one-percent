#!/usr/bin/env bash
# Install the skills and tools used by the app-workflow method into this machine.
# Safe to re-run. Never fails: a missing piece is skipped so a session can still start.
set -u
DEST="${HOME:-/root}/.claude/skills"
TMP="$(mktemp -d)"
mkdir -p "$DEST"
get() { git clone -q --depth 1 "https://github.com/$1.git" "$TMP/$2" 2>/dev/null; }
get obra/superpowers sp && cp -r "$TMP"/sp/skills/* "$DEST"/
get anthropics/skills an && cp -r "$TMP"/an/skills/frontend-design "$TMP"/an/skills/webapp-testing "$DEST"/
get trailofbits/skills tob && cp -r "$TMP"/tob/plugins/differential-review/skills/differential-review \
  "$TMP"/tob/plugins/static-analysis/skills/semgrep "$TMP"/tob/plugins/static-analysis/skills/sarif-parsing "$DEST"/
get mattpocock/skills mp && cp -r "$TMP"/mp/skills/productivity/grill-me "$TMP"/mp/skills/productivity/grilling "$DEST"/
get ridhwanafiff12-star/one-percent op && cp -r "$TMP"/op/.claude/skills/app-workflow "$DEST"/
command -v semgrep >/dev/null || pip install -q semgrep >/dev/null 2>&1
if ! command -v gitleaks >/dev/null; then
  curl -fsSL https://github.com/gitleaks/gitleaks/releases/download/v8.21.2/gitleaks_8.21.2_linux_x64.tar.gz \
    | tar xz -C /usr/local/bin gitleaks 2>/dev/null
fi
rm -rf "$TMP"
exit 0
