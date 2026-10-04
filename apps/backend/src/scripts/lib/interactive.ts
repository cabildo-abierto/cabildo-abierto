import {createInterface} from 'node:readline/promises';
import {Writable} from 'node:stream';

export function interactivePrompts() {
    if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Ejecutá este script en una terminal interactiva.');
    let hidden = false;
    const output = new Writable({write(chunk, _encoding, done) {
        if (!hidden) process.stdout.write(chunk);
        done();
    }});
    const reader = createInterface({input: process.stdin, output, terminal: true});
    const abort = new AbortController();
    const cancel = () => {abort.abort(); reader.close();};
    reader.on('SIGINT', cancel);
    process.on('SIGINT', cancel);
    return {
        signal: abort.signal,
        async ask(label: string, secret = false): Promise<string> {
            abort.signal.throwIfAborted();
            if (!secret) return (await reader.question(`${label}: `, {signal: abort.signal})).trim();
            process.stdout.write(`${label} (entrada oculta; pegá el valor y presioná Enter):\n`);
            hidden = true;
            try {return (await reader.question('', {signal: abort.signal})).trim();}
            finally {hidden = false; process.stdout.write('\n');}
        },
        close() {reader.close(); process.removeListener('SIGINT', cancel);},
    };
}
