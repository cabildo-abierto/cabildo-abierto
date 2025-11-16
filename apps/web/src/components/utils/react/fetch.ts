import {backendUrl} from "@/lib/fetch";


type FetchBackendProps = {
    route: string
    method?: "GET" | "POST"
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


export async function post<Body, Output>(route: string, body?: Body): PostOutput<Output> {
    const res = await fetchBackend({
        route,
        method: "POST",
        credentials: "include",
        body
    })
    if (res.ok) {
        const json = await res.json()
        if (json.error && (json.error == "No session" || json.error == "Unauthorized")) {
            console.log("sin sesion!")
            // window.location.href = "/login"
            return {error: "Iniciá sesión"}
        }
        return json
    } else {
        return {error: "Error en la conexión."}
    }
}


export async function get<Output>(route: string): PostOutput<Output> {
    const res = await fetchBackend({
        route,
        method: "GET",
        credentials: "include"
    })
    if (res.ok) {
        const json = await res.json()
        if (json.error && (json.error == "No session" || json.error == "Unauthorized")) {
            console.log("sin sesion!")
            // window.location.href = "/login"
            return {error: "Iniciá sesión"}
        }
        return json
    } else {
        return {error: "Error en la conexión"}
    }
}


export type PostOutput<Output> = Promise<{ error?: string, data?: Output }>