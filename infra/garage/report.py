import json
import pathlib
import sys

root = pathlib.Path(sys.argv[1])
measurements = json.loads((root / 'benchmark.json').read_text()) if (root / 'benchmark.json').exists() else []
resources = [json.loads(line) for line in (root / 'resources.jsonl').read_text().splitlines()] if (root / 'resources.jsonl').exists() else []
states = [json.loads(line) for line in (root / 'runner-states.jsonl').read_text().splitlines()] if (root / 'runner-states.jsonl').exists() else []

def memory_mib(value):
    amount, unit = value.strip().split() if ' ' in value.strip() else (None, None)
    if amount is None:
        import re
        match = re.fullmatch(r'([0-9.]+)([A-Za-z]+)', value.strip())
        if not match:
            return 0
        amount, unit = match.groups()
    return float(amount) * {'B': 1 / 1048576, 'KiB': 1 / 1024, 'MiB': 1, 'GiB': 1024, 'MB': 1000000 / 1048576}.get(unit, 0)

lines = ['# Prueba de Garage en Santiago', '', 'Garage v2.3.0, un nodo, SQLite, SSD, memoria máxima 256 MiB, CPU máxima 0,5. DuckDB: una instancia nueva por consulta, sin caché externa; la caché del filesystem permanece activa.', '', '## Consultas', '', 'Medianas de cinco repeticiones, en milisegundos. Las consultas recorren columnas de texto; no incluyen el pipeline HTTP completo del backend.', '', '| Filas | Consulta | Garage | S3 São Paulo | R2 | SSD |', '|---:|---|---:|---:|---:|---:|']
groups = {}
for m in measurements:
    if m['stage'] == 'duckdb':
        groups.setdefault((m['rows'], m['queryType']), {})[m['route']] = m['total']['median']
for (rows, kind), values in groups.items():
    lines.append('| ' + ' | '.join(map(str, [rows, kind, values.get('garage', '—'), values.get('s3', '—'), values.get('r2', values.get('r2_public', '—')), values.get('localfile', '—')])) + ' |')
comparisons = [v['garage'] <= v['s3'] * 0.5 for (rows, kind), v in groups.items() if kind in ['page', 'page2', 'two_columns'] and 'garage' in v and 's3' in v]
excluded = [m for m in measurements if m['stage'] == 'excluded']
lines += ['', '## Compatibilidad y recursos', '']
for m in measurements:
    if m['stage'] in ['isolation_verified', 'error', 'concurrency']:
        lines.append('- ' + json.dumps(m, ensure_ascii=False))
if (root / 'restart.json').exists():
    lines.append('- Persistencia: ' + json.dumps(json.loads((root / 'restart.json').read_text()), ensure_ascii=False))
if resources:
    for name in ['cabildo-garage-probe', 'cabildo-garage-benchmark']:
        peak = max((memory_mib(c['MemUsage'].split('/')[0]) for r in resources for c in r['containers'] if c['Name'] == name), default=0)
        cpu = max((float(c['CPUPerc'].rstrip('%')) for r in resources for c in r['containers'] if c['Name'] == name), default=0)
        lines.append(f'- {name}: máximo observado {peak:.1f} MiB; CPU {cpu:.1f}%. Muestreo periódico, puede omitir picos breves.')
    lines.append(f'- Memoria disponible mínima del host: {min(r["MemAvailable"] for r in resources) / 1024:.1f} MiB.')
    lines.append(f'- Swap durante la prueba: {resources[-1]["pswpin"] - resources[0]["pswpin"]} páginas ingresadas; {resources[-1]["pswpout"] - resources[0]["pswpout"]} páginas escritas.')
lines.append('- OOM de runners: ' + (str(any(s.get('OOMKilled') for s in states)) if states else 'sin registro de estado final; revisar la finalización del proceso.'))
if (root / 'aborted.json').exists():
    lines.append('- Prueba interrumpida: ' + (root / 'aborted.json').read_text())
lines += ['', '## Evaluación', '', 'Objetivo de mejora ≥50% frente a S3: ' + ('cumplido en todos los casos medidos.' if comparisons and all(comparisons) else 'no demostrado en todos los casos.'), '', 'Comparación R2: endpoint público si no se dispone de credenciales firmadas válidas; no equivale exactamente a la ruta firmada de S3. No se vació la caché del host. La muestra no certifica capacidad ni disponibilidad para producción.', '', 'Garage queda detenido y conserva los Parquet de prueba. Producción permanece vacía. Los backends mantienen su configuración original.']
if excluded:
    lines.append('Rutas excluidas: ' + json.dumps(excluded, ensure_ascii=False))
(root / 'report.md').write_text('\n'.join(lines) + '\n')
