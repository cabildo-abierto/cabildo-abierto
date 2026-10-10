import {execFile} from 'node:child_process';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {promisify} from 'node:util';
import type {RepositoryFile} from './argendata-catalog.js';

export const argendataRepository = 'argendatafundar/data';
const execute = promisify(execFile);

export async function argendataRepositoryFiles() {
    const directory = await mkdtemp(join(tmpdir(), 'ca-argendata-'));
    const path = join(directory, 'repository');
    const options = {timeout: 120_000, maxBuffer: 16 * 1024 * 1024, env: {...process.env, GIT_TERMINAL_PROMPT: '0'}};
    try {
        console.log('Argendata: obteniendo el índice público del repositorio…');
        await execute('git', ['clone', '--quiet', '--depth=1', '--filter=blob:none', '--no-checkout', '--',
            `https://github.com/${argendataRepository}.git`, path], options);
        const {stdout: revision} = await execute('git', ['-C', path, 'rev-parse', 'HEAD'], options);
        const commit = revision.trim();
        if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('El repositorio devolvió un commit inválido.');
        const {stdout: tree} = await execute('git', ['-C', path, 'ls-tree', '-rz', '--full-tree', commit], options);
        const files: RepositoryFile[] = [];
        for (const entry of tree.split('\0')) {
            if (!entry) continue;
            const match = entry.match(/^\d+ (blob|tree|commit) [a-f0-9]{40}\t([\s\S]+)$/);
            if (!match) throw new Error('El repositorio devolvió una entrada inválida.');
            if (match[1] === 'blob') files.push({path: match[2]});
        }
        return {commit, files};
    } catch (error) {
        throw new Error(`No se pudo leer el repositorio público de Argendata mediante Git: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        await rm(directory, {recursive: true, force: true});
    }
}
