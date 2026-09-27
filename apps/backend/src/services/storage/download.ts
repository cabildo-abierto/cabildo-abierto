import {lookup} from 'node:dns/promises';
import {BlockList, isIP} from 'node:net';
import http from 'node:http';
import https from 'node:https';
import {validDatasetUrl} from '@cabildo-abierto/utils';
import {TopicActionError} from '#/services/topic-title-edits.js';

const blocked = new BlockList();
for (const [network, prefix] of [
    ['0.0.0.0',8], ['10.0.0.0',8], ['100.64.0.0',10], ['127.0.0.0',8], ['169.254.0.0',16],
    ['172.16.0.0',12], ['192.0.0.0',24], ['192.0.2.0',24], ['192.88.99.0',24], ['192.168.0.0',16],
    ['198.18.0.0',15], ['198.51.100.0',24], ['203.0.113.0',24], ['224.0.0.0',4], ['240.0.0.0',4],
] as const) blocked.addSubnet(network, prefix, 'ipv4');
const globalV6 = new BlockList(); globalV6.addSubnet('2000::', 3, 'ipv6');
for (const [network, prefix] of [['2001::',23], ['2001:db8::',32], ['2002::',16], ['3fff::',20]] as const) blocked.addSubnet(network, prefix, 'ipv6');
export function publicRemoteAddress(address: string) {
    const family = isIP(address);
    return family === 4 ? !blocked.check(address, 'ipv4') : family === 6 && globalV6.check(address, 'ipv6') && !blocked.check(address, 'ipv6');
}
async function addresses(hostname: string, deadline: number) {
    const host = hostname.replace(/^\[|\]$/g, '');
    if (isIP(host)) return [{address: host, family: isIP(host)}];
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        return await Promise.race([
            lookup(host, {all: true}),
            new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Tiempo de espera agotado.')), Math.max(1, deadline - Date.now())); }),
        ]);
    } finally { if (timer) clearTimeout(timer); }
}
export async function downloadRemoteFile(source: string, options: {maxBytes: number; accept: string; label: string}): Promise<Buffer> {
    const deadline = Date.now() + 30000;
    const signal = AbortSignal.timeout(30000);
    let location = source;
    for (let redirects = 0; redirects <= 3; redirects++) {
        if (!validDatasetUrl(location) || location.length > 4096) throw new TopicActionError(400, 'La URL debe ser HTTP o HTTPS y no contener credenciales.');
        const url = new URL(location);
        const resolved = await addresses(url.hostname, deadline);
        if (!resolved.length || resolved.some(a => !publicRemoteAddress(a.address))) throw new TopicActionError(400, 'La URL debe apuntar a un servidor público.');
        const address = resolved[0];
        const response = await new Promise<http.IncomingMessage>((resolve, reject) => {
            const request = (url.protocol === 'https:' ? https : http).get(url, {
                agent: false, signal, headers: {Accept: options.accept, 'Accept-Encoding': 'identity'},
                lookup: (_host, options, callback) => {
                    if (typeof options === 'object' && options.all) callback(null, [address]);
                    else callback(null, address.address, address.family);
                },
            }, resolve);
            request.on('error', reject);
        });
        if ([301,302,303,307,308].includes(response.statusCode ?? 0)) {
            const next = response.headers.location; response.destroy();
            if (!next || redirects === 3) throw new TopicActionError(400, 'La URL tiene demasiadas redirecciones.');
            location = new URL(next, url).href; continue;
        }
        if (response.statusCode !== 200) { response.destroy(); throw new TopicActionError(400, `No pudimos descargar ${options.label} de esa URL.`); }
        if (response.headers['content-encoding'] && response.headers['content-encoding'] !== 'identity') {
            response.destroy(); throw new TopicActionError(400, `La URL debe devolver ${options.label} sin compresión.`);
        }
        const max = options.maxBytes;
        if (Number(response.headers['content-length']) > max) { response.destroy(); throw new TopicActionError(413, `El archivo remoto supera el tamaño permitido.`); }
        const chunks: Buffer[] = []; let length = 0;
        for await (const chunk of response) {
            length += chunk.length;
            if (length > max) { response.destroy(); throw new TopicActionError(413, `El archivo remoto supera el tamaño permitido.`); }
            chunks.push(Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
    }
    throw new TopicActionError(400, `No pudimos descargar ${options.label}.`);
}
