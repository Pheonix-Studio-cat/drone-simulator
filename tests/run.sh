#!/usr/bin/env bash
# Alle Prüfsuiten durchlaufen und zählen.
#   bash tests/run.sh            alle
#   bash tests/run.sh vrs motor  nur diese
cd "$(dirname "$0")" || exit 1
[ -d ../node_modules/playwright ] || (cd .. && npm install --no-audit --no-fund playwright >/dev/null)

if [ $# -gt 0 ]; then SUITEN=(); for n in "$@"; do SUITEN+=("test_$n.js"); done
else SUITEN=(test_*.js); fi

P=0; F=0; ROT=""
for t in "${SUITEN[@]}"; do
  [ -f "$t" ] || { echo "?? $t gibt es nicht"; continue; }
  out=$(node "$t" 2>&1)
  p=$(printf '%s\n' "$out" | grep -c '^PASS')
  f=$(printf '%s\n' "$out" | grep -c '^FAIL')
  P=$((P+p)); F=$((F+f))
  printf '%-18s %3d ok  %d fehler\n' "$t" "$p" "$f"
  [ "$f" -gt 0 ] && ROT="$ROT"$'\n'"--- $t ---"$'\n'"$(printf '%s\n' "$out" | grep '^FAIL')"
done
echo "===== $P Prüfungen, $F Fehler ====="
[ -n "$ROT" ] && printf '%s\n' "$ROT"
[ "$F" -eq 0 ]
