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
import {TopicMention} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {cn} from "@/lib/utils";

type PublishArticleModalProps = {
    open: boolean
    onClose: () => void
    onSubmit: (enDiscusion: boolean) => StateButtonClickHandler
    mdText?: string
    title?: string
    mentions?: ArCabildoabiertoFeedDefs.TopicMention[]
    article?: ArCabildoabiertoFeedDefs.FullArticleView
}


export function getArticleSummary(md: string){
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
    mentions: TopicMention[]
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
    article
}: PublishArticleModalProps) => {
    const [enDiscusion, setEnDiscusion] = useState(article ? hasEnDiscusionLabel(article) : true)
    const summary = useMemo(() => getArticleSummary(mdText), [mdText])


    return <BaseFullscreenPopup
        open={open}
        onClose={onClose}
        closeButton={true}
    >
        <div className={"pb-8 sm:w-[500px] min-h-[300px] px-6 flex flex-col justify-between space-y-8"}>
            <h3 className={"text-center normal-case"}>
                {!article ? "¿Listo para publicar?" : "Revisá que esté todo bien..."}
            </h3>

            <div className={"space-y-2"}>
                <div className={"w-full flex flex-col space-y-1"}>
                    <div className={"text-sm text-[var(--text-light)] px-1 font-light"}>
                        La previsualización en el muro se va a ver así:
                    </div>
                    <ArticlePreviewContent
                        title={title}
                        summary={summary}
                    />
                </div>

                {mentions.length > 1 && <div className={"w-full flex flex-col"}>
                    <div className={"text-sm text-[var(--text-light)] px-1"}>
                        También va a aparecer en los temas: <TopicMentionsList mentions={mentions}/>
                    </div>
                </div>}
            </div>
            {mentions.length == 1 && <div className={"w-full flex flex-col"}>
                <div className={"text-sm text-[var(--text-light)] px-1"}>
                    También va a aparecer en el tema {mentions[0].title}.
                </div>
            </div>}

            <div className={"flex justify-between space-x-2 w-full items-end"}>
                <AddToEnDiscusionButton
                    enDiscusion={enDiscusion}
                    setEnDiscusion={setEnDiscusion}
                    size={"default"}
                />
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