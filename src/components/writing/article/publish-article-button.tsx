import {LexicalEditor} from "lexical";
import {useRouter} from "next/navigation";
import StateButton from "../../../../modules/ui-utils/src/state-button";
import {editorStateToMarkdown} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {fetchBackend} from "@/utils/fetch";


const createArticle = async (text: string, format: string, title: string) => {
    const res = await fetchBackend({
        route: "/article",
        method: "POST",
        body: {
            text,
            format,
            title
        }
    })
    if(res.ok){
        const {error} = await res.json()
        return {error}
    } else {
        return {error: "Ocurrió un error al crear el artículo."}
    }
}


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

        router.push("/inicio?f=siguiendo")
        return {stopResubmit: true}
    }

    return <StateButton
        handleClick={handleSubmit}
        text1={"Publicar"}
        textClassName="whitespace-nowrap px-2 font-semibold"
        disabled={disabled}
        size="medium"
        variant={"text"}
        sx={{borderRadius: 20}}
    />
}