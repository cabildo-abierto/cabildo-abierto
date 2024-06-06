import Comment from "@/components/comment"


export default function CommentSection({comments}) {
    return <div className="border-t">
        {comments.map((comment) => (
            <div className="" key={comment.id}>
                <Comment comment={comment}/>
            </div>
        ))}
    </div>
}