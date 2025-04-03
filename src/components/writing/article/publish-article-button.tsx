import {LexicalEditor} from "lexical";
import {useRouter} from "next/navigation";
import {createArticle} from "@/server-actions/write/article";
import StateButton from "../../../../modules/ui-utils/src/state-button";
import {editorStateToMarkdown} from "@/server-actions/editor/markdown-transforms";

export const PublishArticleButton = ({editor, title, disabled}: {
    editor: LexicalEditor
    disabled: boolean
    title?: string
}) => {
    const router = useRouter()

    async function handleSubmit(){
        const editorStateStr = JSON.stringify(editor.getEditorState().toJSON())
        const text = editorStateToMarkdown(editorStateStr)

        const {error} = await createArticle(text, "markdown", title)
        if(error) return {error}

        router.push("/")
        return {stopResubmit: true}
    }

    return <StateButton
        handleClick={handleSubmit}
        text1={"Publicar"}
        textClassName="whitespace-nowrap px-2 font-semibold"
        disabled={disabled}
        size="medium"
        variant={"text"}
    />
}