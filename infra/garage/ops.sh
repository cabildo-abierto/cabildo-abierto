#!/usr/bin/env bash
set -euo pipefail
umask 077
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT=/mnt/cabildo-storage/garage
compose() { docker compose -f "$HERE/compose.yml" "$@"; }
network() { docker network inspect cabildo-storage >/dev/null 2>&1 || docker network create cabildo-storage >/dev/null; }
cli() { docker exec cabildo-garage-probe /garage "$@"; }
ready() {
  for attempt in $(seq 1 30); do
    if cli status >/dev/null 2>&1; then return; fi
    sleep 1
  done
  echo 'Garage no quedó listo.' >&2
  return 1
}
case "${1:-}" in
  setup)
    mountpoint -q /mnt/cabildo-storage || { echo 'El SSD no está montado.' >&2; exit 1; }
    if [ ! -d "$ROOT" ]; then
      [ "$(awk '/MemAvailable/ {print $2}' /proc/meminfo)" -ge 307200 ] || { echo 'Se necesitan 300 MiB disponibles para preparar la prueba.' >&2; exit 1; }
      if ss -ltn | awk '{print $4}' | grep -Eq ':(3900|3901|3903)$'; then
        echo 'Un puerto de Garage ya está ocupado.' >&2; exit 1
      fi
      install -d -m 0700 "$ROOT" "$ROOT/meta" "$ROOT/data" "$ROOT/snapshots" "$ROOT/probe" "$ROOT/results"
      python3 - "$HERE/garage.toml.template" "$ROOT" <<'PY'
import json,secrets,sys,pathlib
template=pathlib.Path(sys.argv[1]).read_text(); root=pathlib.Path(sys.argv[2])
admin=secrets.token_hex(32)
for key,value in {'RPC_SECRET':secrets.token_hex(32),'ADMIN_TOKEN':admin,'METRICS_TOKEN':secrets.token_hex(32)}.items():
    template=template.replace('@'+key+'@',value)
(root/'garage.toml').write_text(template)
dev={'accessKeyId':'GK'+secrets.token_hex(16),'secretAccessKey':secrets.token_hex(32)}
(root/'credentials.json').write_text(json.dumps({'dev':dev}))
(root/'bootstrap.env').write_text('GARAGE_DEFAULT_ACCESS_KEY='+dev['accessKeyId']+'\nGARAGE_DEFAULT_SECRET_KEY='+dev['secretAccessKey']+'\nGARAGE_DEFAULT_BUCKET=cabildoabierto-dev\n')
PY
    fi
    network
    compose up -d
    ready
    if [ ! -f "$ROOT/provisioned" ]; then
      cli bucket create cabildoabierto-prod >/dev/null
      cli key create cabildo-prod > "$ROOT/prod-key.txt"
      cli bucket allow cabildoabierto-prod --key cabildo-prod --read --write >/dev/null
      python3 - "$ROOT" <<'PY'
import json,pathlib,re,sys
root=pathlib.Path(sys.argv[1]); raw=(root/'prod-key.txt').read_text()
key=re.search(r'Key ID:\s*(\S+)',raw); secret=re.search(r'Secret key:\s*(\S+)',raw)
if not key or not secret: raise SystemExit('No se pudieron interpretar las credenciales de Garage.')
creds=json.loads((root/'credentials.json').read_text())
creds['prod']={'accessKeyId':key[1],'secretAccessKey':secret[1]}
(root/'credentials.json').write_text(json.dumps(creds))
PY
      cli bucket deny cabildoabierto-dev --key "$(python3 -c 'import json;print(json.load(open("/mnt/cabildo-storage/garage/credentials.json"))["dev"]["accessKeyId"])')" --owner >/dev/null
      rm "$ROOT/prod-key.txt"
      touch "$ROOT/provisioned"
    fi
    echo 'Garage preparado. Credenciales privadas: /mnt/cabildo-storage/garage/credentials.json'
    ;;
  start) network; compose up -d; ready ;;
  stop) compose stop ;;
  status) compose ps; cli status ;;
  clean-probe)
    compose stop
    find "$ROOT/probe" -maxdepth 1 -type f -delete
    echo 'Archivos de entrada del benchmark eliminados; almacenamiento y resultados conservados.'
    ;;
  *) echo 'Uso: bash ops.sh setup|start|stop|status|clean-probe' >&2; exit 2 ;;
esac
