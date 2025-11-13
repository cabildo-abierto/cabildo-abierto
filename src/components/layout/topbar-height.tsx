import {usePathname} from "next/navigation";
import {useLayoutConfig} from "@/components/layout/layout-config-context";


export function useTopbarHeight() {
    const pathname = usePathname()
    const {isMobile} = useLayoutConfig()
    const pages = ["inicio", "buscar", "temas"]
    if(isMobile && pages.some(p => pathname.startsWith(`/${p}`))){
        return 96
    } else {
        return 48
    }
}