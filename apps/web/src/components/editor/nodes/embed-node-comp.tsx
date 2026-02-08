import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$getNodeByKey} from "lexical";
import {$Typed, AppBskyEmbedImages} from "@atproto/api"
import {ArCabildoabiertoEmbedPoll, ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api"
import {$isEmbedNode, EmbedSpec} from "./EmbedNode";
import {PostEmbed} from "@/components/feed/embed/post-embed";
import dynamic from "next/dynamic";
import {Poll} from "@/components/writing/poll/poll";
import {PollFromMain} from "@/components/writing/poll/poll-from-main";
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

    const onDelete = editable ? () => {
        editor.update(() => {
            const n = $getNodeByKey(nodeKey)
            n.remove()
        })
    } : null

    const onEdit = (v: $Typed<ArCabildoabiertoEmbedVisualization.Main> | $Typed<ArCabildoabiertoEmbedPoll.View>) => {
        editor.update(() => {
            const n = $getNodeByKey(nodeKey)
            if($isEmbedNode(n)){
                n.setSpec(v)
            }
        })
    }

    if(ArCabildoabiertoEmbedVisualization.isMain(embed)){
        return <div className={"relative mt-4 mb-8 visualization"}>
            <PlotFromVisualizationMain
                visualization={embed}
                onEdit={editable ? onEdit : undefined}
                onDelete={onDelete}
            />
        </div>
    } else if(AppBskyEmbedImages.isView(embed)){
        return <PostEmbed
            embed={embed}
            mainPostRef={null}
            onArticle={true}
        />
    } else if(ArCabildoabiertoEmbedPoll.isView(embed)) {
        return <Poll
            poll={embed}
            onDelete={onDelete}
            onEdit={editable ? onEdit : undefined}
            activeEditor={editor}
        />
    } else if(ArCabildoabiertoEmbedPoll.isMain(embed)) {
        return <PollFromMain
            poll={embed}
            activeEditor={editor}
        />
    }
}