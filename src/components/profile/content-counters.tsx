import {Profile} from "@/lib/types";


export const ContentCounters = ({profile}: { profile: Profile }) => {
    return <div className={"text-sm flex space-x-2"}>
        <div>
            <span className={"font-semibold"}>
                {profile.bsky.postsCount}
            </span> <span>
                {profile.bsky.postsCount != 1 ? "publicaciones" : "publicación"}
            </span>
        </div>
        {profile.ca?.inCA && <div>
            <span className={"font-semibold"}>
                {profile.ca.articlesCount}
            </span> <span>
                {profile.ca.articlesCount != 1 ? "artículos" : "artículo"}
            </span>
        </div>}
        {profile.ca?.inCA && <div>
            <span className={"font-semibold"}>
                {profile.ca.editsCount}
            </span> <span>
                {profile.ca.editsCount != 1 ? "ediciones" : "edición"}
            </span>
        </div>}
    </div>
}