import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {useStatsDashboard} from "@/queries/getters/admin";
import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api";
import {listOrderDesc, sortByKey} from "@cabildo-abierto/utils";
import {DateSince} from "@/components/utils/base/date";
import dynamic from "next/dynamic";

const WAUPlot = dynamic(() => import("./wau-plot").then(mod => mod.WAUPlot), {ssr: false});

export type StatsDashboard = {
    lastUsers: (ArCabildoabiertoActorDefs.ProfileViewBasic & { lastReadSession: Date | null, CAProfileCreatedAt?: Date })[]
    counts: {
        registered: number
        active: number
        verified: number
        verifiedActive: number
    }
    WAUPlot: { date: Date, count: number }[]
    usersPlot: { date: Date, count: number }[]
    WAUPlotVerified: { date: Date, count: number }[]
    articlesPlot: {date: Date, count: number}[]
    topicVersionsPlot: {date: Date, count: number}[]
    caCommentsPlot: {date: Date, count: number}[]
}



export const AdminStats = () => {
    const {data, isLoading} = useStatsDashboard()

    if(isLoading) {
        return <div>
            <LoadingSpinner/>
        </div>
    }


    return <div className={"space-y-2 mt-8"}>
        <div className={"flex flex-wrap items-end gap-x-4 gap-y-4"}>
            <div className={"flex-col text-8xl bg-[var(--background-dark)] border-4 border-[var(--text)] flex items-center justify-center text-center w-32 aspect-square"}>
                <div>
                    {data.counts.active}
                </div>
                <div className={"text-sm text-[var(--text-light)] text-center"}>
                    Activos
                </div>
            </div>
            <div className={"flex-col text-4xl bg-[var(--background-dark)] border-4 border-[var(--text)] flex items-center justify-center text-center w-24 h-24 aspect-square"}>
                <div>
                    {data.counts.registered}
                </div>
                <div className={"text-sm text-[var(--text-light)] text-center"}>
                    Registrados
                </div>
            </div>
            <div className={"flex-col text-4xl bg-[var(--background-dark)] border-4 border-[var(--text)] flex items-center justify-center text-center w-24 h-24 aspect-square"}>
                <div>
                    {data.counts.verifiedActive}
                </div>
                <div className={"text-sm text-[var(--text-light)] text-center"}>
                    Verificados activos
                </div>
            </div>
            <div className={"flex-col text-4xl bg-[var(--background-dark)] border-4 border-[var(--text)] flex items-center justify-center text-center w-24 h-24 aspect-square"}>
                <div>
                    {data.counts.verified}
                </div>
                <div className={"text-sm text-[var(--text-light)] text-center"}>
                    Verificados
                </div>
            </div>
        </div>

        <WAUPlot data={data.WAUPlot} title={"WAU"}/>

        <WAUPlot data={data.usersPlot} title={"Registrados acumulados"}/>

        <WAUPlot data={data.articlesPlot} title={"Artículos"}/>

        <WAUPlot data={data.caCommentsPlot} title={"Comentarios"}/>

        <WAUPlot data={data.topicVersionsPlot} title={"Ediciones de temas"}/>

        <div className={"font-mono pb-32"}>
            {sortByKey(data.lastUsers, u => [new Date(u.CAProfileCreatedAt).getTime()], listOrderDesc).map(u => {
                return <div key={u.did}>
                    @{u.handle} {u.displayName} <DateSince date={u.lastReadSession}/>
                </div>
            })}
        </div>
    </div>
}