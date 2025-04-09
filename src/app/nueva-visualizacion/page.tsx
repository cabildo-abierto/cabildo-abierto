import {VisualizationEditor} from "../../components/visualizations/editor/editor";
import {VisualizationEditorForVisualization} from "../../components/visualizations/editor/visualization-editor-for-visualization";
import {PlotConfigProps} from "@/lib/definitions";
import {getUri} from "../../utils/uri";



const Page = async ({searchParams}: {
    searchParams: Promise<{rkey: string, c: string, did: string}>}) => {

    const {rkey, did, c} = await searchParams

    if(rkey && did && (!c || c == "ar.com.cabildoabierto.visualization")) {
        const uri = getUri(did, "ar.com.cabildoabierto.visualization", rkey)
        return <VisualizationEditorForVisualization
            uri={uri}
        />
    } else if(rkey && did && c == "ar.com.cabildoabierto.dataset"){
        const uri = getUri(did, c, rkey)

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