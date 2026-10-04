import {spawn} from 'node:child_process';
import {createWriteStream} from 'node:fs';
import {access, writeFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {Transform} from 'node:stream';
import {pipeline} from 'node:stream/promises';

export type JqLimits = {bytes: number; memoryMB: number; seconds: number};

/** jq only sees its static binary, the input and the user's filter. No host directories or environment. */
export async function transformJSON(path: string, filter: string | null, directory: string, limits: JqLimits) {
    const binary = resolve(process.env.DATASET_JQ_PATH || 'vendor/jq');
    try { await access(binary); } catch { throw new Error('Falta jq: ejecutá pnpm --filter backend datasets:install-jq.'); }
    const program = join(directory, 'transform.jq'), output = join(directory, 'transformed.json');
    await writeFile(program, filter || '.', {mode: 0o600});
    const child = spawn('prlimit', [
        `--as=${Math.floor(limits.memoryMB * 1024 * 1024)}`, `--cpu=${Math.ceil(limits.seconds)}`, `--fsize=${Math.floor(limits.bytes)}`, '--',
        'bwrap', '--unshare-all', '--die-with-parent', '--new-session', '--clearenv', '--cap-drop', 'ALL',
        '--ro-bind', binary, '/jq', '--ro-bind', path, '/input.json', '--ro-bind', program, '/filter.jq',
        '--chdir', '/', '--', '/jq', '-M', '-c', '-f', '/filter.jq', '/input.json',
    ], {env: {PATH: '/usr/bin:/bin'}, stdio: ['ignore', 'pipe', 'pipe']});
    let stderr = '', failure: Error | undefined, size = 0;
    child.stderr.on('data', chunk => { if (stderr.length < 4096) stderr += String(chunk).slice(0, 4096 - stderr.length); });
    const timer = setTimeout(() => { failure = new Error('La transformación jq superó el tiempo permitido.'); child.kill('SIGKILL'); }, limits.seconds * 1000);
    const completed = new Promise<void>((resolve, reject) => {
        child.once('error', () => reject(new Error('No se pudo iniciar jq aislado. Se requieren Bubblewrap y prlimit.')));
        child.once('close', code => {
            if (failure) return reject(failure);
            if (code === 0) return resolve();
            if (/bwrap:|prlimit:/.test(stderr)) return reject(new Error('No se pudo iniciar el aislamiento de jq. Ejecutá datasets:check-jq y verificá que el contenedor permita user namespaces.'));
            const detail = stderr.replaceAll('/filter.jq', '[consulta]').replaceAll('/input.json', '[JSON]').trim();
            reject(new Error(detail ? `Error de jq: ${detail}` : 'jq terminó antes de completar la transformación (revisá los límites de memoria y tiempo).'));
        });
    });
    const writing = pipeline(child.stdout, new Transform({transform(chunk, _encoding, callback) {
        size += chunk.length;
        if (size > limits.bytes) { failure = new Error('La salida de jq supera el tamaño permitido.'); child.kill('SIGKILL'); callback(failure); }
        else callback(null, chunk);
    }}), createWriteStream(output, {flags: 'wx', mode: 0o600}));
    try {
        await Promise.all([completed, writing]);
        return output;
    } finally {
        clearTimeout(timer);
        child.kill('SIGKILL');
        await Promise.allSettled([completed, writing]);
    }
}
