import dynamic from "next/dynamic"
import {TopicProps} from "../../app/lib/definitions";
import {wikiEditorSettings} from "../editor/wiki-editor";
import {ShowContributors} from "./show-contributors";
import {useTopicVersionAuthors} from "../../hooks/contents";
import LoadingSpinner from "../ui-utils/loading-spinner";
import {ErrorPage} from "../ui-utils/error-page";
import {SmallTopicVersionProps} from "./topic-content-expanded-view";
import {getDidFromUri, getRkeyFromUri} from "../utils/uri";

const MyLexicalEditor = dynamic( () => import( '../editor/lexical-editor' ), { ssr: false } );


export const ShowTopicAuthors = ({
    topic,
    topicVersion
}: {
    topic: TopicProps
    topicVersion: SmallTopicVersionProps
}) => {
    const {topicVersionAuthors, isLoading} = useTopicVersionAuthors(getDidFromUri(topicVersion.uri), getRkeyFromUri(topicVersion.uri));

    if(isLoading){
        return <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>
    }

    if(!topicVersionAuthors){
        return <div className={"mt-8"}>
            <ErrorPage>
                Ocurrió un error al cargar el contenido.
            </ErrorPage>
        </div>
    }

    let settings = wikiEditorSettings(true, null, topicVersionAuthors.text, "lexical", true, false)

    return <>
        <div className="text-sm text-center block lg:hidden content-container p-1">
            <p>Para ver qué usuario es autor de cada parte de este tema entrá a la página desde una pantalla más grande (por ejemplo una computadora).</p>
        </div>
        <div className="flex justify-center py-4">
            <div className="content-container bg-[var(--secondary-light)] rounded px-2 pb-2 text-sm sm:text-base flex flex-col items-center justify-center">
                <div className="text-[var(--text-light)]">Autores</div>
                <ShowContributors topicId={topic.id}/>
            </div>
        </div>
        <div className="hidden lg:block">
            <MyLexicalEditor
                settings={settings}
                setEditor={() => {}}
                setEditorState={() => {}}
            />
        </div>
    </>
}