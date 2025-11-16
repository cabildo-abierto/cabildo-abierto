import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api/dist"
import Link from "next/link"
import {profileUrl} from "@/components/utils/react/url";


export const ContentCounters = ({profile}: { profile: ArCabildoabiertoActorDefs.ProfileViewDetailed }) => {
    return <div className={"text-sm flex space-x-2"}>
        <Link href={profileUrl(profile.handle, "publicaciones")}>
            <span className={"font-semibold"}>
                {profile.postsCount}
            </span> <span className={"text-[var(--text-light)] hover:underline"}>
                {profile.postsCount != 1 ? "publicaciones" : "publicación"}
            </span>
        </Link>
        {profile.caProfile && <>
            <Link href={profileUrl(profile.handle, "articulos")}>
                <span className={"font-semibold"}>
                    {profile.articlesCount}
                </span> <span className={"text-[var(--text-light)] hover:underline"}>
                    {profile.articlesCount != 1 ? "artículos" : "artículo"}
                </span>
            </Link>
            <Link href={profileUrl(profile.handle, "ediciones")}>
                <span className={"font-semibold"}>
                    {profile.editsCount}
                </span> <span className={"text-[var(--text-light)] hover:underline"}>
                    {profile.editsCount != 1 ? "ediciones" : "edición"}
                </span>
            </Link>
        </>}
    </div>
}