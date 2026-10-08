#!/usr/bin/env bash
set -euo pipefail
umask 077
if [ "$#" -gt 1 ] || { [ "$#" -eq 1 ] && [ "$1" != --verify-only ]; }; then
  echo 'Uso: bash run-benchmark.sh [--verify-only]' >&2; exit 2
fi
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT=/mnt/cabildo-storage/garage
IMAGE="$(docker inspect cabildo-dev-backend-1 --format '{{.Image}}')"
RUNNER=cabildo-garage-benchmark
RESULT="$ROOT/results/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -m 0700 "$RESULT"
finish() {
  docker rm -f "$RUNNER" >/dev/null 2>&1 || true
  if [ -n "${MONITOR_PID:-}" ]; then kill "$MONITOR_PID" 2>/dev/null || true; wait "$MONITOR_PID" 2>/dev/null || true; fi
  bash "$HERE/ops.sh" stop >/dev/null
}
trap finish EXIT
trap 'exit 130' INT TERM
bash "$HERE/ops.sh" start
python3 - "$RESULT" <<'PY'
import json,subprocess,sys,pathlib
ids=subprocess.check_output(['docker','ps','-q']).decode().split()
data=json.loads(subprocess.check_output(['docker','inspect',*ids]))
baseline={d['Id']:d['State'].get('Health',{}).get('Status') for d in data if d['Name']!='/cabildo-garage-probe'}
pathlib.Path(sys.argv[1]+'/baseline.json').write_text(json.dumps(baseline))
PY
python3 "$HERE/monitor.py" "$RESULT" "$RUNNER" &
MONITOR_PID=$!
run() {
  local status=0
  docker run --name "$RUNNER" --network host --read-only --tmpfs /tmp:rw,size=32m \
    --memory=256m --memory-swap=256m --cpus=1 \
    -v "$ROOT/probe:/probe:ro" -v "$ROOT/credentials.json:/credentials.json:ro" \
    -v "$RESULT:/results" -v "$HERE/benchmark-worker.mjs:/worker.mjs:ro" \
    --entrypoint node "$IMAGE" /worker.mjs "$@" || status=$?
  docker inspect "$RUNNER" --format '{{json .State}}' >> "$RESULT/runner-states.jsonl"
  docker rm "$RUNNER" >/dev/null
  return "$status"
}
if [ "${1:-}" != --verify-only ]; then
  run | tee "$RESULT/progress.jsonl"
  test ! -e "$RESULT/aborted.json"
  bash "$HERE/ops.sh" stop >/dev/null
  bash "$HERE/ops.sh" start
fi
run --verify | tee -a "$RESULT/progress.jsonl"
test ! -e "$RESULT/aborted.json"
echo "Resultados: $RESULT"
