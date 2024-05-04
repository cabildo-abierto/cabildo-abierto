import {getUserById} from "@/actions/get-user";


const Comment = async ({comment}) => {
    const author = await getUserById(comment.authorId)

    return <div className="bg-white border shadow-md rounded-lg mb-1">
        <p className="ml-2 mt-1">{comment.content}</p>
        <div className="flex justify-end text-gray-400 mb-1 mr-2">{author.name}</div>
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