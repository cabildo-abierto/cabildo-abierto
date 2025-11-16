
export function updateSearchParam(key: string, value: string | string[] | null) {
    const params: Record<string, string | string[] | null> = {}
    params[key] = value
    updateSearchParams(params)
}


export function updateSearchParams(params: Record<string, string | string[] | null>) {
    const url = new URL(window.location.href)
    Object.entries(params).map(([key, value]) => {
        url.searchParams.delete(key)

        if (Array.isArray(value)) {
            value.forEach(x => url.searchParams.append(key, x))
        } else if(typeof value == "string") {
            url.searchParams.set(key, value)
        }
    })
    window.history.pushState({}, '', url.toString())
}