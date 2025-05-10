import FullscreenIcon from "@mui/icons-material/Fullscreen";
import dynamic from "next/dynamic";
import {IconButton} from "@/../modules/ui-utils/src/icon-button"
import {Button} from "@/../modules/ui-utils/src/button"
import {useRouter} from "next/navigation";
import {topicUrl} from "@/utils/uri";
import {getEditorSettings} from "@/components/editor/settings";
import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";

const MyLexicalEditor = dynamic(() => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), {ssr: false});


export const TopicContentPreview = ({
                                        topic,
                                        onMaximize
                                    }: {
    onMaximize: () => void
    topic: TopicView
}) => {
    const router = useRouter()

    if (topic.text == null || topic.text.trim().length == 0) {
        return <div className={"my-4"}>
            <Button
                size={"large"}
                onClick={() => {
                    router.push(topicUrl(topic.id, undefined, "editing"))
                }}
                fullWidth={true}
                color={"background-dark"}
            >
                No hay nada escrito sobre este tema. Escribí una primera versión.
            </Button>
        </div>
    }

    return <div className={"rounded-lg bg-[var(--background-dark)] mb-2 px-2 pt-1 pb-4 w-full h-full"}>
        <div className={"flex justify-end items-center pb-1"}>
            <IconButton
                onClick={onMaximize}
                size={"small"}
                color={"background-dark"}
            >
                <FullscreenIcon fontSize={"small"}/>
            </IconButton>
        </div>
        <div
            className={"w-full px-2 group max-h-[400px] overflow-y-scroll custom-scrollbar"}
        >
            <MyLexicalEditor
                settings={getEditorSettings({
                    initialText: topic.text,
                    initialTextFormat: topic.format,
                    editorClassName: "article-content not-article-content"
                })}
                setEditor={() => {
                }}
                setEditorState={() => {
                }}
            />
        </div>
    </div>
}