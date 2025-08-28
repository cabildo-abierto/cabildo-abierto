import {useFollowSuggestions} from "@/queries/suggestions";
import {ProfilePic} from "@/components/profile/profile-pic";
import InfoPanel from "../../../modules/ui-utils/src/info-panel";
import {CustomLink, CustomLink as Link} from "../../../modules/ui-utils/src/custom-link";
import {FollowButton} from "@/components/profile/profile-utils";
import {profileUrl, topicUrl} from "@/utils/uri";


export const followSuggestionsInfo = "Te sugerimos cuentas para seguir. Se priorizan usuarios seguidos por personas que seguís, usuarios activos, autores de artículos y usuarios de Cabildo Abierto."


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

    if (data && data.length == 0) return null

    return <div className={"bg-[var(--background-ldark2)] w-full rounded-lg h-full"}>
        <div className={"flex justify-between px-3 py-1 items-center bg"}>
            <div className={"text-xs font-semibold"}>
                Cuentas sugeridas
            </div>
            <div>
                <InfoPanel
                    text={followSuggestionsInfo}
                    moreInfoHref={topicUrl("Cabildo Abierto: Cuentas para seguir", undefined, "normal")}
                />
            </div>
        </div>
        <div className={"space-y-1 bg-[var(--background-dark)]"}>
            {isLoading && !data && <div>
                <LoadingFollowSuggestion/>
                <LoadingFollowSuggestion/>
                <LoadingFollowSuggestion/>
            </div>}
            {data && data.map(u => {
                return <CustomLink
                    href={profileUrl(u.handle)}
                    key={u.did}
                    className={"hover:bg-[var(--background-dark2)] flex space-x-2 justify-between p-2 items-center"}
                >
                    <div className={"flex space-x-2 items-center w-full"}>
                        <div>
                            <ProfilePic user={u} className={"rounded-full w-8 h-8"}/>
                        </div>
                        <div className={"space-y-[-2px] text-ellipsis"}>
                            <div className={"text-sm font-semibold truncate w-32"}>
                                {u.displayName}
                            </div>
                            <div className={"text-xs text-[var(--text-light)] truncate w-32"}>
                                @{u.handle}
                            </div>
                        </div>
                    </div>
                    <FollowButton dense={true} handle={u.handle} profile={u}/>
                </CustomLink>
            })}
        </div>
        <Link
            href={"/perfil/cuentas-sugeridas"}
            className={"flex hover:bg-[var(--background-dark2)] text-xs w-full px-3 py-2 rounded-b-lg font-semibold"}
        >
            Ver más
        </Link>
    </div>
}