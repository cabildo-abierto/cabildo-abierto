import StateButton, {StateButtonClickHandler} from "../../layout/utils/state-button";
import {useMemo, useState} from "react";
import {BaseFullscreenPopup} from "../../layout/base/base-fullscreen-popup";
import {ArticlePreviewContent} from "@/components/feed/article/article-preview";
import Link from "next/link";
import {topicUrl} from "@/utils/uri";
import removeMarkdown from "remove-markdown";
import AddToEnDiscusionButton from "@/components/writing/add-to-en-discusion-button";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {hasEnDiscusionLabel} from "@/components/feed/frame/post-preview-frame";
import {BaseTextArea} from "@/components/layout/base/base-text-area";
import {BaseTextField} from "@/components/layout/base/base-text-field";
import {SubmitImage, UploadImageButton} from "@/components/writing/write-panel/upload-image-button";
import {Note} from "@/components/layout/utils/note";
import {BaseButton} from "@/components/layout/base/baseButton";
import {BackButton} from "@/components/layout/utils/back-button";
import InfoPanel from "@/components/layout/utils/info-panel";
import TickButton from "@/components/layout/utils/tick-button";
import {Checkbox} from "@/components/ui/checkbox";
import {ImagePayload} from "@/components/writing/write-panel/write-post";
import {ArticlePreviewContentEditor} from "@/components/writing/article/article-preview-content-editor";

type PublishArticleModalProps = {
    open: boolean
    onClose: () => void
    onSubmit: (enDiscusion: boolean) => StateButtonClickHandler
    mdText?: string
    title?: string
    mentions?: ArCabildoabiertoFeedDefs.TopicMention[]
    article?: ArCabildoabiertoFeedDefs.FullArticleView
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


const PublishArticleModal = ({
                                 onSubmit,
                                 open,
                                 onClose,
                                 mdText,
                                 title,
                                 mentions,
                                 article
                             }: PublishArticleModalProps) => {
    const [enDiscusion, setEnDiscusion] = useState(article ? hasEnDiscusionLabel(article) : true)
    const defaultSummary = useMemo(() => getArticleSummary(mdText), [mdText])
    const [editingPreview, setEditingPreview] = useState(false)
    const [summary, setSummary] = useState<string>(defaultSummary)
    const [thumbnail, setThumbnail] = useState<ImagePayload | null>(null)

    return <BaseFullscreenPopup
        open={open}
        onClose={onClose}
        closeButton={true}
    >
        <div className={"pb-8 sm:w-[500px] min-h-[300px] px-6 flex flex-col justify-between space-y-4"}>

            <div className={"space-y-8"}>
                <h3 className={"text-center normal-case"}>
                    {!article ? "¿Listo para publicar?" : "Revisá que esté todo bien..."}
                </h3>

                <div className={"w-full flex flex-col space-y-2"} key={summary}>

                    {!editingPreview && <ArticlePreviewContent
                        title={title}
                        summary={summary}
                        thumbnail={thumbnail}
                    />}
                    {editingPreview && <ArticlePreviewContentEditor
                        title={title}
                        summary={summary}
                        thumbnail={thumbnail}
                        setThumbnail={setThumbnail}
                        setSummary={setSummary}
                    />}
                    <Note className={"text-left text-xs"}>
                        Podés elegir una imagen y editar el resumen. Van a aparecer en la previsualización de Cabildo Abierto y al compartirlo en otros sitios web.
                    </Note>
                    <div className={"flex"}>
                        <BaseButton
                            size={"small"}
                            variant="outlined"
                            onClick={() => {
                                setEditingPreview(!editingPreview)
                            }}
                            className={""}
                        >
                            {!editingPreview ? "Editar previsualización" : "Listo"}
                        </BaseButton>
                    </div>
                </div>

                <div className={"flex items-center space-x-2"}>
                    <Checkbox
                        checked={enDiscusion}
                        onCheckedChange={(c) => {
                            if (c != "indeterminate") setEnDiscusion(c)
                        }}
                    />
                    <Note className={"text-left"}>
                        ¿Agregar al muro En discusión?
                    </Note>
                    <InfoPanel
                        text={'El artículo va a aparecer en el muro "En discusión" de la pantalla principal. También podés agregarlo o removerlo del muro después.'}
                        iconFontSize={15}
                    />
                </div>

                {mentions.length > 0 && <div className={"w-full font-light text-sm flex flex-col"}>
                    <div>
                        Temas mencionados: {
                        mentions.map((m, i) =>
                            <Link
                                className={"hover:text-[var(--text-light)]"}
                                key={i}
                                href={topicUrl(m.id)}
                            >{m.title}{i < mentions.length - 1 ? ", " : ""}
                            </Link>)}.
                    </div>
                </div>}
                <div className={"flex justify-end"}>
                    <StateButton
                        handleClick={onSubmit(enDiscusion)}
                        variant={"outlined"}
                        size={"small"}
                    >
                        {article ? "Confirmar edición" : "Publicar"}
                    </StateButton>
                </div>
            </div>

        </div>
    </BaseFullscreenPopup>
}


export default PublishArticleModal