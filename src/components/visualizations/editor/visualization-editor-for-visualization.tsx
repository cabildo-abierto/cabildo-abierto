"use client"
import {useVisualization} from "../../../hooks/contents";
import {LoadingScreen} from "../../ui-utils/loading-screen";
import {VisualizationEditor} from "./editor";
import {PlotConfigProps} from "../../../app/lib/definitions";


function getConfigFromSpec(spec: string): PlotConfigProps {
    const json = JSON.parse(spec)

    if(json.metadata && json.metadata.editorConfig){
        return json.metadata.editorConfig
    }
    return null
}


export const VisualizationEditorForVisualization = ({uri}: {uri: string}) => {
    const {visualization} = useVisualization(uri)

    if(!visualization){
        return <LoadingScreen/>
    }

    const config = getConfigFromSpec(visualization.visualization.spec)

    return <VisualizationEditor
        initialConfig={config}
        msg={!config ? "La visualización que estás intentando editar no parece haber sido creada en este editor." : undefined}
    />
}