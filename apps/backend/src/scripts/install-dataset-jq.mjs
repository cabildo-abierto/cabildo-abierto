import {createHash} from 'node:crypto';
import {mkdir, writeFile, chmod} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const builds = {
    x64: ['amd64', 'b1c22172dd303f3be49e935aa56aa48a8b7a46e0bc838b4997d3bb451495870f'],
    arm64: ['arm64', '8b85c817833814ddca00a144c33705546355afccf0cf39b188f3cdb48b852309'],
};
const build = builds[process.arch];
if (process.platform !== 'linux' || !build) throw new Error('La preparación JSON requiere Linux x64 o arm64 (también mediante el contenedor del backend).');
const destination = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../../vendor/jq', import.meta.url));
const response = await fetch(`https://github.com/jqlang/jq/releases/download/jq-1.8.2/jq-linux-${build[0]}`, {signal: AbortSignal.timeout(60000)});
if (!response.ok) throw new Error(`No se pudo descargar jq (${response.status}).`);
const bytes = Buffer.from(await response.arrayBuffer());
if (createHash('sha256').update(bytes).digest('hex') !== build[1]) throw new Error('El checksum de jq no coincide con la versión fijada.');
await mkdir(dirname(destination), {recursive: true});
await writeFile(destination, bytes);
await chmod(destination, 0o755);
console.log('jq 1.8.2 instalado y verificado.');
console.log('También se requieren bubblewrap y util-linux (bwrap y prlimit). En Debian/Ubuntu: sudo apt-get install bubblewrap util-linux');
console.log('Comprobá el aislamiento con: pnpm --filter backend datasets:check-jq');
