import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$getNodeByKey} from "lexical";
import {AppBskyEmbedImages} from "@atproto/api"
import {$isEmbedNode, EmbedSpec} from "./EmbedNode";
import {PostEmbed} from "@/components/feed/embed/post-embed";
import dynamic from "next/dynamic";
const PlotFromVisualizationMain = dynamic(
    () => import("@/components/visualizations/editor/plot-from-visualization-main"), {
    ssr: false
})



export const EmbedNodeComp = ({
                                          embed,
                                          nodeKey
                                      }: {
    embed: EmbedSpec
    nodeKey: string
}) => {
    const [editor] = useLexicalComposerContext()

    const editable = editor.isEditable()

    const onEdit = (v: ArCabildoabiertoEmbedVisualization.Main) => {
        editor.update(() => {
            const n = $getNodeByKey(nodeKey)
            if($isEmbedNode(n)){
                n.setSpec({
                    ...v,
                    $type: "ar.cabildoabierto.embed.visualization",
                })
            }
        })
    }

    if(ArCabildoabiertoEmbedVisualization.isMain(embed)){
        return <div className={"relative mt-4 mb-8 visualization"}>
            <PlotFromVisualizationMain
                visualization={embed}
                onEdit={editable ? onEdit : undefined}
                onDelete={editable ? () => {
                    editor.update(() => {
                        const n = $getNodeByKey(nodeKey)
                        n.remove()
                    })
                } : null}
            />
        </div>
    } else if(AppBskyEmbedImages.isView(embed)){
        return <PostEmbed
            embed={embed}
            mainPostRef={null}
            onArticle={true}
        />
    }
}