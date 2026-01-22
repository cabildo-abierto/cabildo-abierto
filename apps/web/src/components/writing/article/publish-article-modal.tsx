import {StateButton, StateButtonClickHandler} from "@/components/utils/base/state-button";
import {useEffect, useMemo, useState} from "react";
import {BaseFullscreenPopup} from "../../utils/dialogs/base-fullscreen-popup";
import {ArticlePreviewContent} from "../../feed/article/article-preview";
import Link from "next/link";
import {topicUrl} from "@/components/utils/react/url";
import removeMarkdown from "remove-markdown";
import {AppBskyEmbedExternal, ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {hasEnDiscusionLabel} from "../../feed/utils/post-preview-frame";
import {cn} from "@/lib/utils";
import {Checkbox} from "@/components/utils/ui/checkbox";
import {Note} from "@/components/utils/base/note";
import {ImagePayload} from "@cabildo-abierto/api";
import {BaseTextArea} from "@/components/utils/base/base-text-area";
import {UploadImageButton} from "@/components/writing/write-panel/upload-image-button";
import {Label} from "@/components/utils/ui/label";
import {Paragraph} from "@/components/utils/base/paragraph";
import InfoPanel from "@/components/utils/base/info-panel";
import dynamic from "next/dynamic";
import {usePostEditorSettings} from "@/components/writing/write-panel/use-post-editor-settings";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {feedOptionNodes} from "@/components/feed/config/feed-option-nodes";
import {PostExternalEmbed} from "@/components/feed/embed/post-external-embed";
import {ProfilePic} from "@/components/perfil/profile-pic";
import {useSession} from "@/components/auth/use-session";
import {useLayoutConfig} from "@/components/layout/main-layout/layout-config-context";
import {EditorState} from "lexical";
import {getPlainText} from "@cabildo-abierto/editor-core";

const CAEditor = dynamic(() => import("@/components/editor/ca-editor").then(mod => mod.CAEditor), {ssr: false})

type PublishArticleModalProps = {
    open: boolean
    onClose: () => void
    onSubmit: (enDiscusion: boolean) => StateButtonClickHandler
    mdText?: string
    title?: string
    mentions?: ArCabildoabiertoFeedDefs.TopicMention[]
    article?: ArCabildoabiertoFeedDefs.FullArticleView
    description: string | null
    setDescription: (s: string | null) => void
    previewImage: ImagePayload | null
    setPreviewImage: (s: ImagePayload | null) => void
    bskyPostText: string | null
    setBskyPostText: (s: string | null) => void
}


export function getArticleSummary(md: string) {
    return removeMarkdown(md)
        .trim()
        .replaceAll("\n", " ")
        .replaceAll("\\n", " ")
        .replaceAll("\|", " ")
        .replaceAll("\-\-\-", " ")
        .slice(0, 150)
        .trim()
}


export const TopicMentionsList = ({
                                      mentions,
                                      linkClassName
                                  }: {
    mentions: ArCabildoabiertoFeedDefs.TopicMention[]
    linkClassName?: string
}) => {
    return <div>
        {
            mentions.map((m, i) =>
                <Link
                    className={cn("hover:text-[var(--text)]", linkClassName)}
                    key={i}
                    href={topicUrl(m.id)}
                >{m.title}{i < mentions.length - 1 ? ", " : ""}</Link>)}.
    </div>
}


const PublishArticleModalPreviewConfig = ({
                                              title,
                                              description,
                                              setDescription,
                                              previewImage,
                                              summary,
                                              setPreviewImage
                                          }: {
    summary: string
    title: string
    description: string | null
    setDescription: (s: string) => void
    previewImage: ImagePayload | null
    setPreviewImage: (s: ImagePayload | null) => void
}) => {

    return <div className={"space-y-4"}>
        <Paragraph className={"text-xs"}>
            Podés configurar una imagen y una descripción que van a aparecer al compartir un enlace al artículo
            en otras plataformas.
        </Paragraph>

        <div className={"w-full flex flex-col space-y-[6px]"}>
            <Label className={"px-[2px]"}>
                Previsualización actual
            </Label>
            <ArticlePreviewContent
                title={title}
                summary={description && description.length > 0 ? description : summary}
                image={previewImage?.src}
            />
        </div>

        <div className={"space-y-[6px] flex flex-col items-start"}>
            <Label className={"px-[2px]"}>
                Imagen
            </Label>
            <UploadImageButton
                text={previewImage == null ? "Subir imagen" : "Reemplazar imagen"}
                onSubmit={setPreviewImage}
                size={"small"}
            />
        </div>

        <div>
            <BaseTextArea
                rows={2}
                value={description}
                label={"Descripción"}
                placeholder={"Descripción..."}
                onChange={(e => {
                    setDescription(e.target.value)
                })}
            />
        </div>
    </div>
}


const PublishArticleModalShareConfig = ({
                                            enDiscusion,
                                            setEnDiscusion,
                                            bskyPostText,
                                            setBskyPostText,
                                            mentions,
                                            title,
                                            description,
                                            thumb
                                        }: {
    setEnDiscusion: (s: boolean) => void
    enDiscusion: boolean
    bskyPostText: string | null
    setBskyPostText: (s: string | null) => void
    mentions: ArCabildoabiertoFeedDefs.TopicMention[]
    title: string
    description: string
    thumb?: string
}) => {
    const {user} = useSession()
    const [editorState, setEditorState] = useState<EditorState>(null)

    const bskyPostEditorSettings = usePostEditorSettings(
        null,
        null,
        null,
        false,
        null
    )

    bskyPostEditorSettings.placeholder = "Texto de la publicación..."

    const embed: AppBskyEmbedExternal.View = {
        external: {
            uri: "https://cabildoabierto.ar/previsualizacion-de-articulo",
            title,
            description,
            thumb
        }
    }

    useEffect(() => {
        if(editorState){
            const md = getPlainText(editorState.toJSON().root).trim()
            setBskyPostText(md)
        }
    }, [editorState])

    return <div className={"space-y-4"}
    >
        <div className={"space-y-4 pt-4"}>
            <div className={"flex items-center space-x-2 px-2"}>
                <Checkbox
                    onCheckedChange={() => {
                        setEnDiscusion(!enDiscusion)
                    }}
                    checked={enDiscusion}
                />
                <Note className={"text-sm"}>
                    ¿Agregar al muro <span className={"font-normal"}>En discusión</span>?
                </Note>
            </div>
            <div className={"flex items-center space-x-2 px-2"}>
                <Checkbox
                    onCheckedChange={() => {
                        setBskyPostText(bskyPostText == null ? "" : null)
                    }}
                    checked={bskyPostText != null}
                />
                <Note className={"text-sm flex space-x-1 items-center"}>
                    <div>
                        ¿Compartir en una publicación de Bluesky?
                    </div>
                    <InfoPanel
                    iconFontSize={16}
                    text={"Marcá este casillero para crear una publicación  junto con el artículo, para que aparezca en los muros de Bluesky. En los muros de Cabildo Abierto van a aparecer tanto el artículo como la publicación."}
                />
                </Note>
            </div>
            {bskyPostText !== null && <div>
                <div className={"border p-2 ml-8"}>
                    <div className={"flex space-x-2 min-h-[40px]"}>
                        <div>
                            <ProfilePic
                                user={user}
                                className={"rounded-full w-8 h-8"}
                                descriptionOnHover={false}
                            />
                        </div>
                        <div className={"w-full"}>
                            <CAEditor
                                settings={bskyPostEditorSettings}
                                setEditor={() => {
                                }}
                                setEditorState={setEditorState}
                            />
                        </div>
                    </div>
                    <PostExternalEmbed embed={embed}/>
                </div>
            </div>}
            <div>
                {mentions.length == 1 && <Paragraph className={"text-sm"}>
                    También va a aparecer en el tema {mentions[0].title}.
                </Paragraph>}

                {mentions.length > 1 && <Paragraph className={"text-sm"}>
                    También va a aparecer en los temas: <TopicMentionsList mentions={mentions}/>
                </Paragraph>}
            </div>
        </div>
    </div>
}


const PublishArticleModal = ({
                                 onSubmit,
                                 open,
                                 onClose,
                                 mdText,
                                 title,
                                 mentions,
                                 article,
                                 description,
                                 setDescription,
                                 previewImage,
                                 setPreviewImage,
                                 bskyPostText,
                                 setBskyPostText
                             }: PublishArticleModalProps) => {
    const [enDiscusion, setEnDiscusion] = useState(article ? hasEnDiscusionLabel(article) : true)
    const summary = useMemo(() => getArticleSummary(mdText), [mdText])
    const [selected, setSelected] = useState<string>("Previsualización")
    const {isMobile} = useLayoutConfig()

    useEffect(() => {
        if (description == null || description.length == 0) setDescription(summary)
    }, []);
    return <BaseFullscreenPopup
        open={open}
        className={""}
    >
        <div
            className={"sm:w-[600px]"}
        >
            <div className={"flex justify-between  items-center pl-3"}>
                <h3 className={"whitespace-nowrap normal-case text-sm sm:text-base"}>
                    Detalles de publicación
                </h3>
                <div className={"flex space-x-1 pr-1 py-1"}>
                    <StateButton
                        handleClick={() => {onClose()}}
                        size={"small"}
                        className={"h-7"}
                    >
                        Cancelar
                    </StateButton>
                    <StateButton
                        handleClick={onSubmit(enDiscusion)}
                        size={"small"}
                        className={"h-7"}
                    >
                        {article ? "Confirmar edición" : "Publicar"}
                    </StateButton>
                </div>
            </div>
            <div className={"flex border-b"}>
                <SelectionComponent
                    selected={selected}
                    onSelection={s => {
                        setSelected(s)
                    }}
                    options={["Previsualización", "Dónde compartir"]}
                    optionsNodes={feedOptionNodes(36, undefined, "text-[12px] border-b-[1px] hover:border-b-[1px] hover:border-b-[var(--text)]", undefined, " hover:bg-transparent px-0")}
                    optionContainerClassName={"flex px-2"}
                    className={"flex"}
                />
            </div>
            <div className={cn("p-4 overflow-y-auto custom-scrollbar", !isMobile && "h-[70vh]")}>
                {selected == "Previsualización" && <PublishArticleModalPreviewConfig
                    summary={summary}
                    title={title}
                    description={description}
                    setDescription={setDescription}
                    previewImage={previewImage}
                    setPreviewImage={setPreviewImage}
                />}
                {selected == "Dónde compartir" && <PublishArticleModalShareConfig
                    mentions={mentions}
                    enDiscusion={enDiscusion}
                    setEnDiscusion={setEnDiscusion}
                    bskyPostText={bskyPostText}
                    setBskyPostText={setBskyPostText}
                    title={title}
                    description={description}
                    thumb={previewImage?.src}
                />}
            </div>
        </div>
    </BaseFullscreenPopup>
}


export default PublishArticleModal