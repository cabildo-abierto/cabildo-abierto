import { Button } from "@/components/layout/utils/button"
import {topicUrl} from "@/utils/uri";
import {useTopicPageParams} from "@/components/topics/topic/topic-page";
import {useRouter} from "next/navigation";
import {FloppyDiskIcon} from "@phosphor-icons/react";
import {LexicalEditor} from "lexical";
import {useCallback, useState} from "react";
import {SaveEditPopup} from "@/components/topics/topic/save-edit-popup";
import {TopicProp, TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {ProcessedLexicalState} from "../../../../../modules/ca-lexical-editor/src/selection/processed-lexical-state";
import {editorStateToMarkdown} from "../../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {compress} from "@/utils/compression";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {contentQueriesFilter} from "@/queries/mutations/updates";
import { post } from "@/utils/fetch";
import {ArCabildoabiertoFeedArticle, ArCabildoabiertoWikiTopicVersion } from "@/lex-api";
import { EmbedContext } from "../../../../../modules/ca-lexical-editor/src/nodes/EmbedNode";


export type CreateTopicVersionProps = {
    id: string
    text?: string
    format?: string,
    props?: ArCabildoabiertoWikiTopicVersion.TopicProp[]
    message?: string,
    claimsAuthorship?: boolean
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    embedContexts?: EmbedContext[]
}


async function createTopicVersion(body: CreateTopicVersionProps) {
    return await post<CreateTopicVersionProps, {}>(`/topic-version`, body)
}



export const SaveEditButton = ({
    editor,
    props,
    topic,
}: {
    topic: TopicView
    editor: LexicalEditor
    props: TopicProp[]
}) => {
    const [savingChanges, setSavingChanges] = useState(false)
    const router = useRouter()
    const {did, rkey, topicId} = useTopicPageParams()
    const qc = useQueryClient()

    const saveEditMutation = useMutation({
        mutationFn: createTopicVersion,
        onMutate: () => {
            qc.cancelQueries(contentQueriesFilter(topic.uri))
        },
        onSettled: () => {
            qc.removeQueries(contentQueriesFilter(topic.uri))
        }
    })

    const onSave = useCallback(async (claimsAuthorship: boolean, editMsg: string): Promise<{ error?: string }> => {
        if (editor) {
            const editorState = new ProcessedLexicalState(editor.getEditorState().toJSON())
            const {
                markdown,
                embeds,
                embedContexts
            } = editorStateToMarkdown(editorState)

            const {error} = await saveEditMutation.mutateAsync({
                id: topic.id,
                text: compress(markdown),
                format: "markdown-compressed",
                claimsAuthorship,
                message: editMsg,
                props,
                embeds,
                embedContexts
            })
            if (error) return {error}
        } else {
            const {error} = await saveEditMutation.mutateAsync({
                id: topic.id,
                text: topic.text,
                format: topic.format,
                claimsAuthorship,
                message: editMsg,
                props,
                embeds: topic.embeds
            })
            if (error) return {error}
        }

        setSavingChanges(false)
        router.push(topicUrl(topic.id, undefined))
        qc.invalidateQueries({queryKey: ["session"]})
        return {}
    }, [props, editor, topic])

    return <div className={"fixed top-14 right-7 z-[1200] space-x-2"}>
        <Button
            variant={"outlined"}
            size={"small"}
            onClick={() => {router.push(topicUrl(topicId, {did, rkey}))}}
        >
            Cancelar
        </Button>
        <Button
            startIcon={<FloppyDiskIcon/>}
            variant={"outlined"}
            size={"small"}
            onClick={() => {setSavingChanges(true)}}
        >
            Guardar
        </Button>
        {savingChanges && <SaveEditPopup
            open={true}
            editor={editor}
            onClose={() => {setSavingChanges(false)}}
            onSave={onSave}
            topic={topic}
        />}
    </div>
}