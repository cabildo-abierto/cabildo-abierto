import {useProfile} from "@/components/perfil/use-profile";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {
    $Typed,
    ArCabildoabiertoDataDataset,
    ArCabildoabiertoEmbedVisualization
} from "@cabildo-abierto/api";
import PlotWithButtons from "@/components/visualizations/editor/plot-with-buttons";


export const LinePlotByDate = ({data, title}: {
    data: {date: Date, value: number}[]
    title: string
}) => {
    const {data: profile, isLoading} = useProfile("cabildoabierto.ar")

    if (isLoading || !profile) return <LoadingSpinner/>

    const dataset: $Typed<ArCabildoabiertoDataDataset.DatasetView> = {
        $type: "ar.cabildoabierto.data.dataset#datasetView",
        data: JSON.stringify(data),
        columns: ["date", "value"].map(x => ({
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
                yAxis: "value",
                plot: {
                    $type: "ar.cabildoabierto.embed.visualization#lines"
                }
            }
        },
        dataset,
    }

    return <div className={"w-[600px]"}>
        <PlotWithButtons
            visualization={WAUVisualization}
        />
    </div>
}