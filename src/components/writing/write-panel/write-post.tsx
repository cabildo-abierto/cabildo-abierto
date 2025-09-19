import React, {useEffect, useMemo, useState} from "react";
import StateButton from "../../../../modules/ui-utils/src/state-button";
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
import {InsertImageModal} from "./insert-image-modal";
import {ATProtoStrongRef, FastPostReplyProps} from "@/lib/types";
import {useSession} from "@/queries/useSession";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {get} from "@/utils/fetch";
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
import {AppBskyFeedPost} from "@atproto/api"
import {AppBskyEmbedExternal} from "@atproto/api";
import {ArCabildoabiertoEmbedVisualization, ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {AddVisualizationButton} from "./add-visualization-button";

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
))


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

function useExternalEmbed(editorState: EditorState, disabled: boolean) {
    const [externalEmbedView, setExternalEmbedView] = useState<$Typed<AppBskyEmbedExternal.View> | null>(null)
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
                const embed: $Typed<AppBskyEmbedExternal.View> = {
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
}


function getPlaceholder(replyToCollection?: string) {
    if (!replyToCollection) {
        return "¿Qué está pasando?"
    } else if (isPost(replyToCollection)) {
        return "Escribí una respuesta"
    } else if (isArticle(replyToCollection)) {
        return "Respondé al artículo"
    } else if (isTopicVersion(replyToCollection)) {
        return "Responder en la discusión del tema"
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
            if ($isLinkNode(n.node)) {
                links.push(n.node.getURL())
            }
        })
    })
    return links
}


const settings: SettingsProps = getEditorSettings({
    placeholder: "¿Qué está pasando?",
    placeholderClassName: "text-[var(--text-light)] absolute top-0",
    editorClassName: "link relative h-full",
    isReadOnly: false,
    isRichText: false,
    markdownShortcuts: false,
    topicMentions: true
})


export function visualizationViewToMain(v: ArCabildoabiertoEmbedVisualization.View): ArCabildoabiertoEmbedVisualization.Main {
    return v.visualization
}


export const WritePost = ({replyTo, selection, quotedPost, handleSubmit, onClose}: {
    replyTo: ReplyToContent,
    selection?: MarkdownSelection | LexicalSelection
    onClose: () => void
    setHidden: (_: boolean) => void
    quotedPost?: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
    handleSubmit: (_: CreatePostProps) => Promise<void>
}) => {
    const {user} = useSession()
    const [editorKey, setEditorKey] = useState(0)
    const [images, setImages] = useState<ImagePayload[]>([])
    const [text, setText] = useState("")
    const [visualization, setVisualization] = useState<ArCabildoabiertoEmbedVisualization.Main>(null)
    const [visualizationModalOpen, setVisualizationModalOpen] = useState(false)
    const [imageModalOpen, setImageModalOpen] = useState(false)
    const [enDiscusion, setEnDiscusion] = useState(!replyTo)
    const [editorState, setEditorState] = useState<EditorState | null>(null)
    const {
        externalEmbedView,
        onRemove
    } = useExternalEmbed(editorState, (images && images.length > 0) || visualization != null)
    const {topicsMentioned, setLastTextChange, setEditor} = useTopicsMentioned()

    async function handleClickSubmit() {
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
            quotedPost: quotedPost ? {uri: quotedPost.uri, cid: quotedPost.cid} : undefined
        }

        await handleSubmit(post)
        setEditorKey(editorKey + 1);
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

    const isReply = replyTo != undefined
    const replyToCollection = isReply ? getCollectionFromUri(replyTo.uri) : null

    useEffect(() => {
        setLastTextChange(new Date())
    }, [editorState, setLastTextChange])

    const hasEmbed: boolean = quotedPost != null || selection != null || visualization != null || (images && images.length > 0) || (externalEmbedView != null)
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
            className={"px-2 w-full pb-2 flex-grow flex flex-col space-y-2 justify-between min-h-64"}
        >
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
                        settings={{...settings, placeholder: getPlaceholder(replyToCollection)}}
                    />
                    {charLimit && <ExtraChars charLimit={charLimit} count={getTextLength(text)}/>}
                </div>
            </div>
            {replyTo != undefined && <WritePanelReplyPreview
                replyTo={replyTo}
                selection={selection}
            />}
            {visualizationComp}
            {images && images.length > 0 && <PostImagesEditor images={images} setImages={setImages}/>}
            {externalEmbedView && <ExternalEmbedInEditor
                embed={externalEmbedView}
                onRemove={onRemove}
            />}
            {quotedPost && <WritePanelQuotedPost quotedPost={quotedPost}/>}
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
                    text1={isReply ? "Responder" : "Publicar"}
                    handleClick={handleClickSubmit}
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
    </div>
}