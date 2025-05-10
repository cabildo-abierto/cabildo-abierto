import React, {useEffect, useState} from "react";
import StateButton from "../../../../modules/ui-utils/src/state-button";
import {ExtraChars} from "./extra-chars";
import {
    getCollectionFromUri,
    isArticle,
    isDataset,
    isPost,
    isTopicVersion,
    isVisualization
} from "@/utils/uri";
import {RectTracker} from "../../../../modules/ui-utils/src/rect-tracker";
import {ProfilePic} from "../../profile/profile-pic";
import {VisualizationNodeComp} from "../../../../modules/ca-lexical-editor/src/nodes/visualization-node-comp";
import {PostImagesEditor} from "./post-images-editor";
import {AddImageButton} from "./add-image-button";
import {AddVisualizationButton} from "./add-visualization-button";
import {InsertVisualizationModal} from "./insert-visualization-modal";
import {InsertImageModal} from "./insert-image-modal";
import {ATProtoStrongRef, FastPostReplyProps} from "@/lib/types";
import {useSession} from "@/hooks/api";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {isPostView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {Record as PostRecord} from "@/lex-api/types/app/bsky/feed/post"
import {get, post} from "@/utils/fetch";
import {WritePanelReplyPreview} from "@/components/writing/write-panel/write-panel-reply-preview";
import {View as ExternalEmbedView} from "@/lex-api/types/app/bsky/embed/external"
import {ExternalEmbedInEditor} from "@/components/writing/write-panel/external-embed-in-editor";
import {
    WritePanelQuotedPost
} from "@/components/writing/write-panel/write-panel-quoted-post";
import {$Typed} from "@atproto/api";
import {AddToEnDiscusionButton} from "@/components/writing/article/publish-article-button";
import {useTopicsMentioned} from "@/components/writing/article/article-editor";
import {EditorState} from "lexical";
import {getPlainText} from "@/components/topics/topic/diff";
import {SettingsProps} from "../../../../modules/ca-lexical-editor/src/lexical-editor";
import {getEditorSettings} from "@/components/editor/settings";
import dynamic from "next/dynamic";
import {$dfs} from "@lexical/utils";
import {$isLinkNode} from "@lexical/link";
import {areSetsEqual} from "@/utils/arrays";
import {TopicsMentionedSmall} from "@/components/article/topics-mentioned";
const MyLexicalEditor = dynamic(() => import('../../../../modules/ca-lexical-editor/src/lexical-editor'), {
    ssr: false,
    loading: () => <></>,
})


function useExternalEmbed(editorState: EditorState, disabled: boolean) {
    const [externalEmbedView, setExternalEmbedView] = useState<$Typed<ExternalEmbedView> | null>(null)
    const [externalEmbedUrl, setExternalEmbedUrl] = useState<string | null>(null)
    const [links, setLinks] = useState<string[]>([])

    useEffect(() => {
        if (!externalEmbedUrl) {
            setExternalEmbedView(null)
            return
        }

        const handler = setTimeout(() => {
            async function onNewExternalEmbed(url: string) {
                const {data, error} = await get<{
                    title: string | null,
                    description: string | null,
                    thumb: string | null
                }>("/metadata?url=" + encodeURIComponent(url))

                if (error) {
                    setExternalEmbedView(null)
                    return
                }

                const {title, description, thumb} = data
                const embed: $Typed<ExternalEmbedView> = {
                    $type: "app.bsky.embed.external#view",
                    external: {
                        $type: 'app.bsky.embed.external#viewExternal',
                        uri: url,
                        title,
                        description,
                        thumb
                    }
                }
                setExternalEmbedView(embed)
            }

            if (!disabled) {
                onNewExternalEmbed(externalEmbedUrl)
            }
        }, 200)

        return () => clearTimeout(handler) // Clean up on dependency change
    }, [externalEmbedUrl])


    useEffect(() => {
        if(editorState){
            const newLinks = getLinksFromEditor(editorState)
            for(let i = 0; i < newLinks.length; i++){
                const l = newLinks[i]
                if(!links.includes(l)){
                    setExternalEmbedUrl(l)
                    break
                }
            }
            if(!areSetsEqual(new Set(newLinks), new Set(links))){
                setLinks(newLinks)
            }
        }
    }, [editorState, links, setExternalEmbedUrl])

    const onRemove = () => {
        setExternalEmbedUrl(null)
        setExternalEmbedView(null)
    }

    return {externalEmbedView, setExternalEmbedView, externalEmbedUrl, setExternalEmbedUrl, onRemove}
}


function replyFromParentElement(replyTo: ReplyToContent): FastPostReplyProps {
    if (isPostView(replyTo)) {
        const parent = {
            uri: replyTo.uri,
            cid: replyTo.cid
        }
        if ((replyTo.record as PostRecord).reply) {
            return {
                parent,
                root: (replyTo.record as PostRecord).reply.root
            }
        } else {
            return {
                parent,
                root: {...parent}
            }
        }
    } else {
        const parent = {
            uri: replyTo.uri,
            cid: replyTo.cid
        }
        return {
            parent,
            root: parent
        }
    }
}


export type ImagePayload = { src: string, $type: "url" } | { $type: "file", base64: string, src: string }
export type ImagePayloadForPostCreation = { src: string, $type: "url" } | { $type: "file", base64: string }

export type CreatePostProps = {
    text: string
    reply?: FastPostReplyProps
    selection?: [number, number]
    images?: ImagePayloadForPostCreation[]
    enDiscusion?: boolean
    externalEmbedView?: $Typed<ExternalEmbedView>
    quotedPost?: ATProtoStrongRef
}


async function createPost(body: CreatePostProps) {
    return post("/post", body)
}


function getPlaceholder(replyToCollection?: string) {
    if (!replyToCollection) {
        return "¿Qué está pasando?"
    } else if (isPost(replyToCollection)) {
        return "Escribí una respuesta"
    } else if (isArticle(replyToCollection)) {
        return "Respondé al artículo"
    } else if (isTopicVersion(replyToCollection)) {
        return "Respondé al tema"
    } else if (isVisualization(replyToCollection)) {
        return "Respondé a la visualización"
    } else if (isDataset(replyToCollection)) {
        return "Respondé al conjunto de datos"
    }
}


function getLinksFromEditor(editorState: EditorState) {
    const links: string[] = []
    editorState.read(() => {
        const nodes = $dfs()
        nodes.forEach(n => {
            if($isLinkNode(n.node)){
                links.push(n.node.getURL())
            }
        })
    })
    return links
}


const settings: SettingsProps = getEditorSettings({
    placeholder: "¿Qué está pasando?",
    placeholderClassName: "text-[var(--text-light)] absolute top-0",
    editorClassName: "link relative",
    isReadOnly: false,
    isRichText: false
})


export const WritePost = ({replyTo, onClose, selection, onSubmit, quotedPost}: {
    replyTo: ReplyToContent,
    selection?: [number, number]
    onClose: () => void
    onSubmit: () => Promise<void>
    quotedPost?: PostView
}) => {
    const {user} = useSession()
    const [editorKey, setEditorKey] = useState(0)
    const [images, setImages] = useState<ImagePayload[]>([])
    const [text, setText] = useState("")
    const [visualization, setVisualization] = useState(null)
    const [visualizationModalOpen, setVisualizationModalOpen] = useState(false)
    const [imageModalOpen, setImageModalOpen] = useState(false)
    const [rect, setRect] = useState<DOMRect>()
    const [enDiscusion, setEnDiscusion] = useState(true)
    const [editorState, setEditorState] = useState<EditorState | null>(null)
    const {externalEmbedView, onRemove} = useExternalEmbed(editorState, (images && images.length > 0) || visualization != null)
    const {topicsMentioned, setLastTextChange, setEditor} = useTopicsMentioned()

    useEffect(() => {
        if(editorState){
            let text = getPlainText(editorState.toJSON().root)
            if(text.endsWith("\n")) text = text.slice(0, text.length-1)
            setText(text)
        }
    }, [editorState])

    const charLimit = 300

    const valid = (text.length > 0 && text.length <= 300) || (images && images.length > 0) || visualization != null

    const isReply = replyTo != undefined
    const replyToCollection = isReply ? getCollectionFromUri(replyTo.uri) : null

    useEffect(() => {
        setLastTextChange(new Date())
    }, [editorState, setLastTextChange])

    async function handleSubmit() {
        const reply = replyTo ? replyFromParentElement(replyTo) : undefined
        const {error} = await createPost({
            text,
            reply,
            selection,
            images,
            enDiscusion,
            externalEmbedView,
            quotedPost: quotedPost ? {uri: quotedPost.uri, cid: quotedPost.cid} : undefined
        })

        if (reply) {
            await onSubmit()
            // TO DO await mutate(threadApiUrl(reply.parent.uri))
            // TO DO await mutate(threadApiUrl(reply.root.uri))
            // TO DO
            //if(replyTo.content.topicVersion){
            //    const id = replyTo.content.topicVersion.topic.id
            //    await mutate("/api/topic/"+encodeURIComponent(id))
            //    await mutate("/api/topic-feed/"+encodeURIComponent(id))
            //}
        }

        if (!error) {
            setEditorKey(editorKey + 1);
            onClose()
        }
        return {error}
    }

    const hasEmbed: boolean = quotedPost != null || selection != null || visualization != null || (images && images.length > 0) || (externalEmbedView != null)
    const canAddImage = !hasEmbed ||
        images.length > 0 && images.length != 4 ||
        !visualization && !externalEmbedView && (!images || images.length == 0)

    return <RectTracker setRect={setRect}>
        <div className={"flex flex-col justify-between"}>
            <div
                className={"px-2 w-full pb-2 flex flex-col space-y-2 justify-between " + (!hasEmbed ? "min-h-64" : "")}>
                <div className="flex justify-between space-x-2 w-full my-2">
                    <ProfilePic user={user} className="w-8 h-8 rounded-full" descriptionOnHover={false}/>
                    <div className="sm:text-lg flex-1" key={editorKey}>
                        <MyLexicalEditor
                            setEditor={setEditor}
                            setEditorState={setEditorState}
                            settings={{...settings, placeholder: getPlaceholder(replyToCollection)}}
                        />
                        {charLimit && <ExtraChars charLimit={charLimit} count={text.length}/>}
                    </div>
                </div>
                {replyTo && <WritePanelReplyPreview replyTo={replyTo} selection={selection}/>}
                {visualization && <VisualizationNodeComp
                    visualization={visualization}
                    showEngagement={false}
                    width={rect.width - 20}
                />}
                {images && images.length > 0 && <PostImagesEditor images={images} setImages={setImages}/>}
                {externalEmbedView && <ExternalEmbedInEditor
                    embed={externalEmbedView}
                    onRemove={onRemove}
                />}
                {quotedPost && <WritePanelQuotedPost quotedPost={quotedPost}/>}
            </div>
            <div className="flex justify-between p-1 border-t items-center">
                <div className={"flex space-x-2 items-center"}>
                    <AddImageButton
                        disabled={!canAddImage}
                        setModalOpen={setImageModalOpen}
                    />
                    <AddVisualizationButton
                        disabled={hasEmbed}
                        setModalOpen={setVisualizationModalOpen}
                    />
                </div>
                <div className={"flex space-x-2 text-[var(--text-light)] items-center px-1"}>
                    <TopicsMentionedSmall mentions={topicsMentioned}/>
                    <AddToEnDiscusionButton enDiscusion={enDiscusion} setEnDiscusion={setEnDiscusion}/>
                    <StateButton
                        color={"primary"}
                        text1={isReply ? "Responder" : "Publicar"}
                        handleClick={handleSubmit}
                        disabled={!valid}
                        textClassName="font-semibold"
                        size="medium"
                        sx={{borderRadius: 20}}
                    />
                </div>
            </div>
            <InsertVisualizationModal
                open={visualizationModalOpen}
                onClose={() => {
                    setVisualizationModalOpen(false)
                }}
                onSubmit={setVisualization}
            />
            <InsertImageModal
                open={imageModalOpen}
                onClose={() => {
                    setImageModalOpen(false)
                }}
                onSubmit={(i: ImagePayload) => {
                    setImages([...images, i])
                    setImageModalOpen(false)
                }}
            />
        </div>
    </RectTracker>
}