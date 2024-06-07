import CommentComponent from "@/components/comment"


export default function CommentSection({comments}) {
    return <div className="border-t">
        {comments.map((content) => (
            <div className="" key={content.id}>
                <CommentComponent content={content}/>
            </div>
        ))}
    </div>
}