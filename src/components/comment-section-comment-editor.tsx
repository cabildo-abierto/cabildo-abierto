import { useSWRConfig } from "swr"
import { createComment } from "../actions/contents"
import { useUser } from "../app/hooks/user"
import { CommentProps } from "../app/lib/definitions"
import { compress } from "./compression"
import CommentEditor from "./editor/comment-editor"


type CommentSectionCommentEditorProps = {
    content: {id: string, type: string, parentEntityId: string, rootContent?: {type: string}}
    comments: CommentProps[]
    setComments: (c: CommentProps[]) => void
    setViewComments: (v: boolean) => void
    setWritingReply: (v: boolean) => void
    startsOpen: boolean,
    depth: number,
}


export const CommentSectionCommentEditor = ({content, comments, setComments, setViewComments, setWritingReply, startsOpen, depth}: CommentSectionCommentEditorProps) => {
    const {user} = useUser()
    const {mutate} = useSWRConfig()

    const handleNewComment = async (text: string) => {
        const compressedText = compress(text)
        const {error, ...newComment} = await createComment(compressedText, user.id, content.id, content.parentEntityId)
        
        if(error) return {error}

        setComments([newComment as CommentProps, ...comments])

        setViewComments(true)

        if(["Post", "FastPost"].includes(content.type) || (content.rootContent && ["Post", "FastPost"].includes(content.rootContent.type))){
            await mutate("/api/feed/")
        }

        return {}
    }

    const handleCancelComment = () => {
        setWritingReply(false)
    }

    return <div className={"mb-1 " + (depth % 2 == 1 ? "bg-[var(--content2)]" : "bg-[var(--content)]")}>
        {startsOpen ? <CommentEditor
                onSubmit={handleNewComment}
            /> : 
            <CommentEditor
                onSubmit={handleNewComment}
                onCancel={handleCancelComment}
            />
        }
    </div>
}