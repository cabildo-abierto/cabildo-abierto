"use client"
import {VisualizationEditor} from "../../components/visualizations/editor/editor";
import {getUri} from "../../components/utils";
import {VisualizationEditorForVisualization} from "../../components/visualizations/editor/visualization-editor-for-visualization";
import {PlotConfigProps} from "../lib/definitions";



const Page = ({searchParams}: {
    searchParams?: {rkey: string, c: string, did: string}}) => {
    console.log("searchParams", searchParams)
    if(searchParams.rkey && searchParams.did && (!searchParams.c || searchParams.c == "ar.com.cabildoabierto.visualization")) {
        const uri = getUri(searchParams.did, "ar.com.cabildoabierto.visualization", searchParams.rkey)
        console.log("returning visualization editor for visualization with uri", uri)
        return <VisualizationEditorForVisualization
            uri={uri}
        />
    } else if(searchParams.rkey && searchParams.did && searchParams.c == "ar.com.cabildoabierto.dataset"){
        const uri = getUri(searchParams.did, searchParams.c, searchParams.rkey)
        console.log("returning visualization editor for dataset with uri", uri)

        const config: PlotConfigProps = {
            datasetUri: uri,
            kind: "Tipo de gráfico"
        }

        return <VisualizationEditor
            initialConfig={config}
        />
    }

    console.log("returning visualization editor")
    return <VisualizationEditor/>
};

export default Page