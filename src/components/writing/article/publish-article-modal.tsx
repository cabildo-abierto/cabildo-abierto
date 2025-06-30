import StateButton, {StateButtonClickHandler} from "../../../../modules/ui-utils/src/state-button";
import {TopicMention} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {useMemo, useState} from "react";
import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {ArticlePreviewContent} from "@/components/feed/article/article-preview";
import Link from "next/link";
import {topicUrl} from "@/utils/uri";
import {getArticleSummary} from "@/components/writing/article/publish-article-button";
import AddToEnDiscusionButton from "@/components/writing/add-to-en-discusion-button";

type PublishArticleModalProps = {
    open: boolean
    onClose: () => void
    onSubmit: (enDiscusion: boolean) => StateButtonClickHandler
    mdText?: string
    title?: string
    mentions?: TopicMention[]
}


const PublishArticleModal = ({onSubmit, open, onClose, mdText, title, mentions}: PublishArticleModalProps) => {
    const [enDiscusion, setEnDiscusion] = useState(false)

    const summary = useMemo(() => getArticleSummary(mdText), [mdText])

    return <BaseFullscreenPopup open={open} onClose={onClose} closeButton={true}>
        <div className={"pb-8 sm:w-[500px] min-h-[300px] px-6 flex flex-col justify-between space-y-8"}>
            <h3 className={"text-center"}>
                ¿Listo para publicar?
            </h3>

            <div className={"space-y-2"}>
                <div className={"w-full flex flex-col space-y-1"}>
                    <div className={"text-sm text-[var(--text-light)] px-1"}>
                        La previsualización en el muro se va a ver así:
                    </div>
                    <ArticlePreviewContent
                        color="background-dark2"
                        clickable={false}
                        title={title}
                        summary={summary}
                        mentions={mentions}
                    />
                </div>

                {mentions.length > 1 && <div className={"w-full flex flex-col"}>
                    <div className={"text-sm text-[var(--text-light)] px-1"}>
                        También va a aparecer en los temas: {
                        mentions.map((m, i) =>
                            <Link
                                className={"hover:text-[var(--text)]"}
                                key={i}
                                href={topicUrl(m.id)}
                            >{m.title}{i < mentions.length - 1 ? ", " : ""}
                            </Link>)}.
                    </div>
                </div>}
            </div>
            {mentions.length == 1 && <div className={"w-full flex flex-col"}>
                <div className={"text-sm text-[var(--text-light)] px-1"}>
                    También va a aparecer en el tema {mentions[0].title}.
                </div>
            </div>}

            <div className={"flex justify-between w-full"}>
                <AddToEnDiscusionButton enDiscusion={enDiscusion} setEnDiscusion={setEnDiscusion}/>
                <StateButton
                    text1={"Publicar"}
                    handleClick={onSubmit(enDiscusion)}
                    textClassName={"font-semibold text-sm"}
                />
            </div>
        </div>
    </BaseFullscreenPopup>
}


export default PublishArticleModal