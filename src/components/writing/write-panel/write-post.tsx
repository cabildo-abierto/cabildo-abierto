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
import {PostEditor} from "@/components/editor/post-editor";
import {Star, StarBorder} from "@mui/icons-material";
import {ToolbarButton} from "../../../../modules/ca-lexical-editor/src/plugins/ToolbarPlugin/toolbar-button";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {isPostView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {Record as PostRecord} from "@/lex-api/types/app/bsky/feed/post"
import {get, post} from "@/utils/fetch";
import {WritePanelReplyPreview} from "@/components/writing/write-panel/write-panel-reply-preview";
import {Main as ExternalEmbed, View as ExternalEmbedView} from "@/lex-api/types/app/bsky/embed/external"
import {View as RecordEmbedView} from "@/lex-api/types/app/bsky/embed/record"
import {View as RecordWithMediaEmbedView} from "@/lex-api/types/app/bsky/embed/recordWithMedia"
import {ExternalEmbedInEditor} from "@/components/writing/write-panel/external-embed-in-editor";
import {
    postViewToRecordEmbedView,
    WritePanelQuotedPost
} from "@/components/writing/write-panel/write-panel-quoted-post";
import {$Typed} from "@atproto/api";
import {PrettyJSON} from "../../../../modules/ui-utils/src/pretty-json";



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
    const [enDiscusion, setEnDiscusion] = useState(false)
    const [externalEmbedView, setExternalEmbedView] = useState<$Typed<ExternalEmbedView> | null>(null)
    const [externalEmbedUrl, setExternalEmbedUrl] = useState<string | null>(null)

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

            if((!images || images.length == 0) && !visualization){
                onNewExternalEmbed(externalEmbedUrl)
            }
        }, 200)

        return () => clearTimeout(handler) // Clean up on dependency change
    }, [externalEmbedUrl])


    const charLimit = 300

    const valid = (text.length > 0 && text.length <= 300) || (images && images.length > 0) || visualization != null

    const isReply = replyTo != undefined
    const replyToCollection = isReply ? getCollectionFromUri(replyTo.uri) : null

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

    const hasEmbed = replyTo || quotedPost || visualization || (images && images.length > 0) || (externalEmbedView != null)
    const canAddImage = !hasEmbed ||
        images.length > 0 && images.length != 4 ||
        !visualization && !externalEmbedView && (!images || images.length == 0)

    return <RectTracker setRect={setRect}>
        <div className={"flex flex-col justify-between"}>
            <div className={"px-2 w-full pb-2 flex flex-col space-y-2 justify-between " + (!hasEmbed ? "min-h-64" : "")}>
                <div className="flex justify-between space-x-2 w-full my-2">
                    <ProfilePic user={user} className="w-8 h-8 rounded-full" descriptionOnHover={false} />
                    <div className="sm:text-lg flex-1" key={editorKey}>
                        <PostEditor
                            setText={setText}
                            placeholder={getPlaceholder(replyToCollection)}
                            setExternalEmbed={setExternalEmbedUrl}
                        />
                        {charLimit && <ExtraChars charLimit={charLimit} count={text.length} />}
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
                    onRemove={() => {
                        setExternalEmbedUrl(null)
                        setExternalEmbedView(null)
                    }}
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
                    <ToolbarButton
                        onClick={() => {
                            setEnDiscusion(!enDiscusion)
                        }}
                        title={"Agregar este post al feed En discusión."}
                        aria-label={""}
                    >
                        {enDiscusion ? <Star fontSize={"small"}/> : <StarBorder fontSize={"small"}/>}
                    </ToolbarButton>
                    <StateButton
                        text1={isReply ? "Responder" : "Publicar"}
                        handleClick={handleSubmit}
                        disabled={!valid}
                        textClassName="font-semibold"
                        size="small"
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