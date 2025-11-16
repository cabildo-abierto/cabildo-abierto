import {useSession} from "@/components/auth/use-session";
import {stringToEnum} from "@cabildo-abierto/utils/dist/strings";
import {enDiscusionTimeOptions} from "./defaults";
import {useSearchParams} from "next/navigation";


export function useTopicsPageParams() {
    const {user} = useSession()
    const searchParams = useSearchParams()
    const categories = searchParams.getAll("c")
    const sortedBy = stringToEnum(
        searchParams.get("s"),
        [...enDiscusionTimeOptions, "Ediciones recientes"],
        user?.algorithmConfig?.tt?.time ?? "Última semana")
    const multipleEnabled = searchParams.get("m") == "true"

    return {categories, sortedBy, multipleEnabled}
}