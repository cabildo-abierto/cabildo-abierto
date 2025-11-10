import {useFollowx} from "@/queries/getters/useFollowx";
import {FollowKind} from "@/components/profile/follow/followx-page";
import LoadingSpinner from "../../layout/base/loading-spinner";
import dynamic from "next/dynamic";
import {useProfile} from "@/queries/getters/useProfile";
import {FollowCount} from "@/components/profile/follow/follow-counter";

const UserSearchResult = dynamic(() => import("@/components/buscar/user-search-result"), {ssr: false});


export const Followx = ({handle, kind}: { handle: string, kind: FollowKind }) => {
    const {data, isLoading} = useFollowx(handle, kind)
    const {data: profile, isLoading: loadingProfile} = useProfile(handle)

    if (isLoading || loadingProfile) return <div className={"py-4"}>
        <LoadingSpinner/>
    </div>

    if(!profile || !data) return <div className={"py-4"}>
        Ocurrió un error al cargar los datos.
    </div>

    const caCount = kind == "seguidores" ? profile.followersCount : profile.followsCount

    const bskyCount = kind == "seguidores" ? profile.bskyFollowersCount : profile.bskyFollowsCount

    return <div>
        {profile && <div className={"w-full p-2 sm:text-base text-sm border-b text-[var(--text-light)]"}>
            {caCount != null && <><FollowCount count={caCount} kind={kind}/> <span>
                en Cabildo Abierto,
            </span> </>}<FollowCount count={bskyCount} kind={kind}/> <span>
                en Bluesky
            </span>.
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