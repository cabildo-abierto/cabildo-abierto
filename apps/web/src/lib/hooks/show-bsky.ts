import {useSearchParams} from "next/navigation";
import {updateSearchParam} from "@/components/utils/react/search-params";


export function useShowBsky() {
    const searchParams = useSearchParams()

    const showBsky = searchParams.get("todos") == "true"

    function setShowBsky(show: boolean) {
        if(show != showBsky) {
            updateSearchParam("todos", show ? "true" : null)
        }
    }

    return {showBsky, setShowBsky}
}