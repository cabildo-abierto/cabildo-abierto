import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {useStatsDashboard} from "@/queries/getters/admin";
import Plot from "@/components/visualizations/plot";
import {$Typed} from "@/lex-api/util";
import {listOrderDesc, sortByKey} from "@/utils/arrays";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {useProfile} from "@/queries/getters/useProfile";
import {ArCabildoabiertoActorDefs, ArCabildoabiertoDataDataset, ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"


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


const WAUPlot = ({data, title}: {
    data: StatsDashboard["WAUPlot"]
    title: string
}) => {
    const {data: profile, isLoading} = useProfile("cabildoabierto.ar")

    if(isLoading || !profile) return <LoadingSpinner />

    const dataset: $Typed<ArCabildoabiertoDataDataset.DatasetView> = {
        $type: "ar.cabildoabierto.data.dataset#datasetView",
        data: JSON.stringify(data),
        columns: ["date", "count"].map(x => ({
            $type: "ar.cabildoabierto.data.dataset#column",
            name: x
        })),
        createdAt: new Date().toISOString(),
        uri: "",
        cid: "",
        name: "data",
        author: {
            ...profile,
            $type: "ar.cabildoabierto.actor.defs#profileViewBasic"
        }
    }

    const WAUVisualization: ArCabildoabiertoEmbedVisualization.View = {
        $type: "ar.cabildoabierto.embed.visualization#view",
        visualization: {
            $type: "ar.cabildoabierto.embed.visualization",
            dataSource: {
                $type: "ar.cabildoabierto.embed.visualization#datasetDataSource",
                dataset: ""
            },
            title,
            spec: {
                $type: "ar.cabildoabierto.embed.visualization#twoAxisPlot",
                xAxis: "date",
                yAxis: "count",
                plot: {
                    $type: "ar.cabildoabierto.embed.visualization#lines"
                }
            }
        },
        dataset,
    }

    return <div>
        <Plot visualization={WAUVisualization}/>
    </div>
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