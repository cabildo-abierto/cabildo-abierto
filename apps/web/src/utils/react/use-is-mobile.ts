import {useMediaQuery} from "usehooks-ts";


export function useIsMobile() {
    const isMobile = useMediaQuery('(max-width: 900px)')
    return {isMobile}
}