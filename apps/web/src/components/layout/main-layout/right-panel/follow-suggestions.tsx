import {useFollowSuggestions} from "@/queries/getters/suggestions";
import {CustomLink as Link} from "@/components/utils/base/custom-link";
import dynamic from "next/dynamic";

const FollowSuggestionSmallView = dynamic(() => import("@/components/layout/main-layout/right-panel/follow-suggestion-small-view").then(mod => mod.FollowSuggestionSmallView), {ssr: false})


export const followSuggestionsInfo = "Se priorizan usuarios seguidos por personas que seguís, usuarios activos, autores de artículos y usuarios de Cabildo Abierto."


const LoadingFollowSuggestion = () => {
    return <div
        className={"flex space-x-2 justify-between p-2 items-center"}
    >
        <div className={"flex space-x-2 items-center"}>
            <div>
                <div className={"bg-[var(--background-dark2)] rounded-full w-8 h-8"}/>
            </div>
            <div className={"max-w-[150px] text-ellipsis space-y-1"}>
                <div className={"text-sm bg-[var(--background-dark2)] w-28 h-3 rounded"}/>
                <div className={"text-xs bg-[var(--background-dark2)] w-20 h-3 rounded"}/>
            </div>
        </div>
        <div className={"h-5 w-14 bg-[var(--background-dark2)] rounded-lg"}/>
    </div>
}


export default function FollowSuggestions() {
    let {data, isLoading} = useFollowSuggestions(3)

    if (data && (!data.profiles || data.profiles.length == 0)) return null

    return <div className={"right-panel-panel w-full h-full"}>
        <div className={"flex px-3 py-2 items-center text-xs font-bold uppercase"}>
            Cuentas sugeridas
        </div>
        <div className={"space-y-1"}>
            {isLoading && !data && <div>
                <LoadingFollowSuggestion/>
                <LoadingFollowSuggestion/>
                <LoadingFollowSuggestion/>
            </div>}
            {data && data.profiles.map(u => {
                return <FollowSuggestionSmallView
                    user={u}
                    key={u.did}
                />
            })}
        </div>
        <Link
            href={"/perfil/cuentas-sugeridas"}
            className={"uppercase flex hover:bg-[var(--background-dark)] text-xs w-full px-3 py-2 font-semibold"}
        >
            Ver más
        </Link>
    </div>
}