"use client"
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {StatsDashboard, StatsDashboardUser} from "@cabildo-abierto/api";
import {useAPI} from "@/components/utils/react/queries";
import {StatSquare} from "@/components/utils/stat-square";
import {DateSince} from "@/components/utils/base/date";
import {LinePlotByDate} from "@/components/admin/line-plot-by-date";


function useStatsDashboard() {
    return useAPI<StatsDashboard>("/stats-dashboard", ["stats-dashboard"])
}


const Page = () => {
    const {data, isLoading} = useStatsDashboard()

    if (isLoading) {
        return <div>
            <LoadingSpinner/>
        </div>
    }

    const inf = 1000000000000
    function cmp(a: StatsDashboardUser, b: StatsDashboardUser) {
        return (b.lastReadSession ? new Date(b.lastReadSession).getTime() : inf) - (a.lastReadSession ? new Date(a.lastReadSession).getTime() : inf)
    }


    return <div className={"space-y-2 mt-8 px-6"}>
        <div className={"flex flex-wrap items-end gap-x-4 gap-y-4"}>
            {Object.entries(data.counts).map(([key, value]) => {
                return <div key={key}>
                    <StatSquare label={key} value={value.toString()}/>
                </div>
            })}
        </div>
        <div className={"flex flex-wrap items-end gap-x-4 gap-y-4"}>
            {Object.entries(data.stats).map(([key, value]) => {
                return <div key={key}>
                    <LinePlotByDate data={value.data} title={value.label}/>
                </div>
            })}
        </div>
        <div>
            {data.users.toSorted(cmp).map(u => {
                return <div key={u.did}>
                    {u.handle} <DateSince date={u.lastReadSession}/>
                </div>
            })}
        </div>
    </div>
}

export default Page