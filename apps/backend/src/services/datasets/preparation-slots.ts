import {TopicActionError} from '../topic-title-edits.js';
export function createDatasetSlot(limit: number) {
    let active = 0;
    const waiting: (()=>void)[] = [];
    return async () => {
        if (waiting.length >= 20) throw new TopicActionError(429,'Hay demasiados datasets en preparación. Reintentá en unos segundos.');
        await new Promise<void>(resolve => {
            const start = () => { active++; resolve(); };
            if (active < limit) start(); else waiting.push(start);
        });
        let released = false;
        return () => {
            if (released) return;
            released = true;
            active--;
            waiting.shift()?.();
        };
    };
}
export const preparationSlot = createDatasetSlot(1);
