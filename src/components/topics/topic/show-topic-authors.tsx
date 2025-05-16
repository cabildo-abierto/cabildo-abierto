import dynamic from "next/dynamic"
import {ShowContributors} from "./show-contributors";
import {useTopicVersionAuthors} from "@/queries/api";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {ErrorPage} from "../../../../modules/ui-utils/src/error-page";
import {getDidFromUri, getRkeyFromUri} from "@/utils/uri";
import {getEditorSettings} from "@/components/editor/settings";
import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";

const MyLexicalEditor = dynamic(() => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), {ssr: false});


export const ShowTopicAuthors = ({
                                     topic
                                 }: {
    topic: TopicView
}) => {
    const {
        data: topicVersionAuthors,
        isLoading
    } = useTopicVersionAuthors(getDidFromUri(topic.uri), getRkeyFromUri(topic.uri));

    if (isLoading) {
        return <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>
    }

    if (!topicVersionAuthors) {
        return <div className={"mt-8"}>
            <ErrorPage>
                Ocurrió un error al cargar el contenido.
            </ErrorPage>
        </div>
    }

    let settings = getEditorSettings({
        initialText: topicVersionAuthors.text,
        initialTextFormat: topicVersionAuthors.format,
        tableOfContents: true
    })

    return <>
        <div className="text-sm text-center block lg:hidden content-container p-1">
            <p>Para ver qué usuario es autor de cada parte de este tema entrá a la página desde una pantalla más grande
                (por ejemplo una computadora).
            </p>
        </div>
        <div className="flex justify-center py-4">
            <div
                className="content-container bg-[var(--secondary-light)] rounded px-2 pb-2 text-sm sm:text-base flex flex-col items-center justify-center">
                <div className="text-[var(--text-light)]">Autores</div>
                <ShowContributors topicId={topic.id}/>
            </div>
        </div>
        <div className="hidden lg:block">
            <MyLexicalEditor
                settings={settings}
                setEditor={() => {
                }}
                setEditorState={() => {
                }}
            />
        </div>
    </>
}