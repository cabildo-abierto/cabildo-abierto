import type {APIResult} from '@cabildo-abierto/api';
import {backendUrl} from '@/lib/fetch';

export class DataViewRequestError extends Error {
    readonly systemError: boolean;
    constructor(message: string, status: number) {
        super(message);
        this.systemError = status === 0 || status >= 500 || status === 429;
    }
}

export async function dataViewRequest<T>(route: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(`${backendUrl}${route}`, {credentials: 'include', ...options});
        const output: APIResult<T> = await response.json();
        if ('error' in output) throw new DataViewRequestError(output.error, response.status);
        if (!response.ok) throw new DataViewRequestError('No pudimos cargar los datos.',response.status);
        return output.value;
    } catch (error) {
        if (error instanceof DataViewRequestError || (error instanceof Error && error.name === 'AbortError')) throw error;
        throw new DataViewRequestError('No pudimos conectarnos para cargar los datos. Reintentá en unos momentos.',0);
    }
}
