import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {useProfile, useStatsDashboard} from "@/queries/api";
import {ProfileViewBasic as ProfileViewBasicCA} from "@/lex-api/types/ar/cabildoabierto/actor/defs"
import {DatasetTableView, RawDatasetView} from "@/components/datasets/dataset-table-view";
import {Plot} from "@/components/visualizations/plot";
import {View as VisualizationView} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {DatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {$Typed} from "@atproto/api";


export type StatsDashboard = {
    lastUsers: (ProfileViewBasicCA & { lastReadSession: Date | null })[]
    counts: {
        registered: number
        active: number
        verified: number
        verifiedActive: number
    }
    WAUPlot: { date: Date, count: number }[]
    WAUPlotVerified: { date: Date, count: number }[]
    articlesPlot: {date: Date, count: number}[]
    topicVersionsPlot: {date: Date, count: number}[]
    caCommentsPlot: {date: Date, count: number}[]
}


function recordListToRawDataset(rows: Record<string, any>[]): RawDatasetView {
    if (rows.length === 0) return {data: "[]", columns: []}

    const firstRow = rows[0]

    const columnKeys = Object.keys(firstRow).filter(
        key => {
            const val = firstRow[key]
            return typeof val !== "object" || val === null
        }
    )

    const filteredRows = rows.map(row =>
        Object.fromEntries(
            columnKeys.map(key => [key, row[key]])
        )
    )

    return {
        data: JSON.stringify(filteredRows),
        columns: columnKeys.map(k => ({
            $type: "ar.cabildoabierto.data.dataset#column",
            name: k
        }))
    }
}


const WAUPlot = ({data, title}: {
    data: StatsDashboard["WAUPlot"]
    title: string
}) => {
    const {data: profile, isLoading} = useProfile("cabildoabierto.ar")

    if(isLoading || !profile) return <LoadingSpinner />

    const dataset: $Typed<DatasetView> = {
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
        author: {...profile.bsky, $type: "ar.cabildoabierto.actor.defs#profileViewBasic"}
    }

    const WAUVisualization: VisualizationView = {
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
            <div className={"flex-col text-8xl bg-[var(--background-dark)] border-4 border-[var(--text)] rounded-lg flex items-center justify-center text-center w-32 aspect-square"}>
                <div>
                    {data.counts.active}
                </div>
                <div className={"text-sm text-[var(--text-light)] text-center"}>
                    Activos
                </div>
            </div>
            <div className={"flex-col text-4xl bg-[var(--background-dark)] border-4 border-[var(--text)] rounded-lg flex items-center justify-center text-center w-24 h-24 aspect-square"}>
                <div>
                    {data.counts.registered}
                </div>
                <div className={"text-sm text-[var(--text-light)] text-center"}>
                    Registrados
                </div>
            </div>
            <div className={"flex-col text-4xl bg-[var(--background-dark)] border-4 border-[var(--text)] rounded-lg flex items-center justify-center text-center w-24 h-24 aspect-square"}>
                <div>
                    {data.counts.verifiedActive}
                </div>
                <div className={"text-sm text-[var(--text-light)] text-center"}>
                    Verificados activos
                </div>
            </div>
            <div className={"flex-col text-4xl bg-[var(--background-dark)] border-4 border-[var(--text)] rounded-lg flex items-center justify-center text-center w-24 h-24 aspect-square"}>
                <div>
                    {data.counts.verified}
                </div>
                <div className={"text-sm text-[var(--text-light)] text-center"}>
                    Verificados
                </div>
            </div>
        </div>

        <WAUPlot data={data.WAUPlot} title={"WAU"}/>

        <WAUPlot data={data.articlesPlot} title={"Artículos"}/>

        <WAUPlot data={data.caCommentsPlot} title={"Comentarios"}/>

        <WAUPlot data={data.topicVersionsPlot} title={"Ediciones de temas"}/>

        <DatasetTableView sort={false} dataset={recordListToRawDataset(data.lastUsers.map(u => ({
            handle: u.handle,
            createdAt: u.createdAt,
            lastReadSession: u.lastReadSession,
            verification: u.verification,
        })))}/>
    </div>
}