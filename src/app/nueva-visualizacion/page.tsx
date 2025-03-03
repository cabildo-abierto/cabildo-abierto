import {VisualizationEditor} from "../../components/visualizations/editor/editor";
import {getUri} from "../../components/utils/utils";
import {VisualizationEditorForVisualization} from "../../components/visualizations/editor/visualization-editor-for-visualization";
import {PlotConfigProps} from "../lib/definitions";



const Page = async ({searchParams}: {
    searchParams?: {rkey: string, c: string, did: string}}) => {

    if(searchParams.rkey && searchParams.did && (!searchParams.c || searchParams.c == "ar.com.cabildoabierto.visualization")) {
        const uri = getUri(searchParams.did, "ar.com.cabildoabierto.visualization", searchParams.rkey)
        return <VisualizationEditorForVisualization
            uri={uri}
        />
    } else if(searchParams.rkey && searchParams.did && searchParams.c == "ar.com.cabildoabierto.dataset"){
        const uri = getUri(searchParams.did, searchParams.c, searchParams.rkey)

        const config: PlotConfigProps = {
            datasetUri: uri,
            kind: "Tipo de gráfico"
        }

        return <VisualizationEditor
            initialConfig={config}
        />
    }

    return <VisualizationEditor/>
};

export default Page