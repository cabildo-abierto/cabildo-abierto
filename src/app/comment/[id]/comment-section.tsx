import {getUserById} from "@/actions/get-user";
import Link from "next/link";
import Comment from "@/components/comment"


export default function CommentSection({comments}) {
    return <div className="border-t">
        {comments.map((comment) => (
            <div className="mt-2">
                <Comment comment={comment}/>
            </div>
        ))}
    </div>
}