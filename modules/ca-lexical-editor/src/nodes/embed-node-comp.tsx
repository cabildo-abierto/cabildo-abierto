import {PlotFromVisualizationMain} from "@/components/visualizations/plot";
import {Main as Visualization, isMain as isVisualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$getNodeByKey} from "lexical";
import {isView as isImageEmbedView} from "@/lex-api/types/app/bsky/embed/images"
import {$isEmbedNode, EmbedSpec} from "./EmbedNode";
import {PostEmbed} from "@/components/feed/embed/post-embed";

export const EmbedNodeComp = ({
                                          embed,
                                          nodeKey
                                      }: {
    embed: EmbedSpec
    nodeKey: string
}) => {
    const [editor] = useLexicalComposerContext()

    const editable = editor.isEditable()

    const onEdit = (v: Visualization) => {
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

    if(isVisualization(embed)){
        return <div className={"relative my-4 visualization"}>
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
    } else if(isImageEmbedView(embed)){
        return <PostEmbed
            embed={embed}
            mainPostRef={null}
            onArticle={true}
        />
    }
}