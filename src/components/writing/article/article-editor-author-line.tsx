import {localeDate} from "../../layout/utils/date";
import {ReadingTime} from "@/components/thread/article/reading-time";
import {getAllText} from "@/components/topics/topic/history/get-all-text";
import {getUsername} from "@/utils/utils";
import {useSession} from "@/queries/getters/useSession";
import {EditorState} from "lexical";

const ArticleEditorAuthor = ({
                                            editorState
                                        }: {
    editorState: EditorState
}) => {
    const {user} = useSession()
    const createdAt = new Date()
    return <div className="gap-x-4 flex flex-wrap items-baseline sm:text-base text-sm">
        <div className={"text-[var(--text-light)] font-light truncate"}>
                    <span>
                        Artículo de
                    </span> <span className={"font-normal"}>
                        {getUsername(user)}
                    </span>
        </div>
        <div className={"max-[500px]:text-sm text-[var(--text-light)]"}>
            {localeDate(createdAt, true)}
        </div>
        <div className={"text-[var(--text-light)]"}>
            {editorState && <ReadingTime
                numWords={getAllText(editorState.toJSON().root).split(" ").length}
            />}
        </div>
    </div>
}


export default ArticleEditorAuthor