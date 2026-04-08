import {useSession} from "@/components/auth/use-session";
import {stringToEnum} from "@cabildo-abierto/utils";
import {useSearchParams} from "next/navigation";
import {topicsPageSortOptions} from "@cabildo-abierto/api";


export function useTopicsPageParams() {
    const {user} = useSession()
    const searchParams = useSearchParams()
    const categories = searchParams.getAll("c")
    const sortedBy = stringToEnum(
        searchParams.get("s"),
        topicsPageSortOptions,
        user?.algorithmConfig?.tt?.time ?? "Última semana")
    const multipleEnabled = searchParams.get("m") == "true"

    return {categories, sortedBy, multipleEnabled}
}