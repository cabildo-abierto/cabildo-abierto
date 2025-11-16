import {localeDate} from "@/components/utils/base/date";
import {ReadingTime} from "../../feed/article/reading-time";
import {useSession} from "@/components/auth/use-session";
import {EditorState} from "lexical";
import {getUsername} from "../../perfil/utils";
import { getAllText } from "@cabildo-abierto/editor-core";

const ArticleEditorAuthor = ({
                                 editorState
                             }: {
    editorState: EditorState
}) => {
    const {user} = useSession()
    const createdAt = new Date()
    return <div className="gap-x-4 flex flex-wrap items-baseline sm:text-base text-sm">
        {user && <div className={"text-[var(--text-light)] font-light truncate"}>
            <span>
                Artículo de
            </span> <span className={"font-normal"}>
                {getUsername(user)}
            </span>
        </div>}
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