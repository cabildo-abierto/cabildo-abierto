import React, {useEffect, useMemo, useState} from "react";
import StateButton from "../../layout/utils/state-button";
import {ExtraChars} from "./extra-chars";
import {
    getCollectionFromUri,
    isArticle,
    isDataset,
    isPost,
    isTopicVersion,
    isVisualization, profileUrl,
} from "@/utils/uri";
import {ProfilePic} from "../../profile/profile-pic";
import {PostImagesEditor} from "./post-images-editor";
import {AddImageButton} from "./add-image-button";
import {ATProtoStrongRef, FastPostReplyProps} from "@/lib/types";
import {useSession} from "@/queries/getters/useSession";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {post} from "@/utils/fetch";
import {WritePanelReplyPreview} from "@/components/writing/write-panel/write-panel-reply-preview";
import {ExternalEmbedInEditor} from "@/components/writing/write-panel/external-embed-in-editor";
import {
    WritePanelQuotedPost
} from "@/components/writing/write-panel/write-panel-quoted-post";
import {$Typed} from "@/lex-api/util";
import {EditorState} from "lexical";
import {getPlainText} from "@/components/topics/topic/diff";
import {SettingsProps} from "../../../../modules/ca-lexical-editor/src/lexical-editor";
import {getEditorSettings} from "@/components/writing/settings";
import dynamic from "next/dynamic";
import {$dfs} from "@lexical/utils";
import {$isLinkNode} from "@lexical/link";
import {areSetsEqual} from "@/utils/arrays";
import {TopicsMentionedSmall} from "@/components/thread/article/topics-mentioned";
import AddToEnDiscusionButton from "@/components/writing/add-to-en-discusion-button";
import {useTopicsMentioned} from "@/components/writing/use-topics-mentioned";
import {MarkdownSelection} from "../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {LexicalSelection} from "../../../../modules/ca-lexical-editor/src/selection/lexical-selection";
import {markdownToEditorState} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import Link from "next/link";
import {getTextLength} from "@/components/writing/write-panel/rich-text"
import {AppBskyEmbedImages, AppBskyFeedPost} from "@atproto/api"
import {AppBskyEmbedExternal} from "@atproto/api";
import {ArCabildoabiertoEmbedVisualization, ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {AddVisualizationButton} from "./add-visualization-button";
import {useMarkdownFromBsky} from "@/components/writing/write-panel/use-markdown-from-bsky";
import {hasEnDiscusionLabel} from "@/components/feed/frame/post-preview-frame";
import {BaseFullscreenPopup} from "../../layout/utils/base-fullscreen-popup";
import {Button} from "../../layout/utils/button";


const InsertImageModal = dynamic(() => import("./insert-image-modal"), {ssr: false})

const PlotFromVisualizationMain = dynamic(
    () => import("@/components/visualizations/editor/plot-from-visualization-main"), {
        ssr: false
    })


const MyLexicalEditor = dynamic(() => import('../../../../modules/ca-lexical-editor/src/lexical-editor'), {
    ssr: false,
    loading: () => <></>,
})


const InsertVisualizationModal = dynamic(() => import(
    './insert-visualization-modal'
    ), {ssr: false})


function replyFromParentElement(replyTo: ReplyToContent): FastPostReplyProps {
    if (ArCabildoabiertoFeedDefs.isPostView(replyTo)) {
        const parent = {
            uri: replyTo.uri,
            cid: replyTo.cid
        }
        if ((replyTo.record as AppBskyFeedPost.Record).reply) {
            return {
                parent,
                root: (replyTo.record as AppBskyFeedPost.Record).reply.root
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

function useExternalEmbed(editorState: EditorState, disabled: boolean, postView?: ArCabildoabiertoFeedDefs.PostView) {
    let initialState: $Typed<AppBskyEmbedExternal.View> | null = null
    let initialUrl: string | null = null
    if (postView && AppBskyEmbedExternal.isView(postView.embed)) {
        initialState = postView.embed
        initialUrl = postView.embed.external.uri
    }
    const [externalEmbedView, setExternalEmbedView] = useState<$Typed<AppBskyEmbedExternal.View> | null>(initialState)
    const [externalEmbedUrl, setExternalEmbedUrl] = useState<string | null>(initialUrl)
    const [links, setLinks] = useState<string[]>([])

    useEffect(() => {
        if (!externalEmbedUrl) {
            setExternalEmbedView(null)
            return
        }

        const handler = setTimeout(() => {
            async function onNewExternalEmbed(url: string) {
                const {data, error} = await post<{ url: string }, {
                    title: string | null,
                    description: string | null,
                    thumbnail: string | null
                }>("/metadata", {url})

                if (!error) {
                    const {title, description, thumbnail} = data
                    const embed: $Typed<AppBskyEmbedExternal.View> = {
                        $type: "app.bsky.embed.external#view",
                        external: {
                            $type: 'app.bsky.embed.external#viewExternal',
                            uri: url,
                            title,
                            description,
                            thumb: thumbnail
                        }
                    }
                    setExternalEmbedView(embed)
                }
            }

            if (!disabled) {
                onNewExternalEmbed(externalEmbedUrl)
            }
        }, 200)

        return () => clearTimeout(handler) // Clean up on dependency change
    }, [externalEmbedUrl])


    useEffect(() => {
        if (editorState) {
            const newLinks = getLinksFromEditor(editorState)
            for (let i = 0; i < newLinks.length; i++) {
                const l = newLinks[i]
                if (!links.includes(l)) {
                    setExternalEmbedUrl(l)
                    break
                }
            }
            if (!areSetsEqual(new Set(newLinks), new Set(links))) {
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


export type ImagePayload = { src: string, $type: "url" } | { $type: "file", base64: string, src: string }
export type ImagePayloadForPostCreation = { src: string, $type: "url" } | { $type: "file", base64: string }

export type CreatePostProps = {
    text: string
    reply?: FastPostReplyProps
    selection?: [number, number]
    images?: ImagePayloadForPostCreation[]
    enDiscusion?: boolean
    externalEmbedView?: $Typed<AppBskyEmbedExternal.View>
    quotedPost?: ATProtoStrongRef
    visualization?: ArCabildoabiertoEmbedVisualization.Main
    uri?: string
    forceEdit?: boolean
}


function getPlaceholder(replyToCollection?: string, quotedCollection?: string) {
    if (!replyToCollection && !quotedCollection) {
        return "¿Qué está pasando?"
    } else {
        const collection = replyToCollection ?? quotedCollection
        if (isPost(collection)) {
            return "Escribí una respuesta"
        } else if (isArticle(collection)) {
            return "Respondé al artículo"
        } else if (isTopicVersion(collection)) {
            return "Responder en la discusión del tema"
        } else if (isVisualization(collection)) {
            return "Respondé a la visualización"
        } else if (isDataset(collection)) {
            return "Respondé al conjunto de datos"
        }
    }
}


function getLinksFromEditor(editorState: EditorState) {
    const links: string[] = []
    editorState.read(() => {
        const nodes = $dfs()
        nodes.forEach(n => {
            if ($isLinkNode(n.node)) {
                links.push(n.node.getURL())
            }
        })
    })
    return links
}


function usePostEditorSettings(replyToCollection?: string, quoteCollection?: string, postView?: ArCabildoabiertoFeedDefs.PostView): SettingsProps {
    const p = postView?.record as AppBskyFeedPost.Record | undefined
    const {markdown} = useMarkdownFromBsky(p)

    return getEditorSettings({
        placeholder: getPlaceholder(replyToCollection, quoteCollection),
        placeholderClassName: "text-[var(--text-light)] absolute text-base top-0",
        editorClassName: "link relative h-full text-base",
        isReadOnly: false,
        isRichText: false,
        markdownShortcuts: false,
        topicMentions: true,
        initialText: markdown,
        initialTextFormat: "markdown"
    })
}


function useImagesInPostEditor(postView?: ArCabildoabiertoFeedDefs.PostView) {
    const postImages = useMemo(() => {
        if (postView && AppBskyEmbedImages.isView(postView.embed)) {
            const images: ImagePayload[] = postView.embed.images.map(i => ({
                $type: "url",
                src: i.thumb
            }))
            return images
        } else {
            return []
        }
    }, [postView])

    const [images, setImages] = useState<ImagePayload[]>(postImages)

    return {images, setImages}
}


function useEnDiscusionForWritePost(replyTo: ReplyToContent, postView?: ArCabildoabiertoFeedDefs.PostView) {
    const initialState = postView ? hasEnDiscusionLabel(postView) : !replyTo
    const [enDiscusion, setEnDiscusion] = useState(initialState)

    return {enDiscusion, setEnDiscusion}
}


function useVisualizationInPostEditor(postView?: ArCabildoabiertoFeedDefs.PostView) {
    let initialState: ArCabildoabiertoEmbedVisualization.Main | null = null
    if (postView) {
        if (ArCabildoabiertoEmbedVisualization.isView(postView.embed)) {
            initialState = visualizationViewToMain(postView.embed)
        }
    }

    const [visualization, setVisualization] = useState<ArCabildoabiertoEmbedVisualization.Main>(initialState)

    return {visualization, setVisualization}
}


export function visualizationViewToMain(v: ArCabildoabiertoEmbedVisualization.View): ArCabildoabiertoEmbedVisualization.Main {
    return v.visualization
}


export const WritePost = ({
                              replyTo,
                              selection,
                              quotedContent,
                              handleSubmit,
                              onClose,
                              postView
                          }: {
    replyTo: ReplyToContent,
    selection?: MarkdownSelection | LexicalSelection
    onClose: () => void
    setHidden: (_: boolean) => void
    quotedContent?: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
    handleSubmit: (_: CreatePostProps) => Promise<{ error?: string }>
    postView?: ArCabildoabiertoFeedDefs.PostView
}) => {
    const {user} = useSession()
    const [editorKey, setEditorKey] = useState(0)

    const [text, setText] = useState("")
    const [forceEditModalOpen, setForceEditModalOpen] = useState(false)

    // editor state
    const {images, setImages} = useImagesInPostEditor(postView)
    const {visualization, setVisualization} = useVisualizationInPostEditor(postView)
    const {enDiscusion, setEnDiscusion} = useEnDiscusionForWritePost(replyTo, postView)
    const [editorState, setEditorState] = useState<EditorState | null>(null)
    const {
        externalEmbedView,
        onRemove
    } = useExternalEmbed(editorState, (images && images.length > 0) || visualization != null, postView)

    // modals
    const [visualizationModalOpen, setVisualizationModalOpen] = useState(false)
    const [imageModalOpen, setImageModalOpen] = useState(false)

    const {topicsMentioned, setLastTextChange, setEditor} = useTopicsMentioned()

    const isReply = replyTo != undefined
    const replyToCollection = isReply ? getCollectionFromUri(replyTo.uri) : null
    const quoteCollection = quotedContent ? getCollectionFromUri(quotedContent.uri) : null
    const settings = usePostEditorSettings(
        replyToCollection,
        quoteCollection,
        postView
    )

    async function handleClickSubmit(force: boolean = false) {
        const reply = replyTo ? replyFromParentElement(replyTo) : undefined

        let selectionForPost: [number, number]
        if (selection instanceof LexicalSelection && (ArCabildoabiertoWikiTopicVersion.isTopicView(replyTo) || ArCabildoabiertoFeedDefs.isFullArticleView(replyTo)) && replyTo.format == "markdown") {
            const state = markdownToEditorState(replyTo.text, true, true, replyTo.embeds)
            selectionForPost = selection.toMarkdownSelection(state).toArray()
        }

        const post: CreatePostProps = {
            text: text,
            reply,
            selection: selectionForPost,
            images,
            enDiscusion,
            externalEmbedView,
            visualization,
            quotedPost: quotedContent ? {uri: quotedContent.uri, cid: quotedContent.cid} : undefined,
            uri: postView?.uri,
            forceEdit: force
        }

        const {error} = await handleSubmit(post)
        if (error) {
            if (error.includes("La publicación ya fue referenciada")) {
                setForceEditModalOpen(true)
                return {}
            } else {
                return {error}
            }
        }
        setEditorKey(editorKey + 1)
        onClose()
        return {}
    }

    useEffect(() => {
        if (editorState) {
            let text = getPlainText(editorState.toJSON().root)
            if (text.endsWith("\n")) text = text.slice(0, text.length - 1)
            setText(text)
        }
    }, [editorState])

    const charLimit = 300

    const valid = (text.length > 0 && text.length <= 300) || (images && images.length > 0) || visualization != null

    useEffect(() => {
        setLastTextChange(new Date())
    }, [editorState, setLastTextChange])

    const hasEmbed: boolean = quotedContent != null || selection != null || visualization != null || (images && images.length > 0) || (externalEmbedView != null)
    const canAddImage = !hasEmbed ||
        images.length > 0 && images.length != 4 ||
        !visualization && !externalEmbedView && (!images || images.length == 0)

    const visualizationComp = useMemo(() => {
        if (visualization) {
            return <div className={"flex justify-center w-full"}>
                <PlotFromVisualizationMain
                    visualization={visualization}
                    onDelete={() => {
                        setVisualization(null)
                    }}
                    onEdit={(v) => {
                        setVisualization(v)
                    }}
                    width={450}
                />
            </div>
        }
        return null
    }, [visualization])

    return <div className={"flex flex-col flex-grow justify-between"}>
        <div
            className={"px-2 w-full pb-2 flex-grow justify-between flex flex-col space-y-4 min-h-64"}
        >
            {replyTo != undefined && <div className={""}>
                <WritePanelReplyPreview
                    replyTo={replyTo}
                    selection={selection}
                />
            </div>}
            <div className="flex justify-between space-x-2 w-full my-2">
                <Link
                    href={profileUrl(user.handle)}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                >
                    <ProfilePic
                        user={user}
                        className="w-8 h-8 rounded-full"
                        descriptionOnHover={false}
                        clickable={false}
                    />
                </Link>
                <div className="sm:text-lg flex-1" key={editorKey}>
                    <MyLexicalEditor
                        setEditor={setEditor}
                        setEditorState={setEditorState}
                        settings={settings}
                    />
                    {charLimit && <ExtraChars charLimit={charLimit} count={getTextLength(text)}/>}
                </div>
            </div>
            {visualizationComp}
            {images && images.length > 0 && <PostImagesEditor images={images} setImages={setImages}/>}
            {externalEmbedView && <ExternalEmbedInEditor
                embed={externalEmbedView}
                onRemove={onRemove}
            />}
            {quotedContent && <WritePanelQuotedPost quotedPost={quotedContent}/>}
        </div>
        <div className="flex justify-between py-1 px-2 border-t items-center">
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
            <div className={"flex space-x-2 text-[var(--text-light)] items-center"}>
                <TopicsMentionedSmall mentions={topicsMentioned}/>
                <AddToEnDiscusionButton enDiscusion={enDiscusion} setEnDiscusion={setEnDiscusion}/>
                <StateButton
                    variant={"outlined"}
                    text1={postView ? "Confirmar cambios" : isReply ? "Responder" : "Publicar"}
                    handleClick={async () => {
                        return await handleClickSubmit()
                    }}
                    disabled={!valid}
                    textClassName="font-semibold text-xs py-[2px] uppercase"
                    size="medium"
                />
            </div>
        </div>
        {visualizationModalOpen && <InsertVisualizationModal
            open={visualizationModalOpen}
            onClose={() => {
                setVisualizationModalOpen(false)
            }}
            onSave={(v) => {
                setVisualization(v)
                setVisualizationModalOpen(false)
            }}
            initialConfig={visualization}
        />}
        {imageModalOpen && <InsertImageModal
            open={imageModalOpen}
            onClose={() => {
                setImageModalOpen(false)
            }}
            onSubmit={(i: ImagePayload) => {
                setImages([...images, i])
                setImageModalOpen(false)
            }}
        />}
        {forceEditModalOpen && <BaseFullscreenPopup open={true}>
            <div className={"pb-4 pt-8 space-y-8"}>
                <div className={"font-light text-[var(--text-light)] text-sm max-w-[400px] px-8"}>
                    La publicación ya fue referenciada. Si la editás ahora el cambio se va a ver reflejado en Cabildo
                    Abierto pero no en Bluesky.
                </div>
                <div className={"flex space-x-2 justify-center"}>
                    <Button
                        variant={"outlined"}
                        size={"small"}
                        onClick={() => {
                            setForceEditModalOpen(false)
                        }}
                    >
                        Cancelar
                    </Button>
                    <StateButton
                        variant={"outlined"}
                        size={"small"}
                        handleClick={async () => {
                            const {error} = await handleClickSubmit(true)
                            if (!error) {
                                setForceEditModalOpen(false)
                            }
                            return {error}
                        }}
                        text1={"Editar igualmente"}
                    />
                </div>
            </div>
        </BaseFullscreenPopup>}
    </div>
}