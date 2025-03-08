import {TopicVersionProps} from "../../app/lib/definitions";
import {wikiEditorSettings} from "../editor/wiki-editor";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import dynamic from "next/dynamic";
import {topicVersionPropsToReplyToContent} from "./topic-content";
const MyLexicalEditor = dynamic( () => import( '../editor/lexical-editor' ), { ssr: false } );


export const TopicContentPreview = ({
    topicId,
    topicVersion,
    onMaximize
}: {
    onMaximize: () => void
    topicId: string
    topicVersion: TopicVersionProps
}) => {

    return <div
        onClick={onMaximize}
        className={"relative w-full px-2 group min-h-[100px] max-h-[200px] overflow-y-clip bg-[var(--background)] hover:bg-[var(--background-dark)] cursor-pointer"}
    >
        <MyLexicalEditor
            settings={wikiEditorSettings(
                true,
                topicVersionPropsToReplyToContent(topicVersion, topicId),
                topicVersion.content.text,
                topicVersion.content.format,
                false,
                false
            )}
            setEditor={() => {}}
            setEditorState={() => {}}
        />
        <div
            className="w-full absolute space-x-1 group-hover:flex bottom-0 right-0 bg-opacity-80 text-[var(--text)] text-sm px-2 py-1 rounded"
        >
            <div className={"flex items-center w-full justify-end space-x-2 text-sm text-[var(--text-light)]"}>
                <div>expandir</div>
                <FullscreenIcon fontSize={"small"}/>
            </div>
        </div>
    </div>
}