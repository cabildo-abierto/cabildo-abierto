import json
import pathlib
import subprocess
import sys
import time

root = pathlib.Path(sys.argv[1])
runner = sys.argv[2]
baseline = json.loads((root / 'baseline.json').read_text())
low_memory = 0
initial_oom = None

def inspect(names):
    result = subprocess.run(['docker', 'inspect', *names], capture_output=True, text=True)
    return json.loads(result.stdout) if result.returncode == 0 else []

while True:
    memory = {line.split(':')[0]: int(line.split()[1]) for line in pathlib.Path('/proc/meminfo').read_text().splitlines() if line.startswith(('MemAvailable:', 'SwapFree:'))}
    vm = dict(line.split() for line in pathlib.Path('/proc/vmstat').read_text().splitlines())
    if initial_oom is None:
        initial_oom = int(vm['oom_kill'])
    services = inspect(list(baseline))
    probes = inspect(['cabildo-garage-probe']) + inspect([runner])
    reason = None
    low_memory = low_memory + 1 if memory['MemAvailable'] < 150 * 1024 else 0
    if low_memory >= 3:
        reason = 'Memoria disponible menor que 150 MiB durante tres muestras'
    if len(services) != len(baseline) or any(not s['State']['Running'] or s['State'].get('Health', {}).get('Status') != baseline[s['Id']] for s in services):
        reason = 'Cambió el estado de un servicio existente'
    if any(p['State'].get('OOMKilled') for p in probes):
        reason = 'OOM de Garage o del benchmark'
    if int(vm['oom_kill']) > initial_oom:
        reason = 'El kernel registró un OOM durante la prueba'
    usage = subprocess.run(['docker', 'stats', '--no-stream', '--format', '{{json .}}', 'cabildo-garage-probe', runner], capture_output=True, text=True)
    sample = {'time': time.time(), **memory, 'pswpin': int(vm['pswpin']), 'pswpout': int(vm['pswpout']), 'oom_kill': int(vm['oom_kill']), 'containers': [json.loads(line) for line in usage.stdout.splitlines() if line.startswith('{')]}
    with (root / 'resources.jsonl').open('a') as output:
        output.write(json.dumps(sample) + '\n')
    if reason:
        (root / 'aborted.json').write_text(json.dumps({'reason': reason}))
        subprocess.run(['docker', 'stop', '-t', '3', runner], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(['docker', 'stop', '-t', '10', 'cabildo-garage-probe'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        break
    time.sleep(2)
