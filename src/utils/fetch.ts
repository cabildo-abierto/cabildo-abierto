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