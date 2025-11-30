import {StateButton, StateButtonClickHandler} from "@/components/utils/base/state-button";
import {useEffect, useMemo, useState} from "react";
import {BaseFullscreenPopup} from "../../utils/dialogs/base-fullscreen-popup";
import {ArticlePreviewContent} from "../../feed/article/article-preview";
import Link from "next/link";
import {topicUrl} from "@/components/utils/react/url";
import removeMarkdown from "remove-markdown";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {hasEnDiscusionLabel} from "../../feed/utils/post-preview-frame";
import {cn} from "@/lib/utils";
import {Checkbox} from "@/components/utils/ui/checkbox";
import {Note} from "@/components/utils/base/note";
import {ImagePayload} from "@cabildo-abierto/api";
import {BaseTextArea} from "@/components/utils/base/base-text-area";
import {UploadImageButton} from "@/components/writing/write-panel/upload-image-button";
import {Label} from "@/components/utils/ui/label";
import {Paragraph} from "@/components/utils/base/paragraph";

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
                                 setPreviewImage
                             }: PublishArticleModalProps) => {
    const [enDiscusion, setEnDiscusion] = useState(article ? hasEnDiscusionLabel(article) : true)
    const summary = useMemo(() => getArticleSummary(mdText), [mdText])

    useEffect(() => {
        if (description == null || description.length == 0) setDescription(summary)
    }, []);

    function onSubmitImage(i: ImagePayload) {
        setPreviewImage(i)
    }

    return <BaseFullscreenPopup
        open={open}
        onClose={onClose}
        closeButton={true}
        className={"max-h-screen overflow-y-auto"}
    >
        <div className={"pb-8 sm:w-[500px] min-h-[300px] px-6 flex flex-col justify-between space-y-6"}
        >
            <h3 className={"text-center normal-case"}>
                {!article ? "¿Listo para publicar?" : "Revisá que esté todo bien..."}
            </h3>
            <div className={"space-y-4"}>
                <h4 className={"font-semibold text-base"}>
                    Previsualización
                </h4>

                <Paragraph className={"text-xs"}>
                    La previsualización es cómo va a aparecer en el muro y al compartir en otras plataformas. Si querés,
                    podés elegir una imagen y una descripción personalizadas.
                </Paragraph>

                <div className={"w-full flex flex-col space-y-[6px]"}>
                    <Label className={"px-[2px]"}>
                        Previsualización
                    </Label>
                    <ArticlePreviewContent
                        title={title}
                        summary={description && description.length > 0 ? description : summary}
                        image={previewImage?.src}
                    />
                </div>

                <div className={"space-y-[6px] flex flex-col items-start"}>
                    <Label className={"px-[2px]"}>
                        Elegí una imagen
                    </Label>
                    <UploadImageButton
                        text={previewImage == null ? "Subir imagen" : "Reemplazar imagen"}
                        onSubmit={onSubmitImage}
                        size={"small"}
                    />
                </div>

                <div>
                    <BaseTextArea
                        rows={2}
                        value={description}
                        label={"Elegí una descripción"}
                        placeholder={"Descripción..."}
                        onChange={(e => {
                            setDescription(e.target.value)
                        })}
                    />
                </div>
            </div>

            <div className={"space-y-4"}>
                <h4 className={"font-semibold text-base"}>
                    Muros
                </h4>
                <div className={"flex items-center space-x-2"}>
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
                <div>
                    {mentions.length == 1 && <Paragraph className={"text-sm"}>
                        También va a aparecer en el tema {mentions[0].title}.
                    </Paragraph>}

                    {mentions.length > 1 && <Paragraph className={"text-sm"}>
                        También va a aparecer en los temas: <TopicMentionsList mentions={mentions}/>
                    </Paragraph>}
                </div>
            </div>

            <div className={"flex justify-end space-x-2 w-full items-end"}>
                <StateButton
                    handleClick={onSubmit(enDiscusion)}
                    variant={"outlined"}
                    size={"small"}
                >
                    {article ? "Confirmar edición" : "Publicar"}
                </StateButton>
            </div>
        </div>
    </BaseFullscreenPopup>
}


export default PublishArticleModal