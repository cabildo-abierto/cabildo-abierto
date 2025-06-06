import {backendUrl} from "@/utils/uri";

type FetchBackendProps = {
    route: string
    method?: "GET" | "POST"
    credentials?: "include" | "omit"
    body?: any
}

export const fetchBackend = async ({
                                       route,
                                       method="GET",
                                       credentials="include",
                                       body}: FetchBackendProps) => {
    return fetch(backendUrl + route, {
        method: method,
        credentials: credentials,
        headers: body ? {
            "Content-Type": "application/json",
        } : undefined,
        body: body ? JSON.stringify(body) : undefined
    })
}

export type PostOutput<Output> = Promise<{error?: string, data?: Output}>

export async function post<Body, Output>(route: string, body?: Body): Promise<PostOutput<Output>> {
    const res = await fetchBackend({
        route,
        method: "POST",
        credentials: "include",
        body
    })
    if(res.ok){
        return await res.json()
    } else {
        return {error: "Error en la conexión."}
    }
}


export async function get<Output>(route: string): Promise<PostOutput<Output>> {
    const res = await fetchBackend({
        route,
        method: "GET",
        credentials: "include"
    })
    if(res.ok){
        return await res.json()
    } else {
        return {error: "Error en la conexión"}
    }
}


export function updateSearchParam(key: string, value: string | string[] | null) {
    const url = new URL(window.location.href);
    url.searchParams.delete(key)

    if (Array.isArray(value)) {
        value.forEach(x => url.searchParams.append(key, x));
    } else if(typeof value == "string") {
        url.searchParams.set(key, value)
    }
    console.log("pushing", url.toString())
    window.history.pushState({}, '', url.toString());
}