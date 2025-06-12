import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {useStatsDashboard} from "@/queries/api";
import {ProfileViewBasic as ProfileViewBasicCA} from "@/lex-api/types/ar/cabildoabierto/actor/defs"
import {DateSince} from "../../../modules/ui-utils/src/date";


export type StatsDashboard = {
    lastUsers: ProfileViewBasicCA[]
}


export const AdminStats = () => {
    const {data, isLoading} = useStatsDashboard()

    if(isLoading) {
        return <div>
            <LoadingSpinner/>
        </div>
    }

    return <div className={"font-mono space-y-2 mt-8"}>
        {data.lastUsers.map(u => {
            return <div key={u.did}>
                @{u.handle} hace <DateSince date={u.createdAt ?? new Date()}/>
            </div>
        })}
    </div>
}