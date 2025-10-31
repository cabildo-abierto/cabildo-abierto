import { BaseButton } from "@/components/layout/base/baseButton"
import {topicUrl} from "@/utils/uri";
import {useTopicPageParams} from "@/components/topics/topic/use-topic-page-params";
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
    setGuardEnabled
}: {
    topic: TopicView
    editor: LexicalEditor
    props: TopicProp[]
    setGuardEnabled: (v: boolean) => void
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
        setGuardEnabled(false)
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

    return <div className={"flex space-x-2 items-start"}>
        <BaseButton
            variant={"outlined"}
            size={"small"}
            onClick={() => {router.push(topicUrl(topicId, {did, rkey}))}}
        >
            Cancelar
        </BaseButton>
        <BaseButton
            startIcon={<FloppyDiskIcon/>}
            variant={"outlined"}
            size={"small"}
            onClick={() => {setSavingChanges(true)}}
        >
            Guardar
        </BaseButton>
        {savingChanges && <SaveEditPopup
            open={true}
            editor={editor}
            onClose={() => {setSavingChanges(false)}}
            onSave={onSave}
            topic={topic}
        />}
    </div>
}