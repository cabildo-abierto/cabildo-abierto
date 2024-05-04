import {getUserById} from "@/actions/get-user";
import Link from "next/link";


const Comment = async ({comment}) => {
    const author = await getUserById(comment.authorId)

    return <div className="bg-white border mb-1">
        <p className="ml-2 mt-1 text-gray-600 text-sm">{comment.content}</p>
        <div className="flex justify-end text-sm text-gray-400 mb-1 mr-2">
            <Link href={"/profile/"+comment.authorId}>{author.name}</Link>
        </div>
    </div>
}


export default function CommentSection({comments}) {
    return <div>
        {comments.map((comment) => (
            <div className="mt-2">
                <Comment comment={comment}/>
            </div>
        ))}
    </div>
}