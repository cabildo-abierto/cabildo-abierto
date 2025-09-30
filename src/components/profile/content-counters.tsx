import {ArCabildoabiertoActorDefs} from "@/lex-api"


export const ContentCounters = ({profile}: { profile: ArCabildoabiertoActorDefs.ProfileViewDetailed }) => {
    return <div className={"text-sm flex space-x-2"}>
        <div>
            <span className={"font-semibold"}>
                {profile.postsCount}
            </span> <span className={"text-[var(--text-light)]"}>
                {profile.postsCount != 1 ? "publicaciones" : "publicación"}
            </span>
        </div>
        {profile.caProfile && <>
            <div>
                <span className={"font-semibold"}>
                    {profile.articlesCount}
                </span> <span className={"text-[var(--text-light)]"}>
                    {profile.articlesCount != 1 ? "artículos" : "artículo"}
                </span>
            </div>
            <div>
                <span className={"font-semibold"}>
                    {profile.editsCount}
                </span> <span className={"text-[var(--text-light)]"}>
                    {profile.editsCount != 1 ? "ediciones" : "edición"}
                </span>
            </div>
        </>}
    </div>
}