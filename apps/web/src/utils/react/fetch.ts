import {backendUrl} from "@/lib/fetch";
import {APIResult} from "@cabildo-abierto/api";


type FetchBackendProps = {
    route: string
    method?: "GET" | "POST" | "PATCH" | "DELETE"
    credentials?: "include" | "omit"
    body?: any
    redirect?: "follow" | "error" | "manual"
    headers?: Record<string, string>
}


export const fetchBackend = async ({
                                route,
                                method = "GET",
                                credentials = "include",
                                body,
                                headers,
                                redirect
                            }: FetchBackendProps) => {
    return fetch(backendUrl + route, {
        method: method,
        credentials: credentials,
        headers: headers ?? (body ? {
            "Content-Type": "application/json",
        } : undefined),
        body: body ? JSON.stringify(body) : undefined,
        redirect
    })
}


export async function post<Body, Output={}>(route: string, body?: Body, redirect?: "follow" | "error" | "manual"): PostOutput<Output> {
    try {
        const res = await fetchBackend({
            route,
            method: "POST",
            credentials: "include",
            body,
            redirect
        })
        return await res.json()
    } catch {
        return {success: false, error: "Error en la conexión."}
    }
}


export async function get<Output>(route: string): PostOutput<Output> {
    try {
        const res = await fetchBackend({
            route,
            method: "GET",
            credentials: "include"
        })
        return await res.json()
    } catch {
        return {success: false, error: "Error en la conexión"}
    }
}

export async function patch<Body, Output={}>(route: string, body: Body): PostOutput<Output> {
    try {
        const res = await fetchBackend({route, method: "PATCH", credentials: "include", body});
        return await res.json();
    } catch {
        return {success: false, error: "Error en la conexión."};
    }
}

export async function del<Output={}>(route: string, body?: unknown): PostOutput<Output> {
    try {
        const res = await fetchBackend({route, method: "DELETE", credentials: "include", body});
        return await res.json();
    } catch {
        return {success: false, error: "Error en la conexión."};
    }
}



export type PostOutput<Output> = Promise<APIResult<Output>>


export function setSearchParams(baseUrl: string, params: {[key: string]: string | string[] | undefined}): string {
    const keyValues: [string, string][] = []
    Object.entries(params).forEach(([key, value]) => {
        if(value == null) return
        if(typeof value == "string") {
            keyValues.push([key, value])
        } else {
            value.forEach(v => {
                keyValues.push([key, v])
            })
        }
    })
    if(keyValues.length == 0) {
        return baseUrl
    }
    return baseUrl + "?" + keyValues.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&")
}
