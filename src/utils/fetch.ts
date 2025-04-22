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

type PostProps = {
    route: string
    body: any
}

export const post = async ({
    route,
    body
}: PostProps) => {
    const res = await fetchBackend({
        route,
        method: "POST",
        credentials: "include",
        body
    })
    if(res.ok){
        const {error} = await res.json()
        return {error}
    } else {
        return {error: "Error en la conexión."}
    }
}