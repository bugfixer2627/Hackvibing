#!/usr/bin/env bash
# build.sh — concatenates src/ JS into a single self-contained dist/index.html
# Usage: bash build.sh
set -euo pipefail

SRC_DIR="src"
DIST_DIR="dist"
OUT="$DIST_DIR/index.html"
HTML_SHELL="$SRC_DIR/index.html"

if [ ! -f "$HTML_SHELL" ]; then
  echo "ERROR: $HTML_SHELL not found" >&2
  exit 1
fi

mkdir -p "$DIST_DIR"

# Dependency-ordered list of JS files (must match the order in CLAUDE.md / prompt 01)
FILES=(
  "$SRC_DIR/core/storage.js"
  "$SRC_DIR/core/inputHandler.js"
  "$SRC_DIR/render/drawUtils.js"
  "$SRC_DIR/data/ingredients.js"
  "$SRC_DIR/data/destinations.js"
  "$SRC_DIR/data/recipes_china.js"
  "$SRC_DIR/data/recipes_america.js"
  "$SRC_DIR/data/recipes_indonesia.js"
  "$SRC_DIR/data/recipes_india.js"
  "$SRC_DIR/data/recipeEngine.js"
  "$SRC_DIR/render/foodArt.js"
  "$SRC_DIR/render/stampArt.js"
  "$SRC_DIR/screens/homeScreen.js"
  "$SRC_DIR/screens/ingredientScreen.js"
  "$SRC_DIR/screens/travelScreen.js"
  "$SRC_DIR/screens/recipeScreen.js"
  "$SRC_DIR/screens/passportScreen.js"
  "$SRC_DIR/screens/shareScreen.js"
  "$SRC_DIR/core/screenManager.js"
  "$SRC_DIR/core/main.js"
)

# Assemble the script bundle into a temp file
BUNDLE=$(mktemp)
trap 'rm -f "$BUNDLE"' EXIT

{
  echo "<script>"
  echo "'use strict';"
  for f in "${FILES[@]}"; do
    if [ ! -f "$f" ]; then
      echo ""
      echo "// MISSING: $f"
      continue
    fi
    echo ""
    echo "// === $f ==="
    cat "$f"
  done
  echo ""
  echo "</script>"
} > "$BUNDLE"

# Substitute the marker with bundle contents using awk (safe for arbitrary content)
awk -v bundle_file="$BUNDLE" '
  /<!-- BUILD_SCRIPTS_HERE -->/ {
    while ((getline line < bundle_file) > 0) print line
    close(bundle_file)
    next
  }
  { print }
' "$HTML_SHELL" > "$OUT"

# Report
SIZE=$(wc -c < "$OUT")
SIZE_KB=$((SIZE / 1024))
echo "Built: $OUT"
echo "Size: $SIZE bytes (~${SIZE_KB} KB)"
