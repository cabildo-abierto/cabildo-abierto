"use client"
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {StatsDashboard, StatsDashboardUser} from "@cabildo-abierto/api";
import {useAPI} from "@/components/utils/react/queries";
import {StatSquare} from "@/components/utils/stat-square";
import {DateSince} from "@/components/utils/base/date";
import {LinePlotByDate} from "@/components/admin/line-plot-by-date";
import {useState} from "react";
import {BaseSelect} from "@/components/utils/base/base-select";


function useStatsDashboard() {
    return useAPI<StatsDashboard>("/stats-dashboard", ["stats-dashboard"])
}


const Page = () => {
    const {data, isLoading} = useStatsDashboard()
    const [sortBy, setSortBy] = useState<string>("registro")

    if (isLoading) {
        return <div>
            <LoadingSpinner/>
        </div>
    }

    const inf = 1000000000000

    function cmp(a: StatsDashboardUser, b: StatsDashboardUser) {
        if(sortBy == "actividad") {
            return (b.lastReadSession ? new Date(b.lastReadSession).getTime() : inf) - (a.lastReadSession ? new Date(a.lastReadSession).getTime() : inf)
        } else {
            return (b.ca_created_at ? new Date(b.ca_created_at).getTime() : inf) - (a.ca_created_at ? new Date(a.ca_created_at).getTime() : inf)
        }
    }


    return <div className={"space-y-2 mt-8 px-6 pb-8"}>
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
        <div className={"flex w-32"}>
            <BaseSelect
                options={["registro", "actividad"]}
                onChange={setSortBy}
                value={sortBy}
            />
        </div>
        <div className="mt-6 rounded-lg border border-neutral-200 overflow-hidden">

            <div className="grid grid-cols-[1fr_4fr_2fr_2fr] gap-4 px-4 py-2 text-xs font-medium bg-[var(--background-dark2)] text-[var(--text-light)]">
                <div>idx</div>
                <div>Usuario</div>
                <div>Última actividad</div>
                <div>Registro</div>
            </div>

            <div className="divide-y">
                {data.users.toSorted(cmp).map((u, idx) => {
                    return (
                        <div
                            key={u.did}
                            className="grid grid-cols-[1fr_4fr_2fr_2fr] gap-4 px-4 py-3 text-sm hover:bg-[var(--background-dark)] transition-colors"
                        >
                            <div>
                                {idx}
                            </div>
                            <div className="font-mono">
                                @{u.handle}
                            </div>

                            <div className="">
                                {u.lastReadSession ? (
                                    <DateSince date={u.lastReadSession} />
                                ) : (
                                    <span className="italic text-[var(--text-light)]">Nunca</span>
                                )}
                            </div>

                            <div className="">
                                {u.ca_created_at ? (
                                    <DateSince date={u.ca_created_at} />
                                ) : (
                                    <span className="text-[var(--text-light)]">—</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    </div>
}

export default Page