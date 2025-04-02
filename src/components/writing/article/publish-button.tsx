import {LexicalEditor} from "lexical";
import {useRouter} from "next/navigation";
import {useUser} from "@/hooks/swr";
import {compress} from "@/utils/compression";
import {createArticle} from "@/server-actions/write/article";
import StateButton from "../../../../modules/ui-utils/src/state-button";

export const PublishButton = ({editor, title, disabled}: {
    editor: LexicalEditor
    disabled: boolean
    title?: string
}) => {
    const router = useRouter()
    const {user} = useUser()

    async function handleSubmit(){
        const text = JSON.stringify(editor.getEditorState().toJSON())
        const compressedText = compress(text)

        const {error} = await createArticle(compressedText, user.did, title)
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