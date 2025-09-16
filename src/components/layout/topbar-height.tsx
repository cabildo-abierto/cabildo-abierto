import {usePathname} from "next/navigation";


export function useTopbarHeight() {
    const pathname = usePathname()
    const pages = ["inicio", "buscar", "temas"]
    if(pages.some(p => pathname.startsWith(`/${p}`))){
        return 96
    } else {
        return 48
    }
}