import {TopicProps} from "@/lib/definitions";
import {wikiEditorSettings} from "../../editor/wiki-editor-settings";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import dynamic from "next/dynamic";
import {topicCurrentVersionToReplyToContent} from "./topic-content";
import {IconButton} from "@/../modules/ui-utils/src/icon-button"
import {Button} from "@/../modules/ui-utils/src/button"
import {useRouter} from "next/navigation";
import {topicUrl} from "@/utils/uri";
const MyLexicalEditor = dynamic( () => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), { ssr: false } );


export const TopicContentPreview = ({
    topic,
    onMaximize
}: {
    onMaximize: () => void
    topic: TopicProps
}) => {
    const router = useRouter()

    if(!topic.currentVersion){
        return <div className={"my-4"}>
            <Button
                size={"large"}
                onClick={() => {router.push(topicUrl(topic.id, undefined, "history"))}}
                fullWidth={true}
                color={"secondary"}
            >
                Este tema no tiene una versión aceptada. Ver el historial de ediciones.
            </Button>
        </div>
    }

    if(topic.currentVersion.content.text == null || topic.currentVersion.content.text.length == 0){
        return <div className={"my-4"}>
            <Button
            size={"large"}
            onClick={() => {router.push(topicUrl(topic.id, undefined, "editing"))}}
            fullWidth={true}
            color={"secondary"}
        >
            No hay nada escrito sobre este tema. Escribí una primera versión.
            </Button>
        </div>
    }

    return <div className={"rounded-lg border mb-2 px-2 pt-1 pb-4 w-full h-full"}>
        <div className={"flex justify-end items-center pb-1"}>
            <IconButton
                onClick={onMaximize}
                size={"small"}
            >
                <FullscreenIcon fontSize={"small"}/>
            </IconButton>
        </div>
        <div
            className={"w-full px-2 group max-h-[400px] overflow-y-scroll custom-scrollbar bg-[var(--background)]"}
        >
            <MyLexicalEditor
                settings={wikiEditorSettings(
                    true,
                    topicCurrentVersionToReplyToContent(topic),
                    topic.currentVersion.content.text,
                    topic.currentVersion.content.format,
                    false,
                    false
                )}
                setEditor={() => {}}
                setEditorState={() => {}}
            />
        </div>
    </div>
}