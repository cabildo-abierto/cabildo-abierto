import React, {useEffect, useMemo, useState} from "react";
import {StateButton} from "@/components/utils/base/state-button"
import {ExtraChars} from "./extra-chars";
import {
    areSetsEqual,
    getCollectionFromUri,
} from "@cabildo-abierto/utils";
import {ProfilePic} from "../../perfil/profile-pic";
import {PostImagesEditor} from "./post-images-editor";
import {AddImageButton} from "./add-image-button";
import {useSession} from "@/components/auth/use-session";
import {ReplyToContent} from "./write-panel";
import {post} from "../../utils/react/fetch";
import {WritePanelReplyPreview} from "./write-panel-reply-preview";
import {ExternalEmbedInEditor} from "./external-embed-in-editor";
import {WritePanelQuotedPost} from "./write-panel-quoted-post";
import {
    $Typed,
    ArCabildoabiertoEmbedRecord,
    ArCabildoabiertoEmbedVisualization,
    ArCabildoabiertoFeedDefs,
    ImagePayload
} from "@cabildo-abierto/api";
import {EditorState} from "lexical";
import {InsertVisualizationModal} from "@/components/editor";
import dynamic from "next/dynamic";
import {$dfs} from "@lexical/utils";
import {$isLinkNode} from "@lexical/link";
import {TopicsMentionedSmall} from "../../feed/article/topics-mentioned";
import AddToEnDiscusionButton from "../add-to-en-discusion-button";
import {useTopicsMentioned} from "../use-topics-mentioned";
import Link from "next/link";
import {getTextLength} from "./rich-text"
import {AppBskyEmbedExternal} from "@atproto/api"
import {AddVisualizationButton} from "./add-visualization-button";
import {MarkdownSelection} from "@/components/editor/selection/markdown-selection";
import {LexicalSelection} from "@/components/editor/selection/lexical-selection";
import {profileUrl} from "@/components/utils/react/url";
import {visualizationViewToMain} from "@/components/visualizations/visualization/utils";
import {usePostEditorSettings} from "@/components/writing/write-panel/use-post-editor-settings";
import {AddThreadElementButton} from "@/components/writing/write-panel/add-thread-element-button";
import {isThreadElementStateEmpty} from "@/components/writing/write-panel/write-panel-panel";
import {getPlainText} from "@cabildo-abierto/editor-core";
import {ThreadElementState} from "@/components/writing/write-panel/thread-editor";
import {DeleteThreadElement} from "@/components/writing/write-panel/delete-thread-element";

const CAEditor = dynamic(() => import("@/components/editor/ca-editor").then(mod => mod.CAEditor), {ssr: false})


const InsertImageModal = dynamic(() => import("./insert-image-modal"), {ssr: false})

const PlotFromVisualizationMain = dynamic(
    () => import("../../visualizations/editor/plot-from-visualization-main"), {
        ssr: false
    })


function useUpdateExternalEmbed(
    state: ThreadElementState,
    setThreadElementState: (
        updater: (prev: ThreadElementState) => ThreadElementState
    ) => void
) {
    const [links, setLinks] = useState<string[]>([])
    const {images, visualization, editorState, externalEmbed} = state
    const externalEmbedUrl = externalEmbed?.url
    const disabled = (images && images.length > 0) || visualization != null

    function setExternalEmbedView(view: $Typed<AppBskyEmbedExternal.View>) {
        setThreadElementState(state => ({
            ...state,
            externalEmbed: {
                ...state.externalEmbed,
                view
            }
        }))
    }

    function setExternalEmbedUrl(url: string | null) {
        setThreadElementState(state => ({
            ...state,
            externalEmbed: {
                view: state.externalEmbed?.view ?? null,
                ...state.externalEmbed,
                url
            }
        }))
    }

    useEffect(() => {
        if (!state.externalEmbed?.url) {
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
                    console.log("setting embed", embed)
                    setExternalEmbedView(embed)
                }
            }

            if (!disabled) {
                onNewExternalEmbed(externalEmbedUrl)
            }
        }, 200)

        return () => clearTimeout(handler)
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

    return {onRemove}
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


export const WritePost = ({
                              replyTo,
                              selection,
                              quotedContent,
                              postView,
                              isVoteReject,
                              threadElementState,
                              setThreadElementState,
                              enDiscusion,
                              setEnDiscusion,
                              onAddThreadElement,
                              editorKey,
                              handleClickSubmit,
                              onDelete,
                              isOnlyElement
                          }: {
    replyTo: ReplyToContent,
    selection?: MarkdownSelection | LexicalSelection
    setHidden: (_: boolean) => void
    quotedContent?: ArCabildoabiertoEmbedRecord.View["record"]
    postView?: ArCabildoabiertoFeedDefs.PostView
    isVoteReject?: boolean
    threadElementState: ThreadElementState
    setThreadElementState: (
        updater: (prev: ThreadElementState) => ThreadElementState
    ) => void
    enDiscusion: boolean
    setEnDiscusion: (e: boolean) => void
    onAddThreadElement: () => void
    handleClickSubmit: (force: boolean) => Promise<{ error?: string }>
    editorKey?: number
    onDelete?: () => void
    isOnlyElement?: boolean
}) => {
    const {text, images, editorState, externalEmbed} = threadElementState
    const externalEmbedView = externalEmbed?.view
    const {user} = useSession()
    const {visualization, setVisualization} = useVisualizationInPostEditor(postView)
    const {
        onRemove
    } = useUpdateExternalEmbed(
        threadElementState,
        setThreadElementState
    )

    // modals
    const [visualizationModalOpen, setVisualizationModalOpen] = useState(false)
    const [imageModalOpen, setImageModalOpen] = useState(false)

    const {topicsMentioned, setLastTextChange, setEditor} = useTopicsMentioned()

    const isReply = replyTo != undefined
    const replyToCollection = isReply ? getCollectionFromUri(replyTo.uri) : null
    const quoteCollection = quotedContent && "uri" in quotedContent ? getCollectionFromUri(quotedContent.uri) : null

    const settings = usePostEditorSettings(
        replyToCollection,
        quoteCollection,
        postView,
        isVoteReject,
        threadElementState
    )

    function setEditorState(editorState: EditorState) {
        setThreadElementState(prev => ({
            ...prev,
            editorState
        }))
    }

    function setImages(images: ImagePayload[]) {
        setThreadElementState(prev => ({
            ...prev,
            images
        }))
    }

    function setText(text: string) {
        setThreadElementState(state => ({...state, text}))
    }

    useEffect(() => {
        if (editorState) {
            let text = getPlainText(editorState.toJSON().root)
            text = text.trim()
            setText(text)
        }
    }, [editorState])

    const charLimit = 300

    let textLength = 0
    try {
        textLength = getTextLength(text)
    } catch {}

    const valid = (textLength > 0 && textLength <= 300) || (images && images.length > 0) || visualization != null

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

    return <div className={"relative flex flex-col flex-grow justify-between"}>
        {!isOnlyElement && <div className={"absolute top-2 right-2 z-[1500]"}>
            <DeleteThreadElement
                onDelete={onDelete}
            />
        </div>}
        <div
            className={"px-2 w-full pb-2 flex-grow flex flex-col space-y-4 min-h-64"}
        >
            {replyTo != undefined && <WritePanelReplyPreview
                replyTo={replyTo}
                selection={selection}
            />}
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
                    />
                </Link>
                <div className="sm:text-lg flex-1" key={editorKey}>
                    <CAEditor
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
            <div className={"flex space-x-2 items-center"}>
                {!postView && !replyTo && !isThreadElementStateEmpty(threadElementState) && <AddThreadElementButton
                    onAddThreadElement={onAddThreadElement}
                    disabled={false}
                />}
                <TopicsMentionedSmall mentions={topicsMentioned}/>
                <AddToEnDiscusionButton enDiscusion={enDiscusion} setEnDiscusion={setEnDiscusion}/>
                <StateButton
                    variant={"outlined"}
                    handleClick={async () => {
                        return handleClickSubmit(false)
                    }}
                    disabled={!valid}
                    size={"small"}
                >
                    {postView ? "Confirmar cambios" : isReply ? (isVoteReject ? "Confirmar" : "Responder") : "Publicar"}
                </StateButton>
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
    </div>
}