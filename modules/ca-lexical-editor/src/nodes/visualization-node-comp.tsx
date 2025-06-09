import {PlotFromVisualizationMain} from "@/components/visualizations/plot";
import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$getNodeByKey} from "lexical";
import {$isVisualizationNode} from "./VisualizationNode";


export const VisualizationNodeComp = ({
                                          visualization,
                                          nodeKey
                                      }: {
    visualization: Visualization
    nodeKey: string
}) => {
    const [editor] = useLexicalComposerContext()

    const editable = editor.isEditable()

    const onEdit = (v: Visualization) => {
        editor.update(() => {
            const n = $getNodeByKey(nodeKey)
            if($isVisualizationNode(n)){
                n.setVisualization(v)
            }
        })
    }

    return <div className={"relative my-4 visualization"}>
        <PlotFromVisualizationMain
            visualization={visualization}
            onEdit={editable ? onEdit : undefined}
            onDelete={() => {
                editor.update(() => {
                    const n = $getNodeByKey(nodeKey)
                    n.remove()
                })
            }}
        />
    </div>
}