import {fork, type ChildProcess} from 'node:child_process';
import {TopicActionError} from '../topic-title-edits.js';

export type WorkerResponse = {success: true; value: unknown; metrics?: Record<string, number>}
    | {success: false; error: string};
type Task = {job: object; timeoutMs: number; resolve: (value: any) => void; reject: (error: Error) => void};

// Keep one query active across page and LCCA workers within the backend's memory budget.
const waiting = new Set<PersistentWorker>();
let running: PersistentWorker | undefined;
function dispatch() {
    if (running) return;
    const next = waiting.values().next().value;
    if (!next) return;
    waiting.delete(next);
    running = next;
    next.start();
}

export class PersistentWorker {
    private child?: ChildProcess;
    private ready = false;
    private active?: Task;
    private timer?: ReturnType<typeof setTimeout>;
    private readonly queue: Task[] = [];

    constructor(private readonly file: URL, private readonly execArgv: string[], private readonly timeoutMessage: string) {}

    warm() {
        if (this.child) return;
        const child = this.spawn();
        child.unref();
        child.channel?.unref();
    }

    run<T>(job: object, timeoutMs: number): Promise<T> {
        if (this.queue.length >= 20) return Promise.reject(new TopicActionError(429, 'Hay demasiadas consultas en curso. Reintentá en unos segundos.'));
        return new Promise<T>((resolve, reject) => {
            this.queue.push({job, timeoutMs, resolve, reject});
            if (!this.active) waiting.add(this);
            dispatch();
        });
    }

    start() {
        this.active = this.queue.shift()!;
        this.timer = setTimeout(() => this.finish(new TopicActionError(408, this.timeoutMessage), undefined, true), this.active.timeoutMs);
        try {
            if (!this.child) this.spawn();
            this.child!.ref();
            this.child!.channel?.ref();
            if (this.ready) this.send();
        } catch (error) { this.finish(error instanceof Error ? error : new Error('No se pudo iniciar el worker.'), undefined, true); }
    }

    private spawn() {
        const child = this.child = fork(this.file, [], {execArgv: this.execArgv, stdio: ['ignore', 'ignore', 'ignore', 'ipc']});
        const failed = (error: Error) => {
            if (this.child === child) this.finish(error, undefined, true);
        };
        child.once('error', failed);
        child.once('exit', () => failed(new Error('El proceso de consulta terminó inesperadamente.')));
        child.once('disconnect', () => failed(new Error('El proceso de consulta perdió la conexión.')));
        child.on('message', (message: WorkerResponse & {ready?: boolean; workerRssBytes?: number}) => {
            if (this.child !== child) return;
            if (message.ready) {
                if (this.ready) return failed(new Error('El worker envió una respuesta inesperada.'));
                this.ready = true;
                if (this.active) this.send();
                else { child.unref(); child.channel?.unref(); }
                return;
            }
            if (!this.active) return failed(new Error('El worker envió una respuesta sin consulta activa.'));
            if (message.success && message.metrics) console.info(JSON.stringify({event: 'dataset_query', ...message.metrics}));
            // Release retained native allocations after a large query without rejecting its result.
            const recycle = (message.workerRssBytes ?? 0) > 192 * 1024 ** 2;
            if (message.success) this.finish(undefined, message.value, recycle);
            else this.finish(new TopicActionError(400, message.error), undefined, true);
        });
        return child;
    }

    private send() {
        const child = this.child!;
        try {
            child.send(this.active!.job, error => {
                if (error && this.child === child) this.finish(error, undefined, true);
            });
        } catch (error) { this.finish(error instanceof Error ? error : new Error('No se pudo enviar la consulta.'), undefined, true); }
    }

    private finish(error?: Error, value?: unknown, retire = false) {
        const task = this.active;
        clearTimeout(this.timer);
        this.timer = undefined;
        this.active = undefined;
        if (retire) {
            const child = this.child;
            this.child = undefined;
            this.ready = false;
            child?.kill('SIGKILL');
        } else {
            this.child?.unref();
            this.child?.channel?.unref();
        }
        if (!task) {
            if (error) console.warn(JSON.stringify({event: 'query_worker_stopped', worker: this.file.pathname.split('/').at(-1), error: error.name}));
            return;
        }
        if (error) task.reject(error); else task.resolve(value);
        running = undefined;
        if (this.queue.length) waiting.add(this);
        dispatch();
    }
}
