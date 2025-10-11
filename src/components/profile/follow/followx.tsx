import {useFollowx} from "@/queries/getters/useFollowx";
import {FollowKind} from "@/components/profile/follow/followx-page";
import LoadingSpinner from "../../layout/utils/loading-spinner";
import dynamic from "next/dynamic";
import {useProfile} from "@/queries/getters/useProfile";
import {FollowCount} from "@/components/profile/follow/follow-counter";

const UserSearchResult = dynamic(() => import("@/components/buscar/user-search-result"), {ssr: false});


export const Followx = ({handle, kind}: { handle: string, kind: FollowKind }) => {
    const {data, isLoading} = useFollowx(handle, kind)
    const {data: profile} = useProfile(handle)

    if (isLoading) return <div className={"py-4"}>
        <LoadingSpinner/>
    </div>

    const bskyCount = kind == "seguidores" ? profile.bskyFollowersCount : profile.bskyFollowsCount

    return <div>
        {profile && <div className={"w-full flex p-2 sm:text-base text-sm border-b space-x-1 text-[var(--text-light)] items-baseline"}>
            <div className={"flex space-x-1"}>
                <FollowCount count={kind == "seguidores" ? profile.followersCount : profile.followsCount} kind={kind}/>
                <div className={""}>
                    en Cabildo Abierto,
                </div>
            </div>
            <div className={"flex space-x-1"}>
                <FollowCount count={bskyCount} kind={kind}/>
                <div className={""}>
                    en Bluesky
                </div>
            </div>
        </div>}
        {data.map((user) => {
            return <div key={user.did}>
                <UserSearchResult user={user}/>
            </div>
        })}
        {bskyCount > 50 && <div className={"py-8 text-sm text-center text-[var(--text-light)] font-light"}>
            Se muestran hasta 50 resultados de Bluesky.
        </div>}
    </div>
}