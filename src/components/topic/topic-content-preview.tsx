import {TopicVersionProps} from "../../app/lib/definitions";
import {wikiEditorSettings} from "../editor/wiki-editor";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import dynamic from "next/dynamic";
import {topicVersionPropsToReplyToContent} from "./topic-content";
import {IconButton} from "@mui/material";
import Link from "next/link";
import {topicUrl} from "../utils/utils";
import {CustomLink} from "../ui-utils/custom-link";
import {BasicButton} from "../ui-utils/basic-button";
import {useRouter} from "next/navigation";
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
    const router = useRouter()

    if(!topicVersion.content.text){
        return <div className={"my-4"}>
            <BasicButton
            size={"large"}
            onClick={() => {router.push(topicUrl(topicId, undefined, "editing"))}}
            fullWidth={true}
        >
            No hay nada escrito sobre este tema. Escribí una primera versión.
            </BasicButton>
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
                    topicVersionPropsToReplyToContent(topicVersion, topicId),
                    topicVersion.content.text,
                    topicVersion.content.format,
                    false,
                    false
                )}
                setEditor={() => {}}
                setEditorState={() => {}}
            />
        </div>
    </div>
}