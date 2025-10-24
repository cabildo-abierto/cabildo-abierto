import {usePathname, useRouter, useSearchParams} from "next/navigation";

export function useUpdateSearchParams() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const updateSearchParams = (params: Record<string, string | string[] | null>) => {
        const newSearchParams = new URLSearchParams(searchParams.toString())

        Object.entries(params).forEach(([key, value]) => {
            newSearchParams.delete(key)
            if (Array.isArray(value)) {
                value.forEach(x => newSearchParams.append(key, x))
            } else if (typeof value === "string") {
                newSearchParams.set(key, value)
            }
        })

        console.log("pushing")
        router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false })
    }

    const updateSearchParam = (key: string, value: string | string[] | null) => {
        const params: Record<string, string | string[] | null> = {}
        params[key] = value
        updateSearchParams(params)
    }

    return {updateSearchParam, updateSearchParams}
}