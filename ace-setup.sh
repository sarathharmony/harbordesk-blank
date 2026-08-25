#!/usr/bin/env bash
# ACE instance setup script.
# Invoked by the ACE engine (and `ace run`) before services start.
# The engine passes an action via the ACE_SETUP_ACTION env var:
#   install (default) | uninstall | check
set -euo pipefail

ACTION="${ACE_SETUP_ACTION:-install}"
echo "[ace-setup] action=${ACTION}"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "[ace-setup] pnpm not found; enabling via corepack"
  corepack enable >/dev/null 2>&1 || true
  corepack prepare pnpm@9.12.0 --activate >/dev/null 2>&1 || true
fi

case "${ACTION}" in
  install)
    echo "[ace-setup] installing workspace dependencies with pnpm"
    pnpm install --frozen-lockfile || pnpm install
    ;;
  check)
    echo "[ace-setup] verifying pnpm + node"
    pnpm --version
    node --version
    ;;
  uninstall)
    echo "[ace-setup] removing node_modules"
    rm -rf node_modules packages/*/node_modules
    ;;
  *)
    echo "[ace-setup] unknown action '${ACTION}', defaulting to install"
    pnpm install
    ;;
esac

echo "[ace-setup] done"
