#!/usr/bin/env bash
#
# Produces a single deployable ASP.NET Core application that serves the
# Angular production build from wwwroot.
#
#   1. Installs Angular dependencies.
#   2. Builds the Angular app in production mode.
#   3. Clears the API wwwroot folder.
#   4. Copies the Angular output into src/Mentiq.Api/wwwroot.
#   5. Publishes the ASP.NET Core API (unless --skip-publish is given).
#
# Usage:
#   ./scripts/build-production.sh [--configuration Release] [--output publish] [--skip-publish]

set -euo pipefail

CONFIGURATION="Release"
OUTPUT="publish"
SKIP_PUBLISH=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --configuration) CONFIGURATION="$2"; shift 2 ;;
    --output)        OUTPUT="$2"; shift 2 ;;
    --skip-publish)  SKIP_PUBLISH=1; shift ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
CLIENT_DIR="$REPO_ROOT/src/Mentiq.Client"
API_DIR="$REPO_ROOT/src/Mentiq.Api"
WWWROOT="$API_DIR/wwwroot"
ANGULAR_OUT="$CLIENT_DIR/dist/mentiq-client/browser"

echo "==> [1/5] Installing Angular dependencies..."
cd "$CLIENT_DIR"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "==> [2/5] Building Angular (production)..."
npx ng build --configuration production

echo "==> [3/5] Clearing API wwwroot..."
rm -rf "${WWWROOT:?}"/*
mkdir -p "$WWWROOT"

echo "==> [4/5] Copying Angular build into wwwroot..."
if [[ ! -d "$ANGULAR_OUT" ]]; then
  echo "Angular build output not found at $ANGULAR_OUT" >&2
  exit 1
fi
cp -R "$ANGULAR_OUT"/. "$WWWROOT"/

if [[ "$SKIP_PUBLISH" -eq 1 ]]; then
  echo "==> Skipping dotnet publish (--skip-publish)."
  echo "Done. Angular build is in the API wwwroot."
  exit 0
fi

echo "==> [5/5] Publishing ASP.NET Core API ($CONFIGURATION)..."
dotnet publish "$API_DIR/Mentiq.Api.csproj" -c "$CONFIGURATION" -o "$REPO_ROOT/$OUTPUT"

echo "Done. Published application is in $REPO_ROOT/$OUTPUT"
