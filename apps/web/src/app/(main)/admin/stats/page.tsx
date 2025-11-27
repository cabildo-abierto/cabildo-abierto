"use client"
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {StatsDashboard} from "@cabildo-abierto/api";
import {listOrderDesc, sortByKey} from "@cabildo-abierto/utils";
import {DateSince} from "@/components/utils/base/date";
import dynamic from "next/dynamic";
import {useAPI} from "@/components/utils/react/queries";

const WAUPlot = dynamic(() => import("@/components/admin/wau-plot").then(mod => mod.WAUPlot), {ssr: false});


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


    return <div className={"space-y-2 mt-8 flex flex-wrap px-6"}>
        <div className={"flex flex-wrap items-end gap-x-4 gap-y-4"}>
            <div
                className={"flex-col text-8xl bg-[var(--background-dark)] border-4 border-[var(--text)] flex items-center justify-center text-center w-32 aspect-square"}>
                <div>
                    {data.counts.active}
                </div>
                <div className={"text-sm text-[var(--text-light)] text-center"}>
                    Activos
                </div>
            </div>
            <div
                className={"flex-col text-4xl bg-[var(--background-dark)] border-4 border-[var(--text)] flex items-center justify-center text-center w-24 h-24 aspect-square"}>
                <div>
                    {data.counts.registered}
                </div>
                <div className={"text-sm text-[var(--text-light)] text-center"}>
                    Registrados
                </div>
            </div>
            <div
                className={"flex-col text-4xl bg-[var(--background-dark)] border-4 border-[var(--text)] flex items-center justify-center text-center w-24 h-24 aspect-square"}>
                <div>
                    {data.counts.verifiedActive}
                </div>
                <div className={"text-sm text-[var(--text-light)] text-center"}>
                    Verificados activos
                </div>
            </div>
            <div
                className={"flex-col text-4xl bg-[var(--background-dark)] border-4 border-[var(--text)] flex items-center justify-center text-center w-24 h-24 aspect-square"}>
                <div>
                    {data.counts.verified}
                </div>
                <div className={"text-sm text-[var(--text-light)] text-center"}>
                    Verificados
                </div>
            </div>
        </div>

        <div className={"flex flex-wrap gap-4"}>
            <WAUPlot data={data.WAUPlot} title={"WAU"}/>

            <WAUPlot data={data.usersPlot} title={"Registrados acumulados"}/>

            <WAUPlot data={data.articlesPlot} title={"Artículos"}/>

            <WAUPlot data={data.caCommentsPlot} title={"Comentarios"}/>

            <WAUPlot data={data.topicVersionsPlot} title={"Ediciones de temas"}/>
        </div>

        <div className={"font-mono pb-32"}>
            {sortByKey(data.lastUsers, u => [new Date(u.CAProfileCreatedAt).getTime()], listOrderDesc).map(u => {
                return <div key={u.did}>
                    @{u.handle} {u.displayName} <DateSince date={u.lastReadSession}/>
                </div>
            })}
        </div>
    </div>
}

export default Page