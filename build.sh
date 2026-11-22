#!/bin/bash
# Setter sammen index.html av delene i src/
cd "$(dirname "$0")"
{ cat src/00-head.html; for f in src/10-core.js src/15-audio.js src/20-data.js src/25-backdrop.js src/30-game.js src/40-run.js src/50-field.js src/60-podium.js src/90-main.js; do [ -f "$f" ] && { cat "$f"; echo; }; done; printf '</script>\n</body>\n</html>\n'; } > index.html
sed -n '/^<script>$/,/^<\/script>$/p' index.html | sed '1d;$d' > /tmp/game.js
node --check /tmp/game.js && echo "syntax ok"
wc -c index.html
