#!/bin/sh
# Copy a fresh build into an already-installed copy of this plugin, so an open
# DeepSeek Harness page picks it up on the next refresh without a restart.
#
#   sh scripts/install-local.sh <installed-plugin-dir>
#
# <installed-plugin-dir> is the directory DeepSeek Harness loads the plugin
# from (the one containing lib/client.js). Host-side changes (lib/index.js)
# still need a DeepSeek Harness restart.
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
DEST=${1:?usage: sh scripts/install-local.sh <installed-plugin-dir>}
[ -f "$DEST/package.json" ] || { echo "not a plugin dir: $DEST" >&2; exit 1; }
node "$ROOT/scripts/build.mjs"
mkdir -p "$DEST/lib" "$DEST/assets"
cp "$ROOT/lib/client.js" "$ROOT/lib/index.js" "$DEST/lib/"
cp "$ROOT"/assets/* "$DEST/assets/"
cp "$ROOT/package.json" "$ROOT/cordis.patch.yml" "$DEST/"
echo "updated $DEST"
