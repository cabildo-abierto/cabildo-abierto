import type {KyselyPlugin} from 'kysely';

export function devDbLatencyPlugin(delayMs: number): KyselyPlugin {
    return {
        transformQuery: ({node}) => node,
        async transformResult({result}) {
            await new Promise<void>(resolve => setTimeout(resolve, delayMs));
            return result;
        },
    };
}
